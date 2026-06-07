revoke select, insert, update, delete on public.tasks from anon;
revoke execute on function public.accept_task(uuid) from anon;
revoke execute on function public.start_task(uuid) from anon;
revoke execute on function public.complete_task(uuid) from anon;
revoke execute on function public.cancel_task(uuid, text) from anon;
revoke execute on function public.has_active_runner_task() from anon;
