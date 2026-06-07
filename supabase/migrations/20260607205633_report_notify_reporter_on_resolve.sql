-- Item 7: notify the reporter when an admin updates their report status
-- (processing or resolved). Previously resolving a report sent nothing.
create or replace function public.notify_report_status()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_note text := '';
begin
  if new.status = old.status then
    return new;
  end if;

  if new.admin_notes is not null and length(trim(new.admin_notes)) > 0 then
    v_note := ' Catatan admin: ' || new.admin_notes;
  end if;

  if new.status = 'in_progress' then
    perform public.push_notification(
      new.reporter_id, 'report_update', 'Laporanmu sedang diproses',
      'Admin sedang meninjau laporanmu: "' || new.reason || '".' || v_note,
      new.task_id);
  elsif new.status = 'resolved' then
    perform public.push_notification(
      new.reporter_id, 'report_resolved', 'Laporanmu telah ditindaklanjuti',
      'Laporanmu "' || new.reason || '" sudah selesai ditangani admin.' || v_note,
      new.task_id);
  end if;

  return new;
end;
$function$;

drop trigger if exists reports_notify_status on public.reports;
create trigger reports_notify_status
  after update on public.reports
  for each row
  execute function public.notify_report_status();
