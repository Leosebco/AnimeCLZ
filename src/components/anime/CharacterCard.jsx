import { memo } from 'react'

// Jikan solo reporta 'Main'/'Supporting' — hoy `getAnimeCharacters()`
// filtra a únicamente 'Main' antes de llegar acá (ver informe de entrega
// v2.3), así que 'Secundario' no aparece todavía en la práctica, pero el
// componente ya soporta ambos rótulos sin necesitar otro cambio cuando esa
// limitación se resuelva.
const ROLE_LABELS = { Main: 'Principal', Supporting: 'Secundario' }

function CharacterCard({ character }) {
  const roleLabel = ROLE_LABELS[character.role] || character.role
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-hover/40">
      <img
        src={character.image}
        alt={character.name}
        loading="lazy"
        className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-border"
      />
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold text-text">{character.name}</p>
        {roleLabel && (
          <span className="mt-0.5 inline-flex rounded-full border border-border px-2 py-0.5 text-[11px] text-text-secondary">
            {roleLabel}
          </span>
        )}
        {character.voiceActor && (
          <p className="mt-1 truncate text-xs text-text-secondary">{character.voiceActor}</p>
        )}
      </div>
    </div>
  )
}

export default memo(CharacterCard)
