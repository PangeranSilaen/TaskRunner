import { Inbox } from "lucide-react";

export function EmptyState({
  message,
  icon: Icon = Inbox,
}: {
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-muted text-ink-muted">
        <Icon className="size-6" />
      </span>
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-card bg-surface p-4 shadow-card">
      <div className="mb-3 h-4 w-2/3 rounded bg-surface-muted" />
      <div className="mb-2 h-3 w-full rounded bg-surface-muted" />
      <div className="h-3 w-1/2 rounded bg-surface-muted" />
    </div>
  );
}
