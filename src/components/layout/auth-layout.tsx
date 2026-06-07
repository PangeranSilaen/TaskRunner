import { Outlet } from "react-router-dom";

/** Soft teal background shell for the auth screens. */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-primary-soft/40 px-5 py-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white shadow-card">
          TR
        </div>
        <h1 className="text-2xl font-bold text-primary-dark">Task Runner</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Bantuan cepat di sekitar kampus
        </p>
      </div>
      <Outlet />
      <p className="mt-6 text-center text-xs text-ink-muted">
        Khusus mahasiswa Institut Teknologi Kalimantan
      </p>
    </div>
  );
}
