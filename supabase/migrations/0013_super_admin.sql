-- Rol SUPER_ADMIN + Panel de Gestión de Usuarios (cambiar el rol de
-- cualquier cuenta). Esta migración también corrige un bug real en las
-- funciones de protección de rol creadas en 0008/0009: usaban
-- `auth.uid()` para verificar "¿quién está haciendo este cambio?", pero
-- auth.uid() es NULL fuera de una sesión con JWT (p. ej. corriendo esta
-- misma migración vía `supabase db push`, o desde el SQL Editor) —
-- `not exists (... where account_id = auth.uid() ...)` con auth.uid()
-- NULL es SIEMPRE verdadero, así que esas funciones habrían bloqueado
-- incluso este propio UPDATE de abajo. Verificado antes de escribir esto:
-- `select auth.uid()` en este contexto devuelve NULL.

-- 1) Habilitar 'super_admin' en ambos CHECK (cuenta y perfil).
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'editor', 'moderador', 'usuario'));

alter table public.profiles_account drop constraint if exists profiles_account_rol_check;
alter table public.profiles_account
  add constraint profiles_account_rol_check
  check (rol in ('super_admin', 'admin', 'editor', 'moderador', 'usuario'));

-- 2) Reescribir protect_profile_role: sin contexto de sesión (auth.uid()
-- IS NULL) se permite el cambio — es un operador de confianza actuando
-- por fuera del cliente (migración, SQL Editor). Con sesión, se exige
-- que quien pide el cambio sea 'super_admin' (no alcanza con 'admin' —
-- el Panel de Gestión de Usuarios es explícitamente una capacidad de
-- SUPER_ADMIN) y se bloquea cambiar el propio rol, para no perder acceso
-- por accidente.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is not null then
      if auth.uid() = old.user_id then
        raise exception 'No puedes cambiar tu propio rol.';
      end if;
      if not exists (
        select 1 from public.profiles p
        where p.user_id = auth.uid() and p.role = 'super_admin'
      ) then
        raise exception 'No tienes permiso para cambiar el rol de este perfil.';
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- 3) Mismo tratamiento para el trigger de perfiles (profiles_account).
create or replace function public.protect_profile_account_rol()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.rol is distinct from old.rol then
    if auth.uid() is not null then
      if auth.uid() = old.account_id then
        raise exception 'No puedes cambiar el rol de tu propio perfil.';
      end if;
      if not exists (
        select 1 from public.profiles_account pa
        where pa.account_id = auth.uid() and pa.rol = 'super_admin' and pa.activo
      ) then
        raise exception 'No tienes permiso para cambiar el rol de este perfil.';
      end if;
    end if;
    new.fecha_actualizacion = now();
  end if;
  return new;
end;
$$;

-- 4) La cuenta leoseb.co@gmail.com se convierte automáticamente en
-- SUPER_ADMIN: si ya existe, se eleva ahora (y el trigger
-- sync_default_profile_rol, migración 0009, propaga el cambio a su
-- perfil predeterminado); si se registra en el futuro, handle_new_user
-- (reescrita abajo) la crea directamente como super_admin.
update public.profiles
set role = 'super_admin'
where user_id = (select id from auth.users where email = 'leoseb.co@gmail.com');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, username, role)
  values (
    new.id,
    split_part(new.email, '@', 1),
    case when new.email = 'leoseb.co@gmail.com' then 'super_admin' else 'usuario' end
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;
