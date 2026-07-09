-- "Continuar viendo" — progreso de reproducción por episodio. Preparada
-- para cuando exista un reproductor real (fase "Streaming" del ROADMAP);
-- hasta entonces ninguna pantalla escribe en esta tabla.
create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mal_id integer not null,
  episode_number integer not null,
  seconds_watched integer not null default 0,
  title text,
  poster text,
  updated_at timestamptz not null default now(),
  unique (user_id, mal_id, episode_number)
);

alter table public.watch_history enable row level security;

create policy "Cada usuario ve únicamente su propio historial"
  on public.watch_history for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Cada usuario escribe únicamente su propio historial"
  on public.watch_history for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Cada usuario actualiza únicamente su propio historial"
  on public.watch_history for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Cada usuario elimina únicamente su propio historial"
  on public.watch_history for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists watch_history_user_id_idx on public.watch_history (user_id);

create or replace function public.set_watch_history_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_watch_history_updated_at on public.watch_history;
create trigger set_watch_history_updated_at
  before update on public.watch_history
  for each row execute function public.set_watch_history_updated_at();
