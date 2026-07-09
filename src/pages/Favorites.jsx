import { Heart } from 'lucide-react'
import Container from '@/components/ui/Container'
import EmptyState from '@/components/ui/EmptyState'
import AnimeCard from '@/components/movie/AnimeCard'
import { useFavorites } from '@/context/FavoritesContext'

function Favorites() {
  const { favorites } = useFavorites()

  return (
    <Container className="pt-28 pb-16">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Favoritos</h1>
      <p className="mt-1 text-sm text-text-secondary">Los animes que marcaste con ♥.</p>

      <div className="mt-8">
        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Aún no tienes favoritos"
            description="Toca el corazón de cualquier tarjeta para guardarla aquí."
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

export default Favorites
