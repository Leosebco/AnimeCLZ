import { Link } from 'react-router-dom'
import Container from '@/components/ui/Container'
import { GENRES, ROUTES } from '@/constants'

function GenreNav() {
  return (
    <section className="py-6 sm:py-8">
      <Container>
        <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">🎭 Géneros</h2>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <Link
              key={genre.id}
              to={`${ROUTES.EXPLORE}?genre=${genre.id}`}
              className="rounded-full border border-border bg-surface-hover px-4 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:text-text"
            >
              {genre.label}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default GenreNav
