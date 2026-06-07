import {
  Zap,
  Clock,
  CheckCheck,
  Bike,
  CheckCircle2,
  Ban,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TaskStatus } from "@/lib/constants";
import { TASK_STATUS } from "@/lib/constants";

interface StatusStyle {
  gradient: string;
  icon: LucideIcon;
}

const styles: Record<TaskStatus, StatusStyle> = {
  waiting_runner: { gradient: "from-amber-400 to-amber-500", icon: Clock },
  accepted: { gradient: "from-info to-blue-600", icon: CheckCheck },
  in_progress: { gradient: "from-primary to-accent", icon: Bike },
  completed: { gradient: "from-success to-emerald-600", icon: CheckCircle2 },
  cancelled: { gradient: "from-rose-500 to-red-600", icon: Ban },
};

/** Shared gradient-pill look (matches the URGENT badge concept). */
function Pill({
  gradient,
  icon: Icon,
  children,
  className,
}: {
  gradient: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm",
        gradient,
        className,
      )}
    >
      <Icon className="size-2.5" strokeWidth={2.5} />
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status as TaskStatus;
  const style = styles[key];
  if (!style) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft",
          className,
        )}
      >
        {status}
      </span>
    );
  }
  return (
    <Pill gradient={style.gradient} icon={style.icon} className={className}>
      {TASK_STATUS[key] ?? status}
    </Pill>
  );
}

export function UrgentBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full bg-gradient-to-r from-warning to-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm",
        className,
      )}
    >
      <Zap className="size-2.5 fill-white" />
      Urgent
    </span>
  );
}
