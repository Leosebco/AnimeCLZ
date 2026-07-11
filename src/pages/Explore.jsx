import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import Container from '@/components/ui/Container'
import Modal from '@/components/ui/Modal'
import QuickFilters from '@/components/catalog/QuickFilters'
import AdvancedFiltersPanel from '@/components/catalog/AdvancedFiltersPanel'
import MovieGrid from '@/components/catalog/MovieGrid'
import Pagination from '@/components/catalog/Pagination'
import useFetch from '@/hooks/useFetch'
import { discoverAnime } from '@/providers/AnimeProvider'
import { ORDER_OPTIONS } from '@/constants'

/**
 * `filters` sigue siendo el único estado que dispara el fetch — `QuickFilters`
 * (fila compacta, solo desktop) lo muta en vivo, igual que los chips de
 * siempre. El Drawer "Filtros" (set completo, `AdvancedFiltersPanel`) usa un
 * borrador aparte (`draftFilters`), sembrado desde `filters` cada vez que se
 * abre — "Aplicar" lo copia a `filters`; "Limpiar filtros" solo vacía el
 * borrador; cerrar sin aplicar (X/backdrop/Escape) lo descarta sin más.
 */
function Explore() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({ genre: searchParams.get('genre') || undefined })
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState(filters)
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

  const openDrawer = () => {
    setDraftFilters(filters)
    setDrawerOpen(true)
  }

  const handleApplyDraft = () => {
    handleFiltersChange(draftFilters)
    setDrawerOpen(false)
  }

  return (
    <Container className="pt-28 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Explorar</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Descubre anime por género, formato, estado, año y puntuación.
          </p>
        </div>
        <button
          type="button"
          onClick={openDrawer}
          aria-label="Filtros"
          className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-text transition-colors hover:border-primary/60"
        >
          <SlidersHorizontal size={16} aria-hidden />
          Filtros
        </button>
      </div>

      <QuickFilters value={filters} onChange={handleFiltersChange} className="mt-6" />

      <div className="mt-8">
        <MovieGrid movies={data?.data} loading={loading} error={error} onRetry={refetch} />
      </div>

      {!loading && !error && data?.data?.length > 0 && (
        <Pagination page={page} hasNextPage={data.pagination.hasNextPage} onChange={setPage} />
      )}

      <Modal open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Filtros" variant="drawer">
        <AdvancedFiltersPanel value={draftFilters} onChange={setDraftFilters} />
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setDraftFilters({})}
            className="flex min-h-11 items-center px-2 text-sm text-text-secondary transition-colors hover:text-text"
          >
            Limpiar filtros
          </button>
          <button
            type="button"
            onClick={handleApplyDraft}
            className="flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Aplicar
          </button>
        </div>
      </Modal>
    </Container>
  )
}

export default Explore
