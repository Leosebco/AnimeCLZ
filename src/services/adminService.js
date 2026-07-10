import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { devError } from '@/utils/logger'

const GENERIC_ERROR = 'No pudimos cargar los datos del panel. Inténtalo nuevamente.'

/**
 * Capa de datos del Panel de Administración. Todo lo de aquí lee tablas
 * cuya policy de SELECT ya es pública-para-autenticados (`profiles`,
 * `comments`, `ratings` — ver migraciones 0001/0005/0006), así que estas
 * consultas funcionan con la misma anon key del resto de la app, sin
 * service role. `favorites`/`watch_later`/`watch_history`/`notifications`
 * son privadas por diseño (`auth.uid() = user_id`) y por eso no se pueden
 * agregar aquí todavía — haría falta una policy de admin o una vista con
 * `security definer` (ver ROADMAP.md).
 */
export async function getDashboardStats() {
  if (!isSupabaseConfigured) {
    return { totalUsers: null, staffCount: null, totalComments: null, totalRatings: null }
  }

  const [users, staff, comments, ratings] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).neq('role', 'usuario'),
    supabase.from('comments').select('id', { count: 'exact', head: true }),
    supabase.from('ratings').select('id', { count: 'exact', head: true }),
  ])

  const firstError = [users, staff, comments, ratings].find((result) => result.error)
  if (firstError) throw new Error(GENERIC_ERROR)

  return {
    totalUsers: users.count ?? 0,
    staffCount: staff.count ?? 0,
    totalComments: comments.count ?? 0,
    totalRatings: ratings.count ?? 0,
  }
}

export async function listRecentUsers(limit = 5) {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, username, avatar, role, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(GENERIC_ERROR)
  return data
}

const PAGE_SIZE = 10

export async function listUsers({ page = 1, search = '', role = '' } = {}) {
  if (!isSupabaseConfigured) return { data: [], total: 0, page, pageSize: PAGE_SIZE }

  let query = supabase
    .from('profiles')
    .select('user_id, username, avatar, bio, role, activo, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search.trim()) query = query.ilike('username', `%${search.trim()}%`)
  if (role) query = query.eq('role', role)

  const from = (page - 1) * PAGE_SIZE
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1)
  if (error) throw new Error(GENERIC_ERROR)
  return { data, total: count ?? 0, page, pageSize: PAGE_SIZE }
}

/**
 * Panel de Gestión de Usuarios (v1.3) — cambia el rol de CUENTA
 * (`profiles.role`). El trigger `sync_default_profile_rol` (migración
 * 0009) ya propaga el cambio al perfil predeterminado de esa cuenta, que
 * es el que realmente controla el acceso al Panel de Administración —
 * no hace falta escribir en `profiles_account` desde aquí.
 *
 * El trigger `protect_profile_role` (migración 0013) exige que quien
 * llama sea `super_admin` y bloquea cambiar el propio rol — este
 * servicio no duplica esa validación, solo deja que el error real de
 * Postgres (RLS/trigger) llegue como mensaje amable.
 */
export async function updateUserRole(userId, role) {
  if (!isSupabaseConfigured) throw new Error(GENERIC_ERROR)
  const { error } = await supabase.from('profiles').update({ role }).eq('user_id', userId)
  if (error) {
    devError('[adminService.updateUserRole] Supabase error:', error)
    throw new Error('No pudimos actualizar el rol. Verifica que tu perfil activo sea Super Administrador.')
  }
}

/**
 * Activar/desactivar una cuenta (v1.0) — acción real de moderación que no
 * requiere el Admin API de Supabase (service role, no disponible en el
 * cliente). Desactivar no cierra la sesión ya abierta de esa cuenta por
 * sí solo: es una marca que el resto del código respeta si en el futuro
 * se agrega un chequeo de acceso basado en `activo`. Restringido a
 * `super_admin` por la misma naturaleza de "administrar cuentas ajenas"
 * que el cambio de rol — no hay trigger de DB para esto todavía (no
 * cambia ningún dato sensible como el rol), así que la restricción real
 * hoy es solo de UI (ver pages/admin/Users.jsx).
 */
export async function updateUserStatus(userId, activo) {
  if (!isSupabaseConfigured) throw new Error(GENERIC_ERROR)
  const { error } = await supabase.from('profiles').update({ activo }).eq('user_id', userId)
  if (error) {
    devError('[adminService.updateUserStatus] Supabase error:', error)
    throw new Error('No pudimos actualizar el estado de la cuenta. Inténtalo nuevamente.')
  }
}

export async function listComments({ page = 1, search = '' } = {}) {
  if (!isSupabaseConfigured) return { data: [], total: 0, page, pageSize: PAGE_SIZE }

  let query = supabase
    .from('comments')
    .select('id, user_id, mal_id, content, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search.trim()) query = query.ilike('content', `%${search.trim()}%`)

  const from = (page - 1) * PAGE_SIZE
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1)
  if (error) throw new Error(GENERIC_ERROR)
  return { data, total: count ?? 0, page, pageSize: PAGE_SIZE }
}

// Moderación real (v1.0): eliminar un comentario. `comments.user_id` es
// ON DELETE SET NULL respecto a auth.users (migración 0006) — acá el
// borrado es de la fila del comentario en sí, sin tocar la cuenta autora.
export async function deleteComment(id) {
  if (!isSupabaseConfigured) throw new Error(GENERIC_ERROR)
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) {
    devError('[adminService.deleteComment] Supabase error:', error)
    throw new Error('No pudimos eliminar el comentario. Inténtalo nuevamente.')
  }
}
