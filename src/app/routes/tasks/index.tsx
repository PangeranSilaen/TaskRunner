import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore, selectIsVerified } from "@/stores/auth-store";
import { useMyTasks, useRunnerTasks } from "@/features/tasks/hooks";
import { TaskCard } from "@/components/task/task-card";
import { EmptyState, SkeletonCard } from "@/components/task/empty-state";
import { cn } from "@/lib/utils/cn";

type Role = "customer" | "runner";

const customerTabs = [
  { key: "active", label: "Aktif" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
] as const;

const runnerTabs = [
  { key: "active", label: "Aktif" },
  { key: "completed", label: "Selesai" },
] as const;

export function MyTasksPage() {
  const [role, setRole] = useState<Role>("customer");
  const [tab, setTab] = useState<string>("active");
  const isVerified = useAuthStore(selectIsVerified);

  const customerQuery = useMyTasks(
    tab as "active" | "completed" | "cancelled",
  );
  const runnerQuery = useRunnerTasks(
    (tab === "cancelled" ? "completed" : tab) as "active" | "completed",
  );

  const active = role === "customer" ? customerQuery : runnerQuery;
  const tasks = active.data;
  const isLoading = active.isLoading;
  const tabs = role === "customer" ? customerTabs : runnerTabs;

  const switchRole = (next: Role) => {
    setRole(next);
    setTab("active");
  };

  return (
    <div>
      <header className="safe-top rounded-b-[2rem] bg-gradient-to-br from-primary to-primary-dark px-5 pb-6 pt-6 text-white shadow-card">
        <h1 className="text-xl font-bold">Task Saya</h1>
        <p className="mt-1 text-sm text-white/80">
          Kelola semua task kamu di sini
        </p>

        {/* Role segmented control */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-white/15 p-1 text-sm font-semibold">
          {(["customer", "runner"] as const).map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={cn(
                "rounded-xl py-2 transition-colors",
                role === r ? "bg-white text-primary" : "text-white/80",
              )}
            >
              {r === "customer" ? "Sebagai Customer" : "Sebagai Runner"}
            </button>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-0 z-10 flex border-b border-line bg-surface/95 backdrop-blur-lg">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-colors",
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
        {role === "customer" && !isVerified && (
          <p className="rounded-xl bg-warning/10 px-3 py-2.5 text-sm font-medium text-amber-700">
            Verifikasi akun untuk mulai membuat task.
          </p>
        )}

        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !tasks || tasks.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="Belum ada task"
            message={
              role === "customer"
                ? tab === "active"
                  ? "Task aktifmu akan muncul di sini."
                  : `Belum ada task ${tab === "completed" ? "selesai" : "dibatalkan"}.`
                : tab === "active"
                  ? "Kamu belum mengerjakan task apa pun. Cari di Runner."
                  : "Belum ada task yang kamu selesaikan."
            }
            action={
              role === "runner" && tab === "active" ? (
                <Link
                  to="/runner"
                  className="text-sm font-semibold text-primary"
                >
                  Cari task tersedia →
                </Link>
              ) : undefined
            }
          />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              to={
                role === "runner"
                  ? `/tasks/${task.id}/tracking`
                  : `/tasks/${task.id}`
              }
              feeVariant={role === "runner" ? "runner" : "customer"}
            />
          ))
        )}
      </div>
    </div>
  );
}
