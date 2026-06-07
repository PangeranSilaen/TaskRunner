-- =====================================================================
-- Phase 3 — Tasks core: table + public_code + RLS + business functions
-- =====================================================================

create sequence if not exists public.task_code_seq start 1;

create table public.tasks (
  id                 uuid primary key default gen_random_uuid(),
  public_code        text not null unique default ('TRK-' || lpad(nextval('public.task_code_seq')::text, 5, '0')),
  customer_id        uuid not null references public.profiles(id) on delete cascade,
  runner_id          uuid references public.profiles(id) on delete set null,
  title              text not null,
  description        text not null,
  category           text not null,
  location_name      text not null,
  latitude           double precision,
  longitude          double precision,
  distance_label     text,
  task_type          text not null check (task_type in ('regular','urgent')),
  runner_fee         integer not null,
  platform_fee       integer not null,
  total_fee          integer not null,
  payment_method     text not null check (payment_method in ('cash','transfer')),
  payment_status     text not null default 'unpaid',
  status             text not null default 'waiting_runner'
                       check (status in ('waiting_runner','accepted','in_progress','completed','cancelled')),
  cancellation_reason text,
  cancelled_by       uuid references public.profiles(id),
  created_at         timestamptz not null default now(),
  accepted_at        timestamptz,
  started_at         timestamptz,
  completed_at       timestamptz,
  cancelled_at       timestamptz
);

create index tasks_status_idx on public.tasks(status);
create index tasks_customer_idx on public.tasks(customer_id);
create index tasks_runner_idx on public.tasks(runner_id);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- Helper: does the current user already have an active runner task?
create or replace function public.has_active_runner_task()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.tasks
    where runner_id = auth.uid()
      and status in ('accepted','in_progress')
  );
$$;
revoke execute on function public.has_active_runner_task() from anon;

alter table public.tasks enable row level security;

-- SELECT: owner customer, assigned runner, available tasks for verified users, admin
create policy "Tasks: customer reads own"
  on public.tasks for select
  using (auth.uid() = customer_id);

create policy "Tasks: runner reads assigned"
  on public.tasks for select
  using (auth.uid() = runner_id);

create policy "Tasks: verified read available"
  on public.tasks for select
  using (status = 'waiting_runner' and public.is_verified());

create policy "Tasks: admin reads all"
  on public.tasks for select
  using (public.is_admin());

-- INSERT: verified customers only, for themselves
create policy "Tasks: verified customer insert"
  on public.tasks for insert
  with check (auth.uid() = customer_id and public.is_verified());

-- UPDATE: customer owner (cancel/complete), admin (force cancel)
create policy "Tasks: customer update own"
  on public.tasks for update
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

create policy "Tasks: runner update assigned"
  on public.tasks for update
  using (auth.uid() = runner_id)
  with check (auth.uid() = runner_id);

create policy "Tasks: admin update any"
  on public.tasks for update
  using (public.is_admin())
  with check (public.is_admin());
