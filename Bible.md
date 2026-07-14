# AnimeCLZ Bible v1.0

# 00 - PROJECT VISION

---

# Información General

**Nombre del proyecto**

AnimeCLZ

---

**Versión actual**

v3.x (en desarrollo)

---

**Autor**

Leonardo Sebastian Calizaya Obregon

---

# Filosofía del proyecto

AnimeCLZ NO es un clon de Netflix.

AnimeCLZ NO es un clon de Crunchyroll.

AnimeCLZ NO es un clon de AniList.

La idea es combinar lo mejor de todas esas plataformas en un único proyecto moderno, rápido, elegante y completamente administrable.

Debe sentirse como una aplicación profesional.

La prioridad SIEMPRE será:

1. Experiencia de usuario.
2. Arquitectura limpia.
3. Rendimiento.
4. Escalabilidad.
5. Código reutilizable.

Nunca desarrollar solamente para "que funcione".

Todo cambio debe mejorar la arquitectura.

---

# Objetivo

Crear una plataforma privada para visualizar información de anime y reproducir episodios.

La aplicación será utilizada principalmente por su creador.

No está diseñada inicialmente para miles de usuarios.

Sin embargo, toda la arquitectura debe ser escalable para soportarlo en el futuro.

---

# Objetivos principales

AnimeCLZ debe permitir:

- Buscar anime.
- Buscar personajes.
- Buscar estudios.
- Buscar temporadas.
- Ver información completa.
- Ver trailers.
- Ver galerías.
- Ver relaciones.
- Ver recomendaciones.
- Reproducir episodios.
- Continuar viendo.
- Guardar favoritos.
- Guardar historial.
- Crear múltiples perfiles.
- Personalizar la experiencia.
- Administrar contenido desde un panel propio.

---

# Público objetivo

Principalmente:

El propietario del proyecto.

Posteriormente:

Amigos.

Familiares.

Usuarios invitados autorizados.

Nunca será una plataforma pública abierta.

---

# Tecnologías principales

Frontend

- React
- Vite
- TailwindCSS
- Framer Motion

Backend

- Supabase

Base de datos

- PostgreSQL (Supabase)

Autenticación

- Supabase Auth

Storage

- Supabase Storage

Deploy

- Vercel

---

# Filosofía de desarrollo

Cada nueva funcionalidad debe cumplir estas reglas:

✔ Reutilizable

✔ Escalable

✔ Modular

✔ Fácil de mantener

✔ Responsive

✔ Accesible

✔ Optimizada

Nunca escribir código únicamente para resolver un caso específico.

Siempre pensar en el crecimiento futuro.

---

# Principios del proyecto

## 1. Modularidad

Cada sistema debe ser independiente.

Ejemplo:

ProviderManager

NO debe depender del Player.

Player

NO debe depender del Panel Admin.

Panel Admin

NO debe depender del Login.

Todo debe comunicarse mediante servicios bien definidos.

---

## 2. Reutilización

Nunca duplicar componentes.

Si un componente puede reutilizarse:

Debe reutilizarse.

---

## 3. Arquitectura limpia

Separar:

Componentes

Servicios

Hooks

Context

Providers

Layouts

Utilidades

Nunca mezclar responsabilidades.

---

## 4. UI moderna

Todo el sitio debe transmitir sensación premium.

Inspiraciones:

Netflix

Crunchyroll

AniList

Disney+

Steam

Apple

Nunca parecer una plantilla gratuita.

---

## 5. Animaciones

Las animaciones deben mejorar la experiencia.

Nunca molestar.

Usar principalmente:

Framer Motion.

Lottie.

Rive.

CSS.

---

## 6. Rendimiento

Reducir:

Re-renderizados.

Llamadas repetidas.

Peticiones innecesarias.

Uso de memoria.

Tiempo de carga.

---

## 7. Responsive First

Toda funcionalidad nueva debe probarse en:

Desktop.

Tablet.

Android.

iPhone.

No agregar funciones exclusivas para escritorio.

---

# Objetivo visual

AnimeCLZ debe sentirse como una aplicación profesional.

No como una página universitaria.

Debe transmitir calidad desde el primer segundo.

---

# Estado actual

Actualmente el proyecto ya posee:

✔ Login

✔ Registro

✔ Recuperar contraseña

✔ Perfiles

✔ Temas

✔ Favoritos

✔ Mi Lista

✔ Historial

✔ Panel Administrador

✔ ProviderManager

✔ Jikan

✔ AniList

✔ Landing

✔ Responsive

✔ PWA

✔ Supabase

✔ CRUD parcial

---

# Objetivos futuros

Sistema de reproducción.

CRUD completo.

Base de datos propia.

Proveedor múltiple.

Player avanzado.

Sistema Adult.

Sincronización.

Descargas.

Modo Offline.

Notificaciones.

Aplicación móvil.

---

# Regla más importante

La calidad del código es más importante que la velocidad de desarrollo.

Nunca romper arquitectura por implementar una funcionalidad rápidamente.

Siempre buscar la solución correcta.

Aunque tome más tiempo.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 01 - ARCHITECTURE

---

# Introducción

Este documento define la arquitectura oficial de AnimeCLZ.

Ningún componente, servicio o módulo nuevo deberá desarrollarse sin respetar esta arquitectura.

Toda modificación deberá mantener la separación de responsabilidades.

Si una nueva funcionalidad requiere romper esta arquitectura, primero deberá justificarse y documentarse.

---

# Filosofía Arquitectónica

AnimeCLZ utiliza una arquitectura basada en capas (Layered Architecture) con principios de Clean Architecture adaptados a React.

La idea principal es que la interfaz nunca conozca directamente cómo se obtienen los datos.

Toda comunicación debe pasar por servicios especializados.

---

# Arquitectura General

```

```
                    Usuario
                       │
                       ▼
             React Components (UI)
                       │
                       ▼
               Hooks / Context
                       │
                       ▼
                  Services
                       │
                       ▼
               ProviderManager
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     AniList        Jikan         Kitsu
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                 Datos Unificados
                       │
                       ▼
                  Componentes
```

---

# Principios

## 1. La UI nunca conoce las APIs

Incorrecto:

```js
fetch("https://api.jikan.moe/...")
```

Correcto:

```js
animeService.getAnime()
```

o

```js
ProviderManager.getAnime()
```

---

## 2. ProviderManager es el único responsable de decidir de dónde vienen los datos

La interfaz nunca debe preguntar:

- ¿Uso Jikan?
- ¿Uso AniList?
- ¿Uso TMDB?

Eso es responsabilidad exclusiva del ProviderManager.

---

## 3. Cada Provider tiene una única responsabilidad

Ejemplo:

AniListProvider

Responsable únicamente de comunicarse con AniList.

No debe conocer:

Supabase

React

Context

Componentes

---

## 4. Services

Los Services representan la capa de negocio.

Ejemplo:

authService

favoritesService

historyService

profileService

animeService

searchService

Nunca deben renderizar componentes.

Nunca deben modificar la interfaz.

---

## 5. Context

Los Context administran el estado global.

Ejemplo:

AuthContext

ProfileContext

ThemeContext

WatchLaterContext

Nunca deben realizar consultas innecesarias.

Nunca deben contener lógica visual.

---

## 6. Hooks

Los Hooks encapsulan lógica reutilizable.

Ejemplos:

useAnime

useFetch

useInfiniteScroll

useDebounce

useIntersection

useSearch

Un Hook nunca debe renderizar JSX.

---

# Capas del proyecto

## Presentación

Todo lo relacionado con:

React

Componentes

Layouts

Páginas

Animaciones

Estilos

---

## Estado

Context

Hooks

Persistencia

Cache

---

## Lógica

Services

ProviderManager

Helpers

Utils

---

## Datos

Supabase

Jikan

AniList

TMDB

Kitsu

AnimeThemes

Base Local

---

# ProviderManager

El ProviderManager es el corazón del proyecto.

Nunca debe ser eliminado.

Debe ser completamente desacoplado.

Funciones principales:

buscar

obtener anime

obtener personajes

obtener episodios

obtener recomendaciones

obtener relaciones

obtener galerías

fusionar resultados

eliminar duplicados

cachear

fallback

retry

---

# Flujo de Datos

```

Usuario

↓

Home.jsx

↓

useAnime()

↓

animeService

↓

ProviderManager

↓

AniList

↓

Jikan

↓

Datos

↓

React

```

La interfaz nunca conoce este proceso.

---

# Responsabilidades

## Components

Mostrar información.

Nada más.

---

## Pages

Componer componentes.

Nada más.

---

## Hooks

Lógica reutilizable.

---

## Context

Estado global.

---

## Services

Reglas del negocio.

---

## Providers

Comunicación con APIs.

---

## Utils

Funciones auxiliares.

---

# Separación de Responsabilidades

Incorrecto:

Page

↓

fetch()

↓

render()

Correcto:

Page

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

---

# Provider Priority

Orden oficial:

1. Base Local

2. AniList

3. Jikan

4. Kitsu

5. AnimeThemes

6. TMDB

Siempre completar información.

Nunca reemplazar información válida.

---

# Estrategia de Merge

Ejemplo:

AniList devuelve:

Título

Sinopsis

Personajes

Jikan devuelve:

Trailer

Score

Galería

Resultado final:

Título (AniList)

Sinopsis (AniList)

Personajes (AniList)

Trailer (Jikan)

Score (Jikan)

Galería (Jikan)

Nunca perder datos.

---

# Cache

Cada Provider debe soportar cache.

Tipos:

Anime

Search

Characters

Relations

Episodes

Gallery

Recommendations

TTL configurable.

---

# Retry

Solo para errores temporales.

429

500

502

503

504

Nunca para:

404

401

403

---

# AbortController

Toda petición larga debe soportar cancelación.

Especialmente:

Búsqueda.

Explorar.

Anime Detail.

---

# Errores

Nunca lanzar errores directamente a la UI.

Los Providers devuelven objetos controlados.

Ejemplo:

```
{
 success: false,
 reason: "...",
 data: []
}
```

La UI decide qué mostrar.

---

# Componentes

Todo componente debe cumplir:

Responsabilidad única.

Props claras.

Sin lógica de negocio.

Sin llamadas HTTP.

---

# Principio DRY

Nunca duplicar:

Cards

Botones

Inputs

Modales

Tablas

Skeletons

Badges

---

# Escalabilidad

Agregar un nuevo Provider debe requerir únicamente:

Nuevo Provider.

Registrarlo.

Nada más.

No modificar la UI.

---

# Testing

Todo módulo nuevo debe probar:

Build.

Lint.

Responsive.

Desktop.

Tablet.

Mobile.

---

# Convenciones

Siempre TypeScript Ready.

Siempre desacoplado.

Siempre documentado.

Siempre reutilizable.

---

# Objetivo Final

AnimeCLZ debe poder cambiar completamente de proveedor de datos sin modificar un solo componente visual.

Si mañana Jikan desaparece, la aplicación debe seguir funcionando únicamente cambiando ProviderManager.

Ese es el objetivo de esta arquitectura.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

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

# AnimeCLZ Bible v1.0

# 03 - DATABASE

---

# Introducción

Este documento define la arquitectura oficial de la base de datos de AnimeCLZ.

La base de datos utiliza PostgreSQL mediante Supabase.

Toda modificación deberá realizarse mediante migraciones.

Nunca modificar tablas manualmente en producción sin crear una migración correspondiente.

---

# Filosofía

La base de datos debe ser:

Escalable.

Normalizada.

Segura.

Compatible con RLS.

Preparada para millones de registros.

Aunque actualmente el proyecto sea privado.

---

# Motor

Supabase

PostgreSQL

Storage

Authentication

Realtime

Edge Functions (futuro)

---

# Esquema General

```

Supabase

│

├── Auth

├── Database

├── Storage

└── Realtime

```

---

# Auth

Responsable de:

Registro

Login

OAuth

Recuperación

Sesiones

Refresh Token

Usuarios

Nunca guardar contraseñas manualmente.

Siempre utilizar Supabase Auth.

---

# Database

Contiene todas las tablas del proyecto.

---

# Storage

Responsable de:

Avatares

Fondos

Miniaturas

Banner

Imágenes de anime

Trailers locales

Subtítulos

---

# Realtime

Preparado para:

Notificaciones

Chat

Visualización simultánea

Panel en tiempo real

---

# Tablas actuales

## profiles

Información básica del perfil.

Campos:

id

user_id

nombre

avatar

tipo_avatar

fondo

tema

rol

activo

created_at

updated_at

---

## profiles_account

Configuración general de la cuenta.

Campos:

id

user_id

tema

idioma

preferencias

created_at

updated_at

---

## favorites

Favoritos por perfil.

Campos:

id

profile_id

anime_id

provider

created_at

---

## watch_history

Historial por perfil.

Campos:

id

profile_id

anime_id

episode_id

progress

last_position

updated_at

---

## watch_later

Lista "Ver después".

Campos:

id

profile_id

anime_id

created_at

---

## ratings

Calificaciones.

Campos:

id

profile_id

anime_id

score

created_at

---

## comments

Comentarios.

Campos:

id

profile_id

anime_id

contenido

estado

created_at

---

## notifications

Notificaciones.

Campos:

id

profile_id

titulo

mensaje

leido

created_at

---

# Tablas futuras

## anime_local

Información editable.

Campos:

id

provider_id

titulo

sinopsis

banner

poster

background

estado

tipo

temporada

estudio

duracion

created_at

updated_at

---

## episodes

Cada episodio.

Campos:

id

anime_id

numero

titulo

descripcion

thumbnail

duracion

opening

ending

created_at

---

## video_sources

Fuentes.

Campos:

id

episode_id

provider

url

quality

language

principal

activo

---

## subtitles

Subtítulos.

Campos:

id

episode_id

language

url

tipo

---

## openings

Campos:

id

anime_id

titulo

video

audio

---

## endings

Campos:

id

anime_id

titulo

video

audio

---

## characters_local

Personajes.

Campos:

id

anime_id

nombre

imagen

descripcion

voz

---

## studios_local

Estudios.

Campos:

id

nombre

pais

fundacion

logo

---

## genres_local

Géneros.

Campos:

id

nombre

slug

---

## relations_local

Relaciones.

Campos:

id

anime_id

related_id

tipo

---

## trailers

Campos:

id

anime_id

youtube

thumbnail

---

## collections

Colecciones.

Campos:

id

titulo

descripcion

imagen

---

# Relaciones

profiles

↓

favorites

↓

anime

profiles

↓

watch_history

↓

episodes

anime

↓

episodes

↓

video_sources

↓

subtitles

anime

↓

characters

anime

↓

relations

anime

↓

trailers

---

# Storage Buckets

avatars

backgrounds

anime

episodes

trailers

subtitles

openings

endings

news

temp

---

# Roles

super_admin

Acceso total.

admin

CRUD contenido.

usuario

Solo visualización.

invitado

Perfil limitado.

adult

Permiso adicional.

---

# Row Level Security

Todas las tablas deben tener RLS.

Nunca deshabilitar RLS.

---

Ejemplo:

favorites

Solo puede leer:

profile_id = auth.uid()

Nunca otra cuenta.

---

# Triggers

Auto crear perfil.

Sincronizar rol.

Actualizar updated_at.

Limitar perfiles.

Proteger admin.

Eliminar historial al borrar perfil.

---

# Índices

Crear índices para:

anime_id

profile_id

provider

episode_id

created_at

updated_at

Nunca hacer búsquedas sin índice.

---

# Migraciones

Toda modificación debe hacerse mediante:

supabase migration

Nunca editar producción manualmente.

---

# Backups

Antes de migraciones grandes:

Backup completo.

Guardar versión.

Documentar cambios.

---

# Convenciones

UUID para IDs.

created_at

updated_at

deleted_at (soft delete futuro)

Nunca usar INT autoincremental.

---

# Eliminación

Nunca borrar definitivamente.

Preferir:

activo

estado

deleted_at

Soft Delete.

---

# Integridad

Toda FK debe existir.

Nunca permitir datos huérfanos.

---

# Performance

Usar índices.

Limitar consultas.

Paginación.

Cache.

Evitar joins innecesarios.

---

# Seguridad

Nunca exponer Service Role Key.

Solo usar Publishable Key en frontend.

Toda operación sensible debe pasar por RLS.

---

# Objetivo Final

La base de datos debe permitir cambiar de proveedor de anime sin perder información local.

AnimeCLZ siempre será dueño de sus propios datos.

Las APIs externas solo complementan el contenido.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 04 - AUTHENTICATION

---

# Introducción

Este documento define el sistema oficial de autenticación de AnimeCLZ.

Todo el sistema está construido sobre Supabase Authentication.

No se permite implementar autenticación propia.

Nunca almacenar contraseñas.

Nunca crear tablas de usuarios paralelas.

Toda identidad pertenece a Supabase Auth.

---

# Objetivos

El sistema debe permitir:

✔ Registro

✔ Inicio de sesión

✔ Cerrar sesión

✔ Recuperar contraseña

✔ Persistencia

✔ OAuth (Google)

✔ Selector de perfiles

✔ Roles

✔ Sesión por dispositivo

✔ Recordar perfil

✔ Expiración por inactividad

---

# Arquitectura

Usuario

↓

Supabase Auth

↓

AuthContext

↓

ProfileContext

↓

Home

Nunca una página debe consultar directamente Supabase.

Siempre mediante AuthContext.

---

# Flujo de Registro

Usuario

↓

Register.jsx

↓

authService.register()

↓

Supabase Auth

↓

Trigger PostgreSQL

↓

Crear Profile

↓

Crear Profile Account

↓

Login automático

↓

Selector de perfiles

↓

Home

---

# Flujo Login

Usuario

↓

Login.jsx

↓

authService.login()

↓

Supabase

↓

Session

↓

AuthContext

↓

ProfileContext

↓

Selector

↓

Home

---

# OAuth

Proveedor:

Google

Flujo

Usuario

↓

Google

↓

Supabase

↓

AuthContext

↓

ProfileContext

↓

Home

Nunca manejar manualmente los tokens OAuth.

---

# Recuperar contraseña

Usuario

↓

ForgotPassword

↓

Supabase

↓

Correo

↓

Reset Password

↓

Nueva contraseña

↓

Login

---

# Persistencia

Supabase mantiene automáticamente:

Access Token

Refresh Token

Session

Nunca implementar persistencia propia.

---

# AuthContext

Responsabilidad

Mantener:

user

session

loading

authenticated

login()

logout()

register()

resetPassword()

refresh()

Nunca guardar favoritos.

Nunca guardar perfiles.

Nunca guardar temas.

---

# ProfileContext

Responsabilidad

Perfil activo.

Lista de perfiles.

Cambiar perfil.

Crear perfil.

Eliminar perfil.

Editar perfil.

Tema.

Fondo.

Avatar.

Nunca manejar login.

---

# Separación

AuthContext

↓

Cuenta

ProfileContext

↓

Perfil

Nunca mezclarlos.

---

# Cuenta

Una cuenta puede tener:

Hasta 4 perfiles.

Ejemplo

Cuenta

↓

Leonardo

↓

Perfiles

Leonardo

Invitado

Pruebas

Niño

Cada perfil tiene:

Favoritos.

Historial.

Mi Lista.

Tema.

Avatar.

Fondo.

Permisos.

---

# Perfil Activo

Siempre existe un perfil activo.

Debe persistirse.

Nunca volver a preguntar mientras la sesión siga activa.

Solo mostrar selector cuando:

Primer login.

Cambiar perfil.

Cerrar sesión.

30 minutos de inactividad.

Nunca al hacer F5.

Nunca al navegar.

Nunca al volver al Home.

---

# Tiempo de Inactividad

30 minutos.

Heartbeat.

Si expira:

Guardar estado.

Mostrar selector.

No cerrar sesión.

---

# Cambio de Perfil

Usuario

↓

Cambiar Perfil

↓

ProfileContext

↓

Actualizar profile activo

↓

Recargar datos

↓

Home

Nunca cerrar sesión.

---

# Logout

Usuario

↓

Cerrar Sesión

↓

Eliminar perfil activo

↓

Cerrar sesión Supabase

↓

Landing

---

# Landing

Si NO existe sesión

Siempre mostrar Landing.

Nunca Home.

---

# Home

Si existe sesión

Mostrar Home.

Nunca Landing.

---

# Rutas

Públicas

Landing

Login

Register

Forgot Password

Reset Password

---

Protegidas

Home

Anime

Perfil

Favoritos

Mi Lista

Historial

Configuración

---

Administrador

Panel

CRUD

Noticias

Usuarios

Moderación

---

# Roles

super_admin

Control total.

admin

CRUD contenido.

usuario

Visualización.

invitado

Solo lectura.

adult

Permiso adicional.

---

# Verificación

Cada navegación protegida debe validar:

Existe sesión.

Existe perfil.

Perfil activo.

Permisos.

---

# Refresh Token

Supabase lo administra.

Nunca implementar uno manual.

---

# Errores

Nunca mostrar errores técnicos.

Incorrecto

Error 500.

Correcto

"No pudimos iniciar sesión."

---

# Loading

Siempre mostrar Skeleton.

Nunca pantalla blanca.

Nunca spinner infinito.

---

# Seguridad

Nunca guardar tokens en LocalStorage manualmente.

Nunca exponer Service Role.

Nunca modificar JWT.

Nunca confiar únicamente en el frontend.

Toda seguridad debe existir también mediante RLS.

---

# RLS

El frontend solo mejora la experiencia.

La seguridad real vive en PostgreSQL.

Nunca depender únicamente del cliente.

---

# ProtectedRoute

Todas las rutas privadas deben pasar por:

ProtectedRoute

Verificar

Sesión

Perfil

Rol

Permisos

---

# AdminRoute

Debe validar:

Sesión.

Perfil.

Rol.

No solamente Auth.

---

# Cambiar Cuenta

Cerrar sesión.

Eliminar perfil activo.

Eliminar cache.

Ir Landing.

---

# Recordar Perfil

Guardar únicamente:

profile_id

Nunca favoritos.

Nunca historial.

Nunca datos sensibles.

---

# Multi dispositivo

Cada dispositivo mantiene:

Su sesión.

Su perfil.

Su cache.

Independientes.

---

# Objetivo

El usuario solo debe iniciar sesión una vez.

Después únicamente cambia de perfil cuando él lo decida o después del tiempo de inactividad.

Nunca interrumpir innecesariamente la experiencia.

---

# Reglas para Claude

Nunca modificar AuthContext sin revisar ProfileContext.

Nunca modificar ProfileContext sin revisar AuthContext.

Nunca romper el flujo Login → Perfil → Home.

Nunca volver a mostrar el selector después de un simple F5.

Nunca guardar información sensible fuera de Supabase.

Toda nueva funcionalidad debe respetar este flujo.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 05 - PROFILE SYSTEM

---

# Introducción

El sistema de perfiles es uno de los pilares principales de AnimeCLZ.

Toda la experiencia del usuario gira alrededor de un perfil activo.

Una cuenta representa a una persona.

Un perfil representa una identidad dentro de esa cuenta.

Toda la información personalizada pertenece al perfil, no a la cuenta.

---

# Filosofía

Una cuenta puede ser compartida entre varias personas.

Cada perfil debe sentirse completamente independiente.

Cada perfil posee:

• Favoritos
• Historial
• Continuar viendo
• Mi Lista
• Avatar
• Fondo
• Tema
• Configuración
• Permisos
• Restricciones

Nunca compartir estos datos entre perfiles.

---

# Arquitectura

```

Supabase Auth
│
▼
Cuenta
│
├──────────────┐
│              │
▼              ▼
Perfil 1     Perfil 2
│              │
▼              ▼
Favoritos   Favoritos

Historial   Historial

Mi Lista    Mi Lista

Tema         Tema

Avatar       Avatar

```

---

# Flujo completo

Login

↓

Cuenta

↓

Buscar perfiles

↓

¿Existe perfil activo?

↓

Sí

↓

Home

↓

No

↓

Selector de perfiles

↓

Seleccionar

↓

Guardar perfil activo

↓

Home

---

# Máximo de perfiles

Cada cuenta puede tener:

Máximo: **4 perfiles**

Nunca permitir crear un quinto.

Esta regla debe existir:

Frontend

Backend

Base de datos

Trigger PostgreSQL

Nunca depender solamente del frontend.

---

# Tipos de perfil

super_admin

admin

usuario

invitado

adult

El rol pertenece al perfil.

No a la cuenta.

---

# Perfil Principal

La cuenta tiene únicamente un perfil principal.

Normalmente:

Super Admin

o

Administrador

Nunca permitir eliminarlo accidentalmente.

---

# Crear Perfil

Proceso

Usuario

↓

Botón Crear Perfil

↓

Formulario

↓

Nombre

↓

Avatar

↓

Fondo

↓

Tema

↓

Guardar

↓

Actualizar lista

↓

NO navegar automáticamente

↓

Usuario selecciona el perfil

---

# Reglas

Nombre obligatorio.

Máximo 25 caracteres.

Sin caracteres inválidos.

No duplicar nombres dentro de la misma cuenta.

---

# Avatar

Cada perfil puede utilizar:

Imagen subida.

Imagen desde Storage.

Personaje de anime.

Iniciales.

Avatar por defecto.

---

# Avatar desde anime

Debe existir un buscador.

Puede buscar:

Nombre del anime.

o

Nombre del personaje.

Ejemplo

Naruto

↓

Naruto Uzumaki

Sasuke

Kakashi

Hinata

Seleccionar

↓

Guardar URL

Nunca guardar la imagen local.

Guardar únicamente la URL.

---

# Avatar personalizado

El usuario puede subir:

PNG

JPG

WEBP

AVIF

Máximo:

5 MB

La imagen debe almacenarse en:

Storage

avatars/

---

# Fondos

Cada perfil posee un fondo.

Tipos

Gradientes

Imagen

Color

Anime

Video (futuro)

---

# Temas

Cada perfil tiene su propio tema.

Ejemplos

AnimeCLZ

Cyberpunk

Tokyo Night

Glass

Minimal

Emerald

Netflix

Neon

Midnight

---

# Tema

El tema debe aplicarse inmediatamente.

Nunca requerir recargar.

Persistir automáticamente.

---

# Fondo

El fondo debe aplicarse únicamente:

Al perfil activo.

Nunca modificar otros perfiles.

---

# Favoritos

Cada perfil tiene sus propios favoritos.

Nunca compartir.

---

# Historial

Cada perfil posee historial independiente.

Al cambiar perfil:

Cambia completamente.

---

# Continuar viendo

Depende del perfil.

No de la cuenta.

---

# Mi Lista

Depende del perfil.

Nunca compartir.

---

# Configuración

Cada perfil almacena:

Tema.

Idioma.

Adult.

Autoplay.

Calidad.

Subtítulos.

Color.

Fondo.

---

# Selector de perfiles

Debe mostrarse únicamente cuando:

Primer login.

Cambiar perfil.

30 minutos de inactividad.

Nunca:

F5.

Volver Home.

Cambiar página.

---

# Persistencia

Guardar:

profile_id

Última actividad.

Nada más.

Nunca guardar favoritos.

---

# Cambiar Perfil

Proceso

Usuario

↓

Cambiar Perfil

↓

Guardar estado

↓

Actualizar Context

↓

Recargar datos

↓

Home

Nunca cerrar sesión.

---

# Editar Perfil

Debe permitir modificar:

Nombre.

Avatar.

Fondo.

Tema.

Idioma.

Adult.

Nunca modificar el rol.

Solo administrador.

---

# Eliminar Perfil

Nunca eliminar:

El último perfil.

El perfil activo del Super Admin.

El perfil con permisos elevados.

Siempre solicitar confirmación.

Eliminar también:

Favoritos.

Historial.

Mi Lista.

Configuraciones.

Notificaciones.

---

# Seguridad

Cada perfil pertenece a una sola cuenta.

Nunca permitir acceder al profile_id de otra cuenta.

Toda validación debe existir mediante RLS.

---

# Performance

La lista de perfiles debe cargarse una sola vez.

No consultar continuamente.

Usar Context.

---

# Animaciones

El selector debe utilizar:

Framer Motion.

Fade.

Scale.

Glassmorphism.

Hover.

Transiciones suaves.

Nunca movimientos exagerados.

---

# Responsive

Desktop.

Tablet.

Android.

iPhone.

Touch mínimo:

44px.

---

# UI

Cada tarjeta debe mostrar:

Avatar.

Nombre.

Rol.

Tema.

Editar.

Eliminar.

Nunca saturar la interfaz.

---

# Avatar Picker

Debe permitir:

Buscar anime.

Buscar personaje.

Subir imagen.

Elegir inicial.

Elegir avatar por defecto.

Vista previa.

---

# Claude Rules

Nunca romper:

Límite de 4 perfiles.

Persistencia.

Selector.

Favoritos por perfil.

Historial por perfil.

Mi Lista por perfil.

Nunca volver a guardar favoritos por cuenta.

Nunca permitir más de un perfil Super Admin.

Nunca eliminar el perfil principal.

Nunca mostrar nuevamente el selector después de un F5.

Nunca seleccionar automáticamente un perfil recién creado.

Siempre dejar que el usuario lo seleccione.

---

# Mejoras futuras

PIN por perfil.

Perfiles infantiles.

Perfiles bloqueados.

Avatares animados.

Fondos animados.

Sincronización entre dispositivos.

Perfiles temporales.

Exportar configuración.

Importar configuración.

---

# Objetivo Final

El sistema de perfiles debe sentirse igual o mejor que Netflix.

Cada perfil debe ser completamente independiente.

El cambio entre perfiles debe ser inmediato.

La experiencia debe ser fluida.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 06 - PROVIDER MANAGER

---

# Introducción

El ProviderManager es el núcleo de obtención de datos de AnimeCLZ.

Toda la información de anime debe pasar por él.

Ningún componente.

Ninguna página.

Ningún hook.

Ningún contexto.

Puede consumir directamente una API.

El ProviderManager decide:

• Qué proveedor consultar.
• En qué orden.
• Cómo combinar datos.
• Cómo cachearlos.
• Cómo reintentar.
• Qué hacer si uno falla.

---

# Filosofía

AnimeCLZ nunca dependerá de una sola API.

Las APIs son reemplazables.

AnimeCLZ es dueño de su arquitectura.

Si mañana desaparece Jikan:

La aplicación debe seguir funcionando.

Si mañana AniList cambia su API:

Solo cambia un Provider.

Nunca la UI.

---

# Objetivos

Resolver:

• Rate Limit.

• 429.

• 500.

• 504.

• Timeout.

• Información incompleta.

• APIs caídas.

• Datos duplicados.

• Diferencias entre proveedores.

---

# Arquitectura

```

Home

↓

animeService

↓

ProviderManager

↓

┌───────────────┐

▼ ▼ ▼ ▼ ▼ ▼

AniList

Jikan

Kitsu

AnimeThemes

TMDB

Base Local

↓

Merge

↓

Cache

↓

Resultado Final

↓

React

```

---

# Reglas

La UI jamás conoce:

AniList

Jikan

TMDB

Kitsu

AnimeThemes

Consumet

Enime

Nada.

Solo conoce:

ProviderManager.

---

# Responsabilidad

ProviderManager debe:

Buscar anime.

Buscar personajes.

Obtener detalles.

Obtener episodios.

Obtener relaciones.

Obtener galerías.

Obtener trailers.

Obtener openings.

Obtener endings.

Obtener estudios.

Obtener recomendaciones.

Fusionar datos.

Eliminar duplicados.

Cachear.

Reintentar.

Fallback.

---

# Orden Oficial

1.

Base Local

↓

2.

AniList

↓

3.

Jikan

↓

4.

Kitsu

↓

5.

AnimeThemes

↓

6.

TMDB

↓

7.

Otros futuros

---

# ¿Por qué?

Base Local

Siempre tiene prioridad.

Porque pertenece a AnimeCLZ.

Las APIs externas solo complementan.

Nunca sobrescriben datos locales.

---

# Base Local

Debe contener:

Información corregida.

Episodios propios.

Videos.

Subtítulos.

Imágenes.

Fondos.

Openings.

Endings.

Relaciones.

Todo editable.

---

# AniList

Fuente principal.

Excelente:

Sinopsis.

Personajes.

Relaciones.

Estudios.

Staff.

Tags.

Popularidad.

---

# Jikan

Complementa:

Trailer.

Galería.

Score.

Información faltante.

Noticias.

---

# Kitsu

Complementa:

Imágenes.

Categorías.

Alias.

Edad recomendada.

---

# AnimeThemes

Fuente oficial de:

Opening.

Ending.

Versiones.

Videos.

Audios.

---

# TMDB

Solo para:

Backgrounds.

Fanarts.

Logos.

Imágenes HD.

---

# Provider Interface

Todo Provider implementa:

search()

getAnime()

getEpisodes()

getCharacters()

getRecommendations()

getRelations()

getGallery()

getTrailer()

getStudios()

---

Nunca más.

Nunca menos.

---

# Agregar un Provider

Solo requiere:

Crear archivo.

Registrar Provider.

Nada más.

Nunca modificar la UI.

---

# Merge

Ejemplo

AniList devuelve:

Título

Sinopsis

Personajes

Jikan devuelve:

Trailer

Galería

Score

Resultado

Título

Sinopsis

Personajes

Trailer

Galería

Score

Nunca perder información.

---

# Regla de Merge

Si un dato ya existe:

Nunca reemplazarlo

A menos que el nuevo sea mejor.

---

Ejemplo

Poster 300x450

↓

Poster 1200x1800

Reemplazar.

---

Ejemplo

Sinopsis vacía

↓

Sinopsis completa

Reemplazar.

---

# Deduplicación

Comparar:

MAL ID

AniList ID

Título

Slug

Romaji

Inglés

Sinónimos

---

Nunca mostrar dos veces el mismo anime.

---

# Cache

Tipos

Memory

Session

IndexedDB

LocalStorage

---

Prioridad

Memory

↓

IndexedDB

↓

Provider

---

TTL

Home

5 min

Buscar

10 min

Anime

30 min

Galería

1 hora

Temporadas

6 horas

Géneros

24 horas

---

# Retry

Solo:

429

500

502

503

504

Nunca:

404

401

403

---

Backoff

1 s

↓

2 s

↓

4 s

↓

8 s

Máximo:

4 intentos.

---

# Timeout

Toda petición:

10 segundos.

Luego:

AbortController.

---

# Cola

Nunca más de:

2 peticiones simultáneas.

Separación:

200 ms.

---

# AbortController

Toda búsqueda debe poder cancelarse.

Si el usuario escribe:

Nar

↓

Naru

↓

Naruto

Solo debe ejecutarse:

Naruto.

---

# Search

Debe buscar:

Título

Romaji

Inglés

Español

Sinónimos

Alias

Personajes

Estudios

---

Nunca solo título.

---

# Personajes

Debe permitir:

Buscar personaje

↓

Obtener anime relacionado

↓

Usar avatar

↓

Guardar URL

---

# Episodios

Debe consultar:

Base Local

↓

Consumet (futuro)

↓

Enime

↓

Otros

AniList no posee episodios.

---

# Videos

Prioridad

Base Local

↓

Consumet

↓

Enime

↓

Otros

---

# Subtítulos

Base Local.

Siempre.

---

# Openings

AnimeThemes.

---

# Endings

AnimeThemes.

---

# Relaciones

AniList.

↓

Jikan.

↓

Base Local.

---

# Galería

TMDB

↓

Jikan

↓

Base Local

---

# Imágenes

Siempre usar la de mayor resolución.

---

# Rate Limit

Nunca superar:

2 requests.

Cada:

200 ms.

---

# Logs

Solo en desarrollo.

Nunca en producción.

---

# Performance

Nunca consultar el mismo anime dos veces.

Siempre cachear.

---

# Offline

Si existe cache:

Mostrar cache.

Nunca pantalla vacía.

---

# Error Handling

Incorrecto

Servidor ocupado.

Correcto

Mostrar cache.

↓

Intentar nuevamente.

↓

Cambiar Provider.

↓

Mostrar mensaje.

---

# Integración futura

Consumet.

AnimePahe.

Enime.

Self Hosted API.

---

# Claude Rules

Nunca llamar una API desde React.

Nunca llamar Jikan directamente.

Nunca consumir AniList desde una página.

Nunca romper ProviderManager.

Nunca acoplar Providers.

Siempre implementar la interfaz oficial.

Siempre respetar el orden de prioridad.

Siempre cachear.

Siempre soportar retry.

Siempre soportar AbortController.

Siempre documentar un Provider nuevo.

---

# Objetivo Final

AnimeCLZ debe poder cambiar completamente de proveedor sin modificar un solo componente.

Toda la inteligencia debe vivir dentro del ProviderManager.

Ese es el corazón de AnimeCLZ.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 07 - PLAYER SYSTEM

---

# Introducción

El Player de AnimeCLZ será uno de los módulos más importantes del proyecto.

Su objetivo no es solamente reproducir videos.

Debe convertirse en un sistema completo de visualización de anime.

Debe sentirse incluso mejor que Crunchyroll.

Toda la lógica del reproductor debe estar desacoplada de la interfaz.

La UI únicamente mostrará la información.

Toda la reproducción será administrada mediante PlayerService y PlayerContext.

---

# Objetivos

El reproductor debe permitir:

✔ Reproducir episodios

✔ Cambiar calidad

✔ Cambiar subtítulos

✔ Cambiar servidor

✔ Continuar viendo

✔ Autoplay

✔ Pantalla completa

✔ Picture in Picture

✔ Saltar Opening

✔ Saltar Ending

✔ Recordar volumen

✔ Recordar velocidad

✔ Mini reproductor

✔ Historial automático

✔ Sincronización con el perfil

---

# Arquitectura

Usuario

↓

Watch.jsx

↓

Player.jsx

↓

PlayerContext

↓

PlayerService

↓

ProviderManager

↓

Video Providers

↓

Video

---

# Filosofía

El Player nunca debe conocer de dónde viene el video.

Puede provenir de:

Base Local

Consumet

Enime

AnimePahe

Self Hosted

CDN

Storage

El Player solo recibe:

VideoSource

---

# VideoSource

Todo servidor debe devolver:

{
id,
title,
url,
quality,
language,
provider,
headers,
subtitles
}

Nunca devolver formatos distintos.

---

# Arquitectura del Player

Player

│

├── Controls

├── ProgressBar

├── EpisodeList

├── SubtitleMenu

├── QualityMenu

├── ServerMenu

├── SettingsMenu

├── Volume

├── Fullscreen

├── PictureInPicture

└── SkipButtons

---

# PlayerContext

Responsabilidad

Estado global del reproductor.

Debe almacenar:

video actual

episodio

anime

tiempo actual

duración

volumen

velocidad

calidad

subtítulo

servidor

fullscreen

pip

loading

error

buffer

---

# PlayerService

Responsabilidad

Obtener video.

Guardar progreso.

Cambiar servidor.

Cambiar calidad.

Actualizar historial.

Notificar al Provider.

Nunca renderizar componentes.

---

# Flujo

Usuario

↓

Selecciona episodio

↓

PlayerService

↓

ProviderManager

↓

Servidor

↓

VideoSource

↓

Player

↓

Reproducción

---

# Servidores

Prioridad

1

Base Local

2

Consumet

3

Enime

4

AnimePahe

5

Self Hosted

6

Otros futuros

---

# Calidad

Debe soportar:

360p

480p

720p

1080p

1440p (futuro)

4K (futuro)

Auto

---

# Cambio de calidad

Nunca reiniciar el episodio.

Mantener posición.

---

# Subtítulos

Idiomas

Español

Inglés

Portugués

Japonés

Desactivado

---

# Tipos

ASS

SRT

VTT

---

# Subtítulos

Siempre sincronizados.

Nunca perder tiempo al cambiar idioma.

---

# Audio

Preparado para:

Japonés

Español Latino

Inglés

Portugués

Dual Audio

---

# Velocidad

0.5x

0.75x

1x

1.25x

1.5x

2x

Recordar preferencia.

---

# Volumen

Persistente.

Cada usuario conserva su volumen.

---

# Pantalla Completa

Debe funcionar en:

Desktop

Android

iPhone

PWA

---

# Picture in Picture

Soportar navegadores compatibles.

---

# Mini Player

Cuando el usuario navega:

Continuar reproduciendo.

---

# Continuar viendo

Guardar automáticamente cada:

10 segundos

o

cada cambio importante.

Nunca esperar al final.

---

# Historial

Guardar:

anime

episodio

posición

fecha

duración

provider

---

# Autoplay

Al terminar un episodio:

Cuenta regresiva.

Siguiente episodio.

Cancelar.

---

# Skip Opening

Detectar:

Opening

↓

Mostrar botón

↓

Saltar

---

# Skip Ending

Igual.

---

# Buffer

Mostrar indicador.

Nunca congelar interfaz.

---

# Errores

Si un servidor falla:

↓

Cambiar automáticamente

↓

Siguiente servidor

↓

Mantener posición

---

# Cache

Guardar:

último episodio

último servidor

última calidad

últimos subtítulos

---

# Responsive

Desktop

Tablet

Android

iPhone

TV (futuro)

---

# Touch

Doble toque

Avanzar.

Retroceder.

Pellizcar

Zoom (futuro).

Deslizar

Brillo (futuro).

Volumen (futuro).

---

# Atajos

Espacio

Play

F

Fullscreen

M

Mute

←

Retroceder

→

Avanzar

↑

Volumen +

↓

Volumen -

S

Subtítulos

Q

Calidad

---

# Seguridad

Nunca exponer URLs privadas.

Nunca guardar tokens.

Nunca exponer claves.

---

# Analytics

Registrar:

Inicio.

Fin.

Tiempo visto.

Calidad.

Servidor.

Errores.

Solo para estadísticas.

---

# Claude Rules

Nunca acoplar el Player a un Provider.

Nunca llamar APIs desde Player.

Nunca guardar progreso fuera de PlayerService.

Nunca romper Continue Watching.

Nunca reiniciar reproducción al cambiar calidad.

Siempre mantener la posición del video.

---

# Objetivo Final

El reproductor debe sentirse tan fluido como YouTube, tan elegante como Netflix y tan especializado en anime como Crunchyroll.

Toda la lógica debe permanecer desacoplada para permitir agregar nuevos servidores sin modificar la interfaz.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 08 - ADMIN PANEL

---

# Introducción

El Panel de Administración es el centro de control de AnimeCLZ.

Desde aquí se administrará absolutamente todo el contenido del sitio.

El Panel debe ser completamente independiente del Home.

Nunca mezclar componentes públicos con componentes administrativos.

Toda acción realizada desde el Panel debe respetar los permisos del usuario y las políticas RLS de Supabase.

---

# Filosofía

El Panel debe sentirse como una aplicación profesional.

Inspiraciones:

- Steam Admin
- YouTube Studio
- Vercel Dashboard
- Supabase Dashboard
- Notion
- GitHub

No debe sentirse como un formulario tradicional.

---

# Objetivos

El Panel permitirá administrar:

✔ Usuarios

✔ Roles

✔ Perfiles

✔ Noticias

✔ Banners

✔ Colecciones

✔ Animes

✔ Episodios

✔ Personajes

✔ Estudios

✔ Géneros

✔ Relaciones

✔ Videos

✔ Servidores

✔ Comentarios

✔ Reportes

✔ Configuración

✔ Módulo +18

✔ Estadísticas

---

# Arquitectura

```
AdminLayout

│

├── Sidebar

├── Topbar

├── Dashboard

├── Modules

├── Notifications

└── Settings
```

---

# Dashboard

Debe mostrar:

Número de usuarios.

Perfiles creados.

Animes.

Episodios.

Noticias.

Comentarios.

Reproducciones.

Favoritos.

Mi Lista.

Historial.

Uso de almacenamiento.

Actividad reciente.

---

# Sidebar

Debe contener:

Dashboard

Contenido

Usuarios

Noticias

Moderación

Adult

Configuración

Logs

Cerrar sesión

---

# Dashboard Widgets

Tarjetas.

Gráficos.

Últimas acciones.

Estadísticas.

Alertas.

Uso de API.

Uso de Storage.

---

# CRUD de Usuarios

Permite:

Ver usuarios.

Editar usuario.

Desactivar usuario.

Reactivar usuario.

Asignar rol.

Eliminar cuenta.

Ver perfiles.

Nunca permitir que un administrador modifique un Super Admin.

---

# CRUD de Perfiles

Crear.

Editar.

Eliminar.

Cambiar avatar.

Cambiar fondo.

Cambiar tema.

Ver historial.

Ver favoritos.

Ver actividad.

---

# CRUD de Noticias

Crear noticia.

Editar.

Eliminar.

Programar publicación.

Imagen principal.

Categorías.

Estado.

Destacada.

---

# CRUD de Animes

Crear.

Editar.

Eliminar.

Publicar.

Ocultar.

Asignar colección.

Cambiar portada.

Cambiar banner.

Editar sinopsis.

Editar géneros.

Editar relaciones.

Editar estudios.

Agregar imágenes.

Agregar trailers.

---

# CRUD de Episodios

Crear episodio.

Editar episodio.

Eliminar episodio.

Cambiar orden.

Asignar temporada.

Subir miniatura.

Agregar duración.

Asignar Opening.

Asignar Ending.

---

# CRUD de Videos

Cada episodio puede tener múltiples fuentes.

Campos:

Servidor

Idioma

Calidad

Principal

Estado

URL

Headers

Prioridad

---

# CRUD de Personajes

Nombre.

Imagen.

Descripción.

Seiyuu.

Edad.

Altura.

Peso.

Anime relacionado.

---

# CRUD de Estudios

Nombre.

Logo.

País.

Año.

Descripción.

Sitio web.

---

# CRUD de Colecciones

Colecciones especiales.

Ejemplo:

Los mejores Shonen.

Verano 2026.

Clásicos.

Películas.

---

# CRUD de Géneros

Crear.

Editar.

Eliminar.

Ordenar.

Color.

Icono.

---

# CRUD de Relaciones

Precuela.

Secuela.

OVA.

Especial.

Película.

Spin Off.

---

# Moderación

Eliminar comentarios.

Ocultar comentarios.

Bloquear usuarios.

Advertencias.

Reportes.

---

# Reportes

Usuarios pueden reportar:

Comentarios.

Perfiles.

Noticias.

Contenido.

El Panel debe permitir resolver cada reporte.

---

# Configuración General

Nombre del sitio.

Descripción.

Logo.

Favicon.

Tema por defecto.

Landing.

Modo mantenimiento.

APIs activas.

Límite de perfiles.

Límite de favoritos.

---

# Gestión de Providers

Activar.

Desactivar.

Cambiar prioridad.

Ver estado.

Ver tiempo de respuesta.

Ver errores.

---

# Gestión del Módulo +18

Habilitar.

Deshabilitar.

Asignar permisos.

Ver usuarios autorizados.

Ocultar contenido.

---

# Gestión de Temas

Crear nuevos temas.

Editar colores.

Editar fuentes.

Editar iconos.

Vista previa.

---

# Gestión de Storage

Ver uso.

Eliminar archivos.

Optimizar imágenes.

Reindexar.

---

# Gestión de Cache

Vaciar cache.

Reconstruir cache.

Actualizar datos.

Sincronizar proveedores.

---

# Logs

Registrar:

Login.

Logout.

CRUD.

Errores.

Cambios de rol.

Cambios de configuración.

Nunca permitir borrar logs.

---

# Auditoría

Registrar:

Usuario.

Acción.

Fecha.

IP (si aplica).

Dispositivo.

Resultado.

---

# Estadísticas

Usuarios activos.

Animes vistos.

Tiempo reproducido.

Series más populares.

Personajes favoritos.

Temas usados.

Dispositivos.

---

# Responsive

El Panel debe funcionar completamente en:

Desktop.

Tablet.

Mobile.

En móviles:

Las tablas deben convertirse en tarjetas.

---

# Seguridad

Toda acción debe validarse:

Frontend.

Backend.

RLS.

Nunca confiar únicamente en React.

---

# Roles

## Super Admin

Acceso total.

Puede modificar todo.

Puede crear administradores.

Puede eliminar administradores.

Puede cambiar configuraciones globales.

Puede gestionar el módulo +18.

Puede administrar APIs.

---

## Admin

Puede administrar contenido.

Noticias.

Animes.

Episodios.

Personajes.

Comentarios.

No puede modificar Super Admin.

No puede cambiar configuraciones críticas.

---

## Usuario

Nunca puede entrar al Panel.

---

## Invitado

Nunca puede entrar al Panel.

---

# Diseño

Colores oscuros.

Glassmorphism.

Sidebar fija.

Animaciones suaves.

Cards modernas.

Tablas elegantes.

Skeletons.

Sin pantallas vacías.

---

# Claude Rules

Nunca mezclar componentes públicos con el Panel.

Nunca permitir que Admin modifique Super Admin.

Nunca eliminar registros críticos sin confirmación.

Todo CRUD debe pasar por Services.

Toda seguridad debe existir también mediante RLS.

Nunca llamar Supabase directamente desde un componente del Panel.

Siempre reutilizar componentes.

---

# Mejoras futuras

Sistema de plugins.

Importar anime desde MAL.

Importar desde AniList.

Importar temporadas completas.

Editor visual de Landing.

Programación de publicaciones.

Gestión de banners dinámicos.

Analytics avanzados.

Panel multi idioma.

---

# Objetivo Final

El Panel de Administración debe ser capaz de gestionar AnimeCLZ sin necesidad de modificar el código fuente.

Todo el contenido del sitio debe poder administrarse desde aquí.

El Panel debe convertirse en el verdadero cerebro de AnimeCLZ.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 09 - UI / UX DESIGN SYSTEM

---

# Introducción

AnimeCLZ no es únicamente una página para ver anime.

Es una aplicación moderna.

Toda la interfaz debe transmitir:

Elegancia.

Velocidad.

Minimalismo.

Tecnología.

Premium.

Cada pantalla debe sentirse cuidada.

Nunca improvisada.

---

# Filosofía

Menos es más.

No llenar la pantalla de elementos.

Cada botón debe existir por una razón.

Cada animación debe mejorar la experiencia.

Nunca distraer.

---

# Inspiraciones

Netflix

Crunchyroll

AniList

Apple

Steam

Discord

Arc Browser

Vercel

Supabase

Notion

---

# Identidad Visual

AnimeCLZ debe transmitir:

Tecnología.

Anime.

Minimalismo.

Lujo.

Oscuridad.

Neón.

Elegancia.

Nunca parecer una plantilla gratuita.

---

# Colores Oficiales

Color principal

#E50914

Negro

#090909

Gris oscuro

#141414

Blanco

#FFFFFF

Texto secundario

#B3B3B3

Éxito

#22C55E

Advertencia

#F59E0B

Error

#EF4444

Información

#3B82F6

---

# Paletas

El usuario podrá elegir.

Paletas oficiales:

AnimeCLZ

Netflix

Tokyo Night

Cyberpunk

Glass

Neon

Emerald

Ocean

Purple Night

Sunset

Monochrome

Future

Cada tema modifica:

Colores.

Sombras.

Botones.

Cards.

Navbar.

Fondos.

---

# Tipografía

Principal

Inter

Secundaria

Space Grotesk

Código

JetBrains Mono

Nunca mezclar más de tres fuentes.

---

# Tamaños

Hero

56px

Título

40px

Subtítulo

28px

Heading

24px

Texto

16px

Pequeño

14px

Notas

12px

Nunca usar menos de 12px.

---

# Espaciado

Base

8px

Escala

8

16

24

32

48

64

96

Nunca usar medidas aleatorias.

---

# Bordes

Cards

16px

Botones

12px

Inputs

12px

Modal

20px

Nunca bordes cuadrados.

---

# Sombras

Muy suaves.

Nunca exageradas.

Preferir:

Glass.

Blur.

Glow ligero.

---

# Glassmorphism

Permitido.

Siempre con:

Blur.

Transparencia.

Borde tenue.

Nunca totalmente transparente.

---

# Botones

Tipos

Primary

Secondary

Outline

Ghost

Danger

Success

Icon

Floating

---

# Estados

Normal

Hover

Active

Focus

Disabled

Loading

Todos deben existir.

---

# Cards

Toda Card debe tener:

Imagen.

Título.

Descripción.

Hover.

Animación.

Esquinas redondeadas.

Skeleton.

Nunca cambios bruscos.

---

# AnimeCard

Debe mostrar:

Poster.

Título.

Año.

Score.

Tipo.

Estado.

Favorito.

Mi Lista.

Hover.

Nunca saturar información.

---

# Navbar

Siempre fija.

Glass.

Blur.

Responsive.

Nunca ocupar demasiado espacio.

---

# Footer

Simple.

Información.

Redes.

Copyright.

Links.

Nunca muy alto.

---

# Hero

Poster.

Banner.

Título.

Sinopsis.

Botones.

Información.

Trailer.

Animaciones.

Nunca texto excesivo.

---

# Landing

Debe ser muy visual.

Poco texto.

Muchas imágenes.

Animaciones.

Videos.

Estadísticas.

Beneficios.

FAQ.

Equipo.

Tecnologías.

CTA.

Nunca bloques enormes de texto.

---

# Inputs

16px mínimo.

Evitar zoom en iPhone.

Iconos.

Placeholder claro.

Estados de error.

---

# Modales

Glass.

Animaciones.

Cerrar con ESC.

Cerrar haciendo clic fuera.

En móviles:

Bottom Sheet.

---

# Skeleton

Toda carga debe usar Skeleton.

Nunca Spinner infinito.

---

# Empty States

Siempre ilustrados.

Nunca pantalla vacía.

Ejemplo

"No tienes favoritos"

↓

Botón

↓

Explorar Anime

---

# Toast

Posición

Superior derecha.

Duración

3 segundos.

Animación

Fade.

---

# Animaciones

Biblioteca oficial

Framer Motion.

CSS.

Lottie.

Rive.

Nunca GSAP salvo necesidad extrema.

---

# Duraciones

Micro

150 ms

Normal

250 ms

Compleja

400 ms

Nunca más de 600 ms.

---

# Hover

Escala

1.03

Nunca exagerar.

---

# Aparición

Fade.

Slide.

Scale.

Nunca efectos llamativos.

---

# Responsive

Desktop

Tablet

Android

iPhone

PWA

Nunca diseñar únicamente para Desktop.

---

# Mobile

Touch mínimo

44px

Sin hover obligatorio.

Todo accesible con un solo dedo.

---

# Scroll

Vertical

Solo página.

Horizontal

Solo carruseles.

Nunca scroll dentro de scroll.

---

# Carruseles

Scroll horizontal.

Snap.

Momentum.

Indicadores.

Nunca mostrar scrollbars.

---

# Imágenes

Siempre lazy loading.

Blur placeholder.

Alta resolución.

WebP.

AVIF cuando sea posible.

---

# Iconos

Lucide React.

Nunca mezclar múltiples librerías.

---

# Accesibilidad

Contraste AA.

ARIA.

Navegación por teclado.

Focus visible.

Alt obligatorio.

---

# Sonidos

Solo acciones importantes.

Nunca reproducir automáticamente.

---

# Feedback

Toda acción debe responder.

Hover.

Toast.

Cambio visual.

Nunca dejar al usuario con dudas.

---

# Errores

Mostrar:

Mensaje claro.

Botón reintentar.

Nunca códigos técnicos.

---

# Carga

Primero Skeleton.

Después contenido.

Nunca pantallas blancas.

---

# Consistencia

Todos los botones iguales.

Todos los inputs iguales.

Todos los modales iguales.

Todas las cards iguales.

---

# Claude Rules

Nunca crear un componente con un estilo diferente.

Nunca usar colores fuera del sistema.

Nunca crear animaciones excesivas.

Nunca usar más de tres tipografías.

Nunca romper el diseño responsive.

Siempre reutilizar componentes existentes.

Siempre seguir el sistema de diseño.

---

# Objetivo Final

AnimeCLZ debe verse como una aplicación premium.

El usuario debe sentir que utiliza una plataforma moderna comparable con Netflix, Crunchyroll o Apple TV, manteniendo una identidad propia inspirada en el mundo del anime.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 10 - LANDING PAGE

---

# Introducción

La Landing Page es la primera experiencia que tendrá un visitante.

Debe transmitir inmediatamente:

Anime.

Tecnología.

Modernidad.

Calidad.

Velocidad.

Elegancia.

Nunca debe sentirse como una página corporativa llena de texto.

La Landing debe contar una historia mediante imágenes, animaciones e interacción.

---

# Objetivos

La Landing debe:

Presentar AnimeCLZ.

Mostrar sus ventajas.

Invitar al registro.

Mostrar estadísticas.

Demostrar tecnología.

Transmitir confianza.

Explicar el proyecto con poco texto.

Ser completamente responsive.

---

# Filosofía

Mostrar.

No explicar.

El usuario debe descubrir AnimeCLZ mediante la experiencia visual.

Cada sección debe tener una función.

Nunca agregar texto solamente para llenar espacio.

---

# Flujo

Hero

↓

Características

↓

Cómo funciona

↓

Tecnologías

↓

Catálogo

↓

Estadísticas

↓

Roadmap

↓

FAQ

↓

Call To Action

↓

Footer

---

# Hero

Debe ocupar toda la pantalla.

Contiene:

Background animado.

Poster principal.

Logo AnimeCLZ.

Título.

Subtítulo corto.

Botones.

Indicador de scroll.

Nunca mostrar grandes párrafos.

---

# Background

Puede contener:

Partículas.

Neblina.

Gradientes.

Constelaciones.

Luces.

Parallax.

Nunca distraer.

---

# Personajes Animados

La Landing puede tener personajes anime ilustrativos.

Nunca personajes con copyright.

Preferir:

Mascota propia.

Siluetas.

Diseños originales.

Futuro:

Mascota oficial AnimeCLZ.

---

# Hero Visual

Debe sentirse cinematográfico.

Poster.

Sombras.

Glow.

Blur.

Movimiento suave.

---

# Botones

Primario

Comenzar

Secundario

Explorar catálogo

---

# Estadísticas

Ejemplo

Más de

15 000

Animes

↓

120 000

Episodios

↓

Miles

de personajes

↓

Usuarios

↓

Noticias

Animadas al entrar.

---

# Características

Mostrar mediante tarjetas.

Ejemplo

Favoritos.

Historial.

Temas.

Perfiles.

PWA.

Responsive.

Player.

No más de seis tarjetas visibles.

---

# Cómo Funciona

Tres pasos.

Crear cuenta.

Elegir perfil.

Disfrutar anime.

Con ilustraciones.

---

# Tecnologías

Mostrar únicamente logos.

React

Vite

Supabase

Framer Motion

Tailwind

AniList

Jikan

TypeScript (futuro)

Nunca grandes descripciones.

---

# Catálogo

Carrusel automático.

Top Anime.

Temporada.

Películas.

Recomendados.

Todo con imágenes.

---

# Animaciones

Todas las secciones deben aparecer mediante:

Fade.

Slide.

Reveal.

Nunca aparecer bruscamente.

---

# Roadmap

Timeline visual.

Versiones.

v1

v2

v3

v4

Futuras.

---

# FAQ

Máximo:

6 preguntas.

Accordion.

Animado.

---

# Equipo

Mostrar:

Fundador.

Proyecto personal.

Tecnologías.

Objetivo.

Nunca un texto largo.

---

# Call To Action

Pantalla completa.

Mensaje fuerte.

Botón.

Registrarse.

---

# Footer

Simple.

Logo.

Redes.

GitHub (si existe).

Contacto.

Versión.

Copyright.

---

# Login

Debe integrarse visualmente con la Landing.

Nunca sentirse como otra página distinta.

---

# Registro

Igual diseño.

Misma identidad.

---

# Responsive

Desktop.

Tablet.

Android.

iPhone.

PWA.

---

# Mobile

Hero adaptado.

Botones grandes.

Texto reducido.

Sin scroll horizontal.

---

# SEO

Meta Title.

Meta Description.

Open Graph.

Twitter Cards.

JSON-LD.

Canonical.

---

# Performance

LCP < 2.5 s

CLS < 0.1

INP < 200 ms

Todas las imágenes:

Lazy.

WebP.

AVIF cuando sea posible.

---

# Accesibilidad

ARIA.

Contraste.

Focus.

Navegación teclado.

---

# Easter Eggs

Opcionales.

Ejemplos:

Konami Code.

Cambio de tema.

Animación del logo.

Mascota saludando.

Nunca afectar rendimiento.

---

# Login Interactivo

La pantalla de inicio de sesión debe sentirse viva.

Un personaje ilustrado reaccionará a las acciones del usuario.

Ejemplos:

• Mira al usuario cuando este escribe.

• Sigue el movimiento del cursor con la vista.

• Cierra los ojos cuando se escribe la contraseña.

• Sonríe al iniciar sesión correctamente.

• Expresión de sorpresa si la contraseña es incorrecta.

• Celebración suave cuando el acceso es exitoso.

Estas animaciones deben ser discretas y no impedir el uso del formulario.

La implementación recomendada es mediante Rive o Lottie.

---

# Diseño

Glassmorphism.

Blur.

Glow.

Neón suave.

Minimalismo.

Mucho espacio.

Nunca saturar.

---

# Claude Rules

Nunca llenar la Landing con grandes bloques de texto.

Siempre priorizar imágenes sobre párrafos.

Toda sección debe tener una animación de entrada.

Mantener coherencia con el Design System.

No usar personajes con copyright como parte permanente de la interfaz.

Optimizar todas las imágenes.

Mantener excelente rendimiento.

---

# Objetivo Final

La Landing debe transmitir que AnimeCLZ es una plataforma moderna, rápida y cuidadosamente diseñada.

Antes de iniciar sesión, el usuario ya debe percibir una experiencia premium y tener claro el propósito del proyecto sin necesidad de leer largos textos.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 11 - SEARCH ENGINE

---

# Introducción

El buscador de AnimeCLZ es uno de los componentes más importantes de toda la plataforma.

Su función no es únicamente encontrar un anime.

Debe convertirse en un motor inteligente de descubrimiento.

El usuario debe poder encontrar contenido utilizando múltiples criterios sin conocer el nombre exacto.

Toda búsqueda debe pasar por ProviderManager.

Nunca consultar APIs directamente desde la interfaz.

---

# Objetivos

El buscador debe permitir encontrar:

✔ Anime

✔ Personajes

✔ Estudios

✔ Géneros

✔ Temporadas

✔ Películas

✔ OVA

✔ Especiales

✔ Seiyuus (futuro)

✔ Noticias relacionadas (futuro)

---

# Arquitectura

Usuario

↓

SearchBar

↓

SearchService

↓

ProviderManager

↓

AniList

↓

Jikan

↓

Kitsu

↓

Base Local

↓

Resultados

---

# Filosofía

Buscar debe sentirse inmediato.

Nunca esperar varios segundos.

Siempre mostrar resultados progresivamente.

---

# Tipos de búsqueda

Anime

Personaje

Estudio

Género

Año

Temporada

Estado

Popularidad

Tags

---

# Buscador Principal

Debe aceptar:

Naruto

↓

Naruto Shippuden

↓

Naruto Uzumaki

↓

Studio Pierrot

↓

Shonen

↓

2002

Todo desde la misma barra.

---

# Autocompletado

Mientras escribe:

Mostrar

Poster

Título

Tipo

Año

Score

Personajes relacionados

Nunca esperar Enter.

---

# Debounce

300 ms.

Cancelar búsquedas anteriores mediante AbortController.

Nunca ejecutar búsquedas innecesarias.

---

# Búsqueda por Anime

Buscar por:

Título original.

Romaji.

Inglés.

Español.

Sinónimos.

Alias.

Slug.

---

# Búsqueda por Personaje

Debe aceptar:

Naruto

↓

Naruto Uzumaki

↓

Mostrar anime relacionado.

↓

Permitir usar como avatar.

---

# Búsqueda por Estudio

Ejemplo

MAPPA

↓

Mostrar todos sus animes.

---

# Búsqueda por Género

Acción

Drama

Romance

Comedia

Isekai

Fantasy

etc.

---

# Búsqueda por Año

2026

↓

Todos los animes del año.

---

# Búsqueda por Temporada

Winter

Spring

Summer

Fall

---

# Búsqueda por Estado

Emisión

Finalizado

Próximamente

---

# Búsqueda por Popularidad

Más vistos.

Mejor puntuados.

Tendencia.

Más favoritos.

---

# Búsqueda por Tags

Ejemplos

Cyberpunk

Samurai

School

Magic

Sports

Time Travel

---

# Historial

Cada perfil mantiene:

Últimas búsquedas.

Máximo:

20.

Nunca compartir entre perfiles.

---

# Recomendaciones

Si la barra está vacía:

Mostrar

Historial.

Favoritos.

Continuar viendo.

Tendencias.

---

# Resultados

Cada resultado muestra:

Poster.

Título.

Score.

Año.

Tipo.

Estado.

Botón favorito.

Nunca mostrar solo texto.

---

# Prioridad

1

Coincidencia exacta.

2

Comienza con.

3

Contiene.

4

Alias.

5

Personajes.

---

# ProviderManager

El SearchService nunca consulta APIs.

Siempre:

ProviderManager.search()

---

# Merge

AniList

+

Jikan

+

Kitsu

+

Base Local

↓

Eliminar duplicados.

↓

Ordenar.

↓

Mostrar.

---

# Cache

Búsquedas repetidas:

10 minutos.

---

# Offline

Mostrar resultados cacheados.

---

# Filtros

Género.

Año.

Temporada.

Formato.

Estado.

Idioma.

Score.

Duración.

Estudio.

Clasificación.

---

# Panel de filtros

Desktop

Sidebar.

Mobile

Bottom Sheet.

---

# Ordenamiento

Popularidad.

Score.

A-Z.

Más recientes.

Más antiguos.

Aleatorio.

---

# Infinite Scroll

Resultados largos.

Nunca paginación tradicional.

---

# Sin Resultados

Mostrar ilustración.

Sugerencias.

Botón limpiar filtros.

Nunca pantalla vacía.

---

# Errores

Nunca mostrar:

HTTP 500.

429.

504.

Siempre mostrar un mensaje amigable y ofrecer reintentar.

---

# Búsqueda por Voz (Futuro)

Usar Web Speech API.

---

# Búsqueda Inteligente (Futuro)

Aceptar errores de escritura.

Ejemplo

Narut

↓

Naruto

---

# Búsqueda Semántica (Futuro)

Ejemplo

"anime de ninjas"

↓

Naruto

Basilisk

Ninja Scroll

---

# Búsqueda Personalizada

Usar preferencias del perfil.

Priorizar:

Géneros favoritos.

Estudios favoritos.

Animes vistos.

---

# Rendimiento

Tiempo objetivo:

<300 ms para resultados cacheados.

<1 s para consultas remotas.

---

# Responsive

Desktop.

Tablet.

Android.

iPhone.

PWA.

---

# Accesibilidad

Navegación con teclado.

Enter.

Escape.

Flechas.

ARIA.

---

# Seguridad

Nunca construir consultas desde la UI.

Validar parámetros.

Escapar caracteres especiales.

---

# Claude Rules

Nunca consultar una API directamente desde Search.

Siempre utilizar SearchService.

SearchService siempre utiliza ProviderManager.

Toda búsqueda debe soportar AbortController.

Toda búsqueda debe usar debounce.

Toda búsqueda debe poder cachearse.

Nunca romper el historial por perfil.

Nunca compartir búsquedas entre perfiles.

---

# Mejoras Futuras

Búsqueda por imagen.

Búsqueda por opening.

Búsqueda por ending.

Búsqueda por actor de voz.

Búsqueda mediante IA.

Búsqueda por descripción ("anime donde viajan en el tiempo").

Sistema de recomendaciones basado en Machine Learning.

---

# Objetivo Final

El buscador debe sentirse tan rápido como Google y tan útil como AniList.

Debe convertirse en la principal herramienta para descubrir contenido dentro de AnimeCLZ, aprovechando todos los proveedores disponibles y respetando siempre la arquitectura definida por ProviderManager.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 12 - SECURITY

---

# Introducción

La seguridad de AnimeCLZ no depende únicamente del frontend.

Toda validación importante debe existir también en el backend mediante Supabase y Row Level Security (RLS).

El frontend mejora la experiencia del usuario.

El backend garantiza la seguridad.

Nunca confiar únicamente en React.

---

# Filosofía

Todo dato recibido del cliente debe considerarse potencialmente malicioso.

Toda operación debe validarse nuevamente en el servidor.

Nunca asumir que el frontend es confiable.

---

# Objetivos

Garantizar:

✔ Protección de cuentas

✔ Protección de perfiles

✔ Protección del Panel Admin

✔ Protección del módulo +18

✔ Protección de Storage

✔ Protección de APIs

✔ Protección de datos

✔ Protección de contenido privado

---

# Arquitectura

```

Cliente

↓

React

↓

Services

↓

Supabase

↓

Policies (RLS)

↓

Base de Datos

```

---

# Principios

Nunca confiar en:

Inputs.

IDs.

Roles enviados desde React.

profile_id.

user_id.

Cookies manipuladas.

LocalStorage.

---

# Autenticación

Toda autenticación será administrada por:

Supabase Auth.

Nunca implementar autenticación propia.

---

# Tokens

Utilizar únicamente:

JWT de Supabase.

Nunca almacenar tokens manualmente.

Nunca modificar el JWT.

---

# Roles

Los permisos pertenecen al perfil.

No a la cuenta.

Roles oficiales:

Super Admin

Admin

Usuario

Invitado

Adult

---

# Verificación de Rol

Siempre validar:

Frontend.

↓

Backend.

↓

RLS.

Nunca depender solo de ocultar botones.

---

# Row Level Security

Todas las tablas deben tener:

RLS habilitado.

Políticas explícitas.

Nunca dejar tablas públicas por error.

---

# Policies

Cada operación debe definir:

SELECT

INSERT

UPDATE

DELETE

Nunca utilizar políticas genéricas sin revisar.

---

# Storage

Buckets privados por defecto.

Buckets públicos solo cuando sea necesario.

Ejemplo:

avatars/

Puede ser público.

Contenido privado:

No.

---

# Validación

Todo input debe validarse:

Frontend.

Backend.

Base de datos.

---

# Sanitización

Escapar caracteres especiales.

Eliminar HTML cuando no sea permitido.

Nunca renderizar contenido HTML sin sanitizar.

---

# Protección XSS

Nunca utilizar:

dangerouslySetInnerHTML

Salvo casos excepcionales y con contenido completamente sanitizado.

---

# Protección CSRF

Utilizar mecanismos propios de Supabase.

No implementar soluciones caseras.

---

# Protección SQL Injection

Nunca construir consultas SQL manualmente.

Utilizar únicamente el cliente oficial de Supabase.

---

# Protección contra fuerza bruta

Limitar:

Intentos de login.

Intentos de recuperación.

Intentos de registro.

---

# Rate Limiting

Aplicar límites a:

Login.

Registro.

Cambio de contraseña.

Búsquedas intensivas.

Operaciones administrativas.

---

# CORS

Permitir únicamente:

Dominios autorizados.

Nunca usar "*".

---

# Content Security Policy

Definir una CSP estricta.

Permitir únicamente:

Supabase.

AniList.

Jikan.

AnimeThemes.

TMDB.

Dominios propios.

---

# Variables de Entorno

Nunca subir:

API Keys.

Secrets.

JWT privados.

Tokens de administrador.

Todo secreto debe vivir en:

.env

Variables de Vercel

Secrets de Supabase

---

# Logs

Registrar:

Inicio de sesión.

Cierre de sesión.

Errores críticos.

Cambios de rol.

Cambios de configuración.

Intentos fallidos.

Nunca registrar contraseñas.

Nunca registrar tokens.

---

# Auditoría

Toda acción importante debe registrar:

Usuario.

Perfil.

Fecha.

Acción.

Resultado.

---

# Protección del Panel

El Panel Admin nunca debe depender únicamente del menú.

Aunque un usuario escriba manualmente la URL:

Debe verificarse el rol.

---

# Protección de Perfiles

Un perfil solo puede acceder a:

Sus favoritos.

Su historial.

Su lista.

Su configuración.

Nunca a los datos de otro perfil.

---

# Protección del módulo +18

El contenido +18 debe requerir:

Permiso explícito.

Edad configurada.

Rol autorizado.

Nunca mostrarse por accidente.

---

# Eliminación

Antes de eliminar:

Mostrar confirmación.

Validar permisos.

Registrar auditoría.

Eliminar relaciones cuando corresponda.

---

# Backups

Realizar copias periódicas de:

Base de datos.

Storage.

Configuraciones.

---

# Dependencias

Mantener librerías actualizadas.

Eliminar dependencias sin uso.

Revisar vulnerabilidades periódicamente.

---

# Seguridad en APIs

Toda comunicación debe realizarse mediante HTTPS.

Nunca usar HTTP en producción.

---

# Responsive

La seguridad nunca cambia por dispositivo.

Las mismas reglas aplican para:

Desktop.

Android.

iPhone.

PWA.

---

# Claude Rules

Nunca confiar en datos provenientes del frontend.

Nunca eliminar políticas RLS sin justificación.

Nunca almacenar información sensible en LocalStorage.

Nunca exponer claves privadas.

Nunca usar consultas SQL construidas manualmente.

Toda operación crítica debe validarse también en el backend.

Siempre registrar acciones administrativas importantes.

---

# Mejoras Futuras

Autenticación multifactor (MFA).

Inicio de sesión con Passkeys.

Notificaciones de nuevos dispositivos.

Sesiones activas por dispositivo.

Detección de actividad sospechosa.

Panel de auditoría avanzado.

Cifrado de datos sensibles.

---

# Objetivo Final

AnimeCLZ debe mantener una arquitectura segura donde la protección no dependa del cliente, sino de políticas claras en Supabase, una correcta gestión de permisos y buenas prácticas de desarrollo.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 13 - PERFORMANCE

---

# Introducción

AnimeCLZ debe sentirse extremadamente rápido.

El usuario nunca debe percibir tiempos de espera innecesarios.

La optimización debe ser una prioridad desde el diseño de la arquitectura.

El rendimiento no consiste únicamente en obtener una buena puntuación en Lighthouse.

Debe sentirse rápido para el usuario.

---

# Objetivos

Mantener:

✔ Carga inicial rápida

✔ Navegación instantánea

✔ Bajo consumo de memoria

✔ Bajo consumo de red

✔ Excelente experiencia móvil

✔ Excelente rendimiento en PWA

✔ Excelente rendimiento incluso con conexiones lentas

---

# Filosofía

No cargar lo que el usuario todavía no necesita.

No renderizar lo que no está visible.

No solicitar datos repetidos.

No descargar imágenes innecesarias.

Todo debe ser progresivo.

---

# Core Web Vitals

Objetivos

LCP

Menor a 2.5 segundos.

CLS

Menor a 0.1

INP

Menor a 200 ms.

TTFB

Menor a 500 ms.

---

# Lazy Loading

Todo componente pesado debe cargarse mediante:

React.lazy()

Suspense

Ejemplos:

AnimeDetail

Player

Admin

Noticias

Configuración

Nunca cargar toda la aplicación al inicio.

---

# Code Splitting

Separar:

Landing

Home

Player

Admin

Auth

Configuración

Nunca generar un único bundle gigante.

---

# Bundle Size

Objetivo

JavaScript inicial

Menor a 300 KB.

CSS inicial

Menor a 100 KB.

Imágenes iniciales

Menor a 1 MB.

---

# Imágenes

Siempre utilizar:

Lazy Loading

WebP

AVIF cuando sea posible

Placeholder Blur

Responsive Images

Nunca cargar imágenes enormes.

---

# Posters

Utilizar tamaños diferentes según dispositivo.

Desktop

Alta resolución.

Mobile

Resolución reducida.

---

# Banners

Nunca descargar banners completos en móviles.

Utilizar versiones optimizadas.

---

# Infinite Scroll

Utilizar únicamente cuando exista una gran cantidad de contenido.

Nunca cargar cientos de tarjetas desde el inicio.

---

# Carruseles

Cargar únicamente:

Elementos visibles.

Dos elementos adicionales.

Nada más.

---

# Virtualización

Para listas muy grandes utilizar:

Virtual Scrolling.

Nunca renderizar miles de elementos.

---

# Memoización

Utilizar:

React.memo()

useMemo()

useCallback()

Solo cuando exista una mejora real.

Nunca abusar.

---

# Contextos

Mantener Context pequeños.

Nunca almacenar información innecesaria.

Evitar renders globales.

---

# Estado

Separar:

UI

Datos

Autenticación

Player

Perfiles

Nunca un único Context gigante.

---

# Cache

Utilizar varios niveles.

Memory Cache

↓

IndexedDB

↓

LocalStorage

↓

Provider

---

# Tiempo de Cache

Home

5 minutos.

Anime

30 minutos.

Galería

1 hora.

Géneros

24 horas.

Configuración

24 horas.

---

# Prefetch

Al pasar el cursor sobre una tarjeta:

Precargar:

Anime Detail.

Poster.

Información.

Solo Desktop.

---

# Preload

Precargar únicamente:

Logo.

Fuente principal.

Hero.

Nada más.

---

# Service Worker

Cachear:

Assets.

Fuentes.

Imágenes.

API cuando sea posible.

Nunca cachear datos sensibles.

---

# Navegación

Las transiciones deben sentirse instantáneas.

Nunca mostrar pantalla blanca.

Siempre utilizar Skeleton.

---

# Skeleton

Toda carga superior a 150 ms debe mostrar Skeleton.

Nunca Spinner infinito.

---

# Reintentos

Solo para errores temporales.

429

500

502

503

504

Nunca para:

404

401

403

---

# AbortController

Toda petición debe poder cancelarse.

Especialmente:

Búsquedas.

Carruseles.

Anime Detail.

---

# Debounce

Buscador

300 ms.

Filtros

200 ms.

Nunca realizar solicitudes por cada tecla.

---

# Optimización Mobile

Reducir:

Animaciones.

Blur excesivo.

Sombras.

Videos automáticos.

---

# Animaciones

Máximo:

60 FPS.

Nunca bloquear el hilo principal.

---

# Fuentes

Utilizar:

font-display: swap

Preload únicamente la principal.

---

# Iconos

Lucide React.

Importaciones individuales.

Nunca importar toda la librería.

---

# Dependencias

Eliminar dependencias sin uso.

Revisar bundle periódicamente.

Evitar librerías gigantes.

---

# API

Nunca realizar solicitudes duplicadas.

Siempre consultar primero el cache.

---

# ProviderManager

Debe reutilizar respuestas cuando sea posible.

Nunca repetir solicitudes iguales.

---

# Errores

Mostrar contenido cacheado antes de mostrar un error.

---

# Lighthouse

Objetivos

Performance

95+

Accessibility

100

Best Practices

100

SEO

100

---

# Monitoreo

Revisar periódicamente:

Lighthouse

Web Vitals

Bundle Analyzer

Network

Memory

---

# Responsive

Desktop.

Tablet.

Android.

iPhone.

PWA.

Todos deben sentirse rápidos.

---

# Claude Rules

Nunca cargar componentes pesados innecesariamente.

Nunca romper el sistema de cache.

Siempre usar Lazy Loading cuando corresponda.

Siempre optimizar imágenes.

Nunca duplicar llamadas a APIs.

Siempre cancelar solicitudes obsoletas.

Nunca sacrificar rendimiento por efectos visuales.

---

# Mejoras Futuras

Streaming progresivo.

Compresión automática de imágenes.

CDN propio.

Edge Functions.

Compresión Brotli.

Renderizado parcial.

Predicción de navegación mediante IA.

---

# Objetivo Final

AnimeCLZ debe sentirse instantáneo incluso con miles de animes, múltiples proveedores y una gran cantidad de usuarios simultáneos.

El rendimiento debe formar parte de la arquitectura, no ser una optimización posterior.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 14 - PROGRESSIVE WEB APP (PWA)

---

# Introducción

AnimeCLZ debe poder instalarse como una aplicación nativa.

El usuario no debe notar diferencias importantes entre utilizar:

• La versión web.

• La PWA.

• Una futura aplicación móvil.

La PWA será el puente entre la web y una aplicación completa.

---

# Objetivos

AnimeCLZ debe soportar:

✔ Instalación

✔ Pantalla completa

✔ Iconos personalizados

✔ Splash Screen

✔ Funcionamiento Offline

✔ Actualizaciones automáticas

✔ Cache inteligente

✔ Push Notifications

✔ Background Sync

✔ Responsive completo

✔ Integración con Android

✔ Integración con iPhone

---

# Filosofía

La PWA nunca será una versión reducida.

Debe ofrecer prácticamente la misma experiencia que una aplicación instalada.

---

# Arquitectura

Usuario

↓

Navegador

↓

Service Worker

↓

Cache

↓

AnimeCLZ

↓

Supabase

↓

ProviderManager

---

# Instalación

Debe funcionar desde:

Chrome

Edge

Safari

Firefox (cuando sea compatible)

Android

iPhone

Windows

macOS

---

# Manifest

Debe definir:

Nombre

Nombre corto

Descripción

Tema

Color principal

Background

Orientación

Display

Iconos

Shortcuts

Categorías

Idioma

---

# Display

Modo recomendado:

standalone

Nunca browser.

---

# Splash Screen

Debe incluir:

Logo AnimeCLZ

Fondo oficial

Color del tema

Versión

Nunca pantalla blanca.

---

# Iconos

Tamaños mínimos:

72x72

96x96

128x128

144x144

152x152

192x192

384x384

512x512

Maskable

Apple Touch Icon

---

# Safe Area

Compatibilidad total con:

Notch

Dynamic Island

Pantallas curvas

Gesture Navigation

Utilizar:

env(safe-area-inset-top)

env(safe-area-inset-bottom)

env(safe-area-inset-left)

env(safe-area-inset-right)

---

# Offline

Debe funcionar parcialmente.

Disponibles:

Landing

Configuración

Perfil

Favoritos

Mi Lista

Historial

Últimos animes abiertos

Cache de imágenes

Nunca mostrar pantalla completamente vacía.

---

# Estrategia de Cache

Assets

Cache First

↓

Imágenes

Stale While Revalidate

↓

API

Network First

↓

Configuración

Cache First

↓

Videos

Nunca cachear automáticamente.

---

# Actualizaciones

El Service Worker debe detectar:

Nueva versión

↓

Notificar usuario

↓

Actualizar

↓

Recargar cuando el usuario lo acepte

Nunca actualizar silenciosamente mientras reproduce un video.

---

# Push Notifications

Preparado para:

Nuevos episodios

Noticias

Recordatorios

Lanzamientos

Favoritos actualizados

Nunca enviar spam.

---

# Background Sync

Cuando vuelva Internet:

Sincronizar:

Favoritos

Mi Lista

Historial

Comentarios

Configuraciones

---

# Continue Watching

Debe funcionar incluso sin conexión cuando el episodio esté disponible localmente.

Guardar:

Posición

Episodio

Anime

Fecha

---

# Integración Android

Compatibilidad:

Chrome

Samsung Internet

Edge

Instalación mediante:

Add to Home Screen

---

# Integración iPhone

Compatibilidad:

Safari

Instalación:

Compartir

↓

Agregar a pantalla de inicio

Soportar:

Apple Touch Icons

Splash

Safe Area

Status Bar

---

# Navegación

La PWA nunca debe abrir nuevas pestañas innecesariamente.

Toda navegación debe sentirse nativa.

---

# Estado de Red

Detectar:

Online

Offline

Conectividad lenta

Mostrar indicadores claros.

---

# Service Worker

Responsabilidades:

Cache

Actualizaciones

Offline

Background Sync

Push

Nunca lógica de negocio.

---

# Cache Storage

Organizar:

images-cache

api-cache

assets-cache

fonts-cache

Nunca mezclar recursos.

---

# Actualización de Cache

Eliminar automáticamente versiones antiguas.

Nunca acumular cache infinito.

---

# Videos

No cachear automáticamente.

En el futuro:

Descargas manuales.

Modo Offline Premium.

---

# Imágenes

Guardar únicamente:

Poster

Banner

Avatar

Iconos

Nunca imágenes innecesarias.

---

# Rendimiento

Objetivos:

Inicio

<2 segundos

Cambio de página

Instantáneo

Apertura desde icono

<1 segundo

---

# Responsive

Desktop

Tablet

Android

iPhone

PWA

TV (futuro)

---

# Accesibilidad

La PWA debe respetar:

Contraste

Navegación teclado

Lectores de pantalla

Focus

ARIA

---

# Seguridad

El Service Worker nunca debe almacenar:

JWT

Passwords

Secrets

Información sensible

---

# Claude Rules

Nunca romper el manifest.

Nunca eliminar el Service Worker.

Nunca almacenar datos sensibles en cache.

Siempre respetar Safe Areas.

Siempre optimizar iconos.

Siempre actualizar el cache de forma controlada.

Nunca cachear videos automáticamente.

---

# Mejoras Futuras

Descarga de episodios.

Modo completamente Offline.

Widgets Android.

Widgets iPhone.

Notificaciones inteligentes.

Sincronización entre dispositivos.

Actualizaciones diferenciales.

---

# Objetivo Final

AnimeCLZ debe sentirse como una aplicación instalada, rápida, moderna y confiable.

El usuario debe poder abrir AnimeCLZ desde su dispositivo sin percibir que realmente está utilizando un navegador.

---

FIN DEL DOCUMENTO

# AnimeCLZ Bible v1.0

# 15 - API GUIDELINES

---

# Introducción

AnimeCLZ fue diseñado para funcionar con múltiples proveedores de información.

Ninguna API externa es indispensable.

Todas las APIs pueden ser reemplazadas sin modificar la interfaz de usuario.

La integración de nuevos proveedores debe respetar siempre la arquitectura definida por ProviderManager.

---

# Objetivos

Garantizar:

✔ Integración sencilla de nuevas APIs

✔ Bajo acoplamiento

✔ Reemplazo transparente de proveedores

✔ Alta disponibilidad

✔ Consistencia de datos

✔ Escalabilidad

✔ Fácil mantenimiento

---

# Filosofía

Las APIs son únicamente fuentes de datos.

La aplicación pertenece a AnimeCLZ.

Nunca permitir que la estructura de una API determine la arquitectura del proyecto.

---

# Arquitectura

```
React

↓

Services

↓

ProviderManager

↓

Provider Interface

↓

AniList

Jikan

Kitsu

AnimeThemes

TMDB

Consumet

Enime

Base Local
```

---

# Regla Principal

Nunca consumir una API directamente desde:

React

Pages

Components

Contexts

Hooks

Siempre utilizar:

Services

↓

ProviderManager

↓

Provider

---

# Provider Interface

Todo Provider implementa exactamente:

search()

getAnime()

getEpisodes()

getCharacters()

getRecommendations()

getRelations()

getGallery()

getTrailer()

getStudios()

healthCheck()

Nunca agregar métodos arbitrarios sin actualizar la interfaz oficial.

---

# ProviderManager

Responsabilidades:

Seleccionar proveedor.

Fusionar datos.

Eliminar duplicados.

Cachear.

Reintentar.

Fallback.

Registrar errores.

Nunca renderizar componentes.

---

# Orden Oficial

1

Base Local

↓

2

AniList

↓

3

Jikan

↓

4

Kitsu

↓

5

AnimeThemes

↓

6

TMDB

↓

7

Consumet (video)

↓

8

Enime (video)

↓

9

Futuros proveedores

---

# Integración de un Nuevo Provider

Pasos obligatorios:

1.

Crear carpeta:

providers/NuevoProvider/

2.

Implementar Provider Interface.

3.

Registrar en ProviderManager.

4.

Agregar pruebas.

5.

Actualizar documentación.

Nunca modificar la UI.

---

# Formato Unificado

Todos los Providers deben devolver el mismo formato.

Ejemplo:

Anime

{
id,
title,
poster,
banner,
description,
score,
episodes,
genres,
studios,
characters
}

Nunca devolver estructuras propias de cada API.

---

# Merge de Datos

Regla:

Conservar siempre la mejor información disponible.

Ejemplo:

AniList:

Sinopsis completa.

Jikan:

Trailer.

TMDB:

Banner HD.

Resultado:

Un único objeto enriquecido.

---

# Prioridad de Datos

Base Local

↓

AniList

↓

Jikan

↓

Kitsu

↓

TMDB

---

# Reemplazo de Datos

Solo reemplazar cuando:

El nuevo dato sea de mayor calidad.

Ejemplos:

Imagen con mayor resolución.

Descripción más completa.

Mayor cantidad de episodios.

Nunca reemplazar datos buenos por información inferior.

---

# Duplicados

Comparar mediante:

MAL ID

AniList ID

Título

Slug

Alias

Romaji

Sinónimos

Nunca mostrar dos veces el mismo anime.

---

# Cache

Todo Provider debe soportar cache.

Tipos:

Memory

IndexedDB

LocalStorage

TTL definido por ProviderManager.

---

# Timeout

Toda petición:

10 segundos máximo.

Después:

AbortController.

---

# Retry

Aplicar únicamente para:

429

500

502

503

504

Máximo:

4 intentos.

Backoff exponencial.

---

# Rate Limiting

Respetar siempre las restricciones oficiales de cada proveedor.

Nunca intentar evitarlas mediante técnicas abusivas.

---

# Health Check

Todo Provider implementa:

healthCheck()

Debe indicar:

Disponible

Tiempo de respuesta

Errores recientes

Versión

---

# Logs

Registrar:

Proveedor

Tiempo

Método

Resultado

Solo en desarrollo.

---

# Versionado

Cada Provider debe indicar:

Nombre

Versión

Fecha

Cambios importantes

---

# Compatibilidad

Un cambio de versión nunca debe romper ProviderManager.

Si cambia la API:

Actualizar únicamente el Provider correspondiente.

---

# Errores

Nunca propagar errores técnicos al usuario.

El Provider devuelve:

Resultado válido

o

Objeto vacío controlado

Nunca excepciones sin manejar.

---

# Seguridad

Nunca almacenar:

API Keys

Secrets

Tokens privados

Toda información sensible debe permanecer en variables de entorno o servicios seguros.

---

# Testing

Cada Provider debe tener pruebas para:

Búsqueda

Detalle

Personajes

Episodios

Recomendaciones

Errores

Timeout

Retry

Merge

---

# APIs Oficiales

Actualmente soportadas:

AniList

Jikan

Kitsu

AnimeThemes

TMDB

Consumet (planificado)

Enime (planificado)

Base Local

---

# APIs Experimentales

Pueden integrarse siempre que:

Sean legales.

Sean públicas o autorizadas.

Respeten licencias.

No comprometan la seguridad.

---

# Deprecación

Cuando un Provider deje de utilizarse:

Nunca eliminar inmediatamente.

Marcar como:

Deprecated.

Mantener compatibilidad hasta migrar completamente.

---

# Claude Rules

Nunca consumir una API directamente desde React.

Nunca romper ProviderManager.

Nunca devolver estructuras distintas a la interfaz oficial.

Siempre implementar healthCheck().

Siempre documentar un nuevo Provider.

Siempre agregar pruebas.

Siempre respetar el orden de prioridad.

Nunca eliminar un Provider sin una migración planificada.

---

# Mejoras Futuras

Balanceo automático entre proveedores.

Selección dinámica según disponibilidad.

Métricas en tiempo real.

Dashboard de APIs.

Detección automática de degradación.

Integración con proveedores propios.

---

# Objetivo Final

AnimeCLZ debe poder cambiar completamente de proveedor sin modificar un solo componente del frontend.

Toda la inteligencia de integración debe vivir dentro de ProviderManager y de los Providers individuales.

---

FIN DEL DOCUMENTO