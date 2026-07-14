# 15 - API GUIDELINES

---

# Introducción

AnimeCLZ fue diseñado para funcionar con múltiples proveedores de información.

Ninguna API externa es indispensable.

Todas las APIs pueden ser reemplazadas sin modificar la interfaz de usuario.

La integración de nuevos proveedores debe respetar siempre la arquitectura definida por ProviderManager.

---

# Objetivos

Garantizar:

✔ Integración sencilla de nuevas APIs

✔ Bajo acoplamiento

✔ Reemplazo transparente de proveedores

✔ Alta disponibilidad

✔ Consistencia de datos

✔ Escalabilidad

✔ Fácil mantenimiento

---

# Filosofía

Las APIs son únicamente fuentes de datos.

La aplicación pertenece a AnimeCLZ.

Nunca permitir que la estructura de una API determine la arquitectura del proyecto.

---

# Arquitectura

```
React

↓

Services

↓

ProviderManager

↓

Provider Interface

↓

AniList

Jikan

Kitsu

AnimeThemes

TMDB

Consumet

Enime

Base Local
```

---

# Regla Principal

Nunca consumir una API directamente desde:

React

Pages

Components

Contexts

Hooks

Siempre utilizar:

Services

↓

ProviderManager

↓

Provider

---

# Provider Interface

Todo Provider implementa exactamente:

search()

getAnime()

getEpisodes()

getCharacters()

getRecommendations()

getRelations()

getGallery()

getTrailer()

getStudios()

healthCheck()

Nunca agregar métodos arbitrarios sin actualizar la interfaz oficial.

---

# ProviderManager

Responsabilidades:

Seleccionar proveedor.

Fusionar datos.

Eliminar duplicados.

Cachear.

Reintentar.

Fallback.

Registrar errores.

Nunca renderizar componentes.

---

# Orden Oficial

1

Base Local

↓

2

AniList

↓

3

Jikan

↓

4

Kitsu

↓

5

AnimeThemes

↓

6

TMDB

↓

7

Consumet (video)

↓

8

Enime (video)

↓

9

Futuros proveedores

---

# Integración de un Nuevo Provider

Pasos obligatorios:

1.

Crear carpeta:

providers/NuevoProvider/

2.

Implementar Provider Interface.

3.

Registrar en ProviderManager.

4.

Agregar pruebas.

5.

Actualizar documentación.

Nunca modificar la UI.

---

# Formato Unificado

Todos los Providers deben devolver el mismo formato.

Ejemplo:

Anime

{
id,
title,
poster,
banner,
description,
score,
episodes,
genres,
studios,
characters
}

Nunca devolver estructuras propias de cada API.

---

# Merge de Datos

Regla:

Conservar siempre la mejor información disponible.

Ejemplo:

AniList:

Sinopsis completa.

Jikan:

Trailer.

TMDB:

Banner HD.

Resultado:

Un único objeto enriquecido.

---

# Prioridad de Datos

Base Local

↓

AniList

↓

Jikan

↓

Kitsu

↓

TMDB

---

# Reemplazo de Datos

Solo reemplazar cuando:

El nuevo dato sea de mayor calidad.

Ejemplos:

Imagen con mayor resolución.

Descripción más completa.

Mayor cantidad de episodios.

Nunca reemplazar datos buenos por información inferior.

---

# Duplicados

Comparar mediante:

MAL ID

AniList ID

Título

Slug

Alias

Romaji

Sinónimos

Nunca mostrar dos veces el mismo anime.

---

# Cache

Todo Provider debe soportar cache.

Tipos:

Memory

IndexedDB

LocalStorage

TTL definido por ProviderManager.

---

# Timeout

Toda petición:

10 segundos máximo.

Después:

AbortController.

---

# Retry

Aplicar únicamente para:

429

500

502

503

504

Máximo:

4 intentos.

Backoff exponencial.

---

# Rate Limiting

Respetar siempre las restricciones oficiales de cada proveedor.

Nunca intentar evitarlas mediante técnicas abusivas.

---

# Health Check

Todo Provider implementa:

healthCheck()

Debe indicar:

Disponible

Tiempo de respuesta

Errores recientes

Versión

---

# Logs

Registrar:

Proveedor

Tiempo

Método

Resultado

Solo en desarrollo.

---

# Versionado

Cada Provider debe indicar:

Nombre

Versión

Fecha

Cambios importantes

---

# Compatibilidad

Un cambio de versión nunca debe romper ProviderManager.

Si cambia la API:

Actualizar únicamente el Provider correspondiente.

---

# Errores

Nunca propagar errores técnicos al usuario.

El Provider devuelve:

Resultado válido

o

Objeto vacío controlado

Nunca excepciones sin manejar.

---

# Seguridad

Nunca almacenar:

API Keys

Secrets

Tokens privados

Toda información sensible debe permanecer en variables de entorno o servicios seguros.

---

# Testing

Cada Provider debe tener pruebas para:

Búsqueda

Detalle

Personajes

Episodios

Recomendaciones

Errores

Timeout

Retry

Merge

---

# APIs Oficiales

Actualmente soportadas:

AniList

Jikan

Kitsu

AnimeThemes

TMDB

Consumet (planificado)

Enime (planificado)

Base Local

---

# APIs Experimentales

Pueden integrarse siempre que:

Sean legales.

Sean públicas o autorizadas.

Respeten licencias.

No comprometan la seguridad.

---

# Deprecación

Cuando un Provider deje de utilizarse:

Nunca eliminar inmediatamente.

Marcar como:

Deprecated.

Mantener compatibilidad hasta migrar completamente.

---

# Claude Rules

Nunca consumir una API directamente desde React.

Nunca romper ProviderManager.

Nunca devolver estructuras distintas a la interfaz oficial.

Siempre implementar healthCheck().

Siempre documentar un nuevo Provider.

Siempre agregar pruebas.

Siempre respetar el orden de prioridad.

Nunca eliminar un Provider sin una migración planificada.

---

# Mejoras Futuras

Balanceo automático entre proveedores.

Selección dinámica según disponibilidad.

Métricas en tiempo real.

Dashboard de APIs.

Detección automática de degradación.

Integración con proveedores propios.

---

# Objetivo Final

AnimeCLZ debe poder cambiar completamente de proveedor sin modificar un solo componente del frontend.

Toda la inteligencia de integración debe vivir dentro de ProviderManager y de los Providers individuales.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [06 Provider Manager](06_PROVIDER_MANAGER.md) · [01 Architecture](01_ARCHITECTURE.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [14 PWA](14_PWA.md) | [INDEX.md](INDEX.md) | — |
