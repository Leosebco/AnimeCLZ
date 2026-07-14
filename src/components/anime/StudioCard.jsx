import { Clapperboard, ExternalLink } from 'lucide-react'

/**
 * Tarjeta de estudio (v2.3, +`siteUrl` en v2.7) — el nombre viene de
 * `anime.studios` (array de strings, Jikan). Logo y descripción siguen sin
 * fuente real disponible — no se fabrica ninguno de los dos (ver informe de
 * entrega v2.3). v2.7 agrega un enlace opcional a la página real del
 * estudio en AniList (`anime.studioLinks`, `AnimeDetail.jsx` resuelve el
 * match por nombre) — si no hay coincidencia, la tarjeta se ve exactamente
 * igual que antes (`<div>`, sin link).
 */
function StudioCard({ name, siteUrl }) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hover text-primary">
        <Clapperboard size={18} aria-hidden />
      </span>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-text">{name}</p>
      {siteUrl && <ExternalLink size={14} className="shrink-0 text-text-secondary" aria-hidden />}
    </>
  )

  if (siteUrl) {
    return (
      <a
        href={siteUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-hover/40"
      >
        {content}
      </a>
    )
  }

  return <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">{content}</div>
}

export default StudioCard
