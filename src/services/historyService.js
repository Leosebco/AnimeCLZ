import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import syncManager from '@/services/sync/SyncManager'

const GENERIC_ERROR = 'No pudimos cargar tu historial. Inténtalo nuevamente.'

/**
 * "Continuar viendo" + historial. Desde v2.1 (Sistema de reproducción) sí
 * hay un reproductor real (`pages/Watch.jsx`) que llama a `upsertProgress`
 * — antes de eso, `watch_history` estaba vacía en la práctica.
 *
 * v1.5: el scope real pasó de ser por CUENTA (`user_id`) a ser por PERFIL
 * (`profile_id`, migración 0021) — mismo criterio que favoritesService/
 * watchLaterService.
 *
 * "Continuar viendo" (una fila por anime, la más reciente) se deriva de
 * este mismo `listHistory` en el cliente (agrupando por `mal_id`,
 * quedándose con la fila más reciente ya que viene ordenado
 * `updated_at desc`) — no hace falta una tabla ni una vista SQL nueva.
 *
 * Limitación aceptada (v2.1, documentada, no resuelta): la clave única es
 * `(profile_id, mal_id, episode_number)`, sin distinguir qué clip (OP/ED)
 * se vio — si un perfil mira el OP y luego el ED del mismo episodio, la
 * segunda escritura pisa el progreso de la primera. En la práctica un
 * episodio normalmente tiene un solo clip que el usuario efectivamente
 * mira, así que se acepta como simplificación en vez de ampliar la clave.
 */
export async function listHistory(profileId) {
  if (!isSupabaseConfigured || !profileId) return []
  const { data, error } = await supabase
    .from('watch_history')
    .select('mal_id, episode_number, seconds_watched, duration_seconds, title, poster, updated_at')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false })
  if (error) throw new Error(GENERIC_ERROR)
  return data.map((row) => ({
    id: row.mal_id,
    episodeNumber: row.episode_number,
    secondsWatched: row.seconds_watched,
    durationSeconds: row.duration_seconds,
    title: row.title,
    poster: row.poster,
    updatedAt: row.updated_at,
  }))
}

/**
 * Progreso guardado de UN episodio puntual — usado por el reproductor para
 * decidir si debe reanudar ("Continuar desde XX:XX"). Deliberadamente no
 * reusa `listHistory` (traería toda la tabla del perfil para encontrar una
 * sola fila).
 */
export async function getProgress(profileId, malId, episodeNumber) {
  if (!isSupabaseConfigured || !profileId) return null
  const { data, error } = await supabase
    .from('watch_history')
    .select('seconds_watched, duration_seconds, updated_at')
    .eq('profile_id', profileId)
    .eq('mal_id', malId)
    .eq('episode_number', episodeNumber)
    .maybeSingle()
  if (error) throw new Error(GENERIC_ERROR)
  if (!data) return null
  return {
    secondsWatched: data.seconds_watched,
    durationSeconds: data.duration_seconds,
    updatedAt: data.updated_at,
  }
}

async function rawUpsertProgress(accountId, profileId, entry) {
  const { malId, episodeNumber, secondsWatched, durationSeconds, title, poster } = entry
  const { error } = await supabase.from('watch_history').upsert(
    {
      user_id: accountId,
      profile_id: profileId,
      mal_id: malId,
      episode_number: episodeNumber,
      seconds_watched: secondsWatched,
      duration_seconds: durationSeconds,
      title,
      poster,
    },
    { onConflict: 'profile_id,mal_id,episode_number' },
  )
  if (error) throw new Error(GENERIC_ERROR)
}

// v3.1 — Sync Engine: repite un progreso encolado al volver la conexión.
syncManager.registerHandler('history:upsertProgress', (payload) =>
  rawUpsertProgress(payload.accountId, payload.profileId, payload.entry),
)

/**
 * v3.1 — Sync Engine: con conexión, comportamiento idéntico a siempre
 * (upsert inmediato); sin conexión, encola el progreso y resuelve
 * optimista — el reproductor no necesita saber que está offline, sigue
 * escribiendo cada ~15s como si nada (ver `components/player/
 * useWatchProgress.js`), y la última entrada encolada por episodio
 * reemplaza a la anterior (nunca se acumulan escrituras intermedias).
 */
export async function upsertProgress(accountId, profileId, entry) {
  if (!isSupabaseConfigured || !accountId || !profileId) throw new Error(GENERIC_ERROR)
  const { malId, episodeNumber } = entry
  return syncManager.run(
    {
      type: 'history:upsertProgress',
      key: `history:${profileId}:${malId}:${episodeNumber}`,
      payload: { accountId, profileId, entry },
      ownErrorMessage: GENERIC_ERROR,
    },
    () => rawUpsertProgress(accountId, profileId, entry),
  )
}
