import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import syncManager from '@/services/sync/SyncManager'

const GENERIC_ERROR = 'No pudimos guardar tu lista. Inténtalo nuevamente.'

function toRow(anime) {
  return {
    mal_id: anime.id,
    title: anime.title,
    poster: anime.poster,
    poster_small: anime.posterSmall,
    type: anime.type,
    year: anime.year,
    score: anime.score,
    status: anime.status,
  }
}

function fromRow(row) {
  return {
    id: row.mal_id,
    title: row.title,
    poster: row.poster,
    posterSmall: row.poster_small,
    type: row.type,
    year: row.year,
    score: row.score,
    status: row.status,
  }
}

/**
 * Factory compartida por favoritesService y watchLaterService: mismo shape
 * de tabla (mal_id + foto de campos de mapAnime), mismas reglas de RLS,
 * solo cambia el nombre de la tabla en Supabase.
 *
 * v1.5: el scope real pasó de ser por CUENTA (`user_id`) a ser por PERFIL
 * (`profile_id`, migración 0021) — cada perfil de una misma cuenta tiene su
 * propia lista, y se borra de verdad cuando su perfil se elimina. `user_id`
 * se sigue mandando en `add` (columna NOT NULL, y la policy de RLS todavía
 * exige `auth.uid() = user_id`) pero ya no es lo que filtra `list`/`remove`.
 *
 * v3.1 — Sync Engine: `add`/`remove` pasan por `SyncManager.run()` — con
 * conexión, comportamiento idéntico a siempre (llama a `rawAdd`/`rawRemove`
 * de inmediato); sin conexión, encola la operación y resuelve optimista
 * (no revierte la UI) en vez de rechazar. Ver `services/sync/SyncManager.js`.
 */
export function createCollectionService(table) {
  async function list(profileId) {
    if (!isSupabaseConfigured || !profileId) return []
    const { data, error } = await supabase
      .from(table)
      .select('mal_id, title, poster, poster_small, type, year, score, status')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(GENERIC_ERROR)
    return data.map(fromRow)
  }

  async function rawAdd(accountId, profileId, anime) {
    const { error } = await supabase
      .from(table)
      .upsert(
        { user_id: accountId, profile_id: profileId, ...toRow(anime) },
        { onConflict: 'profile_id,mal_id' },
      )
    if (error) throw new Error(GENERIC_ERROR)
  }

  async function rawRemove(profileId, malId) {
    const { error } = await supabase.from(table).delete().eq('profile_id', profileId).eq('mal_id', malId)
    if (error) throw new Error(GENERIC_ERROR)
  }

  // v3.1 — Sync Engine: se registra un par por tabla (favorites/
  // watch_later, cada una llama a createCollectionService por separado) —
  // SyncManager los usa para repetir una operación encolada al volver la
  // conexión, sin que este archivo sepa cuándo eso ocurre.
  syncManager.registerHandler(`collection:${table}:add`, (payload) =>
    rawAdd(payload.accountId, payload.profileId, payload.anime),
  )
  syncManager.registerHandler(`collection:${table}:remove`, (payload) =>
    rawRemove(payload.profileId, payload.malId),
  )

  async function add(accountId, profileId, anime) {
    if (!isSupabaseConfigured || !accountId || !profileId) throw new Error(GENERIC_ERROR)
    return syncManager.run(
      {
        type: `collection:${table}:add`,
        key: `collection:${table}:${profileId}:${anime.id}`,
        payload: { accountId, profileId, anime },
        ownErrorMessage: GENERIC_ERROR,
      },
      () => rawAdd(accountId, profileId, anime),
    )
  }

  async function remove(profileId, malId) {
    if (!isSupabaseConfigured || !profileId) throw new Error(GENERIC_ERROR)
    return syncManager.run(
      {
        type: `collection:${table}:remove`,
        key: `collection:${table}:${profileId}:${malId}`,
        payload: { profileId, malId },
        ownErrorMessage: GENERIC_ERROR,
      },
      () => rawRemove(profileId, malId),
    )
  }

  return { list, add, remove }
}
