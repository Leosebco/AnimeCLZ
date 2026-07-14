import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Gauge,
  Lock,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  SkipBack,
  SkipForward,
  Subtitles,
  Unlock,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import SourceSelector from './SourceSelector'
import { PLAYBACK_RATE_OPTIONS } from './usePlayerState'
import { cn } from '@/utils/cn'

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = String(total % 60).padStart(2, '0')
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${secs}`
  return `${minutes}:${secs}`
}

/**
 * Controles del reproductor — barra superior (volver + bloqueo), centro
 * (play/pause + episodio anterior/siguiente), barra inferior (progreso con
 * buffer real, volumen, velocidad, subtítulos, fuente, PiP, fullscreen).
 * `.safe-top`/`.safe-bottom` en la barra de controles (no en todo el
 * reproductor, para no duplicar padding — mismo criterio del sprint móvil
 * anterior).
 */
function PlayerControls({
  visible,
  player,
  sources,
  selectedSourceId,
  onSourceChange,
  subtitleLanguages,
  backHref,
  title,
  onPrevEpisode,
  onNextEpisode,
  hasPrevEpisode,
  hasNextEpisode,
  locked,
  onToggleLock,
}) {
  const [rateMenuOpen, setRateMenuOpen] = useState(false)

  const progressPercent = player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0
  const bufferedPercent = player.duration > 0 ? (player.buffered / player.duration) * 100 : 0

  const handleSeekClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    player.seek(ratio * player.duration)
  }

  if (locked) {
    return (
      <button
        type="button"
        onClick={onToggleLock}
        aria-label="Desbloquear controles"
        className="safe-bottom absolute bottom-4 right-4 z-20 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-background/60 text-white backdrop-blur-sm"
      >
        <Lock size={18} />
      </button>
    )
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.15 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-background/90 via-transparent to-background/60"
        >
          <div className="safe-top flex items-center gap-3 p-4">
            <Link
              to={backHref}
              aria-label="Volver"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <ArrowLeft size={20} />
            </Link>
            <p className="truncate text-sm font-medium text-white">{title}</p>
            <button
              type="button"
              onClick={onToggleLock}
              aria-label="Bloquear controles"
              className="ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <Unlock size={18} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-8">
            <button
              type="button"
              onClick={onPrevEpisode}
              disabled={!hasPrevEpisode}
              aria-label="Episodio anterior"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
            >
              <SkipBack size={22} fill="currentColor" />
            </button>
            <button
              type="button"
              onClick={player.togglePlay}
              aria-label={player.playing ? 'Pausar' : 'Reproducir'}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              {player.playing ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" className="ml-1" />
              )}
            </button>
            <button
              type="button"
              onClick={onNextEpisode}
              disabled={!hasNextEpisode}
              aria-label="Episodio siguiente"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-30"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>
          </div>

          <div className="safe-bottom flex flex-col gap-2 p-4">
            <div
              role="slider"
              aria-label="Progreso"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPercent)}
              tabIndex={0}
              onClick={handleSeekClick}
              className="group relative flex h-4 cursor-pointer items-center"
            >
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full bg-white/40" style={{ width: `${bufferedPercent}%` }} />
              </div>
              <div className="absolute h-1 rounded-full bg-primary" style={{ width: `${progressPercent}%` }} />
              <div
                className="absolute h-3 w-3 -translate-x-1/2 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `${progressPercent}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-white sm:gap-3">
              <button
                type="button"
                onClick={player.togglePlay}
                aria-label={player.playing ? 'Pausar' : 'Reproducir'}
                className="flex min-h-11 min-w-11 items-center justify-center"
              >
                {player.playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>

              <button
                type="button"
                onClick={player.toggleMute}
                aria-label={player.muted ? 'Activar sonido' : 'Silenciar'}
                className="flex min-h-11 min-w-11 items-center justify-center"
              >
                {player.muted || player.volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={player.muted ? 0 : player.volume}
                onChange={(event) => player.setVolumeLevel(Number(event.target.value))}
                aria-label="Volumen"
                className="h-1 w-16 accent-primary sm:w-20"
              />

              <span className="text-xs tabular-nums text-white/80">
                {formatTime(player.currentTime)} / {formatTime(player.duration)}
              </span>

              <div className="ml-auto flex items-center gap-1">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRateMenuOpen((value) => !value)}
                    aria-label="Velocidad de reproducción"
                    className="flex min-h-11 items-center gap-1 rounded-full px-2 text-xs text-white transition-colors hover:bg-white/10"
                  >
                    <Gauge size={16} aria-hidden />
                    {player.playbackRate}x
                  </button>
                  <AnimatePresence>
                    {rateMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
                        exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
                        className="absolute bottom-full right-0 mb-2 w-24 rounded-xl border border-white/10 bg-surface/95 p-1 shadow-2xl backdrop-blur-xl"
                      >
                        {PLAYBACK_RATE_OPTIONS.map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              player.setPlaybackRate(rate)
                              setRateMenuOpen(false)
                            }}
                            className={cn(
                              'block w-full rounded-lg px-2 py-1.5 text-left text-xs',
                              rate === player.playbackRate ? 'text-primary' : 'text-text-secondary hover:text-text',
                            )}
                          >
                            {rate}x
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Si el proveedor no tiene subtítulos, se oculta
                    automáticamente — hoy AnimeThemes nunca los tiene, así
                    que este botón simplemente no se renderiza. */}
                {subtitleLanguages?.length > 0 && (
                  <button
                    type="button"
                    aria-label="Subtítulos"
                    className="flex min-h-11 min-w-11 items-center justify-center"
                  >
                    <Subtitles size={18} />
                  </button>
                )}

                <SourceSelector sources={sources} selectedId={selectedSourceId} onChange={onSourceChange} />

                <button
                  type="button"
                  onClick={player.togglePiP}
                  aria-label="Picture in Picture"
                  className="flex min-h-11 min-w-11 items-center justify-center"
                >
                  <PictureInPicture2 size={18} />
                </button>

                <button
                  type="button"
                  onClick={player.toggleFullscreen}
                  aria-label={player.isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                  className="flex min-h-11 min-w-11 items-center justify-center"
                >
                  {player.isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PlayerControls
