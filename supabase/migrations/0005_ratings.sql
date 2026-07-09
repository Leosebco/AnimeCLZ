-- Calificaciones propias de AnimeCLZ (independientes del score de MAL que
-- ya trae Jikan). Tabla preparada de antemano; la interfaz para calificar
-- no se implementa todavía (ver TODO.md).
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mal_id integer not null,
  score smallint not null check (score between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mal_id)
);

alter table public.ratings enable row level security;

create policy "Las calificaciones son visibles para cualquier usuario autenticado"
  on public.ratings for select
  to authenticated
  using (true);

create policy "Cada usuario crea únicamente sus propias calificaciones"
  on public.ratings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Cada usuario edita únicamente sus propias calificaciones"
  on public.ratings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Cada usuario elimina únicamente sus propias calificaciones"
  on public.ratings for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists ratings_mal_id_idx on public.ratings (mal_id);
