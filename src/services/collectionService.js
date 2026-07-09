import { supabase, isSupabaseConfigured } from '@/lib/supabase'

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
 */
export function createCollectionService(table) {
  async function list(userId) {
    if (!isSupabaseConfigured || !userId) return []
    const { data, error } = await supabase
      .from(table)
      .select('mal_id, title, poster, poster_small, type, year, score, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(GENERIC_ERROR)
    return data.map(fromRow)
  }

  async function add(userId, anime) {
    if (!isSupabaseConfigured || !userId) throw new Error(GENERIC_ERROR)
    const { error } = await supabase
      .from(table)
      .upsert({ user_id: userId, ...toRow(anime) }, { onConflict: 'user_id,mal_id' })
    if (error) throw new Error(GENERIC_ERROR)
  }

  async function remove(userId, malId) {
    if (!isSupabaseConfigured || !userId) throw new Error(GENERIC_ERROR)
    const { error } = await supabase.from(table).delete().eq('user_id', userId).eq('mal_id', malId)
    if (error) throw new Error(GENERIC_ERROR)
  }

  return { list, add, remove }
}
