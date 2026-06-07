-- =====================================================================
-- Task Runner — Phase 1 Foundation: profiles + auth trigger + RLS
-- =====================================================================

-- Helper: keep updated_at fresh
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles: extra user data beyond Supabase Auth
-- ---------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text not null default '',
  email               text not null,
  phone_number        text,
  avatar_url          text,
  role                text not null default 'user'
                        check (role in ('user', 'admin')),
  verification_status text not null default 'incomplete'
                        check (verification_status in ('incomplete', 'pending', 'verified', 'rejected')),
  is_runner_enabled   boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.profiles is 'User profile data; one row per auth user.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Admin check helper (SECURITY DEFINER avoids RLS recursion)
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "Profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles: read all as admin"
  on public.profiles for select
  using (public.is_admin());

create policy "Profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Profiles: admin can update any"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());
