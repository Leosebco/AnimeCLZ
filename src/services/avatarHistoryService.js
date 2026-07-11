import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { devError } from '@/utils/logger'

const GENERIC_ERROR = 'No pudimos cargar tus avatares recientes. Inténtalo nuevamente.'
const SAVE_ERROR = 'No pudimos guardar el avatar. Inténtalo nuevamente.'

const COLUMNS = 'source, character_id, name, image, anime, role, is_favorite, used_at'

/**
 * "Avatares recientes" y "Favoritos" del buscador de personajes
 * (AvatarPicker) — por CUENTA, no por perfil (migración 0022). Un solo
 * personaje puede tener como máximo una fila por cuenta
 * (unique(account_id, source, character_id)): volver a elegirlo actualiza
 * `used_at` en vez de duplicar la fila.
 */
function fromRow(row) {
  return {
    id: `${row.source}:${row.character_id}`,
    source: row.source,
    name: row.name,
    image: row.image,
    anime: row.anime,
    role: row.role,
    isFavorite: row.is_favorite,
    usedAt: row.used_at,
  }
}

function toCharacterId(character) {
  // `character.id` ya viene con el prefijo "source:id" (ver
  // avatarSearchService) — se separa para no duplicarlo en la columna.
  const [, ...rest] = character.id.split(':')
  return rest.join(':') || String(character.id)
}

export async function listAvatarHistory(accountId) {
  if (!isSupabaseConfigured || !accountId) return []
  const { data, error } = await supabase
    .from('avatar_history')
    .select(COLUMNS)
    .eq('account_id', accountId)
    .order('used_at', { ascending: false })
    .limit(30)
  if (error) {
    devError('[avatarHistoryService.listAvatarHistory] Supabase error:', error)
    throw new Error(GENERIC_ERROR)
  }
  return data.map(fromRow)
}

// No incluye `is_favorite` en el payload a propósito: en un upsert parcial
// de Supabase/PostgREST, una clave ausente no se toca — así se preserva el
// valor de favorito ya existente en vez de resetearlo cada vez que se usa
// el mismo personaje de nuevo.
export async function recordAvatarUse(accountId, character) {
  if (!isSupabaseConfigured || !accountId) return
  const { error } = await supabase.from('avatar_history').upsert(
    {
      account_id: accountId,
      source: character.source,
      character_id: toCharacterId(character),
      name: character.name,
      image: character.image,
      anime: character.anime ?? null,
      role: character.role ?? null,
      used_at: new Date().toISOString(),
    },
    { onConflict: 'account_id,source,character_id' },
  )
  if (error) {
    // No bloquea la selección del avatar si esto falla — es un beneficio
    // secundario (recordar el uso), no la acción principal.
    devError('[avatarHistoryService.recordAvatarUse] Supabase error:', error)
  }
}

export async function setAvatarFavorite(accountId, character, isFavorite) {
  if (!isSupabaseConfigured || !accountId) throw new Error(SAVE_ERROR)
  const { error } = await supabase.from('avatar_history').upsert(
    {
      account_id: accountId,
      source: character.source,
      character_id: toCharacterId(character),
      name: character.name,
      image: character.image,
      anime: character.anime ?? null,
      role: character.role ?? null,
      is_favorite: isFavorite,
    },
    { onConflict: 'account_id,source,character_id' },
  )
  if (error) {
    devError('[avatarHistoryService.setAvatarFavorite] Supabase error:', error)
    throw new Error(SAVE_ERROR)
  }
}
