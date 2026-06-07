-- =====================================================================
-- Phase 2 — KTM storage bucket + verification review functions
-- =====================================================================

-- Private bucket for KTM photos
insert into storage.buckets (id, name, public)
values ('ktm-photos', 'ktm-photos', false)
on conflict (id) do nothing;

-- Storage RLS: users manage files under their own folder (auth.uid()/...)
create policy "KTM: user upload own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'ktm-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "KTM: user update own folder"
  on storage.objects for update
  using (
    bucket_id = 'ktm-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "KTM: user read own"
  on storage.objects for select
  using (
    bucket_id = 'ktm-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "KTM: admin read all"
  on storage.objects for select
  using (bucket_id = 'ktm-photos' and public.is_admin());

-- Submit/resubmit verification: upsert request + set profile pending
create or replace function public.submit_verification(
  p_phone text,
  p_ktm_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  select email into v_email from public.profiles where id = auth.uid();

  insert into public.verification_requests
    (user_id, campus_email, phone_number, ktm_photo_url, status,
     rejection_reason, reviewed_by, reviewed_at)
  values
    (auth.uid(), v_email, p_phone, p_ktm_url, 'pending', null, null, null)
  on conflict (user_id) do update
    set phone_number = excluded.phone_number,
        ktm_photo_url = excluded.ktm_photo_url,
        status = 'pending',
        rejection_reason = null,
        reviewed_by = null,
        reviewed_at = null,
        updated_at = now();

  update public.profiles
    set phone_number = p_phone,
        verification_status = 'pending',
        updated_at = now()
  where id = auth.uid();
end;
$$;
revoke execute on function public.submit_verification(text, text) from anon;

-- Admin approve
create or replace function public.admin_review_verification(
  p_user_id uuid,
  p_approve boolean,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat melakukan review';
  end if;

  if p_approve then
    update public.verification_requests
      set status = 'verified', rejection_reason = null,
          reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
      where user_id = p_user_id;
    update public.profiles
      set verification_status = 'verified', updated_at = now()
      where id = p_user_id;
  else
    update public.verification_requests
      set status = 'rejected', rejection_reason = p_reason,
          reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
      where user_id = p_user_id;
    update public.profiles
      set verification_status = 'rejected', updated_at = now()
      where id = p_user_id;
  end if;
end;
$$;
revoke execute on function public.admin_review_verification(uuid, boolean, text) from anon;
