import Skeleton from '@/components/ui/Skeleton'

/**
 * Tarjeta de métrica reutilizable (v2.8 — antes duplicada casi al idéntico
 * en `components/admin/StatCard.jsx` y `components/anime/StatCard.jsx`,
 * consolidada acá por ser agnóstica de dominio, ver CLAUDE.md
 * "components/ui/ — primitivas agnósticas del dominio"). Dos variantes,
 * mismo componente:
 * - `variant="dashboard"` (default): icono+etiqueta arriba, valor grande
 *   abajo; soporta `loading` (Skeleton) y muestra "—" si `value` es
 *   `null`/`undefined` — usada por el Dashboard del Panel de Admin, donde
 *   "sin dato" es un estado real (Supabase no configurado).
 * - `variant="compact"`: icono+valor+etiqueta en una sola fila, sin prop
 *   `loading`; retorna `null` si `value` es `null`/`undefined` — usada por
 *   AnimeDetail (Score/Popularidad/Ranking), donde faltar un dato solo
 *   significa "esta métrica no está disponible para este anime en
 *   particular", así que la tarjeta entera se oculta en vez de mostrar un
 *   guion.
 */
function StatCard({ icon: Icon, label, value, loading = false, variant = 'dashboard' }) {
  if (variant === 'compact') {
    if (value === null || value === undefined) return null
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hover text-primary">
          <Icon size={18} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-text">{value}</p>
          <p className="text-xs text-text-secondary">{label}</p>
        </div>
      </div>
    )
  }

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
