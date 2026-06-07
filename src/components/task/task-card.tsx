import { Link } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import { formatRupiah } from "@/lib/utils/cn";
import { StatusBadge, UrgentBadge } from "@/components/task/status-badge";
import { Card } from "@/components/ui/card";
import { TASK_CATEGORIES } from "@/lib/constants";
import type { TaskWithParties } from "@/features/tasks/api";

function categoryLabel(value: string): string {
  return TASK_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

interface TaskCardProps {
  task: TaskWithParties;
  to?: string;
  /** Show fee as runner earning vs customer total. */
  feeVariant?: "runner" | "customer";
  footer?: React.ReactNode;
}

export function TaskCard({
  task,
  to,
  feeVariant = "customer",
  footer,
}: TaskCardProps) {
  const fee = feeVariant === "runner" ? task.runner_fee : task.total_fee;
  const feeLabel = feeVariant === "runner" ? "Kamu terima" : "Total";

  const body = (
    <Card interactive={Boolean(to)} className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-bold text-ink">{task.title}</h3>
            {task.task_type === "urgent" && <UrgentBadge />}
          </div>
          <p className="text-xs font-medium text-ink-muted">
            {categoryLabel(task.category)}
          </p>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
        {task.description}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            {task.location_name}
            {task.distance_label ? ` · ${task.distance_label}` : ""}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3.5 shrink-0" />
          {timeAgo(task.created_at)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-3">
        <div>
          <span className="text-[11px] text-ink-muted">{feeLabel}</span>
          <p className="text-lg font-bold text-primary-dark">
            {formatRupiah(fee)}
          </p>
        </div>
        {footer}
      </div>
    </Card>
  );

  if (to) return <Link to={to}>{body}</Link>;
  return body;
}
