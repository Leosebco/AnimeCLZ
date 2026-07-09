import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

/**
 * Input de formulario compartido por Login/Registro/Recuperar-Restablecer
 * contraseña y Perfil — evita reimplementar el mismo label+input+error en
 * cada página.
 */
const FormField = forwardRef(function FormField({ label, error, className, ...props }, ref) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-text-secondary">{label}</span>
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-text placeholder:text-text-secondary transition-colors duration-200 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary',
          error && 'border-error',
          className,
        )}
        {...props}
      />
      {error && <span className="mt-1.5 block text-xs text-error">{error}</span>}
    </label>
  )
})

export default FormField
