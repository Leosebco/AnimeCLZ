import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

// Hitos reales y ya construidos (ver ROADMAP.md para el detalle completo
// de cada uno) — condensados a los más representativos, nunca versiones
// inventadas. "Futuro" es lo próximo real de ROADMAP.md (Sprint 5/6), no
// una promesa de marketing.
const MILESTONES = [
  { version: 'v0.9', label: 'Cuentas y autenticación', done: true },
  { version: 'v1.5', label: 'Perfiles múltiples por cuenta', done: true },
  { version: 'v1.9', label: 'Motor multi-proveedor de datos', done: true },
  { version: 'v2.1', label: 'Sistema de reproducción real', done: true },
  { version: 'v2.4', label: 'Buscador inteligente', done: true },
  { version: 'Futuro', label: 'CRUD completo y proveedor de video con licencia', done: false },
]

/**
 * Roadmap visual (v2.5, sección nueva) — timeline horizontal en desktop,
 * vertical en mobile. Datos reales de ROADMAP.md, condensados a 6 hitos —
 * nunca se inventa una versión que no existió.
 */
function RoadmapTimeline() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-0">
      {MILESTONES.map((milestone, index) => (
        <motion.div
          key={milestone.version}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: index * 0.06 }}
          className="relative flex flex-1 flex-col items-start gap-2 sm:items-center sm:text-center"
        >
          {index > 0 && (
            <span className="absolute left-[11px] top-0 h-full w-px bg-border sm:left-0 sm:top-3 sm:h-px sm:w-1/2" aria-hidden />
          )}
          {index < MILESTONES.length - 1 && (
            <span className="absolute left-[11px] top-0 h-full w-px bg-border sm:left-1/2 sm:top-3 sm:h-px sm:w-1/2" aria-hidden />
          )}
          <span
            className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${
              milestone.done ? 'bg-primary text-on-primary' : 'bg-card text-text-secondary ring-1 ring-border'
            }`}
          >
            {milestone.done ? <CheckCircle2 size={16} /> : <Circle size={14} />}
          </span>
          <p className="font-display text-sm font-semibold text-text">{milestone.version}</p>
          <p className="max-w-[10rem] text-xs text-text-secondary">{milestone.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default RoadmapTimeline
