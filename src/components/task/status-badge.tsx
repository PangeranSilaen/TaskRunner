import { cn } from "@/lib/utils/cn";
import type { TaskStatus } from "@/lib/constants";
import { TASK_STATUS } from "@/lib/constants";

const styles: Record<TaskStatus, string> = {
  waiting_runner: "bg-warning/10 text-warning",
  accepted: "bg-info/10 text-info",
  in_progress: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status as TaskStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        styles[key] ?? "bg-surface-muted text-ink-soft",
        className,
      )}
    >
      {TASK_STATUS[key] ?? status}
    </span>
  );
}

export function UrgentBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-warning px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white",
        className,
      )}
    >
      Urgent
    </span>
  );
}
