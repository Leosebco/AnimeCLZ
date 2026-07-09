-- "Mi Lista" — animes que el usuario planea ver más adelante. Tabla
-- separada de favorites: "me gusta" y "quiero verlo después" son
-- decisiones distintas (ver ROADMAP.md, v0.9).
create table if not exists public.watch_later (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mal_id integer not null,
  title text not null,
  poster text,
  poster_small text,
  type text,
  year integer,
  score numeric,
  status text,
  created_at timestamptz not null default now(),
  unique (user_id, mal_id)
);

alter table public.watch_later enable row level security;

create policy "Cada usuario ve únicamente su propia Mi Lista"
  on public.watch_later for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Cada usuario agrega únicamente a su propia Mi Lista"
  on public.watch_later for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Cada usuario elimina únicamente de su propia Mi Lista"
  on public.watch_later for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists watch_later_user_id_idx on public.watch_later (user_id);
