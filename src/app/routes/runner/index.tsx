import { useState } from "react";
import { Bike } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore, selectIsVerified } from "@/stores/auth-store";
import { useAvailableTasks } from "@/features/tasks/hooks";
import { TaskCard } from "@/components/task/task-card";
import { EmptyState, SkeletonCard } from "@/components/task/empty-state";
import { Button } from "@/components/ui/button";
import { VerificationBanner } from "@/components/layout/verification-banner";
import { cn } from "@/lib/utils/cn";

const chips = [
  { key: "all", label: "Semua Task" },
  { key: "urgent", label: "Urgent" },
] as const;

type Chip = (typeof chips)[number]["key"];

export function RunnerDashboardPage() {
  const isVerified = useAuthStore(selectIsVerified);
  const [chip, setChip] = useState<Chip>("all");

  const { data: tasks, isLoading } = useAvailableTasks({
    onlyUrgent: chip === "urgent",
  });

  if (!isVerified) {
    return (
      <div>
        <header className="safe-top rounded-b-3xl bg-primary px-5 pb-6 pt-6 text-white">
          <h1 className="text-xl font-bold">Runner Dashboard</h1>
          <p className="mt-1 text-sm text-white/80">
            Pilih task yang ingin kamu kerjakan
          </p>
        </header>
        <div className="p-5">
          <VerificationBanner />
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="safe-top rounded-b-3xl bg-primary px-5 pb-6 pt-6 text-white">
        <h1 className="text-xl font-bold">Runner Dashboard</h1>
        <p className="mt-1 text-sm text-white/80">
          Pilih task yang ingin kamu kerjakan
        </p>
      </header>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setChip(c.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              chip === c.key
                ? "bg-primary text-white"
                : "bg-surface text-ink-soft border border-line",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-5 pb-5">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !tasks || tasks.length === 0 ? (
          <EmptyState
            message={
              chip === "urgent"
                ? "Belum ada task urgent."
                : "Belum ada task tersedia."
            }
            icon={Bike}
          />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              feeVariant="runner"
              footer={
                <Link to={`/runner/tasks/${task.id}`}>
                  <Button size="sm">Detail</Button>
                </Link>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
