import Hero from '@/components/home/Hero'
import MovieRow from '@/components/movie/MovieRow'
import ExploreBanner from '@/components/home/ExploreBanner'
import GenreNav from '@/components/home/GenreNav'
import useFetch from '@/hooks/useFetch'
import {
  getFeaturedAnime,
  getTopRated,
  getCurrentSeason,
  getMostPopular,
  getBestRated,
  getRecommendations,
} from '@/services/animeService'

// Home fires 6 independent queries on mount. Request pacing/concurrency is
// handled centrally by the queue in api/jikan.js — no manual staggering
// needed here.
function Home() {
  const hero = useFetch((signal) => getFeaturedAnime(signal), [], {
    cacheKey: 'home:featured',
    cacheTTL: 2 * 60 * 1000,
  })

  const topAnime = useFetch((signal) => getTopRated({ limit: 12 }, signal), [], {
    cacheKey: 'home:top-anime',
  })
  const season = useFetch((signal) => getCurrentSeason({ limit: 12 }, signal), [], {
    cacheKey: 'home:season',
  })
  const popular = useFetch((signal) => getMostPopular({ limit: 12 }, signal), [], {
    cacheKey: 'home:popular',
  })
  const bestRated = useFetch((signal) => getBestRated({ limit: 12 }, signal), [], {
    cacheKey: 'home:best-rated',
  })
  const recommended = useFetch((signal) => getRecommendations({ limit: 12 }, signal), [], {
    cacheKey: 'home:recommended',
  })

  const sections = [
    { title: '🏆 Top Anime', ...topAnime },
    { title: '📅 Temporada Actual', ...season },
    { title: '📈 Más Populares', ...popular },
    { title: '⭐ Mejor Valorados', ...bestRated },
    { title: '💡 Recomendados', ...recommended },
  ]

  return (
    <>
      <Hero anime={hero.data} loading={hero.loading} error={hero.error} onRetry={hero.refetch} />

      <div className="relative z-10">
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
