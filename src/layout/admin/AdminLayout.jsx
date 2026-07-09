import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

/**
 * Shell del panel de administración — completamente separado del `Layout`
 * público (sin Navbar/Footer del sitio): sidebar + header propios,
 * montados vía <Outlet /> igual que el layout público.
 */
function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
