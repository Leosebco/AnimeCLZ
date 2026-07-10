import { Check } from 'lucide-react'
import { THEMES } from '@/constants'
import { cn } from '@/utils/cn'

/**
 * Grilla de selección de Tema para `ProfileFormModal` (v1.5). A diferencia
 * del picker de `Settings.jsx` (que aplica el tema en vivo vía
 * `useTheme().setTheme`), este es puro estado de formulario local — el
 * modal puede estar creando/editando un perfil que no es el activo, así que
 * no debería cambiar el tema visual de la sesión actual hasta guardar.
 */
function ThemePickerGrid({ value, onChange }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-text-secondary">Tema</span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {THEMES.map((theme) => {
          const active = theme.id === value
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              aria-pressed={active}
              className={cn(
                'flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                active
                  ? 'border-primary bg-hover text-text'
                  : 'border-border text-text-secondary hover:border-primary/50 hover:text-text',
              )}
            >
              <span
                className="h-5 w-5 shrink-0 rounded-full ring-1 ring-white/10"
                style={{ backgroundColor: theme.swatch }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{theme.label}</span>
              {active && <Check size={14} className="shrink-0 text-primary" aria-hidden />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ThemePickerGrid
