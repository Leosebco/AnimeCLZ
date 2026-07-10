import { Search } from 'lucide-react'

/**
 * Barra compartida de búsqueda + filtros para las tablas del panel de
 * administración. `filters` recibe controles ya armados (p. ej. `Select`)
 * para no acoplar este componente a un tipo de filtro específico.
 */
function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters,
  disabled = false,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
          size={16}
        />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          disabled={disabled}
          aria-label={searchPlaceholder}
          className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-text-secondary transition-colors duration-200 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
        />
      </div>

      {filters && (
        <div className="flex flex-wrap items-center gap-2 [&>*]:w-full sm:[&>*]:w-auto">{filters}</div>
      )}
    </div>
  )
}

export default TableToolbar
