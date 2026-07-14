# 05 - PROFILE SYSTEM

---

# Introducción

El sistema de perfiles es uno de los pilares principales de AnimeCLZ.

Toda la experiencia del usuario gira alrededor de un perfil activo.

Una cuenta representa a una persona.

Un perfil representa una identidad dentro de esa cuenta.

Toda la información personalizada pertenece al perfil, no a la cuenta.

---

# Filosofía

Una cuenta puede ser compartida entre varias personas.

Cada perfil debe sentirse completamente independiente.

Cada perfil posee:

• Favoritos
• Historial
• Continuar viendo
• Mi Lista
• Avatar
• Fondo
• Tema
• Configuración
• Permisos
• Restricciones

Nunca compartir estos datos entre perfiles.

---

# Arquitectura

```

Supabase Auth
│
▼
Cuenta
│
├──────────────┐
│              │
▼              ▼
Perfil 1     Perfil 2
│              │
▼              ▼
Favoritos   Favoritos

Historial   Historial

Mi Lista    Mi Lista

Tema         Tema

Avatar       Avatar

```

---

# Flujo completo

Login

↓

Cuenta

↓

Buscar perfiles

↓

¿Existe perfil activo?

↓

Sí

↓

Home

↓

No

↓

Selector de perfiles

↓

Seleccionar

↓

Guardar perfil activo

↓

Home

---

# Máximo de perfiles

Cada cuenta puede tener:

Máximo: **4 perfiles**

Nunca permitir crear un quinto.

Esta regla debe existir:

Frontend

Backend

Base de datos

Trigger PostgreSQL

Nunca depender solamente del frontend.

---

# Tipos de perfil

super_admin

admin

usuario

invitado

adult

El rol pertenece al perfil.

No a la cuenta.

---

# Perfil Principal

La cuenta tiene únicamente un perfil principal.

Normalmente:

Super Admin

o

Administrador

Nunca permitir eliminarlo accidentalmente.

---

# Crear Perfil

Proceso

Usuario

↓

Botón Crear Perfil

↓

Formulario

↓

Nombre

↓

Avatar

↓

Fondo

↓

Tema

↓

Guardar

↓

Actualizar lista

↓

NO navegar automáticamente

↓

Usuario selecciona el perfil

---

# Reglas

Nombre obligatorio.

Máximo 25 caracteres.

Sin caracteres inválidos.

No duplicar nombres dentro de la misma cuenta.

---

# Avatar

Cada perfil puede utilizar:

Imagen subida.

Imagen desde Storage.

Personaje de anime.

Iniciales.

Avatar por defecto.

---

# Avatar desde anime

Debe existir un buscador.

Puede buscar:

Nombre del anime.

o

Nombre del personaje.

Ejemplo

Naruto

↓

Naruto Uzumaki

Sasuke

Kakashi

Hinata

Seleccionar

↓

Guardar URL

Nunca guardar la imagen local.

Guardar únicamente la URL.

---

# Avatar personalizado

El usuario puede subir:

PNG

JPG

WEBP

AVIF

Máximo:

5 MB

La imagen debe almacenarse en:

Storage

avatars/

---

# Fondos

Cada perfil posee un fondo.

Tipos

Gradientes

Imagen

Color

Anime

Video (futuro)

---

# Temas

Cada perfil tiene su propio tema.

Ejemplos

AnimeCLZ

Cyberpunk

Tokyo Night

Glass

Minimal

Emerald

Netflix

Neon

Midnight

---

# Tema

El tema debe aplicarse inmediatamente.

Nunca requerir recargar.

Persistir automáticamente.

---

# Fondo

El fondo debe aplicarse únicamente:

Al perfil activo.

Nunca modificar otros perfiles.

---

# Favoritos

Cada perfil tiene sus propios favoritos.

Nunca compartir.

---

# Historial

Cada perfil posee historial independiente.

Al cambiar perfil:

Cambia completamente.

---

# Continuar viendo

Depende del perfil.

No de la cuenta.

---

# Mi Lista

Depende del perfil.

Nunca compartir.

---

# Configuración

Cada perfil almacena:

Tema.

Idioma.

Adult.

Autoplay.

Calidad.

Subtítulos.

Color.

Fondo.

---

# Selector de perfiles

Debe mostrarse únicamente cuando:

Primer login.

Cambiar perfil.

30 minutos de inactividad.

Nunca:

F5.

Volver Home.

Cambiar página.

---

# Persistencia

Guardar:

profile_id

Última actividad.

Nada más.

Nunca guardar favoritos.

---

# Cambiar Perfil

Proceso

Usuario

↓

Cambiar Perfil

↓

Guardar estado

↓

Actualizar Context

↓

Recargar datos

↓

Home

Nunca cerrar sesión.

---

# Editar Perfil

Debe permitir modificar:

Nombre.

Avatar.

Fondo.

Tema.

Idioma.

Adult.

Nunca modificar el rol.

Solo administrador.

---

# Eliminar Perfil

Nunca eliminar:

El último perfil.

El perfil activo del Super Admin.

El perfil con permisos elevados.

Siempre solicitar confirmación.

Eliminar también:

Favoritos.

Historial.

Mi Lista.

Configuraciones.

Notificaciones.

---

# Seguridad

Cada perfil pertenece a una sola cuenta.

Nunca permitir acceder al profile_id de otra cuenta.

Toda validación debe existir mediante RLS.

---

# Performance

La lista de perfiles debe cargarse una sola vez.

No consultar continuamente.

Usar Context.

---

# Animaciones

El selector debe utilizar:

Framer Motion.

Fade.

Scale.

Glassmorphism.

Hover.

Transiciones suaves.

Nunca movimientos exagerados.

---

# Responsive

Desktop.

Tablet.

Android.

iPhone.

Touch mínimo:

44px.

---

# UI

Cada tarjeta debe mostrar:

Avatar.

Nombre.

Rol.

Tema.

Editar.

Eliminar.

Nunca saturar la interfaz.

---

# Avatar Picker

Debe permitir:

Buscar anime.

Buscar personaje.

Subir imagen.

Elegir inicial.

Elegir avatar por defecto.

Vista previa.

---

# Claude Rules

Nunca romper:

Límite de 4 perfiles.

Persistencia.

Selector.

Favoritos por perfil.

Historial por perfil.

Mi Lista por perfil.

Nunca volver a guardar favoritos por cuenta.

Nunca permitir más de un perfil Super Admin.

Nunca eliminar el perfil principal.

Nunca mostrar nuevamente el selector después de un F5.

Nunca seleccionar automáticamente un perfil recién creado.

Siempre dejar que el usuario lo seleccione.

---

# Mejoras futuras

PIN por perfil.

Perfiles infantiles.

Perfiles bloqueados.

Avatares animados.

Fondos animados.

Sincronización entre dispositivos.

Perfiles temporales.

Exportar configuración.

Importar configuración.

---

# Objetivo Final

El sistema de perfiles debe sentirse igual o mejor que Netflix.

Cada perfil debe ser completamente independiente.

El cambio entre perfiles debe ser inmediato.

La experiencia debe ser fluida.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [04 Authentication](04_AUTHENTICATION.md) · [03 Database](03_DATABASE.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [04 Authentication](04_AUTHENTICATION.md) | [INDEX.md](INDEX.md) | [06 Provider Manager](06_PROVIDER_MANAGER.md) |
