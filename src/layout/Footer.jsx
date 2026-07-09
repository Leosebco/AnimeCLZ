import { Link } from 'react-router-dom'
import { Github, Twitter, Instagram, Clapperboard } from 'lucide-react'
import Container from '@/components/ui/Container'
import { FOOTER_LINKS, ROUTES } from '@/constants'

const SOCIALS = [
  { label: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { label: 'Github', icon: Github, href: 'https://github.com' },
]

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 font-display text-lg font-bold text-text">
              <Clapperboard className="text-primary" size={20} aria-hidden />
              AnimeCLZ
            </Link>
            <p className="mt-3 text-sm text-text-secondary max-w-xs">
              Tu plataforma de anime, con catálogo actualizado en tiempo real.
            </p>
            <div className="mt-4 flex gap-3">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="p-2 rounded-full text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-display text-sm font-semibold text-text mb-3">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-sm text-text-secondary hover:text-text transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-secondary">
          <span>&copy; {year} AnimeCLZ. Todos los derechos reservados.</span>
          <span>Catálogo de anime actualizado constantemente.</span>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
