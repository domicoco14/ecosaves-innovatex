alter table public.users
    add column if not exists pin_hash text;

create or replace function public.migrate_legacy_password_to_pin()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    update public.users
    set pin_hash = password_hash
    where pin_hash is null
      and password_hash is not null;
end;
$$;

select public.migrate_legacy_password_to_pin();

revoke all on function public.migrate_legacy_password_to_pin() from public, anon, authenticated;
grant execute on function public.migrate_legacy_password_to_pin() to service_role;
