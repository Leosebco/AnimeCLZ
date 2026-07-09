import { Bookmark } from 'lucide-react'
import Container from '@/components/ui/Container'
import EmptyState from '@/components/ui/EmptyState'
import AnimeCard from '@/components/movie/AnimeCard'
import { useWatchLater } from '@/context/WatchLaterContext'

function MyList() {
  const { watchLater } = useWatchLater()

  return (
    <Container className="pt-28 pb-16">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Mi Lista</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Los animes que has guardado para ver más tarde.
      </p>

      <div className="mt-8">
        {watchLater.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Tu lista está vacía"
            description="Agrega animes desde el inicio o el catálogo para verlos más tarde."
          />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {watchLater.map((movie) => (
              <AnimeCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export default MyList
