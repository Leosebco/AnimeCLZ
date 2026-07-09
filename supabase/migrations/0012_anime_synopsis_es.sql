-- Arquitectura para sinopsis en español almacenadas (ver CLAUDE.md /
-- animeService.js): Jikan solo da sinopsis en inglés. Esta tabla guarda,
-- por anime (mal_id), una traducción curada — cuando exista, la app la
-- muestra en vez de la original; si no existe, muestra la de Jikan sin
-- traducir en tiempo real. Pensada para poblarse durante una futura
-- importación desde Jikan (no implementada todavía — "preparar la
-- arquitectura", no el pipeline de traducción en sí).
create table if not exists public.anime_synopsis_es (
  mal_id integer primary key,
  synopsis text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.anime_synopsis_es enable row level security;

-- Lectura pública (incluso sin sesión): el catálogo (Home/Explorar/
-- Detalle) es público, así que la sinopsis en español también debe verse
-- sin iniciar sesión, igual que el resto de los datos de Jikan.
create policy "Las sinopsis en español son públicas"
  on public.anime_synopsis_es for select
  to anon, authenticated
  using (true);

-- Sin policy de insert/update/delete para anon/authenticated a propósito:
-- se escribe desde el backend/service role (el futuro importador), no
-- desde el cliente — mismo criterio que notifications (migración 0007).

grant select on public.anime_synopsis_es to anon, authenticated;

create or replace function public.set_anime_synopsis_es_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_anime_synopsis_es_updated_at on public.anime_synopsis_es;
create trigger set_anime_synopsis_es_updated_at
  before update on public.anime_synopsis_es
  for each row execute function public.set_anime_synopsis_es_updated_at();
