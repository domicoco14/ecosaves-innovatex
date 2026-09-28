-- Apply this migration to the existing Supabase project before deploying the
-- circle API. Existing duplicate circle_members rows must be resolved first.

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
begin
    insert into public.circles (
        name, contribution_amount, frequency, member_limit,
        start_date, status, created_by
    ) values (
        p_name, p_contribution_amount, p_frequency, p_member_limit,
        p_start_date, 'forming', p_created_by
    )
    returning * into created_circle;

    insert into public.circle_members (circle_id, user_id, payout_position)
    values (created_circle.id, p_created_by, 1);

    return to_jsonb(created_circle);
end;
$$;

create or replace function public.join_circle_atomic(
    p_circle_id uuid,
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
    where id = p_circle_id
    for update;

    if not found then
        raise exception 'circle_not_found';
    end if;

    if exists (
        select 1 from public.circle_members
        where circle_id = p_circle_id and user_id = p_user_id
    ) then
        raise exception 'already_joined';
    end if;

    select count(*) into current_count
    from public.circle_members
    where circle_id = p_circle_id;

    if current_count >= target_circle.member_limit then
        raise exception 'circle_full';
    end if;

    insert into public.circle_members (circle_id, user_id, payout_position)
    values (p_circle_id, p_user_id, current_count + 1);

    if current_count + 1 = target_circle.member_limit then
        update public.circles
        set status = 'active'
        where id = p_circle_id
        returning * into target_circle;
    end if;

    return to_jsonb(target_circle);
end;
$$;

revoke all on function public.create_circle_with_creator(text, numeric, text, integer, date, uuid) from public, anon, authenticated;
revoke all on function public.join_circle_atomic(uuid, uuid) from public, anon, authenticated;
grant execute on function public.create_circle_with_creator(text, numeric, text, integer, date, uuid) to service_role;
grant execute on function public.join_circle_atomic(uuid, uuid) to service_role;