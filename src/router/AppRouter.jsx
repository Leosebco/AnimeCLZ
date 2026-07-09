import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/layout/Layout'
import Container from '@/components/ui/Container'
import Skeleton from '@/components/ui/Skeleton'
import { ROUTES } from '@/constants'

// Route-level code splitting: each page ships in its own chunk and only
// loads when the user actually navigates there.
const Home = lazy(() => import('@/pages/Home'))
const Explore = lazy(() => import('@/pages/Explore'))
const Season = lazy(() => import('@/pages/Season'))
const Top = lazy(() => import('@/pages/Top'))
const MyList = lazy(() => import('@/pages/MyList'))
const Search = lazy(() => import('@/pages/Search'))
const AnimeDetail = lazy(() => import('@/pages/AnimeDetail'))
const Placeholder = lazy(() => import('@/pages/Placeholder'))

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
 * across navigation. Perfil stays a Placeholder until Sprint 4 (Firebase
 * auth) gives it something real to show.
 */
function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.EXPLORE} element={<Explore />} />
          <Route path={ROUTES.SEASON} element={<Season />} />
          <Route path={ROUTES.TOP} element={<Top />} />
          <Route path={ROUTES.MY_LIST} element={<MyList />} />
          <Route path={ROUTES.SEARCH} element={<Search />} />
          <Route path={ROUTES.PROFILE} element={<Placeholder title="Perfil" />} />
          <Route path={ROUTES.ANIME_DETAIL} element={<AnimeDetail />} />
          <Route path="*" element={<Placeholder title="404 — No encontrado" />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRouter
