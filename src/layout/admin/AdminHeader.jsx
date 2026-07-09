import { Menu } from 'lucide-react'
import AccountMenu from '@/layout/AccountMenu'

// El rol ya se muestra en el propio trigger de AccountMenu (avatar +
// nombre + rol del perfil activo) — repetirlo aquí sería redundante.
function AdminHeader({ onOpenMobileMenu }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={onOpenMobileMenu}
        className="rounded-full p-2 text-text-secondary transition-colors hover:bg-hover hover:text-text md:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <AccountMenu />
    </header>
  )
}

export default AdminHeader
