# 12 - SECURITY

---

# Introducción

La seguridad de AnimeCLZ no depende únicamente del frontend.

Toda validación importante debe existir también en el backend mediante Supabase y Row Level Security (RLS).

El frontend mejora la experiencia del usuario.

El backend garantiza la seguridad.

Nunca confiar únicamente en React.

---

# Filosofía

Todo dato recibido del cliente debe considerarse potencialmente malicioso.

Toda operación debe validarse nuevamente en el servidor.

Nunca asumir que el frontend es confiable.

---

# Objetivos

Garantizar:

✔ Protección de cuentas

✔ Protección de perfiles

✔ Protección del Panel Admin

✔ Protección del módulo +18

✔ Protección de Storage

✔ Protección de APIs

✔ Protección de datos

✔ Protección de contenido privado

---

# Arquitectura

```

Cliente

↓

React

↓

Services

↓

Supabase

↓

Policies (RLS)

↓

Base de Datos

```

---

# Principios

Nunca confiar en:

Inputs.

IDs.

Roles enviados desde React.

profile_id.

user_id.

Cookies manipuladas.

LocalStorage.

---

# Autenticación

Toda autenticación será administrada por:

Supabase Auth.

Nunca implementar autenticación propia.

---

# Tokens

Utilizar únicamente:

JWT de Supabase.

Nunca almacenar tokens manualmente.

Nunca modificar el JWT.

---

# Roles

Los permisos pertenecen al perfil.

No a la cuenta.

Roles oficiales:

Super Admin

Admin

Usuario

Invitado

Adult

---

# Verificación de Rol

Siempre validar:

Frontend.

↓

Backend.

↓

RLS.

Nunca depender solo de ocultar botones.

---

# Row Level Security

Todas las tablas deben tener:

RLS habilitado.

Políticas explícitas.

Nunca dejar tablas públicas por error.

---

# Policies

Cada operación debe definir:

SELECT

INSERT

UPDATE

DELETE

Nunca utilizar políticas genéricas sin revisar.

---

# Storage

Buckets privados por defecto.

Buckets públicos solo cuando sea necesario.

Ejemplo:

avatars/

Puede ser público.

Contenido privado:

No.

---

# Validación

Todo input debe validarse:

Frontend.

Backend.

Base de datos.

---

# Sanitización

Escapar caracteres especiales.

Eliminar HTML cuando no sea permitido.

Nunca renderizar contenido HTML sin sanitizar.

---

# Protección XSS

Nunca utilizar:

dangerouslySetInnerHTML

Salvo casos excepcionales y con contenido completamente sanitizado.

---

# Protección CSRF

Utilizar mecanismos propios de Supabase.

No implementar soluciones caseras.

---

# Protección SQL Injection

Nunca construir consultas SQL manualmente.

Utilizar únicamente el cliente oficial de Supabase.

---

# Protección contra fuerza bruta

Limitar:

Intentos de login.

Intentos de recuperación.

Intentos de registro.

---

# Rate Limiting

Aplicar límites a:

Login.

Registro.

Cambio de contraseña.

Búsquedas intensivas.

Operaciones administrativas.

---

# CORS

Permitir únicamente:

Dominios autorizados.

Nunca usar "*".

---

# Content Security Policy

Definir una CSP estricta.

Permitir únicamente:

Supabase.

AniList.

Jikan.

AnimeThemes.

TMDB.

Dominios propios.

---

# Variables de Entorno

Nunca subir:

API Keys.

Secrets.

JWT privados.

Tokens de administrador.

Todo secreto debe vivir en:

.env

Variables de Vercel

Secrets de Supabase

---

# Logs

Registrar:

Inicio de sesión.

Cierre de sesión.

Errores críticos.

Cambios de rol.

Cambios de configuración.

Intentos fallidos.

Nunca registrar contraseñas.

Nunca registrar tokens.

---

# Auditoría

Toda acción importante debe registrar:

Usuario.

Perfil.

Fecha.

Acción.

Resultado.

---

# Protección del Panel

El Panel Admin nunca debe depender únicamente del menú.

Aunque un usuario escriba manualmente la URL:

Debe verificarse el rol.

---

# Protección de Perfiles

Un perfil solo puede acceder a:

Sus favoritos.

Su historial.

Su lista.

Su configuración.

Nunca a los datos de otro perfil.

---

# Protección del módulo +18

El contenido +18 debe requerir:

Permiso explícito.

Edad configurada.

Rol autorizado.

Nunca mostrarse por accidente.

---

# Eliminación

Antes de eliminar:

Mostrar confirmación.

Validar permisos.

Registrar auditoría.

Eliminar relaciones cuando corresponda.

---

# Backups

Realizar copias periódicas de:

Base de datos.

Storage.

Configuraciones.

---

# Dependencias

Mantener librerías actualizadas.

Eliminar dependencias sin uso.

Revisar vulnerabilidades periódicamente.

---

# Seguridad en APIs

Toda comunicación debe realizarse mediante HTTPS.

Nunca usar HTTP en producción.

---

# Responsive

La seguridad nunca cambia por dispositivo.

Las mismas reglas aplican para:

Desktop.

Android.

iPhone.

PWA.

---

# Claude Rules

Nunca confiar en datos provenientes del frontend.

Nunca eliminar políticas RLS sin justificación.

Nunca almacenar información sensible en LocalStorage.

Nunca exponer claves privadas.

Nunca usar consultas SQL construidas manualmente.

Toda operación crítica debe validarse también en el backend.

Siempre registrar acciones administrativas importantes.

---

# Mejoras Futuras

Autenticación multifactor (MFA).

Inicio de sesión con Passkeys.

Notificaciones de nuevos dispositivos.

Sesiones activas por dispositivo.

Detección de actividad sospechosa.

Panel de auditoría avanzado.

Cifrado de datos sensibles.

---

# Objetivo Final

AnimeCLZ debe mantener una arquitectura segura donde la protección no dependa del cliente, sino de políticas claras en Supabase, una correcta gestión de permisos y buenas prácticas de desarrollo.

---

FIN DEL DOCUMENTO

---

## Navegación

**Documentos relacionados:** [03 Database](03_DATABASE.md) · [04 Authentication](04_AUTHENTICATION.md) · [08 Admin Panel](08_ADMIN_PANEL.md)

| Anterior | Índice | Siguiente |
|---|---|---|
| [11 Search Engine](11_SEARCH_ENGINE.md) | [INDEX.md](INDEX.md) | [13 Performance](13_PERFORMANCE.md) |
