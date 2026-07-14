# Changelog — Documentación de AnimeCLZ

Registro de cambios de la **documentación** de AnimeCLZ (carpeta `docs/`), no del código fuente — el
historial de versiones del producto vive en `CLAUDE.md`/`ROADMAP.md`/`TODO.md` en la raíz del repositorio.

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) adaptado a documentación. Cada
versión solo registra cambios que realmente ocurrieron — no se anticipan versiones futuras con contenido
inventado.

---

## v1.2 — Estructura profesional de documentación

**Agregado**

- `CHANGELOG.md` (este archivo).
- `CONTRIBUTING.md` — guía de lectura y buenas prácticas para colaboradores humanos y para Claude.
- `DECISIONS.md` — registro de decisiones arquitectónicas (ADR) ya existentes en la documentación.
- `CLAUDE.md` — orden de lectura obligatorio y mapa de "qué documento consultar según la tarea".
- Carpetas `diagrams/` y `adr/` (reservadas, con `.gitkeep`).
- Sección de **Navegación** (documento anterior / índice / documento siguiente / documentos
  relacionados) al final de cada uno de los 16 documentos numerados (`00`–`15`), después del marcador
  `FIN DEL DOCUMENTO`.

**Cambiado**

- `README.md` reescrito como puerta de entrada completa: qué es AnimeCLZ, objetivos, arquitectura
  general, organización de la documentación, orden de lectura recomendado y convenciones.
- `INDEX.md` ampliado con una tabla de "Documentos de gobierno" y una tabla de "Carpetas", además de la
  tabla original de los 16 documentos técnicos.

**Sin cambios**

- El contenido técnico de los 16 documentos numerados (`00_PROJECT_VISION.md` a `15_API_GUIDELINES.md`)
  — ni una línea de su contenido original fue resumida, reescrita o reordenada. Solo se les agregó la
  sección de Navegación al final, después de `FIN DEL DOCUMENTO`.
- Ningún archivo fuera de `docs/` — este fue un sprint exclusivo de documentación (ver
  [CONTRIBUTING.md](CONTRIBUTING.md)).

---

## v1.1 — Reorganización en `docs/`

**Agregado**

- Carpeta `docs/` con un archivo por documento, extraído verbatim de `Bible.md` (16 documentos, `00` a
  `15`), usando los títulos principales (`# NN - TÍTULO`) como límite de cada archivo.
- `README.md` inicial (índice básico enlazando a los 16 documentos).
- `INDEX.md` inicial (tabla `Documento | Descripción`).
- Carpetas `assets/` e `images/` (reservadas, con `.gitkeep`).

**Cambiado**

- Nada — la extracción fue verificada byte a byte contra `Bible.md` (sin pérdida ni alteración de
  contenido, salvo normalización de fin de línea CRLF → LF).

---

## v1.0 — AnimeCLZ Bible (documento único)

**Agregado**

- `Bible.md`, la fuente original: 16 documentos (`00 - PROJECT VISION` a `15 - API GUIDELINES`)
  concatenados en un único archivo, cada uno con su propio marcador `FIN DEL DOCUMENTO`.
- Autor: Leonardo Sebastian Calizaya Obregon.

---

## Cómo agregar una entrada nueva

1. Determina si el cambio es de **documentación** (va aquí) o de **producto/código** (va en
   `CLAUDE.md`/`ROADMAP.md`/`TODO.md` en la raíz).
2. Usa el número de versión siguiente en la secuencia — nunca lo inventes ni lo adelantes.
3. Clasifica cada entrada en `Agregado`, `Cambiado`, `Corregido` o `Eliminado`.
4. Sé específico: nombra el archivo o la sección exacta que cambió.
