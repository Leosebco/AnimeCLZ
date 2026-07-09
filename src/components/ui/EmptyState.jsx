import { SearchX } from 'lucide-react'

function EmptyState({ title = 'Sin resultados', description, compact = false, icon: Icon = SearchX }) {
  return (
    <div
      className={
        compact
          ? 'flex flex-col items-center gap-3 px-4 py-10 text-center'
          : 'flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center'
      }
    >
      <span
        className={
          compact
            ? 'flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover'
            : 'flex h-16 w-16 items-center justify-center rounded-full bg-surface-hover'
        }
      >
        <Icon className="text-text-secondary" size={compact ? 22 : 28} aria-hidden />
      </span>
      <p className="font-display text-base font-semibold text-text">{title}</p>
      {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
    </div>
  )
}

export default EmptyState
