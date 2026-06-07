-- Toggle runner availability + maintain a session row + profile flag
create or replace function public.set_runner_availability(p_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_verified() then
    raise exception 'Akun kamu belum terverifikasi';
  end if;

  insert into public.runner_profiles (user_id, availability_status, last_active_at)
  values (auth.uid(), p_active, now())
  on conflict (user_id) do update
    set availability_status = p_active,
        last_active_at = now(),
        updated_at = now();

  update public.profiles
    set is_runner_enabled = p_active, updated_at = now()
    where id = auth.uid();

  if p_active then
    -- open a new session
    insert into public.runner_availability_sessions (user_id) values (auth.uid());
  else
    -- close any open session and accumulate active_hours
    update public.runner_availability_sessions
      set ended_at = now()
      where user_id = auth.uid() and ended_at is null;

    update public.runner_profiles rp
      set active_hours = coalesce((
        select sum(extract(epoch from (coalesce(s.ended_at, now()) - s.started_at)) / 3600.0)
        from public.runner_availability_sessions s
        where s.user_id = auth.uid()
      ), 0)
      where rp.user_id = auth.uid();
  end if;
end;
$$;
revoke execute on function public.set_runner_availability(boolean) from anon;
