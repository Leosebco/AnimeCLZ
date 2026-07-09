-- Bucket de Supabase Storage para avatares subidos por el usuario (opción
-- "Subir imagen propia" del selector de avatar, ver AvatarPicker.jsx).
-- Público de lectura (las imágenes se muestran en toda la app sin sesión,
-- p. ej. en tarjetas de comentarios más adelante); solo el dueño puede
-- escribir dentro de su propia carpeta ({account_id}/...).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Los avatares son públicos para leer"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "Cada cuenta sube únicamente a su propia carpeta"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Cada cuenta reemplaza únicamente sus propios avatares"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Cada cuenta elimina únicamente sus propios avatares"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
