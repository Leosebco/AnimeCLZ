-- Sistema de roles para el Panel de Administración (admin/editor/moderador/
-- usuario). "usuario" es el rol por defecto de cualquier cuenta nueva.
alter table public.profiles
  add column if not exists role text not null default 'usuario'
    check (role in ('admin', 'editor', 'moderador', 'usuario'));

-- Evita que un usuario se autoasigne un rol superior editando su propio
-- perfil (profileService.updateProfile hace un UPDATE normal, sujeto a la
-- misma policy de "cada usuario edita su propio perfil"). Solo una cuenta
-- que ya sea 'admin' puede cambiar el rol de un perfil.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if not exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    ) then
      raise exception 'No tienes permiso para cambiar el rol de este perfil.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role_trigger on public.profiles;
create trigger protect_profile_role_trigger
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Primera cuenta admin: asignar manualmente desde el SQL Editor, p. ej.
--   update public.profiles set role = 'admin' where user_id = '<uuid>';
-- (como owner del proyecto, este UPDATE corre fuera de RLS y del trigger
-- de arriba lo evita cualquier cliente autenticado normal).
