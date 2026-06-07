-- =====================================================================
-- Phase 5 — ratings + runner_profiles + availability sessions + triggers
-- =====================================================================

-- ---------------------------------------------------------------------
-- runner_profiles: aggregate stats per runner
-- ---------------------------------------------------------------------
create table public.runner_profiles (
  user_id             uuid primary key references public.profiles(id) on delete cascade,
  average_rating      numeric not null default 0,
  completed_tasks     integer not null default 0,
  total_earnings      integer not null default 0,
  active_hours        numeric not null default 0,
  availability_status boolean not null default false,
  last_active_at      timestamptz,
  updated_at          timestamptz not null default now()
);

create trigger runner_profiles_set_updated_at
  before update on public.runner_profiles
  for each row execute function public.handle_updated_at();

alter table public.runner_profiles enable row level security;

-- Public read (needed for "runner terdekat" and runner info on tasks)
create policy "Runner profiles: public read"
  on public.runner_profiles for select
  using (true);

create policy "Runner profiles: update own"
  on public.runner_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Runner profiles: insert own"
  on public.runner_profiles for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- ratings: customer -> runner, one per task
-- ---------------------------------------------------------------------
create table public.ratings (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null unique references public.tasks(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  runner_id   uuid not null references public.profiles(id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  review      text,
  created_at  timestamptz not null default now()
);

create index ratings_runner_idx on public.ratings(runner_id);

alter table public.ratings enable row level security;

-- Read: participants + public aggregate is via runner_profiles; allow read of own
create policy "Ratings: read related"
  on public.ratings for select
  using (auth.uid() = customer_id or auth.uid() = runner_id);

-- Insert: only the customer of a completed task
create policy "Ratings: customer insert on completed"
  on public.ratings for insert
  with check (
    auth.uid() = customer_id
    and exists (
      select 1 from public.tasks t
      where t.id = task_id
        and t.customer_id = auth.uid()
        and t.runner_id = ratings.runner_id
        and t.status = 'completed'
    )
  );

revoke select, insert, update, delete on public.ratings from anon;

-- ---------------------------------------------------------------------
-- runner_availability_sessions (lightweight active-hours tracking)
-- ---------------------------------------------------------------------
create table public.runner_availability_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at   timestamptz
);

alter table public.runner_availability_sessions enable row level security;

create policy "Sessions: manage own"
  on public.runner_availability_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke select, insert, update, delete on public.runner_availability_sessions from anon;

-- ---------------------------------------------------------------------
-- Trigger: when a task becomes completed, update runner stats
-- ---------------------------------------------------------------------
create or replace function public.on_task_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and old.status <> 'completed' and new.runner_id is not null then
    insert into public.runner_profiles (user_id, completed_tasks, total_earnings)
    values (new.runner_id, 1, new.runner_fee)
    on conflict (user_id) do update
      set completed_tasks = public.runner_profiles.completed_tasks + 1,
          total_earnings = public.runner_profiles.total_earnings + new.runner_fee,
          updated_at = now();
  end if;
  return new;
end;
$$;

create trigger tasks_on_completed
  after update on public.tasks
  for each row execute function public.on_task_completed();

-- ---------------------------------------------------------------------
-- Trigger: when a rating is inserted, recompute runner average
-- ---------------------------------------------------------------------
create or replace function public.on_rating_inserted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avg numeric;
begin
  select avg(rating)::numeric(3,2) into v_avg
    from public.ratings where runner_id = new.runner_id;

  insert into public.runner_profiles (user_id, average_rating)
  values (new.runner_id, coalesce(v_avg, 0))
  on conflict (user_id) do update
    set average_rating = coalesce(v_avg, 0), updated_at = now();
  return new;
end;
$$;

create trigger ratings_after_insert
  after insert on public.ratings
  for each row execute function public.on_rating_inserted();
