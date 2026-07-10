import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const GENERIC_ERROR = 'No pudimos cargar tu historial. Inténtalo nuevamente.'

/**
 * "Continuar viendo". Preparado para cuando exista un reproductor real
 * (fase "Streaming" del ROADMAP) — hoy ninguna pantalla llama a
 * upsertProgress, así que watch_history estará vacío en la práctica.
 *
 * v1.5: el scope real pasó de ser por CUENTA (`user_id`) a ser por PERFIL
 * (`profile_id`, migración 0021) — mismo criterio que favoritesService/
 * watchLaterService.
 */
export async function listHistory(profileId) {
  if (!isSupabaseConfigured || !profileId) return []
  const { data, error } = await supabase
    .from('watch_history')
    .select('mal_id, episode_number, seconds_watched, title, poster, updated_at')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false })
  if (error) throw new Error(GENERIC_ERROR)
  return data.map((row) => ({
    id: row.mal_id,
    episodeNumber: row.episode_number,
    secondsWatched: row.seconds_watched,
    title: row.title,
    poster: row.poster,
    updatedAt: row.updated_at,
  }))
}

export async function upsertProgress(
  accountId,
  profileId,
  { malId, episodeNumber, secondsWatched, title, poster },
) {
  if (!isSupabaseConfigured || !accountId || !profileId) throw new Error(GENERIC_ERROR)
  const { error } = await supabase.from('watch_history').upsert(
    {
      user_id: accountId,
      profile_id: profileId,
      mal_id: malId,
      episode_number: episodeNumber,
      seconds_watched: secondsWatched,
      title,
      poster,
    },
    { onConflict: 'profile_id,mal_id,episode_number' },
  )
  if (error) throw new Error(GENERIC_ERROR)
}
