# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Esta es la guía oficial del proyecto AnimeCLZ. Las reglas de esta sección se siguen en todo el desarrollo,
no solo en la sesión en que se definieron.

## Identidad

El proyecto se llama **AnimeCLZ**. El nombre "StreamFlix" no debe volver a usarse en ninguna parte:
logo, título, README, favicon, metadata, componentes ni texto visible. (Estado actual: `index.html` y
`README.md` ya usan "AnimeCLZ"; no se encontraron referencias a "StreamFlix" en `src/`. Si aparece alguna
en el futuro — nuevo componente, asset, commit copiado — debe corregirse antes de continuar.)

## Objetivo

AnimeCLZ es una plataforma de streaming de anime pensada para:

- Portafolio profesional.
- Aprender React en profundidad.
- Practicar arquitectura de frontend real.
- Convertirse en un producto/negocio real a futuro.

El código debe sentirse como el de un producto comercial listo para seguir creciendo, no como una prueba
de concepto.

## Diseño

Inspiración: Apple TV, AniList, Arc Browser, Notion, algunas ideas de Crunchyroll — sin copiar a ninguna,
y explícitamente **sin parecerse a Netflix**. AnimeCLZ debe tener identidad visual propia.

Paleta oficial (Sprint 3.5 — reemplaza la paleta roja del Sprint 2 por completo; ya migrada en
`src/styles/index.css`, token real: `--color-*`):

| Token | Valor |
|---|---|
| Background | `#050505` |
| Surface | `#101010` |
| Surface Hover | `#181818` |
| Border | `#2B2B2B` |
| Primary | `#6EA8FE` |
| Secondary | `#87C4FF` |
| Text | `#F5F5F5` |
| Text Secondary | `#A5A5A5` |
| Error | `#F87171` (solo para estados de error, nunca decorativo) |

Prohibido como color de marca: **rojo**, amarillo, naranja, morado. Gradientes solo muy suaves y solo
entre `Primary`/`Secondary` (botones, algún acento) — nunca como fondo de pantalla completo.

Requisitos transversales: animaciones suaves con Framer Motion, Tailwind limpio (sin clases redundantes
o contradictorias), diseño responsive y accesibilidad (foco visible, contraste, roles/aria donde aplique).

## Arquitectura

Estructura de carpetas a mantener (no aplanar ni reorganizar sin acuerdo explícito):

`components/`, `pages/`, `hooks/`, `services/`, `router/`, `layout/`, `utils/`, `context/`, `constants/`.

- `components/ui/` — primitivas agnósticas del dominio; si un componente "sabe" qué es un anime, no va aquí.
- `layout/` — shell fijo de la app (Navbar, Footer, Layout) montado vía `<Outlet />`.
- `pages/` — un archivo por ruta.
- `router/` — `AppRouter.jsx` es la única fuente de verdad de rutas; toda ruta se referencia como
  `ROUTES.*` desde `constants/`, nunca como string hardcodeado.
- `services/` — única capa que habla con la API (ver sección API); los componentes nunca llaman a
  `axios`/`jikan` directamente.
- `hooks/` — `useFetch` es el hook de datos genérico (AbortController + caché + retry) que usa toda la
  app; `useDebounce` para inputs (buscador). No crear un hook de fetch nuevo por página: parametrizar
  `useFetch` con la función de servicio correspondiente.
- `context/` — `FavoritesContext` ("Mi Lista") ya implementado sobre localStorage; los componentes solo
  llaman a `useFavorites()`, nunca leen `localStorage` directamente, para poder migrar el storage a
  Firebase en el Sprint 4 sin tocar componentes.
- `constants/` — rutas y datos de navegación; el resto de la app importa desde aquí en vez de duplicar.
- `utils/` — helpers puros (p. ej. `cn.js`, merge de clases con `clsx` + `tailwind-merge`).

No duplicar código ni componentes: siempre buscar y reutilizar antes de crear uno nuevo.

Alias `@` → `src/` (configurado en `vite.config.js` y `jsconfig.json`) — importar con `@/...` entre
carpetas, no con rutas relativas profundas.

Estilos: Tailwind v4 se configura enteramente en CSS vía el bloque `@theme` de `src/styles/index.css` —
no existe `tailwind.config.js`. Los tokens de diseño (colores, `font-display`/`font-body` — solo dos
familias, no hay mono) viven ahí; se reutilizan en vez de hardcodear valores.

## API

Usar únicamente **Jikan API** (`src/api/jikan.js`, baseURL `https://api.jikan.moe/v4`) como fuente de
datos. Nunca inventar información de animes (títulos, ratings, sinopsis, etc.) — todo dato mostrado debe
venir de la respuesta real de la API. `animeService.js` mapea toda respuesta al modelo canónico único
(`mapAnime`) y expone funciones que ya devuelven `{ data, pagination }` de forma consistente — no crear
una función de servicio que devuelva una forma distinta.

Jikan es una API pública sin key, con límite de tasa y caídas 5xx intermitentes bajo carga (observado
empíricamente, y confirmado independientemente con `curl` fuera de la app: el endpoint `/anime?q=` de
búsqueda es notablemente más frágil que el resto). Mitigaciones ya implementadas — no las quites:
- `api/jikan.js` reintenta automáticamente (con backoff exponencial, 3 intentos) respuestas 429 y 5xx.
- `useFetch` cachea resultados por `cacheKey` (TTL configurable) y soporta `initialDelay` para escalonar
  ráfagas de peticiones paralelas (ver `Home.jsx`/`AnimeDetail.jsx`, que escalonan sus queries con
  `STAGGER_MS`).
- `animeService.js` deduplica por `id` cualquier lista antes de devolverla (Jikan repite `mal_id` bajo
  carga).
- `discoverAnime`/`searchAnime` **no fuerzan `order_by`/`sort` por defecto** en una búsqueda por texto —
  ordenar añade carga evitable al backend de búsqueda de MAL y no aporta nada (la relevancia, que Jikan
  ya usa por defecto, es lo que una búsqueda por nombre necesita). Solo Explorar/Temporada/Top —que no
  tienen `q`— aplican un orden por defecto. No reintroducir un `orderBy`/`sort` por defecto en `Buscar`.
- `ErrorState` siempre muestra un mensaje amable + botón "Reintentar", nunca una pantalla en blanco —
  esto aplica a cualquier fetch nuevo que se agregue (Home, catálogo, Detalle, Buscar). Los mensajes
  nunca mencionan "MyAnimeList" ni "Jikan" — son genéricos ("no pudimos cargar esta sección", etc.).
- `api/jikan.js` (Sprint 3.6) encola **todas** las peticiones salientes por una cola de concurrencia
  propia (máx. 2 en simultáneo, ≥180ms entre inicios) antes de llegar a axios. Por eso `Home.jsx` y
  `AnimeDetail.jsx` ya **no** necesitan un `STAGGER_MS`/`initialDelay` manual por página — el
  espaciado entre peticiones es responsabilidad centralizada de `api/jikan.js`, no de cada página.
- Aun con estas mitigaciones, `/anime?q=` (búsqueda) puede fallar por completo durante minutos si el
  backend de búsqueda de MAL está degradado — esto es una limitación externa real, verificada varias
  veces con `curl` fuera de la app, no un bug de AnimeCLZ. No prometer 100% de disponibilidad de la
  búsqueda en la documentación ni en la UI.

## Flujo de trabajo de código

1. Analizar antes de modificar.
2. Explicar el plan antes de tocar código.
3. Esperar aprobación para cambios grandes (refactors amplios, cambios de arquitectura, migraciones de
   paleta/estilo, renombrados masivos).
4. Nunca romper código existente.
5. Nunca eliminar archivos sin preguntar antes.
6. Siempre comprobar que el proyecto compile (`npm run build` y/o `npm run lint`) tras un cambio.

## Calidad

- Buenas prácticas y SOLID cuando sea razonable aplicarlo en un frontend React.
- Componentes pequeños y con una responsabilidad clara.
- Imports ordenados.
- Código limpio por encima de código "rápido".

## Comandos

- `npm run dev` — servidor de desarrollo Vite (puerto 5173).
- `npm run build` — build de producción.
- `npm run preview` — preview del build de producción.
- `npm run lint` — ESLint sobre todo el repo.
- No hay framework de tests configurado todavía.

## Notas técnicas actuales

- Rutas activas: `/`, `/explorar`, `/temporada`, `/top`, `/mi-lista`, `/buscar`, `/anime/:id`, `/perfil`
  (placeholder hasta el Sprint 4). `src/data/movies.js` fue eliminado — no reintroducir datos mock.
- `AnimeDetail.jsx` es la ficha completa (Sprint 3): banner, info extendida (ranking, popularidad,
  estudios, productores, licenciantes, clasificación, temas, demografía), Personajes principales,
  Trailer, Relacionados y Galería, más un carrusel de Recomendados (`MovieRow`/`AnimeCard`). Pendiente:
  Historial y Continuar Viendo (ver ROADMAP.md).
- El componente de card se llama `AnimeCard` (`components/movie/AnimeCard.jsx`), no `MovieCard` — se
  reutiliza en Home, Explorar/Temporada/Top/Buscar, Mi Lista y Recomendados de Detalle.
- Componentes de estado compartidos (`components/ui/LoadingState.jsx`, `ErrorState.jsx`,
  `EmptyState.jsx`, `components/catalog/*`) ya existen — reutilizarlos en vez de crear variantes locales
  por página.
- `components/ui/Select.jsx` (Headless UI `Listbox` + Framer Motion) es el único componente de dropdown
  del proyecto — no usar `<select>` nativo en ningún formulario nuevo, componer `Select` en su lugar.
  Dependencia: `@headlessui/react` (ya instalada).
- `AnimeCard` ya no tiene un botón "Ver detalles" visible — el hover revela solo tres íconos (Ver/Mi
  Lista/Información) sin fondo ni caja; el bloque de título es siempre un link (para que funcione sin
  hover en táctil). No reintroducir un botón de texto sobre la card.
- `eslint.config.js` existe desde el Sprint 3.6 (antes no había ninguno y `npm run lint` fallaba en
  silencio) — usa `eslint-plugin-react`/`react-hooks`/`react-refresh`. Los archivos que corren en Node
  en vez de navegador (p. ej. `vite.config.js`) tienen su propio bloque de `globals` en ese archivo.

## Objetivo final

AnimeCLZ debe sentirse como un producto comercial, listo para seguir creciendo.
