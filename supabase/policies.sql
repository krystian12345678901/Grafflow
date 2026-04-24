-- Minimalny baseline RLS pod Supabase

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'ORGANIZATION',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy if not exists "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy if not exists "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy if not exists "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
