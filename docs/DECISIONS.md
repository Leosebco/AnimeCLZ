# Decisiones Arquitectónicas (ADR)

Registro de decisiones arquitectónicas ya adoptadas por AnimeCLZ. Cada entrada documenta una decisión que
**ya existe** en la documentación técnica (`docs/00`–`15`) — este archivo no introduce reglas nuevas, solo
explica el porqué de las que ya están en vigor.

Formato: `Título` · `Contexto` · `Decisión` · `Consecuencias` · `Estado`.

---

## ADR-001 — ProviderManager como única capa de acceso a datos externos

**Contexto**

La interfaz de AnimeCLZ nunca debe saber de dónde vienen los datos de anime. Sin un punto único de
entrada, cada componente terminaría decidiendo por su cuenta si usar Jikan, AniList u otra fuente —
acoplando la UI a APIs externas concretas. Ver [01 Architecture](01_ARCHITECTURE.md),
[06 Provider Manager](06_PROVIDER_MANAGER.md).

**Decisión**

Toda comunicación con APIs externas de anime pasa exclusivamente por `ProviderManager`. Ningún
componente, página, hook o contexto puede hacer `fetch()` ni consumir un Provider directamente.

**Consecuencias**

- La UI queda completamente desacoplada de qué proveedor entrega los datos.
- Agregar, quitar o reemplazar un proveedor nunca requiere tocar un componente visual.
- Todo Provider debe implementar exactamente la misma interfaz (`search`, `getAnime`, `getEpisodes`,
  `getCharacters`, `getRecommendations`, `getRelations`, `getGallery`, `getTrailer`, `getStudios`).

**Estado:** Adoptada.

---

## ADR-002 — Arquitectura multi-proveedor con orden de prioridad y fusión de datos

**Contexto**

Depender de una sola API externa (p. ej. solo Jikan) expone al proyecto a rate limits, caídas y datos
incompletos de esa única fuente. Ver [06 Provider Manager](06_PROVIDER_MANAGER.md),
[15 API Guidelines](15_API_GUIDELINES.md).

**Decisión**

Consultar múltiples proveedores (Base Local, AniList, Jikan, Kitsu, AnimeThemes, TMDB, en ese orden
oficial) y fusionar (merge) sus resultados sin perder información, en vez de depender de una única
fuente. Un dato ya existente nunca se reemplaza salvo que el nuevo sea objetivamente mejor (p. ej. una
imagen de mayor resolución).

**Consecuencias**

- Mayor resiliencia: si una API cae o cambia, la aplicación sigue funcionando con las demás.
- Complejidad adicional de merge y deduplicación (por MAL ID, AniList ID, título, slug, sinónimos).
- La Base Local siempre tiene prioridad porque pertenece a AnimeCLZ — las APIs externas solo
  complementan, nunca sobrescriben datos propios.

**Estado:** Adoptada.

---

## ADR-003 — Sistema de perfiles múltiples por cuenta

**Contexto**

Una cuenta de AnimeCLZ puede ser compartida entre varias personas (estilo Netflix). Sin una separación
clara entre "cuenta" y "perfil", los favoritos, el historial y las preferencias de distintas personas se
mezclarían. Ver [05 Profile System](05_PROFILE_SYSTEM.md), [04 Authentication](04_AUTHENTICATION.md).

**Decisión**

Separar "cuenta" (identidad de login, gestionada por Supabase Auth vía `AuthContext`) de "perfil"
(identidad de uso dentro de esa cuenta, gestionada por `ProfileContext`) — máximo 4 perfiles por cuenta.
Favoritos, historial, Mi Lista, tema, avatar y fondo pertenecen al perfil, nunca a la cuenta.

**Consecuencias**

- Cada perfil necesita su propio scope de datos y su propia UI de selección.
- El límite de 4 perfiles y las protecciones (no eliminar el último perfil, no eliminar el perfil con rol
  elevado) deben existir en frontend, backend y base de datos — nunca depender solo del frontend.
- El selector de perfiles solo debe reaparecer en login, cambio de perfil o inactividad prolongada —
  nunca en un simple refresh.

**Estado:** Adoptada.

---

## ADR-004 — Supabase como backend único

**Contexto**

AnimeCLZ necesita autenticación, base de datos y almacenamiento de archivos sin construir infraestructura
propia. Ver [03 Database](03_DATABASE.md), [04 Authentication](04_AUTHENTICATION.md).

**Decisión**

Usar Supabase (Auth + PostgreSQL + Storage + Realtime) como la única plataforma de backend. No se permite
implementar autenticación propia, tablas de usuarios paralelas, ni guardar contraseñas manualmente.

**Consecuencias**

- Supabase administra sesión, refresh token y persistencia — nunca se reimplementan a mano.
- Toda tabla nueva vive en PostgreSQL vía Supabase, con migraciones versionadas.
- La Service Role Key nunca se expone en el frontend — solo la clave pública/anon, protegida por RLS
  (ver ADR-005).

**Estado:** Adoptada.

---

## ADR-005 — Row Level Security obligatorio en toda tabla

**Contexto**

El frontend, por sí solo, nunca es una barrera de seguridad confiable — cualquier validación que exista
únicamente en React puede evadirse. Ver [03 Database](03_DATABASE.md), [12 Security](12_SECURITY.md).

**Decisión**

Toda tabla de Supabase debe tener Row Level Security activado desde su creación, sin excepciones. La
seguridad real vive en PostgreSQL, no en el cliente. Nunca se deshabilita RLS.

**Consecuencias**

- Cualquier tabla nueva requiere sus propias políticas de RLS como parte de la migración que la crea, no
  como un paso posterior u opcional.
- El frontend solo mejora la experiencia (ocultar botones, redirigir); la autorización real siempre se
  valida también en el backend.
- Simplifica el modelo de amenazas: un bug de UI no puede convertirse en una fuga de datos de otra
  cuenta/perfil.

**Estado:** Adoptada.

---

## Cómo agregar un ADR nuevo

Solo se agregan decisiones que **ya existen** en la documentación técnica (`docs/00`–`15`) — este
registro no es el lugar para proponer arquitectura nueva. Si quieres proponer una decisión nueva,
documéntala primero en el documento técnico correspondiente y, una vez adoptada, regístrala aquí con el
siguiente número consecutivo (`ADR-006`, ...).
