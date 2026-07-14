# 11 - SEARCH ENGINE

---

# Introducción

El buscador de AnimeCLZ es uno de los componentes más importantes de toda la plataforma.

Su función no es únicamente encontrar un anime.

Debe convertirse en un motor inteligente de descubrimiento.

El usuario debe poder encontrar contenido utilizando múltiples criterios sin conocer el nombre exacto.

Toda búsqueda debe pasar por ProviderManager.

Nunca consultar APIs directamente desde la interfaz.

---

# Objetivos

El buscador debe permitir encontrar:

✔ Anime

✔ Personajes

✔ Estudios

✔ Géneros

✔ Temporadas

✔ Películas

✔ OVA

✔ Especiales

✔ Seiyuus (futuro)

✔ Noticias relacionadas (futuro)

---

# Arquitectura

Usuario

↓

SearchBar

↓

SearchService

↓

ProviderManager

↓

AniList

↓

Jikan

↓

Kitsu

↓

Base Local

↓

Resultados

---

# Filosofía

Buscar debe sentirse inmediato.

Nunca esperar varios segundos.

Siempre mostrar resultados progresivamente.

---

# Tipos de búsqueda

Anime

Personaje

Estudio

Género

Año

Temporada

Estado

Popularidad

Tags

---

# Buscador Principal

Debe aceptar:

Naruto

↓

Naruto Shippuden

↓

Naruto Uzumaki

↓

Studio Pierrot

↓

Shonen

↓

2002

Todo desde la misma barra.

---

# Autocompletado

Mientras escribe:

Mostrar

Poster

Título

Tipo

Año

Score

Personajes relacionados

Nunca esperar Enter.

---

# Debounce

300 ms.

Cancelar búsquedas anteriores mediante AbortController.

Nunca ejecutar búsquedas innecesarias.

---

# Búsqueda por Anime

Buscar por:

Título original.

Romaji.

Inglés.

Español.

Sinónimos.

Alias.

Slug.

---

# Búsqueda por Personaje

Debe aceptar:

Naruto

↓

Naruto Uzumaki

↓

Mostrar anime relacionado.

↓

Permitir usar como avatar.

---

# Búsqueda por Estudio

Ejemplo

MAPPA

↓

Mostrar todos sus animes.

---

# Búsqueda por Género

Acción

Drama

Romance

Comedia

Isekai

Fantasy

etc.

---

# Búsqueda por Año

2026

↓

Todos los animes del año.

---

# Búsqueda por Temporada

Winter

Spring

Summer

Fall

---

# Búsqueda por Estado

Emisión

Finalizado

Próximamente

---

# Búsqueda por Popularidad

Más vistos.

Mejor puntuados.

Tendencia.

Más favoritos.

---

# Búsqueda por Tags

Ejemplos

Cyberpunk

Samurai

School

Magic

Sports

Time Travel

---

# Historial

Cada perfil mantiene:

Últimas búsquedas.

Máximo:

20.

Nunca compartir entre perfiles.

---

# Recomendaciones

Si la barra está vacía:

Mostrar

Historial.

Favoritos.

Continuar viendo.

Tendencias.

---

# Resultados

Cada resultado muestra:

Poster.

Título.

Score.

Año.

Tipo.

Estado.

Botón favorito.

Nunca mostrar solo texto.

---

# Prioridad

1

Coincidencia exacta.

2

Comienza con.

3

Contiene.

4

Alias.

5

Personajes.

---

# ProviderManager

El SearchService nunca consulta APIs.

Siempre:

ProviderManager.search()

---

# Merge

AniList

+

Jikan

+

Kitsu

+

Base Local

↓

Eliminar duplicados.

↓

Ordenar.

↓

Mostrar.

---

# Cache

Búsquedas repetidas:

10 minutos.

---

# Offline

Mostrar resultados cacheados.

---

# Filtros

Género.

Año.

Temporada.

Formato.

Estado.

Idioma.

Score.

Duración.

Estudio.

Clasificación.

---

# Panel de filtros

Desktop

Sidebar.

Mobile

Bottom Sheet.

---

# Ordenamiento

Popularidad.

Score.

A-Z.

Más recientes.

Más antiguos.

Aleatorio.

---

# Infinite Scroll

Resultados largos.

Nunca paginación tradicional.

---

# Sin Resultados

Mostrar ilustración.

Sugerencias.

Botón limpiar filtros.

Nunca pantalla vacía.

---

# Errores

Nunca mostrar:

HTTP 500.

429.

504.

Siempre mostrar un mensaje amigable y ofrecer reintentar.

---

# Búsqueda por Voz (Futuro)

Usar Web Speech API.

---

# Búsqueda Inteligente (Futuro)

Aceptar errores de escritura.

Ejemplo

Narut

↓

Naruto

---

# Búsqueda Semántica (Futuro)

Ejemplo

"anime de ninjas"

↓

Naruto

Basilisk

Ninja Scroll

---

# Búsqueda Personalizada

Usar preferencias del perfil.

Priorizar:

Géneros favoritos.

Estudios favoritos.

Animes vistos.

---

# Rendimiento

Tiempo objetivo:

<300 ms para resultados cacheados.

<1 s para consultas remotas.

---

# Responsive

Desktop.

Tablet.

Android.

iPhone.

PWA.

---

# Accesibilidad

Navegación con teclado.

Enter.

Escape.

Flechas.

ARIA.

---

# Seguridad

Nunca construir consultas desde la UI.

Validar parámetros.

Escapar caracteres especiales.

---

# Claude Rules

Nunca consultar una API directamente desde Search.

Siempre utilizar SearchService.

SearchService siempre utiliza ProviderManager.

Toda búsqueda debe soportar AbortController.

Toda búsqueda debe usar debounce.

Toda búsqueda debe poder cachearse.

Nunca romper el historial por perfil.

Nunca compartir búsquedas entre perfiles.

---

# Mejoras Futuras

Búsqueda por imagen.

Búsqueda por opening.

Búsqueda por ending.

Búsqueda por actor de voz.

Búsqueda mediante IA.

Búsqueda por descripción ("anime donde viajan en el tiempo").

Sistema de recomendaciones basado en Machine Learning.

---

# Objetivo Final

El buscador debe sentirse tan rápido como Google y tan útil como AniList.

Debe convertirse en la principal herramienta para descubrir contenido dentro de AnimeCLZ, aprovechando todos los proveedores disponibles y respetando siempre la arquitectura definida por ProviderManager.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [06 Provider Manager](06_PROVIDER_MANAGER.md) · [13 Performance](13_PERFORMANCE.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [10 Landing Page](10_LANDING_PAGE.md) | [INDEX.md](INDEX.md) | [12 Security](12_SECURITY.md) |
