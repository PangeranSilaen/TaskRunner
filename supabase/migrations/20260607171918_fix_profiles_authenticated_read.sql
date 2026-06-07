-- Authenticated users need to read other users' basic profile info to display
-- runner/customer names, chat counterpart names, and WhatsApp numbers across
-- the app (runner discovery, task detail, tracking, chat). RLS is row-level so
-- this grants row visibility to signed-in users; anon remains blocked.
create policy "Profiles: authenticated read all"
  on public.profiles for select
  to authenticated
  using (true);
