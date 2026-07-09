import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const GENERIC_ERROR = 'No pudimos subir la imagen. Inténtalo nuevamente.'
const MAX_SIZE_BYTES = 3 * 1024 * 1024

/**
 * Sube un avatar propio al bucket público `avatars` (ver migración 0010),
 * dentro de la carpeta del dueño (`{accountId}/...`) — la policy de
 * Storage exige ese prefijo, así que subir a cualquier otra ruta falla
 * por RLS antes de llegar aquí.
 */
export async function uploadAvatarImage(accountId, file) {
  if (!isSupabaseConfigured) throw new Error(GENERIC_ERROR)
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('La imagen es demasiado pesada (máximo 3 MB).')
  }

  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `${accountId}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: false })
  if (error) throw new Error(GENERIC_ERROR)

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
