import { useNavigate } from "react-router-dom";
import { ShieldCheck, Clock, XCircle, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { VERIFICATION_STATUS } from "@/lib/constants";

const statusVisual = {
  incomplete: { icon: Clock, color: "text-ink-soft", bg: "bg-surface-muted" },
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  verified: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
  rejected: { icon: XCircle, color: "text-danger", bg: "bg-danger/10" },
} as const;

export function VerificationPage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);

  const status = (profile?.verification_status ??
    "incomplete") as keyof typeof statusVisual;
  const visual = statusVisual[status];
  const Icon = visual.icon;

  return (
    <div className="min-h-dvh w-full max-w-md bg-background">
      <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="flex size-9 items-center justify-center rounded-lg hover:bg-surface-muted"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-semibold text-ink">Verifikasi Akun</h1>
      </header>

      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col items-center gap-3 rounded-card bg-surface p-6 text-center shadow-card">
          <span
            className={`flex size-16 items-center justify-center rounded-2xl ${visual.bg}`}
          >
            <Icon className={`size-8 ${visual.color}`} />
          </span>
          <h2 className="text-lg font-bold text-ink">
            {VERIFICATION_STATUS[status]}
          </h2>
          <p className="text-sm text-ink-soft">
            {status === "verified"
              ? "Akun kamu sudah diverifikasi dengan email kampus ITK."
              : "Lengkapi nomor telepon dan upload foto KTM untuk diverifikasi admin."}
          </p>
        </div>

        {/* Phase 2 will implement KTM upload + phone form here. */}
        <div className="rounded-card border border-dashed border-line bg-surface p-6 text-center text-sm text-ink-muted">
          Form upload KTM dan nomor telepon akan tersedia segera.
        </div>

        <Button variant="outline" fullWidth onClick={() => navigate("/home")}>
          Tutup
        </Button>
      </div>
    </div>
  );
}
