import { Check } from 'lucide-react'
import { PROFILE_BACKGROUNDS } from '@/constants'
import { cn } from '@/utils/cn'

/**
 * Grilla de selección de "Fondo" para `ProfileFormModal` (v1.5) — acento
 * decorativo detrás del avatar en el selector de perfiles y en el
 * encabezado de "Mi Perfil". Gradientes CSS puros (ver
 * constants/index.js PROFILE_BACKGROUNDS), nunca imágenes externas.
 */
function BackgroundPickerGrid({ value, onChange }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-text-secondary">Fondo</span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PROFILE_BACKGROUNDS.map((background) => {
          const active = background.id === value
          const isNone = background.preview === 'none'
          return (
            <button
              key={background.id}
              type="button"
              onClick={() => onChange(background.id)}
              aria-pressed={active}
              className={cn(
                'flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                active
                  ? 'border-primary bg-hover text-text'
                  : 'border-border text-text-secondary hover:border-primary/50 hover:text-text',
              )}
            >
              <span
                className={cn(
                  'h-5 w-5 shrink-0 rounded-full ring-1 ring-white/10',
                  isNone && 'border border-dashed border-text-secondary',
                )}
                style={isNone ? undefined : { backgroundImage: background.preview }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{background.label}</span>
              {active && <Check size={14} className="shrink-0 text-primary" aria-hidden />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BackgroundPickerGrid
