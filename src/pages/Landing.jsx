import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Code2,
  HelpCircle,
  Mail,
  Github,
  Play,
  Heart,
  Users,
  LayoutDashboard,
  Lock,
  Camera,
  Clapperboard,
  Palette,
  UserRound,
} from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import Footer from '@/layout/Footer'
import useFetch from '@/hooks/useFetch'
import { useAuth } from '@/hooks/useAuth'
import { getTopRated } from '@/providers/AnimeProvider'
import { ROUTES, GENRES, THEMES } from '@/constants'

const SECTIONS = [
  { id: 'caracteristicas', label: 'Características', icon: LayoutDashboard },
  { id: 'capturas', label: 'Capturas', icon: Camera },
  { id: 'tecnologias', label: 'Tecnologías', icon: Code2 },
  { id: 'preguntas-frecuentes', label: 'FAQ', icon: HelpCircle },
  { id: 'contacto', label: 'Contacto', icon: Mail },
]

const FEATURES = [
  {
    icon: Play,
    title: 'Catálogo real',
    description: 'Temporadas, rankings y búsqueda con datos reales de MyAnimeList vía Jikan.',
  },
  {
    icon: Heart,
    title: 'Favoritos y Mi Lista',
    description: 'Lo que te gusta y lo que quieres ver después, en dos listas separadas.',
  },
  {
    icon: Users,
    title: 'Perfiles múltiples',
    description: 'Una cuenta, varios perfiles — nombre, avatar y color propios, estilo Netflix.',
  },
  {
    icon: Palette,
    title: '7 temas de color',
    description: 'Elige tu paleta favorita — se guarda con tu perfil en cualquier dispositivo.',
  },
  {
    icon: LayoutDashboard,
    title: 'Panel de Administración',
    description: 'Roles y un panel de gestión completamente separado del sitio público.',
  },
  {
    icon: Lock,
    title: 'Cuentas seguras',
    description: 'Supabase + Row Level Security: cada cuenta solo accede a lo suyo.',
  },
]

const TECHNOLOGIES = [
  'React 19', 'Vite', 'Tailwind CSS v4', 'Framer Motion',
  'React Router', 'Supabase', 'Jikan API', 'Headless UI',
]

const FAQS = [
  {
    question: '¿AnimeCLZ es un servicio oficial de streaming?',
    answer: 'No. Es un proyecto de portafolio con datos reales de MyAnimeList (vía Jikan) — no aloja ni transmite video.',
  },
  {
    question: '¿Por qué a veces la búsqueda tarda?',
    answer: 'Depende de un servicio externo gratuito con límites de uso — reintentamos automáticamente.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer: 'Sí — Supabase con Row Level Security: cada cuenta solo accede a su propia información.',
  },
  {
    question: '¿Puedo tener varios perfiles?',
    answer: 'Sí, como en los servicios de streaming conocidos — cada uno con su propio nombre, avatar y color.',
  },
]

// Envoltorio compartido para la animación "aparece al hacer scroll" — la
// misma en cada sección (fade + slide corto, una sola vez), sin repetir
// las mismas props de Framer Motion en los 6 lugares donde se usa.
function Reveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function LandingHeader() {
  const { isAuthenticated } = useAuth()
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <Link to={ROUTES.LANDING} className="flex items-center gap-2 font-display text-lg font-bold text-text">
          <Clapperboard className="text-primary" size={22} aria-hidden />
          AnimeCLZ
        </Link>
        {isAuthenticated ? (
          <Button as={Link} to={ROUTES.HOME} size="sm">
            Ir a la app
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.LOGIN}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-hover hover:text-text"
            >
              Iniciar sesión
            </Link>
            <Button as={Link} to={ROUTES.REGISTER} size="sm">
              Crear cuenta
            </Button>
          </div>
        )}
      </Container>
    </header>
  )
}

function CatalogStats() {
  const { data, loading } = useFetch((signal) => getTopRated({ limit: 1 }, signal), [], {
    cacheKey: 'landing:catalog-stats',
    cacheTTL: 30 * 60 * 1000,
  })

  const totalAnime = data?.pagination?.total

  const stats = [
    {
      value: loading ? null : totalAnime ? `+${totalAnime.toLocaleString('es-419')}` : '—',
      label: 'Animes en el catálogo',
    },
    { value: `${GENRES.length}`, label: 'Géneros' },
    { value: `${THEMES.length}`, label: 'Temas de color' },
    { value: '24/7', label: 'Catálogo en vivo' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 text-center">
          {stat.value === null ? (
            <Skeleton className="mx-auto h-8 w-16" />
          ) : (
            <p className="font-display text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p>
          )}
          <p className="mt-1.5 text-xs text-text-secondary sm:text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Landing pública de AnimeCLZ (v1.0: rediseño completo, mucho más visual
 * y con mucho menos texto que la versión anterior — ver ROADMAP.md).
 * Vive fuera del Layout público (como Login/Register): header propio +
 * Footer reutilizado, para no mostrar enlaces que requieren sesión
 * (Favoritos/Mi Lista/Historial) a un visitante sin cuenta.
 */
function Landing() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const handleExplore = () => {
    navigate(isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <LandingHeader />

      {/* Hero — fondo animado con blobs de gradiente suaves (nunca a toda
          pantalla saturado, ver DESIGN.md) */}
      <section className="relative overflow-hidden px-4 pb-24 pt-24 text-center sm:pt-32">
        <motion.div
          className="pointer-events-none absolute -top-40 left-1/4 -z-10 h-[30rem] w-[30rem] rounded-full bg-primary/25 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -top-24 right-1/4 -z-10 h-[26rem] w-[26rem] rounded-full bg-secondary/20 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />

        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-text-secondary"
        >
          <Sparkles size={13} className="text-primary" aria-hidden />
          Catálogo real, actualizado en vivo
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl font-display text-4xl font-bold leading-tight text-text sm:text-6xl"
        >
          Tu próximo anime favorito empieza aquí
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-4 max-w-md text-sm text-text-secondary sm:text-base"
        >
          Explora, guarda y sigue anime — con datos reales y tu propio perfil.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-9 flex justify-center"
        >
          <Button size="lg" onClick={handleExplore}>
            <Play size={18} fill="currentColor" />
            Explorar Anime
          </Button>
        </motion.div>
      </section>

      <Reveal className="px-4">
        <nav aria-label="Secciones de esta página" className="flex flex-wrap justify-center gap-2">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary/50 hover:text-text"
            >
              <section.icon size={13} aria-hidden />
              {section.label}
            </a>
          ))}
        </nav>
      </Reveal>

      <Container className="max-w-5xl pb-24">
        <div className="mt-16 flex flex-col gap-24">
          <section id="caracteristicas" className="scroll-mt-24">
            <Reveal>
              <h2 className="text-center font-display text-2xl font-bold text-text sm:text-3xl">
                Todo lo que necesitas
              </h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, index) => (
                <Reveal key={feature.title} delay={index * 0.05}>
                  <div className="h-full rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-hover text-primary">
                      <feature.icon size={20} aria-hidden />
                    </span>
                    <p className="mt-3 font-display text-sm font-semibold text-text">{feature.title}</p>
                    <p className="mt-1.5 text-sm text-text-secondary">{feature.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="estadisticas" className="scroll-mt-24">
            <Reveal>
              <CatalogStats />
            </Reveal>
          </section>

          <section id="capturas" className="scroll-mt-24">
            <Reveal>
              <h2 className="text-center font-display text-2xl font-bold text-text sm:text-3xl">
                Así se ve AnimeCLZ
              </h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {['Home', 'Ficha de detalle', 'Panel de administración'].map((label, index) => (
                <Reveal key={label} delay={index * 0.08}>
                  <div className="group flex aspect-video flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 text-text-secondary transition-colors hover:border-primary/50">
                    <Camera size={24} className="transition-transform group-hover:scale-110" aria-hidden />
                    <span className="text-xs">{label}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="tecnologias" className="scroll-mt-24">
            <Reveal>
              <h2 className="text-center font-display text-2xl font-bold text-text sm:text-3xl">
                Tecnologías
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                {TECHNOLOGIES.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Reveal>
          </section>

          <section id="equipo" className="scroll-mt-24">
            <Reveal>
              <h2 className="text-center font-display text-2xl font-bold text-text sm:text-3xl">Equipo</h2>
            </Reveal>
            <Reveal delay={0.1} className="mt-8 flex justify-center">
              <div className="flex max-w-xs flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-hover text-primary">
                  <UserRound size={28} aria-hidden />
                </span>
                <p className="font-display text-sm font-semibold text-text">Desarrollador de AnimeCLZ</p>
                <p className="text-xs text-text-secondary">
                  Proyecto individual — diseño, frontend y arquitectura completa.
                </p>
              </div>
            </Reveal>
          </section>

          <section id="preguntas-frecuentes" className="scroll-mt-24">
            <Reveal>
              <h2 className="text-center font-display text-2xl font-bold text-text sm:text-3xl">
                Preguntas frecuentes
              </h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FAQS.map((faq, index) => (
                <Reveal key={faq.question} delay={index * 0.05}>
                  <div className="h-full rounded-xl border border-border bg-card p-4">
                    <p className="font-display text-sm font-semibold text-text">{faq.question}</p>
                    <p className="mt-1.5 text-sm text-text-secondary">{faq.answer}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="contacto" className="scroll-mt-24 text-center">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">Hablemos</h2>
              <p className="mt-2 text-sm text-text-secondary">¿Preguntas o encontraste un error? Escríbenos.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <a
                  href="mailto:contacto@animeclz.app"
                  className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:border-primary/50 hover:text-text"
                >
                  <Mail size={16} aria-hidden />
                  contacto@animeclz.app
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:border-primary/50 hover:text-text"
                >
                  <Github size={16} aria-hidden />
                  GitHub
                </a>
              </div>
            </Reveal>
          </section>

          {/* Legal — condensado a propósito (v1.0: "poco texto"); el
              detalle completo vivía aquí en versiones anteriores, ver
              git history si hace falta restaurar el texto largo. */}
          <section id="privacidad" className="scroll-mt-24 border-t border-border pt-8 text-xs text-text-secondary">
            <p className="font-display text-sm font-semibold text-text">Privacidad</p>
            <p className="mt-2">
              Guardamos solo lo necesario para tu cuenta y tus perfiles (Supabase, con Row Level
              Security) — nunca vendemos ni compartimos tu información. Puedes pedir la eliminación de tu
              cuenta escribiéndonos.
            </p>
          </section>

          <section id="terminos" className="scroll-mt-24 text-xs text-text-secondary">
            <p className="font-display text-sm font-semibold text-text">Términos</p>
            <p className="mt-2">
              AnimeCLZ es un proyecto en desarrollo continuo, sin garantía de disponibilidad
              ininterrumpida — el catálogo depende de proveedores externos gratuitos. El contenido de
              anime pertenece a sus respectivos titulares; se muestra solo con fines informativos.
            </p>
          </section>
        </div>
      </Container>

      <Footer />
    </div>
  )
}

export default Landing
