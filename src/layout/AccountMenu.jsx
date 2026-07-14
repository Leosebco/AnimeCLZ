import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Bookmark, Heart, History, LogOut, Settings, ShieldCheck, User, Users } from 'lucide-react'
import ProfileAvatar from '@/components/profile/ProfileAvatar'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { ROLE_LABELS, ROUTES, STAFF_ROLES } from '@/constants'
import { cn } from '@/utils/cn'

const MENU_LINKS = [
  { label: 'Mi Perfil', path: ROUTES.PROFILE, icon: User },
  { label: 'Cambiar Perfil', path: ROUTES.PROFILE_SELECT, icon: Users },
  { label: 'Mi Lista', path: ROUTES.MY_LIST, icon: Bookmark },
  { label: 'Favoritos', path: ROUTES.FAVORITES, icon: Heart },
  { label: 'Historial', path: ROUTES.HISTORY, icon: History },
  { label: 'Configuración', path: ROUTES.SETTINGS, icon: Settings },
]

/**
 * Reemplaza el link simple a Perfil en el Navbar. Sin sesión: Iniciar
 * sesión/Crear cuenta. Con sesión: el propio botón muestra avatar + nombre
 * + rol del PERFIL activo (no solo un círculo) — el menú desplegable trae
 * el resto de accesos, incluido Panel de Administración solo si el rol del
 * perfil activo es de staff.
 */
function AccountMenu() {
  const { isAuthenticated, user, signOut } = useAuth()
  const { activeProfile, clearActiveProfile } = useProfile()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    // Cerrar sesión es uno de los momentos en los que el selector de
    // perfiles SÍ debe volver a aparecer (v1.0) — sin esto, un login
    // rápido de la misma cuenta reutilizaría el perfil recordado sin
    // preguntar, aunque el usuario haya cerrado sesión a propósito.
    clearActiveProfile()
    navigate(ROUTES.LANDING)
  }

  if (!isAuthenticated) {
    return (
      <div className="hidden md:flex items-center gap-1.5">
        <Link
          to={ROUTES.LOGIN}
          className="rounded-full px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-text"
        >
          Iniciar sesión
        </Link>
        <Link
          to={ROUTES.REGISTER}
          className="rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
        >
          Crear cuenta
        </Link>
      </div>
    )
  }

  // Puede haber una sesión sin perfil activo todavía (justo tras el login,
  // camino a /perfiles) — el botón no tiene nada real que mostrar en ese
  // instante, así que no se renderiza hasta que haya un perfil elegido.
  if (!activeProfile) return null

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <MenuButton
            aria-label="Cuenta"
            className="flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-hover"
          >
            <ProfileAvatar
              avatar={activeProfile.avatar}
              tipoAvatar={activeProfile.tipoAvatar}
              color={activeProfile.color}
              nombre={activeProfile.nombre}
              size={32}
            />
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-sm font-medium text-text">{activeProfile.nombre}</span>
              <span className="block text-xs text-text-secondary">
                {ROLE_LABELS[activeProfile.rol] || activeProfile.rol}
              </span>
            </span>
          </MenuButton>

          <AnimatePresence>
            {open && (
              <MenuItems
                as={motion.div}
                static
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } }}
                exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.18, ease: 'easeOut' } }}
                anchor="bottom end"
                className="z-30 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-surface/95 p-1.5 shadow-2xl backdrop-blur-xl focus:outline-none"
              >
                <div className="truncate px-3 py-2 text-xs text-text-secondary">{user?.email}</div>

                {MENU_LINKS.map((link) => (
                  <MenuItem key={link.path}>
                    {({ focus }) => (
                      <Link
                        to={link.path}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors',
                          focus ? 'bg-card text-text' : 'text-text-secondary',
                        )}
                      >
                        <link.icon size={16} aria-hidden />
                        {link.label}
                      </Link>
                    )}
                  </MenuItem>
                ))}

                {STAFF_ROLES.includes(activeProfile.rol) && (
                  <MenuItem>
                    {({ focus }) => (
                      <Link
                        to={ROUTES.ADMIN_DASHBOARD}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors',
                          focus ? 'bg-card text-text' : 'text-text-secondary',
                        )}
                      >
                        <ShieldCheck size={16} aria-hidden />
                        Panel de Administración
                      </Link>
                    )}
                  </MenuItem>
                )}

                <div className="my-1.5 h-px bg-border" aria-hidden />

                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                        focus ? 'bg-card text-error' : 'text-text-secondary',
                      )}
                    >
                      <LogOut size={16} aria-hidden />
                      Cerrar sesión
                    </button>
                  )}
                </MenuItem>
              </MenuItems>
            )}
          </AnimatePresence>
        </>
      )}
    </Menu>
  )
}

export default AccountMenu
