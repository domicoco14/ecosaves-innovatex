-- Final hardening pass for circle lifecycle, readable invites, and savings
-- entry validation. Safe to apply after migrations 20260928 through 20261002.

create unique index if not exists circles_invite_slug_unique
    on public.circles (invite_slug);

create unique index if not exists circle_members_circle_user_unique
    on public.circle_members (circle_id, user_id);

create unique index if not exists circle_members_circle_position_unique
    on public.circle_members (circle_id, payout_position)
    where payout_position is not null;

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
    slug_base text;
begin
    slug_base := coalesce(
        nullif(trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g')), ''),
        'circle'
    );

    insert into public.circles (
        id, name, contribution_amount, frequency, member_limit,
        start_date, status, created_by, created_at, invite_code, invite_slug
    ) values (
        gen_random_uuid(), trim(p_name), p_contribution_amount, p_frequency, p_member_limit,
        p_start_date, 'forming', p_created_by, now(),
        lower(replace(gen_random_uuid()::text, '-', '')),
        left(slug_base, 80) || '-' || replace(gen_random_uuid()::text, '-', '')
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
    where (
        lower(invite_code) = lower(trim(p_invite_code))
        or lower(invite_slug) = lower(trim(p_invite_code))
    )
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
    if p_amount is null or p_amount <= 0 then
        raise exception 'invalid_amount';
    end if;

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
    if target_goal.start_date > current_date then
        raise exception 'goal_not_started';
    end if;
    if target_goal.status <> 'active' or target_goal.maturity_date <= current_date then
        raise exception 'goal_matured';
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
