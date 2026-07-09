import { AlertTriangle } from 'lucide-react'
import Button from './Button'

function ErrorState({
  message = 'No pudimos cargar esta sección. El servidor está ocupado — inténtalo nuevamente en unos segundos.',
  onRetry,
  compact = false,
}) {
  return (
    <div
      role="alert"
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
        <AlertTriangle className="text-error" size={compact ? 22 : 28} aria-hidden />
      </span>
      <p className="max-w-sm text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export default ErrorState
