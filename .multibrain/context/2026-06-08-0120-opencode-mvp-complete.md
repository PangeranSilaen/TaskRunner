# Context: MVP Phase 2-6 Complete + Deploy + Smoke Test

Date: 2026-06-08 ~01:20 WIB
Agent: OpenCode (kr/claude-opus-4.8-thinking)

## Ringkasan

Task Runner MVP lengkap (Phase 1-6) selesai dalam satu sesi panjang, ter-deploy
ke produksi (Vercel, auto-deploy on push ke `master`), dan ter-smoke-test pakai
agent-browser. Live: https://taskrunner-swart.vercel.app

## Fase yang dikerjakan sesi ini (Phase 2-6)

- **Phase 2 — Verification**: `verification_requests` + RLS, bucket `ktm-photos`,
  fungsi `submit_verification` & `admin_review_verification`, `is_verified()`.
  UI: form telepon+upload KTM dengan status (incomplete/pending/verified/rejected),
  admin verifications page (preview KTM via signed URL, approve/reject).
- **Phase 3 — Task Core**: `tasks` + `public_code` (sequence TRK-xxxxx) + RLS,
  RPC `accept_task`/`start_task`/`complete_task`/`cancel_task`,
  `has_active_runner_task()`. UI: buat task (Leaflet location picker, tipe biaya
  regular/urgent, fee slider, estimasi), My Tasks (tab), runner dashboard (filter
  chip), detail task (stepper, cancel/complete), tracking page.
- **Phase 4 — Chat & Payment**: `task_messages` (realtime publication) +
  `payment_records` + bucket `payment-proofs` (policy task-folder based),
  `is_task_participant()`. UI: chat realtime (bubble), payment panel (upload bukti
  transfer, runner konfirmasi), WhatsApp deep-link.
- **Phase 5 — Rating/Stats**: `ratings` + `runner_profiles` +
  `runner_availability_sessions`, trigger `on_task_completed` (increment stats) +
  `on_rating_inserted` (recompute avg), RPC `set_runner_availability`. UI: rating
  modal (muncul setelah customer tandai selesai), profile dengan stats nyata +
  toggle availability + riwayat, runner terdekat di home, settings page.
- **Phase 6 — Notifications/Admin**: `notifications` (realtime) + `reports` +
  trigger notif (task lifecycle, pesan baru, verifikasi), `push_notification()`.
  UI: notification bell (badge unread, mark read), admin dashboard (stats),
  admin tasks monitoring (force cancel), admin reports.

## Bug penting yang ditemukan & diperbaiki (via agent-browser smoke test)

RLS `profiles` awalnya cuma izinkan baca baris sendiri → semua join ke profil
user lain (nama runner di "Runner Terdekat", nama customer/runner di task detail,
nama lawan chat, nomor WhatsApp) balik null. Fix: policy `Profiles: authenticated
read all` (select true untuk role authenticated). Anon tetap diblok. Migration:
`fix_profiles_authenticated_read`.

## Seed Data (migration via execute_sql, bukan tracked migration)

- 5 akun (auth.users + auth.identities + bcrypt, email_confirmed): admin, budi,
  siti, andi, dewi @student.itk.ac.id. Password semua: `TaskRunner123`.
- 4 sample task (TRK-00001 waiting, TRK-00002 urgent waiting, TRK-00003
  in_progress, TRK-00004 completed+rating 5).
- runner_profiles: Andi (rating 5, 1 task, available), Siti (available).

CATATAN: seed pakai `execute_sql` langsung (bukan apply_migration) karena
auth.users butuh insert manual + identities. Kalau DB di-reset, re-run seed.

## Decisions

- TDD per-langkah di-skip (deadline 9 jam, UI-heavy, belum ada test harness).
  Verifikasi = `tsc --noEmit` + `vite build` + agent-browser smoke test produksi.
  Ini eksplisit disetujui user (instruksi user > default skill).
- Email confirmation Supabase OFF (user matikan dari dashboard) → register
  langsung bisa login.
- Vercel Deployment Protection OFF (user matikan) → link publik bisa dibuka.
- Preview env vars Vercel TIDAK ke-set (CLI minta input branch interaktif).
  Pakai alur production: push `master` = auto-deploy production. Aman.
- Supabase auth session di localStorage (bukan cookie) — untuk ganti user di
  browser test harus `localStorage.clear()`, bukan `cookies clear`.
- React Hook Form controlled input — browser test harus native JS setter +
  dispatch input/change event, `fill @ref` gagal sync ke React state.

## Advisor WARN yang DISENGAJA (bukan error)

- `profiles`, `runner_profiles` readable by authenticated (perlu untuk tampilkan
  nama & runner discovery).
- SECURITY DEFINER RPC callable by authenticated (di-gate internal + via RLS).
- Semua tabel/fungsi: akses anon di-revoke. Trigger functions: EXECUTE di-revoke
  dari anon+authenticated (trigger tetap jalan tanpa EXECUTE).

## Migrations (urutan, tracked)

phase2_verification_requests, phase2_ktm_storage_and_review_fns,
phase2_revoke_anon_access, phase3_tasks_core, phase3_task_functions,
phase3_revoke_anon, phase4_chat_and_payments, phase4_payment_proofs_storage,
phase4_fix_proof_policies_task_based, phase4_revoke_anon,
phase5_ratings_runner_profiles_stats, phase5_runner_availability_fn,
phase5_revoke_anon, phase6_notifications_reports, phase6_revoke_anon,
fix_profiles_authenticated_read.

## Yang BELUM dikerjakan (kalau ada waktu / lanjutan)

- Laporan/dokumentasi akademik untuk presentasi (user akan kerjakan).
- Code-splitting (bundle JS ~600KB+, warning >500KB).
- PWA offline fallback page polish.
- Reports: belum ada UI user untuk BUAT laporan (baru admin yang lihat/resolve).
- Preview env vars Vercel (kalau mau preview deployment per-branch).

## File kunci baru sesi ini

- `src/features/{verification,tasks,chat,payments,ratings,runner,notifications,admin}/`
- `src/components/task/*`, `src/components/map/location-picker.tsx`,
  `src/components/layout/{admin-layout,page-header,notification-bell}.tsx`
- `src/app/routes/{tasks,runner,admin,profile}/*`
- `docs/plan/2026-06-07-mvp-phases.md`, `docs/browser-testing.md`
