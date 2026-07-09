import { Moon, Globe, Bell, Lock } from 'lucide-react'
import Container from '@/components/ui/Container'

const GROUPS = [
  {
    icon: Moon,
    title: 'Tema',
    description: 'AnimeCLZ es oscuro por defecto. Un tema claro o variantes adicionales quedan preparados para una futura versión.',
  },
  {
    icon: Globe,
    title: 'Idioma',
    description: 'Hoy toda la interfaz está en español latino. Selector de idioma preparado para cuando exista una segunda traducción.',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Qué avisos quieres recibir (nuevos episodios, respuestas a comentarios). La tabla `notifications` ya existe; falta la lógica.',
  },
  {
    icon: Lock,
    title: 'Privacidad',
    description: 'Quién puede ver tus perfiles, favoritos y actividad. Ver también la Política de Privacidad en la página principal.',
  },
]

/**
 * Sin controles interactivos a propósito (mismo criterio que
 * pages/admin/Settings.jsx): un toggle que no persiste nada sería peor que
 * no tenerlo. Documenta los grupos previstos para cuando se implemente la
 * lógica real.
 */
function Settings() {
  return (
    <Container className="max-w-2xl pt-28 pb-16">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Configuración</h1>
      <p className="mt-1 text-sm text-text-secondary">Próximamente — arquitectura prevista.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
    </Container>
  )
}

export default Settings
