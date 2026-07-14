# 03 - DATABASE

---

# Introducción

Este documento define la arquitectura oficial de la base de datos de AnimeCLZ.

La base de datos utiliza PostgreSQL mediante Supabase.

Toda modificación deberá realizarse mediante migraciones.

Nunca modificar tablas manualmente en producción sin crear una migración correspondiente.

---

# Filosofía

La base de datos debe ser:

Escalable.

Normalizada.

Segura.

Compatible con RLS.

Preparada para millones de registros.

Aunque actualmente el proyecto sea privado.

---

# Motor

Supabase

PostgreSQL

Storage

Authentication

Realtime

Edge Functions (futuro)

---

# Esquema General

```

Supabase

│

├── Auth

├── Database

├── Storage

└── Realtime

```

---

# Auth

Responsable de:

Registro

Login

OAuth

Recuperación

Sesiones

Refresh Token

Usuarios

Nunca guardar contraseñas manualmente.

Siempre utilizar Supabase Auth.

---

# Database

Contiene todas las tablas del proyecto.

---

# Storage

Responsable de:

Avatares

Fondos

Miniaturas

Banner

Imágenes de anime

Trailers locales

Subtítulos

---

# Realtime

Preparado para:

Notificaciones

Chat

Visualización simultánea

Panel en tiempo real

---

# Tablas actuales

## profiles

Información básica del perfil.

Campos:

id

user_id

nombre

avatar

tipo_avatar

fondo

tema

rol

activo

created_at

updated_at

---

## profiles_account

Configuración general de la cuenta.

Campos:

id

user_id

tema

idioma

preferencias

created_at

updated_at

---

## favorites

Favoritos por perfil.

Campos:

id

profile_id

anime_id

provider

created_at

---

## watch_history

Historial por perfil.

Campos:

id

profile_id

anime_id

episode_id

progress

last_position

updated_at

---

## watch_later

Lista "Ver después".

Campos:

id

profile_id

anime_id

created_at

---

## ratings

Calificaciones.

Campos:

id

profile_id

anime_id

score

created_at

---

## comments

Comentarios.

Campos:

id

profile_id

anime_id

contenido

estado

created_at

---

## notifications

Notificaciones.

Campos:

id

profile_id

titulo

mensaje

leido

created_at

---

# Tablas futuras

## anime_local

Información editable.

Campos:

id

provider_id

titulo

sinopsis

banner

poster

background

estado

tipo

temporada

estudio

duracion

created_at

updated_at

---

## episodes

Cada episodio.

Campos:

id

anime_id

numero

titulo

descripcion

thumbnail

duracion

opening

ending

created_at

---

## video_sources

Fuentes.

Campos:

id

episode_id

provider

url

quality

language

principal

activo

---

## subtitles

Subtítulos.

Campos:

id

episode_id

language

url

tipo

---

## openings

Campos:

id

anime_id

titulo

video

audio

---

## endings

Campos:

id

anime_id

titulo

video

audio

---

## characters_local

Personajes.

Campos:

id

anime_id

nombre

imagen

descripcion

voz

---

## studios_local

Estudios.

Campos:

id

nombre

pais

fundacion

logo

---

## genres_local

Géneros.

Campos:

id

nombre

slug

---

## relations_local

Relaciones.

Campos:

id

anime_id

related_id

tipo

---

## trailers

Campos:

id

anime_id

youtube

thumbnail

---

## collections

Colecciones.

Campos:

id

titulo

descripcion

imagen

---

# Relaciones

profiles

↓

favorites

↓

anime

profiles

↓

watch_history

↓

episodes

anime

↓

episodes

↓

video_sources

↓

subtitles

anime

↓

characters

anime

↓

relations

anime

↓

trailers

---

# Storage Buckets

avatars

backgrounds

anime

episodes

trailers

subtitles

openings

endings

news

temp

---

# Roles

super_admin

Acceso total.

admin

CRUD contenido.

usuario

Solo visualización.

invitado

Perfil limitado.

adult

Permiso adicional.

---

# Row Level Security

Todas las tablas deben tener RLS.

Nunca deshabilitar RLS.

---

Ejemplo:

favorites

Solo puede leer:

profile_id = auth.uid()

Nunca otra cuenta.

---

# Triggers

Auto crear perfil.

Sincronizar rol.

Actualizar updated_at.

Limitar perfiles.

Proteger admin.

Eliminar historial al borrar perfil.

---

# Índices

Crear índices para:

anime_id

profile_id

provider

episode_id

created_at

updated_at

Nunca hacer búsquedas sin índice.

---

# Migraciones

Toda modificación debe hacerse mediante:

supabase migration

Nunca editar producción manualmente.

---

# Backups

Antes de migraciones grandes:

Backup completo.

Guardar versión.

Documentar cambios.

---

# Convenciones

UUID para IDs.

created_at

updated_at

deleted_at (soft delete futuro)

Nunca usar INT autoincremental.

---

# Eliminación

Nunca borrar definitivamente.

Preferir:

activo

estado

deleted_at

Soft Delete.

---

# Integridad

Toda FK debe existir.

Nunca permitir datos huérfanos.

---

# Performance

Usar índices.

Limitar consultas.

Paginación.

Cache.

Evitar joins innecesarios.

---

# Seguridad

Nunca exponer Service Role Key.

Solo usar Publishable Key en frontend.

Toda operación sensible debe pasar por RLS.

---

# Objetivo Final

La base de datos debe permitir cambiar de proveedor de anime sin perder información local.

AnimeCLZ siempre será dueño de sus propios datos.

Las APIs externas solo complementan el contenido.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [04 Authentication](04_AUTHENTICATION.md) · [12 Security](12_SECURITY.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [02 Project Structure](02_PROJECT_STRUCTURE.md) | [INDEX.md](INDEX.md) | [04 Authentication](04_AUTHENTICATION.md) |
