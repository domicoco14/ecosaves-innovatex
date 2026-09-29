create table if not exists public.personal_savings_goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id),
    name text not null check (char_length(trim(name)) between 2 and 80),
    target_amount numeric(14, 2) not null check (target_amount > 0),
    contribution_amount numeric(14, 2) not null check (contribution_amount > 0),
    frequency text not null check (frequency in ('weekly', 'bi-weekly', 'monthly')),
    start_date date not null,
    maturity_date date not null check (maturity_date > start_date),
    status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
    saved_amount numeric(14, 2) not null default 0 check (saved_amount >= 0),
    created_at timestamptz not null default now()
);

create index if not exists personal_savings_goals_user_created_idx
    on public.personal_savings_goals (user_id, created_at desc);

create table if not exists public.personal_savings_entries (
    id uuid primary key default gen_random_uuid(),
    goal_id uuid not null references public.personal_savings_goals(id),
    user_id uuid not null references public.users(id),
    amount numeric(14, 2) not null check (amount > 0),
    status text not null default 'user_reported' check (status in ('user_reported')),
    source text not null default 'manual' check (source in ('manual')),
    idempotency_key text not null,
    note text check (note is null or char_length(note) <= 200),
    created_at timestamptz not null default now(),
    constraint personal_savings_entries_user_key_unique unique (user_id, idempotency_key)
);

create index if not exists personal_savings_entries_goal_created_idx
    on public.personal_savings_entries (goal_id, created_at desc);

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
        status = case
            when saved_amount + p_amount >= target_amount then 'completed'
            else status
        end
    where id = p_goal_id;

    return to_jsonb(created_entry);
end;
$$;

revoke all on function public.record_personal_savings_entry(uuid, uuid, numeric, text, text) from public, anon, authenticated;
grant execute on function public.record_personal_savings_entry(uuid, uuid, numeric, text, text) to service_role;