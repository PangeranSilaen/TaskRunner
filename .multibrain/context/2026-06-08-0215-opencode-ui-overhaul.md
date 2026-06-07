# Context: UI Overhaul Production-Grade + Fix Bug Mutasi + Lengkapi Fitur

Date: 2026-06-08 ~02:15 WIB
Agent: OpenCode (kr/claude-opus-4.8-thinking)
Branch: `feat/ui-overhaul-and-fixes` → PR #1
(https://github.com/PangeranSilaen/TaskRunner/pull/1)

## Pemicu

User bandingkan local vs prod, lapor banyak isu. Triase:
- "Local jelek, navbar di atas" = CSS dev server stale (restart `npm run dev`).
- "Buat task ngeblip / gak ada task / verif segera" = cache browser lama
  (user konfirmasi works di incognito). Source of truth = prod + incognito.
- **Bug nyata**: "Gagal menerima task", toggle settings kacau, notif penempatan,
  admin UI lama. + minta UI production-grade + reusable components.

## BUG KRITIS (ditemukan & diperbaiki)

`accept_task` gagal: `record "new" has no field "updated_at"`. Trigger
`tasks_set_updated_at` (Phase 3) panggil `handle_updated_at()` yang set
`new.updated_at`, tapi tabel `tasks` TIDAK punya kolom `updated_at`. Akibat:
SEMUA update tasks gagal (accept/start/complete/cancel). Lolos smoke test pertama
karena dulu cuma test RENDER, bukan MUTASI.

Fix: migration `fix_tasks_drop_updated_at_trigger` (drop trigger; task pakai
timestamp eksplisit accepted_at/started_at/dll). Dicek: tabel lain dengan trigger
`handle_updated_at` (payment_records, profiles, runner_profiles,
verification_requests) SEMUA punya kolom updated_at → aman, cuma tasks yang kena.

**Terverifikasi via agent-browser**: login Budi → accept TRK-00002 (task yang dulu
gagal) → redirect tracking → start task → "sedang mengerjakan". Seed di-restore
ke waiting_runner setelah test.

## Skills baru (project scope, .agents/skills/)

`pwa-development` + `mobile-design` (install via `npx skills add ... -y -p
--agent opencode`; perlu `-y` untuk skip prompt scope interaktif). Catatan: skill
baru TIDAK muncul di `skill` tool sampai sesi baru — baca SKILL.md langsung.

## Komponen reusable baru (src/components/ui/)

card.tsx, badge.tsx, avatar.tsx (inisial fallback), switch.tsx (fix toggle),
sheet.tsx (bottom sheet + keyframes di index.css), toast.tsx (ToastProvider di
main.tsx, useToast hook), logo.tsx (Logo + LogoMark, SLOT placeholder untuk logo
Illustrator final — ganti inline SVG dgn /logo.svg), password-input.tsx (show/hide).

Animations di index.css: fadeIn, sheetUp, toastIn + prefers-reduced-motion.

## Screen yang dirombak (semua)

Layout: bottom-nav (pill aktif), page-header (subtitle+action), auth-layout
(Logo), admin-layout (gradient header — ini "UI lama" yg user keluhkan).
User: home, tasks/index (My Tasks + toggle Customer/Runner), runner/index,
tasks/detail (+report), runner/detail (sticky accept CTA), tasks/tracking
(+realtime), tasks/chat, profile/index (Switch availability), profile/settings
(Switch), tasks/new, profile/verification, auth/login+register (PasswordInput).
Admin: index (stat cards gradient), tasks, reports, verifications.
Shared: task-card (Card), status-badge (Badge+dot), empty-state (title+action),
rating-modal (jadi Sheet), payment-panel (Card/Badge), fee-breakdown,
verification-banner.

## Gap fitur dari spec yang dilengkapi

1. **Lapor Masalah sisi USER**: src/features/reports/ (api+hooks) +
   components/task/report-sheet.tsx, di-wire ke task detail (ikon Flag di header).
   RLS reports sudah izinkan insert reporter_id=auth.uid(). Admin reports tadinya
   selalu kosong → sekarang ada jalur isi.
2. **Daftar task sebagai Runner**: toggle Customer/Runner di My Tasks
   (pakai useRunnerTasks yg sebelumnya nganggur). Link runner → tracking.
3. **Realtime status tracking**: migration `phase5_add_tasks_to_realtime`
   (alter publication supabase_realtime add table tasks). Hook `useTaskRealtime`
   di tasks/hooks.ts subscribe UPDATE → invalidate query. RLS tetap berlaku.

## Performance

Code-split vendor chunks di vite.config.ts. PENTING: project pakai **Rolldown**
(bukan Rollup standar) → `manualChunks` HARUS function, bukan object (object →
error "manualChunks is not a function"). Hasil: 855KB monolith → vendor-react
178KB, vendor-supabase 193KB, vendor-map 148KB, vendor-forms 92KB, vendor-data
35KB, app index 107KB. Tidak ada warning >500KB lagi.

## Migrations baru sesi ini

- fix_tasks_drop_updated_at_trigger
- phase5_add_tasks_to_realtime

## Verifikasi

tsc --noEmit pass (dicek tiap checkpoint), vite build sukses, agent-browser smoke
MUTASI (accept+start) sukses, screenshot home production-grade.

## Yang BELUM (kalau lanjut)

- Avatar upload + ubah password (Page 9 spec) — prioritas rendah.
- Filter modal runner (jarak/biaya) — chip masih Semua/Urgent saja.
- Geolocation "Terdekat" beneran (sekarang distance_label dari DB, bisa null).
- Gate availability di runner dashboard (toggle baru di profil).
- PWA offline fallback page.
- PR #1 belum di-merge (nunggu review user).
- Logo final dari user (slot sudah siap di logo.tsx).

## agent-browser gotcha (tambahan)

- Output kosong di call pertama = daemon cold-start → re-run standalone TANPA
  pipe `| Select-Object` (pipe nelan output). Sertakan `; echo "===EXIT..."`.
- Pakai `:5173` (dev server user) atau preview sendiri di `:4173`.
- `agent-browser close --all` untuk bersihin session nyangkut.
