function CharacterCard({ character }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-hover p-3 transition-colors hover:border-primary/40">
      <img
        src={character.image}
        alt={character.name}
        loading="lazy"
        className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-border"
      />
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold text-text">{character.name}</p>
        <p className="text-xs text-text-secondary">{character.role}</p>
        {character.voiceActor && (
          <p className="mt-0.5 truncate text-xs text-text-secondary">{character.voiceActor}</p>
        )}
      </div>
    </div>
  )
}

export default CharacterCard
