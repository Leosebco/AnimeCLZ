import { motion } from 'framer-motion'
import { UserPlus, UsersRound, PlayCircle, ArrowRight } from 'lucide-react'

const STEPS = [
  { icon: UserPlus, title: 'Crea tu cuenta', description: 'Con correo o Google, en segundos.' },
  { icon: UsersRound, title: 'Elige tu perfil', description: 'Hasta 4 por cuenta — cada uno con su identidad.' },
  { icon: PlayCircle, title: 'Disfruta anime', description: 'Explora, guarda y sigue tu catálogo real.' },
]

/**
 * "Cómo funciona" (v2.5, sección nueva pedida por docs/10_LANDING_PAGE.md —
 * no existía en la Landing v1.0). Tres pasos, solo ícono + título + una
 * línea — nunca un párrafo (regla explícita del propio doc: "Con
 * ilustraciones", "nunca texto para llenar espacio").
 */
function HowItWorks() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {STEPS.map((step, index) => (
        <div key={step.title} className="relative flex flex-col items-center gap-3 text-center">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: index * 0.1, type: 'spring', stiffness: 200 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-hover text-primary"
          >
            <step.icon size={26} aria-hidden />
          </motion.span>
          <p className="font-display text-sm font-semibold text-text">{step.title}</p>
          <p className="max-w-[16rem] text-sm text-text-secondary">{step.description}</p>

          {index < STEPS.length - 1 && (
            <ArrowRight
              size={18}
              className="absolute -right-2 top-6 hidden text-border sm:block"
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default HowItWorks
