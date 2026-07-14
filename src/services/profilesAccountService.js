import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { devError } from '@/utils/logger'
import syncManager from '@/services/sync/SyncManager'

const GENERIC_ERROR = 'No pudimos cargar los perfiles de esta cuenta. Inténtalo nuevamente.'
const SAVE_ERROR = 'No pudimos guardar el perfil. Inténtalo nuevamente.'

const COLUMNS =
  'id, account_id, nombre, avatar, tipo_avatar, color, rol, tema, fondo, autoplay, activo, fecha_creacion, fecha_actualizacion'

function fromRow(row) {
  return {
    id: row.id,
    accountId: row.account_id,
    nombre: row.nombre,
    avatar: row.avatar,
    tipoAvatar: row.tipo_avatar,
    color: row.color,
    rol: row.rol,
    tema: row.tema,
    fondo: row.fondo,
    autoplay: row.autoplay,
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
  if (error) {
    // El mensaje al usuario es genérico a propósito (mismo criterio que el
    // resto de la app), pero el error real de Supabase (code/message/
    // details/hint de PostgREST) nunca debe perderse — es la única forma
    // de diagnosticar RLS/grants faltantes en vez de adivinar. Solo en
    // consola de desarrollo (ver utils/logger.js) — nunca en producción.
    devError('[profilesAccountService.listProfiles] Supabase error:', error)
    throw new Error(GENERIC_ERROR)
  }
  return data.map(fromRow)
}

export async function createProfile(accountId, { nombre, avatar, tipoAvatar, color, tema, fondo }) {
  if (!isSupabaseConfigured) throw new Error(SAVE_ERROR)
  const { data, error } = await supabase
    .from('profiles_account')
    .insert({ account_id: accountId, nombre, avatar, tipo_avatar: tipoAvatar, color, tema, fondo })
    .select(COLUMNS)
    .single()
  if (error) {
    devError('[profilesAccountService.createProfile] Supabase error:', error)
    // A diferencia del resto de servicios, acá el mensaje real de Postgres
    // sí se muestra (no uno genérico): el trigger `enforce_max_profiles`
    // (migración 0019) lanza un mensaje ya amable en español ("Una cuenta
    // puede tener hasta 4 perfiles.") — perderlo detrás de un genérico
    // dejaría al usuario sin saber por qué falló.
    throw new Error(error.message || SAVE_ERROR)
  }
  return fromRow(data)
}

// `tema`/`fondo`/`autoplay` son opcionales — ThemeContext llama a esto con
// solo `{ tema }` al cambiar de paleta, Settings.jsx con solo `{ autoplay }`
// al cambiar esa preferencia; los campos no presentes en el objeto no se
// tocan (Supabase solo actualiza las columnas incluidas en el payload).
async function rawUpdateProfile(id, { nombre, avatar, tipoAvatar, color, tema, fondo, autoplay }) {
  const { data, error } = await supabase
    .from('profiles_account')
    .update({ nombre, avatar, tipo_avatar: tipoAvatar, color, tema, fondo, autoplay })
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) {
    devError('[profilesAccountService.updateProfile] Supabase error:', error)
    throw new Error(SAVE_ERROR)
  }
  return fromRow(data)
}

// v3.1 — Sync Engine: repite una edición de perfil encolada al volver la
// conexión. `rawUpdateProfile` solo destructura las claves que le
// interesan de su segundo argumento — pasarle el `payload` entero (que
// además trae `id`) es inofensivo, esa clave de más se ignora.
syncManager.registerHandler('profile:update', (payload) => rawUpdateProfile(payload.id, payload))

/**
 * v3.1 — Sync Engine: con conexión, comportamiento idéntico a siempre
 * (update inmediato, devuelve la fila real). Sin conexión, encola los
 * campos (`merge: true` — dos ediciones offline distintas, ej. tema y
 * autoplay, se fusionan en una sola entrada en vez de que la segunda
 * pierda la primera) y resuelve con `{ id, ...fields }` en vez de la fila
 * completa — `ProfileContext.updateProfileById` fusiona esto sobre el
 * perfil YA conocido en vez de reemplazarlo entero, así que el resto de
 * los campos (rol/activo/avatar/etc.) no se pierden mientras la operación
 * sigue encolada.
 *
 * `payload` va PLANO (`{ id, ...fields }`), no anidado (`{ id, fields }`)
 * — `offlineQueue.upsertEntry`'s `merge: true` hace un merge superficial
 * (`{...existing.payload, ...payload}`); si `fields` fuera un objeto
 * anidado, la segunda edición offline reemplazaría el objeto `fields`
 * completo de la primera en vez de combinarse campo por campo.
 */
export async function updateProfile(id, fields) {
  if (!isSupabaseConfigured) throw new Error(SAVE_ERROR)
  return syncManager.run(
    {
      type: 'profile:update',
      key: `profile:${id}`,
      payload: { id, ...fields },
      merge: true,
      ownErrorMessage: SAVE_ERROR,
      optimisticResult: { id, ...fields },
    },
    () => rawUpdateProfile(id, fields),
  )
}

// Baja lógica (activo = false) en vez de DELETE: más simple de revertir y
// no exige tocar las políticas de borrado en cascada de otras tablas que
// en el futuro puedan referenciar un perfil. El trigger
// `protect_profile_account_deletion` (migración 0019) bloquea eliminar el
// único perfil activo o el que tiene rol elevado, con un mensaje ya amable
// en español — igual que en createProfile, se muestra tal cual en vez de
// un genérico.
export async function deactivateProfile(id) {
  if (!isSupabaseConfigured) throw new Error(SAVE_ERROR)
  const { error } = await supabase.from('profiles_account').update({ activo: false }).eq('id', id)
  if (error) {
    devError('[profilesAccountService.deactivateProfile] Supabase error:', error)
    throw new Error(error.message || 'No pudimos eliminar el perfil. Inténtalo nuevamente.')
  }
}
