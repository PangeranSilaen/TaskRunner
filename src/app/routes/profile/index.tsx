import { useNavigate, Link } from "react-router-dom";
import {
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Star,
  Settings,
  History,
  ChevronRight,
  Bike,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { signOut } from "@/features/auth/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
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
  const toast = useToast();

  const isVerified = profile?.verification_status === "verified";
  const available = runner?.availability_status ?? false;

  const handleLogout = async () => {
    await signOut();
    reset();
    navigate("/auth/login", { replace: true });
  };

  const stats = [
    { label: "Task Selesai", value: String(runner?.completed_tasks ?? 0) },
    { label: "Penghasilan", value: formatRupiah(runner?.total_earnings ?? 0) },
    { label: "Jam Aktif", value: `${(runner?.active_hours ?? 0).toFixed(1)}j` },
  ];

  return (
    <div>
      <header className="safe-top rounded-b-[2rem] bg-gradient-to-br from-primary to-primary-dark px-5 pb-8 pt-6 text-white shadow-card">
        <h1 className="text-xl font-bold">Profil</h1>
      </header>

      <div className="flex flex-col gap-5 p-5 pt-0">
        {/* Profile card (pulled up over header) */}
        <Card className="-mt-6 flex items-center gap-4 p-4">
          <Avatar
            name={profile?.full_name}
            src={profile?.avatar_url}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-ink">
              {profile?.full_name || "Tanpa Nama"}
            </p>
            <p className="truncate text-sm text-ink-soft">{profile?.email}</p>
            <div className="mt-1.5 flex items-center gap-2">
              {isVerified ? (
                <Badge tone="success">
                  <ShieldCheck className="size-3" /> Terverifikasi
                </Badge>
              ) : (
                <Badge tone="warning">
                  <ShieldAlert className="size-3" /> Belum verified
                </Badge>
              )}
              {runner && runner.average_rating > 0 && (
                <span className="flex items-center gap-1 text-xs font-semibold text-ink-soft">
                  <Star className="size-3.5 fill-warning text-warning" />
                  {runner.average_rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Runner availability toggle */}
        {isVerified && (
          <Card className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span
                className={
                  "flex size-10 items-center justify-center rounded-xl " +
                  (available
                    ? "bg-success/12 text-success"
                    : "bg-surface-muted text-ink-muted")
                }
              >
                <Bike className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-ink">Mode Runner</p>
                <p className="text-xs text-ink-soft">
                  {available
                    ? "Kamu aktif menerima task"
                    : "Aktifkan untuk menerima task"}
                </p>
              </div>
            </div>
            <Switch
              checked={available}
              disabled={setAvailability.isPending}
              onChange={(next) =>
                setAvailability.mutate(next, {
                  onSuccess: () =>
                    toast.success(
                      next
                        ? "Mode runner aktif. Kamu bisa menerima task."
                        : "Mode runner nonaktif.",
                    ),
                  onError: () => toast.error("Gagal memperbarui status."),
                })
              }
              label="Mode Runner"
            />
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <Card key={s.label} className="flex flex-col items-center gap-1 p-3 text-center">
              <span className="text-base font-bold text-primary-dark">
                {s.value}
              </span>
              <span className="text-[10px] text-ink-muted">{s.label}</span>
            </Card>
          ))}
        </div>

        {/* Menu */}
        <Card className="overflow-hidden">
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
        </Card>

        {/* Recent history */}
        {completedTasks && completedTasks.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-bold text-ink">
              Riwayat Terbaru
            </h2>
            <div className="flex flex-col gap-2">
              {completedTasks.slice(0, 3).map((t) => (
                <Link key={t.id} to={`/tasks/${t.id}`}>
                  <Card
                    interactive
                    className="flex items-center justify-between p-3 shadow-soft"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {t.title}
                      </p>
                      <p className="text-xs text-ink-muted">Selesai</p>
                    </div>
                    <span className="text-sm font-bold text-primary-dark">
                      {formatRupiah(t.total_fee)}
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Button variant="outline" fullWidth onClick={handleLogout}>
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
      className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0 transition-colors hover:bg-surface-muted active:bg-surface-muted"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-ink">{label}</span>
      <ChevronRight className="size-4 text-ink-muted" />
    </Link>
  );
}
