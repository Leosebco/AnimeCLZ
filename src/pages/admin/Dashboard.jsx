import { Users, ShieldCheck, MessageSquare, Star } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/admin/DataTable'
import useFetch from '@/hooks/useFetch'
import { getDashboardStats, listRecentUsers } from '@/services/adminService'
import { ROLE_LABELS } from '@/constants'
import { isSupabaseConfigured } from '@/lib/supabase'

const RECENT_USERS_COLUMNS = [
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
    key: 'created_at',
    label: 'Registrado',
    render: (row) => new Date(row.created_at).toLocaleDateString('es-419'),
  },
]

/**
 * Métricas reales (conteos de Supabase), no inventadas: si el proyecto no
 * tiene Supabase configurado (ver .env.example) las tarjetas muestran "—"
 * en vez de un número fabricado.
 */
function Dashboard() {
  const stats = useFetch(() => getDashboardStats(), [], { cacheKey: 'admin:stats' })
  const recentUsers = useFetch(() => listRecentUsers(5), [], { cacheKey: 'admin:recent-users' })

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Dashboard"
        description="Resumen general de AnimeCLZ."
      />

      {!isSupabaseConfigured && (
        <p className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-text-secondary">
          Supabase no está configurado todavía — estas métricas se activarán solas cuando definas
          <code className="mx-1 rounded bg-hover px-1.5 py-0.5 text-xs">VITE_SUPABASE_URL</code> y
          <code className="mx-1 rounded bg-hover px-1.5 py-0.5 text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</code>.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Usuarios registrados" value={stats.data?.totalUsers} loading={stats.loading} />
        <StatCard icon={ShieldCheck} label="Equipo (admin/editor/moderador)" value={stats.data?.staffCount} loading={stats.loading} />
        <StatCard icon={MessageSquare} label="Comentarios" value={stats.data?.totalComments} loading={stats.loading} />
        <StatCard icon={Star} label="Calificaciones" value={stats.data?.totalRatings} loading={stats.loading} />
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-text">Usuarios recientes</h2>
        <DataTable
          columns={RECENT_USERS_COLUMNS}
          rows={recentUsers.data || []}
          rowKey={(row) => row.user_id}
          loading={recentUsers.loading}
          error={recentUsers.error}
          onRetry={recentUsers.refetch}
          empty={{
            title: 'Todavía no hay usuarios',
            description: 'Los nuevos registros aparecerán aquí en cuanto Supabase esté configurado.',
          }}
        />
      </section>
    </div>
  )
}

export default Dashboard
