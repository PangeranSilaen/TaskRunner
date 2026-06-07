import { Plus, Bike } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import {
  useAuthStore,
  selectIsVerified,
  selectIsAdmin,
} from "@/stores/auth-store";
import { VerificationBanner } from "@/components/layout/verification-banner";
import { useMyTasks } from "@/features/tasks/hooks";
import { TaskCard } from "@/components/task/task-card";
import { SkeletonCard } from "@/components/task/empty-state";
import { cn } from "@/lib/utils/cn";

export function HomePage() {
  const profile = useAuthStore((s) => s.profile);
  const isVerified = useAuthStore(selectIsVerified);
  const isAdmin = useAuthStore(selectIsAdmin);
  const { data: activeTasks, isLoading } = useMyTasks("active");

  const firstName = profile?.full_name?.split(" ")[0] || "Mahasiswa";

  // Admins use the dedicated admin panel.
  if (isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div>
      {/* Teal header */}
      <header className="safe-top rounded-b-3xl bg-primary px-5 pb-6 pt-6 text-white">
        <h1 className="text-xl font-bold">Halo, {firstName}!</h1>
        <p className="mt-1 text-sm text-white/80">
          Ada yang bisa kami bantu hari ini?
        </p>
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
