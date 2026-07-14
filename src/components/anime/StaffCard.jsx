import { memo } from 'react'
import { UserRound } from 'lucide-react'

/**
 * Tarjeta de staff (v2.7 — Media Hub). Mismo lenguaje visual que
 * `CharacterCard.jsx` (avatar circular + nombre + rol) — staff y personajes
 * comparten esa forma, así que se reutiliza el patrón en vez de inventar
 * uno nuevo. `image` puede venir `null` (AniList no siempre tiene foto de
 * cada miembro del staff, ver informe de entrega) — se muestra un ícono
 * genérico en vez de un `<img>` roto.
 */
function StaffCard({ member }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-hover/40">
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-border"
        />
      ) : (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-hover text-text-secondary ring-2 ring-border">
          <UserRound size={24} aria-hidden />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold text-text">{member.name}</p>
        {member.role && <p className="mt-0.5 truncate text-xs text-text-secondary">{member.role}</p>}
      </div>
    </div>
  )
}

export default memo(StaffCard)
