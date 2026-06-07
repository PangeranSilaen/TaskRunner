-- Fix task cancellation notifications:
-- 1) When an ADMIN cancels (cancelled_by is neither customer nor runner),
--    nobody was notified. Now notify BOTH customer and runner.
-- 2) Include the cancellation reason in the notification body so the user
--    sees WHY it was cancelled.
create or replace function public.notify_task_events()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_reason_suffix text := '';
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

  -- Cancelled -> notify the affected parties, including the reason.
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    if new.cancellation_reason is not null
       and length(trim(new.cancellation_reason)) > 0 then
      v_reason_suffix := ' Alasan: ' || new.cancellation_reason;
    end if;

    if new.cancelled_by = new.customer_id then
      -- Customer cancelled -> notify runner (if assigned)
      if new.runner_id is not null then
        perform public.push_notification(
          new.runner_id, 'task_cancelled', 'Task dibatalkan',
          'Task "' || new.title || '" dibatalkan customer.' || v_reason_suffix, new.id);
      end if;
    elsif new.cancelled_by = new.runner_id then
      -- Runner cancelled -> notify customer
      perform public.push_notification(
        new.customer_id, 'task_cancelled', 'Task dibatalkan',
        'Task "' || new.title || '" dibatalkan runner.' || v_reason_suffix, new.id);
    else
      -- Admin (or anyone else) cancelled -> notify BOTH parties
      perform public.push_notification(
        new.customer_id, 'task_cancelled', 'Task dibatalkan admin',
        'Task "' || new.title || '" dibatalkan oleh admin.' || v_reason_suffix, new.id);
      if new.runner_id is not null then
        perform public.push_notification(
          new.runner_id, 'task_cancelled', 'Task dibatalkan admin',
          'Task "' || new.title || '" dibatalkan oleh admin.' || v_reason_suffix, new.id);
      end if;
    end if;
  end if;

  return new;
end;
$function$;
