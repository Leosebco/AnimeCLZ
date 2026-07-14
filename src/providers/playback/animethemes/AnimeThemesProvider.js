import api from '@/api/animethemes'
import { createVideoSource } from '../../models'
import { resolveEpisodeCoverage } from '../rangeUtils'
import { getCached, setCached } from '@/utils/cache'

/**
 * Adaptador REAL de AnimeThemes para el `PlaybackProviderManager` (v2.1) —
 * base de datos abierta y de licencia permisiva de openings/endings de
 * anime (`api.animethemes.moe`). Sin scraping: todo campo viene de una
 * query real contra esa API pública, verificada en vivo con `curl` antes
 * de escribir este archivo (ver CLAUDE.md para la respuesta real completa
 * de ejemplo, Naruto/mal_id 20).
 *
 * **Límite de alcance real, no un bug**: AnimeThemes solo tiene clips de
 * openings/endings (~90s), nunca episodios completos — no existe hoy
 * ninguna fuente legal y pública de episodios completos para conectar. Ver
 * CLAUDE.md ("Sistema de reproducción") para el detalle de esta decisión.
 */

const CATALOG_TTL = 6 * 60 * 60 * 1000

// AnimeThemes no tiene un endpoint "dame las fuentes del episodio N" — solo
// un catálogo completo por anime, con cada tema/entrada declarando el rango
// de episodios que cubrió. Se cachea acá (independiente de la caché propia
// de PlaybackProviderManager, que cachea por método+clave) para que abrir
// varios episodios del mismo anime dispare una sola llamada de red real,
// sin importar si el primer llamador fue `getEpisodes` o `getSources`.
async function fetchThemesCatalog(animeId, signal) {
  const cacheKey = `animethemes:catalog:${animeId}`
  const cached = getCached(cacheKey)
  if (cached !== undefined) return cached

  const response = await api.get('/anime', {
    params: {
      'filter[has]': 'resources',
      'filter[site]': 'MyAnimeList',
      'filter[external_id]': animeId,
      include: 'animethemes.animethemeentries.videos,animethemes.song',
      'page[size]': 1,
    },
    signal,
  })

  const anime = response.data?.anime?.[0]
  const themes = (anime?.animethemes || []).map((theme) => ({
    id: theme.id,
    type: theme.type, // 'OP' | 'ED'
    sequence: theme.sequence,
    slug: theme.slug,
    songTitle: theme.song?.title || null,
    entries: (theme.animethemeentries || []).map((entry) => ({
      id: entry.id,
      episodesLabel: entry.episodes,
      version: entry.version,
      videos: (entry.videos || []).map((video) => ({
        id: video.id,
        resolution: video.resolution,
        source: video.source,
        subbed: Boolean(video.subbed),
        nc: Boolean(video.nc),
        link: video.link,
      })),
    })),
  }))

  setCached(cacheKey, themes, CATALOG_TTL)
  return themes
}

/**
 * Catálogo propio del proveedor (todas las entradas OP/ED con su rango de
 * episodios) — responde "¿qué tiene AnimeThemes para reproducir de este
 * anime?", distinto de `ProviderManager.getEpisodes()` (metadatos de
 * Jikan/AniList: número/título/fecha).
 */
export async function getEpisodes(animeId, signal) {
  return fetchThemesCatalog(animeId, signal)
}

function mapEntryVideos(theme, entry) {
  return entry.videos.map((video) =>
    createVideoSource({
      id: `animethemes:${video.id}`,
      provider: 'animethemes',
      // No hay múltiples hosts reales que distinguir — "servidor" se
      // reutiliza para identificar el clip en sí.
      servidor: theme.songTitle ? `${theme.slug} · ${theme.songTitle}` : theme.slug,
      calidad: video.resolution ? `${video.resolution}p` : null,
      url: video.link,
      subtitleLanguages: [],
      // Dato real, no inventado: son clips originales de la emisión
      // japonesa, nunca doblajes.
      audioLanguage: 'ja',
      preview: null,
    }),
  )
}

/**
 * Fuentes reproducibles para un episodio puntual — filtra en memoria (vía
 * `rangeUtils.resolveEpisodeCoverage`) el catálogo ya cacheado, sin una
 * segunda llamada de red.
 */
export async function getSources(animeId, episodeNumber, signal) {
  const themes = await fetchThemesCatalog(animeId, signal)
  const matches = resolveEpisodeCoverage(themes, Number(episodeNumber))

  const sources = matches.flatMap(({ theme, entry }) => mapEntryVideos(theme, entry))

  return {
    sources,
    subtitleLanguages: [],
    audioLanguages: sources.length ? ['ja'] : [],
    info: {
      themes: matches.map(({ theme, entry }) => ({
        type: theme.type,
        slug: theme.slug,
        songTitle: theme.songTitle,
        episodes: entry.episodesLabel,
      })),
    },
  }
}
