import { memo } from 'react'
import { Globe, ExternalLink } from 'lucide-react'

/**
 * Enlace oficial (v2.7 — Media Hub): sitio oficial, redes, etc. — todo lo
 * que `AniListProvider.getAnime()` clasifica como NO streaming (ver
 * `mapExternalLinks`). `icon` casi nunca viene para este tipo de enlace
 * (confirmado en vivo: solo las plataformas de streaming lo traen), así
 * que cae a un ícono genérico en vez de dejar un hueco vacío.
 */
function ExternalLinkCard({ link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer noopener"
      className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-text transition-colors hover:border-primary/40 hover:bg-hover/40"
    >
      {link.icon ? (
        <img src={link.icon} alt="" loading="lazy" className="h-6 w-6 shrink-0 rounded object-contain" />
      ) : (
        <Globe size={18} className="shrink-0 text-text-secondary" aria-hidden />
      )}
      <span className="min-w-0 flex-1 truncate font-medium">{link.name}</span>
      <ExternalLink size={14} className="shrink-0 text-text-secondary" aria-hidden />
    </a>
  )
}

export default memo(ExternalLinkCard)
