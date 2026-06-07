import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const steps = [
  { key: "waiting_runner", label: "Menunggu" },
  { key: "accepted", label: "Diterima" },
  { key: "in_progress", label: "Dalam Proses" },
  { key: "completed", label: "Selesai" },
] as const;

const order: Record<string, number> = {
  waiting_runner: 0,
  accepted: 1,
  in_progress: 2,
  completed: 3,
};

export function StatusStepper({ status }: { status: string }) {
  const current = order[status] ?? 0;
  const cancelled = status === "cancelled";

  if (cancelled) {
    return (
      <div className="rounded-card bg-danger/10 px-4 py-3 text-center text-sm font-medium text-danger">
        Task dibatalkan
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div className="flex-1">
                {i > 0 && (
                  <div
                    className={cn(
                      "h-0.5 w-full",
                      i <= current ? "bg-primary" : "bg-line",
                    )}
                  />
                )}
              </div>
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  done && "bg-primary text-white",
                  active && "bg-primary text-white ring-4 ring-primary-soft",
                  !done && !active && "bg-surface-muted text-ink-muted",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </div>
              <div className="flex-1">
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-full",
                      i < current ? "bg-primary" : "bg-line",
                    )}
                  />
                )}
              </div>
            </div>
            <span
              className={cn(
                "mt-1 text-[10px]",
                active || done ? "font-medium text-ink" : "text-ink-muted",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
