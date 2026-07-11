import { motion } from 'framer-motion'
import { Loader2, Star } from 'lucide-react'
import { cn } from '@/utils/cn'

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.15 } },
}

/**
 * Tarjeta de personaje — usada en la grilla de resultados del selector de
 * avatar, en "Recientes"/"Favoritos" (misma forma unificada, ver
 * avatarHistoryService.js), y desde v1.7 también en el grupo "Personajes"
 * de la búsqueda global (`Search.jsx`/`NavbarSearch.jsx`), ahí como tarjeta
 * de solo lectura (`onSelect`/`onToggleFavorite` no se pasan — un personaje
 * no tiene página de detalle propia en esta app, así que no hay acción que
 * ofrecer más que mostrarlo). La estrella de favorito, cuando existe, es
 * siempre visible (no gateada por hover — misma lección del sprint móvil
 * con AnimeCard: hover-only rompe en touch).
 */
function AvatarCandidateCard({ character, onSelect, selecting, onToggleFavorite, favoritePending }) {
  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -3 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      {onToggleFavorite && (
        <button
          type="button"
          onClick={() => onToggleFavorite(character)}
          disabled={favoritePending}
          aria-label={character.isFavorite ? `Quitar ${character.name} de favoritos` : `Marcar ${character.name} como favorito`}
          aria-pressed={Boolean(character.isFavorite)}
          className="absolute right-1 top-1 z-10 flex min-h-11 min-w-11 items-center justify-center text-text drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition-transform hover:scale-110 disabled:opacity-50"
        >
          <Star size={16} className={character.isFavorite ? 'text-primary' : ''} fill={character.isFavorite ? 'currentColor' : 'none'} />
        </button>
      )}

      <div className="aspect-square w-full overflow-hidden bg-hover">
        {character.image ? (
          <img
            src={character.image}
            alt={character.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-secondary">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="truncate text-sm font-medium text-text">{character.name}</p>
        {character.anime && <p className="truncate text-xs text-text-secondary">{character.anime}</p>}
        {character.role && (
          <span className="inline-flex w-fit items-center rounded-full border border-border px-2 py-0.5 text-[10px] text-text-secondary">
            {character.role}
          </span>
        )}

        {onSelect && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(character)}
            disabled={selecting}
            className={cn(
              'mt-auto flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60',
            )}
          >
            {selecting && <Loader2 size={14} className="animate-spin" />}
            Seleccionar
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default AvatarCandidateCard
