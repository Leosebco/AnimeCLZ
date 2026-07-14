-- "Reproducir siguiente episodio automáticamente" (v2.1 — Sistema de
-- reproducción). Mismo patrón que `tema`/`fondo` (0014/0020): columna en
-- `profiles_account`, editable desde Configuración vía
-- `useProfile().updateProfile(id, { autoplay })` directo, sin contexto
-- nuevo. Booleano simple, sin CHECK necesario. Default `true`: coincide
-- con el comportamiento pedido ("cuando termine un episodio... reproducir
-- automáticamente") salvo que el usuario lo desactive explícitamente.
alter table public.profiles_account
  add column if not exists autoplay boolean not null default true;
