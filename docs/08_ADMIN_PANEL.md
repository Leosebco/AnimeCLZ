# 08 - ADMIN PANEL

---

# Introducción

El Panel de Administración es el centro de control de AnimeCLZ.

Desde aquí se administrará absolutamente todo el contenido del sitio.

El Panel debe ser completamente independiente del Home.

Nunca mezclar componentes públicos con componentes administrativos.

Toda acción realizada desde el Panel debe respetar los permisos del usuario y las políticas RLS de Supabase.

---

# Filosofía

El Panel debe sentirse como una aplicación profesional.

Inspiraciones:

- Steam Admin
- YouTube Studio
- Vercel Dashboard
- Supabase Dashboard
- Notion
- GitHub

No debe sentirse como un formulario tradicional.

---

# Objetivos

El Panel permitirá administrar:

✔ Usuarios

✔ Roles

✔ Perfiles

✔ Noticias

✔ Banners

✔ Colecciones

✔ Animes

✔ Episodios

✔ Personajes

✔ Estudios

✔ Géneros

✔ Relaciones

✔ Videos

✔ Servidores

✔ Comentarios

✔ Reportes

✔ Configuración

✔ Módulo +18

✔ Estadísticas

---

# Arquitectura

```
AdminLayout

│

├── Sidebar

├── Topbar

├── Dashboard

├── Modules

├── Notifications

└── Settings
```

---

# Dashboard

Debe mostrar:

Número de usuarios.

Perfiles creados.

Animes.

Episodios.

Noticias.

Comentarios.

Reproducciones.

Favoritos.

Mi Lista.

Historial.

Uso de almacenamiento.

Actividad reciente.

---

# Sidebar

Debe contener:

Dashboard

Contenido

Usuarios

Noticias

Moderación

Adult

Configuración

Logs

Cerrar sesión

---

# Dashboard Widgets

Tarjetas.

Gráficos.

Últimas acciones.

Estadísticas.

Alertas.

Uso de API.

Uso de Storage.

---

# CRUD de Usuarios

Permite:

Ver usuarios.

Editar usuario.

Desactivar usuario.

Reactivar usuario.

Asignar rol.

Eliminar cuenta.

Ver perfiles.

Nunca permitir que un administrador modifique un Super Admin.

---

# CRUD de Perfiles

Crear.

Editar.

Eliminar.

Cambiar avatar.

Cambiar fondo.

Cambiar tema.

Ver historial.

Ver favoritos.

Ver actividad.

---

# CRUD de Noticias

Crear noticia.

Editar.

Eliminar.

Programar publicación.

Imagen principal.

Categorías.

Estado.

Destacada.

---

# CRUD de Animes

Crear.

Editar.

Eliminar.

Publicar.

Ocultar.

Asignar colección.

Cambiar portada.

Cambiar banner.

Editar sinopsis.

Editar géneros.

Editar relaciones.

Editar estudios.

Agregar imágenes.

Agregar trailers.

---

# CRUD de Episodios

Crear episodio.

Editar episodio.

Eliminar episodio.

Cambiar orden.

Asignar temporada.

Subir miniatura.

Agregar duración.

Asignar Opening.

Asignar Ending.

---

# CRUD de Videos

Cada episodio puede tener múltiples fuentes.

Campos:

Servidor

Idioma

Calidad

Principal

Estado

URL

Headers

Prioridad

---

# CRUD de Personajes

Nombre.

Imagen.

Descripción.

Seiyuu.

Edad.

Altura.

Peso.

Anime relacionado.

---

# CRUD de Estudios

Nombre.

Logo.

País.

Año.

Descripción.

Sitio web.

---

# CRUD de Colecciones

Colecciones especiales.

Ejemplo:

Los mejores Shonen.

Verano 2026.

Clásicos.

Películas.

---

# CRUD de Géneros

Crear.

Editar.

Eliminar.

Ordenar.

Color.

Icono.

---

# CRUD de Relaciones

Precuela.

Secuela.

OVA.

Especial.

Película.

Spin Off.

---

# Moderación

Eliminar comentarios.

Ocultar comentarios.

Bloquear usuarios.

Advertencias.

Reportes.

---

# Reportes

Usuarios pueden reportar:

Comentarios.

Perfiles.

Noticias.

Contenido.

El Panel debe permitir resolver cada reporte.

---

# Configuración General

Nombre del sitio.

Descripción.

Logo.

Favicon.

Tema por defecto.

Landing.

Modo mantenimiento.

APIs activas.

Límite de perfiles.

Límite de favoritos.

---

# Gestión de Providers

Activar.

Desactivar.

Cambiar prioridad.

Ver estado.

Ver tiempo de respuesta.

Ver errores.

---

# Gestión del Módulo +18

Habilitar.

Deshabilitar.

Asignar permisos.

Ver usuarios autorizados.

Ocultar contenido.

---

# Gestión de Temas

Crear nuevos temas.

Editar colores.

Editar fuentes.

Editar iconos.

Vista previa.

---

# Gestión de Storage

Ver uso.

Eliminar archivos.

Optimizar imágenes.

Reindexar.

---

# Gestión de Cache

Vaciar cache.

Reconstruir cache.

Actualizar datos.

Sincronizar proveedores.

---

# Logs

Registrar:

Login.

Logout.

CRUD.

Errores.

Cambios de rol.

Cambios de configuración.

Nunca permitir borrar logs.

---

# Auditoría

Registrar:

Usuario.

Acción.

Fecha.

IP (si aplica).

Dispositivo.

Resultado.

---

# Estadísticas

Usuarios activos.

Animes vistos.

Tiempo reproducido.

Series más populares.

Personajes favoritos.

Temas usados.

Dispositivos.

---

# Responsive

El Panel debe funcionar completamente en:

Desktop.

Tablet.

Mobile.

En móviles:

Las tablas deben convertirse en tarjetas.

---

# Seguridad

Toda acción debe validarse:

Frontend.

Backend.

RLS.

Nunca confiar únicamente en React.

---

# Roles

## Super Admin

Acceso total.

Puede modificar todo.

Puede crear administradores.

Puede eliminar administradores.

Puede cambiar configuraciones globales.

Puede gestionar el módulo +18.

Puede administrar APIs.

---

## Admin

Puede administrar contenido.

Noticias.

Animes.

Episodios.

Personajes.

Comentarios.

No puede modificar Super Admin.

No puede cambiar configuraciones críticas.

---

## Usuario

Nunca puede entrar al Panel.

---

## Invitado

Nunca puede entrar al Panel.

---

# Diseño

Colores oscuros.

Glassmorphism.

Sidebar fija.

Animaciones suaves.

Cards modernas.

Tablas elegantes.

Skeletons.

Sin pantallas vacías.

---

# Claude Rules

Nunca mezclar componentes públicos con el Panel.

Nunca permitir que Admin modifique Super Admin.

Nunca eliminar registros críticos sin confirmación.

Todo CRUD debe pasar por Services.

Toda seguridad debe existir también mediante RLS.

Nunca llamar Supabase directamente desde un componente del Panel.

Siempre reutilizar componentes.

---

# Mejoras futuras

Sistema de plugins.

Importar anime desde MAL.

Importar desde AniList.

Importar temporadas completas.

Editor visual de Landing.

Programación de publicaciones.

Gestión de banners dinámicos.

Analytics avanzados.

Panel multi idioma.

---

# Objetivo Final

El Panel de Administración debe ser capaz de gestionar AnimeCLZ sin necesidad de modificar el código fuente.

Todo el contenido del sitio debe poder administrarse desde aquí.

El Panel debe convertirse en el verdadero cerebro de AnimeCLZ.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [03 Database](03_DATABASE.md) · [04 Authentication](04_AUTHENTICATION.md) · [12 Security](12_SECURITY.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [07 Player System](07_PLAYER_SYSTEM.md) | [INDEX.md](INDEX.md) | [09 UI / UX Design System](09_UI_UX_DESIGN_SYSTEM.md) |
