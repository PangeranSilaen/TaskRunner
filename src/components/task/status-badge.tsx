import { Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TaskStatus } from "@/lib/constants";
import { TASK_STATUS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const tones: Record<TaskStatus, Tone> = {
  waiting_runner: "warning",
  accepted: "info",
  in_progress: "info",
  completed: "success",
  cancelled: "danger",
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
    <Badge tone={tones[key] ?? "neutral"} dot className={className}>
      {TASK_STATUS[key] ?? status}
    </Badge>
  );
}

export function UrgentBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-warning to-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm",
        className,
      )}
    >
      <Zap className="size-2.5 fill-white" />
      Urgent
    </span>
  );
}
