# Task Runner — Implementation Plan (Phase 2-6)

> **For agentic workers:** Execute task-by-task. Each phase ends with verification
> (`npx tsc --noEmit` + `npx vite build`) and a commit/push. UI copy = Bahasa
> Indonesia. Given the 9-hour deadline, verification is build + browser smoke
> test (agent-browser), not per-component unit tests.

**Goal:** Bangun seluruh fitur MVP Task Runner di atas fondasi Phase 1 sampai alur
demo lengkap: verifikasi akun + admin approve, buat task, runner terima task,
status task, chat realtime, payment record, tracking, tandai selesai, rating,
statistik profil, notifikasi in-app, dan PWA polish.

**Architecture:** SPA React 19 + Vite, data server lewat Supabase (Postgres +
RLS + Realtime + Storage), state server via TanStack Query, state UI via Zustand.
Setiap domain di `src/features/<domain>` (api.ts, schemas.ts, hooks.ts, guards).
Semua DDL lewat migration MCP Supabase, RLS wajib di tiap tabel.

**Tech Stack:** Vite 8, React 19, TS strict, Tailwind v4, React Router v7,
Zustand, TanStack Query, React Hook Form + Zod, Supabase JS v2, Leaflet, lucide-react.

---

## Status Fondasi (Phase 1 — SELESAI)

- `profiles` + trigger auth + RLS, `is_admin()`, login/register ITK email.
- Route guards (RequireAuth/Guest/Admin), app shell + bottom nav, home, profile.
- Deploy Vercel (auto-deploy on push to `master`), env vars set.
- Catatan: email confirmation Supabase = OFF, Vercel protection = OFF (dikonfirmasi user).

---

## Konvensi Eksekusi

- Setiap tabel baru: `enable row level security` + policy eksplisit. Jalankan
  `supabase_get_advisors` (security) setelah tiap migration besar.
- Regenerate `src/types/database.ts` (manual paste dari MCP) setelah perubahan skema.
- Fee: selalu lewat `src/lib/utils/fees.ts`. Status/label: `src/lib/constants.ts`.
- Error message ke user = Indonesia manusiawi (lihat dokumentasi §15), bukan error mentah.
- Commit per fase dengan prefix `feat:`/`fix:`, push ke `master` (auto-deploy).
- Update `.multibrain/indexes/foundation.md` + context file tiap fase selesai.

---

## Desain Database (semua tabel & RLS)

Migration dibuat bertahap per fase, tetapi desain final dikunci di sini.

### `verification_requests` (Phase 2)
Kolom: id uuid pk, user_id uuid fk profiles (unique), campus_email text,
phone_number text, ktm_photo_url text, status text check
(pending/verified/rejected) default pending, rejection_reason text,
reviewed_by uuid fk profiles, reviewed_at timestamptz, created_at, updated_at.
- RLS: user select/insert/update baris sendiri; admin select/update semua.
- Saat insert/update → set `profiles.verification_status='pending'` (lewat app).
- Admin approve: update status verified + `profiles.verification_status='verified'`.
  Reject: status rejected + rejection_reason + `profiles.verification_status='rejected'`.

### `tasks` (Phase 3)
id uuid pk, public_code text unique (mis. TRK-00001 via sequence),
customer_id uuid fk profiles, runner_id uuid fk profiles null,
title text, description text, category text, location_name text,
latitude double precision, longitude double precision, distance_label text null,
task_type text check (regular/urgent), runner_fee int, platform_fee int,
total_fee int, payment_method text check (cash/transfer),
payment_status text default 'unpaid', status text check
(waiting_runner/accepted/in_progress/completed/cancelled) default waiting_runner,
cancellation_reason text, cancelled_by uuid null,
created_at, accepted_at, started_at, completed_at, cancelled_at.
- RLS select: customer pemilik OR runner pemilik OR (status=waiting_runner AND verified)
  OR admin. insert: customer = auth.uid() AND verified. update: customer pemilik
  (cancel/complete), runner saat accept (runner_id null→self, bukan task sendiri),
  admin (force cancel). Enforce verified via fungsi `is_verified()`.
- Fungsi `accept_task(task_id)` SECURITY DEFINER: cek verified, availability,
  bukan task sendiri, status waiting_runner, tidak punya task aktif lain →
  set runner_id, status accepted, accepted_at. Return task.

### `task_messages` (Phase 4)
id uuid pk, task_id uuid fk tasks, sender_id uuid fk profiles, message text, created_at.
- RLS: select/insert hanya jika auth.uid() ∈ {task.customer_id, task.runner_id}
  AND task.status != waiting_runner (chat aktif setelah diterima).
- Realtime: publication `supabase_realtime` add table.

### `payment_records` (Phase 4)
id uuid pk, task_id uuid fk tasks unique, method text (cash/transfer),
status text, proof_url text, runner_confirmed_at timestamptz, notes text,
created_at, updated_at.
- RLS: select/update customer & runner task terkait + admin.

### `ratings` (Phase 5)
id uuid pk, task_id uuid fk tasks unique, customer_id, runner_id, rating int
check 1..5, review text, created_at.
- RLS: insert hanya customer task yang status=completed, satu rating per task.
  select: pihak terkait + publik agregat via runner_profiles.

### `runner_profiles` (Phase 5)
user_id uuid pk fk profiles, average_rating numeric default 0,
completed_tasks int default 0, total_earnings int default 0,
active_hours numeric default 0, availability_status boolean default false,
last_active_at timestamptz, updated_at.
- RLS: select publik (untuk "runner terdekat" & info runner), update own + sistem.
- Trigger saat task completed → increment completed_tasks, total_earnings += runner_fee.
- Trigger saat rating insert → recompute average_rating.

### `runner_availability_sessions` (Phase 5, ringan)
id uuid pk, user_id, started_at, ended_at null. active_hours dihitung dari sini (opsional MVP).

### `notifications` (Phase 6)
id uuid pk, user_id fk profiles, type text, title text, body text,
related_task_id uuid null, is_read boolean default false, created_at.
- RLS: select/update own saja. insert lewat trigger/SECURITY DEFINER fn.
- Realtime: subscribe per user saat login.

### `reports` (Phase 6, admin)
id uuid pk, task_id, reporter_id, reported_user_id, reason text, description text,
status text (open/in_progress/resolved) default open, admin_notes text,
created_at, resolved_at.
- RLS: insert pihak terkait task; select reporter + admin; update admin.

### Storage buckets
- `avatars` (public read), `ktm-photos` (private), `payment-proofs` (private).
  Policy: user upload ke folder `auth.uid()/...`; baca KTM/proof terbatas pemilik+admin.

### Helper functions
- `is_verified()` SECURITY DEFINER: profiles.verification_status='verified' utk auth.uid().
- `has_active_runner_task()`: cek runner punya task accepted/in_progress.

---

## Phase 2 — Verification

**Migration:** `verification_requests` + RLS + storage bucket `ktm-photos` + `is_verified()`.

**Files:**
- `src/features/verification/{api.ts,schemas.ts,hooks.ts}`
- `src/app/routes/profile/verification.tsx` (lengkapi: form telepon + upload KTM + status)
- `src/app/routes/admin/{index.tsx,verifications.tsx}`
- `src/components/layout/admin-layout.tsx`
- `src/lib/supabase/storage.ts` (helper upload)
- Update `App.tsx` (route admin), `home`, guards.

**Langkah:**
1. Migration verification_requests + RLS + bucket + policies. Advisors.
2. Regenerate types.
3. `storage.ts`: uploadKtm(file,userId) → path `userId/ktm-<ts>.ext`, signed URL.
4. verification api: submitVerification (insert/update request + set profile pending),
   getMyVerification, adminListPending, adminApprove, adminReject(reason).
5. UI verifikasi: form (telepon valid WA, upload KTM preview), status state
   (incomplete/pending/verified/rejected + alasan + upload ulang).
6. Admin verifications page: list pending, preview KTM (signed URL), approve/reject+alasan.
7. Verify build + browser smoke (register→submit→admin approve→verified).

## Phase 3 — Task Core

**Migration:** `tasks` + public_code sequence + RLS + `accept_task()` + `has_active_runner_task()`.

**Files:**
- `src/features/tasks/{api.ts,schemas.ts,hooks.ts}`
- `src/components/map/location-picker.tsx` (Leaflet tap-to-pick) + `task-marker.tsx`
- `src/app/routes/tasks/{new.tsx,index.tsx,detail.tsx}` (My Tasks tab Aktif/Selesai/Dibatalkan)
- `src/app/routes/runner/{index.tsx,detail.tsx}` (list available + filter chip + detail+terima)
- `src/components/task/{task-card.tsx,fee-breakdown.tsx,status-badge.tsx,empty-state.tsx}`
- Update home (task aktif nyata), guards verified untuk /tasks/new & runner accept.

**Langkah:**
1. Migration tasks + sequence + RLS + functions. Advisors. Regenerate types.
2. schemas: createTaskSchema (judul, deskripsi, kategori, lokasi lat/lng+nama,
   task_type, payment_method). fees lewat calculateFees.
3. tasks api: createTask, listMyTasks(status), getTask, cancelTask(reason),
   completeTask, listAvailable(filter), acceptTask (rpc accept_task).
4. LocationPicker Leaflet: tap set marker, simpan lat/lng + reverse geocode nama (opsional, fallback manual).
5. Form Buat Task: kategori, tipe biaya (Regular/Urgent), fee slider sesuai rentang,
   card estimasi (biaya runner, komisi 10%, total), metode bayar. Guard verified.
6. My Tasks: tab Aktif/Selesai/Dibatalkan, task-card, empty state.
7. Runner Dashboard: chip Semua/Terdekat/Urgent/Filter, card task, detail+Terima.
   Hide Terima utk task sendiri; cek bukan task sendiri di rpc.
8. Detail task customer: status stepper, info, cancel.
9. Verify build + browser smoke (buat task → runner lain terima → status berubah).

## Phase 4 — Chat & Payment Record

**Migration:** `task_messages` + `payment_records` + RLS + realtime publication.

**Files:**
- `src/features/chat/{api.ts,hooks.ts}` (useMessages realtime subscribe)
- `src/app/routes/tasks/chat.tsx`
- `src/features/payments/{api.ts}` + UI di detail/tracking (pilih metode, upload bukti, runner konfirmasi)
- `src/components/chat/{message-bubble.tsx,chat-input.tsx}`
- WhatsApp button (muncul setelah accepted) di detail/tracking.

**Langkah:**
1. Migration + realtime. Advisors. Regenerate types.
2. chat api + realtime hook (subscribe channel task_messages:task_id).
3. Chat page: bubble kiri/kanan, timestamp, input+send, guard pihak terkait.
4. payment: upload proof ke `payment-proofs`, set status, runner konfirmasi manual.
5. WhatsApp button → wa.me dari toWhatsAppNumber, hanya setelah accepted.
6. Verify build + browser smoke (chat dua arah, upload bukti, konfirmasi).

## Phase 5 — Tracking, Rating, Profile, Stats

**Migration:** `ratings` + `runner_profiles` + `runner_availability_sessions` + RLS + triggers stats.

**Files:**
- `src/app/routes/tasks/tracking.tsx` (map visual + stepper + info runner + tombol)
- `src/components/task/{status-stepper.tsx,rating-modal.tsx}`
- `src/features/ratings/api.ts`, `src/features/runner/api.ts` (availability toggle, stats)
- Update profile (statistik nyata, riwayat), home (runner terdekat dari runner_profiles).

**Langkah:**
1. Migration ratings + runner_profiles + sessions + triggers. Advisors. Regenerate types.
2. Tracking page: map marker lokasi, stepper status, info runner, Chat + WA, Tandai Selesai (customer).
3. Tandai Selesai → completeTask → trigger update stats → buka rating modal.
4. Rating modal 1-5 + review → insert rating → recompute average.
5. Runner availability toggle (runner_profiles.availability_status + session).
6. Profile: statistik (task selesai, total earnings, jam aktif, rating), riwayat campuran.
7. Home: runner terdekat dari runner_profiles availability=true.
8. Verify build + browser smoke (selesai → rating → stats berubah).

## Phase 6 — Notifications, Reports, PWA Polish, Settings

**Migration:** `notifications` + `reports` + RLS + realtime + trigger notif.

**Files:**
- `src/features/notifications/{api.ts,hooks.ts}` (realtime, badge unread)
- `src/components/layout/notification-bell.tsx`
- `src/app/routes/profile/settings.tsx` (Umum/Akun/Notifikasi tabs)
- `src/app/routes/admin/{tasks.tsx,reports.tsx}`
- Empty/loading states konsisten, skeleton cards.
- PWA: pastikan manifest/icon, offline fallback page.

**Langkah:**
1. Migration notifications + reports + trigger + realtime. Advisors. Regenerate types.
2. Notif: subscribe per user, badge unread, mark read, jenis sesuai dokumen.
3. Settings: tabs, edit akun (nama/telepon/foto/password), toggle (fungsional sederhana).
4. Admin: task monitoring (force cancel+alasan), reports list+update status.
5. Polish: skeleton loading, empty states, offline fallback, error friendly.
6. Verify build + browser smoke + lighthouse PWA cek ringan.

---

## Seed Data Demo (setelah Phase 5 minimal)

- 1 admin (role=admin, verified).
- 3-4 user verified (2 bisa jadi runner, availability on).
- 2-3 sample task (1 waiting_runner, 1 in_progress, 1 completed+rating).
- Akun + password dikasih ke user. Email pakai domain student.itk.ac.id.
- Dibuat via SQL + Supabase admin API (auth.users butuh service role / dashboard).

## Verifikasi Akhir

- `npx tsc --noEmit` clean, `npx vite build` sukses.
- Browser smoke seluruh alur demo (agent-browser) di production URL.
- Advisors security: tidak ada ERROR; WARN yang disengaja didokumentasikan.
- Update multibrain + AGENTS.md current state.
