import { useRef, useState } from 'react'
import { Play, Pause, Music2 } from 'lucide-react'

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return null
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

/**
 * Tarjeta de Opening/Ending (v2.3) — reproduce el clip real de AnimeThemes
 * inline, `<video>` nativo sin autoplay (arranca en pausa, el usuario
 * decide). No toca `PlaybackProviderManager`/`AnimeThemesProvider`, solo
 * lee su catálogo ya existente (`getEpisodes()`, sin modificar). "Artista"
 * no se muestra: el catálogo mapeado hoy no incluye ese dato (ver informe
 * de entrega — agregarlo requeriría tocar el `include` de la consulta a
 * AnimeThemes, fuera de alcance de este sprint por la restricción de no
 * tocar Playback). La duración se lee del propio `<video>` una vez carga
 * sus metadatos — un valor real, nunca inventado.
 */
function ThemeSongCard({ theme }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(null)

  const video = theme.entries?.[0]?.videos?.[0]
  if (!video?.link) return null

  const label = theme.type === 'OP' ? 'Opening' : 'Ending'
  const sequenceLabel = theme.sequence ? `${theme.type}${theme.sequence}` : theme.type

  const togglePlay = () => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      el.play()
      setPlaying(true)
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-video w-full bg-surface">
        <video
          ref={videoRef}
          src={video.link}
          playsInline
          controls={playing}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          className="h-full w-full object-cover"
        />
        {!playing && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={`Reproducir ${label}`}
            className="absolute inset-0 flex items-center justify-center bg-background/40 transition-colors hover:bg-background/55"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/70 text-text backdrop-blur-sm">
              <Play size={22} fill="currentColor" />
            </span>
          </button>
        )}
        {playing && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={`Pausar ${label}`}
            className="absolute right-2 top-2 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-background/70 text-text backdrop-blur-sm"
          >
            <Pause size={16} fill="currentColor" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 p-3">
        <Music2 size={14} className="shrink-0 text-primary" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text">{theme.songTitle || sequenceLabel}</p>
          <p className="text-xs text-text-secondary">
            {sequenceLabel}
            {duration && ` · ${formatDuration(duration)}`}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ThemeSongCard
