import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ListChecks,
  Code2,
  Boxes,
  HelpCircle,
  Mail,
  Github,
  Play,
  Heart,
  Users,
  LayoutDashboard,
  Smartphone,
  Lock,
  Camera,
  Clapperboard,
} from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import Footer from '@/layout/Footer'
import useFetch from '@/hooks/useFetch'
import { useAuth } from '@/hooks/useAuth'
import { getTopRated } from '@/providers/AnimeProvider'
import { ROUTES, GENRES } from '@/constants'

const SECTIONS = [
  { id: 'que-es', label: 'Qué es AnimeCLZ', icon: Sparkles },
  { id: 'caracteristicas', label: 'Características', icon: LayoutDashboard },
  { id: 'estadisticas', label: 'Estadísticas', icon: Boxes },
  { id: 'tecnologias', label: 'Tecnologías', icon: Code2 },
  { id: 'capturas', label: 'Capturas', icon: Camera },
  { id: 'preguntas-frecuentes', label: 'Preguntas frecuentes', icon: HelpCircle },
  { id: 'contacto', label: 'Contacto', icon: Mail },
]

const FEATURES = [
  {
    icon: Play,
    title: 'Catálogo real y actualizado',
    description: 'Temporadas, top rankings y búsqueda con datos reales de MyAnimeList vía Jikan.',
  },
  {
    icon: Heart,
    title: 'Favoritos y Mi Lista',
    description: 'Guarda lo que te gusta y lo que quieres ver después, en listas separadas y persistentes.',
  },
  {
    icon: Users,
    title: 'Perfiles múltiples',
    description: 'Una cuenta, varios perfiles — cada uno con su propio nombre, avatar y color, estilo Netflix.',
  },
  {
    icon: LayoutDashboard,
    title: 'Panel de Administración',
    description: 'Roles (admin, editor, moderador) con acceso a un panel de gestión separado del sitio público.',
  },
  {
    icon: Lock,
    title: 'Autenticación segura',
    description: 'Cuentas con Supabase: correo/contraseña o Google, con Row Level Security en cada tabla.',
  },
  {
    icon: Smartphone,
    title: 'Responsive y accesible',
    description: 'Pensado para escritorio, tablet y móvil, con foco visible y contraste cuidado.',
  },
]

const TECHNOLOGIES = [
  { name: 'React 19', detail: 'Interfaz de usuario, componentes y hooks.' },
  { name: 'Vite', detail: 'Servidor de desarrollo y build de producción.' },
  { name: 'Tailwind CSS v4', detail: 'Sistema de diseño mediante tokens en CSS.' },
  { name: 'Framer Motion', detail: 'Animaciones y transiciones de página.' },
  { name: 'React Router', detail: 'Enrutamiento y protección de rutas.' },
  { name: 'Supabase', detail: 'Autenticación, base de datos y Storage.' },
  { name: 'Jikan API', detail: 'Catálogo de anime (no oficial de MyAnimeList).' },
  { name: 'Headless UI', detail: 'Componentes accesibles (menús, diálogos, listas).' },
]

const FAQS = [
  {
    question: '¿AnimeCLZ es un servicio oficial de streaming?',
    answer:
      'No. AnimeCLZ es un proyecto de portafolio y aprendizaje: muestra información real de anime (sinopsis, puntuaciones, personajes, episodios) obtenida de Jikan, una API no oficial de MyAnimeList. No aloja ni transmite video.',
  },
  {
    question: '¿Por qué a veces la búsqueda falla o tarda?',
    answer:
      'El catálogo depende de un servicio externo gratuito con límites de uso. Cuando está bajo carga, algunas búsquedas pueden fallar o demorar — reintentamos automáticamente y siempre puedes volver a intentarlo con el botón "Reintentar".',
  },
  {
    question: '¿Mis datos están seguros?',
    answer:
      'La cuenta y los perfiles se guardan en Supabase con Row Level Security: cada cuenta solo puede leer y modificar su propia información. Más detalle en la Política de Privacidad más abajo.',
  },
  {
    question: '¿Puedo tener varios perfiles en una sola cuenta?',
    answer:
      'Sí. Una cuenta (tu inicio de sesión) puede tener varios perfiles — como en los servicios de streaming más conocidos — cada uno con su propio nombre, avatar y color. Solo el rol de administrador de un perfil da acceso al Panel de Administración.',
  },
  {
    question: '¿Puedo sugerir una función o reportar un error?',
    answer: 'Sí — usa cualquiera de los medios listados en la sección de Contacto.',
  },
]

function LandingHeader() {
  const { isAuthenticated } = useAuth()
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
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
      label: 'Animes en el catálogo (MyAnimeList, vía Jikan)',
    },
    { value: `${GENRES.length}`, label: 'Géneros para explorar' },
    { value: '24/7', label: 'Catálogo actualizado en vivo' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-border bg-card p-6 text-center">
          {stat.value === null ? (
            <Skeleton className="mx-auto h-9 w-24" />
          ) : (
            <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
          )}
          <p className="mt-2 text-sm text-text-secondary">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Landing pública de AnimeCLZ (v1.3, ruta `/`) — reemplaza a la antigua
 * página institucional /acerca (ver About.jsx, que ahora solo redirige
 * aquí). Vive fuera del Layout público (como Login/Register): tiene su
 * propio header mínimo y su propio Footer, para no mostrar enlaces que
 * requieren sesión (Favoritos/Mi Lista/Historial) a un visitante que
 * todavía no inició sesión.
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

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-20 text-center sm:pt-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_at_top,rgba(79,140,255,0.18),transparent_65%)]"
          aria-hidden
        />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-text-secondary">
          <Sparkles size={13} className="text-primary" aria-hidden />
          Catálogo real, actualizado en vivo
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-bold leading-tight text-text sm:text-5xl">
          Descubre tu próximo anime favorito
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
          AnimeCLZ es una plataforma para explorar, organizar y seguir anime — con datos reales de
          MyAnimeList, perfiles múltiples y tu propia lista, todo en un solo lugar.
        </p>
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={handleExplore}>
            <Play size={18} fill="currentColor" />
            Explorar Anime
          </Button>
        </div>
      </section>

      <Container className="max-w-4xl pb-20">
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

        <div className="mt-14 flex flex-col gap-16">
          <section id="que-es" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">¿Qué es AnimeCLZ?</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary sm:text-base">
              AnimeCLZ es una plataforma web para descubrir, explorar y organizar anime: catálogo por
              temporada, buscador con autocompletado, fichas de detalle completas (personajes, episodios,
              estudios, relacionados) y listas personales — Favoritos y Mi Lista — asociadas a tu cuenta.
              Toda la información de anime que ves proviene de datos reales de MyAnimeList a través de
              Jikan, una API pública no oficial; AnimeCLZ nunca inventa títulos, puntuaciones ni sinopsis.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary sm:text-base">
              Construimos la experiencia de descubrir anime que nos gustaría usar: rápida, clara, sin
              imitar a ningún servicio existente y con identidad visual propia — y, en paralelo, como un
              caso de estudio honesto de cómo se construye un producto de frontend real, con decisiones
              documentadas y sin atajos que fabriquen datos o funcionalidad falsa.
            </p>
          </section>

          <section id="caracteristicas" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Características</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-border bg-card p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hover text-primary">
                    <feature.icon size={18} aria-hidden />
                  </span>
                  <p className="mt-3 font-display text-sm font-semibold text-text">{feature.title}</p>
                  <p className="mt-1.5 text-sm text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
            <ul className="mt-6 flex flex-col gap-2 text-sm leading-relaxed text-text-secondary sm:text-base">
              <li className="flex items-center gap-2">
                <ListChecks size={16} className="shrink-0 text-primary" aria-hidden />
                Portafolio profesional y práctica de arquitectura de frontend real.
              </li>
              <li className="flex items-center gap-2">
                <ListChecks size={16} className="shrink-0 text-primary" aria-hidden />
                Base pensada para, a futuro, convertirse en un producto propio.
              </li>
            </ul>
          </section>

          <section id="estadisticas" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Estadísticas del catálogo</h2>
            <p className="mt-2 text-sm text-text-secondary">Números reales, no estimados.</p>
            <div className="mt-4">
              <CatalogStats />
            </div>
          </section>

          <section id="tecnologias" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Tecnologías utilizadas</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TECHNOLOGIES.map((tech) => (
                <div key={tech.name} className="rounded-xl border border-border bg-card p-4">
                  <p className="font-display text-sm font-semibold text-text">{tech.name}</p>
                  <p className="mt-1 text-xs text-text-secondary">{tech.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="arquitectura" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Arquitectura del sistema</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary sm:text-base">
              El catálogo de anime vive en proveedores externos detrás de una capa desacoplada
              (<code className="rounded bg-hover px-1.5 py-0.5 text-xs">AnimeProvider</code>) — hoy activa
              con Jikan, preparada para sumar AniList o TMDB sin tocar el resto de la app. Todo lo propio
              de AnimeCLZ (cuentas, perfiles, favoritos, mi lista, historial, comentarios, calificaciones)
              vive en Supabase, con Row Level Security en cada tabla: cada cuenta solo accede a su propia
              información. Por encima de la cuenta existe un sistema de perfiles múltiples, cada uno con
              su propio rol — solo un rol de staff abre el Panel de Administración, una sección
              completamente separada del sitio público.
            </p>
          </section>

          <section id="capturas" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Capturas del sistema</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Espacio preparado para capturas reales de la app — agrégalas en{' '}
              <code className="rounded bg-hover px-1.5 py-0.5 text-xs">public/screenshots/</code> y
              referéncialas aquí.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {['Home', 'Ficha de detalle', 'Panel de administración'].map((label) => (
                <div
                  key={label}
                  className="flex aspect-video flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-text-secondary"
                >
                  <Camera size={22} aria-hidden />
                  <span className="text-xs">{label}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="desarrollador" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Sobre el desarrollador</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary sm:text-base">
              AnimeCLZ es un proyecto individual, construido de punta a punta como ejercicio de
              aprendizaje profundo en React y arquitectura de frontend — desde el sistema de diseño hasta
              la autenticación y los roles. Cada decisión técnica de este sitio queda documentada en el
              repositorio del proyecto.
            </p>
            <p className="mt-3 text-xs italic text-text-secondary">
              (Espacio reservado para tu presentación personal — nombre, foto y enlaces — cuando quieras
              personalizarlo.)
            </p>
          </section>

          <section id="preguntas-frecuentes" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Preguntas frecuentes</h2>
            <div className="mt-4 flex flex-col gap-4">
              {FAQS.map((faq) => (
                <div key={faq.question} className="rounded-xl border border-border bg-card p-4">
                  <p className="font-display text-sm font-semibold text-text">{faq.question}</p>
                  <p className="mt-1.5 text-sm text-text-secondary">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="contacto" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Contacto</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary sm:text-base">
              ¿Preguntas, ideas o encontraste un error? Escríbenos.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
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
          </section>

          <section id="privacidad" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Política de privacidad</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-text-secondary sm:text-base">
              <p>
                AnimeCLZ es un proyecto independiente, sin fines comerciales activos. Esto es lo que
                guardamos y por qué:
              </p>
              <ul className="flex flex-col gap-1.5 pl-1">
                <li>
                  • <strong className="text-text">Cuenta y perfiles:</strong> correo, nombre de usuario,
                  perfiles (nombre, avatar, color) — necesarios para que tu experiencia sea personal y
                  persista entre visitas.
                </li>
                <li>
                  • <strong className="text-text">Favoritos, Mi Lista e historial:</strong> asociados
                  únicamente a tu cuenta, protegidos por Row Level Security en Supabase — nadie más puede
                  leerlos ni modificarlos.
                </li>
                <li>
                  • <strong className="text-text">Cookies y almacenamiento local:</strong> usados solo
                  para mantener tu sesión iniciada y recordar el último perfil elegido — no para
                  publicidad ni rastreo de terceros.
                </li>
                <li>
                  • <strong className="text-text">No vendemos ni compartimos</strong> tu información con
                  terceros. Los únicos servicios externos que consultamos son los proveedores de catálogo
                  (Jikan hoy), y solo para traer datos de anime — nunca les enviamos tu información
                  personal.
                </li>
              </ul>
              <p>Puedes eliminar tus perfiles o solicitar la eliminación completa de tu cuenta escribiéndonos.</p>
            </div>
          </section>

          <section id="terminos" className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Términos y condiciones</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-text-secondary sm:text-base">
              <p>
                Al usar AnimeCLZ aceptas que es un proyecto en desarrollo continuo, sin garantía de
                disponibilidad ininterrumpida: el catálogo depende de proveedores externos gratuitos que
                pueden presentar demoras o caídas fuera de nuestro control.
              </p>
              <p>
                El contenido de anime (títulos, imágenes, sinopsis) pertenece a sus respectivos titulares
                de derechos; AnimeCLZ solo lo muestra con fines informativos, sin alojar ni distribuir
                video. Eres responsable de la información que guardas en tu cuenta y de mantener segura tu
                contraseña.
              </p>
              <p>
                Estos términos pueden actualizarse a medida que el proyecto crezca; los cambios relevantes
                se reflejarán en esta misma página.
              </p>
            </div>
          </section>
        </div>
      </Container>

      <Footer />
    </div>
  )
}

export default Landing
