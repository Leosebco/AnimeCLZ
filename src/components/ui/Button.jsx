import { cn } from '@/utils/cn'

const VARIANTS = {
  primary:
    'brand-gradient-bg text-background font-semibold hover:brightness-110 active:brightness-95',
  secondary: 'bg-surface-hover text-text hover:bg-border border border-border',
  ghost: 'bg-transparent text-text-secondary hover:text-text hover:bg-surface-hover',
}

const SIZES = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

/**
 * Base button primitive. Domain-specific buttons (e.g. "Ver Ahora",
 * "Mi Lista") should compose this rather than duplicate styles.
 */
function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Button
