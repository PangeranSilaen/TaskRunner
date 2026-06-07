import { Loader2, ClipboardList, CheckCircle2, Users, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminStats } from "@/features/admin/hooks";

export function AdminIndexPage() {
  const { data: stats, isLoading } = useAdminStats();

  const cards = [
    { label: "Total Task", value: stats?.totalTasks ?? 0, icon: ClipboardList },
    { label: "Task Aktif", value: stats?.activeTasks ?? 0, icon: ClipboardList },
    { label: "Task Selesai", value: stats?.completedTasks ?? 0, icon: CheckCircle2 },
    { label: "Total User", value: stats?.totalUsers ?? 0, icon: Users },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-ink">Ringkasan Platform</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <div
              key={c.label}
              className="flex flex-col gap-1 rounded-card bg-surface p-4 shadow-card"
            >
              <c.icon className="size-5 text-primary" />
              <span className="text-2xl font-bold text-ink">{c.value}</span>
              <span className="text-xs text-ink-muted">{c.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pending verifications highlight */}
      <Link
        to="/admin/verifications"
        className="flex items-center justify-between rounded-card bg-warning/10 p-4"
      >
        <div className="flex items-center gap-3">
          <ShieldAlert className="size-5 text-warning" />
          <div>
            <p className="font-medium text-ink">Menunggu Verifikasi</p>
            <p className="text-xs text-ink-soft">Perlu ditinjau admin</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-warning">
          {stats?.pendingVerifications ?? 0}
        </span>
      </Link>
    </div>
  );
}
