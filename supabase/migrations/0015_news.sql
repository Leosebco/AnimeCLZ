-- Noticias (v1.0) — primer módulo de CRUD real del Panel de
-- Administración con una tabla propia de AnimeCLZ (no depende de Jikan,
-- a diferencia de Animes/Temporadas/Episodios/Personajes/Estudios, que
-- siguen sin CRUD porque Jikan es de solo lectura — ver ROADMAP.md).
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  cover_image text,
  author_id uuid references auth.users (id) on delete set null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news enable row level security;

-- Lectura pública de lo publicado (incluso sin sesión, igual que el
-- catálogo) — el staff además puede ver los borradores (published=false)
-- para poder editarlos antes de publicar.
create policy "Las noticias publicadas son públicas"
  on public.news for select
  to anon, authenticated
  using (published = true);

create policy "El staff ve también los borradores"
  on public.news for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles_account pa
      where pa.account_id = auth.uid() and pa.rol in ('super_admin', 'admin', 'editor', 'moderador') and pa.activo
    )
  );

create policy "Solo el staff crea noticias"
  on public.news for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles_account pa
      where pa.account_id = auth.uid() and pa.rol in ('super_admin', 'admin', 'editor', 'moderador') and pa.activo
    )
  );

create policy "Solo el staff edita noticias"
  on public.news for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles_account pa
      where pa.account_id = auth.uid() and pa.rol in ('super_admin', 'admin', 'editor', 'moderador') and pa.activo
    )
  )
  with check (
    exists (
      select 1 from public.profiles_account pa
      where pa.account_id = auth.uid() and pa.rol in ('super_admin', 'admin', 'editor', 'moderador') and pa.activo
    )
  );

create policy "Solo el staff elimina noticias"
  on public.news for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles_account pa
      where pa.account_id = auth.uid() and pa.rol in ('super_admin', 'admin', 'editor', 'moderador') and pa.activo
    )
  );

grant select, insert, update, delete on public.news to authenticated;
grant select on public.news to anon;

create index if not exists news_published_created_at_idx on public.news (published, created_at desc);

create or replace function public.set_news_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_news_updated_at on public.news;
create trigger set_news_updated_at
  before update on public.news
  for each row execute function public.set_news_updated_at();
