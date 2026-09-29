-- Add readable, non-guessable invite URLs while retaining the legacy random
-- invite_code for existing clients during the transition.

alter table public.circles
    add column if not exists invite_slug text;

with candidates as (
    select id,
           coalesce(nullif(trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')), ''), 'circle')
             || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16) as slug
    from public.circles
    where invite_slug is null
)
update public.circles as circles
set invite_slug = candidates.slug
from candidates
where circles.id = candidates.id;

alter table public.circles
    alter column invite_slug set not null;

create unique index if not exists circles_invite_slug_unique
    on public.circles (invite_slug);

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
        left(slug_base, 80) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16)
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
    where lower(invite_code) = lower(trim(p_invite_code))
       or lower(invite_slug) = lower(trim(p_invite_code))
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
