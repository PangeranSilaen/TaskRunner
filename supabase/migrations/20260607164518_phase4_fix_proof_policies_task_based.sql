-- Replace user-folder policies with task-folder policies so both the
-- customer and the runner of a task can read/manage the proof.
-- Proof path convention: '<task_id>/proof-<ts>.<ext>'

drop policy if exists "Proof: user upload own folder" on storage.objects;
drop policy if exists "Proof: user update own folder" on storage.objects;
drop policy if exists "Proof: user read own" on storage.objects;
drop policy if exists "Proof: admin read all" on storage.objects;

create policy "Proof: participant upload"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and public.is_task_participant(((storage.foldername(name))[1])::uuid)
  );

create policy "Proof: participant update"
  on storage.objects for update
  using (
    bucket_id = 'payment-proofs'
    and public.is_task_participant(((storage.foldername(name))[1])::uuid)
  );

create policy "Proof: participant read"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and public.is_task_participant(((storage.foldername(name))[1])::uuid)
  );

create policy "Proof: admin read all"
  on storage.objects for select
  using (bucket_id = 'payment-proofs' and public.is_admin());
