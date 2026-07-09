import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/utils/cn'

/**
 * Tabla base reutilizable por todas las vistas de contenido del panel de
 * administración. Sin lógica de datos propia: recibe filas ya resueltas —
 * cada página decide de dónde vienen (Jikan, Supabase, o ninguna fuente
 * todavía, ver `empty`).
 */
function DataTable({
  columns,
  rows,
  rowKey = (row) => row.id,
  loading = false,
  error = null,
  onRetry,
  empty,
  className,
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) return <ErrorState onRetry={onRetry} />
  if (!rows.length) return <EmptyState compact {...empty} />

  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-border', className)}>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-card">
            {columns.map((column) => (
              <th
                key={column.key}
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-border transition-colors last:border-0 hover:bg-hover/60"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-text">
                  {column.render ? column.render(row) : (row[column.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
