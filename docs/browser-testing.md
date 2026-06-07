# Browser Testing — Task Runner

Smoke-test UI pakai `agent-browser` CLI. Versi tested: **0.25.3**.
Stack kita: React 19 + React Hook Form (controlled inputs) + Supabase Auth
(session di **localStorage**, bukan cookie). Dua fakta itu yang bikin pola
testing-nya beda dari app server-rendered biasa — baca bagian Troubleshoot.

## Setup

```bash
agent-browser --version          # pastikan 0.25.x
```

URL produksi: `https://taskrunner-swart.vercel.app`
Lokal: `http://localhost:5173` (jalankan `npm run dev` dulu).

## Session Isolation — WAJIB

SELALU pakai named session (`tr`) supaya tidak konflik daemon dengan task lain,
dan **close** saat selesai.

```bash
agent-browser --session tr open https://taskrunner-swart.vercel.app/auth/login
# ... interaksi ...
agent-browser --session tr close
```

Kalau ada session nyangkut: `agent-browser close --all`.

## Akun Demo (semua password: `TaskRunner123`)

| Email | Peran | Catatan |
|---|---|---|
| `admin@student.itk.ac.id` | Admin | Redirect ke `/admin` |
| `budi@student.itk.ac.id` | Customer/Runner | Punya task aktif + selesai |
| `siti@student.itk.ac.id` | Customer/Runner | Runner availability ON |
| `andi@student.itk.ac.id` | Runner | rating 5.0, 1 task selesai |
| `dewi@student.itk.ac.id` | Customer | Task in-progress |

## Resep Login (controlled input React Hook Form)

> **ATURAN PERTAMA — jangan buang call dengan `fill @ref`.** Input di app ini
> controlled oleh React Hook Form. `agent-browser fill @ref` menulis ke DOM tapi
> **tidak memicu React `onChange`** dengan benar, jadi nilai sering tidak ter-sync
> ke form state dan submit gagal senyap. **Langsung pakai native JS setter +
> dispatch `input`+`change` event.**

Pola yang TERVERIFIKASI (PowerShell, base64 — wajib base64, lihat aturan JS):

```powershell
# 1) Buka login DULU di session yang benar (jangan eval di page kosong)
agent-browser --session tr open https://taskrunner-swart.vercel.app/auth/login
agent-browser --session tr wait --load networkidle

# 2) Isi field + submit via native JS (React-aware setter)
$js = @'
(function(){
  var setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  function sv(el,v){setter.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
  sv(document.querySelector('input[type=email]'),'budi@student.itk.ac.id');
  sv(document.querySelector('input[type=password]'),'TaskRunner123');
  var b=Array.from(document.querySelectorAll('button')).find(function(x){return /masuk/i.test(x.textContent);});
  b.click();
  return 'submitted';
})()
'@
$b64=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($js))
agent-browser --session tr eval -b $b64

# 3) Tunggu + verifikasi redirect
agent-browser --session tr wait --load networkidle
agent-browser --session tr wait 1500
agent-browser --session tr get url   # customer -> /home, admin -> /admin
```

**Aturan JS yang wajib (kalau dilanggar = mangle/gagal senyap):**
- **Selalu base64 (`-b`)**, jangan `eval "<js>"` langsung. `eval --stdin <<'EOF'`
  itu bash-only — PowerShell error `Missing file specification after redirection`.
- **JS pakai single-quote saja** di dalam string. Double-quote ke-mangle
  PowerShell sebelum sampai base64. Selector `'input[type=email]'`.
- Function declaration gaya lama (`function(){...}`) + `var`, hindari arrow
  function/template literal biar aman dari escaping.

## Ganti User — clear localStorage, BUKAN cuma cookies

> Supabase menyimpan sesi auth di **localStorage** (`sb-*-auth-token`), bukan
> cookie. `cookies clear` saja **tidak melogout** — user lama tetap login dan
> `/auth/login` ter-redirect balik ke `/home`/`/admin` (form login tidak ada,
> tombol "Masuk" tidak ketemu → kelihatan seperti "stuck"/`nobtn`).

Tetap pakai satu session `tr`, clear storage untuk ganti user:

```powershell
agent-browser --session tr eval -b "$([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('(function(){localStorage.clear();sessionStorage.clear();return "cleared";})()')))"
agent-browser --session tr open https://taskrunner-swart.vercel.app/auth/login
agent-browser --session tr get url   # pastikan TETAP di /auth/login (sudah logout)
# ... lalu login user berikutnya pakai resep di atas ...
```

## Verifikasi Konten — `eval` JSON, bukan baca snapshot panjang

Snapshot a11y kepanjangan untuk page penuh. Untuk smoke cepat, cek beberapa
indikator teks sekaligus via satu `eval` yang balik JSON:

```powershell
$js = @'
(function(){var t=document.body.innerText;return JSON.stringify({
  greeting:/Budi/i.test(t),
  taskAktif:/Task Aktif/i.test(t),
  runnerTerdekat:/Runner Terdekat/i.test(t),
  codes:(t.match(/TRK-\d+/g)||[]).length
});})()
'@
$b64=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($js))
agent-browser --session tr eval -b $b64
```

Catatan: Leaflet render ke `<canvas>`/tile `<img>` — **tidak** kelihatan di
snapshot a11y. Untuk map cukup verifikasi container ada + tidak ada error text;
korektnya koordinat dibuktikan lewat data, bukan visual.

## Troubleshoot

- **"Stuck"/output kosong di call pertama** → daemon cold-start. Re-run command
  yang sama standalone (tanpa pipe `| Select-Object`). Sertakan
  `; echo "===EXIT:$LASTEXITCODE==="` biar tahu command benar-benar selesai.
- **`eval` balik `{email:false}` / input tidak ketemu** → page belum dibuka di
  session itu, atau dibuka di session lain. Pastikan `open` + `wait --load
  networkidle` di session yang sama SEBELUM `eval`.
- **Submit "berhasil" tapi URL tidak pindah** → field tidak ter-sync ke React
  state (kamu pakai `fill @ref`). Pakai native JS setter + `input`+`change` event.
- **Login form tidak muncul / tombol Masuk `nobtn`** → user lama masih login
  (localStorage belum di-clear). Clear localStorage, jangan cuma cookies.
- **Nama runner/customer/lawan chat kosong** → RLS `profiles`. Authenticated
  harus boleh `select` semua baris profiles (policy `Profiles: authenticated
  read all`). Anon tetap diblok. Ini ditemukan & diperbaiki saat smoke test
  2026-06-07.

## Timeout Rules (Bash tool)

WAJIB set `timeout` di tiap bash call ke `agent-browser` (jangan default 120s):

| Command | timeout (ms) |
|---|---|
| `open` + `wait --load networkidle` | 45000 |
| `snapshot` / `get` / `eval` / `click` | 30000 |
| chain `&&` beberapa command | 60000 |
| `close` | 15000 |

## Flow Smoke Lengkap (terverifikasi 2026-06-07 di produksi)

1. Login admin → `/admin` → dashboard statistik (4 task) + `/admin/tasks` list seed.
2. Clear localStorage → login customer (Budi) → `/home` (greeting, Task Aktif,
   Runner Terdekat dengan nama Andi/Siti).
3. `/runner` → task urgent Siti muncul, task milik sendiri TIDAK muncul (benar).
4. `/tasks` → My Tasks tab Aktif/Selesai, task milik Budi tampil.
5. `/tasks/:id` → detail render stepper + fee + (nama runner kalau ada).
6. `agent-browser --session tr close`.
