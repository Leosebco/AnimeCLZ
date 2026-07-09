-- Perfil público de cada usuario autenticado. Un perfil por usuario,
-- creado automáticamente al registrarse (trigger sobre auth.users).
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  username text,
  avatar text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Los perfiles son visibles para cualquier usuario autenticado"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Cada usuario edita únicamente su propio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Cada usuario crea únicamente su propio perfil"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Crea el perfil automáticamente cuando alguien se registra, así el
-- frontend nunca necesita un paso adicional de "crear perfil" tras el
-- signup (username por defecto: la parte local del email).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
