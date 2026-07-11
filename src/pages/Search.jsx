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
import { getTrending } from '@/providers/AnimeProvider'
import { searchAll } from '@/services/searchService'
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '@/utils/recentSearches'
import { ORDER_OPTIONS } from '@/constants'

const CHARACTER_GRID = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'

/**
 * Rediseño v1.7: barra de búsqueda → Tendencias/Búsquedas recientes (solo
 * sin una búsqueda activa) → botón "Filtros" (abre `Filters.jsx` dentro del
 * `Modal.jsx` ya existente, no un drawer nuevo) → resultados agrupados en
 * "Anime" y "Personajes" (`searchService.searchAll`, AniList primero con
 * Jikan de respaldo — ver ese archivo). Sin paginación: una búsqueda de
 * texto combinando dos fuentes ya trae un conjunto acotado y bien
 * ordenado por relevancia (mismo criterio que AniList/Crunchyroll, que
 * tampoco paginan resultados de búsqueda en profundidad) — Explorar sigue
 * siendo la pantalla para hojear el catálogo completo con paginación real.
 */
function Search() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches())
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
      cacheTTL: 3 * 60 * 1000,
    },
  )

  const { data: trending, loading: trendingLoading, error: trendingError, refetch: refetchTrending } = useFetch(
    (signal) => (!hasQuery ? getTrending({ limit: 12 }, signal) : Promise.resolve({ data: [] })),
    [hasQuery],
    { cacheKey: !hasQuery ? 'search:trending' : undefined, cacheTTL: 10 * 60 * 1000 },
  )

  useEffect(() => {
    if (hasQuery) setRecentSearches(addRecentSearch(trimmedQuery))
  }, [trimmedQuery, hasQuery])

  const handleQueryChange = (event) => setQuery(event.target.value)
  const handleFiltersChange = (next) => setFilters(next)
  const handleClearRecent = () => {
    clearRecentSearches()
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
        <Filters value={filters} onChange={handleFiltersChange} />
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
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
