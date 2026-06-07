-- Trigger functions fire via the trigger mechanism, not via EXECUTE privilege,
-- so removing role grants keeps triggers working while closing the RPC surface.
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.handle_updated_at() from anon, authenticated;

-- is_admin() is referenced by RLS policies for signed-in users; anon never needs it.
revoke execute on function public.is_admin() from anon;
