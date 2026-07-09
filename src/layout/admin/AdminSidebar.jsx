import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Clapperboard,
  CalendarRange,
  ListVideo,
  Users2,
  Building2,
  Newspaper,
  UserCog,
  MessageSquare,
  Settings,
  ArrowLeft,
  X,
} from 'lucide-react'
import { ROUTES, ROLES } from '@/constants'
import { useProfile } from '@/hooks/useProfile'
import { cn } from '@/utils/cn'

// Cada item declara qué roles pueden verlo — la mayoría del contenido es
// gestionable por admin/editor/moderador; Usuarios y Configuración quedan
// reservados a admin/super_admin (el cambio de rol dentro de Usuarios, a
// su vez, solo lo puede EJECUTAR super_admin — ver ROLE_MANAGEMENT_ROLES
// en constants/index.js y pages/admin/Users.jsx). Los íconos viven aquí
// (no en constants/index.js) para no meter JSX/lucide-react en un
// archivo de datos planos.
const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard, end: true },
  { label: 'Animes', path: ROUTES.ADMIN_ANIMES, icon: Clapperboard },
  { label: 'Temporadas', path: ROUTES.ADMIN_SEASONS, icon: CalendarRange },
  { label: 'Episodios', path: ROUTES.ADMIN_EPISODES, icon: ListVideo },
  { label: 'Personajes', path: ROUTES.ADMIN_CHARACTERS, icon: Users2 },
  { label: 'Estudios', path: ROUTES.ADMIN_STUDIOS, icon: Building2 },
  { label: 'Noticias', path: ROUTES.ADMIN_NEWS, icon: Newspaper },
  {
    label: 'Usuarios',
    path: ROUTES.ADMIN_USERS,
    icon: UserCog,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  { label: 'Comentarios', path: ROUTES.ADMIN_COMMENTS, icon: MessageSquare },
  {
    label: 'Configuración',
    path: ROUTES.ADMIN_SETTINGS,
    icon: Settings,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
]

function SidebarContent({ role, onNavigate }) {
  const items = ADMIN_NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <div className="flex h-full flex-col">
      <Link
        to={ROUTES.ADMIN_DASHBOARD}
        className="flex items-center gap-2 px-5 py-5 font-display text-lg font-bold text-text"
      >
        <Clapperboard className="text-primary" size={22} aria-hidden />
        AnimeCLZ <span className="text-text-secondary font-normal">Admin</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-card text-text' : 'text-text-secondary hover:bg-hover hover:text-text',
              )
            }
          >
            <item.icon size={18} aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-text"
        >
          <ArrowLeft size={18} aria-hidden />
          Volver al sitio
        </Link>
      </div>
    </div>
  )
}

/**
 * Sidebar del panel de administración: fija en desktop (md+), drawer
 * deslizante sobre overlay en mobile (mismo patrón de animación que el
 * menú mobile del Navbar público).
 */
function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const { activeProfile } = useProfile()

  return (
    <>
      <aside className="hidden md:block md:w-64 md:shrink-0 md:border-r md:border-border md:bg-surface/60">
        <div className="sticky top-0 h-screen">
          <SidebarContent role={activeProfile?.rol} />
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={onCloseMobile}
              aria-hidden
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-surface md:hidden"
            >
              <div className="flex justify-end p-3">
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  onClick={onCloseMobile}
                  className="rounded-full p-2 text-text-secondary transition-colors hover:bg-hover hover:text-text"
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarContent role={activeProfile?.rol} onNavigate={onCloseMobile} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default AdminSidebar
