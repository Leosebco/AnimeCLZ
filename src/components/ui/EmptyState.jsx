import { SearchX } from 'lucide-react'
import Button from './Button'

/**
 * `onRetry` is optional: most empty states really are "no matches", but a
 * handful of Jikan endpoints have been observed serving a genuinely empty
 * (but 200 OK) response under load rather than a clean error — a retry
 * option costs nothing and occasionally saves a confusing false "nothing
 * here" for the user.
 */
function EmptyState({
  title = 'Sin resultados',
  description,
  compact = false,
  icon: Icon = SearchX,
  onRetry,
}) {
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
            ? 'flex h-12 w-12 items-center justify-center rounded-full bg-card'
            : 'flex h-16 w-16 items-center justify-center rounded-full bg-card'
        }
      >
        <Icon className="text-text-secondary" size={compact ? 22 : 28} aria-hidden />
      </span>
      <p className="font-display text-base font-semibold text-text">{title}</p>
      {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export default EmptyState
