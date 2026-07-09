-- Causa raíz de "no pudimos cargar esta sección" en el selector de
-- perfiles (y, sin esto, en Favoritos/Mi Lista/Historial/Comentarios/
-- Calificaciones también): las migraciones 0001-0010 se aplicaron vía
-- `supabase db push`, que conecta a través del pooler bajo un rol
-- distinto de aquel para el que el proyecto tiene configurados los
-- privilegios por defecto — así que ninguna tabla nueva heredó el
-- `GRANT` habitual hacia `authenticated`/`anon`. RLS solo restringe FILAS
-- sobre privilegios que ya deben existir; sin el GRANT de tabla, Postgres
-- rechaza la consulta antes de siquiera evaluar las policies. Verificado
-- con `information_schema.role_table_grants`: cada tabla tenía únicamente
-- REFERENCES/TRIGGER/TRUNCATE para `authenticated`, nunca
-- SELECT/INSERT/UPDATE/DELETE.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles_account to authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.watch_later to authenticated;
grant select, insert, update, delete on public.watch_history to authenticated;
grant select, insert, update, delete on public.ratings to authenticated;
grant select, insert, update, delete on public.comments to authenticated;
grant select, update, delete on public.notifications to authenticated;

-- Bug latente aparte, encontrado al revisar esto: favoritesService/
-- watchLaterService usan `upsert(...)` (ver collectionService.js), que
-- Postgres compila como INSERT ... ON CONFLICT DO UPDATE — eso exige
-- privilegio (y policy) de UPDATE aunque el conflicto nunca llegue a
-- ocurrir en tiempo de ejecución. Las migraciones 0002/0003 nunca
-- crearon una policy de UPDATE para `favorites`/`watch_later` (no hacía
-- falta para el diseño original de "agregar/quitar"), así que agregar
-- cualquier anime a Favoritos o Mi Lista habría fallado con el mismo
-- error genérico apenas se probara, incluso con el GRANT de arriba ya
-- puesto.
create policy "Cada usuario actualiza únicamente sus propios favoritos"
  on public.favorites for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Cada usuario actualiza únicamente su propia Mi Lista"
  on public.watch_later for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
