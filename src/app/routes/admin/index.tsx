import {
  ClipboardList,
  CheckCircle2,
  Users,
  ShieldAlert,
  Activity,
  ChevronRight,
  Flag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { SkeletonCard } from "@/components/task/empty-state";
import { useAdminStats } from "@/features/admin/hooks";
import { cn } from "@/lib/utils/cn";

export function AdminIndexPage() {
  const { data: stats, isLoading } = useAdminStats();

  const cards = [
    {
      label: "Total Task",
      value: stats?.totalTasks ?? 0,
      icon: ClipboardList,
      tint: "from-primary to-primary-dark",
    },
    {
      label: "Task Aktif",
      value: stats?.activeTasks ?? 0,
      icon: Activity,
      tint: "from-info to-blue-600",
    },
    {
      label: "Task Selesai",
      value: stats?.completedTasks ?? 0,
      icon: CheckCircle2,
      tint: "from-success to-emerald-600",
    },
    {
      label: "Total User",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      tint: "from-accent to-primary",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-ink">Ringkasan Platform</h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {cards.map((c) => (
              <Card key={c.label} className="flex flex-col gap-3 p-4">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft",
                    c.tint,
                  )}
                >
                  <c.icon className="size-5" />
                </span>
                <div>
                  <span className="text-2xl font-bold text-ink">{c.value}</span>
                  <p className="text-xs text-ink-muted">{c.label}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Pending verifications highlight */}
          <Link to="/admin/verifications">
            <Card
              interactive
              className="flex items-center justify-between bg-gradient-to-r from-warning/15 to-warning/5 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-warning/20 text-amber-600">
                  <ShieldAlert className="size-6" />
                </span>
                <div>
                  <p className="font-bold text-ink">Menunggu Verifikasi</p>
                  <p className="text-xs text-ink-soft">Perlu ditinjau admin</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-amber-600">
                  {stats?.pendingVerifications ?? 0}
                </span>
                <ChevronRight className="size-5 text-ink-muted" />
              </div>
            </Card>
          </Link>

          {/* Reports shortcut */}
          <Link to="/admin/reports">
            <Card
              interactive
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-danger/12 text-danger">
                  <Flag className="size-6" />
                </span>
                <div>
                  <p className="font-bold text-ink">Laporan Masalah</p>
                  <p className="text-xs text-ink-soft">Tinjau & selesaikan</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-ink-muted" />
            </Card>
          </Link>
        </>
      )}
    </div>
  );
}
