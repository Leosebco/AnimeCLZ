-- "Fondo" del perfil (v1.5) — acento decorativo detrás del avatar en el
-- selector de perfiles y en el encabezado de "Mi Perfil". Deliberadamente
-- NO reemplaza el fondo de toda la app (eso sigue siendo responsabilidad
-- exclusiva del sistema de Temas, ver 0014) — confirmado con el usuario.
-- Mismo patrón que `tema`: un id fijo validado por CHECK, sin imágenes
-- externas (gradientes CSS puros, ver constants/index.js PROFILE_BACKGROUNDS
-- — no se fabrica/licencia arte de anime que no existe).
alter table public.profiles_account
  add column if not exists fondo text not null default 'none'
    check (fondo in (
      'none', 'sakura', 'cyber-noche', 'fuego-shonen', 'oceano-ghibli',
      'aurora-magica', 'bosque-encantado', 'medianoche-estelar'
    ));
