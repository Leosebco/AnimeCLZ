-- Perfiles múltiples por cuenta (estilo Netflix): "profiles" (migración
-- 0001) es la CUENTA — una fila por login (Google/email). "profiles_account"
-- es el PERFIL — varias filas por cuenta ("Leonardo", "Invitado", "Anime",
-- "Niños"...), cada una con su propio nombre/avatar/color/rol. El nombre
-- de la tabla es el pedido explícitamente; en el código y la UI se le
-- llama "perfil" para no confundirlo con la cuenta.
create table if not exists public.profiles_account (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  avatar text,
  tipo_avatar text not null default 'inicial' check (tipo_avatar in ('inicial', 'subida', 'personaje')),
  color text not null default '#4F8CFF',
  rol text not null default 'usuario' check (rol in ('admin', 'editor', 'moderador', 'usuario')),
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now()
);

alter table public.profiles_account enable row level security;

create policy "Cada cuenta ve únicamente sus propios perfiles"
  on public.profiles_account for select
  to authenticated
  using (auth.uid() = account_id);

create policy "Cada cuenta crea únicamente sus propios perfiles"
  on public.profiles_account for insert
  to authenticated
  with check (auth.uid() = account_id);

create policy "Cada cuenta edita únicamente sus propios perfiles"
  on public.profiles_account for update
  to authenticated
  using (auth.uid() = account_id)
  with check (auth.uid() = account_id);

create policy "Cada cuenta elimina únicamente sus propios perfiles"
  on public.profiles_account for delete
  to authenticated
  using (auth.uid() = account_id);

create index if not exists profiles_account_account_id_idx on public.profiles_account (account_id);

-- Igual que protect_profile_role (migración 0001) pero para el rol POR
-- PERFIL: services/profilesAccountService.js nunca manda `rol` en
-- create/update (siempre nace 'usuario'), y esto es la barrera del lado
-- del servidor por si alguien intenta forzarlo de todas formas — solo una
-- cuenta que YA tenga un perfil activo con rol 'admin' puede cambiar el
-- rol de cualquiera de sus perfiles.
create or replace function public.protect_profile_account_rol()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.rol is distinct from old.rol then
    if not exists (
      select 1 from public.profiles_account pa
      where pa.account_id = auth.uid() and pa.rol = 'admin' and pa.activo
    ) then
      raise exception 'No tienes permiso para cambiar el rol de este perfil.';
    end if;
  end if;
  new.fecha_actualizacion = now();
  return new;
end;
$$;

drop trigger if exists protect_profile_account_rol_trigger on public.profiles_account;
create trigger protect_profile_account_rol_trigger
  before update on public.profiles_account
  for each row execute function public.protect_profile_account_rol();

-- Al registrarse, además del handle_new_user() de la migración 0001 (que
-- crea la fila de CUENTA), se crea automáticamente el primer PERFIL,
-- reflejando el username y el rol que la cuenta tenga en ese instante
-- (siempre 'usuario' al momento del registro — ver sync_default_profile_rol
-- más abajo para cuando esa cuenta se vuelve admin después).
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- new.user_id (no new.id): profiles.id es la PK propia de esa tabla,
  -- profiles.user_id es la FK real a auth.users — profiles_account.account_id
  -- debe apuntar a auth.users.id como el resto de las tablas de usuario.
  insert into public.profiles_account (account_id, nombre, rol)
  values (new.user_id, coalesce(new.username, 'Mi Perfil'), new.role);
  return new;
end;
$$;

drop trigger if exists on_profile_created_default_profile on public.profiles;
create trigger on_profile_created_default_profile
  after insert on public.profiles
  for each row execute function public.handle_new_user_profile();

-- Cuando el dueño del proyecto eleva una CUENTA a 'admin' a mano (ver nota
-- al final de la migración 0001), este trigger sincroniza automáticamente
-- el PERFIL más antiguo de esa cuenta (el que se creó arriba al
-- registrarse) para que también sea 'admin' — sin esto, "Panel de
-- Administración" nunca aparecería aunque la cuenta ya sea admin, porque
-- el gate real corre sobre el rol del perfil activo, no el de la cuenta.
-- Los demás perfiles de la cuenta (Invitado, Niños, etc.) NO se tocan.
create or replace function public.sync_default_profile_rol()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    update public.profiles_account
    set rol = new.role
    where id = (
      select id from public.profiles_account
      where account_id = new.user_id
      order by fecha_creacion asc
      limit 1
    );
  end if;
  return new;
end;
$$;

drop trigger if exists sync_default_profile_rol_trigger on public.profiles;
create trigger sync_default_profile_rol_trigger
  after update on public.profiles
  for each row execute function public.sync_default_profile_rol();
