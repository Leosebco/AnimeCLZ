# 02 - PROJECT STRUCTURE

---

# Introducción

Este documento define la estructura oficial del proyecto AnimeCLZ.

Ningún archivo nuevo debe colocarse en una carpeta incorrecta.

Cada carpeta tiene una única responsabilidad.

Si un módulo no pertenece claramente a una carpeta existente, primero debe evaluarse si realmente se necesita crear una nueva carpeta.

Nunca crear carpetas innecesarias.

---

# Estructura General

src/

assets/

components/

constants/

contexts/

hooks/

layouts/

lib/

pages/

providers/

router/

services/

styles/

types/

utils/

App.jsx

main.jsx

---

# Filosofía

Todo el proyecto se divide en cuatro grandes capas.

Presentación

Estado

Lógica

Datos

Nunca mezclar estas capas.

---

# assets/

Responsabilidad:

Archivos estáticos.

Aquí viven:

logos

iconos

imágenes

fondos

videos

audios

animaciones Lottie

fuentes

Nunca colocar lógica.

Nunca colocar componentes.

---

Ejemplo

assets/

logo.svg

hero.webp

loading.json

background.mp4

fonts/

---

# components/

Responsabilidad:

Componentes reutilizables.

Nunca crear páginas completas aquí.

Todo componente debe poder utilizarse en múltiples lugares.

Ejemplos

AnimeCard

Button

Navbar

Footer

Modal

Avatar

Skeleton

Badge

Pagination

SearchBar

PlayerControls

ConfirmDialog

NotificationToast

---

Subestructura recomendada

components/

common/

anime/

profile/

player/

admin/

layout/

ui/

forms/

landing/

---

Cada carpeta representa un dominio.

Nunca una página completa.

---

# pages/

Responsabilidad

Representan rutas.

Cada archivo aquí corresponde a una URL.

Ejemplo

pages/

Home/

Explore/

AnimeDetail/

Login/

Register/

Settings/

Admin/

Profile/

Landing/

Search/

Watch/

---

Las páginas solo deben:

componer componentes

llamar hooks

manejar navegación

Nunca realizar lógica compleja.

---

# layouts/

Responsabilidad

Layouts reutilizables.

Ejemplo

MainLayout

AuthLayout

AdminLayout

LandingLayout

PlayerLayout

---

Nunca colocar lógica de negocio.

---

# contexts/

Responsabilidad

Estado global.

Ejemplos

AuthContext

ProfileContext

ThemeContext

PlayerContext

FavoritesContext

HistoryContext

WatchLaterContext

NotificationContext

AdultContext

---

Reglas

Nunca renderizar componentes.

Nunca realizar fetch repetitivos.

Nunca mezclar lógica visual.

---

# hooks/

Responsabilidad

Lógica reutilizable.

Ejemplos

useAnime

useSearch

useInfiniteScroll

useTheme

useProfile

useIntersection

useLocalStorage

useDebounce

usePagination

useKeyboardShortcut

---

Un Hook nunca debe devolver JSX.

---

# services/

Responsabilidad

Reglas del negocio.

Ejemplos

animeService

authService

playerService

historyService

favoritesService

themeService

searchService

settingsService

notificationService

adminService

---

Un Service puede llamar:

Supabase

ProviderManager

Utils

Nunca React.

Nunca Context.

---

# providers/

Responsabilidad

Comunicación con APIs externas.

Ejemplos

AniListProvider

JikanProvider

KitsuProvider

AnimeThemesProvider

TMDBProvider

ConsumetProvider

LocalProvider

---

Cada Provider implementa exactamente la misma interfaz.

Nunca conocer React.

Nunca conocer Supabase.

---

# ProviderManager

Debe vivir aquí.

providers/

ProviderManager.js

Es el único encargado de decidir qué Provider usar.

---

# lib/

Responsabilidad

Configuraciones.

Ejemplos

supabase.js

axios.js

fetchClient.js

cache.js

logger.js

env.js

---

Nunca lógica de negocio.

---

# router/

Responsabilidad

Configuración del enrutador.

Ejemplo

router/

index.jsx

protectedRoutes.jsx

adminRoutes.jsx

guestRoutes.jsx

---

Nunca colocar componentes.

---

# constants/

Responsabilidad

Valores constantes.

Ejemplos

themes.js

roles.js

genres.js

routes.js

permissions.js

api.js

limits.js

colors.js

---

Nunca lógica.

---

# utils/

Responsabilidad

Funciones auxiliares.

Ejemplos

formatDate()

truncate()

capitalize()

mergeAnime()

normalize()

slugify()

sleep()

retry()

---

Nunca acceder a React.

---

# styles/

Responsabilidad

CSS global.

Variables.

Tailwind.

Animaciones.

Fuentes.

Temas.

---

Ejemplo

styles/

globals.css

animations.css

themes.css

variables.css

---

# types/

Preparado para futura migración a TypeScript.

Interfaces.

Enums.

Tipos.

---

# Flujo correcto

Usuario

↓

Página

↓

Componentes

↓

Hook

↓

Service

↓

ProviderManager

↓

Provider

↓

API

Nunca romper este flujo.

---

# Comunicación

Components

↓

Hooks

↓

Services

↓

Providers

↓

API

Nunca al revés.

---

# Organización de Componentes

Incorrecto

components/

AnimeCard.jsx

Button.jsx

Modal.jsx

Navbar.jsx

...

Correcto

components/

anime/

AnimeCard.jsx

AnimeBanner.jsx

EpisodeCard.jsx

RecommendationCard.jsx

profile/

ProfileCard.jsx

AvatarPicker.jsx

ProfileSelector.jsx

player/

Player.jsx

PlayerControls.jsx

SubtitleMenu.jsx

QualityMenu.jsx

admin/

AdminSidebar.jsx

AdminTable.jsx

AdminStats.jsx

landing/

Hero.jsx

Features.jsx

FAQ.jsx

Stats.jsx

ui/

Button.jsx

Modal.jsx

Badge.jsx

Tooltip.jsx

Loader.jsx

Skeleton.jsx

---

# Organización de Services

services/

anime/

animeService.js

searchService.js

characterService.js

profile/

profileService.js

avatarService.js

themeService.js

player/

playerService.js

subtitleService.js

historyService.js

admin/

adminService.js

newsService.js

usersService.js

---

Nunca crear un archivo gigante.

---

# Organización de Providers

providers/

ProviderManager.js

providers/

AniListProvider.js

JikanProvider.js

KitsuProvider.js

AnimeThemesProvider.js

TMDBProvider.js

LocalProvider.js

---

Todos implementan la misma interfaz.

---

# Organización de Hooks

hooks/

anime/

profile/

player/

common/

---

Nunca más de 300 líneas por Hook.

---

# Organización de Context

contexts/

Auth/

Profile/

Player/

Theme/

Admin/

Notifications/

---

Cada Context con:

Provider

Hook

Reducer (si aplica)

Types

---

# Organización de Páginas

Cada página puede contener:

components/

hooks/

styles/

Solo propios de esa página.

Ejemplo

Home/

Home.jsx

components/

hooks/

styles/

---

# Límites recomendados

Componentes:

<250 líneas.

Hooks:

<300 líneas.

Services:

<400 líneas.

Providers:

<400 líneas.

Context:

<350 líneas.

Si supera eso:

Dividir.

---

# Convenciones

Componentes

PascalCase

AnimeCard.jsx

Hooks

camelCase

useAnime.js

Services

camelCase

animeService.js

Providers

PascalCase

AniListProvider.js

Constants

UPPER_CASE

Roles

Enums

Tipos

PascalCase

---

# Imports

Orden oficial

React

Librerías

Context

Hooks

Services

Utils

Constants

Assets

CSS

Nunca mezclar.

---

# Código Prohibido

Nunca hacer fetch directamente en un componente.

Nunca llamar Supabase desde un componente.

Nunca consumir Jikan desde una página.

Nunca crear lógica duplicada.

Nunca acceder a Providers desde la UI.

Nunca crear componentes gigantes.

Nunca crear archivos de más de 500 líneas sin justificación.

---

# Objetivo Final

La estructura debe permitir que un nuevo desarrollador pueda encontrar cualquier archivo en menos de 30 segundos.

Si un archivo es difícil de encontrar, la estructura debe reorganizarse.

La organización es parte fundamental de la calidad del proyecto.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [01 Architecture](01_ARCHITECTURE.md) · [03 Database](03_DATABASE.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [01 Architecture](01_ARCHITECTURE.md) | [INDEX.md](INDEX.md) | [03 Database](03_DATABASE.md) |
