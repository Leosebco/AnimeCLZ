import { useState } from 'react'
import { Check, Globe, Bell, Lock, Loader2 } from 'lucide-react'
import Container from '@/components/ui/Container'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'

const GROUPS = [
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
 * Tema: único control realmente interactivo de esta página (v1.0) — el
 * resto sigue como estructura preparada sin lógica (mismo criterio que
 * pages/admin/Settings.jsx: un toggle que no persiste nada sería peor que
 * no tenerlo). El tema SÍ persiste de verdad (profiles_account.tema, ver
 * ThemeContext) y se aplica al instante, sin recargar la página.
 */
function Settings() {
  const { themeId, themes, setTheme } = useTheme()
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState(null)

  const handleSelectTheme = async (id) => {
    if (id === themeId) return
    setError(null)
    setSavingId(id)
    try {
      await setTheme(id)
    } catch {
      setError('No pudimos guardar tu tema. Inténtalo nuevamente.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Container className="max-w-2xl pt-28 pb-16">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Configuración</h1>
      <p className="mt-1 text-sm text-text-secondary">Personaliza AnimeCLZ a tu gusto.</p>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-semibold text-text">Tema</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Elige una paleta — se guarda con tu perfil y se aplica en cualquier dispositivo donde inicies sesión.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {themes.map((theme) => {
            const active = theme.id === themeId
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                aria-pressed={active}
                disabled={savingId !== null}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-60',
                  active ? 'border-primary bg-hover text-text' : 'border-border text-text-secondary hover:border-primary/50 hover:text-text',
                )}
              >
                <span
                  className="h-6 w-6 shrink-0 rounded-full ring-1 ring-white/10"
                  style={{ backgroundColor: theme.swatch }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate">{theme.label}</span>
                {savingId === theme.id ? (
                  <Loader2 size={15} className="shrink-0 animate-spin" />
                ) : (
                  active && <Check size={15} className="shrink-0 text-primary" aria-hidden />
                )}
              </button>
            )
          })}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-error">
            {error}
          </p>
        )}
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
