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

## v0.8 — Renovación mayor UI/UX (completado, con exclusiones documentadas)

**Identidad visual — segunda paleta.** Fondo/superficie más profundos (azul-noche en vez de casi-negro
puro), `Card`/`Hover` separados como tokens distintos (antes uno solo cubría ambos roles), bordes ahora
blanco-translúcido (`rgba(255,255,255,.08)`) en vez de un gris sólido, `Primary Hover` reintroducido como
token explícito. `Secondary` (`#7C5CFF`) es azul-violeta — única excepción documentada a "no morado",
reservada a acentos puntuales (nunca el botón `primary`, ver CLAUDE.md/DESIGN.md).

**Hero → carrusel real.** `getFeaturedSlides` trae 6 animes reales del top actual (antes 1 solo). Nuevo
`Hero`: autoplay cada 8s (se pausa en hover, se detiene con `prefers-reduced-motion`), swipe/drag en
cualquier dispositivo, indicadores de punto, tira de miniaturas (6), fade+slide al cambiar de slide.
Botones "Ver Ahora"/"Mi Lista" (ver nota sobre "Favorito" abajo).

**Calidad de imagen.** El problema real: Jikan no da un banner panorámico, solo pósters verticales, y
mostrarlos a ancho completo los recortaba brutalmente. Arreglado con un patrón de dos capas (fondo
ambiental = mismo póster desenfocado y escalado; primer plano = póster nítido en su relación de aspecto
real, nunca estirado) en Hero y en el banner de `AnimeDetail`. `animeService.js` ahora expone
`poster`/`posterSmall` y los componentes arman un `srcset` simple (`1x`/`2x`).

**Buscador — tercera revisión + autocomplete nuevo.** La causa raíz (endpoint de búsqueda de Jikan
frágil) es la misma de Sprint 3.5/3.6 — no hay una cuarta causa nueva que corregir, y no se puede
prometer 100% de disponibilidad de un servicio externo que no controlamos. Lo que sí es nuevo: caché de
resultados de búsqueda (3 min) para no repetir la misma llamada frágil, y un buscador de resultados
instantáneos en el Navbar (`NavbarSearch.jsx`, `quickSearchAnime`) — barra que se expande, resultados en
vivo con debounce, "Ver todos los resultados" hacia `/buscar`.

**Filtros — chips + Select.** Género/Formato/Estado/Puntuación ahora son `ChipGroup` (un vistazo, un
clic); Orden/Año siguen en `Select` (demasiadas opciones para chips). Se sumaron los filtros de Estado
(`status` de Jikan) y Puntuación mínima (`min_score`) que no existían antes.

**Cards.** Se reintrodujo "Formato" (tipo) en el pie de la card junto a año/estado/géneros (se había
quitado en el Sprint 3.5). El hover de tres íconos (Ver/Mi Lista/Información) del Sprint 3.6 se mantiene
sin cambios.

**Ficha de Detalle — Episodios real.** Se reconsideró la decisión del Sprint 3 de no construir Episodios:
Jikan sí expone metadatos reales por episodio (número, título, fecha, puntuación) aunque no aloja video,
y esa información por sí sola es real y útil (MAL/AniList la muestran igual). Nueva sección entre Trailer
y Relacionados. "Temporadas" no es una sección nueva — ya está cubierta por Relacionados (secuelas) e
Información (temporada/año).

**Microanimaciones y rendimiento.** Scroll con rueda del mouse redirigido a horizontal en los carruseles
(`MovieRow`) — antes solo funcionaba con touch/arrastre. `EmptyState` ahora acepta `onRetry` (varios
endpoints de Jikan, no solo el de búsqueda, sirven una respuesta 200 vacía bajo carga en vez de un error
limpio — un botón de reintento ahí es barato y a veces evita un "no hay nada" falso). `memo` en
`CharacterCard` (ya estaba en `AnimeCard`).

**Preparación de arquitectura (sin implementar):**
- *Supabase:* `animeService.js` ya expone funciones por nombre de recurso en vez de que las páginas
  llamen a Jikan directamente — ese es el punto de corte para que, cuando exista Supabase, esas
  funciones lean de ahí primero y usen Jikan solo como importador de respaldo, sin tocar páginas/hooks.
  No se instaló ningún cliente de Supabase ni se creó configuración — no hay proyecto real todavía.
- *Panel de Administrador:* no implementado (pedido explícito). Cuando se aborde, va en rutas propias
  (`/admin/*`) protegidas por auth, separado de las páginas públicas.

**Exclusiones documentadas (no fabricadas):**
- **Continuar viendo** y **Nuevos episodios** — necesitan historial real por usuario, que no existe sin
  auth/base de datos (Sprint 4). Se muestran cuando haya datos reales, no antes.
- **Noticias** — Jikan no tiene un feed de noticias; no hay una fuente real que mostrar todavía.
- Estas tres NO aparecen en Home con contenido inventado — omitirlas es la aplicación directa de "nunca
  inventar datos" (CLAUDE.md), no un olvido.
- **"Favorito" como botón separado de "Mi Lista":** pedido dos veces (Sprint 3 y v0.8) con íconos
  distintos (♥ vs. +). Se mantiene consolidado en un solo `FavoritesContext` — un segundo sistema de
  "me gusta" sin persistencia ni propósito distinto habría sido complejidad sin beneficio real. Si el
  producto necesita de verdad dos listas distintas (p. ej. "me gusta" vs. "ver después"), es una
  decisión de datos para cuando exista Supabase/Firebase, no una maqueta visual ahora.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; todas las rutas, el buscador (con
autocomplete), los filtros, las cards y las animaciones verificados en navegador; responsive revisado en
desktop/tablet/móvil; cero rojo/amarillo/naranja en la UI.

---

## v0.9 — Módulo completo de autenticación + Supabase (completado, con exclusiones documentadas)

Cumple, con Supabase en vez de Firebase, lo que el Sprint 4 planeaba (ver nota más abajo) — Jikan sigue
siendo la única fuente de datos de anime; Supabase solo cubre lo que Jikan nunca pudo: cuentas, listas
persistentes, historial.

**Supabase.** `@supabase/supabase-js` instalado; `src/lib/supabase.js` crea el cliente desde
`VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` (`.env.example` agregado). Solo la Publishable/anon
key se usa en el frontend — nunca la Secret Key. Si las variables no están definidas, el cliente es
`null` y el resto de la app (catálogo, búsqueda, detalle) sigue funcionando igual que antes.

**Autenticación.** Login con correo/contraseña y con Google, registro (con confirmación por correo),
recuperar/restablecer contraseña, cerrar sesión — todo en `services/authService.js`, con mensajes de
error traducidos a español (mismo criterio que los errores de Jikan: nunca texto técnico crudo).
`context/AuthContext.jsx` + `hooks/useAuth.js` exponen la sesión globalmente; persistencia y refresh de
token los maneja el propio cliente de Supabase (`persistSession`/`autoRefreshToken`).

**Rutas protegidas.** `layout/ProtectedRoute.jsx` protege `/mi-lista`, `/favoritos`, `/historial` y
`/perfil` — sin sesión, redirige a `/iniciar-sesion` y vuelve a la página original tras el login.

**Navbar.** Sin sesión: "Iniciar sesión"/"Crear cuenta". Con sesión: avatar con iniciales y un menú
desplegable (Headless UI `Menu`, mismo patrón visual que `Select.jsx`) con Perfil/Mi Lista/Favoritos/
Cerrar sesión.

**Favoritos y Mi Lista, ahora sí separados.** La nota del v0.8 sobre esto ya anticipaba el criterio: "si
el producto necesita de verdad dos listas distintas... es una decisión de datos para cuando exista
Supabase". Con Supabase real, se separaron: `favorites` (♥, "me gusta") y `watch_later` ("Mi Lista",
"quiero verlo después") son tablas y contextos distintos (`FavoritesContext`/`useFavorites()` y
`WatchLaterContext`/`useWatchLater()`, compartiendo lógica vía `hooks/useUserCollection.js`). La card
compacta (`AnimeCard`) conserva sus tres íconos de hover de siempre, solo que el corazón ahora es
Favoritos; Hero y AnimeDetail muestran ambos botones (♥ Favorito / 🔖 Mi Lista) por separado. Toda acción
de guardar exige sesión — sin ella, redirige a `/iniciar-sesion` en vez de fallar en silencio.

**Perfil real.** Deja de ser un placeholder: muestra avatar (iniciales), permite editar
username/bio (`profiles`, con trigger que crea la fila automáticamente al registrarse) y cerrar sesión.

**Base de datos y RLS.** Migraciones organizadas en `supabase/migrations/000N_*.sql` (no ejecutadas contra
ningún proyecto real — ver `supabase/migrations/README.md` para aplicarlas): `profiles`, `favorites`,
`watch_later`, `watch_history`, `ratings`, `comments`, `notifications`. Todas con Row Level Security:
cada usuario solo accede a sus propias filas.

**Preparado sin interfaz (a propósito):**
- `watch_history`/"Continuar viendo" — tabla y `services/historyService.js` listos, y ya existe la
  página `/historial`, pero nada la escribe todavía: no hay reproductor real (fase "Streaming").
- `ratings` y `comments` — tablas con RLS listas; sin interfaz. Se construyen cuando se pida
  explícitamente.
- `notifications` — tabla lista, sin política de `insert` para el rol `authenticated` a propósito (se
  crearían desde el backend/service role, no desde el cliente); sin interfaz.

**No implementado (pedido explícito):**
- Panel de Administrador — su arquitectura llegó después, en v0.10 (ver abajo).
- CRUD de animes, subida de episodios — no implementado.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; registro, login (correo y Google),
recuperar/restablecer contraseña, cerrar sesión, rutas protegidas, Favoritos y Mi Lista como listas
independientes, y Perfil editable, todo verificado sin romper ninguna pantalla existente.

---

## v0.10 — Panel de Administración: arquitectura (completado, sin CRUD a propósito)

Arquitectura, navegación, layout y diseño visual del Panel de Administración — el CRUD real (crear/
editar/eliminar contenido) queda para otra pasada, pedido explícitamente así.

**Roles.** Columna `role` en `profiles` (migración 0008): `admin`/`editor`/`moderador`/`usuario`, por
defecto `usuario`. Protegida con un trigger (`protect_profile_role`) que impide que un usuario cambie su
propio rol a menos que ya sea `admin` — necesario porque `profileService.updateProfile` hace un UPDATE
normal sin filtrar columnas, y la policy de RLS ya permitía editar la propia fila.

**Rutas protegidas por rol.** `ProtectedRoute` ahora acepta un prop `roles`: con sesión pero sin el rol
requerido, redirige a Inicio (no a Login, ya que sí inició sesión). `/admin/*` completo está detrás de
`roles={STAFF_ROLES}` (admin/editor/moderador). Se corrigió una condición de carrera real durante el
desarrollo: el estado de "perfil cargando" se derivaba con un booleano aparte que podía quedar en `false`
un instante después del login (antes de que el efecto de traer el perfil arrancara), lo que habría
rebotado a un admin legítimo a Inicio en la primera carga. Se resolvió derivando ese estado por
comparación (`profileFetchedFor !== userId`) en vez de un segundo `useState`.

**Layout separado.** `layout/admin/AdminLayout.jsx` + `AdminSidebar` + `AdminHeader` — sin Navbar/Footer
públicos. Sidebar fija en desktop, drawer deslizante con overlay en mobile (mismo patrón de animación que
el menú mobile del Navbar público). El sidebar filtra sus ítems por rol: Usuarios y Configuración solo
para `admin`.

**Acceso.** Cuentas con rol de staff ven "Panel de Administración" en el menú de cuenta (`AccountMenu`,
el mismo componente que ya usaba el Navbar público) — no hay otra forma de llegar a `/admin` desde la UI
pública, a propósito.

**Componentes reutilizables (`components/admin/`):** `StatCard`, `DataTable` (tabla base con
loading/error/empty, sin lógica de datos propia), `TableToolbar` (búsqueda + slot de filtros),
`AdminPageHeader`. Pensados para que el futuro CRUD los reutilice en vez de reimplementar tablas por
sección.

**Las 10 vistas:**
- *Dashboard* — 4 métricas reales (usuarios, equipo, comentarios, calificaciones — conteos de Supabase,
  no inventados; muestran "—" si Supabase no está configurado) + tabla de usuarios recientes.
- *Animes* — catálogo de Jikan en modo lectura, mismo servicio que Explorar (búsqueda + filtro de
  formato/estado + paginación, todo real).
- *Temporadas* — anime de la temporada actual (Jikan `/seasons/now`); búsqueda y filtro de formato son
  del lado del cliente porque ese endpoint no soporta `q`.
- *Usuarios* — tabla `profiles` real (búsqueda por nombre, filtro por rol, paginación real). Sin edición
  de rol desde aquí todavía (eso es CRUD).
- *Comentarios* — tabla `comments` real (estará vacía en la práctica: nada la escribe todavía).
- *Episodios, Personajes, Estudios, Noticias* — sin fuente de datos real: Jikan solo da episodios/
  personajes por anime, no como listado global; Estudios (Jikan sí tiene `/producers`, no integrado
  todavía) y Noticias (no hay fuente) necesitan trabajo propio. Se dejaron con la tabla y columnas ya
  definidas y un `EmptyState` que explica por qué, en vez de datos de relleno.
- *Configuración* — sin controles interactivos a propósito: no hay tabla de configuración en Supabase
  todavía, y un toggle que no persiste nada sería peor que no tenerlo. Documenta los grupos previstos
  (General, Apariencia, Notificaciones, Roles y permisos).

**No implementado (pedido explícito):**
- CRUD completo de cualquier sección (crear/editar/eliminar Animes, Episodios, Personajes, Estudios,
  Noticias; editar rol o eliminar un Usuario; moderar Comentarios).
- Integración de Estudios con `/producers` de Jikan.
- Tabla de Noticias y su CRUD.
- Tabla de Configuración y su CRUD.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; las 10 vistas navegables desde el
sidebar (filtrado por rol); un usuario sin rol de staff no puede entrar a `/admin/*` (redirige a Inicio);
Animes/Temporadas/Usuarios/Comentarios muestran datos reales con búsqueda/filtro/paginación funcionando;
ninguna pantalla existente se rompió.

---

## v1.1 — Sistema de perfiles + página institucional (completado, con exclusiones documentadas)

**Perfiles múltiples estilo Netflix.** Una cuenta puede tener varios perfiles (`profiles_account`,
migración 0009) — no varias cuentas. Cada perfil: nombre, avatar (inicial+color / imagen propia /
personaje de Jikan), color y rol propio. Pantalla "¿Quién está viendo AnimeCLZ?" (`/perfiles`) tras el
login/registro; "Cambiar Perfil" queda disponible en todo momento desde el menú de cuenta. El primer
perfil de cada cuenta se autogenera al registrarse y es el único que no se puede eliminar.

**El rol que importa se movió al perfil.** Hasta v0.10, `ProtectedRoute roles={STAFF_ROLES}` leía
`profiles.role` (rol de la CUENTA). Ahora lee `profiles_account.rol` (rol del PERFIL activo) — así,
dentro de una misma cuenta administradora, un perfil "Invitado" o "Niños" no hereda acceso al Panel de
Administración solo por compartir cuenta con "Leonardo (Administrador)". Se agregó un trigger
(`sync_default_profile_rol`) para que, al elevar una cuenta a admin desde el SQL Editor (el único camino
que existe para la primera cuenta admin, ver v0.10), el perfil por defecto de esa cuenta quede
sincronizado automáticamente — sin ese trigger, el Panel de Administración nunca habría aparecido para
nadie tras ese único paso manual documentado en v0.10.

**Bug real encontrado y corregido durante el desarrollo.** El estado "perfiles cargando" se calculó al
principio con un booleano de estado aparte (mismo patrón que se usó — y ya había dado un problema real —
en `AuthContext` durante v0.10). Se corrigió antes de integrarlo, derivándolo por comparación
(`profilesFetchedFor !== accountId`) en vez de un segundo `useState`, replicando la solución que ya
existía para el mismo tipo de condición de carrera en `AuthContext`.

**Avatares.** Tres modos en `AvatarPicker.jsx`: inicial + color (por defecto), imagen propia (Supabase
Storage, bucket `avatars`, migración 0010, con política de que cada cuenta solo escribe en su propia
carpeta) y personaje de Jikan (`/characters`, búsqueda global). El grid de personajes solo muestra
imagen + nombre — ese endpoint no trae el anime en la respuesta de lista (a diferencia de
`/anime/{id}/characters`, que sí); el anime se resuelve con una sola llamada extra recién al confirmar
la elección, no para los 12 resultados del grid.

**Menú de cuenta rediseñado.** El botón ya no es un simple círculo: muestra avatar + nombre + rol del
perfil activo. El menú desplegable creció a Mi Perfil / Cambiar Perfil / Mi Lista / Favoritos /
Historial / Configuración / Panel de Administración (solo staff) / Cerrar sesión.

**Página institucional real (`/acerca`).** Diez secciones con contenido redactado específicamente para
AnimeCLZ (no texto de relleno genérico): qué es, misión, objetivos, tecnologías, arquitectura, el
desarrollador, preguntas frecuentes, contacto, privacidad y términos. El Footer, que desde el inicio del
proyecto apuntaba a rutas de relleno en inglés que nunca existieron (`/about`, `/careers`, `/terms`...),
ahora enlaza a anclas reales dentro de esta página.

**Deliberadamente NO fragmentado por perfil (pedido explícito: no romper Favoritos/Mi Lista/
Historial):** las tres siguen siendo por CUENTA, no por perfil — cada perfil de una misma cuenta ve la
misma Mi Lista/Favoritos/Historial. Fragmentarlas habría exigido una migración de esquema (agregar
`profile_id` a `favorites`/`watch_later`/`watch_history`, reescribir sus RLS, sus servicios y sus
contextos) muy por fuera de "sistema de perfiles + página institucional"; queda anotado como decisión de
alcance, no como omisión accidental.

**No implementado (pedido explícito):**
- CRUD del Panel de Administración — sin cambios respecto a v0.10.
- Configuración (`/configuracion`, la de usuario): misma arquitectura de "estructura lista, sin lógica"
  que ya se usó en `/admin/configuracion` en v0.10 — sin controles interactivos reales todavía.
- Favoritos/Mi Lista/Historial por perfil (ver el punto de arriba).

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; registro/login llevan al selector de
perfiles antes que a Inicio; crear, editar (nombre/color/avatar) y eliminar un perfil (salvo el
predeterminado) funcionan; el rol del perfil activo —no el de la cuenta— controla el acceso a
`/admin/*`; `/acerca` navegable con anclas funcionando desde el Footer; ninguna pantalla, ni la
autenticación, ni el Panel de Administración existentes se rompieron.

---

## v1.3 — Landing Page, navegación, arquitectura de proveedores y SUPER_ADMIN (completado, con exclusiones documentadas)

**Landing Page.** La antigua página institucional (`/acerca`) se convirtió en la página principal
pública (`pages/Landing.jsx`, ruta `/`) — Home (el catálogo) se movió a `/inicio`. Landing vive fuera del
`Layout` público (header propio + `layout/Footer.jsx` reutilizado), con: Hero + CTA "Explorar Anime"
(a `/iniciar-sesion` sin sesión, a `/inicio` con sesión), Qué es AnimeCLZ, Características (nueva,
6 tarjetas reales), Estadísticas del catálogo (nueva — número real de animes vía `AnimeProvider`,
número real de géneros, no inventados), Objetivos, Tecnologías, Arquitectura, Capturas del sistema
(nueva — estructura lista, sin capturas reales todavía: se agregan en `public/screenshots/`), Sobre el
desarrollador, FAQ, Contacto, Privacidad y Términos (estas últimas seis, heredadas de /acerca, se
mantuvieron para no perder contenido ni romper los anclajes del Footer). `/acerca` ahora es un simple
redirect a `/` que preserva el hash — no se borró el archivo (`pages/About.jsx`), solo se vació de
contenido real.

**Logo condicional.** El logo del Navbar (no el de la Landing, que siempre va a `/`) apunta a `/` sin
sesión y a `/inicio` con sesión. Mismo criterio aplicado a los redirects tras cerrar sesión
(`Navbar.jsx`/`AccountMenu.jsx`/`Profile.jsx` ahora navegan a la Landing, no al catálogo).

**Navbar.** Favoritos, Mi Lista e Historial se movieron del menú de cuenta a `NAV_LINKS` (el menú
horizontal principal), junto a Inicio/Explorar/Temporada. "Top" quedó fuera de esa lista a propósito —no
estaba en la lista pedida explícitamente— pero su ruta (`/top`) sigue existiendo y funcionando, solo sin
enlace en el menú principal.

**Arquitectura de proveedores.** Nueva capa `src/providers/`: `AnimeProvider.js` es el único punto de
entrada de datos de anime para toda la app — ninguna página debe importar un proveedor concreto ni
`services/animeService.js` directamente (los 10 archivos que sí lo hacían se migraron a importar de
`AnimeProvider`). `providers/jikan/JikanProvider.js` es la implementación activa (re-exporta
`animeService.js`, sin mover/reescribir esa lógica ya probada). `providers/anilist/AniListProvider.js` y
`providers/tmdb/TMDBProvider.js` son *stubs* — mismo contrato de ~20 métodos, cada uno lanza un error
claro si se invoca, en vez de fingir funcionar.

**Sinopsis en español.** Nueva tabla `anime_synopsis_es` (migración 0012, lectura pública incluso sin
sesión) + `overlaySpanishSynopsis()` en `animeService.js`, aplicado en `fetchList`/`getAnimeById`: si
existe una traducción curada para un `mal_id`, se muestra en vez de la original; si no, se muestra la de
Jikan sin traducir en tiempo real. La tabla nace vacía — se puebla desde un futuro importador (no
implementado), así que hoy esto es, en la práctica, casi siempre un no-op.

**SUPER_ADMIN + Panel de Gestión de Usuarios.** Nuevo rol por encima de `admin` (migración 0013). Único
que puede cambiar el rol de otra cuenta (`admin`/`editor`/`moderador`/`usuario` — `SUPER_ADMIN` no se
asigna desde la UI) desde `pages/admin/Users.jsx`, ahora con una columna de rol editable cuando quien
mira es `super_admin`; bloqueado explícitamente cambiar el propio rol. `leoseb.co@gmail.com` se elevó
automáticamente a `super_admin` (ya existía la cuenta; si no hubiera existido, se habría creado así
desde el registro).

**Bug real encontrado y corregido durante esta pasada:** los triggers de protección de rol
(`protect_profile_role`/`protect_profile_account_rol`, desde v0.10/v1.1) usaban `auth.uid()` para saber
"¿quién pide este cambio?" — pero `auth.uid()` es `NULL` fuera de una sesión con JWT (una migración vía
`supabase db push`, o el SQL Editor), y `not exists (... where account_id = NULL ...)` es siempre
verdadero, así que esos triggers habrían bloqueado incluso la propia elevación de
`leoseb.co@gmail.com` a `super_admin` en esta misma migración. Verificado empíricamente
(`select auth.uid()` en ese contexto) antes de escribir la migración 0013, que corrige ambos triggers
para permitir el cambio cuando `auth.uid() is null` (un operador de confianza actuando fuera del
cliente) y, de paso, agrega el bloqueo explícito de "no puedes cambiar tu propio rol" que faltaba.

**No implementado (pedido explícito o fuera de alcance):**
- Implementación real de AniList/TMDB — quedan como *stubs*, tal como se pidió ("preparar la
  arquitectura", no proveedores funcionando).
- Importador/traductor automático de sinopsis desde Jikan — la tabla y el overlay están listos, el
  pipeline que la puebla no.
- Capturas reales del sistema en la Landing — estructura lista, sin imágenes todavía.
- Edición de rol de un perfil individual (solo `profiles_account`) desde la UI — el Panel de Gestión de
  Usuarios edita el rol de la CUENTA, que se propaga al perfil predeterminado vía el trigger ya
  existente (`sync_default_profile_rol`); no se construyó una segunda UI para perfiles secundarios de una
  misma cuenta.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; `/` sirve la Landing sin sesión y
con sesión, con el CTA llevando al destino correcto en cada caso; `/inicio` sirve el catálogo igual que
antes; Favoritos/Mi Lista/Historial visibles en el menú principal; ninguna página quedó importando de
`animeService.js` directamente salvo `JikanProvider.js`; sinopsis en español no rompe ningún fetch
existente (tabla vacía, no-op observable); `leoseb.co@gmail.com` con rol `super_admin` verificado por
SQL directo; ninguna funcionalidad existente (autenticación, Panel de Administración, Favoritos/Mi
Lista/Historial) se rompió.

---

## Sprint 4 — Firebase y cuentas de usuario (superado por v0.9 — se hizo con Supabase)

- ~~**Firebase**~~ — se implementó con **Supabase** en su lugar (ver v0.9 arriba); mismo objetivo (auth +
  base de datos para lo que no cubre Jikan), proveedor distinto.
- ~~**Login**~~ ✅ v0.9
- ~~**Registro**~~ ✅ v0.9
- ~~**Perfil**~~ ✅ v0.9
- **Configuración** — preferencias de cuenta/app; no cubierto por v0.9, sigue pendiente.

**Nota:** esto formalizó la capa de persistencia que Favoritos/Mi Lista/Historial ya dejaron preparada
desde el Sprint 3, pero con Supabase (no Firebase) — ver v0.9 para el detalle completo.

**Criterio de aceptación:** cumplido por v0.9, salvo "Configuración" (pendiente).

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

- ~~**Panel Administrador**~~ — arquitectura, navegación y layout ✅ v0.10; **CRUD real pendiente**.
- ~~**Dashboard**~~ — vista resumen con métricas reales ✅ v0.10.
- **Analytics** — métricas de uso de la plataforma (distinto de las métricas de contenido del Dashboard).
- **Sistema Premium** — planes/suscripciones, contenido o funciones exclusivas.

**Criterio de aceptación:** CRUD completo de contenido/usuarios desde el panel (v0.10 dejó la
arquitectura lista, no el CRUD), Analytics y un modelo de planes premium funcionando de punta a punta
(alta, cobro o simulación, acceso diferenciado).

---

## Cómo usar este roadmap

- Cada sprint es unidad de aprobación: antes de empezar uno, se analiza y se explica el plan concreto
  (archivos a tocar, componentes nuevos) siguiendo el flujo de trabajo de CLAUDE.md.
- El orden refleja dependencias reales (p. ej. Sprint 3 prepara la persistencia que Sprint 4 formaliza
  con Firebase) y no debería alterarse sin ajustar también esas dependencias.
