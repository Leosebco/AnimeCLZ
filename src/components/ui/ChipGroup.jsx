import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

/**
 * Single-select row of pill chips — the "modern filter" alternative to a
 * dropdown, used where the option list is short enough to show inline
 * (Género, Formato, Estado, Puntuación). Reuses the same active-pill slide
 * pattern as the Navbar (`layoutId`), just scoped per group.
 */
function ChipGroup({ options, value, onChange, ariaLabel, layoutId }) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = (value || '') === option.value
        return (
          <button
            key={option.value || 'all'}
            type="button"
            onClick={() => onChange(active ? '' : option.value)}
            aria-pressed={active}
            className={cn(
              'relative rounded-full border px-3.5 py-1.5 text-sm transition-colors',
              active
                ? 'border-transparent text-white'
                : 'border-border text-text-secondary hover:border-primary/50 hover:text-text',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              />
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default ChipGroup
