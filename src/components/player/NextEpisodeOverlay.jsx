import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

const COUNTDOWN_SECONDS = 5

/**
 * Overlay de autoplay al terminar un episodio — cuenta regresiva 5→0 y
 * navega al siguiente episodio salvo cancelación. Gateado por
 * `activeProfile.autoplay` en `VideoPlayer.jsx` (este componente solo se
 * monta/vuelve visible cuando esa preferencia ya está en `true`).
 */
function NextEpisodeOverlay({ visible, nextEpisodeLabel, onConfirm, onCancel }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS)

  useEffect(() => {
    if (!visible) {
      setSecondsLeft(COUNTDOWN_SECONDS)
      return
    }
    if (secondsLeft <= 0) {
      onConfirm()
      return
    }
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [visible, secondsLeft, onConfirm])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur-sm"
        >
          <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-text-secondary">Siguiente episodio en</p>
            <span className="font-display text-5xl font-bold text-primary">{secondsLeft}</span>
            {nextEpisodeLabel && <p className="text-sm text-text">{nextEpisodeLabel}</p>}
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={onConfirm}
                className="flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
              >
                Reproducir ahora
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex min-h-11 items-center gap-1 rounded-full border border-border px-5 text-sm text-text-secondary transition-colors hover:text-text"
              >
                <X size={14} aria-hidden />
                Cancelar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NextEpisodeOverlay
