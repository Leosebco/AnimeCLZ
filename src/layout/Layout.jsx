import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'

/**
 * Root layout rendered once by the router. Every page is injected
 * via <Outlet /> between a persistent Navbar and Footer, so scroll
 * position, nav state, etc. survive page transitions. The AnimatePresence
 * wrapper gives every route change a short, consistent fade/slide instead
 * of an instant, jarring swap.
 */
function Layout() {
  const location = useLocation()

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
