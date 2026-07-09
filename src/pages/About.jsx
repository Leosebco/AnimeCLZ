import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sparkles,
  Target,
  ListChecks,
  Code2,
  Boxes,
  UserRound,
  HelpCircle,
  Mail,
  ShieldCheck,
  FileText,
  Github,
} from 'lucide-react'
import Container from '@/components/ui/Container'
import { ROUTES } from '@/constants'

const SECTIONS = [
  { id: 'que-es', label: 'Qué es AnimeCLZ', icon: Sparkles },
  { id: 'mision', label: 'Nuestra misión', icon: Target },
  { id: 'objetivos', label: 'Objetivos', icon: ListChecks },
  { id: 'tecnologias', label: 'Tecnologías', icon: Code2 },
  { id: 'arquitectura', label: 'Arquitectura', icon: Boxes },
  { id: 'desarrollador', label: 'El desarrollador', icon: UserRound },
  { id: 'preguntas-frecuentes', label: 'Preguntas frecuentes', icon: HelpCircle },
  { id: 'contacto', label: 'Contacto', icon: Mail },
  { id: 'privacidad', label: 'Privacidad', icon: ShieldCheck },
  { id: 'terminos', label: 'Términos', icon: FileText },
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
      'La cuenta y los perfiles se guardan en Supabase con Row Level Security: cada cuenta solo puede leer y modificar su propia información. Más detalle en la Política de Privacidad de esta misma página.',
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

function About() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  return (
    <Container className="max-w-4xl pt-28 pb-20">
      <header className="text-center">
        <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">Acerca de AnimeCLZ</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary sm:text-base">
          Quiénes somos, qué buscamos construir y cómo está hecho AnimeCLZ por dentro.
        </p>
      </header>

      <nav aria-label="Secciones de esta página" className="mt-10 flex flex-wrap justify-center gap-2">
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

      <div className="mt-14 flex flex-col gap-14">
        <section id="que-es" className="scroll-mt-24">
          <h2 className="font-display text-xl font-bold text-text sm:text-2xl">¿Qué es AnimeCLZ?</h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary sm:text-base">
            AnimeCLZ es una plataforma web para descubrir, explorar y organizar anime: catálogo por
            temporada, buscador con autocompletado, fichas de detalle completas (personajes, episodios,
            estudios, relacionados) y listas personales — Favoritos y Mi Lista — asociadas a tu cuenta.
            Toda la información de anime que ves proviene de datos reales de MyAnimeList a través de
            Jikan, una API pública no oficial; AnimeCLZ nunca inventa títulos, puntuaciones ni sinopsis.
          </p>
        </section>

        <section id="mision" className="scroll-mt-24">
          <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Nuestra misión</h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary sm:text-base">
            Construir la experiencia de descubrir anime que nos gustaría usar: rápida, clara, sin
            imitar a ningún servicio existente y con una identidad visual propia. Y, en paralelo, servir
            como un caso de estudio honesto de cómo se construye un producto de frontend real — con sus
            decisiones documentadas, sus límites reconocidos y sin atajos que fabriquen datos o
            funcionalidad falsa.
          </p>
        </section>

        <section id="objetivos" className="scroll-mt-24">
          <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Objetivos del proyecto</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-text-secondary sm:text-base">
            <li>• Servir como pieza de portafolio profesional en React.</li>
            <li>• Profundizar en arquitectura de frontend real: servicios, contextos, rutas protegidas, roles.</li>
            <li>• Practicar la integración con una API pública de terceros y sus límites reales.</li>
            <li>• Sentar las bases para, a futuro, convertirse en un producto propio.</li>
          </ul>
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
            El catálogo de anime (títulos, episodios, personajes, estudios) vive enteramente en Jikan —
            AnimeCLZ nunca lo copia a su propia base de datos. Todo lo que sí es propio de AnimeCLZ
            (cuentas, perfiles, favoritos, mi lista, historial, comentarios, calificaciones) se guarda en
            Supabase, con Row Level Security activado en cada tabla: cada cuenta solo puede acceder a su
            propia información. Por encima de la cuenta existe un sistema de perfiles múltiples (como en
            los servicios de streaming conocidos), cada uno con su propio rol — solo el rol de
            administrador de un perfil abre el Panel de Administración, que es una sección
            completamente separada del sitio público.
          </p>
        </section>

        <section id="desarrollador" className="scroll-mt-24">
          <h2 className="font-display text-xl font-bold text-text sm:text-2xl">Sobre el desarrollador</h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary sm:text-base">
            AnimeCLZ es un proyecto individual, construido de punta a punta como ejercicio de
            aprendizaje profundo en React y arquitectura de frontend — desde el sistema de diseño hasta
            la autenticación y los roles. Cada decisión técnica de este sitio, incluida esta misma
            página, queda documentada en el repositorio del proyecto.
          </p>
          <p className="mt-3 text-xs text-text-secondary italic">
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
                terceros. El único servicio externo que consultamos es Jikan, y solo para traer datos de
                anime — nunca le enviamos tu información personal.
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
              disponibilidad ininterrumpida: el catálogo depende de Jikan, un servicio externo gratuito
              que puede presentar demoras o caídas fuera de nuestro control.
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

      <div className="mt-16 flex justify-center border-t border-border pt-8">
        <Link to={ROUTES.HOME} className="text-sm font-semibold text-primary hover:text-primary-hover">
          Volver al inicio
        </Link>
      </div>
    </Container>
  )
}

export default About
