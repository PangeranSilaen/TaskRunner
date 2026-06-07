-- =====================================================================
-- Phase 6 — notifications + reports + triggers + realtime
-- =====================================================================

create table public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  type            text not null,
  title           text not null,
  body            text not null,
  related_task_id uuid references public.tasks(id) on delete set null,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Notif: read own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Notif: update own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke select, insert, update, delete on public.notifications from anon;

-- Internal helper to push a notification (SECURITY DEFINER bypasses RLS insert)
create or replace function public.push_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_task_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, related_task_id)
  values (p_user_id, p_type, p_title, p_body, p_task_id);
end;
$$;
revoke execute on function public.push_notification(uuid, text, text, text, uuid) from anon, authenticated;

-- ---------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------
create table public.reports (
  id               uuid primary key default gen_random_uuid(),
  task_id          uuid references public.tasks(id) on delete set null,
  reporter_id      uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  reason           text not null,
  description      text,
  status           text not null default 'open' check (status in ('open','in_progress','resolved')),
  admin_notes      text,
  created_at       timestamptz not null default now(),
  resolved_at      timestamptz
);

alter table public.reports enable row level security;

create policy "Reports: reporter insert"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Reports: reporter read own"
  on public.reports for select
  using (auth.uid() = reporter_id);

create policy "Reports: admin read all"
  on public.reports for select
  using (public.is_admin());

create policy "Reports: admin update"
  on public.reports for update
  using (public.is_admin())
  with check (public.is_admin());

revoke select, insert, update, delete on public.reports from anon;

-- ---------------------------------------------------------------------
-- Notification triggers on task lifecycle
-- ---------------------------------------------------------------------
create or replace function public.notify_task_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Task accepted -> notify customer
  if new.status = 'accepted' and old.status = 'waiting_runner' then
    perform public.push_notification(
      new.customer_id, 'task_accepted', 'Task diterima runner',
      'Task "' || new.title || '" telah diterima runner.', new.id);
  end if;

  -- In progress -> notify customer
  if new.status = 'in_progress' and old.status <> 'in_progress' then
    perform public.push_notification(
      new.customer_id, 'task_in_progress', 'Task dalam proses',
      'Runner mulai mengerjakan "' || new.title || '".', new.id);
  end if;

  -- Completed -> notify runner
  if new.status = 'completed' and old.status <> 'completed' and new.runner_id is not null then
    perform public.push_notification(
      new.runner_id, 'task_completed', 'Task selesai',
      'Task "' || new.title || '" ditandai selesai oleh customer.', new.id);
  end if;

  -- Cancelled -> notify the other party
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    if new.cancelled_by = new.customer_id and new.runner_id is not null then
      perform public.push_notification(
        new.runner_id, 'task_cancelled', 'Task dibatalkan',
        'Task "' || new.title || '" dibatalkan customer.', new.id);
    elsif new.cancelled_by = new.runner_id then
      perform public.push_notification(
        new.customer_id, 'task_cancelled', 'Task dibatalkan',
        'Task "' || new.title || '" dibatalkan runner.', new.id);
    end if;
  end if;

  return new;
end;
$$;

create trigger tasks_notify_events
  after update on public.tasks
  for each row execute function public.notify_task_events();

-- New chat message -> notify the recipient
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer uuid;
  v_runner uuid;
  v_recipient uuid;
  v_title text;
begin
  select customer_id, runner_id, title into v_customer, v_runner, v_title
    from public.tasks where id = new.task_id;

  v_recipient := case when new.sender_id = v_customer then v_runner else v_customer end;
  if v_recipient is not null then
    perform public.push_notification(
      v_recipient, 'new_message', 'Pesan baru',
      'Ada pesan baru pada task "' || v_title || '".', new.task_id);
  end if;
  return new;
end;
$$;

create trigger task_messages_notify
  after insert on public.task_messages
  for each row execute function public.notify_new_message();

-- Verification reviewed -> notify user
create or replace function public.notify_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'verified' and old.status <> 'verified' then
    perform public.push_notification(
      new.user_id, 'verification_approved', 'Verifikasi disetujui',
      'Akun kamu telah terverifikasi. Selamat menggunakan Task Runner!', null);
  elsif new.status = 'rejected' and old.status <> 'rejected' then
    perform public.push_notification(
      new.user_id, 'verification_rejected', 'Verifikasi ditolak',
      coalesce(new.rejection_reason, 'Silakan perbaiki data dan kirim ulang.'), null);
  end if;
  return new;
end;
$$;

create trigger verification_notify
  after update on public.verification_requests
  for each row execute function public.notify_verification();

-- Realtime for notifications
alter publication supabase_realtime add table public.notifications;
