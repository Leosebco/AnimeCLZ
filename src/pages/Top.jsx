import { useState } from 'react'
import Container from '@/components/ui/Container'
import MovieGrid from '@/components/catalog/MovieGrid'
import Pagination from '@/components/catalog/Pagination'
import useFetch from '@/hooks/useFetch'
import { getTopRated } from '@/services/animeService'

function Top() {
  const [page, setPage] = useState(1)

  const { data, loading, error, refetch } = useFetch(
    (signal) => getTopRated({ page, limit: 20 }, signal),
    [page],
    { cacheKey: `top:${page}` },
  )

  return (
    <Container className="pt-28 pb-16">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Mejor puntuados</h1>
      <p className="mt-1 text-sm text-text-secondary">
        El ranking de anime mejor valorado de nuestro catálogo.
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

export default Top
