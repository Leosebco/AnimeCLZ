# TODO - AnimeCLZ

## Prioridad Alta

- [x] Cambiar completamente la identidad visual de StreamFlix a AnimeCLZ.
- [x] Crear el nuevo Hero conectado a datos reales.
- [x] Cambiar favicon. (color corregido en Sprint 3.6 — seguía en rojo desde el Sprint 2)
- [ ] Crear logo oficial AnimeCLZ. (favicon es una marca mínima en SVG; falta un logo completo)
- [x] Eliminar todos los datos mock.
- [x] Unificar el modelo de datos de Anime.
- [x] Mejorar Home.

---

## Sprint 2

- [x] Buscador.
- [x] Explorar.
- [x] Temporada Actual.
- [x] Géneros.
- [x] Skeleton Loading.
- [x] Estados Vacíos.
- [x] Manejo de errores.
- [x] Responsive.

---

## Sprint 3

- [x] Página Detalle Anime. (reconstruida por completo: banner, título japonés, ranking, popularidad, estado, temporada, clasificación, géneros/temas/demografía)
- [x] Trailer. (embed real o estado "sin trailer disponible")
- [x] Episodios. (listado con número/título/fecha/score, agregado en v0.8; Jikan sigue sin dar streaming — reproductor real se retoma en la fase "Streaming")
- [x] Recomendados. (carrusel por anime, reutilizando MovieRow/AnimeCard)
- [x] Relacionados. (precuelas/secuelas/spin-off/OVA/películas/especiales, agrupados)
- [x] Personajes. (principales + actor de voz japonés)
- [x] Estudios. (dentro de la sección Información, junto a productores y licenciantes)

---

## Sprint 3.5

- [x] Arreglar el buscador. (causa real: `order_by`/`sort` forzado en toda búsqueda por texto — quitado; retry con backoff exponencial; mensaje de error amable)
- [x] Rediseño completo — nueva paleta sin rojo (azul suave), Navbar/Hero/Cards/Carruseles/Botones/Formularios.

---

## Sprint 3.6

- [x] Arreglar el buscador (segunda pasada). Causa real: endpoint de búsqueda de Jikan es más frágil que el resto de la API (confirmado con `curl` fuera de la app, varias veces). Mitigado con cola de concurrencia global + más reintentos; no es 100% eliminable (limitación externa).
- [x] Reemplazar todos los `<select>` nativos por un componente `Select` propio (Headless UI Listbox).
- [x] Quitar "MyAnimeList" de todo texto visible al usuario.
- [x] Favicon/logo sin rojo.
- [x] Quitar el botón "Ver detalles" de la card; hover con solo íconos, sin cajas.
- [x] Microanimaciones (transición de página, aparición/desaparición de resultados, duración 180-300ms en todo el sitio).
- [x] Skeleton con shimmer.
- [x] Ajuste de espaciado (menos vacío que el Sprint 3.5).
- [x] Revisión general de consistencia (radios, duraciones).
- [x] `eslint.config.js` (no existía desde el inicio del proyecto) + limpieza de lo que encontró.

---

## v0.8 — Renovación mayor UI/UX

- [x] Nueva paleta (navy profundo `#07111F`/`#0F172A`, Secondary violeta `#7C5CFF` como excepción documentada solo para acentos).
- [x] Hero rediseñado como carrusel real (autoplay, pausa en hover, swipe/drag, dots, thumbnails, `prefers-reduced-motion`).
- [x] Corrección de calidad de imagen (nunca estirar pósters; fondo ambiental blureado + póster nítido en su relación de aspecto real; `srcSet`).
- [x] Reordenamiento de Home (Top Anime → Temporada Actual → Recomendados → Más Populares → Mejor Valorados).
- [x] Carruseles estilo Netflix (scroll con rueda del mouse redirigido a horizontal).
- [x] Cards: se reincorporó el Formato (tipo) visible.
- [x] Buscador: autocomplete en Navbar (`NavbarSearch`) + caché de resultados (3 min) + barra animada en `/buscar`.
- [x] Explorar: filtros como chips modernos (`ChipGroup`) para Género/Formato/Estado/Puntuación; `Select` para Orden/Año.
- [x] AnimeDetail: sección Episodios agregada (ver nota arriba).
- [x] Navbar con glassmorphism (blur + cambio de fondo al hacer scroll) e indicador de link activo animado.
- [x] Favicon actualizado a la nueva paleta.
- [x] `EmptyState` con `onRetry` opcional (Jikan puede responder 200 con datos vacíos bajo carga; no solo errores).
- [x] `CharacterCard` memoizado; code-splitting por ruta ya existente revisado.
- [x] Nota de arquitectura para futura migración a Supabase (solo documentación, sin cliente instalado).
- [x] Nota de arquitectura para futuro Panel de Administrador (solo documentación, sin rutas creadas).
- [ ] "Continuar viendo", "Nuevos episodios", "Noticias" en Home — NO implementados (requieren datos reales que hoy no existen: historial de usuario, feed de episodios, feed de noticias). Ver ROADMAP.md.
- [ ] Corrección definitiva del warning `react-hooks/set-state-in-effect` en `useFetch.js` (downgradeado a `warn` con justificación documentada, no arreglado de raíz).
- [ ] Prefetch de rutas/datos.
- [ ] Auditoría de accesibilidad dedicada para los componentes nuevos de v0.8.

---

## v0.9 — Módulo completo de autenticación + Supabase

- [x] `@supabase/supabase-js` instalado; `src/lib/supabase.js` + `.env.example`.
- [x] Login con correo/contraseña y con Google.
- [x] Registro (con confirmación por correo).
- [x] Recuperar y restablecer contraseña.
- [x] Cerrar sesión, persistencia y refresh de sesión automáticos.
- [x] `AuthContext`/`useAuth` global.
- [x] Navbar: Iniciar sesión/Crear cuenta sin sesión; avatar + menú (Perfil/Mi Lista/Favoritos/Cerrar sesión) con sesión.
- [x] Rutas protegidas: `/mi-lista`, `/favoritos`, `/historial`, `/perfil` (`ProtectedRoute`).
- [x] Perfil real editable (username/bio), ya no placeholder.
- [x] Favoritos y Mi Lista separados en dos listas/tablas reales (`favorites`/`watch_later`), ambas persistidas en Supabase y gated por sesión.
- [x] Migraciones SQL con RLS: `profiles`, `favorites`, `watch_later`, `watch_history`, `ratings`, `comments`, `notifications` (no ejecutadas contra ningún proyecto real).
- [x] `services/historyService.js` + página `/historial` preparados (sin escritor real — no hay reproductor todavía).
- [ ] Interfaz de Calificaciones (`ratings`) — tabla lista, sin UI (a propósito).
- [ ] Interfaz de Comentarios (`comments`) — tabla lista, sin UI (a propósito).
- [ ] Interfaz de Notificaciones (`notifications`) — tabla lista, sin UI (a propósito).
- [ ] Configuración de cuenta/app (más allá de username/bio) — no cubierto.

---

## v0.10 — Panel de Administración (arquitectura, sin CRUD)

- [x] Sistema de roles: columna `role` en `profiles` (`admin`/`editor`/`moderador`/`usuario`) + trigger que impide autoasignarse un rol superior.
- [x] `ProtectedRoute` con prop `roles` — `/admin/*` requiere `STAFF_ROLES` (admin/editor/moderador); sin ese rol, redirige a Inicio.
- [x] Layout separado (`layout/admin/AdminLayout.jsx` + `AdminSidebar` + `AdminHeader`), sin Navbar/Footer públicos.
- [x] Sidebar responsive: fija en desktop, drawer con overlay en mobile.
- [x] Sidebar filtrada por rol (Usuarios/Configuración solo para `admin`).
- [x] Acceso desde `AccountMenu` ("Panel de Administración", solo visible para staff).
- [x] Componentes reutilizables: `StatCard`, `DataTable`, `TableToolbar`, `AdminPageHeader`.
- [x] Dashboard con métricas reales (usuarios/equipo/comentarios/calificaciones — conteos de Supabase, no inventados).
- [x] 10 vistas creadas: Dashboard, Animes, Temporadas, Episodios, Personajes, Estudios, Noticias, Usuarios, Comentarios, Configuración.
- [x] Animes/Temporadas/Usuarios/Comentarios con datos reales, búsqueda, filtros y paginación funcionando.
- [x] Episodios/Personajes/Estudios/Noticias: tabla armada + `EmptyState` explicando por qué no hay datos todavía (sin fabricar contenido).
- [x] Corregida una condición de carrera real en `AuthContext` (profileLoading) descubierta al implementar el gate por rol — ver ROADMAP.md.
- [ ] CRUD completo (crear/editar/eliminar) de cualquier sección — a propósito, pedido explícitamente para otra pasada.
- [ ] Integración de Estudios con `/producers` de Jikan.
- [ ] Tabla y CRUD de Noticias.
- [ ] Tabla y CRUD de Configuración.
- [ ] Edición de rol de usuario desde el panel (hoy solo lectura en Usuarios).

---

## v1.1 — Sistema de perfiles + página institucional

- [x] Tabla `profiles_account` (migración 0009): perfiles múltiples por cuenta, no cuentas múltiples.
- [x] Selector de perfiles estilo Netflix (`/perfiles`) tras login/registro.
- [x] Crear/editar/eliminar perfil (nombre, color, avatar) — `ProfileFormModal`.
- [x] "Cambiar Perfil" disponible en todo momento desde el menú de cuenta.
- [x] Primer perfil autogenerado al registrarse; no se puede eliminar.
- [x] Avatar en 3 modos: inicial+color, imagen propia (Supabase Storage, migración 0010), personaje de Jikan (`/characters`).
- [x] El rol que controla `/admin/*` pasó de la cuenta (`profiles.role`) al perfil activo (`profiles_account.rol`) — `ProtectedRoute` actualizado.
- [x] Trigger `sync_default_profile_rol`: al elevar una cuenta a admin, el perfil por defecto queda sincronizado automáticamente.
- [x] Trigger `protect_profile_account_rol`: mismo tipo de protección que ya tenía `profiles.role` en v0.10, ahora también en `profiles_account.rol`.
- [x] Corregida una condición de carrera real en `ProfileContext` (mismo tipo de bug que ya se había corregido en `AuthContext` durante v0.10) antes de integrarla.
- [x] `AccountMenu` rediseñado: avatar + nombre + rol del perfil activo en el propio botón (antes solo un círculo); menú con Mi Perfil/Cambiar Perfil/Mi Lista/Favoritos/Historial/Configuración/Panel de Administración (staff)/Cerrar sesión.
- [x] Página `/acerca` con 10 secciones reales (qué es, misión, objetivos, tecnologías, arquitectura, desarrollador, FAQ, contacto, privacidad, términos).
- [x] Footer actualizado: ya no enlaza a rutas de relleno en inglés que nunca existieron — ahora apunta a anclas reales de `/acerca`.
- [x] Página `/configuracion` (usuario) — misma arquitectura "estructura lista, sin lógica" que `/admin/configuracion`.
- [ ] Favoritos/Mi Lista/Historial por perfil (hoy siguen por cuenta — decisión de alcance documentada, no pedida en esta pasada).
- [x] Edición de rol desde una UI real. (v1.3 — Panel de Gestión de Usuarios, solo para `super_admin`)
- [ ] Lógica real de Configuración (tema/idioma/notificaciones/privacidad) — sigue sin implementarse, solo estructura.
- [ ] Integración de Estudios con `/producers` de Jikan (seguía pendiente desde v0.10, no se tocó en esta pasada).

---

## v1.3 — Landing Page, navegación y sistema de permisos

- [x] Landing Page real (`pages/Landing.jsx`, ruta `/`) — reemplaza a la antigua `/acerca`.
- [x] Home (catálogo) movido a `/inicio`; `/` ahora es la Landing.
- [x] `/acerca` convertida en redirect a `/` (preserva el hash) — archivo conservado, no borrado.
- [x] Hero + CTA "Explorar Anime" (condicional: login sin sesión, `/inicio` con sesión).
- [x] Secciones nuevas: Características, Estadísticas del catálogo (datos reales), Capturas del sistema (estructura, sin imágenes reales todavía).
- [x] Logo del Navbar condicional (`/` sin sesión, `/inicio` con sesión); redirects post-logout a la Landing.
- [x] Navbar: Favoritos, Mi Lista e Historial movidos al menú principal (antes solo en el menú de cuenta).
- [x] "Top" fuera de `NAV_LINKS` a propósito — su ruta sigue funcionando, solo sin enlace en el menú.
- [x] Arquitectura de proveedores: `providers/AnimeProvider.js` (único punto de entrada), `providers/jikan/JikanProvider.js` (activo), `providers/anilist/AniListProvider.js` y `providers/tmdb/TMDBProvider.js` (stubs).
- [x] 10 archivos migrados para importar de `AnimeProvider` en vez de `services/animeService.js` directamente.
- [x] Arquitectura de sinopsis en español: tabla `anime_synopsis_es` (migración 0012) + overlay en `animeService.js` — no traduce en tiempo real.
- [x] Rol `SUPER_ADMIN` (migración 0013) + `leoseb.co@gmail.com` elevado automáticamente.
- [x] Panel de Gestión de Usuarios: cambiar el rol de cualquier cuenta (solo `super_admin`), bloqueado cambiar el propio rol.
- [x] Bug real corregido: los triggers de protección de rol usaban `auth.uid()`, que es `NULL` fuera de una sesión con JWT — habría bloqueado incluso la propia migración de elevación a `super_admin`. Corregido antes de aplicar.
- [ ] Implementación real de AniList/TMDB — quedan como stubs, a propósito.
- [ ] Importador/traductor automático de sinopsis desde Jikan — tabla y overlay listos, pipeline no.
- [ ] Capturas reales del sistema en la Landing.
- [ ] Edición de rol de un perfil individual (solo cuenta) — se edita el rol de cuenta, que se propaga.

---

## v1.0 — Experiencia completa: Landing, perfiles, temas, animaciones y primer CRUD real

- [x] Landing rediseñada: menos texto, más contenido visual/animado (`Reveal`, blobs animados en Hero, secciones condensadas).
- [x] Bug real corregido: el selector de perfiles ya no reaparece en cada refresh (condición de carrera en `ProfileContext` + restauración desde `localStorage` unificadas).
- [x] Umbral de inactividad real (30 min) con heartbeat — el selector solo vuelve a aparecer tras inactividad prolongada, login, cambio de cuenta o cierre de sesión.
- [x] `clearActiveProfile()` conectado a los tres puntos reales de cierre de sesión (antes existía en el contexto pero nunca se invocaba).
- [x] Selector de perfiles rediseñado: fondo animado, efecto vidrio, entrada escalonada, transición real al seleccionar.
- [x] Sistema de temas: 7 paletas (`profiles_account.tema`, migración 0014) vía `data-theme` + `ThemeContext`/`useTheme()`; picker real en Configuración, persistido en Supabase.
- [x] Primer CRUD real del Panel: Noticias (tabla `news`, migración 0015; `newsService.js`; `NewsFormModal`; `ConfirmDialog` nuevo y reutilizable; crear/editar/eliminar/buscar/paginar).
- [x] Usuarios: activar/desactivar cuenta (`profiles.activo`, migración 0016; solo `super_admin`; no aplicable a la propia cuenta).
- [x] Comentarios: eliminar (moderación real, ya no solo lectura).
- [x] Bug real corregido: la policy de `UPDATE` de `profiles` y la de `DELETE` de `comments` solo permitían filas propias — RLS bloqueaba en silencio (0 filas afectadas, sin error) cualquier acción de staff sobre cuentas/comentarios ajenos, incluyendo `updateUserRole` que ya estaba en producción desde v1.3. Corregido con migraciones 0017/0018, verificado en vivo.
- [ ] CRUD de Animes/Temporadas/Episodios/Personajes/Estudios — fuera de alcance a propósito (Jikan es de solo lectura, no hay espejo local de esos datos).
- [ ] CRUD de Configuración del panel (`/admin/configuracion`) — sigue sin tabla ni lógica.
- [ ] Integración de Estudios con `/producers` de Jikan — seguía pendiente desde v0.10, no se tocó en esta pasada.
- [x] Favoritos/Mi Lista/Historial por perfil — decisión de alcance de v1.1 revertida en v1.5 (ver esa sección).

---

## v1.4 — Sprint móvil: responsive, gestos táctiles y PWA

- [x] Bug real corregido: `AnimeCard` no abría el detalle de forma confiable en iPhone (destino de navegación gateado por `:hover`, que en iOS Safari requiere un primer tap solo para "revelar"). Ahora es un único `Link` de cobertura total, siempre activo.
- [x] Bug real corregido: `NavbarSearch` desbordaba horizontalmente en 320-375px (ancho fijo de 300px + dropdown de 320px). Overlay de búsqueda a pantalla completa por debajo de `md`.
- [x] Bug real corregido: auto-zoom de Safari iOS al enfocar inputs (`FormField` heredaba `text-sm`, por debajo del umbral de 16px) — corregido para los 6 formularios que comparten el componente.
- [x] Bug real corregido: inconsistencia de breakpoint entre `Navbar` (`md`) y `AccountMenu` (`sm`) — unificado a `md`.
- [x] Hero: poster visible en mobile (antes `hidden` por completo), título/sinopsis con `line-clamp`, botones apilados a ancho completo.
- [x] Panel de Administrador: `DataTable` se convierte en tarjetas por debajo de 768px (sin scroll horizontal); ninguna página necesitó cambios.
- [x] `Modal` se comporta como bottom sheet en mobile (editor de avatar, Noticias, Perfil, confirmaciones) — respeta el safe-area del home indicator de iOS.
- [x] Touch targets ≥44×44px: Navbar, AccountMenu, Footer, Admin (sidebar/header/acciones de fila), Modal, AvatarPicker, Pagination, chips de relacionados en AnimeDetail, tamaño `md` de `Button`.
- [x] Safe-area completo: `viewport-fit=cover`, utilidades `.safe-top`/`.safe-bottom`, compatibilidad con notch/Dynamic Island.
- [x] Red de seguridad `overflow-x: hidden` en `html, body` contra scroll horizontal accidental.
- [x] PWA completa: `vite-plugin-pwa`, manifest, `favicon.ico`/apple-touch-icon/íconos PWA/maskable generados desde el favicon real (`@vite-pwa/assets-generator`), meta tags de Apple, service worker con precache, instalable en Android e iPhone.
- [ ] Rediseño del logo para el "safe zone" de íconos maskable — el actual puede recortarse un poco en launchers con máscara circular; no bloqueante.
- [ ] Auditoría de contraste de color dedicada — no se rehizo desde cero en esta pasada.

---

## v1.5 — Sistema de perfiles definitivo

- [x] Máximo 4 perfiles por cuenta (`MAX_PROFILES`) — validado en frontend y con trigger real en Supabase (`enforce_max_profiles`, migración 0019).
- [x] Protección real de borrado: no se puede eliminar el único perfil restante ni el que tiene rol elevado (`protect_profile_account_deletion`, migración 0019) — antes solo la UI lo evitaba.
- [x] Confirmación real antes de eliminar un perfil (`ConfirmDialog`) — antes `Profile.jsx` borraba al primer click, sin ningún aviso.
- [x] Editar/Eliminar disponibles desde cualquier tarjeta del selector (`ProfileSelect.jsx`), no solo desde "Mi Perfil" para el activo — siempre visibles, no gateados por hover (lección del sprint móvil).
- [x] "Fondo" del perfil — nuevo campo (migración 0020), acento decorativo (no reemplaza el sistema de Temas), gradientes CSS con nombres inspirados en anime.
- [x] Tema y Fondo editables desde el propio modal de crear/editar perfil (`ThemePickerGrid.jsx`/`BackgroundPickerGrid.jsx`, nuevos) — antes Tema solo se cambiaba desde Configuración para el perfil activo.
- [x] Bug real corregido: `sync_default_profile_rol` no filtraba perfiles desactivados al buscar "el perfil más antiguo" — corregido defensivamente.
- [x] Cambio de arquitectura confirmado con el usuario: Favoritos/Mi Lista/Historial pasan de ser por cuenta a ser por perfil (migración 0021, `profile_id` en las 3 tablas) — revierte la decisión de v1.1. Se borran de verdad al eliminar el perfil dueño (`cleanup_profile_data`, misma migración).
- [x] Políticas de INSERT/UPDATE de `favorites`/`watch_later`/`watch_history` reforzadas para verificar que el `profile_id` enviado pertenece de verdad a la cuenta autenticada (antes solo se validaba `user_id`).
- [x] `ConfirmDialog.jsx` reubicado de `components/admin/` a `components/ui/` (agnóstico de dominio, ya lo necesitan páginas públicas).
- [ ] Eliminar un perfil no borra nada de `comments` — fuera de alcance a propósito (sin autoría por perfil, sin interfaz pública para crear comentarios todavía).
- [ ] Transferir el rol administrativo a otro perfil antes de eliminar el que lo tiene — no existe ese flujo, el trigger solo bloquea el borrado.

---

## Sprint 4 (superado por v0.9 — hecho con Supabase, no Firebase)

- [x] ~~Firebase~~ → Supabase. Ver v0.9.
- [x] Login. Ver v0.9.
- [x] Registro. Ver v0.9.
- [x] Perfil. Ver v0.9.
- [ ] Configuración. (no cubierto por v0.9)

---

## Sprint 5

- [x] Favoritos. (v0.9 — ahora tabla propia en Supabase, `favorites`, distinta de Mi Lista)
- [x] Mi Lista. (v0.9 — ahora tabla propia en Supabase, `watch_later`, distinta de Favoritos)
- [x] Historial. (v0.9 — página y tabla `watch_history` listas; vacía hasta que exista un reproductor)
- [ ] Continuar Viendo. (depende del reproductor real — fase "Streaming")

---

## Sprint 6

- [x] Panel Administrador. (arquitectura v0.10 — ver arriba; CRUD pendiente)
- [ ] CRUD Anime.
- [ ] CRUD Episodios.
- [x] Dashboard. (v0.10 — métricas reales)
- [ ] Comentarios. (moderación real — hoy solo lectura en el panel)
- [ ] Reportes.

---

## AnimeCLZ Studio

- [ ] Crear Anime Original.
- [ ] Subir portada.
- [ ] Subir banner.
- [ ] Subir episodios.
- [ ] Editor de sinopsis.
- [ ] Editor de géneros.
- [ ] Publicar.
- [ ] Borrador.

---

## Streaming

- [ ] Reproductor.
- [ ] Pantalla completa.
- [ ] Subtítulos.
- [ ] Calidad.
- [ ] Autoplay.
- [ ] Siguiente episodio.
