# 13 - PERFORMANCE

---

# Introducción

AnimeCLZ debe sentirse extremadamente rápido.

El usuario nunca debe percibir tiempos de espera innecesarios.

La optimización debe ser una prioridad desde el diseño de la arquitectura.

El rendimiento no consiste únicamente en obtener una buena puntuación en Lighthouse.

Debe sentirse rápido para el usuario.

---

# Objetivos

Mantener:

✔ Carga inicial rápida

✔ Navegación instantánea

✔ Bajo consumo de memoria

✔ Bajo consumo de red

✔ Excelente experiencia móvil

✔ Excelente rendimiento en PWA

✔ Excelente rendimiento incluso con conexiones lentas

---

# Filosofía

No cargar lo que el usuario todavía no necesita.

No renderizar lo que no está visible.

No solicitar datos repetidos.

No descargar imágenes innecesarias.

Todo debe ser progresivo.

---

# Core Web Vitals

Objetivos

LCP

Menor a 2.5 segundos.

CLS

Menor a 0.1

INP

Menor a 200 ms.

TTFB

Menor a 500 ms.

---

# Lazy Loading

Todo componente pesado debe cargarse mediante:

React.lazy()

Suspense

Ejemplos:

AnimeDetail

Player

Admin

Noticias

Configuración

Nunca cargar toda la aplicación al inicio.

---

# Code Splitting

Separar:

Landing

Home

Player

Admin

Auth

Configuración

Nunca generar un único bundle gigante.

---

# Bundle Size

Objetivo

JavaScript inicial

Menor a 300 KB.

CSS inicial

Menor a 100 KB.

Imágenes iniciales

Menor a 1 MB.

---

# Imágenes

Siempre utilizar:

Lazy Loading

WebP

AVIF cuando sea posible

Placeholder Blur

Responsive Images

Nunca cargar imágenes enormes.

---

# Posters

Utilizar tamaños diferentes según dispositivo.

Desktop

Alta resolución.

Mobile

Resolución reducida.

---

# Banners

Nunca descargar banners completos en móviles.

Utilizar versiones optimizadas.

---

# Infinite Scroll

Utilizar únicamente cuando exista una gran cantidad de contenido.

Nunca cargar cientos de tarjetas desde el inicio.

---

# Carruseles

Cargar únicamente:

Elementos visibles.

Dos elementos adicionales.

Nada más.

---

# Virtualización

Para listas muy grandes utilizar:

Virtual Scrolling.

Nunca renderizar miles de elementos.

---

# Memoización

Utilizar:

React.memo()

useMemo()

useCallback()

Solo cuando exista una mejora real.

Nunca abusar.

---

# Contextos

Mantener Context pequeños.

Nunca almacenar información innecesaria.

Evitar renders globales.

---

# Estado

Separar:

UI

Datos

Autenticación

Player

Perfiles

Nunca un único Context gigante.

---

# Cache

Utilizar varios niveles.

Memory Cache

↓

IndexedDB

↓

LocalStorage

↓

Provider

---

# Tiempo de Cache

Home

5 minutos.

Anime

30 minutos.

Galería

1 hora.

Géneros

24 horas.

Configuración

24 horas.

---

# Prefetch

Al pasar el cursor sobre una tarjeta:

Precargar:

Anime Detail.

Poster.

Información.

Solo Desktop.

---

# Preload

Precargar únicamente:

Logo.

Fuente principal.

Hero.

Nada más.

---

# Service Worker

Cachear:

Assets.

Fuentes.

Imágenes.

API cuando sea posible.

Nunca cachear datos sensibles.

---

# Navegación

Las transiciones deben sentirse instantáneas.

Nunca mostrar pantalla blanca.

Siempre utilizar Skeleton.

---

# Skeleton

Toda carga superior a 150 ms debe mostrar Skeleton.

Nunca Spinner infinito.

---

# Reintentos

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

Toda petición debe poder cancelarse.

Especialmente:

Búsquedas.

Carruseles.

Anime Detail.

---

# Debounce

Buscador

300 ms.

Filtros

200 ms.

Nunca realizar solicitudes por cada tecla.

---

# Optimización Mobile

Reducir:

Animaciones.

Blur excesivo.

Sombras.

Videos automáticos.

---

# Animaciones

Máximo:

60 FPS.

Nunca bloquear el hilo principal.

---

# Fuentes

Utilizar:

font-display: swap

Preload únicamente la principal.

---

# Iconos

Lucide React.

Importaciones individuales.

Nunca importar toda la librería.

---

# Dependencias

Eliminar dependencias sin uso.

Revisar bundle periódicamente.

Evitar librerías gigantes.

---

# API

Nunca realizar solicitudes duplicadas.

Siempre consultar primero el cache.

---

# ProviderManager

Debe reutilizar respuestas cuando sea posible.

Nunca repetir solicitudes iguales.

---

# Errores

Mostrar contenido cacheado antes de mostrar un error.

---

# Lighthouse

Objetivos

Performance

95+

Accessibility

100

Best Practices

100

SEO

100

---

# Monitoreo

Revisar periódicamente:

Lighthouse

Web Vitals

Bundle Analyzer

Network

Memory

---

# Responsive

Desktop.

Tablet.

Android.

iPhone.

PWA.

Todos deben sentirse rápidos.

---

# Claude Rules

Nunca cargar componentes pesados innecesariamente.

Nunca romper el sistema de cache.

Siempre usar Lazy Loading cuando corresponda.

Siempre optimizar imágenes.

Nunca duplicar llamadas a APIs.

Siempre cancelar solicitudes obsoletas.

Nunca sacrificar rendimiento por efectos visuales.

---

# Mejoras Futuras

Streaming progresivo.

Compresión automática de imágenes.

CDN propio.

Edge Functions.

Compresión Brotli.

Renderizado parcial.

Predicción de navegación mediante IA.

---

# Objetivo Final

AnimeCLZ debe sentirse instantáneo incluso con miles de animes, múltiples proveedores y una gran cantidad de usuarios simultáneos.

El rendimiento debe formar parte de la arquitectura, no ser una optimización posterior.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [06 Provider Manager](06_PROVIDER_MANAGER.md) · [14 PWA](14_PWA.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [12 Security](12_SECURITY.md) | [INDEX.md](INDEX.md) | [14 PWA](14_PWA.md) |
