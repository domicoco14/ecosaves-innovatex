create table if not exists public.circle_messages (
    id uuid primary key,
    circle_id uuid not null references public.circles(id) on delete cascade,
    user_id uuid not null references public.users(id),
    content text not null check (char_length(trim(content)) between 1 and 2000),
    created_at timestamptz not null default now()
);

create index if not exists circle_messages_circle_created_idx
    on public.circle_messages (circle_id, created_at desc, id desc);

alter table public.circle_messages enable row level security;

drop policy if exists circle_messages_select_members on public.circle_messages;
create policy circle_messages_select_members on public.circle_messages
    for select to authenticated
    using (
        exists (
            select 1 from public.circle_members as members
            where members.circle_id = circle_messages.circle_id
              and members.user_id = auth.uid()
        )
    );

-- Writes and reads go through FastAPI using the service-role key. The backend
-- verifies the EcoSaves JWT and circle membership on every request.
revoke all on public.circle_messages from anon, authenticated;