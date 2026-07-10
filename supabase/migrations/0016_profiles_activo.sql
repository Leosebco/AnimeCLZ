-- Activar/desactivar cuenta desde el Panel de Gestión de Usuarios (v1.0)
-- — una acción real de moderación que no requiere el Admin API de
-- Supabase (que necesitaría service role, no disponible en el cliente).
-- Desactivar NO elimina la cuenta ni cierra su sesión activa por sí solo;
-- es una marca que el propio front-end respeta (ver adminService.js).
alter table public.profiles
  add column if not exists activo boolean not null default true;
