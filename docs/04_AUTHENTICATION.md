# 04 - AUTHENTICATION

---

# Introducción

Este documento define el sistema oficial de autenticación de AnimeCLZ.

Todo el sistema está construido sobre Supabase Authentication.

No se permite implementar autenticación propia.

Nunca almacenar contraseñas.

Nunca crear tablas de usuarios paralelas.

Toda identidad pertenece a Supabase Auth.

---

# Objetivos

El sistema debe permitir:

✔ Registro

✔ Inicio de sesión

✔ Cerrar sesión

✔ Recuperar contraseña

✔ Persistencia

✔ OAuth (Google)

✔ Selector de perfiles

✔ Roles

✔ Sesión por dispositivo

✔ Recordar perfil

✔ Expiración por inactividad

---

# Arquitectura

Usuario

↓

Supabase Auth

↓

AuthContext

↓

ProfileContext

↓

Home

Nunca una página debe consultar directamente Supabase.

Siempre mediante AuthContext.

---

# Flujo de Registro

Usuario

↓

Register.jsx

↓

authService.register()

↓

Supabase Auth

↓

Trigger PostgreSQL

↓

Crear Profile

↓

Crear Profile Account

↓

Login automático

↓

Selector de perfiles

↓

Home

---

# Flujo Login

Usuario

↓

Login.jsx

↓

authService.login()

↓

Supabase

↓

Session

↓

AuthContext

↓

ProfileContext

↓

Selector

↓

Home

---

# OAuth

Proveedor:

Google

Flujo

Usuario

↓

Google

↓

Supabase

↓

AuthContext

↓

ProfileContext

↓

Home

Nunca manejar manualmente los tokens OAuth.

---

# Recuperar contraseña

Usuario

↓

ForgotPassword

↓

Supabase

↓

Correo

↓

Reset Password

↓

Nueva contraseña

↓

Login

---

# Persistencia

Supabase mantiene automáticamente:

Access Token

Refresh Token

Session

Nunca implementar persistencia propia.

---

# AuthContext

Responsabilidad

Mantener:

user

session

loading

authenticated

login()

logout()

register()

resetPassword()

refresh()

Nunca guardar favoritos.

Nunca guardar perfiles.

Nunca guardar temas.

---

# ProfileContext

Responsabilidad

Perfil activo.

Lista de perfiles.

Cambiar perfil.

Crear perfil.

Eliminar perfil.

Editar perfil.

Tema.

Fondo.

Avatar.

Nunca manejar login.

---

# Separación

AuthContext

↓

Cuenta

ProfileContext

↓

Perfil

Nunca mezclarlos.

---

# Cuenta

Una cuenta puede tener:

Hasta 4 perfiles.

Ejemplo

Cuenta

↓

Leonardo

↓

Perfiles

Leonardo

Invitado

Pruebas

Niño

Cada perfil tiene:

Favoritos.

Historial.

Mi Lista.

Tema.

Avatar.

Fondo.

Permisos.

---

# Perfil Activo

Siempre existe un perfil activo.

Debe persistirse.

Nunca volver a preguntar mientras la sesión siga activa.

Solo mostrar selector cuando:

Primer login.

Cambiar perfil.

Cerrar sesión.

30 minutos de inactividad.

Nunca al hacer F5.

Nunca al navegar.

Nunca al volver al Home.

---

# Tiempo de Inactividad

30 minutos.

Heartbeat.

Si expira:

Guardar estado.

Mostrar selector.

No cerrar sesión.

---

# Cambio de Perfil

Usuario

↓

Cambiar Perfil

↓

ProfileContext

↓

Actualizar profile activo

↓

Recargar datos

↓

Home

Nunca cerrar sesión.

---

# Logout

Usuario

↓

Cerrar Sesión

↓

Eliminar perfil activo

↓

Cerrar sesión Supabase

↓

Landing

---

# Landing

Si NO existe sesión

Siempre mostrar Landing.

Nunca Home.

---

# Home

Si existe sesión

Mostrar Home.

Nunca Landing.

---

# Rutas

Públicas

Landing

Login

Register

Forgot Password

Reset Password

---

Protegidas

Home

Anime

Perfil

Favoritos

Mi Lista

Historial

Configuración

---

Administrador

Panel

CRUD

Noticias

Usuarios

Moderación

---

# Roles

super_admin

Control total.

admin

CRUD contenido.

usuario

Visualización.

invitado

Solo lectura.

adult

Permiso adicional.

---

# Verificación

Cada navegación protegida debe validar:

Existe sesión.

Existe perfil.

Perfil activo.

Permisos.

---

# Refresh Token

Supabase lo administra.

Nunca implementar uno manual.

---

# Errores

Nunca mostrar errores técnicos.

Incorrecto

Error 500.

Correcto

"No pudimos iniciar sesión."

---

# Loading

Siempre mostrar Skeleton.

Nunca pantalla blanca.

Nunca spinner infinito.

---

# Seguridad

Nunca guardar tokens en LocalStorage manualmente.

Nunca exponer Service Role.

Nunca modificar JWT.

Nunca confiar únicamente en el frontend.

Toda seguridad debe existir también mediante RLS.

---

# RLS

El frontend solo mejora la experiencia.

La seguridad real vive en PostgreSQL.

Nunca depender únicamente del cliente.

---

# ProtectedRoute

Todas las rutas privadas deben pasar por:

ProtectedRoute

Verificar

Sesión

Perfil

Rol

Permisos

---

# AdminRoute

Debe validar:

Sesión.

Perfil.

Rol.

No solamente Auth.

---

# Cambiar Cuenta

Cerrar sesión.

Eliminar perfil activo.

Eliminar cache.

Ir Landing.

---

# Recordar Perfil

Guardar únicamente:

profile_id

Nunca favoritos.

Nunca historial.

Nunca datos sensibles.

---

# Multi dispositivo

Cada dispositivo mantiene:

Su sesión.

Su perfil.

Su cache.

Independientes.

---

# Objetivo

El usuario solo debe iniciar sesión una vez.

Después únicamente cambia de perfil cuando él lo decida o después del tiempo de inactividad.

Nunca interrumpir innecesariamente la experiencia.

---

# Reglas para Claude

Nunca modificar AuthContext sin revisar ProfileContext.

Nunca modificar ProfileContext sin revisar AuthContext.

Nunca romper el flujo Login → Perfil → Home.

Nunca volver a mostrar el selector después de un simple F5.

Nunca guardar información sensible fuera de Supabase.

Toda nueva funcionalidad debe respetar este flujo.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [05 Profile System](05_PROFILE_SYSTEM.md) · [03 Database](03_DATABASE.md) · [12 Security](12_SECURITY.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [03 Database](03_DATABASE.md) | [INDEX.md](INDEX.md) | [05 Profile System](05_PROFILE_SYSTEM.md) |
