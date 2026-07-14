# 00 - PROJECT VISION

---

# Información General

**Nombre del proyecto**

AnimeCLZ

---

**Versión actual**

v3.x (en desarrollo)

---

**Autor**

Leonardo Sebastian Calizaya Obregon

---

# Filosofía del proyecto

AnimeCLZ NO es un clon de Netflix.

AnimeCLZ NO es un clon de Crunchyroll.

AnimeCLZ NO es un clon de AniList.

La idea es combinar lo mejor de todas esas plataformas en un único proyecto moderno, rápido, elegante y completamente administrable.

Debe sentirse como una aplicación profesional.

La prioridad SIEMPRE será:

1. Experiencia de usuario.
2. Arquitectura limpia.
3. Rendimiento.
4. Escalabilidad.
5. Código reutilizable.

Nunca desarrollar solamente para "que funcione".

Todo cambio debe mejorar la arquitectura.

---

# Objetivo

Crear una plataforma privada para visualizar información de anime y reproducir episodios.

La aplicación será utilizada principalmente por su creador.

No está diseñada inicialmente para miles de usuarios.

Sin embargo, toda la arquitectura debe ser escalable para soportarlo en el futuro.

---

# Objetivos principales

AnimeCLZ debe permitir:

- Buscar anime.
- Buscar personajes.
- Buscar estudios.
- Buscar temporadas.
- Ver información completa.
- Ver trailers.
- Ver galerías.
- Ver relaciones.
- Ver recomendaciones.
- Reproducir episodios.
- Continuar viendo.
- Guardar favoritos.
- Guardar historial.
- Crear múltiples perfiles.
- Personalizar la experiencia.
- Administrar contenido desde un panel propio.

---

# Público objetivo

Principalmente:

El propietario del proyecto.

Posteriormente:

Amigos.

Familiares.

Usuarios invitados autorizados.

Nunca será una plataforma pública abierta.

---

# Tecnologías principales

Frontend

- React
- Vite
- TailwindCSS
- Framer Motion

Backend

- Supabase

Base de datos

- PostgreSQL (Supabase)

Autenticación

- Supabase Auth

Storage

- Supabase Storage

Deploy

- Vercel

---

# Filosofía de desarrollo

Cada nueva funcionalidad debe cumplir estas reglas:

✔ Reutilizable

✔ Escalable

✔ Modular

✔ Fácil de mantener

✔ Responsive

✔ Accesible

✔ Optimizada

Nunca escribir código únicamente para resolver un caso específico.

Siempre pensar en el crecimiento futuro.

---

# Principios del proyecto

## 1. Modularidad

Cada sistema debe ser independiente.

Ejemplo:

ProviderManager

NO debe depender del Player.

Player

NO debe depender del Panel Admin.

Panel Admin

NO debe depender del Login.

Todo debe comunicarse mediante servicios bien definidos.

---

## 2. Reutilización

Nunca duplicar componentes.

Si un componente puede reutilizarse:

Debe reutilizarse.

---

## 3. Arquitectura limpia

Separar:

Componentes

Servicios

Hooks

Context

Providers

Layouts

Utilidades

Nunca mezclar responsabilidades.

---

## 4. UI moderna

Todo el sitio debe transmitir sensación premium.

Inspiraciones:

Netflix

Crunchyroll

AniList

Disney+

Steam

Apple

Nunca parecer una plantilla gratuita.

---

## 5. Animaciones

Las animaciones deben mejorar la experiencia.

Nunca molestar.

Usar principalmente:

Framer Motion.

Lottie.

Rive.

CSS.

---

## 6. Rendimiento

Reducir:

Re-renderizados.

Llamadas repetidas.

Peticiones innecesarias.

Uso de memoria.

Tiempo de carga.

---

## 7. Responsive First

Toda funcionalidad nueva debe probarse en:

Desktop.

Tablet.

Android.

iPhone.

No agregar funciones exclusivas para escritorio.

---

# Objetivo visual

AnimeCLZ debe sentirse como una aplicación profesional.

No como una página universitaria.

Debe transmitir calidad desde el primer segundo.

---

# Estado actual

Actualmente el proyecto ya posee:

✔ Login

✔ Registro

✔ Recuperar contraseña

✔ Perfiles

✔ Temas

✔ Favoritos

✔ Mi Lista

✔ Historial

✔ Panel Administrador

✔ ProviderManager

✔ Jikan

✔ AniList

✔ Landing

✔ Responsive

✔ PWA

✔ Supabase

✔ CRUD parcial

---

# Objetivos futuros

Sistema de reproducción.

CRUD completo.

Base de datos propia.

Proveedor múltiple.

Player avanzado.

Sistema Adult.

Sincronización.

Descargas.

Modo Offline.

Notificaciones.

Aplicación móvil.

---

# Regla más importante

La calidad del código es más importante que la velocidad de desarrollo.

Nunca romper arquitectura por implementar una funcionalidad rápidamente.

Siempre buscar la solución correcta.

Aunque tome más tiempo.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [01 Architecture](01_ARCHITECTURE.md) · [02 Project Structure](02_PROJECT_STRUCTURE.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| — | [INDEX.md](INDEX.md) | [01 Architecture](01_ARCHITECTURE.md) |
