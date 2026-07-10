import { useState } from 'react'
import { Newspaper, Pencil, Plus, Trash2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import TableToolbar from '@/components/admin/TableToolbar'
import DataTable from '@/components/admin/DataTable'
import NewsFormModal from '@/components/admin/NewsFormModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'
import Pagination from '@/components/catalog/Pagination'
import useFetch from '@/hooks/useFetch'
import { useAuth } from '@/hooks/useAuth'
import { createNews, deleteNews, listNews, updateNews } from '@/services/newsService'

/**
 * Primer módulo con CRUD real del Panel de Administración (v1.0) — tabla
 * propia `news`, no depende de Jikan. Ver ROADMAP.md para por qué
 * Animes/Temporadas/Episodios/Personajes/Estudios siguen sin CRUD.
 */
function News() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editingItem, setEditingItem] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deletingItem, setDeletingItem] = useState(null)
  const [actionError, setActionError] = useState(null)

  const { data, loading, error, refetch } = useFetch(
    () => listNews({ page, search }),
    [page, search],
    { cacheKey: `admin:news:${search}:${page}` },
  )

  const total = data?.total ?? 0
  const pageSize = data?.pageSize ?? 10
  const hasNextPage = page * pageSize < total

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleCreate = async (values) => {
    await createNews(user.id, values)
    refetch()
  }

  const handleUpdate = async (values) => {
    await updateNews(editingItem.id, values)
    refetch()
  }

  const handleDelete = async () => {
    setActionError(null)
    try {
      await deleteNews(deletingItem.id)
      refetch()
    } catch (err) {
      setActionError(err.message)
      throw err
    }
  }

  const columns = [
    { key: 'title', label: 'Título' },
    {
      key: 'published',
      label: 'Estado',
      render: (row) => (
        <span
          className={
            row.published
              ? 'rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary'
              : 'rounded-full bg-hover px-2.5 py-1 text-xs font-medium text-text-secondary'
          }
        >
          {row.published ? 'Publicada' : 'Borrador'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Creada',
      render: (row) => new Date(row.createdAt).toLocaleDateString('es-419'),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEditingItem(row)}
            aria-label={`Editar ${row.title}`}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover hover:text-text"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeletingItem(row)}
            aria-label={`Eliminar ${row.title}`}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover hover:text-error"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Noticias"
        description={`${total} noticia${total === 1 ? '' : 's'}.`}
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={16} />
            Nueva noticia
          </Button>
        }
      />

      <TableToolbar search={search} onSearchChange={handleSearchChange} searchPlaceholder="Buscar por título..." />

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
          icon: Newspaper,
          title: 'Todavía no hay noticias',
          description: 'Crea la primera con el botón "Nueva noticia".',
        }}
      />

      {!loading && !error && data?.data?.length > 0 && (
        <Pagination page={page} hasNextPage={hasNextPage} onChange={setPage} />
      )}

      <NewsFormModal open={creating} onClose={() => setCreating(false)} title="Nueva noticia" onSubmit={handleCreate} />

      <NewsFormModal
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Editar noticia"
        initialValue={
          editingItem
            ? {
                title: editingItem.title,
                content: editingItem.content,
                coverImage: editingItem.coverImage || '',
                published: editingItem.published,
              }
            : null
        }
        onSubmit={handleUpdate}
      />

      <ConfirmDialog
        open={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Eliminar noticia"
        description={`¿Eliminar "${deletingItem?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />
    </div>
  )
}

export default News
