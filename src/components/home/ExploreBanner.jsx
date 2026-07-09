import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { ROUTES } from '@/constants'

function ExploreBanner() {
  return (
    <section className="py-6 sm:py-8">
      <Container>
        <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-surface px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-hover text-primary">
              <Compass size={22} aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-text sm:text-xl">¿No sabes qué ver?</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Explora todo el catálogo con filtros por género, tipo, año y popularidad.
              </p>
            </div>
          </div>
          <Button as={Link} to={ROUTES.EXPLORE} size="lg" className="shrink-0">
            Explorar catálogo
          </Button>
        </div>
      </Container>
    </section>
  )
}

export default ExploreBanner
