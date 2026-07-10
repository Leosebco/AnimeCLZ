-- Bug real encontrado al conectar "Usuarios: activar/desactivar" (v1.0):
-- la única policy de UPDATE sobre `profiles` (migración 0001) es
-- `auth.uid() = user_id`. RLS filtra la fila ANTES de que corra el
-- trigger `protect_profile_role`, así que un super_admin cambiando el rol
-- de OTRA cuenta (`updateUserRole`, ya en producción desde v1.3) actualiza
-- 0 filas en silencio — sin error, sin efecto. Falta una policy que deje
-- pasar la fila cuando quien pide el cambio es super_admin; la validación
-- fina (qué puede cambiar, no puede tocar su propio rol) sigue siendo
-- responsabilidad de los triggers `protect_profile_role`/
-- `protect_profile_activo` (este último nuevo, ver abajo).
create policy "Super admin edita cualquier cuenta"
  on public.profiles for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'super_admin'
    )
  )
  with check (true);

-- Mismo patrón de protección que `protect_profile_role` (0008/0013), pero
-- para la columna `activo` (0016): solo super_admin puede desactivar/
-- reactivar una cuenta ajena, y nadie puede desactivar la propia (para no
-- perder acceso por accidente). Sin sesión (auth.uid() IS NULL) se
-- permite — operador de confianza actuando fuera del cliente.
create or replace function public.protect_profile_activo()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.activo is distinct from old.activo then
    if auth.uid() is not null then
      if auth.uid() = old.user_id then
        raise exception 'No puedes desactivar tu propia cuenta.';
      end if;
      if not exists (
        select 1 from public.profiles p
        where p.user_id = auth.uid() and p.role = 'super_admin'
      ) then
        raise exception 'No tienes permiso para cambiar el estado de esta cuenta.';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_activo_trigger on public.profiles;
create trigger protect_profile_activo_trigger
  before update on public.profiles
  for each row execute function public.protect_profile_activo();
