import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react'
import Container from '@/components/ui/Container'
import Filters from '@/components/catalog/Filters'
import Modal from '@/components/ui/Modal'
import MovieGrid from '@/components/catalog/MovieGrid'
import MovieRow from '@/components/movie/MovieRow'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import AvatarCandidateCard from '@/components/profile/AvatarCandidateCard'
import useFetch from '@/hooks/useFetch'
import useDebounce from '@/hooks/useDebounce'
import { getTrending, getTopRated, getCurrentSeason, getRecommendations } from '@/providers/AnimeProvider'
import { searchAll } from '@/services/searchService'
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '@/utils/recentSearches'
import { useProfile } from '@/hooks/useProfile'
import { ORDER_OPTIONS } from '@/constants'

const CHARACTER_GRID = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'

/**
 * Rediseño v1.7, motor híbrido desde v2.4: barra de búsqueda → Tendencias/
 * Top Rated/Temporada/Recomendados + Búsquedas recientes (solo sin una
 * búsqueda activa, ver v2.4 más abajo) → botón "Filtros" (abre
 * `Filters.jsx` dentro del `Modal.jsx` ya existente, con géneros en
 * acordeón desde v2.4) → resultados agrupados en "Anime" y "Personajes"
 * (`searchService.searchAll` — fusión real AniList+Jikan y ranking propio
 * desde v2.4, ver ese archivo). Sin paginación: una búsqueda de texto
 * combinando dos fuentes ya trae un conjunto acotado y bien ordenado por
 * relevancia (mismo criterio que AniList/Crunchyroll) — Explorar sigue
 * siendo la pantalla para hojear el catálogo completo con paginación real.
 *
 * v2.4 — "Búsquedas recientes" pasa a ser por perfil (antes localStorage
 * global, ver `utils/recentSearches.js`) y la pantalla vacía ahora también
 * muestra Top Rated/Temporada/Recomendados junto a Tendencias — pedido
 * explícito del sprint ("no dejar la pantalla vacía").
 */
function Search() {
  const [searchParams] = useSearchParams()
  const { activeProfile } = useProfile()
  const profileId = activeProfile?.id
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches(profileId))
  const debouncedQuery = useDebounce(query, 300)
  const trimmedQuery = debouncedQuery.trim()
  const hasQuery = trimmedQuery.length > 0

  const order = filters.order ? ORDER_OPTIONS.find((option) => option.value === filters.order) : null

  const { data, loading, error, refetch } = useFetch(
    (signal) =>
      hasQuery
        ? searchAll(
            trimmedQuery,
            {
              genre: filters.genre,
              type: filters.type,
              status: filters.status,
              minScore: filters.minScore,
              year: filters.year,
              orderBy: order?.orderBy,
              sort: order?.sort,
            },
            signal,
          )
        : Promise.resolve({ anime: [], characters: [], degraded: false }),
    [trimmedQuery, filters.genre, filters.type, filters.status, filters.minScore, filters.year, filters.order],
    {
      cacheKey: hasQuery ? `search:${trimmedQuery}:${JSON.stringify(filters)}` : undefined,
      // v2.4 — 10 minutos (antes 3): docs/11_SEARCH_ENGINE.md especifica
      // "búsquedas repetidas: 10 minutos"; el motor híbrido nuevo paga
      // siempre el costo de consultar AniList+Jikan (ver searchService.js),
      // así que cachear más tiempo evita repetir ese costo por una
      // consulta ya resuelta hace poco.
      cacheTTL: 10 * 60 * 1000,
    },
  )

  const { data: trending, loading: trendingLoading, error: trendingError, refetch: refetchTrending } = useFetch(
    (signal) => (!hasQuery ? getTrending({ limit: 12 }, signal) : Promise.resolve({ data: [] })),
    [hasQuery],
    { cacheKey: !hasQuery ? 'search:trending' : undefined, cacheTTL: 10 * 60 * 1000 },
  )

  // v2.4 — Top Rated/Temporada/Recomendados: mismo criterio que Tendencias
  // de arriba, reusando funciones que ya existían en animeService.js (sin
  // tocar ProviderManager) — la pantalla vacía nunca debe sentirse vacía.
  const { data: topRated, loading: topRatedLoading, error: topRatedError, refetch: refetchTopRated } = useFetch(
    (signal) => (!hasQuery ? getTopRated({ limit: 12 }, signal) : Promise.resolve({ data: [] })),
    [hasQuery],
    { cacheKey: !hasQuery ? 'search:topRated' : undefined, cacheTTL: 10 * 60 * 1000 },
  )
  const { data: seasonal, loading: seasonalLoading, error: seasonalError, refetch: refetchSeasonal } = useFetch(
    (signal) => (!hasQuery ? getCurrentSeason({ limit: 12 }, signal) : Promise.resolve({ data: [] })),
    [hasQuery],
    { cacheKey: !hasQuery ? 'search:seasonal' : undefined, cacheTTL: 10 * 60 * 1000 },
  )
  const {
    data: recommended,
    loading: recommendedLoading,
    error: recommendedError,
    refetch: refetchRecommended,
  } = useFetch(
    (signal) => (!hasQuery ? getRecommendations({ limit: 12 }, signal) : Promise.resolve({ data: [] })),
    [hasQuery],
    { cacheKey: !hasQuery ? 'search:recommended' : undefined, cacheTTL: 10 * 60 * 1000 },
  )

  // Recarga la lista guardada del perfil activo cada vez que cambia — sin
  // esto, cambiar de perfil dejaría viendo las búsquedas recientes del
  // perfil anterior hasta la próxima búsqueda (violaría "nunca compartir
  // búsquedas entre perfiles").
  useEffect(() => {
    setRecentSearches(getRecentSearches(profileId))
  }, [profileId])

  useEffect(() => {
    if (hasQuery) setRecentSearches(addRecentSearch(trimmedQuery, profileId))
  }, [trimmedQuery, hasQuery, profileId])

  const handleQueryChange = (event) => setQuery(event.target.value)
  const handleFiltersChange = (next) => setFilters(next)
  const handleClearRecent = () => {
    clearRecentSearches(profileId)
    setRecentSearches([])
  }

  const noResults = !loading && !error && !data?.degraded && data?.anime.length === 0 && data?.characters.length === 0
  const showFriendlyError = !loading && (error || data?.degraded)

  return (
    <Container className="pt-28 pb-16">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Buscar</h1>

      <div className="mt-6 flex items-center gap-3">
        <div className="relative flex-1 origin-left transition-transform duration-200 focus-within:scale-[1.01]">
          <SearchIcon
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary"
            size={20}
          />
          <input
            type="search"
            value={query}
            onChange={handleQueryChange}
            placeholder="Busca un anime o personaje..."
            aria-label="Buscar anime o personaje"
            className="w-full rounded-full border border-border bg-card py-4 pl-13 pr-5 text-base text-text placeholder:text-text-secondary transition-colors duration-200 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-label="Filtros"
          className="flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-text transition-colors hover:border-primary/60 sm:min-w-0"
        >
          <SlidersHorizontal size={18} aria-hidden />
          <span className="hidden sm:inline">Filtros</span>
        </button>
      </div>

      <div className="mt-8" aria-live="polite">
        {!hasQuery && (
          <div className="flex flex-col gap-10">
            {recentSearches.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-text">Búsquedas recientes</h2>
                  <button
                    type="button"
                    onClick={handleClearRecent}
                    className="flex min-h-11 items-center px-2 text-xs text-text-secondary transition-colors hover:text-text"
                  >
                    Borrar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-text-secondary transition-colors hover:border-primary/60 hover:text-text"
                    >
                      <Clock size={14} aria-hidden />
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <MovieRow
              title="Tendencias"
              movies={trending?.data}
              loading={trendingLoading}
              error={trendingError}
              onRetry={refetchTrending}
            />
            <MovieRow
              title="Mejor puntuados"
              movies={topRated?.data}
              loading={topRatedLoading}
              error={topRatedError}
              onRetry={refetchTopRated}
            />
            <MovieRow
              title="Temporada actual"
              movies={seasonal?.data}
              loading={seasonalLoading}
              error={seasonalError}
              onRetry={refetchSeasonal}
            />
            <MovieRow
              title="Recomendados"
              movies={recommended?.data}
              loading={recommendedLoading}
              error={recommendedError}
              onRetry={refetchRecommended}
            />
          </div>
        )}

        {hasQuery && loading && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        )}

        {hasQuery && showFriendlyError && (
          <EmptyState
            title="No pudimos completar la búsqueda"
            description="Estamos teniendo problemas para conectar con nuestras fuentes de datos. Probá de nuevo en unos segundos."
            onRetry={refetch}
          />
        )}

        {hasQuery && noResults && (
          <EmptyState
            title={`Sin resultados para "${trimmedQuery}"`}
            description="Probá con otro título o revisá la ortografía."
          />
        )}

        {hasQuery && !loading && !showFriendlyError && !noResults && (
          <div className="flex flex-col gap-10">
            {data.anime.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-lg font-semibold text-text">Anime</h2>
                <MovieGrid movies={data.anime} loading={false} error={null} />
              </section>
            )}

            {data.characters.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-lg font-semibold text-text">Personajes</h2>
                <div className={CHARACTER_GRID}>
                  {data.characters.map((character) => (
                    <AvatarCandidateCard key={character.id} character={character} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros">
        <Filters value={filters} onChange={handleFiltersChange} collapsibleGenres />
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            <X size={16} aria-hidden />
            Cerrar
          </button>
        </div>
      </Modal>
    </Container>
  )
}

export default Search
