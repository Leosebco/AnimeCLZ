import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/layout/Layout'
import ProtectedRoute from '@/layout/ProtectedRoute'
import AdminLayout from '@/layout/admin/AdminLayout'
import Container from '@/components/ui/Container'
import Skeleton from '@/components/ui/Skeleton'
import { ROUTES, STAFF_ROLES } from '@/constants'

// Route-level code splitting: each page ships in its own chunk and only
// loads when the user actually navigates there.
const Landing = lazy(() => import('@/pages/Landing'))
const Home = lazy(() => import('@/pages/Home'))
const Explore = lazy(() => import('@/pages/Explore'))
const Season = lazy(() => import('@/pages/Season'))
const Top = lazy(() => import('@/pages/Top'))
const MyList = lazy(() => import('@/pages/MyList'))
const Favorites = lazy(() => import('@/pages/Favorites'))
const History = lazy(() => import('@/pages/History'))
const Search = lazy(() => import('@/pages/Search'))
const AnimeDetail = lazy(() => import('@/pages/AnimeDetail'))
const Profile = lazy(() => import('@/pages/Profile'))
const ProfileSelect = lazy(() => import('@/pages/ProfileSelect'))
const Settings = lazy(() => import('@/pages/Settings'))
const About = lazy(() => import('@/pages/About'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const Placeholder = lazy(() => import('@/pages/Placeholder'))

const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminAnimes = lazy(() => import('@/pages/admin/Animes'))
const AdminSeasons = lazy(() => import('@/pages/admin/Seasons'))
const AdminEpisodes = lazy(() => import('@/pages/admin/Episodes'))
const AdminCharacters = lazy(() => import('@/pages/admin/Characters'))
const AdminStudios = lazy(() => import('@/pages/admin/Studios'))
const AdminNews = lazy(() => import('@/pages/admin/News'))
const AdminUsers = lazy(() => import('@/pages/admin/Users'))
const AdminComments = lazy(() => import('@/pages/admin/Comments'))
const AdminSettings = lazy(() => import('@/pages/admin/Settings'))

function RouteFallback() {
  return (
    <Container className="pt-28 pb-16">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="mt-4 h-4 w-2/3" />
    </Container>
  )
}

/**
 * Central route table. Layout wraps every route so Navbar/Footer persist
 * across navigation. Mi Lista, Favoritos, Historial, Perfil y Configuración
 * viven detrás de ProtectedRoute (requieren sesión de Supabase Y un perfil
 * activo elegido); Login/Registro/Recuperar-Restablecer contraseña quedan
 * fuera del Layout para no montar Navbar/Footer sobre el formulario de
 * auth. `/perfiles` (el selector estilo Netflix) también queda fuera del
 * Layout y usa `requireProfile={false}` — es la propia ruta a la que se
 * redirige, así que no puede exigirse a sí misma un perfil ya elegido.
 * `/acerca` es pública, dentro de Layout. `/admin/*` es su propio árbol de
 * rutas, con AdminLayout (no el Layout público) y ProtectedRoute con
 * `roles={STAFF_ROLES}` evaluado sobre el ROL DEL PERFIL ACTIVO (no el de
 * la cuenta) — solo admin/editor/moderador pasan; un usuario autenticado
 * sin ese rol es redirigido a Inicio, no a Login.
 */
function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path={ROUTES.LANDING} element={<Landing />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

        <Route element={<ProtectedRoute requireProfile={false} />}>
          <Route path={ROUTES.PROFILE_SELECT} element={<ProfileSelect />} />
        </Route>

        <Route element={<Layout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.EXPLORE} element={<Explore />} />
          <Route path={ROUTES.SEASON} element={<Season />} />
          <Route path={ROUTES.TOP} element={<Top />} />
          <Route path={ROUTES.SEARCH} element={<Search />} />
          <Route path={ROUTES.ANIME_DETAIL} element={<AnimeDetail />} />
          <Route path={ROUTES.ABOUT} element={<About />} />

          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.MY_LIST} element={<MyList />} />
            <Route path={ROUTES.FAVORITES} element={<Favorites />} />
            <Route path={ROUTES.HISTORY} element={<History />} />
            <Route path={ROUTES.PROFILE} element={<Profile />} />
            <Route path={ROUTES.SETTINGS} element={<Settings />} />
          </Route>

          <Route path="*" element={<Placeholder title="404 — No encontrado" />} />
        </Route>

        <Route element={<ProtectedRoute roles={STAFF_ROLES} />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="animes" element={<AdminAnimes />} />
            <Route path="temporadas" element={<AdminSeasons />} />
            <Route path="episodios" element={<AdminEpisodes />} />
            <Route path="personajes" element={<AdminCharacters />} />
            <Route path="estudios" element={<AdminStudios />} />
            <Route path="noticias" element={<AdminNews />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="comentarios" element={<AdminComments />} />
            <Route path="configuracion" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRouter
