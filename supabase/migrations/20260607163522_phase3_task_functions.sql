-- =====================================================================
-- Phase 3 — Task lifecycle functions (accept / start / complete / cancel)
-- =====================================================================

-- Runner accepts an available task
create or replace function public.accept_task(p_task_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task public.tasks%rowtype;
begin
  if not public.is_verified() then
    raise exception 'Akun kamu belum terverifikasi';
  end if;

  select * into v_task from public.tasks where id = p_task_id for update;

  if not found then
    raise exception 'Task tidak ditemukan';
  end if;
  if v_task.status <> 'waiting_runner' then
    raise exception 'Task ini sudah diterima runner lain';
  end if;
  if v_task.customer_id = auth.uid() then
    raise exception 'Kamu tidak bisa menerima task milik sendiri';
  end if;
  if public.has_active_runner_task() then
    raise exception 'Kamu masih punya task aktif. Selesaikan dulu sebelum menerima task baru';
  end if;

  update public.tasks
    set runner_id = auth.uid(),
        status = 'accepted',
        accepted_at = now()
  where id = p_task_id;
end;
$$;
revoke execute on function public.accept_task(uuid) from anon;

-- Runner marks task as in progress
create or replace function public.start_task(p_task_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_runner uuid;
  v_status text;
begin
  select runner_id, status into v_runner, v_status
    from public.tasks where id = p_task_id;
  if v_runner is null or v_runner <> auth.uid() then
    raise exception 'Hanya runner task ini yang dapat memulai';
  end if;
  if v_status <> 'accepted' then
    raise exception 'Task tidak dalam status yang tepat';
  end if;
  update public.tasks
    set status = 'in_progress', started_at = now()
  where id = p_task_id;
end;
$$;
revoke execute on function public.start_task(uuid) from anon;

-- Customer marks task complete
create or replace function public.complete_task(p_task_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer uuid;
  v_status text;
begin
  select customer_id, status into v_customer, v_status
    from public.tasks where id = p_task_id;
  if v_customer is null or v_customer <> auth.uid() then
    raise exception 'Hanya customer task ini yang dapat menandai selesai';
  end if;
  if v_status not in ('accepted','in_progress') then
    raise exception 'Task tidak dalam status yang tepat';
  end if;
  update public.tasks
    set status = 'completed', completed_at = now()
  where id = p_task_id;
end;
$$;
revoke execute on function public.complete_task(uuid) from anon;

-- Cancel task (customer/runner with reason, or admin)
create or replace function public.cancel_task(p_task_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task public.tasks%rowtype;
begin
  select * into v_task from public.tasks where id = p_task_id for update;
  if not found then
    raise exception 'Task tidak ditemukan';
  end if;
  if v_task.status in ('completed','cancelled') then
    raise exception 'Task sudah selesai atau dibatalkan';
  end if;

  -- Permission: customer owner, assigned runner, or admin
  if not (v_task.customer_id = auth.uid()
          or v_task.runner_id = auth.uid()
          or public.is_admin()) then
    raise exception 'Kamu tidak berhak membatalkan task ini';
  end if;

  -- If already accepted, a reason is mandatory (except nothing extra for admin)
  if v_task.status <> 'waiting_runner'
     and (p_reason is null or length(trim(p_reason)) = 0) then
    raise exception 'Alasan pembatalan wajib diisi';
  end if;

  update public.tasks
    set status = 'cancelled',
        cancellation_reason = p_reason,
        cancelled_by = auth.uid(),
        cancelled_at = now()
  where id = p_task_id;
end;
$$;
revoke execute on function public.cancel_task(uuid, text) from anon;
