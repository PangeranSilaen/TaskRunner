import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

/** Shown on gated pages when the user is not yet verified. */
export function VerificationBanner() {
  return (
    <Link
      to="/profile/verification"
      className="flex items-start gap-3 rounded-card bg-warning/10 p-3.5 text-sm"
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
      <span className="text-ink">
        Akun kamu belum terverifikasi. Lengkapi verifikasi untuk menggunakan
        fitur Task Runner.
      </span>
    </Link>
  );
}
