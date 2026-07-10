import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/utils/cn'

/**
 * Tabla base reutilizable por todas las vistas de contenido del panel de
 * administración. Sin lógica de datos propia: recibe filas ya resueltas —
 * cada página decide de dónde vienen (Jikan, Supabase, o ninguna fuente
 * todavía, ver `empty`).
 *
 * Debajo de `md` (768px) deja de renderizarse como `<table>` (forzaba
 * `min-w-[560px]` + scroll horizontal, justo lo que el sprint móvil prohíbe)
 * y pasa a un listado de tarjetas — misma prop `columns`, ninguna página
 * necesita cambiar nada. Regla de armado de cada tarjeta: la columna
 * `key === 'actions'` se separa a un pie de tarjeta a ancho completo (mejor
 * para tocar que íconos sueltos en una fila angosta); el resto se apila como
 * pares "etiqueta: valor" (una columna con `label` vacío — p. ej. un
 * thumbnail de póster — se muestra sin etiqueta, no como "": valor).
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

  const actionsColumn = columns.find((column) => column.key === 'actions')
  const fieldColumns = columns.filter((column) => column.key !== 'actions')

  return (
    <div className={className}>
      {/* Mobile / tablet angosta: tarjetas */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <div key={rowKey(row)} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-col gap-2.5">
              {fieldColumns.map((column) => (
                <div key={column.key}>
                  {column.label && (
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      {column.label}
                    </div>
                  )}
                  <div className={cn('text-sm text-text', column.label && 'mt-0.5')}>
                    {column.render ? column.render(row) : (row[column.key] ?? '—')}
                  </div>
                </div>
              ))}
            </div>
            {actionsColumn && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                {actionsColumn.render ? actionsColumn.render(row) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop (md+): tabla real, sin cambios */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
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
    </div>
  )
}

export default DataTable
