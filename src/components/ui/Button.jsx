import { cn } from '@/utils/cn'

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-hover font-semibold',
  secondary: 'bg-card text-text hover:bg-hover border border-border',
  ghost: 'bg-transparent text-text-secondary hover:text-text hover:bg-hover',
}

const SIZES = {
  sm: 'px-4 py-1.5 text-sm',
  // py-3 + text-sm (20px line-height) = 44px de alto — el tamaño por
  // defecto es el que usan los CTAs primarios (login, registro, perfil),
  // así que debe cumplir el mínimo táctil de 44x44px.
  md: 'px-5 py-3 text-sm',
  lg: 'px-7 py-3 text-base',
}

/**
 * Base button primitive. Domain-specific buttons (e.g. "Ver Ahora",
 * "Mi Lista") should compose this rather than duplicate styles.
 *
 * Primary is a solid fill (not the Primary→Secondary gradient) on purpose:
 * Secondary (#7C5CFF) reads closer to violet, and the brand rule is "no
 * morado" as a decorative/brand color — reserving it for occasional small
 * accents (see .brand-gradient-bg) keeps it from dominating the single
 * most-repeated element in the UI.
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
