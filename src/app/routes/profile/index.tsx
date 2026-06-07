import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { signOut } from "@/features/auth/api";
import { Button } from "@/components/ui/button";

export function ProfilePage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const reset = useAuthStore((s) => s.reset);

  const isVerified = profile?.verification_status === "verified";

  const handleLogout = async () => {
    await signOut();
    reset();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div>
      <header className="safe-top rounded-b-3xl bg-primary px-5 pb-6 pt-6 text-white">
        <h1 className="text-xl font-bold">Profil</h1>
        <p className="mt-1 text-sm text-white/80">
          Kelola akun dan pengaturan kamu
        </p>
      </header>

      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-center gap-4 rounded-card bg-surface p-4 shadow-card">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-lg font-bold text-primary">
            {(profile?.full_name?.[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">
              {profile?.full_name || "Tanpa Nama"}
            </p>
            <p className="truncate text-sm text-ink-soft">{profile?.email}</p>
          </div>
          {isVerified ? (
            <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              <ShieldCheck className="size-3.5" /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
              <ShieldAlert className="size-3.5" /> Belum Verified
            </span>
          )}
        </div>

        <Button variant="danger" fullWidth onClick={handleLogout}>
          <LogOut className="size-4" /> Keluar
        </Button>
      </div>
    </div>
  );
}
