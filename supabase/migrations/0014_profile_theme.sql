-- Sistema de temas (v1.0, ver constants/index.js THEMES y styles/index.css)
-- — preferencia por PERFIL (no por cuenta), igual que avatar/color/nombre,
-- consistente con que cada perfil de una cuenta ya personaliza su propia
-- identidad visual (ver migración 0009).
alter table public.profiles_account
  add column if not exists tema text not null default 'original'
    check (tema in (
      'original', 'purple-night', 'ocean-blue', 'sakura-pink',
      'emerald', 'sunset-orange', 'cyber-neon'
    ));
