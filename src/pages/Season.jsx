import { useState } from 'react'
import Container from '@/components/ui/Container'
import MovieGrid from '@/components/catalog/MovieGrid'
import Pagination from '@/components/catalog/Pagination'
import useFetch from '@/hooks/useFetch'
import { getCurrentSeason } from '@/providers/AnimeProvider'

function Season() {
  const [page, setPage] = useState(1)

  const { data, loading, error, refetch } = useFetch(
    (signal) => getCurrentSeason({ page, limit: 20 }, signal),
    [page],
    { cacheKey: `season:${page}` },
  )

  return (
    <Container className="pt-28 pb-16">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Temporada actual</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Todo lo que se está emitiendo esta temporada.
      </p>

      <div className="mt-8">
        <MovieGrid movies={data?.data} loading={loading} error={error} onRetry={refetch} />
      </div>

      {!loading && !error && data?.data?.length > 0 && (
        <Pagination page={page} hasNextPage={data.pagination.hasNextPage} onChange={setPage} />
      )}
    </Container>
  )
}

export default Season
