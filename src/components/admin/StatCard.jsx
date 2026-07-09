import Skeleton from '@/components/ui/Skeleton'

/**
 * Tarjeta de métrica del Dashboard. `value === null` significa "sin fuente
 * de datos" (Supabase no configurado) — se muestra un guion en vez de un
 * número inventado.
 */
function StatCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hover text-primary">
          <Icon size={18} aria-hidden />
        </span>
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
      <div className="mt-4 font-display text-3xl font-bold text-text">
        {loading ? <Skeleton className="h-8 w-16" /> : (value ?? '—')}
      </div>
    </div>
  )
}

export default StatCard
