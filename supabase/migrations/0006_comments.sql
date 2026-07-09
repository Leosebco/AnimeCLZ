-- Comentarios por anime. Tabla preparada de antemano; la interfaz no se
-- implementa todavía (ver TODO.md). user_id nullable en el borrado para
-- poder conservar el hilo ("comentario eliminado") en vez de romper
-- respuestas anidadas si se borra la cuenta.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  mal_id integer not null,
  parent_id uuid references public.comments (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Los comentarios son visibles para cualquier usuario autenticado"
  on public.comments for select
  to authenticated
  using (true);

create policy "Cada usuario crea únicamente sus propios comentarios"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Cada usuario edita únicamente sus propios comentarios"
  on public.comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Cada usuario elimina únicamente sus propios comentarios"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists comments_mal_id_idx on public.comments (mal_id);
create index if not exists comments_parent_id_idx on public.comments (parent_id);
