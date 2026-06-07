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

function Header() {
  return (
    <header className="safe-top rounded-b-[2rem] bg-gradient-to-br from-primary to-primary-dark px-5 pb-6 pt-6 text-white shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15">
          <Bike className="size-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold">Runner Dashboard</h1>
          <p className="text-sm text-white/80">
            Pilih task yang ingin kamu kerjakan
          </p>
        </div>
      </div>
    </header>
  );
}

export function RunnerDashboardPage() {
  const isVerified = useAuthStore(selectIsVerified);
  const [chip, setChip] = useState<Chip>("all");

  const { data: tasks, isLoading } = useAvailableTasks({
    onlyUrgent: chip === "urgent",
  });

  if (!isVerified) {
    return (
      <div>
        <Header />
        <div className="p-5">
          <VerificationBanner />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      {/* Filter chips */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-6 py-3">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setChip(c.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              chip === c.key
                ? "bg-primary text-white shadow-soft"
                : "border border-line bg-surface text-ink-soft",
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
            icon={Bike}
            title={chip === "urgent" ? "Tidak ada task urgent" : "Belum ada task"}
            message={
              chip === "urgent"
                ? "Saat ini tidak ada task urgent. Coba lihat semua task."
                : "Belum ada task tersedia. Cek lagi nanti, ya."
            }
          />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              feeVariant="runner"
              footer={
                <Link to={`/runner/tasks/${task.id}`}>
                  <Button size="sm">Lihat Detail</Button>
                </Link>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
