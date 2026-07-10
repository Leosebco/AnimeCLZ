import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import TableToolbar from '@/components/admin/TableToolbar'
import DataTable from '@/components/admin/DataTable'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/catalog/Pagination'
import useFetch from '@/hooks/useFetch'
import { deleteComment, listComments } from '@/services/adminService'
import { animeDetailPath } from '@/constants'

/**
 * Moderación real (v1.0): eliminar comentarios. Todavía no hay ninguna
 * interfaz pública que escriba en `comments` (ver ROADMAP.md), así que
 * esta tabla estará vacía en la práctica hasta que exista una.
 */
function Comments() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deletingItem, setDeletingItem] = useState(null)
  const [actionError, setActionError] = useState(null)

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

  const handleDelete = async () => {
    setActionError(null)
    try {
      await deleteComment(deletingItem.id)
      refetch()
    } catch (err) {
      setActionError(err.message)
      throw err
    }
  }

  const columns = [
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
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => setDeletingItem(row)}
          aria-label="Eliminar comentario"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover hover:text-error"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ]

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

      {actionError && (
        <p role="alert" className="text-sm text-error">
          {actionError}
        </p>
      )}

      <DataTable
        columns={columns}
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

      <ConfirmDialog
        open={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Eliminar comentario"
        description="¿Eliminar este comentario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
      />
    </div>
  )
}

export default Comments
