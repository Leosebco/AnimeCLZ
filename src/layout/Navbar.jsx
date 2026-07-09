import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clapperboard, Search, Menu, X, UserRound } from 'lucide-react'
import { NAV_LINKS, ROUTES } from '@/constants'
import Container from '@/components/ui/Container'
import { cn } from '@/utils/cn'

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-colors duration-300',
        isScrolled ? 'bg-background/80 border-border' : 'bg-background/40 border-transparent',
      )}
    >
      <Container className="flex h-18 items-center justify-between py-3">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 font-display text-lg font-bold text-text">
          <Clapperboard className="text-primary" size={22} aria-hidden />
          AnimeCLZ
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/60 bg-surface/40 p-1">
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
                      className="absolute inset-0 rounded-full bg-surface-hover"
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
          <Link
            to={ROUTES.SEARCH}
            aria-label="Buscar"
            className="p-2.5 rounded-full text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
          >
            <Search size={19} />
          </Link>
          <Link
            to={ROUTES.PROFILE}
            aria-label="Perfil"
            className="hidden sm:inline-flex p-2.5 rounded-full text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
          >
            <UserRound size={19} />
          </Link>

          <button
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden p-2.5 rounded-full text-text transition-colors hover:bg-surface-hover"
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
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-b border-border bg-background"
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
                        ? 'bg-surface-hover text-text'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to={ROUTES.PROFILE}
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 rounded-full px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text"
              >
                Perfil
              </Link>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
