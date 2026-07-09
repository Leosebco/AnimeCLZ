# Migraciones — AnimeCLZ

Estos archivos SQL no se ejecutaron contra ningún proyecto (no hay uno real todavía). Para aplicarlos:

- **Supabase CLI:** `supabase link --project-ref <tu-proyecto>` y luego `supabase db push`.
- **Dashboard:** pegar cada archivo, en orden (0001 → 0010), en el SQL Editor del proyecto.

Requiere que el proyecto tenga la extensión `pgcrypto`/`pgsodium` habilitada para `gen_random_uuid()` (viene activada por defecto en Supabase).

Orden y contenido:

1. `0001_profiles.sql` — perfil público por usuario + trigger de creación automática al registrarse.
2. `0002_favorites.sql` — "Favoritos" (♥).
3. `0003_watch_later.sql` — "Mi Lista" (ver más tarde).
4. `0004_watch_history.sql` — progreso de reproducción, para "Continuar viendo" (sin interfaz aún — no hay reproductor).
5. `0005_ratings.sql` — calificaciones propias de AnimeCLZ (sin interfaz aún).
6. `0006_comments.sql` — comentarios por anime, con respuestas anidadas (sin interfaz aún).
7. `0007_notifications.sql` — notificaciones por usuario (sin interfaz aún; sin política de `insert` para `authenticated` a propósito, se crean desde el backend/service role).
8. `0008_profiles_roles.sql` — columna `role` en `profiles` (admin/editor/moderador/usuario) + trigger que impide autoasignarse un rol superior.
9. `0009_profiles_account.sql` — perfiles múltiples por cuenta (estilo Netflix, tabla `profiles_account`): rol por perfil, trigger de protección de rol análogo al de `profiles`, auto-creación del primer perfil al registrarse, y sincronización del perfil más antiguo cuando la cuenta se vuelve admin.
10. `0010_avatar_storage.sql` — bucket de Storage `avatars` (lectura pública, escritura solo en la propia carpeta `{account_id}/...`) para la opción "Subir imagen propia" del selector de avatar.

Todas las tablas tienen Row Level Security activado: cada usuario solo puede leer/escribir sus propias filas (`auth.uid() = user_id` o `account_id`), salvo `profiles`, `ratings` y `comments`, que son de lectura pública (perfil, calificaciones y comentarios visibles para cualquier usuario autenticado) pero de escritura solo propia.
