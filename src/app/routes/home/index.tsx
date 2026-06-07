import { Plus, Bike, Star, ChevronRight, Sparkles } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import {
  useAuthStore,
  selectIsVerified,
  selectIsAdmin,
} from "@/stores/auth-store";
import { VerificationBanner } from "@/components/layout/verification-banner";
import { NotificationBell } from "@/components/layout/notification-bell";
import { LogoMark } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { useMyTasks } from "@/features/tasks/hooks";
import { useAvailableRunners } from "@/features/runner/hooks";
import { TaskCard } from "@/components/task/task-card";
import { SkeletonCard } from "@/components/task/empty-state";
import { cn } from "@/lib/utils/cn";

export function HomePage() {
  const profile = useAuthStore((s) => s.profile);
  const isVerified = useAuthStore(selectIsVerified);
  const isAdmin = useAuthStore(selectIsAdmin);
  const { data: activeTasks, isLoading } = useMyTasks("active");
  const { data: runners } = useAvailableRunners(5);

  const firstName = profile?.full_name?.split(" ")[0] || "Mahasiswa";

  // Admins use the dedicated admin panel.
  if (isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="pb-4">
      {/* Teal gradient header */}
      <header className="safe-top rounded-b-[2rem] bg-gradient-to-br from-primary to-primary-dark px-5 pb-7 pt-5 text-white shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-white p-1.5 shadow-soft">
              <LogoMark className="size-full" />
            </span>
            <span className="text-sm font-bold tracking-tight">
              Task<span className="text-accent">Runner</span>
            </span>
          </div>
          <NotificationBell />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Avatar
            name={profile?.full_name}
            src={profile?.avatar_url}
            size="lg"
            className="ring-2 ring-white/30"
          />
          <div className="min-w-0">
            <p className="text-sm text-white/80">Halo,</p>
            <h1 className="truncate text-xl font-bold">{firstName} 👋</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-5">
        {!isVerified && <VerificationBanner />}

        {/* Action cards */}
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            to="/tasks/new"
            disabled={!isVerified}
            icon={<Plus className="size-6" />}
            title="Buat Task"
            subtitle="Minta bantuan"
            accent="primary"
          />
          <ActionCard
            to="/runner"
            disabled={!isVerified}
            icon={<Bike className="size-6" />}
            title="Jadi Runner"
            subtitle="Cari penghasilan"
            accent="accent"
          />
        </div>

        {/* Active tasks */}
        <section>
          <SectionHeader
            title="Task Aktif"
            actionTo={
              activeTasks && activeTasks.length > 0 ? "/tasks" : undefined
            }
          />
          {isLoading ? (
            <SkeletonCard />
          ) : !activeTasks || activeTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line bg-surface px-6 py-8 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                <Sparkles className="size-5" />
              </span>
              <p className="text-sm font-medium text-ink">Belum ada task aktif</p>
              <p className="text-xs text-ink-muted">
                Buat task pertamamu dan biarkan runner membantu.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeTasks.slice(0, 3).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  to={`/tasks/${task.id}`}
                  feeVariant="customer"
                />
              ))}
            </div>
          )}
        </section>

        {/* Nearby runners */}
        {runners && runners.length > 0 && (
          <section>
            <SectionHeader title="Runner Tersedia" />
            <div className="flex flex-col gap-2.5">
              {runners.map((r) => (
                <div
                  key={r.user_id}
                  className="flex items-center gap-3 rounded-card bg-surface p-3 shadow-soft"
                >
                  <Avatar name={r.profile?.full_name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {r.profile?.full_name || "Runner"}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-ink-soft">
                      <Star className="size-3 fill-warning text-warning" />
                      {r.average_rating > 0
                        ? r.average_rating.toFixed(1)
                        : "Baru"}
                      {" · "}
                      {r.completed_tasks} task selesai
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                    <span className="size-1.5 rounded-full bg-success" />
                    Online
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  actionTo,
}: {
  title: string;
  actionTo?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {actionTo && (
        <Link
          to={actionTo}
          className="flex items-center gap-0.5 text-xs font-semibold text-primary"
        >
          Lihat semua <ChevronRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

function ActionCard({
  to,
  disabled,
  icon,
  title,
  subtitle,
  accent,
}: {
  to: string;
  disabled: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: "primary" | "accent";
}) {
  const content = (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card transition-transform duration-150",
        !disabled && "active:scale-[0.97]",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-2xl text-white shadow-soft",
          accent === "primary"
            ? "bg-gradient-to-br from-primary to-primary-dark"
            : "bg-gradient-to-br from-accent to-primary",
        )}
      >
        {icon}
      </span>
      <div>
        <p className="font-bold text-ink">{title}</p>
        <p className="text-xs text-ink-soft">{subtitle}</p>
      </div>
    </div>
  );

  if (disabled) return content;
  return <Link to={to}>{content}</Link>;
}
