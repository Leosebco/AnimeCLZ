import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { ROUTES } from '@/constants'
import Container from '@/components/ui/Container'
import Skeleton from '@/components/ui/Skeleton'

/**
 * Gate para rutas que requieren sesión (/mi-lista, /favoritos, /historial,
 * /perfil, /configuracion, /admin/*): sin sesión, redirige a Login; con
 * sesión pero sin un perfil elegido todavía, redirige al selector de
 * perfiles (`/perfiles`) — mismo criterio que Layout.jsx aplica a las
 * rutas públicas, pero repetido aquí porque /admin/* vive fuera del
 * Layout público y por lo tanto no pasa por ese guard.
 *
 * Con `roles`, además exige que el ROL DEL PERFIL ACTIVO (no el de la
 * cuenta — ver useProfile) esté en esa lista (usado por /admin/*, ver
 * STAFF_ROLES); si no, redirige a Inicio en vez de a Login.
 *
 * `requireProfile={false}` (usado solo por `/perfiles`) se salta el
 * segundo chequeo — de lo contrario, entrar ahí sin perfil activo (el caso
 * normal) redirigiría de vuelta a `/perfiles` en un loop.
 */
function ProtectedRoute({ roles, requireProfile = true }) {
  const { isAuthenticated, loading } = useAuth()
  const { activeProfile, loading: profilesLoading } = useProfile()
  const location = useLocation()

  if (loading || (isAuthenticated && requireProfile && profilesLoading)) {
    return (
      <Container className="pt-28 pb-16">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-4 h-4 w-2/3" />
      </Container>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (requireProfile && !activeProfile) {
    return <Navigate to={ROUTES.PROFILE_SELECT} state={{ from: location }} replace />
  }

  if (roles && !roles.includes(activeProfile?.rol)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
