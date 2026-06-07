-- Fix mutable search_path on the updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger functions must never be callable via the REST/RPC API.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_updated_at() from public;

-- is_admin() is only needed by RLS for signed-in users; keep it off anon.
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Guests have no reason to read profiles; signed-in users still can (RLS-gated).
revoke select, insert, update, delete on public.profiles from anon;
