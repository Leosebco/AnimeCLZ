# AnimeCLZ — Documentación Oficial

Esta carpeta es la **puerta de entrada única** a toda la documentación de AnimeCLZ. Todo lo que necesitas
saber para entender, mantener o extender el proyecto vive aquí — no en la memoria de nadie, no en un
chat, no en un README disperso.

> Esta documentación se generó reorganizando `Bible.md` (la fuente original) en un documento por tema.
> El contenido técnico de cada documento **no fue reescrito** — solo se separó, indexó y conectó. Ver
> [CHANGELOG.md](CHANGELOG.md) para el historial de esta documentación.

---

## Qué es AnimeCLZ

AnimeCLZ es una plataforma privada para visualizar información de anime y reproducir episodios, creada
principalmente para uso de su autor y, progresivamente, para amigos, familiares e invitados autorizados.
**Nunca** está pensada como una plataforma pública abierta — aunque su arquitectura debe ser capaz de
escalar a eso si algún día se decide.

AnimeCLZ **no** es un clon de Netflix, Crunchyroll ni AniList. La idea es combinar lo mejor de esas
plataformas en un producto propio, moderno, rápido y completamente administrable — nunca una copia.

Ver el detalle completo en [00 · Project Vision](00_PROJECT_VISION.md).

## Objetivos

En orden de prioridad, según la filosofía del proyecto:

1. Experiencia de usuario.
2. Arquitectura limpia.
3. Rendimiento.
4. Escalabilidad.
5. Código reutilizable.

La regla más importante del proyecto: **la calidad del código es más importante que la velocidad de
desarrollo.** Nunca se rompe arquitectura por implementar algo rápido. Ver
[00 · Project Vision](00_PROJECT_VISION.md) para el resto de objetivos, público objetivo y estado actual.

## Arquitectura general

AnimeCLZ usa una arquitectura por capas (estilo Clean Architecture adaptado a React), donde la interfaz
**nunca** conoce directamente de dónde vienen los datos:

```
Usuario → Componentes (UI) → Hooks/Context → Services → ProviderManager → Providers (AniList, Jikan, ...) → Datos unificados
```

El `ProviderManager` es el corazón de esta arquitectura: el único responsable de decidir qué proveedor de
datos usar, en qué orden, cómo fusionar resultados y qué hacer si uno falla. Ningún componente, página,
hook o contexto puede llamar a una API externa directamente. El detalle completo vive en
[01 · Architecture](01_ARCHITECTURE.md) y [06 · Provider Manager](06_PROVIDER_MANAGER.md).

## Cómo está organizada la documentación

```
docs/
├── README.md          ← este archivo, la puerta de entrada
├── INDEX.md            ← tabla completa de todos los documentos
├── CLAUDE.md            ← orden de lectura obligatorio para Claude antes de trabajar
├── CONTRIBUTING.md      ← guía para colaboradores humanos y para Claude
├── CHANGELOG.md         ← historial de versiones de esta documentación
├── DECISIONS.md         ← registro de decisiones arquitectónicas (ADR)
├── 00_PROJECT_VISION.md          → 15_API_GUIDELINES.md   (16 documentos numerados)
├── assets/               (recursos estáticos de la documentación)
├── images/               (capturas, diagramas exportados)
├── diagrams/             (diagramas fuente, p. ej. Mermaid/Excalidraw)
└── adr/                  (reservada para ADRs individuales futuros — hoy el registro vive en DECISIONS.md)
```

Los **16 documentos numerados** (`00` a `15`) son el contenido técnico real del proyecto — cada uno cubre
un dominio completo (arquitectura, base de datos, autenticación, perfiles, reproductor, panel admin,
diseño, landing, búsqueda, seguridad, rendimiento, PWA y APIs). Los archivos en mayúsculas
(`README.md`, `INDEX.md`, `CLAUDE.md`, etc.) son el andamiaje que conecta y da contexto a esos 16
documentos — no contienen reglas técnicas nuevas, solo organizan las que ya existen.

Cada documento numerado termina con un marcador `FIN DEL DOCUMENTO` seguido de una sección de
**Navegación** (documento anterior, índice, documento siguiente, y documentos relacionados) para moverse
entre ellos sin perderse.

## Orden recomendado de lectura

Para conocer el proyecto de punta a punta, en este orden:

1. [00 · Project Vision](00_PROJECT_VISION.md) — por qué existe AnimeCLZ y qué NO es.
2. [01 · Architecture](01_ARCHITECTURE.md) — las capas y el flujo de datos oficial.
3. [02 · Project Structure](02_PROJECT_STRUCTURE.md) — dónde vive cada tipo de archivo.
4. [03 · Database](03_DATABASE.md) — el esquema de Supabase/PostgreSQL.
5. [04 · Authentication](04_AUTHENTICATION.md) — cuentas, sesión y roles.
6. [05 · Profile System](05_PROFILE_SYSTEM.md) — perfiles múltiples por cuenta.
7. [06 · Provider Manager](06_PROVIDER_MANAGER.md) — el motor multi-proveedor de datos.
8. [07 · Player System](07_PLAYER_SYSTEM.md) — el reproductor de video.
9. [08 · Admin Panel](08_ADMIN_PANEL.md) — el panel de administración.
10. [09 · UI / UX Design System](09_UI_UX_DESIGN_SYSTEM.md) — identidad visual y componentes.
11. [10 · Landing Page](10_LANDING_PAGE.md) — la página pública de entrada.
12. [11 · Search Engine](11_SEARCH_ENGINE.md) — el buscador.
13. [12 · Security](12_SECURITY.md) — reglas de seguridad transversales.
14. [13 · Performance](13_PERFORMANCE.md) — rendimiento transversal.
15. [14 · PWA](14_PWA.md) — instalación y comportamiento offline.
16. [15 · API Guidelines](15_API_GUIDELINES.md) — lineamientos para integrar proveedores externos.

Si solo vas a **modificar** una parte puntual del proyecto (no leer todo), usa
[CLAUDE.md](CLAUDE.md) — indica exactamente qué documentos consultar según la tarea.

## Convenciones

- **Nombres de archivo:** `NN_TITULO_EN_MAYUSCULAS.md`, dos dígitos con cero a la izquierda (`00`–`15`),
  en el mismo orden en que aparecen en `Bible.md`.
- **Título de cada documento:** primera línea, `# NN - TÍTULO` — nunca se renombra ni se traduce.
- **Cierre de cada documento:** literalmente `FIN DEL DOCUMENTO`, seguido de la sección de Navegación.
- **Reglas para Claude:** casi todos los documentos (04 en adelante) terminan con una sección `Claude
  Rules` (o `Reglas para Claude` en el 04) — son las reglas NO negociables de ese dominio. Si vas a tocar
  código de esa área, léelas primero.
- **Contenido verbatim:** el contenido de los 16 documentos numerados nunca se resume, reescribe ni
  reordena — solo se separa, enlaza y navega. Cualquier corrección de contenido técnico es un cambio
  deliberado, documentado en [CHANGELOG.md](CHANGELOG.md).

## Enlaces internos

- [INDEX.md](INDEX.md) — tabla completa con la descripción de cada documento.
- [CLAUDE.md](CLAUDE.md) — orden de lectura obligatorio antes de trabajar en el código.
- [CONTRIBUTING.md](CONTRIBUTING.md) — cómo leer esta documentación y qué NO hacer.
- [CHANGELOG.md](CHANGELOG.md) — historial de esta documentación.
- [DECISIONS.md](DECISIONS.md) — por qué se tomaron las decisiones arquitectónicas ya existentes.
