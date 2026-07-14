import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clapperboard, Menu, X } from 'lucide-react'
import { NAV_LINKS, ROUTES } from '@/constants'
import Container from '@/components/ui/Container'
import NavbarSearch from './NavbarSearch'
import AccountMenu from './AccountMenu'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { cn } from '@/utils/cn'

function Navbar() {
  const { isAuthenticated, signOut } = useAuth()
  const { clearActiveProfile } = useProfile()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMobileSignOut = async () => {
    setIsMenuOpen(false)
    await signOut()
    // Ver AccountMenu.jsx: cerrar sesión debe volver a mostrar el
    // selector de perfiles en el próximo login, aunque sea la misma cuenta.
    clearActiveProfile()
    navigate(ROUTES.LANDING)
  }

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'safe-top fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300',
        isScrolled
          ? 'bg-background/70 border-border shadow-[0_8px_30px_-15px_rgba(0,0,0,0.6)]'
          : 'bg-background/30 border-transparent',
      )}
    >
      <Container className="flex h-18 items-center justify-between py-3">
        <Link
          to={isAuthenticated ? ROUTES.HOME : ROUTES.LANDING}
          className="flex items-center gap-2 font-display text-lg font-bold text-text"
        >
          <Clapperboard className="text-primary" size={22} aria-hidden />
          AnimeCLZ
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-border bg-surface/40 p-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === ROUTES.HOME}
              className="relative rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-card"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className={cn('relative', isActive && 'text-text')}>{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <NavbarSearch />
          <AccountMenu />

          <button
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden flex min-h-11 min-w-11 items-center justify-center rounded-full text-text transition-colors hover:bg-hover"
          >
            {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-b border-border bg-background/95 backdrop-blur-xl"
          >
            <Container className="flex flex-col gap-1 py-3">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === ROUTES.HOME}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-card text-text'
                        : 'text-text-secondary hover:bg-hover hover:text-text',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={ROUTES.PROFILE}
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-full px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-hover hover:text-text"
                    >
                      Perfil
                    </Link>
                    <button
                      type="button"
                      onClick={handleMobileSignOut}
                      className="rounded-full px-4 py-2.5 text-left text-sm font-medium text-error hover:bg-hover"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-full px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-hover hover:text-text"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-on-primary hover:bg-primary-hover"
                    >
                      Crear cuenta
                    </Link>
                  </>
                )}
              </div>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
