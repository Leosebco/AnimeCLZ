import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Container from '@/components/ui/Container'
import Filters from '@/components/catalog/Filters'
import MovieGrid from '@/components/catalog/MovieGrid'
import Pagination from '@/components/catalog/Pagination'
import useFetch from '@/hooks/useFetch'
import { discoverAnime } from '@/services/animeService'
import { ORDER_OPTIONS } from '@/constants'

function Explore() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({ genre: searchParams.get('genre') || undefined })
  const [page, setPage] = useState(1)
  const order = ORDER_OPTIONS.find((option) => option.value === (filters.order || 'popularity'))

  const { data, loading, error, refetch } = useFetch(
    (signal) =>
      discoverAnime(
        {
          genre: filters.genre,
          type: filters.type,
          status: filters.status,
          minScore: filters.minScore,
          year: filters.year,
          orderBy: order.orderBy,
          sort: order.sort,
          page,
          limit: 20,
        },
        signal,
      ),
    [filters.genre, filters.type, filters.status, filters.minScore, filters.year, filters.order, page],
    { cacheKey: `explore:${JSON.stringify(filters)}:${page}` },
  )

  const handleFiltersChange = (next) => {
    setFilters(next)
    setPage(1)
  }

  return (
    <Container className="pt-28 pb-16">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Explorar</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Descubre anime por género, formato, estado, año y puntuación.
      </p>

      <Filters value={filters} onChange={handleFiltersChange} className="mt-6" />

      <div className="mt-8">
        <MovieGrid movies={data?.data} loading={loading} error={error} onRetry={refetch} />
      </div>

      {!loading && !error && data?.data?.length > 0 && (
        <Pagination page={page} hasNextPage={data.pagination.hasNextPage} onChange={setPage} />
      )}
    </Container>
  )
}

export default Explore
