import { useNavigate, Link } from "react-router-dom";
import {
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Star,
  Settings,
  History,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { signOut } from "@/features/auth/api";
import { Button } from "@/components/ui/button";
import { useMyRunnerProfile, useSetAvailability } from "@/features/runner/hooks";
import { useMyTasks } from "@/features/tasks/hooks";
import { formatRupiah } from "@/lib/utils/cn";

export function ProfilePage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const reset = useAuthStore((s) => s.reset);
  const { data: runner } = useMyRunnerProfile();
  const setAvailability = useSetAvailability();
  const { data: completedTasks } = useMyTasks("completed");

  const isVerified = profile?.verification_status === "verified";
  const available = runner?.availability_status ?? false;

  const handleLogout = async () => {
    await signOut();
    reset();
    navigate("/auth/login", { replace: true });
  };

  const stats = [
    {
      label: "Task Selesai",
      value: runner?.completed_tasks ?? 0,
    },
    {
      label: "Total Earnings",
      value: formatRupiah(runner?.total_earnings ?? 0),
    },
    {
      label: "Jam Aktif",
      value: `${(runner?.active_hours ?? 0).toFixed(1)} jam`,
    },
  ];

  return (
    <div>
      <header className="safe-top rounded-b-3xl bg-primary px-5 pb-6 pt-6 text-white">
        <h1 className="text-xl font-bold">Profil</h1>
        <p className="mt-1 text-sm text-white/80">
          Kelola akun dan pengaturan kamu
        </p>
      </header>

      <div className="flex flex-col gap-5 p-5">
        {/* Profile card */}
        <div className="flex items-center gap-4 rounded-card bg-surface p-4 shadow-card">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-lg font-bold text-primary">
            {(profile?.full_name?.[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">
              {profile?.full_name || "Tanpa Nama"}
            </p>
            <p className="truncate text-sm text-ink-soft">{profile?.email}</p>
            {runner && runner.average_rating > 0 && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
                <Star className="size-3.5 fill-warning text-warning" />
                {runner.average_rating.toFixed(1)}
              </p>
            )}
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

        {/* Runner availability toggle */}
        {isVerified && (
          <div className="flex items-center justify-between rounded-card bg-surface p-4 shadow-card">
            <div>
              <p className="font-medium text-ink">Mode Runner</p>
              <p className="text-xs text-ink-soft">
                {available
                  ? "Kamu aktif menerima task"
                  : "Aktifkan untuk menerima task"}
              </p>
            </div>
            <button
              role="switch"
              aria-checked={available}
              disabled={setAvailability.isPending}
              onClick={() => setAvailability.mutate(!available)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                available ? "bg-primary" : "bg-line"
              }`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
                  available ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-card bg-surface p-3 text-center shadow-card"
            >
              <span className="text-sm font-bold text-primary-dark">
                {s.value}
              </span>
              <span className="text-[10px] text-ink-muted">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="overflow-hidden rounded-card bg-surface shadow-card">
          <MenuItem
            to="/profile/verification"
            icon={<ShieldCheck className="size-5" />}
            label="Verifikasi Akun"
          />
          <MenuItem
            to="/profile/settings"
            icon={<Settings className="size-5" />}
            label="Pengaturan"
          />
          <MenuItem
            to="/tasks"
            icon={<History className="size-5" />}
            label="Riwayat Task"
          />
        </div>

        {/* Recent history */}
        {completedTasks && completedTasks.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-ink">
              Riwayat Terbaru
            </h2>
            <div className="flex flex-col gap-2">
              {completedTasks.slice(0, 3).map((t) => (
                <Link
                  key={t.id}
                  to={`/tasks/${t.id}`}
                  className="flex items-center justify-between rounded-card bg-surface p-3 shadow-soft"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {t.title}
                    </p>
                    <p className="text-xs text-ink-muted">Sebagai customer</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-dark">
                    {formatRupiah(t.total_fee)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Button variant="danger" fullWidth onClick={handleLogout}>
          <LogOut className="size-4" /> Keluar
        </Button>
      </div>
    </div>
  );
}

function MenuItem({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 hover:bg-surface-muted"
    >
      <span className="text-primary">{icon}</span>
      <span className="flex-1 text-sm text-ink">{label}</span>
      <ChevronRight className="size-4 text-ink-muted" />
    </Link>
  );
}
