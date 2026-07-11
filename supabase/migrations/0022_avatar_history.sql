-- Buscador inteligente de avatares (v1.6): "Avatares recientes" y
-- "Favoritos" del selector de personaje de anime. Por CUENTA (no por
-- perfil) — pedido explícito del usuario para "recientes"; se aplica el
-- mismo alcance a "favoritos" por consistencia (ambos son sobre qué
-- avatares usa/le gustan a la cuenta, no contenido de un perfil puntual).
create table if not exists public.avatar_history (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (source in ('anilist', 'jikan')),
  character_id text not null,
  name text not null,
  image text not null,
  anime text,
  role text,
  is_favorite boolean not null default false,
  used_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (account_id, source, character_id)
);

alter table public.avatar_history enable row level security;

create policy "Cada cuenta ve únicamente su propio historial de avatares"
  on public.avatar_history for select
  to authenticated
  using (auth.uid() = account_id);

create policy "Cada cuenta agrega únicamente a su propio historial de avatares"
  on public.avatar_history for insert
  to authenticated
  with check (auth.uid() = account_id);

create policy "Cada cuenta actualiza únicamente su propio historial de avatares"
  on public.avatar_history for update
  to authenticated
  using (auth.uid() = account_id)
  with check (auth.uid() = account_id);

create policy "Cada cuenta elimina únicamente su propio historial de avatares"
  on public.avatar_history for delete
  to authenticated
  using (auth.uid() = account_id);

create index if not exists avatar_history_account_id_idx on public.avatar_history (account_id);
create index if not exists avatar_history_used_at_idx on public.avatar_history (account_id, used_at desc);

-- Grant explícito de tabla — sin esto, RLS por sí solo no alcanza (bug
-- real ya encontrado y documentado en migraciones anteriores, ver 0011).
grant select, insert, update, delete on public.avatar_history to authenticated;
