-- Notificaciones por usuario. Tabla preparada de antemano; la interfaz no
-- se implementa todavía (ver TODO.md).
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Cada usuario ve únicamente sus propias notificaciones"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Cada usuario marca únicamente sus propias notificaciones"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Cada usuario elimina únicamente sus propias notificaciones"
  on public.notifications for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
