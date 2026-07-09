import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import TableToolbar from '@/components/admin/TableToolbar'
import DataTable from '@/components/admin/DataTable'
import Select from '@/components/ui/Select'
import Pagination from '@/components/catalog/Pagination'
import useFetch from '@/hooks/useFetch'
import { listUsers, updateUserRole } from '@/services/adminService'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { ASSIGNABLE_ROLES, ROLE_LABELS, ROLE_MANAGEMENT_ROLES } from '@/constants'

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Todos los roles' },
  ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
]

const ROLE_EDIT_OPTIONS = ASSIGNABLE_ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }))

/**
 * Panel de Gestión de Usuarios (v1.3). El cambio de rol solo está
 * habilitado si el PERFIL ACTIVO de quien mira es super_admin
 * (ROLE_MANAGEMENT_ROLES) — para cualquier otro rol de staff, esta sigue
 * siendo la vista de solo lectura que ya existía (v0.10). Nadie puede
 * cambiar su propio rol desde aquí (ver protect_profile_role, migración
 * 0013 — el trigger lo bloquea igual, esto solo evita el intento).
 */
function Users() {
  const { user } = useAuth()
  const { activeProfile } = useProfile()
  const canManageRoles = ROLE_MANAGEMENT_ROLES.includes(activeProfile?.rol)

  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [savingUserId, setSavingUserId] = useState(null)
  const [roleError, setRoleError] = useState(null)

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

  const handleRoleFilterChange = (value) => {
    setRole(value)
    setPage(1)
  }

  const handleRoleEdit = async (targetUserId, nextRole) => {
    setRoleError(null)
    setSavingUserId(targetUserId)
    try {
      await updateUserRole(targetUserId, nextRole)
      refetch()
    } catch (err) {
      setRoleError(err.message)
    } finally {
      setSavingUserId(null)
    }
  }

  const columns = [
    {
      key: 'username',
      label: 'Usuario',
      render: (row) => row.username || '(sin nombre)',
    },
    {
      key: 'role',
      label: 'Rol',
      render: (row) => {
        if (!canManageRoles) return ROLE_LABELS[row.role] || row.role
        const isOwnAccount = row.user_id === user?.id
        if (isOwnAccount) {
          return (
            <span title="No puedes cambiar tu propio rol">{ROLE_LABELS[row.role] || row.role}</span>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <Select
              value={row.role}
              onChange={(nextRole) => handleRoleEdit(row.user_id, nextRole)}
              options={ROLE_EDIT_OPTIONS}
              ariaLabel={`Cambiar rol de ${row.username || 'usuario'}`}
              className="min-w-[10rem]"
            />
            {savingUserId === row.user_id && <Loader2 size={14} className="animate-spin text-text-secondary" />}
          </div>
        )
      },
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

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Usuarios"
        description={`${total} cuenta${total === 1 ? '' : 's'} registrada${total === 1 ? '' : 's'}.${
          canManageRoles ? ' Puedes cambiar el rol de cualquier cuenta (menos la tuya).' : ''
        }`}
      />

      <TableToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por nombre de usuario..."
        filters={
          <Select
            value={role}
            onChange={handleRoleFilterChange}
            options={ROLE_FILTER_OPTIONS}
            ariaLabel="Filtrar por rol"
          />
        }
      />

      {roleError && (
        <p role="alert" className="text-sm text-error">
          {roleError}
        </p>
      )}

      <DataTable
        columns={columns}
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
