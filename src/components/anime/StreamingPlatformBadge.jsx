import { memo } from 'react'
import { Tv, ExternalLink } from 'lucide-react'

/**
 * Badge de plataforma de streaming oficial (v2.7 — Media Hub) — Crunchyroll,
 * Netflix, Hulu, etc., vía `AniListProvider.getAnime().streamingPlatforms`.
 * `color` es el color de marca REAL de cada plataforma (servido por
 * AniList) — se usa solo como acento puntual (punto + borde izquierdo), no
 * como fondo grande, mismo criterio de "gradientes/color solo suave" que ya
 * aplica el resto de la app (ver CLAUDE.md Diseño). No es una excepción a
 * la paleta de marca de AnimeCLZ: es branding ajeno, de terceros reales.
 */
function StreamingPlatformBadge({ platform }) {
  const accent = platform.color || 'var(--color-border)'
  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noreferrer noopener"
      style={{ borderLeftColor: accent }}
      className="flex min-h-11 items-center gap-3 rounded-xl border border-border border-l-4 bg-card px-4 py-3 text-sm text-text transition-colors hover:bg-hover/40"
    >
      {platform.icon ? (
        <img src={platform.icon} alt="" loading="lazy" className="h-7 w-7 shrink-0 rounded object-contain" />
      ) : (
        <Tv size={18} className="shrink-0 text-text-secondary" aria-hidden />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{platform.name}</span>
        {platform.note && <span className="block text-xs text-text-secondary">{platform.note}</span>}
      </span>
      <ExternalLink size={14} className="shrink-0 text-text-secondary" aria-hidden />
    </a>
  )
}

export default memo(StreamingPlatformBadge)
