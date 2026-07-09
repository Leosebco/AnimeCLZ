import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import TableToolbar from '@/components/admin/TableToolbar'
import DataTable from '@/components/admin/DataTable'
import Select from '@/components/ui/Select'
import Pagination from '@/components/catalog/Pagination'
import useFetch from '@/hooks/useFetch'
import { discoverAnime } from '@/providers/AnimeProvider'
import { ANIME_TYPES, ANIME_STATUS, STATUS_LABELS, animeDetailPath } from '@/constants'

const TYPE_OPTIONS = [{ value: '', label: 'Todos los formatos' }, ...ANIME_TYPES]
const STATUS_OPTIONS = [{ value: '', label: 'Todos los estados' }, ...ANIME_STATUS]

const COLUMNS = [
  {
    key: 'poster',
    label: '',
    render: (row) => (
      <img src={row.posterSmall || row.poster} alt="" className="h-14 w-10 rounded-lg object-cover" />
    ),
  },
  {
    key: 'title',
    label: 'Título',
    render: (row) => (
      <Link to={animeDetailPath(row.id)} className="font-medium text-text hover:text-primary">
        {row.title}
      </Link>
    ),
  },
  { key: 'type', label: 'Formato' },
  { key: 'episodes', label: 'Episodios' },
  {
    key: 'score',
    label: 'Score',
    render: (row) => (typeof row.score === 'number' ? row.score.toFixed(1) : '—'),
  },
  {
    key: 'status',
    label: 'Estado',
    render: (row) => STATUS_LABELS[row.status] || row.status || '—',
  },
]

/**
 * Catálogo de solo lectura, con datos reales de Jikan (mismo servicio que
 * Explorar). El CRUD real (crear/editar un anime propio) necesita una
 * tabla local en Supabase que todavía no existe — ver nota de arquitectura
 * en CLAUDE.md/animeService.js.
 */
function Animes() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, loading, error, refetch } = useFetch(
    (signal) => discoverAnime({ query: search, type, status, page, limit: 10 }, signal),
    [search, type, status, page],
    { cacheKey: `admin:animes:${search}:${type}:${status}:${page}` },
  )

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleTypeChange = (value) => {
    setType(value)
    setPage(1)
  }

  const handleStatusChange = (value) => {
    setStatus(value)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Animes" description="Catálogo de Jikan, en modo lectura." />

      <TableToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar anime por título..."
        filters={
          <>
            <Select value={type} onChange={handleTypeChange} options={TYPE_OPTIONS} ariaLabel="Filtrar por formato" />
            <Select value={status} onChange={handleStatusChange} options={STATUS_OPTIONS} ariaLabel="Filtrar por estado" />
          </>
        }
      />

      <DataTable
        columns={COLUMNS}
        rows={data?.data || []}
        loading={loading}
        error={error}
        onRetry={refetch}
        empty={{
          title: 'Sin resultados',
          description: 'Ningún anime coincide con esta búsqueda.',
        }}
      />

      {!loading && !error && data?.data?.length > 0 && (
        <Pagination page={page} hasNextPage={data.pagination.hasNextPage} onChange={setPage} />
      )}
    </div>
  )
}

export default Animes
