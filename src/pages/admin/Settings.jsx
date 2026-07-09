import { Globe, Palette, Bell, ShieldCheck } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

const GROUPS = [
  {
    icon: Globe,
    title: 'General',
    description: 'Nombre del sitio, descripción, idioma por defecto.',
  },
  {
    icon: Palette,
    title: 'Apariencia',
    description: 'Paleta de marca, logo, favicon (ver DESIGN.md para los valores actuales).',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Qué eventos generan una notificación y para quién (tabla `notifications` ya lista).',
  },
  {
    icon: ShieldCheck,
    title: 'Roles y permisos',
    description: 'Qué puede hacer cada rol (admin/editor/moderador) — hoy solo controla el acceso al panel.',
  },
]

/**
 * Sin controles interactivos a propósito: no existe todavía una tabla de
 * configuración en Supabase, y un toggle que no persiste nada sería peor
 * que no tenerlo. Esta vista documenta los grupos previstos para cuando
 * se implemente el CRUD de Configuración.
 */
function Settings() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Configuración" description="Próximamente — arquitectura prevista." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GROUPS.map((group) => (
          <div key={group.title} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hover text-primary">
                <group.icon size={18} aria-hidden />
              </span>
              <h2 className="font-display text-base font-semibold text-text">{group.title}</h2>
            </div>
            <p className="mt-3 text-sm text-text-secondary">{group.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Settings
