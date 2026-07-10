-- Sistema de perfiles definitivo (v1.5): hasta ahora nada impedía crear más
-- de 4 perfiles por cuenta, ni protegía contra eliminar el último perfil
-- activo o el que tiene permisos administrativos — solo la UI ocultaba el
-- botón para "el perfil predeterminado" (fácil de saltear llamando al
-- servicio directamente). Ambas reglas se agregan aquí como respaldo real,
-- no solo en el frontend (que hace su propia validación previa por UX).

-- 1) Máximo 4 perfiles activos por cuenta.
create or replace function public.enforce_max_profiles()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (
    select count(*) from public.profiles_account
    where account_id = new.account_id and activo = true
  ) >= 4 then
    raise exception 'Una cuenta puede tener hasta 4 perfiles.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_max_profiles_trigger on public.profiles_account;
create trigger enforce_max_profiles_trigger
  before insert on public.profiles_account
  for each row execute function public.enforce_max_profiles();

-- 2) No eliminar el último perfil activo, ni el que tiene rol elevado (para
-- no dejar una cuenta sin ningún perfil con acceso al Panel de
-- Administración). Como solo el perfil sincronizado por
-- `sync_default_profile_rol` puede tener `rol <> 'usuario'` (ver 0009),
-- proteger "el perfil con rol elevado" protege en la práctica al perfil
-- admin, sin necesitar saber cuál es "el predeterminado".
create or replace function public.protect_profile_account_deletion()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  active_count integer;
begin
  if new.activo = false and old.activo = true then
    select count(*) into active_count
    from public.profiles_account
    where account_id = old.account_id and activo = true;

    if active_count <= 1 then
      raise exception 'No puedes eliminar el único perfil de la cuenta.';
    end if;

    if old.rol <> 'usuario' then
      raise exception 'No puedes eliminar el perfil con permisos administrativos.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_account_deletion_trigger on public.profiles_account;
create trigger protect_profile_account_deletion_trigger
  before update on public.profiles_account
  for each row execute function public.protect_profile_account_deletion();

-- 3) Fix defensivo: `sync_default_profile_rol` (0009) buscaba "el perfil más
-- antiguo" sin filtrar `activo = true` — si ese perfil llegara a
-- desactivarse, un futuro cambio de rol de cuenta lo re-sincronizaría
-- igual, en vez de saltarlo. No debería poder pasar hoy (la protección del
-- punto 2 ya lo impide), pero se corrige por las dudas — defensa en
-- profundidad, mismo criterio que el resto del proyecto.
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
      where account_id = new.user_id and activo = true
      order by fecha_creacion asc
      limit 1
    );
  end if;
  return new;
end;
$$;
