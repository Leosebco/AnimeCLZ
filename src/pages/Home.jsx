import { useMemo } from 'react'
import Hero from '@/components/home/Hero'
import MovieRow from '@/components/movie/MovieRow'
import ExploreBanner from '@/components/home/ExploreBanner'
import GenreNav from '@/components/home/GenreNav'
import useFetch from '@/hooks/useFetch'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { getHomeRecommendations, RECOMMENDATIONS_CACHE_TTL } from '@/services/recommendation/recommendationEngine'
import {
  getFeaturedSlides,
  getTopRated,
  getCurrentSeason,
  getMostPopular,
  getBestRated,
  getRecommendations,
} from '@/providers/AnimeProvider'

// Home fires 6 independent queries on mount. Request pacing/concurrency is
// handled centrally by the queue in api/jikan.js — no manual staggering
// needed here.
//
// Section order matches the requested layout as closely as real data
// allows. "Nuevos episodios" and "Noticias" are intentionally NOT here yet
// — they'd need a per-anime episode feed or a news feed Jikan doesn't
// provide. Showing them with fabricated content would break the "never
// invent data" rule, so they wait for real data instead of a fake
// placeholder. See ROADMAP.md.
//
// v2.6 — "Continuar viendo" ya no está en esa lista de pendientes: desde
// v2.1 existe un escritor real de `watch_history` (`Watch.jsx`), y este
// sprint agrega el primer RecommendationEngine (`services/recommendation/`,
// sin tocar este archivo salvo para AGREGAR filas nuevas — las 5 filas de
// abajo siguen exactamente iguales). Las filas personalizadas usan el
// mismo candidatePool que estas 5 secciones ya cargan, así que no disparan
// ninguna consulta nueva de catálogo — solo Supabase (favoritos/historial/
// Mi Lista, ya usados en otras pantallas) y un enriquecimiento acotado de
// géneros/estudios (ver recommendationEngine.js).
function Home() {
  const { isAuthenticated } = useAuth()
  const { activeProfile } = useProfile()
  const profileId = activeProfile?.id

  const hero = useFetch((signal) => getFeaturedSlides({ count: 6 }, signal), [], {
    cacheKey: 'home:featured-slides',
    cacheTTL: 2 * 60 * 1000,
  })

  const topAnime = useFetch((signal) => getTopRated({ limit: 12 }, signal), [], {
    cacheKey: 'home:top-anime',
  })
  const season = useFetch((signal) => getCurrentSeason({ limit: 12 }, signal), [], {
    cacheKey: 'home:season',
  })
  const recommended = useFetch((signal) => getRecommendations({ limit: 12 }, signal), [], {
    cacheKey: 'home:recommended',
  })
  const popular = useFetch((signal) => getMostPopular({ limit: 12 }, signal), [], {
    cacheKey: 'home:popular',
  })
  const bestRated = useFetch((signal) => getBestRated({ limit: 12 }, signal), [], {
    cacheKey: 'home:best-rated',
  })

  // v2.6 — pool de candidatos para el RecommendationEngine: reusa estas
  // mismas 5 respuestas ya cargadas (sin una sola consulta de catálogo
  // nueva, ver FASE 8 del sprint). Solo se arma una vez que las 5
  // terminaron de cargar, para no recalcular el pool en cada resolución
  // parcial.
  const catalogReady = ![topAnime, season, recommended, popular, bestRated].some((section) => section.loading)
  const candidatePool = useMemo(() => {
    if (!catalogReady) return []
    return [
      ...(topAnime.data?.data || []),
      ...(season.data?.data || []),
      ...(recommended.data?.data || []),
      ...(popular.data?.data || []),
      ...(bestRated.data?.data || []),
    ]
  }, [catalogReady, topAnime.data, season.data, recommended.data, popular.data, bestRated.data])

  const recommendationsEnabled = isAuthenticated && Boolean(profileId) && catalogReady
  const recommendations = useFetch(
    (signal) =>
      recommendationsEnabled
        ? getHomeRecommendations({ profileId, candidatePool, signal })
        : Promise.resolve([]),
    [recommendationsEnabled, profileId, candidatePool],
    {
      cacheKey: recommendationsEnabled ? `home:recommendations:${profileId}` : undefined,
      cacheTTL: RECOMMENDATIONS_CACHE_TTL,
    },
  )

  const sections = [
    { title: '🏆 Top Anime', ...topAnime },
    { title: '📅 Temporada Actual', ...season },
    { title: '💡 Recomendados', ...recommended },
    { title: '📈 Más Populares', ...popular },
    { title: '⭐ Mejor Valorados', ...bestRated },
  ]

  return (
    <>
      <Hero
        slides={hero.data}
        loading={hero.loading}
        error={hero.error}
        onRetry={hero.refetch}
      />

      <div className="relative z-10">
        {/* v2.6 — filas personalizadas (RecommendationEngine), nunca
            visibles para un visitante sin perfil activo — mismo criterio
            de silencio que ya usa MovieRow para filas vacías (sin
            `emptyState`, se ocultan solas en vez de mostrar un hueco). */}
        {(recommendations.data || []).map((row) => (
          <MovieRow key={row.id} title={row.title} movies={row.items} loading={false} error={null} />
        ))}

        {sections.map((section) => (
          <MovieRow
            key={section.title}
            title={section.title}
            movies={section.data?.data}
            loading={section.loading}
            error={section.error}
            onRetry={section.refetch}
          />
        ))}

        <ExploreBanner />
        <GenreNav />
      </div>
    </>
  )
}

export default Home
