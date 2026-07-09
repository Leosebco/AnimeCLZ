import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import Container from '@/components/ui/Container'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { ROUTES } from '@/constants'

/**
 * Root layout rendered once by the router. Every page is injected
 * via <Outlet /> between a persistent Navbar and Footer, so scroll
 * position, nav state, etc. survive page transitions. The AnimatePresence
 * wrapper gives every route change a short, consistent fade/slide instead
 * of an instant, jarring swap.
 *
 * Perfil activo: con sesión pero sin un perfil elegido (recién logueado,
 * o cerró el selector sin elegir), redirige a `/perfiles` antes de
 * mostrar cualquier página pública — "solo después de elegir un perfil
 * ingresar al Home". `/admin/*` no pasa por aquí (vive fuera de Layout),
 * por eso ProtectedRoute repite este mismo chequeo para esa rama.
 */
function Layout() {
  const location = useLocation()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { activeProfile, loading: profilesLoading } = useProfile()

  const resolvingSession = authLoading || (isAuthenticated && profilesLoading)

  if (resolvingSession) {
    return (
      <Container className="pt-28 pb-16">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-4 h-4 w-2/3" />
      </Container>
    )
  }

  if (isAuthenticated && !activeProfile) {
    return <Navigate to={ROUTES.PROFILE_SELECT} state={{ from: location }} replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default Layout
