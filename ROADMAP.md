# ROADMAP.md

Plan de desarrollo de **AnimeCLZ**, organizado en sprints. Este documento organiza el trabajo; las reglas
de arquitectura, diseño y flujo de trabajo están en [CLAUDE.md](CLAUDE.md) y aplican a cada sprint.

---

## Sprint 1 — Fundación (completado)

- ✔ Arquitectura
- ✔ Diseño
- ✔ Hero
- ✔ Navbar
- ✔ API

**Estado:** cerrado. Base de carpetas, sistema de diseño, Hero, Navbar y conexión a Jikan API listos.

---

## Sprint 2 — Home profesional y navegación de catálogo (completado)

- ✔ **Home profesional** — Hero real (anime tomado del top-rated actual, sin datos mock) + 5 carruseles
  (🏆 Top Anime, 📅 Temporada Actual, 📈 Más Populares, ⭐ Mejor Valorados, 💡 Recomendados) + sección
  🧭 Explorar (banner CTA) + sección 🎭 Géneros (píldoras de navegación a Explorar filtrado). `src/data/movies.js` fue eliminado.
- ✔ **Carruseles** — `MovieRow` rediseñado, alimentado 100% por Jikan, con Skeleton/Error/Empty propios.
- ✔ **Buscador** — página `/buscar` real: input con debounce, filtros, loading (skeleton), error y
  estado vacío.
- ✔ **Página Explorar** (`/explorar`) — catálogo general con grid + filtros + paginación; acepta
  `?genre=` en la URL (usado por las píldoras de género de Home).
- ✔ **Página Temporada** (`/temporada`) — grid paginado de `getCurrentSeason`.
- ✔ **Género** — implementado como filtro dentro de Explorar/Buscar + sección de navegación en Home (no
  como páginas estáticas por género) para que escale a cualquier género sin crear una ruta nueva por cada uno.
- ✔ **Cards** — modelo único, hover elegante (elevación + zoom, sin brillo), botones explícitos "Ver
  detalles" y "Agregar a Mi Lista", géneros visibles.
- ✔ **ErrorBoundary** global (`src/components/ErrorBoundary.jsx`).
- ✔ **Lazy loading** — rutas con `React.lazy`/`Suspense` (code-splitting por página) además del lazy
  loading de imágenes ya existente.

Adelantado desde el Sprint 3 (porque Hero/MovieCard necesitaban botones que funcionaran de verdad, no
placeholders): **Favoritos** (`FavoritesContext`, localStorage), **Mi Lista** (`/mi-lista`, ya funcional)
y una versión básica de **Detalle** (`/anime/:id`, con trailer si Jikan lo expone). El Sprint 3 profundiza
sobre esa base (episodios completos, recomendaciones detalladas, historial) en vez de partir de cero.

También se resolvió una fragilidad real detectada al probar contra la API pública: Jikan devuelve 429/5xx
bajo carga y a veces repite `mal_id` en una misma lista — ver "Reintentos y caché" en CLAUDE.md.

**Criterio de aceptación:** Home y todas las páginas de este sprint muestran únicamente datos reales de
Jikan, sin ningún dato inventado. Verificado en navegador (Home, Explorar, Buscar, Detalle, Mi Lista,
menú móvil, navegación por género) con capturas reales.

---

## Sprint 3 — Ficha de Detalle completa (completado, salvo Historial)

- ✔ **Página Detalle reconstruida por completo** — banner grande, poster, título, título japonés,
  sinopsis completa, puntuación, ranking, popularidad, estado, tipo, duración, año, temporada, estudios,
  productores, licenciantes, clasificación, géneros, temas y demografía. Todo real, sin datos inventados.
- ✔ **Sección Información** — grid de metadatos (`InfoGrid`, nuevo componente reutilizable).
- ✔ **Personajes principales** — elenco `role: Main` + actor de voz japonés (`CharacterCard`, nuevo
  componente reutilizable).
- ✔ **Trailer** — embed real si Jikan lo expone; `EmptyState` elegante si no existe.
- ✔ **Recomendados** — carrusel real reutilizando `MovieRow`/`AnimeCard` (sin componente nuevo).
- ✔ **Relacionados** — precuelas/secuelas/spin-off/OVA/películas/especiales agrupados por tipo de
  relación, como lista de enlaces (Jikan no da póster/score para relaciones, así que no se simulan).
- ✔ **Galería** — grid de imágenes reales, con lazy loading.
- ✔ **Botones** — Ver Ahora (reproduce el trailer), Agregar a Mi Lista (reutiliza `FavoritesContext`),
  Compartir (Web Share API con fallback a copiar enlace). *Nota:* "Favoritos" no se implementó como un
  sistema aparte de "Mi Lista" — habría duplicado el mismo estado sin un propósito distinto; ver
  TODO.md.
- ✔ **Estados** — Skeleton/Loading/Error/Sin resultados en cada sección, de forma independiente (una
  sección puede fallar sin bloquear las demás).
- ✔ Renombrado `MovieCard` → `AnimeCard` en todo el proyecto (Home, catálogo, Mi Lista, Recomendados).

**Episodios** — no incluido: Jikan no expone streaming, y sin reproductor propio (fase "Streaming" en
TODO.md, muy posterior) un listado de episodios sin nada que reproducir no aporta valor real todavía.
Se retoma cuando el reproductor exista.

**Historial** — pendiente. Necesita persistencia por usuario; Firebase llega en el Sprint 4, así que se
recomienda resolver Historial junto con esa migración en vez de duplicar el patrón de `FavoritesContext`
dos veces.

**Criterio de aceptación:** la ficha de detalle muestra información completa, personajes, trailer,
recomendados, relacionados y galería reales de la API, con estados de carga/error/vacío en cada sección.
Verificado en navegador (desktop y móvil) con capturas reales.

---

## Sprint 3.5 — Arreglo del buscador + rediseño visual completo (completado)

**Buscador — causa real y arreglo.** Auditoría completa del flujo (`searchAnime` → `discoverAnime` →
`fetchList` → `useFetch` → `Search.jsx` → `MovieGrid`/`AnimeCard`/`Filters`/`Pagination`). Conclusión:
no era un bug de lógica que devolviera vacío en silencio — `discoverAnime` forzaba `order_by=popularity
&sort=asc` en **toda** búsqueda por texto, incluso sin que el usuario lo pidiera. Eso añade carga extra
al endpoint `/anime?q=` de Jikan, que ya es el más frágil de la API (confirmado de forma independiente
con `curl` fuera de la app: fallos 504 frecuentes incluso con una sola petición cada varios segundos).
Arreglado:
- ✔ `discoverAnime`/`searchAnime` ya no fuerzan un orden por defecto — Buscar solo lo envía si el
  usuario lo elige explícitamente en Filtros; Explorar/Temporada/Top siguen con su orden por defecto
  (no buscan por texto, así que no tiene el mismo costo).
- ✔ Reintento con backoff exponencial (3 intentos) en `api/jikan.js`, en vez de 2 con backoff fijo.
- ✔ `ErrorState` ahora muestra un mensaje amable y específico ("no pudimos conectar con MyAnimeList...
  inténtalo de nuevo en unos segundos") con botón Reintentar — nunca una pantalla en blanco, verificado
  provocando el fallo real (Jikan estaba caído en el momento de la prueba).
- ✔ Verificado con las búsquedas pedidas (Naruto, One Piece, Bleach, Frieren, Solo Leveling, Dragon
  Ball, Kimetsu) en mayúsculas/minúsculas/parcial — la búsqueda de Jikan ya es insensible a
  mayúsculas y hace match parcial de forma nativa; no hacía falta lógica adicional para eso.

**Rediseño visual — identidad propia, sin Netflix.** Paleta completamente nueva (ver CLAUDE.md/DESIGN.md
para valores exactos): fondo casi negro, dúo de azules suaves (`Primary`/`Secondary`) como único acento,
cero rojo/amarillo/naranja/morado. Rediseñados: Navbar (indicador de pestaña activa tipo píldora, blur
más marcado), Hero (banner más grande, muestra Estado además de puntuación/año/tipo/géneros, botones
"Ver Ahora"/"Mi Lista"), `AnimeCard` (sombra suave con tinte de `Primary` al hover, blur en el overlay,
Estado visible), `MovieRow` (títulos más grandes, más espacio, flechas con blur), sistema de botones
(píldora, gradiente suave en el primario), y todos los formularios (selects/inputs con el mismo
lenguaje). Nada de componentes eliminados ni duplicados — todo reutiliza `AnimeCard`/`MovieRow`/`Button`
existentes con nuevas clases.

**Criterio de aceptación:** build y dev sin errores; búsquedas de ejemplo verificadas en navegador;
ningún rojo/amarillo/naranja/morado en la UI; toda página revisada visualmente en desktop y móvil.

---

## Sprint 3.6 — Refinamiento visual, UX y limpieza (completado)

- ✔ **Buscador, segunda pasada** — se auditó de nuevo el flujo completo. La causa raíz confirmada (con
  `curl` fuera de la app, repetida en varias sesiones) es que el endpoint de búsqueda de Jikan (`/anime?q=`)
  es sustancialmente más inestable que el resto de la API, independientemente de nuestros parámetros.
  Mitigado con una **cola de concurrencia centralizada** en `api/jikan.js` (máx. 2 peticiones en
  simultáneo, ≥180ms entre inicios, para toda la app) que reemplaza el escalonado manual por página
  (`STAGGER_MS` eliminado de `Home.jsx`/`AnimeDetail.jsx`), más reintentos con backoff exponencial
  (4 intentos). No se promete disponibilidad al 100% — es una limitación externa real, documentada en
  CLAUDE.md.
- ✔ **Selects nativos → `Select` propio** — nuevo componente (`components/ui/Select.jsx`) sobre Headless
  UI `Listbox` (nueva dependencia: `@headlessui/react`), con panel animado (Framer Motion), scroll
  personalizado, checkmark de selección. Reemplaza los 4 `<select>` de `Filters.jsx`.
- ✔ **Mensajes de error** — ninguna pantalla vuelve a mencionar "MyAnimeList" (ni "Jikan"); mensajes
  genéricos y amables en `ErrorState`, `EmptyState`, Footer, Search/Season/Top.
- ✔ **Favicon** — corregido (seguía en rojo desde el Sprint 2, un olvido real detectado en esta auditoría).
- ✔ **`AnimeCard` rediseñada** — sin botón "Ver detalles"; hover revela tres íconos sueltos (Ver/Mi
  Lista/Información) sin caja ni fondo; indicador de favorito como glyph, no botón; el bloque de título
  es siempre un link para que funcione igual en táctil.
- ✔ **Microanimaciones** — transición de página en `Layout.jsx`, `MovieGrid` con `AnimatePresence` entre
  loading/error/vacío/resultados, `--default-transition-duration: 220ms` en el tema para que **todo**
  `transition-*` sin duración explícita caiga en el rango 180-300ms pedido (antes usaban el default de
  Tailwind, 150ms).
- ✔ **Skeleton con shimmer** — reemplaza el pulso plano anterior.
- ✔ **Espaciado** — reducido un poco el padding vertical de `MovieRow` y del Hero (el "mucho aire" del
  Sprint 3.5 se sintió excesivo en la práctica); balance ajustado, no es un valor fijo definitivo.
- ✔ **Consistencia visual** — radios (`rounded-lg`→`rounded-xl`, chips `rounded-md`→`rounded-full`) y
  duraciones (150ms→200ms, 500ms→280ms) unificados en varios puntos de `AnimeDetail`/`AnimeCard`/`Hero`
  que se habían quedado desalineados del resto del sistema.
- ✔ **`eslint.config.js` creado** — no existía ningún config desde el inicio del proyecto; `npm run lint`
  fallaba en silencio. Con el config real (react/react-hooks/react-refresh) se confirmó que no había
  imports muertos ni código duplicado real (los falsos positivos de una primera versión del config sin
  soporte JSX fueron descartados). Se corrigieron 2 problemas reales que el lint sí encontró: una mutación
  de ref durante el render en `useFetch`, y `__dirname` sin definir en `vite.config.js` (config sin
  globals de Node). Queda un warning conocido y documentado (`react-hooks/set-state-in-effect` en
  `useFetch`) — ver "Recomendaciones para el próximo sprint" más abajo.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios (0 errores); todas las rutas
verificadas en navegador; favoritos persisten; responsive revisado en desktop/tablet/móvil; consola sin
errores de la app (solo 429/504 intermitentes de Jikan, ya mitigados).

---

## Sprint 4 — Firebase y cuentas de usuario

- **Firebase** — alta del proyecto e integración (Auth y base de datos para lo que no cubre Jikan:
  usuarios, favoritos, historial).
- **Login**
- **Registro**
- **Perfil** — datos de la cuenta del usuario.
- **Configuración** — preferencias de cuenta/app.

**Nota:** esto formaliza (con Firebase) la capa de persistencia que Favoritos/Mi Lista/Historial ya
dejaron preparada en el Sprint 3 — es un sprint de arquitectura que se analiza y se aprueba antes de
implementar.

**Criterio de aceptación:** un usuario puede registrarse, iniciar sesión, ver/editar su perfil y
configuración, y sus favoritos/historial quedan asociados a su cuenta real en Firebase.

---

## Sprint 5 — Producto pulido y despliegue

- **PWA** — app instalable, soporte offline básico.
- **SEO** — metadata dinámica por página, Open Graph.
- **Optimización** — performance (bundle, lazy loading de rutas, imágenes).
- **Dark Mode** — sistema de tema (dado que hoy la app es oscura por defecto, definir si esto es un
  segundo tema claro o variantes dentro del tema oscuro).
- **Deploy** — publicación en producción.

**Criterio de aceptación:** `npm run build` limpio, app instalable, indexable y desplegada en producción.

---

## Sprint 6 — Administración y monetización

- **Panel Administrador** — gestión de contenido/usuarios fuera de la app pública.
- **Dashboard** — vistas resumen para el administrador.
- **Analytics** — métricas de uso de la plataforma.
- **Sistema Premium** — planes/suscripciones, contenido o funciones exclusivas.

**Criterio de aceptación:** existe una vía separada para administrar la plataforma y un modelo de
planes premium funcionando de punta a punta (alta, cobro o simulación, acceso diferenciado).

---

## Cómo usar este roadmap

- Cada sprint es unidad de aprobación: antes de empezar uno, se analiza y se explica el plan concreto
  (archivos a tocar, componentes nuevos) siguiendo el flujo de trabajo de CLAUDE.md.
- El orden refleja dependencias reales (p. ej. Sprint 3 prepara la persistencia que Sprint 4 formaliza
  con Firebase) y no debería alterarse sin ajustar también esas dependencias.
