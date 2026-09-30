-- Upgrade existing deployments that may already have applied the first two
-- EcoSaves SQL files before invite-code and ledger hardening was completed.

alter table public.circles
    add column if not exists activated_at timestamptz;

alter table public.circles
    alter column invite_code set default lower(replace(gen_random_uuid()::text, '-', ''));

update public.circles
set invite_code = lower(replace(gen_random_uuid()::text, '-', ''))
where invite_code is null or length(invite_code) <> 32;

alter table public.circles
    alter column invite_code set not null;

do $$
begin
    if exists (
        select 1 from public.circle_members
        group by circle_id, user_id
        having count(*) > 1
    ) then
        raise exception 'Resolve duplicate circle_members rows before applying this migration';
    end if;
end;
$$;

create unique index if not exists circles_invite_code_unique
    on public.circles (invite_code);

update public.circle_members
set payout_position = null
where payout_position is not null;

with ranked_members as (
    select id,
           row_number() over (partition by circle_id order by joined_at, id)::integer as assigned_position
    from public.circle_members
)
update public.circle_members as members
set payout_position = ranked_members.assigned_position
from ranked_members
where members.id = ranked_members.id
    and members.payout_position is distinct from ranked_members.assigned_position;

update public.circles as circles
set status = 'active',
    activated_at = coalesce(circles.activated_at, circles.created_at, now())
where (
    select count(*) from public.circle_members as members
    where members.circle_id = circles.id
) >= circles.member_limit;

create unique index if not exists circle_members_circle_user_unique
    on public.circle_members (circle_id, user_id);

create unique index if not exists circle_members_circle_position_unique
    on public.circle_members (circle_id, payout_position)
    where payout_position is not null;

alter table public.circles enable row level security;
alter table public.circle_members enable row level security;

drop policy if exists circle_members_select_self on public.circle_members;
create policy circle_members_select_self on public.circle_members
    for select to authenticated using (auth.uid() = user_id);

create or replace function public.create_circle_with_creator(
    p_name text,
    p_contribution_amount numeric,
    p_frequency text,
    p_member_limit integer,
    p_start_date date,
    p_created_by uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    created_circle public.circles%rowtype;
begin
    insert into public.circles (
        id, name, contribution_amount, frequency, member_limit,
        start_date, status, created_by, created_at
    ) values (
        gen_random_uuid(), trim(p_name), p_contribution_amount, p_frequency, p_member_limit,
        p_start_date, 'forming', p_created_by, now()
    )
    returning * into created_circle;

    insert into public.circle_members (id, circle_id, user_id, payout_position, joined_at)
    values (gen_random_uuid(), created_circle.id, p_created_by, 1, now());

    return to_jsonb(created_circle);
end;
$$;

create or replace function public.join_circle_atomic(
    p_invite_code text,
    p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    target_circle public.circles%rowtype;
    current_count integer;
begin
    select * into target_circle
    from public.circles
    where invite_code = lower(trim(p_invite_code))
          and status = 'forming'
    for update;

    if not found then
        raise exception 'circle_not_found';
    end if;

    if exists (
        select 1 from public.circle_members
        where circle_id = target_circle.id and user_id = p_user_id
    ) then
        raise exception 'already_joined';
    end if;

    select count(*) into current_count
    from public.circle_members
    where circle_id = target_circle.id;

    if current_count >= target_circle.member_limit then
        raise exception 'circle_full';
    end if;

    insert into public.circle_members (id, circle_id, user_id, payout_position, joined_at)
    values (gen_random_uuid(), target_circle.id, p_user_id, current_count + 1, now());

    if current_count + 1 = target_circle.member_limit then
        update public.circles
        set status = 'active', activated_at = now()
        where id = target_circle.id
        returning * into target_circle;
    end if;

    return to_jsonb(target_circle);
end;
$$;

revoke all on function public.create_circle_with_creator(text, numeric, text, integer, date, uuid) from public, anon, authenticated;
revoke all on function public.join_circle_atomic(text, uuid) from public, anon, authenticated;
grant execute on function public.create_circle_with_creator(text, numeric, text, integer, date, uuid) to service_role;
grant execute on function public.join_circle_atomic(text, uuid) to service_role;

-- Keep the savings status check compatible with goal completion.
alter table public.personal_savings_goals
    drop constraint if exists personal_savings_goals_status_check;
alter table public.personal_savings_goals
    add constraint personal_savings_goals_status_check
    check (status in ('active', 'completed', 'cancelled'));

alter table public.personal_savings_goals enable row level security;
alter table public.personal_savings_entries enable row level security;

drop policy if exists personal_savings_goals_select_owner on public.personal_savings_goals;
create policy personal_savings_goals_select_owner on public.personal_savings_goals
    for select to authenticated using (auth.uid() = user_id);

drop policy if exists personal_savings_entries_select_owner on public.personal_savings_entries;
create policy personal_savings_entries_select_owner on public.personal_savings_entries
    for select to authenticated using (auth.uid() = user_id);

create or replace function public.record_personal_savings_entry(
    p_goal_id uuid,
    p_user_id uuid,
    p_amount numeric,
    p_idempotency_key text,
    p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    target_goal public.personal_savings_goals%rowtype;
    created_entry public.personal_savings_entries%rowtype;
    prior_entry public.personal_savings_entries%rowtype;
begin
    select * into prior_entry
    from public.personal_savings_entries
    where user_id = p_user_id and idempotency_key = p_idempotency_key;

    if found then
        if prior_entry.goal_id <> p_goal_id then
            raise exception 'duplicate_entry';
        end if;
        return to_jsonb(prior_entry);
    end if;

    select * into target_goal
    from public.personal_savings_goals
    where id = p_goal_id and user_id = p_user_id
    for update;

    if not found then
        raise exception 'goal_not_found';
    end if;
    if p_amount is null or p_amount <= 0 then
        raise exception 'invalid_amount';
    end if;
    if target_goal.start_date > current_date then
        raise exception 'goal_not_started';
    end if;
    if target_goal.status <> 'active' or target_goal.maturity_date <= current_date then
        raise exception 'goal_matured';
    end if;
    if p_amount <= 0 or p_amount is null then
        raise exception 'invalid_amount';
    end if;
    if target_goal.saved_amount + p_amount > target_goal.target_amount then
        raise exception 'goal_target_exceeded';
    end if;

    insert into public.personal_savings_entries (
        id, goal_id, user_id, amount, idempotency_key, note, created_at
    ) values (
        gen_random_uuid(), p_goal_id, p_user_id, p_amount, p_idempotency_key, p_note, now()
    )
    on conflict (user_id, idempotency_key) do nothing
    returning * into created_entry;

    if not found then
        select * into prior_entry
        from public.personal_savings_entries
        where user_id = p_user_id and idempotency_key = p_idempotency_key;
        if prior_entry.goal_id <> p_goal_id then
            raise exception 'duplicate_entry';
        end if;
        return to_jsonb(prior_entry);
    end if;

    update public.personal_savings_goals
    set saved_amount = saved_amount + p_amount,
        status = case when saved_amount + p_amount >= target_amount then 'completed' else status end
    where id = p_goal_id;

    return to_jsonb(created_entry);
end;
$$;

revoke all on function public.record_personal_savings_entry(uuid, uuid, numeric, text, text) from public, anon, authenticated;
grant execute on function public.record_personal_savings_entry(uuid, uuid, numeric, text, text) to service_role;
