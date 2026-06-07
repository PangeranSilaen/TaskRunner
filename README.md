# Task Runner

Aplikasi web progresif (PWA) mobile-first yang menghubungkan mahasiswa kampus
ITK yang butuh bantuan menjalankan tugas kecil (customer) dengan mahasiswa lain
yang bersedia mengerjakannya (runner). Customer membuat task, runner menerima
dan mengerjakannya, lalu keduanya saling memberi rating setelah selesai.

Aplikasi live: https://taskrunner-swart.vercel.app

## Fitur Utama

- Autentikasi via email kampus (default domain `student.itk.ac.id`).
- Verifikasi akun dengan unggah foto KTM, ditinjau oleh admin.
- Pembuatan task dengan pemilih lokasi peta (Leaflet + OpenStreetMap),
  kategori, biaya runner, dan jenis task (regular/urgent).
- Dashboard runner: cari task tersedia, terima, mulai, dan selesaikan.
- Chat realtime antara customer dan runner per task.
- Pencatatan pembayaran (cash atau transfer dengan bukti) + konfirmasi runner.
- Rating dan ulasan, statistik runner, serta status ketersediaan.
- Notifikasi realtime (lonceng) untuk seluruh peristiwa penting task.
- Panel admin: monitoring task, verifikasi, dan penanganan laporan masalah.

Catatan ruang lingkup MVP: tidak ada payment gateway, dompet digital, GPS
realtime, maupun settlement otomatis.

## Teknologi

| Lapisan        | Teknologi                                                       |
| -------------- | --------------------------------------------------------------- |
| Build & UI     | Vite, React 19, TypeScript (strict)                             |
| Styling        | Tailwind CSS v4 (design token via `@theme` di `src/index.css`)  |
| Routing        | React Router v7                                                 |
| State          | Zustand (UI/auth), TanStack Query (data server)                 |
| Form           | React Hook Form + Zod                                           |
| Backend        | Supabase (Auth, Postgres, Storage, Realtime)                    |
| Peta           | Leaflet + OpenStreetMap                                          |
| PWA            | vite-plugin-pwa                                                 |

## Prasyarat

- Node.js 20 atau lebih baru, dan npm.
- Akun Supabase (gratis) — https://supabase.com
- Supabase CLI, untuk menerapkan skema database. Lihat panduan instalasi:
  https://supabase.com/docs/guides/cli

## Cara Menjalankan

### 1. Clone dan pasang dependensi

```bash
git clone https://github.com/PangeranSilaen/TaskRunner.git
cd TaskRunner
npm install
```

### 2. Siapkan project Supabase

Aplikasi ini butuh backend Supabase sendiri. Database tidak ikut di-clone —
yang ikut hanyalah **migration** (deskripsi struktur database dalam bentuk file
SQL di `supabase/migrations/`). Migration inilah yang membangun ulang seluruh
tabel, kebijakan keamanan (RLS), fungsi, dan trigger di project Supabase milikmu.

1. Buat project baru di https://supabase.com/dashboard. Catat database password
   yang kamu pilih.

2. Hubungkan repo lokal ke project tersebut (ambil `project-ref` dari URL
   dashboard, mis. `https://supabase.com/dashboard/project/<project-ref>`):

   ```bash
   supabase login
   supabase link --project-ref <project-ref>
   ```

3. Terapkan seluruh migration ke database:

   ```bash
   supabase db push
   ```

   Perintah ini menjalankan semua file di `supabase/migrations/` secara
   berurutan, sehingga database project-mu menjadi identik dengan struktur
   aplikasi (tabel, RLS, fungsi, trigger, bucket storage).

### 3. Isi variabel lingkungan

Salin file contoh, lalu isi nilai dari project Supabase-mu
(Dashboard > Project Settings > API):

```bash
cp .env.example .env.local
```

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable atau anon key>
VITE_CAMPUS_EMAIL_DOMAIN=student.itk.ac.id
```

`.env.local` sudah masuk `.gitignore` dan tidak boleh di-commit.

### 4. Buat akun admin

Jalankan aplikasi, daftar lewat halaman `/auth/register` dengan email kampus,
lalu jadikan akun itu admin. Di Dashboard Supabase buka SQL Editor dan jalankan
(ganti dengan email akunmu):

```sql
update public.profiles
  set role = 'admin', verification_status = 'verified'
  where email = 'admin@student.itk.ac.id';
```

### 5. Jalankan server pengembangan

```bash
npm run dev
```

Aplikasi berjalan di http://localhost:5173.

## Memahami Migration Supabase

Singkatnya, untuk pertanyaan "bagaimana cara berbagi database Supabase":

- Supabase **tidak** membagikan isi/data database lewat repo. Yang dibagikan
  adalah **migration**: file SQL yang mendeskripsikan struktur database.
- Setiap perubahan skema (membuat tabel, menambah kebijakan RLS, membuat fungsi)
  tersimpan sebagai satu file bernomor di `supabase/migrations/`.
  Penomorannya berdasarkan timestamp agar urutannya konsisten.
- Siapa pun yang punya repo ini cukup menjalankan `supabase db push` untuk
  membangun ulang database yang identik di project Supabase mereka sendiri.
  Tidak perlu menyalin database manual.
- Saat melakukan perubahan skema baru, buat migration baru:

  ```bash
  supabase migration new nama_perubahan
  ```

  Tulis SQL-nya di file yang dihasilkan, lalu `supabase db push`.

### Pengembangan database lokal (opsional)

Jika ingin Postgres lokal (tanpa menyentuh project cloud), butuh Docker:

```bash
supabase start          # menjalankan Postgres + Studio lokal
supabase db reset       # menerapkan ulang migration + seed.sql
```

`supabase/seed.sql` berisi panduan menyiapkan akun admin/uji untuk lingkungan
lokal.

## Skrip npm

| Perintah          | Fungsi                                            |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Menjalankan server pengembangan Vite              |
| `npm run build`   | Type-check (`tsc`) lalu build produksi            |
| `npm run preview` | Menyajikan hasil build produksi secara lokal      |

## Struktur Proyek

```
src/
  app/routes/        Halaman (home, tasks, runner, profile, admin, auth)
  components/        Komponen UI (ui, layout, task, map)
  features/          Logika per domain (api, hooks, schemas, guards)
  lib/               Utilitas, klien Supabase, konstanta, akses env
  stores/            State Zustand (auth, UI)
  types/             Tipe TypeScript hasil generate dari skema DB
supabase/
  migrations/        File SQL skema database (sumber kebenaran)
  config.toml        Konfigurasi Supabase CLI
  seed.sql           Panduan seed untuk pengembangan lokal
```

## Konvensi

- Impor memakai alias `@/...` yang dipetakan ke `src/...`.
- Teks antarmuka pengguna ditulis dalam Bahasa Indonesia. Istilah teknis seperti
  `runner`, `task`, `status` boleh tetap dalam Bahasa Inggris.
- Data server (task, chat, profil) diambil dari Supabase via TanStack Query —
  jangan menyimpan state server penting hanya di Zustand.
- Akses variabel lingkungan dipusatkan di `src/lib/env.ts`; jangan menulis kunci
  secara hardcode.
- Perhitungan biaya melewati `src/lib/utils/fees.ts` (platform fee 10%).
- Setiap tabel baru wajib mengaktifkan RLS dengan kebijakan yang sesuai.

## Verifikasi Sebelum Commit

```bash
npx tsc --noEmit     # tidak boleh ada error tipe
npx vite build       # build harus sukses
```

## Deployment

Aplikasi ini di-deploy ke Vercel dan otomatis ter-build setiap kali ada push ke
branch `master`. Pastikan variabel lingkungan (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `VITE_CAMPUS_EMAIL_DOMAIN`) sudah diatur di pengaturan
project Vercel.

## Lisensi

Proyek tugas akademik. Gunakan seperlunya untuk keperluan pembelajaran.
