-- Close anon surface for Phase 2 objects (RLS + intentional authenticated access remains)
revoke select, insert, update, delete on public.verification_requests from anon;
revoke execute on function public.submit_verification(text, text) from anon;
revoke execute on function public.admin_review_verification(uuid, boolean, text) from anon;
revoke execute on function public.is_verified() from anon;
