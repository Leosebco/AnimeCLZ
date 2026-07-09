-- "Favoritos" (♥) — animes que le gustan al usuario. Distinto de
-- watch_later ("Mi Lista" — animes que planea ver). Guarda una foto de los
-- campos de animeService.mapAnime que las cards necesitan renderizar sin
-- volver a golpear Jikan por cada anime de la lista.
create table if not exists public.favorites (
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

alter table public.favorites enable row level security;

create policy "Cada usuario ve únicamente sus propios favoritos"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Cada usuario agrega únicamente sus propios favoritos"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Cada usuario elimina únicamente sus propios favoritos"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists favorites_user_id_idx on public.favorites (user_id);
