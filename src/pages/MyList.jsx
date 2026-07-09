import { Heart } from 'lucide-react'
import Container from '@/components/ui/Container'
import EmptyState from '@/components/ui/EmptyState'
import AnimeCard from '@/components/movie/AnimeCard'
import { useFavorites } from '@/context/FavoritesContext'

function MyList() {
  const { favorites } = useFavorites()

  return (
    <Container className="pt-28 pb-16">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Mi Lista</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Los animes que has guardado para ver más tarde.
      </p>

      <div className="mt-8">
        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Tu lista está vacía"
            description="Agrega animes desde el inicio o el catálogo tocando el corazón de cualquier tarjeta."
          />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {favorites.map((movie) => (
              <AnimeCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export default MyList
