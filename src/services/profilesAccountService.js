import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const GENERIC_ERROR = 'No pudimos cargar los perfiles de esta cuenta. Inténtalo nuevamente.'
const SAVE_ERROR = 'No pudimos guardar el perfil. Inténtalo nuevamente.'

const COLUMNS = 'id, account_id, nombre, avatar, tipo_avatar, color, rol, activo, fecha_creacion, fecha_actualizacion'

function fromRow(row) {
  return {
    id: row.id,
    accountId: row.account_id,
    nombre: row.nombre,
    avatar: row.avatar,
    tipoAvatar: row.tipo_avatar,
    color: row.color,
    rol: row.rol,
    activo: row.activo,
    fechaCreacion: row.fecha_creacion,
    fechaActualizacion: row.fecha_actualizacion,
  }
}

/**
 * Perfiles múltiples por cuenta (estilo Netflix, tabla `profiles_account`,
 * ver migración 0009). `rol` nunca se acepta como parámetro de create/update
 * aquí a propósito — nace siempre 'usuario' y solo puede subir de nivel
 * manualmente desde el SQL Editor (o quedar sincronizado automáticamente
 * si la cuenta se vuelve admin, ver el trigger `sync_default_profile_rol`).
 */
export async function listProfiles(accountId) {
  if (!isSupabaseConfigured || !accountId) return []
  const { data, error } = await supabase
    .from('profiles_account')
    .select(COLUMNS)
    .eq('account_id', accountId)
    .eq('activo', true)
    .order('fecha_creacion', { ascending: true })
  if (error) throw new Error(GENERIC_ERROR)
  return data.map(fromRow)
}

export async function createProfile(accountId, { nombre, avatar, tipoAvatar, color }) {
  if (!isSupabaseConfigured) throw new Error(SAVE_ERROR)
  const { data, error } = await supabase
    .from('profiles_account')
    .insert({ account_id: accountId, nombre, avatar, tipo_avatar: tipoAvatar, color })
    .select(COLUMNS)
    .single()
  if (error) throw new Error(SAVE_ERROR)
  return fromRow(data)
}

export async function updateProfile(id, { nombre, avatar, tipoAvatar, color }) {
  if (!isSupabaseConfigured) throw new Error(SAVE_ERROR)
  const { data, error } = await supabase
    .from('profiles_account')
    .update({ nombre, avatar, tipo_avatar: tipoAvatar, color })
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) throw new Error(SAVE_ERROR)
  return fromRow(data)
}

// Baja lógica (activo = false) en vez de DELETE: más simple de revertir y
// no exige tocar las políticas de borrado en cascada de otras tablas que
// en el futuro puedan referenciar un perfil.
export async function deactivateProfile(id) {
  if (!isSupabaseConfigured) throw new Error(SAVE_ERROR)
  const { error } = await supabase.from('profiles_account').update({ activo: false }).eq('id', id)
  if (error) throw new Error('No pudimos eliminar el perfil. Inténtalo nuevamente.')
}
