revoke select, insert, update, delete on public.ratings from anon;
revoke select, insert, update, delete on public.runner_availability_sessions from anon;
revoke execute on function public.set_runner_availability(boolean) from anon;
-- runner_profiles intentionally public-readable (runner discovery); writes are RLS-gated
revoke insert, update, delete on public.runner_profiles from anon;
