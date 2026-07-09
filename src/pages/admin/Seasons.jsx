import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import TableToolbar from '@/components/admin/TableToolbar'
import DataTable from '@/components/admin/DataTable'
import Select from '@/components/ui/Select'
import Pagination from '@/components/catalog/Pagination'
import useFetch from '@/hooks/useFetch'
import { getCurrentSeason } from '@/providers/AnimeProvider'
import { ANIME_TYPES, STATUS_LABELS, animeDetailPath } from '@/constants'

const TYPE_OPTIONS = [{ value: '', label: 'Todos los formatos' }, ...ANIME_TYPES]

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
  { key: 'year', label: 'Año' },
  {
    key: 'status',
    label: 'Estado',
    render: (row) => STATUS_LABELS[row.status] || row.status || '—',
  },
]

/**
 * Jikan no soporta búsqueda de texto (`q`) en /seasons/now, así que el
 * filtro de búsqueda/formato es del lado del cliente, sobre la página
 * actual — suficiente para explorar una temporada (tamaño acotado), no
 * pensado para un catálogo completo (eso ya lo cubre Animes.jsx).
 */
function Seasons() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)

  const { data, loading, error, refetch } = useFetch(
    (signal) => getCurrentSeason({ page, limit: 20 }, signal),
    [page],
    { cacheKey: `admin:seasons:${page}` },
  )

  const rows = useMemo(() => {
    const all = data?.data || []
    return all.filter((anime) => {
      const matchesSearch = !search.trim() || anime.title.toLowerCase().includes(search.trim().toLowerCase())
      const matchesType = !type || anime.type === type
      return matchesSearch && matchesType
    })
  }, [data, search, type])

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Temporadas" description="Anime de la temporada actual (Jikan)." />

      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar en esta temporada..."
        filters={<Select value={type} onChange={setType} options={TYPE_OPTIONS} ariaLabel="Filtrar por formato" />}
      />

      <DataTable
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={refetch}
        empty={{
          title: 'Sin resultados',
          description: 'Nada coincide con este filtro en la temporada actual.',
        }}
      />

      {!loading && !error && rows.length > 0 && (
        <Pagination page={page} hasNextPage={data.pagination.hasNextPage} onChange={setPage} />
      )}
    </div>
  )
}

export default Seasons
