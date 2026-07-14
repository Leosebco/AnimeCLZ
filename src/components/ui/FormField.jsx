import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

/**
 * Input de formulario compartido por Login/Registro/Recuperar-Restablecer
 * contraseña y Perfil — evita reimplementar el mismo label+input+error en
 * cada página.
 *
 * `endAdornment` (v2.5, opcional — `undefined` no cambia nada para ningún
 * consumidor existente): elemento posicionado dentro del input, a la
 * derecha — hoy solo lo usa el toggle de mostrar/ocultar contraseña de
 * Login/Registro. Cuando se pasa, el input gana `pr-11` para que el texto
 * nunca quede debajo del ícono.
 */
const FormField = forwardRef(function FormField({ label, error, className, endAdornment, ...props }, ref) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-text-secondary">{label}</span>
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            // text-base (16px) en mobile evita el auto-zoom de Safari iOS al
            // enfocar un input con font-size < 16px; sm:text-sm vuelve al
            // tamaño visual de siempre en desktop.
            'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base text-text placeholder:text-text-secondary transition-colors duration-200 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary sm:text-sm',
            endAdornment && 'pr-11',
            error && 'border-error',
            className,
          )}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{endAdornment}</div>
        )}
      </div>
      {error && <span className="mt-1.5 block text-xs text-error">{error}</span>}
    </label>
  )
})

export default FormField
