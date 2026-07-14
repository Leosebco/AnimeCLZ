import { useState } from 'react'
import { Check, Globe, Bell, Lock, Loader2, PlayCircle } from 'lucide-react'
import Container from '@/components/ui/Container'
import { useTheme } from '@/hooks/useTheme'
import { useProfile } from '@/hooks/useProfile'
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
 * Tema (v1.0) y Reproducción/autoplay (v2.1) son los controles realmente
 * interactivos de esta página — el resto (Idioma/Notificaciones/
 * Privacidad) sigue como estructura preparada sin lógica (mismo criterio
 * que pages/admin/Settings.jsx: un toggle que no persiste nada sería peor
 * que no tenerlo). Ambos persisten de verdad en `profiles_account`
 * (`tema`/`autoplay`) — el tema se aplica al instante vía `ThemeContext`;
 * autoplay solo lo lee el reproductor al terminar un episodio, así que
 * escribe directo con `useProfile().updateProfile()`, sin contexto propio.
 */
function Settings() {
  const { themeId, themes, setTheme } = useTheme()
  const { activeProfile, updateProfile } = useProfile()
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState(null)
  const [savingAutoplay, setSavingAutoplay] = useState(false)
  const [autoplayError, setAutoplayError] = useState(null)

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

  // v2.1 — mismo patrón que Tema: escribe directo con
  // useProfile().updateProfile, sin un contexto dedicado (a diferencia del
  // tema, esta preferencia solo la lee el reproductor al terminar un
  // episodio, no hace falta aplicarla en vivo en ningún otro lado).
  const autoplayEnabled = activeProfile?.autoplay !== false
  const handleToggleAutoplay = async () => {
    if (!activeProfile) return
    setAutoplayError(null)
    setSavingAutoplay(true)
    try {
      await updateProfile(activeProfile.id, { autoplay: !autoplayEnabled })
    } catch {
      setAutoplayError('No pudimos guardar esta preferencia. Inténtalo nuevamente.')
    } finally {
      setSavingAutoplay(false)
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

      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hover text-primary">
            <PlayCircle size={18} aria-hidden />
          </span>
          <h2 className="font-display text-base font-semibold text-text">Reproducción</h2>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-text">Reproducir siguiente episodio automáticamente</p>
            <p className="mt-0.5 text-xs text-text-secondary">
              Al terminar un episodio, muestra una cuenta regresiva y pasa al siguiente.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoplayEnabled}
            aria-label="Reproducir siguiente episodio automáticamente"
            disabled={savingAutoplay || !activeProfile}
            onClick={handleToggleAutoplay}
            className={cn(
              'relative flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-60',
              autoplayEnabled ? 'bg-primary' : 'bg-hover',
            )}
          >
            <span
              className={cn(
                'h-5 w-5 rounded-full bg-white shadow transition-transform',
                autoplayEnabled ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </button>
        </div>

        {autoplayError && (
          <p role="alert" className="mt-3 text-sm text-error">
            {autoplayError}
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
