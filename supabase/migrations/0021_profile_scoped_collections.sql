-- Sistema de perfiles definitivo (v1.5): Favoritos, Mi Lista e Historial
-- pasan de ser por CUENTA a ser por PERFIL (decisión confirmada con el
-- usuario — hasta ahora era a propósito por cuenta, ver v1.1 en
-- ROADMAP.md/CLAUDE.md, pero "eliminar perfil" necesita borrar de verdad
-- sus propias listas). `user_id` se mantiene (RLS y NOT NULL), `profile_id`
-- es el nuevo scope real que usan las lecturas/escrituras de la app.
--
-- Comentarios queda fuera de esta migración a propósito: `comments.user_id`
-- referencia la cuenta, no hay concepto de autoría por perfil, y no existe
-- interfaz pública para crearlos todavía (solo moderación admin).

-- ============================================================
-- favorites
-- ============================================================
alter table public.favorites
  add column if not exists profile_id uuid references public.profiles_account (id) on delete cascade;

update public.favorites f
set profile_id = (
  select pa.id from public.profiles_account pa
  where pa.account_id = f.user_id
  order by pa.fecha_creacion asc
  limit 1
)
where profile_id is null;

alter table public.favorites alter column profile_id set not null;

alter table public.favorites drop constraint if exists favorites_user_id_mal_id_key;
alter table public.favorites add constraint favorites_profile_id_mal_id_key unique (profile_id, mal_id);

create index if not exists favorites_profile_id_idx on public.favorites (profile_id);

drop policy if exists "Cada usuario agrega únicamente sus propios favoritos" on public.favorites;
create policy "Cada usuario agrega únicamente sus propios favoritos"
  on public.favorites for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles_account pa
      where pa.id = profile_id and pa.account_id = auth.uid()
    )
  );

-- ============================================================
-- watch_later
-- ============================================================
alter table public.watch_later
  add column if not exists profile_id uuid references public.profiles_account (id) on delete cascade;

update public.watch_later w
set profile_id = (
  select pa.id from public.profiles_account pa
  where pa.account_id = w.user_id
  order by pa.fecha_creacion asc
  limit 1
)
where profile_id is null;

alter table public.watch_later alter column profile_id set not null;

alter table public.watch_later drop constraint if exists watch_later_user_id_mal_id_key;
alter table public.watch_later add constraint watch_later_profile_id_mal_id_key unique (profile_id, mal_id);

create index if not exists watch_later_profile_id_idx on public.watch_later (profile_id);

drop policy if exists "Cada usuario agrega únicamente a su propia Mi Lista" on public.watch_later;
create policy "Cada usuario agrega únicamente a su propia Mi Lista"
  on public.watch_later for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles_account pa
      where pa.id = profile_id and pa.account_id = auth.uid()
    )
  );

-- ============================================================
-- watch_history
-- ============================================================
alter table public.watch_history
  add column if not exists profile_id uuid references public.profiles_account (id) on delete cascade;

update public.watch_history h
set profile_id = (
  select pa.id from public.profiles_account pa
  where pa.account_id = h.user_id
  order by pa.fecha_creacion asc
  limit 1
)
where profile_id is null;

alter table public.watch_history alter column profile_id set not null;

alter table public.watch_history drop constraint if exists watch_history_user_id_mal_id_episode_number_key;
alter table public.watch_history
  add constraint watch_history_profile_id_mal_id_episode_number_key unique (profile_id, mal_id, episode_number);

create index if not exists watch_history_profile_id_idx on public.watch_history (profile_id);

drop policy if exists "Cada usuario escribe únicamente su propio historial" on public.watch_history;
create policy "Cada usuario escribe únicamente su propio historial"
  on public.watch_history for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles_account pa
      where pa.id = profile_id and pa.account_id = auth.uid()
    )
  );

drop policy if exists "Cada usuario actualiza únicamente su propio historial" on public.watch_history;
create policy "Cada usuario actualiza únicamente su propio historial"
  on public.watch_history for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles_account pa
      where pa.id = profile_id and pa.account_id = auth.uid()
    )
  );

-- ============================================================
-- Limpieza real al eliminar un perfil (activo pasa a false). El borrado de
-- `profiles_account` en sí sigue siendo lógico (activo=false, ver 0009),
-- pero sus Favoritos/Mi Lista/Historial no tienen motivo para conservarse
-- una vez que el perfil dueño desaparece — se eliminan de verdad (DELETE),
-- no de forma lógica. `on delete cascade` en `profile_id` no alcanza para
-- esto porque desactivar un perfil es un UPDATE, no un DELETE de la fila.
-- ============================================================
create or replace function public.cleanup_profile_data()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.activo = false and old.activo = true then
    delete from public.favorites where profile_id = old.id;
    delete from public.watch_later where profile_id = old.id;
    delete from public.watch_history where profile_id = old.id;
  end if;
  return new;
end;
$$;

drop trigger if exists cleanup_profile_data_trigger on public.profiles_account;
create trigger cleanup_profile_data_trigger
  after update on public.profiles_account
  for each row execute function public.cleanup_profile_data();
