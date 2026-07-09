import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import TableToolbar from '@/components/admin/TableToolbar'
import DataTable from '@/components/admin/DataTable'
import Pagination from '@/components/catalog/Pagination'
import useFetch from '@/hooks/useFetch'
import { listComments } from '@/services/adminService'
import { animeDetailPath } from '@/constants'

const COLUMNS = [
  {
    key: 'mal_id',
    label: 'Anime',
    render: (row) => (
      <Link to={animeDetailPath(row.mal_id)} className="text-primary hover:text-primary-hover">
        #{row.mal_id}
      </Link>
    ),
  },
  {
    key: 'content',
    label: 'Comentario',
    render: (row) => (row.content.length > 80 ? `${row.content.slice(0, 80)}…` : row.content),
  },
  {
    key: 'created_at',
    label: 'Fecha',
    render: (row) => new Date(row.created_at).toLocaleDateString('es-419'),
  },
]

/**
 * Solo lectura (ver Users.jsx) — moderar/eliminar comentarios queda para el
 * CRUD. Todavía no hay ninguna interfaz pública que escriba en `comments`
 * (ver ROADMAP.md), así que esta tabla estará vacía en la práctica.
 */
function Comments() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, loading, error, refetch } = useFetch(
    () => listComments({ page, search }),
    [page, search],
    { cacheKey: `admin:comments:${search}:${page}` },
  )

  const total = data?.total ?? 0
  const pageSize = data?.pageSize ?? 10
  const hasNextPage = page * pageSize < total

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Comentarios"
        description={`${total} comentario${total === 1 ? '' : 's'} en total.`}
      />

      <TableToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar en el contenido..."
      />

      <DataTable
        columns={COLUMNS}
        rows={data?.data || []}
        loading={loading}
        error={error}
        onRetry={refetch}
        empty={{
          title: 'Todavía no hay comentarios',
          description: 'Esta sección se llenará en cuanto exista una interfaz pública de comentarios.',
        }}
      />

      {!loading && !error && data?.data?.length > 0 && (
        <Pagination page={page} hasNextPage={hasNextPage} onChange={setPage} />
      )}
    </div>
  )
}

export default Comments
