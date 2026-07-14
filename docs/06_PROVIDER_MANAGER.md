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

---

## Navegación

**Documentos relacionados:** [01 Architecture](01_ARCHITECTURE.md) · [15 API Guidelines](15_API_GUIDELINES.md) · [13 Performance](13_PERFORMANCE.md) · [11 Search Engine](11_SEARCH_ENGINE.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [05 Profile System](05_PROFILE_SYSTEM.md) | [INDEX.md](INDEX.md) | [07 Player System](07_PLAYER_SYSTEM.md) |
