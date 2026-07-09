# DESIGN.md

Identidad visual oficial de **AnimeCLZ**. Este documento es la referencia para cualquier decisión de UI;
ante una duda de estilo, este archivo decide — no el criterio personal del momento. Las reglas de marca
(paleta, prohibiciones, arquitectura) están fijadas en [CLAUDE.md](CLAUDE.md); aquí se detallan a nivel
de sistema de diseño completo.

**Revisión Sprint 3.5:** paleta rediseñada por completo (de rojo estilo Netflix a un dúo de azules
suaves, sin copiar Netflix/Crunchyroll).

**Revisión Sprint 3.6:** refinamiento visual/UX — selects nativos reemplazados por `Select` (sección 9),
card sin botón "Ver detalles" (sección 8), transición de página y duración por defecto de animaciones
(sección 10).

**Revisión v0.8:** segundo rediseño de paleta (azul más profundo, ver sección 2), Hero pasa a carrusel,
`ChipGroup` se suma a `Select` como segundo patrón de filtro (sección 9), regla de calidad de imagen
para pósters (sección 8). Todo lo demás sigue vigente salvo donde se indique lo contrario.

---

## 1. Principios de marca

- **Cine antes que catálogo.** Cada pantalla debe sentirse como una experiencia de streaming premium
  (Netflix/Crunchyroll/Apple TV como referencia), no como una tabla de datos con imágenes.
- **Oscuro por defecto.** La app vive en fondos casi negros; el contenido (pósters, texto, color primario)
  es lo que aporta brillo, no el fondo.
- **Un solo acento.** Todo lo que debe llamar la atención (CTA, estado activo, foco, rating) usa el
  mismo color primario. No se reparte la atención entre varios colores de acento.
- **Identidad propia.** Se toma prestado el lenguaje de "app de streaming" (hero, filas horizontales,
  cards de póster), pero la paleta, tipografía y detalles de marca son de AnimeCLZ, no una copia.
- **Movimiento con propósito.** La animación explica jerarquía o da feedback (qué es interactivo, qué
  acaba de aparecer); nunca es decoración porque sí.

---

## 2. Color

### Paleta oficial (v0.8)

| Token | Hex | Uso |
|---|---|---|
| Background | `#07111F` | Fondo base de toda la app |
| Surface | `#0F172A` | Navbar, footer, paneles, filas de contenido |
| Card | `#162033` | Cards en reposo |
| Hover | `#1E2D47` | Hover de cualquier superficie interactiva (distinto de `Card` en reposo) |
| Border | `rgba(255,255,255,.08)` | Divisores, contornos sutiles, anillos de tarjetas |
| Primary | `#4F8CFF` | CTA principal, estado activo, foco, badges de rating |
| Primary Hover | `#6AA5FF` | Hover de elementos de relleno sólido en `Primary` |
| Secondary | `#7C5CFF` | Acento puntual (insignias, algún gradiente) — nunca el botón primario |
| Text | `#FFFFFF` | Texto principal sobre fondos oscuros |
| Text Secondary | `#C5D0E6` | Texto de apoyo (metadatos, subtítulos, placeholders) |
| Error | `#F87171` | Únicamente para estados de error (icono/texto); nunca decorativo |

Prohibido como color de marca/decorativo: rojo, amarillo, naranja. `Secondary` es azul-violeta — la
única excepción a "no morado" — y por eso se limita a acentos puntuales, nunca al botón `primary` ni a
un fondo grande, para que no termine leyéndose como un segundo color de marca compitiendo con `Primary`.
`Error` es la otra excepción, y solo porque el rojo-de-alerta es una convención de accesibilidad casi
universal.

### Reglas de uso

- **Primary + Secondary son un dúo, no dos acentos compitiendo.** Se usan juntos en gradientes muy
  suaves (botón primario, algún acento puntual); no se usa `Secondary` solo como si fuera un segundo
  color de marca independiente.
- Jerarquía de fondos: `Background` → `Surface` → `Card`/`Hover`, de más al fondo a más elevado. No
  saltar jerarquía (no poner `Card`/`Hover` directamente sobre `Background` sin razón de elevación).
- `Text Secondary` se usa para todo lo que sea secundario por definición (fechas, duración, géneros,
  ayudas), nunca para texto que el usuario deba leer primero.
- Estados sobre `Primary`: usar el token `Primary Hover` explícito (no un `brightness`/opacidad
  improvisado) en botones y elementos de relleno sólido.
- Los overlays sobre imágenes (para legibilidad de texto) se construyen con `Background` en degradado de
  opacidad (transparente → opaco), nunca con negro puro fuera de la paleta.
- Gradientes: solo entre `Primary` y `Secondary`, y solo en acentos puntuales (una insignia, un ícono) —
  nunca en el botón `primary` (queda sólido, ver sección 7) ni como fondo de una pantalla completa.

---

## 3. Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Display | Space Grotesk | Wordmark, títulos de hero, encabezados de sección, títulos de card |
| Body | Inter | Párrafos, texto de UI, botones, navegación, badges y etiquetas cortas |

AnimeCLZ usa solo dos familias tipográficas — no hay una tercera fuente mono; las etiquetas cortas
(badges, "Destacado", metadatos) usan Body en mayúsculas/tracking amplio en vez de una fuente aparte.

### Escala tipográfica

| Nivel | Tamaño aprox. | Peso | Uso |
|---|---|---|---|
| Hero title | 36–60px | Bold (700) | Título del contenido destacado en el Hero |
| H1 / título de página | 28–32px | Bold (700) | Encabezado principal de una página |
| H2 / título de sección | 24–30px | Bold (700) | Encabezado de carrusel/sección ("Top Anime", etc.) |
| H3 / título de card | 14–16px | Semibold (600) | Título dentro de una card de póster |
| Body | 14–16px | Regular/Medium | Texto de interfaz, descripciones |
| Caption / meta | 11–12px | Medium/Semibold | Duración, año, género, badges |
| Label | 10–11px | Medium, mayúsculas, tracking amplio | Etiquetas cortas ("Destacado") — sigue siendo Inter, no una fuente aparte |

### Reglas

- Display se reserva para títulos y marca; nunca se usa para párrafos largos.
- Interlineado generoso en descripciones largas (hero, sinopsis) para legibilidad sobre fondo oscuro.
- Un máximo de tres pesos por pantalla (regular, medium/semibold, bold) para no perder jerarquía.

---

## 4. Espaciado

Sistema basado en una unidad base de 4px (escala: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px...).

- **Contenedor de página:** ancho máximo centrado, con márgenes laterales que crecen con el viewport
  (más ajustado en móvil, más aire en desktop). Todas las secciones de una página comparten el mismo
  contenedor para mantener los bordes izquierdo/derecho alineados verticalmente entre secciones.
- **Ritmo vertical entre secciones (Sprint 3.5: más aire que antes):** 40px en móvil, 56px+ en desktop
  entre carruseles/secciones — el espacio en blanco es parte de la identidad premium, no un accidente.
- **Dentro de una card:** relleno interno pequeño (12px) para no comprimir el póster.
- **Entre elementos de una fila/grupo** (badges, íconos + texto): espaciados pequeños (4–8px) para que
  se lean como una sola unidad.
- **Entre cards de un carrusel/grid:** espaciado medio-amplio (20px) — separación clara sin romper la
  sensación de fila continua.
- Regla general: cuanto más relacionados estén dos elementos, menor el espacio entre ellos; los saltos de
  espaciado marcan los saltos de jerarquía (elemento vs. grupo vs. sección).

---

## 5. Bordes y radios

- **Color de borde único:** `Border` (blanco translúcido, `rgba(255,255,255,.08)`) para cualquier
  contorno o divisor. No se usan otros grises/colores fuera de la paleta para bordes.
- **Radios por tipo de elemento (Sprint 3.5: todo más redondeado que antes):**
  - Pequeño (badges, chips, tags de género): esquinas suavizadas, apenas perceptibles.
  - Grande (cards de póster, paneles, tarjetas de estadísticas del Hero): esquinas notablemente
    redondeadas, es el radio "de producto".
  - Completo (píldora): **todos los botones** (primary/secondary/ghost, cualquier tamaño), todos los
    selects/inputs/dropdowns, avatares, botones de ícono, chips de navegación (píldoras de género,
    indicador activo del Navbar). El sistema de botones es deliberadamente "más premium, más redondeado"
    que el resto — nada de esquinas cuadradas u ortopédicas en controles interactivos.
- No mezclar radios distintos dentro del mismo tipo de componente (todas las cards de póster comparten
  el mismo radio, todos los botones son píldora, etc.).
- Los anillos finos de 1px (`Border`) se usan para dar contorno a superficies sobre fondos oscuros donde
  una sombra sola no se notaría (cards, paneles flotantes con blur).

---

## 6. Sombras

En un sistema mayormente oscuro, la sombra clásica (difuminado negro) casi no se percibe — por eso
`AnimeCLZ` combina dos recursos de elevación:

- **Anillo de contorno (`Border`)** en toda superficie flotante (cards, paneles, popovers) — el borde se
  lee incluso cuando una sombra se perdería visualmente sobre fondo oscuro.
- **Sombra elevada con tinte de `Primary` al hover** (Sprint 3.5): las cards de póster, al hacer hover,
  ganan una sombra difusa y de baja opacidad teñida sutilmente de `Primary` (no gris neutro, pero tampoco
  un resplandor saturado). Es una señal de elevación premium, no un efecto "glow" — el tinte es apenas
  perceptible, nunca satura el color del elemento.
- No se usan sombras duras/definidas (estilo "material" con bordes marcados); toda sombra en AnimeCLZ es
  difusa y discreta, y aparece solo en interacción (hover), no en reposo.
- **Excepción — paneles flotantes (Sprint 3.6):** dropdowns/menús (`Select`) sí llevan una sombra neutra
  más marcada (elevación estándar, sin tinte de color) porque flotan sobre contenido arbitrario y
  necesitan leerse como una capa distinta en cualquier fondo — no es la misma sombra "de card".

---

## 7. Botones

### Variantes

| Variante | Uso | Aspecto |
|---|---|---|
| Primary | Acción principal de la pantalla (Ver Ahora, Iniciar sesión, Guardar) | Gradiente muy suave `Primary → Secondary`, texto en `Background` (alto contraste), semibold |
| Secondary | Acción alternativa junto a una primaria (Mi Lista, Compartir) | Relleno `Surface Hover` con borde `Border`, texto `Text` |
| Ghost | Acciones de bajo énfasis, dentro de barras o listas | Sin relleno ni borde, solo texto/ícono en `Text Secondary`, fondo `Surface Hover` al hover |

### Tamaños

Tres tamaños (pequeño, medio, grande) que ajustan relleno interno y tipografía, nunca la forma ni la
lógica de color — un botón pequeño y uno grande de la misma variante deben leerse como el mismo
componente en distinta escala. Todos los tamaños son píldora (radio completo).

### Reglas

- Un botón **Primary** por bloque de acciones como máximo (no dos CTAs compitiendo por atención).
- Ícono + texto: ícono siempre a la izquierda del texto, mismo tamaño de línea que la tipografía del
  botón.
- Estado disabled: opacidad reducida y sin interacción; nunca se elimina el layout del botón.
- Foco visible obligatorio (ver sección 11) en los tres tamaños y variantes.
- Los botones de solo ícono (favoritos, play sobre card, flechas de carrusel, menú) son siempre círculo
  completo (radio completo) y llevan `aria-label` descriptivo.

---

## 8. Cards

### Card de póster (unidad base del catálogo)

Anatomía, de atrás hacia adelante:

1. **Imagen** en relación de aspecto vertical fija (proporción de póster), cubriendo toda la card.
   Regla de calidad (v0.8): **nunca estirar un póster.** Jikan no da un banner panorámico real —
   cuando hace falta una imagen ancha (Hero, banner de `AnimeDetail`) el patrón es un fondo ambiental
   con el mismo póster desenfocado y escalado detrás, y el póster nítido se muestra aparte, siempre en
   su relación de aspecto real (`aspect-[2/3]`). `poster`/`posterSmall` del modelo de datos alimentan un
   `srcset` (`1x`/`2x`) simple en vez de servir siempre la versión más pesada.
2. **Degradado de legibilidad**, siempre presente aunque discreto: de `Background` opaco abajo a
   transparente arriba, para que el texto inferior sea legible sobre cualquier imagen.
3. **Overlay de hover (Sprint 3.6 — sin botón):** revela tres íconos simples y centrados — Ver (▶),
   Mi Lista (♥), Información (ⓘ) — sin fondo, sin caja, solo el glyph con un `drop-shadow` sutil para
   legibilidad sobre cualquier imagen. Nada de botones grandes ni chrome flotante.
4. **Badge superior izquierdo:** puntuación (ícono de estrella + número), si Jikan la tiene.
5. **Indicador de favorito:** un corazón sólido en la esquina superior derecha, sin caja, visible solo
   cuando el anime ya está en Mi Lista — es un indicador, no un botón (el botón real vive en el overlay
   de hover, punto 3).
6. **Bloque de info inferior (siempre un link):** título (una sola línea, truncado si no cabe) + año y
   estado separados por un punto medio + hasta dos géneros como chips pequeños. Al ser siempre un link
   (no solo al hover), un dispositivo táctil sin hover puede tocar para ver el detalle igual.

### Reglas de card

- Micro-interacción al hover: la card se eleva levemente, la imagen hace zoom suave, y gana una sombra
  difusa con tinte de `Primary` (sección 6) — todo a la vez, nunca una sin las otras.
- Todas las cards de póster del sistema (Home, catálogo, búsqueda, recomendaciones, relacionados) son el
  mismo componente visual (`AnimeCard`) — no se crean variantes ad hoc por sección.
- Otras tarjetas del sistema (paneles de estadística, personajes, badges flotantes) siguen el mismo
  lenguaje: fondo `Surface`/`Surface Hover`, borde `Border`, radio grande, sin reinventar un estilo de
  tarjeta nuevo por pantalla.

---

## 9. Formularios

- **Ningún `<select>` nativo.** Dos patrones cubren todos los filtros, según cuántas opciones tengan:
  - **`Select`** (`components/ui/Select.jsx`, Headless UI `Listbox`) para listas largas (Orden, Año):
    disparador píldora con ícono + valor + chevron, panel flotante con blur/sombra/scroll personalizado,
    checkmark en la opción activa, apertura/cierre animado con Framer Motion.
  - **`ChipGroup`** (`components/ui/ChipGroup.jsx`, v0.8) para listas cortas donde ver todas las
    opciones de un vistazo vale más que ahorrar espacio (Género, Formato, Estado, Puntuación): fila de
    píldoras, selección única, un resaltado que se desliza entre chips (mismo patrón `layoutId` que el
    indicador activo del Navbar).
  - Un filtro nuevo usa `ChipGroup` si tiene pocas opciones fijas, y `Select` si la lista es larga o
    dinámica — no se inventa un tercer patrón de filtro.
- Los inputs de texto (buscador) comparten el mismo lenguaje: píldora, `bg-card`, borde `Border`, foco
  en `Primary`.
- Un `Select`/`ChipGroup` nuevo se construye componiendo el existente (pasar `options`/`value`/
  `onChange`), nunca copiando su JSX para un caso puntual.

---

## 10. Animaciones

Motor: Framer Motion en toda la app (no mezclar con otras librerías de animación).

### Principios

- **Rango estándar: 180–300ms** para cualquier microanimación (hover, aparición de resultados, apertura
  de un panel, transición de página). El tema define `--default-transition-duration: 220ms` para que
  cualquier `transition-*` de Tailwind sin `duration-*` explícito ya caiga en rango — no hay que anotar
  cada elemento a mano.
- Easing de salida suave (deceleración) para casi todo; resortes (spring) reservados para interacciones
  físicas (hover de card, indicador de navegación activo).

### Patrones establecidos

- **Transición de página (Sprint 3.6):** cada cambio de ruta hace un fade + desplazamiento vertical
  corto (220ms) en `Layout.jsx` vía `AnimatePresence` — nunca un corte instantáneo.
- **Aparición/desaparición de resultados (Sprint 3.6):** `MovieGrid` cruza en fade entre
  loading/error/vacío/resultados (`AnimatePresence mode="wait"`), y las cards del grid entran con
  fade + stagger corto, igual que las filas de `MovieRow`.
- **Revelado por scroll:** el contenido de filas/cards entra con un pequeño desplazamiento vertical y
  fade, en cascada (cada elemento un poco después del anterior) — refuerza que son parte de un grupo.
- **Indicador de navegación activo:** una píldora de fondo que se desliza entre los links del Navbar
  (misma pieza visual moviéndose vía `layoutId`, no una nueva apareciendo en cada link).
- **Hover de card:** elevación del conjunto + zoom de la imagen + aparición de los íconos de acción,
  simultáneos.
- **Elementos flotantes con loop suave** (por ejemplo, estadísticas del Hero): solo para detalles
  decorativos menores, con movimiento mínimo y looping lento — nunca en elementos de lectura o acción.
- **Transiciones de apertura/cierre** (menú móvil, `Select`): animan alto/opacidad/escala, nunca aparecen
  o desaparecen de golpe.

### Reglas

- Debe respetarse la preferencia de sistema "reducir movimiento": con esa preferencia activa, toda
  animación se reduce a prácticamente instantánea.
- La animación nunca retrasa una acción del usuario (un botón nunca espera a que termine su propia
  animación para disparar su función).
- No se introduce una animación nueva por pantalla sin verificar que no exista ya un patrón equivalente
  en esta sección.

---

## 11. Iconografía

- **Librería única:** Lucide (line icons, trazo consistente, sin relleno salvo excepciones puntuales
  como el ícono de play o de estrella cuando necesitan más peso visual). No se mezcla con otro set de
  íconos ni con emojis como sustituto de ícono.
- **Tamaños estándar:** pequeño para metadatos en línea junto a texto (~11–14px), medio para navegación
  y botones (~18–22px), grande solo para acciones destacadas (botón de play central sobre una card/hero).
- **Color:** hereda el color del texto que acompaña (`Text`, `Text Secondary` o `Primary` según el
  contexto), nunca un color propio fuera de la paleta.
- **Íconos sin texto** (favoritos, flechas de carrusel, menú, notificaciones): siempre dentro de un
  botón circular con `aria-label`, nunca "flotando" solos sin área de toque clara.
- **Emoji:** evitar como reemplazo de iconografía de producto; si aparece alguno hoy (p. ej. en un
  título de sección), es un placeholder temporal a reemplazar por ícono real.

---

## 12. Reglas visuales generales

- **Paleta cerrada:** ningún color fuera de la tabla de la sección 2 se introduce sin actualizar antes
  este documento y CLAUDE.md.
- **Un solo sistema de card, un solo sistema de botón:** no se crean variantes puntuales para una
  pantalla específica; se extiende el sistema existente.
- **Legibilidad ante todo:** cualquier texto sobre imagen lleva su degradado/scrim; nunca texto plano
  sobre una imagen sin garantía de contraste.
- **Contraste:** texto principal (`Text` sobre `Background`/`Surface`) y el color `Primary` deben
  mantener contraste suficiente para lectura cómoda; `Text Secondary` se reserva para contenido que
  puede permitirse menor énfasis, nunca para información crítica.
- **Foco de teclado visible siempre:** todo elemento interactivo (botón, link, card, input) muestra un
  anillo de foco claro en `Primary` al navegar con teclado — sin excepciones por estética.
- **Responsive de fondo hacia arriba:** cada componente se diseña primero para móvil y se expande a
  tablet/desktop (más columnas, más aire), no al revés.
- **Consistencia por encima de la novedad:** ante la duda entre "reutilizar un patrón existente" o
  "crear uno nuevo que se ve un poco mejor", gana la consistencia del sistema.
