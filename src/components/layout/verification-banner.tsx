import { Link } from "react-router-dom";
import { ShieldAlert, ChevronRight } from "lucide-react";

/** Shown on gated pages when the user is not yet verified. */
export function VerificationBanner() {
  return (
    <Link
      to="/profile/verification"
      className="flex items-center gap-3 rounded-card bg-gradient-to-r from-warning/15 to-warning/5 p-4 transition-transform active:scale-[0.99]"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-warning/20 text-amber-600">
        <ShieldAlert className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">Akun belum terverifikasi</p>
        <p className="text-xs text-ink-soft">
          Lengkapi verifikasi untuk mulai pakai Task Runner.
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-amber-600" />
    </Link>
  );
}
