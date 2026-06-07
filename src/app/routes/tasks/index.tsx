import { useState } from "react";
import { useAuthStore, selectIsVerified } from "@/stores/auth-store";
import { useMyTasks } from "@/features/tasks/hooks";
import { TaskCard } from "@/components/task/task-card";
import { EmptyState, SkeletonCard } from "@/components/task/empty-state";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { key: "active", label: "Aktif" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
] as const;

type Tab = (typeof tabs)[number]["key"];

const emptyMessage: Record<Tab, string> = {
  active: "Belum ada task aktif.",
  completed: "Belum ada task selesai.",
  cancelled: "Belum ada task dibatalkan.",
};

export function MyTasksPage() {
  const [tab, setTab] = useState<Tab>("active");
  const isVerified = useAuthStore(selectIsVerified);
  const { data: tasks, isLoading } = useMyTasks(tab);

  return (
    <div>
      <header className="safe-top rounded-b-3xl bg-primary px-5 pb-6 pt-6 text-white">
        <h1 className="text-xl font-bold">My Tasks</h1>
        <p className="mt-1 text-sm text-white/80">
          Kelola semua task kamu di sini
        </p>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-10 grid grid-cols-3 border-b border-line bg-surface">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "py-3 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-b-2 border-primary text-primary"
                : "text-ink-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 p-5">
        {!isVerified && (
          <p className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
            Verifikasi akun untuk mulai membuat task.
          </p>
        )}

        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !tasks || tasks.length === 0 ? (
          <EmptyState message={emptyMessage[tab]} />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              to={`/tasks/${task.id}`}
              feeVariant="customer"
            />
          ))
        )}
      </div>
    </div>
  );
}
