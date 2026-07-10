-- Mismo bug que 0017, esta vez en `comments`: la única policy de DELETE
-- (migración 0006) es `auth.uid() = user_id`, así que la nueva acción de
-- moderación "Eliminar comentario" del Panel (adminService.deleteComment)
-- borraría 0 filas en silencio al intentar eliminar el comentario de OTRA
-- cuenta. Se agrega una policy adicional de DELETE para cuentas de staff
-- (mismo criterio de roles que protect_profile_role/STAFF_ROLES en el
-- frontend: admin/editor/moderador/super_admin).
create policy "Staff modera cualquier comentario"
  on public.comments for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role in ('super_admin', 'admin', 'editor', 'moderador')
    )
  );
