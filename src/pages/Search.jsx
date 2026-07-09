import { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import Container from '@/components/ui/Container'
import Filters from '@/components/catalog/Filters'
import MovieGrid from '@/components/catalog/MovieGrid'
import Pagination from '@/components/catalog/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import useFetch from '@/hooks/useFetch'
import useDebounce from '@/hooks/useDebounce'
import { searchAnime } from '@/services/animeService'
import { ORDER_OPTIONS } from '@/constants'

function Search() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(1)
  const debouncedQuery = useDebounce(query, 450)
  const trimmedQuery = debouncedQuery.trim()
  const hasQuery = trimmedQuery.length > 0

  // Only forward an order to Jikan if the user explicitly picked one — a
  // forced default sort on top of a text search adds avoidable load to
  // MAL's already-fragile search backend for no real benefit (relevance,
  // which Jikan/MAL sort by default, is what a name search actually wants).
  const order = filters.order ? ORDER_OPTIONS.find((option) => option.value === filters.order) : null

  const { data, loading, error, refetch } = useFetch(
    (signal) =>
      hasQuery
        ? searchAnime(
            trimmedQuery,
            {
              genre: filters.genre,
              type: filters.type,
              year: filters.year,
              orderBy: order?.orderBy,
              sort: order?.sort,
              page,
              limit: 20,
            },
            signal,
          )
        : Promise.resolve({ data: [], pagination: { hasNextPage: false } }),
    [trimmedQuery, filters.genre, filters.type, filters.year, filters.order, page],
  )

  const handleQueryChange = (event) => {
    setQuery(event.target.value)
    setPage(1)
  }

  const handleFiltersChange = (next) => {
    setFilters(next)
    setPage(1)
  }

  return (
    <Container className="pt-28 pb-16">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Buscar</h1>

      <div className="relative mt-6 max-w-xl">
        <SearchIcon
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
          size={18}
        />
        <input
          type="search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Busca un anime por título..."
          aria-label="Buscar anime"
          className="w-full rounded-full border border-border bg-surface-hover py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-secondary transition-colors focus-visible:outline-2 focus-visible:outline-primary"
        />
      </div>

      <Filters value={filters} onChange={handleFiltersChange} className="mt-4" />

      <div className="mt-8" aria-live="polite">
        {!hasQuery ? (
          <EmptyState
            title="Busca tu próximo anime"
            description="Escribe un título para empezar a buscar en nuestro catálogo."
          />
        ) : (
          <MovieGrid
            movies={data?.data}
            loading={loading}
            error={error}
            onRetry={refetch}
            errorMessage="No fue posible completar la búsqueda. El servidor está ocupado — inténtalo nuevamente."
            emptyMessage={`No encontramos resultados para "${trimmedQuery}". Prueba con otro título o revisa la ortografía.`}
          />
        )}
      </div>

      {hasQuery && !loading && !error && data?.data?.length > 0 && (
        <Pagination page={page} hasNextPage={data.pagination.hasNextPage} onChange={setPage} />
      )}
    </Container>
  )
}

export default Search
