-- =====================================================================
-- Phase 4 — task_messages (chat) + payment_records + RLS + realtime
-- =====================================================================

-- Helper: is the current user a participant of a task (customer or runner)?
create or replace function public.is_task_participant(p_task_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.tasks t
    where t.id = p_task_id
      and (t.customer_id = auth.uid() or t.runner_id = auth.uid())
  );
$$;
revoke execute on function public.is_task_participant(uuid) from anon;

-- ---------------------------------------------------------------------
-- task_messages
-- ---------------------------------------------------------------------
create table public.task_messages (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  sender_id  uuid not null references public.profiles(id) on delete cascade,
  message    text not null,
  created_at timestamptz not null default now()
);

create index task_messages_task_idx on public.task_messages(task_id, created_at);

alter table public.task_messages enable row level security;

-- Read: only participants of the task
create policy "Chat: participants read"
  on public.task_messages for select
  using (public.is_task_participant(task_id));

-- Insert: only a participant, and only as themselves; chat active after accepted
create policy "Chat: participants send"
  on public.task_messages for insert
  with check (
    sender_id = auth.uid()
    and public.is_task_participant(task_id)
    and exists (
      select 1 from public.tasks t
      where t.id = task_id and t.status <> 'waiting_runner'
    )
  );

revoke select, insert, update, delete on public.task_messages from anon;

-- ---------------------------------------------------------------------
-- payment_records
-- ---------------------------------------------------------------------
create table public.payment_records (
  id                  uuid primary key default gen_random_uuid(),
  task_id             uuid not null unique references public.tasks(id) on delete cascade,
  method              text not null check (method in ('cash','transfer')),
  status              text not null default 'unpaid',
  proof_url           text,
  runner_confirmed_at timestamptz,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger payment_records_set_updated_at
  before update on public.payment_records
  for each row execute function public.handle_updated_at();

alter table public.payment_records enable row level security;

create policy "Payments: participants read"
  on public.payment_records for select
  using (public.is_task_participant(task_id) or public.is_admin());

create policy "Payments: participants insert"
  on public.payment_records for insert
  with check (public.is_task_participant(task_id));

create policy "Payments: participants update"
  on public.payment_records for update
  using (public.is_task_participant(task_id))
  with check (public.is_task_participant(task_id));

revoke select, insert, update, delete on public.payment_records from anon;

-- ---------------------------------------------------------------------
-- Realtime: stream chat messages
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.task_messages;
