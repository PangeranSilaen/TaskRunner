-- =====================================================================
-- Phase 2 — Verification: verification_requests + RLS + helpers
-- =====================================================================

-- Helper: is the current user verified?
create or replace function public.is_verified()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and verification_status = 'verified'
  );
$$;
revoke execute on function public.is_verified() from anon;

create table public.verification_requests (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references public.profiles(id) on delete cascade,
  campus_email     text not null,
  phone_number     text not null,
  ktm_photo_url    text,
  status           text not null default 'pending'
                     check (status in ('pending', 'verified', 'rejected')),
  rejection_reason text,
  reviewed_by      uuid references public.profiles(id),
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger verification_requests_set_updated_at
  before update on public.verification_requests
  for each row execute function public.handle_updated_at();

alter table public.verification_requests enable row level security;

create policy "Verif: read own"
  on public.verification_requests for select
  using (auth.uid() = user_id);

create policy "Verif: admin read all"
  on public.verification_requests for select
  using (public.is_admin());

create policy "Verif: insert own"
  on public.verification_requests for insert
  with check (auth.uid() = user_id);

create policy "Verif: update own"
  on public.verification_requests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Verif: admin update any"
  on public.verification_requests for update
  using (public.is_admin())
  with check (public.is_admin());
