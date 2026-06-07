revoke select, insert, update, delete on public.notifications from anon;
revoke select, insert, update, delete on public.reports from anon;
-- trigger functions don't need role EXECUTE to fire
revoke execute on function public.notify_task_events() from anon, authenticated;
revoke execute on function public.notify_new_message() from anon, authenticated;
revoke execute on function public.notify_verification() from anon, authenticated;
revoke execute on function public.on_task_completed() from anon, authenticated;
revoke execute on function public.on_rating_inserted() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.handle_updated_at() from anon, authenticated;
