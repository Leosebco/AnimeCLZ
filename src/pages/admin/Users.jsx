import { useState } from 'react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import TableToolbar from '@/components/admin/TableToolbar'
import DataTable from '@/components/admin/DataTable'
import Select from '@/components/ui/Select'
import Pagination from '@/components/catalog/Pagination'
import useFetch from '@/hooks/useFetch'
import { listUsers } from '@/services/adminService'
import { ROLE_LABELS } from '@/constants'

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Todos los roles' },
  ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
]

const COLUMNS = [
  {
    key: 'username',
    label: 'Usuario',
    render: (row) => row.username || '(sin nombre)',
  },
  {
    key: 'role',
    label: 'Rol',
    render: (row) => ROLE_LABELS[row.role] || row.role,
  },
  {
    key: 'bio',
    label: 'Biografía',
    render: (row) => (row.bio ? (row.bio.length > 60 ? `${row.bio.slice(0, 60)}…` : row.bio) : '—'),
  },
  {
    key: 'created_at',
    label: 'Registrado',
    render: (row) => new Date(row.created_at).toLocaleDateString('es-419'),
  },
]

/**
 * Solo lectura por ahora (ver CLAUDE.md/ROADMAP.md — el CRUD, incluyendo
 * cambiar el rol de un usuario desde aquí, se implementa en otra pasada).
 * Los datos son reales: lee la tabla `profiles` de Supabase.
 */
function Users() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)

  const { data, loading, error, refetch } = useFetch(
    () => listUsers({ page, search, role }),
    [page, search, role],
    { cacheKey: `admin:users:${search}:${role}:${page}` },
  )

  const total = data?.total ?? 0
  const pageSize = data?.pageSize ?? 10
  const hasNextPage = page * pageSize < total

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  const handleRoleChange = (value) => {
    setRole(value)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Usuarios"
        description={`${total} cuenta${total === 1 ? '' : 's'} registrada${total === 1 ? '' : 's'}.`}
      />

      <TableToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por nombre de usuario..."
        filters={
          <Select value={role} onChange={handleRoleChange} options={ROLE_FILTER_OPTIONS} ariaLabel="Filtrar por rol" />
        }
      />

      <DataTable
        columns={COLUMNS}
        rows={data?.data || []}
        rowKey={(row) => row.user_id}
        loading={loading}
        error={error}
        onRetry={refetch}
        empty={{
          title: 'Sin usuarios',
          description: 'Nadie coincide con esta búsqueda todavía.',
        }}
      />

      {!loading && !error && data?.data?.length > 0 && (
        <Pagination page={page} hasNextPage={hasNextPage} onChange={setPage} />
      )}
    </div>
  )
}

export default Users
