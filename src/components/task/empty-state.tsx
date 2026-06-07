import { Inbox } from "lucide-react";

export function EmptyState({
  message,
  title,
  icon: Icon = Inbox,
  action,
}: {
  message: string;
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional CTA rendered below the message (e.g. a Button). */
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft/60 text-primary">
        <Icon className="size-7" />
      </span>
      {title && <p className="text-sm font-bold text-ink">{title}</p>}
      <p className="max-w-[16rem] text-sm text-ink-muted">{message}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-card bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-4 w-1/2 rounded-full bg-surface-muted animate-pulse" />
        <div className="h-5 w-16 rounded-full bg-surface-muted animate-pulse" />
      </div>
      <div className="mb-2 h-3 w-full rounded-full bg-surface-muted animate-pulse" />
      <div className="mb-4 h-3 w-3/4 rounded-full bg-surface-muted animate-pulse" />
      <div className="flex items-center justify-between border-t border-line pt-3">
        <div className="h-5 w-20 rounded-full bg-surface-muted animate-pulse" />
        <div className="h-8 w-24 rounded-xl bg-surface-muted animate-pulse" />
      </div>
    </div>
  );
}
