-- Duración total del clip/episodio visto (v2.1 — Sistema de reproducción).
-- Nullable a propósito: ni AnimeThemes ni Jikan reportan una duración real
-- por episodio — la escribe el cliente desde `<video>.duration` una vez
-- cargado el video real, nunca se inventa. Sin CHECK (es un dato numérico
-- libre, no un enum); sin cambios de RLS (es a nivel de fila, ya cubierto
-- por las policies de 0004/0021).
alter table public.watch_history
  add column if not exists duration_seconds integer;
