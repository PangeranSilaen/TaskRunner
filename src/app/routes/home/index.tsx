import { Plus, Bike, Star } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import {
  useAuthStore,
  selectIsVerified,
  selectIsAdmin,
} from "@/stores/auth-store";
import { VerificationBanner } from "@/components/layout/verification-banner";
import { NotificationBell } from "@/components/layout/notification-bell";
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
    <div>
      {/* Teal header */}
      <header className="safe-top rounded-b-3xl bg-primary px-5 pb-6 pt-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">Halo, {firstName}!</h1>
            <p className="mt-1 text-sm text-white/80">
              Ada yang bisa kami bantu hari ini?
            </p>
          </div>
          <NotificationBell />
        </div>
      </header>

      <div className="flex flex-col gap-5 p-5">
        {!isVerified && <VerificationBanner />}

        {/* Action cards */}
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            to="/tasks/new"
            disabled={!isVerified}
            icon={<Plus className="size-6" />}
            title="Buat Task"
            subtitle="Minta bantuan"
          />
          <ActionCard
            to="/runner"
            disabled={!isVerified}
            icon={<Bike className="size-6" />}
            title="Jadi Runner"
            subtitle="Cari uang tambahan"
          />
        </div>

        {/* Active tasks */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">Task Aktif</h2>
          {isLoading ? (
            <SkeletonCard />
          ) : !activeTasks || activeTasks.length === 0 ? (
            <div className="rounded-card border border-dashed border-line bg-surface p-6 text-center text-sm text-ink-muted">
              Belum ada task aktif.
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
            <h2 className="mb-2 text-sm font-semibold text-ink">
              Runner Terdekat
            </h2>
            <div className="flex flex-col gap-2">
              {runners.map((r) => (
                <div
                  key={r.user_id}
                  className="flex items-center gap-3 rounded-card bg-surface p-3 shadow-soft"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                    {(r.profile?.full_name?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {r.profile?.full_name || "Runner"}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-ink-soft">
                      <Star className="size-3 fill-warning text-warning" />
                      {r.average_rating > 0
                        ? r.average_rating.toFixed(1)
                        : "Baru"}
                      {" · "}
                      {r.completed_tasks} task
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-success">
                    <span className="size-2 rounded-full bg-success" /> online
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

function ActionCard({
  to,
  disabled,
  icon,
  title,
  subtitle,
}: {
  to: string;
  disabled: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const content = (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card transition",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-xs text-ink-soft">{subtitle}</p>
      </div>
    </div>
  );

  if (disabled) return content;
  return <Link to={to}>{content}</Link>;
}
