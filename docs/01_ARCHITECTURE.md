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

---

## Navegación

**Documentos relacionados:** [06 Provider Manager](06_PROVIDER_MANAGER.md) · [02 Project Structure](02_PROJECT_STRUCTURE.md) · [12 Security](12_SECURITY.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [00 Project Vision](00_PROJECT_VISION.md) | [INDEX.md](INDEX.md) | [02 Project Structure](02_PROJECT_STRUCTURE.md) |
