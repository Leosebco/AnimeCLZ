# 14 - PROGRESSIVE WEB APP (PWA)

---

# Introducción

AnimeCLZ debe poder instalarse como una aplicación nativa.

El usuario no debe notar diferencias importantes entre utilizar:

• La versión web.

• La PWA.

• Una futura aplicación móvil.

La PWA será el puente entre la web y una aplicación completa.

---

# Objetivos

AnimeCLZ debe soportar:

✔ Instalación

✔ Pantalla completa

✔ Iconos personalizados

✔ Splash Screen

✔ Funcionamiento Offline

✔ Actualizaciones automáticas

✔ Cache inteligente

✔ Push Notifications

✔ Background Sync

✔ Responsive completo

✔ Integración con Android

✔ Integración con iPhone

---

# Filosofía

La PWA nunca será una versión reducida.

Debe ofrecer prácticamente la misma experiencia que una aplicación instalada.

---

# Arquitectura

Usuario

↓

Navegador

↓

Service Worker

↓

Cache

↓

AnimeCLZ

↓

Supabase

↓

ProviderManager

---

# Instalación

Debe funcionar desde:

Chrome

Edge

Safari

Firefox (cuando sea compatible)

Android

iPhone

Windows

macOS

---

# Manifest

Debe definir:

Nombre

Nombre corto

Descripción

Tema

Color principal

Background

Orientación

Display

Iconos

Shortcuts

Categorías

Idioma

---

# Display

Modo recomendado:

standalone

Nunca browser.

---

# Splash Screen

Debe incluir:

Logo AnimeCLZ

Fondo oficial

Color del tema

Versión

Nunca pantalla blanca.

---

# Iconos

Tamaños mínimos:

72x72

96x96

128x128

144x144

152x152

192x192

384x384

512x512

Maskable

Apple Touch Icon

---

# Safe Area

Compatibilidad total con:

Notch

Dynamic Island

Pantallas curvas

Gesture Navigation

Utilizar:

env(safe-area-inset-top)

env(safe-area-inset-bottom)

env(safe-area-inset-left)

env(safe-area-inset-right)

---

# Offline

Debe funcionar parcialmente.

Disponibles:

Landing

Configuración

Perfil

Favoritos

Mi Lista

Historial

Últimos animes abiertos

Cache de imágenes

Nunca mostrar pantalla completamente vacía.

---

# Estrategia de Cache

Assets

Cache First

↓

Imágenes

Stale While Revalidate

↓

API

Network First

↓

Configuración

Cache First

↓

Videos

Nunca cachear automáticamente.

---

# Actualizaciones

El Service Worker debe detectar:

Nueva versión

↓

Notificar usuario

↓

Actualizar

↓

Recargar cuando el usuario lo acepte

Nunca actualizar silenciosamente mientras reproduce un video.

---

# Push Notifications

Preparado para:

Nuevos episodios

Noticias

Recordatorios

Lanzamientos

Favoritos actualizados

Nunca enviar spam.

---

# Background Sync

Cuando vuelva Internet:

Sincronizar:

Favoritos

Mi Lista

Historial

Comentarios

Configuraciones

---

# Continue Watching

Debe funcionar incluso sin conexión cuando el episodio esté disponible localmente.

Guardar:

Posición

Episodio

Anime

Fecha

---

# Integración Android

Compatibilidad:

Chrome

Samsung Internet

Edge

Instalación mediante:

Add to Home Screen

---

# Integración iPhone

Compatibilidad:

Safari

Instalación:

Compartir

↓

Agregar a pantalla de inicio

Soportar:

Apple Touch Icons

Splash

Safe Area

Status Bar

---

# Navegación

La PWA nunca debe abrir nuevas pestañas innecesariamente.

Toda navegación debe sentirse nativa.

---

# Estado de Red

Detectar:

Online

Offline

Conectividad lenta

Mostrar indicadores claros.

---

# Service Worker

Responsabilidades:

Cache

Actualizaciones

Offline

Background Sync

Push

Nunca lógica de negocio.

---

# Cache Storage

Organizar:

images-cache

api-cache

assets-cache

fonts-cache

Nunca mezclar recursos.

---

# Actualización de Cache

Eliminar automáticamente versiones antiguas.

Nunca acumular cache infinito.

---

# Videos

No cachear automáticamente.

En el futuro:

Descargas manuales.

Modo Offline Premium.

---

# Imágenes

Guardar únicamente:

Poster

Banner

Avatar

Iconos

Nunca imágenes innecesarias.

---

# Rendimiento

Objetivos:

Inicio

<2 segundos

Cambio de página

Instantáneo

Apertura desde icono

<1 segundo

---

# Responsive

Desktop

Tablet

Android

iPhone

PWA

TV (futuro)

---

# Accesibilidad

La PWA debe respetar:

Contraste

Navegación teclado

Lectores de pantalla

Focus

ARIA

---

# Seguridad

El Service Worker nunca debe almacenar:

JWT

Passwords

Secrets

Información sensible

---

# Claude Rules

Nunca romper el manifest.

Nunca eliminar el Service Worker.

Nunca almacenar datos sensibles en cache.

Siempre respetar Safe Areas.

Siempre optimizar iconos.

Siempre actualizar el cache de forma controlada.

Nunca cachear videos automáticamente.

---

# Mejoras Futuras

Descarga de episodios.

Modo completamente Offline.

Widgets Android.

Widgets iPhone.

Notificaciones inteligentes.

Sincronización entre dispositivos.

Actualizaciones diferenciales.

---

# Objetivo Final

AnimeCLZ debe sentirse como una aplicación instalada, rápida, moderna y confiable.

El usuario debe poder abrir AnimeCLZ desde su dispositivo sin percibir que realmente está utilizando un navegador.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [13 Performance](13_PERFORMANCE.md) · [07 Player System](07_PLAYER_SYSTEM.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [13 Performance](13_PERFORMANCE.md) | [INDEX.md](INDEX.md) | [15 API Guidelines](15_API_GUIDELINES.md) |
