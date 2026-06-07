import { Outlet } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

/** Soft teal background shell for the auth screens. */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-background">
      {/* Decorative gradient header */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary-soft/70 to-transparent"
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" withWordmark={false} className="mb-4 scale-125" />
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Task<span className="text-primary">Runner</span>
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Bantuan cepat di sekitar kampus ITK
          </p>
        </div>

        <Outlet />

        <p className="mt-8 max-w-[16rem] text-center text-xs text-ink-muted">
          Khusus mahasiswa Institut Teknologi Kalimantan
        </p>
      </div>
    </div>
  );
}
