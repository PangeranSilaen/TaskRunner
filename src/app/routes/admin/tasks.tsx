import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/task/status-badge";
import { EmptyState } from "@/components/task/empty-state";
import { useAdminTasks, useAdminCancelTask } from "@/features/admin/hooks";
import { formatRupiah } from "@/lib/utils/cn";
import { cn } from "@/lib/utils/cn";

const filters = [
  { key: "all", label: "Semua" },
  { key: "waiting_runner", label: "Menunggu" },
  { key: "in_progress", label: "Proses" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Batal" },
] as const;

export function AdminTasksPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data: tasks, isLoading } = useAdminTasks(filter);
  const cancel = useAdminCancelTask();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-ink">Monitoring Task</h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.key
                ? "bg-primary text-white"
                : "border border-line bg-surface text-ink-soft",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : !tasks || tasks.length === 0 ? (
        <EmptyState message="Tidak ada task pada filter ini." />
      ) : (
        tasks.map((t) => (
          <div key={t.id} className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{t.title}</p>
                <p className="text-xs text-ink-muted">#{t.public_code}</p>
              </div>
              <StatusBadge status={t.status} />
            </div>
            <div className="text-xs text-ink-soft">
              <p>Customer: {t.customer?.full_name ?? "-"}</p>
              <p>Runner: {t.runner?.full_name ?? "Belum ada"}</p>
              <p>Total: {formatRupiah(t.total_fee)}</p>
            </div>

            {["waiting_runner", "accepted", "in_progress"].includes(t.status) &&
              (cancelId === t.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    placeholder="Alasan pembatalan (wajib)"
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => setCancelId(null)}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      fullWidth
                      loading={cancel.isPending}
                      disabled={reason.trim().length === 0}
                      onClick={() =>
                        cancel.mutate(
                          { taskId: t.id, reason: reason.trim() },
                          { onSuccess: () => setCancelId(null) },
                        )
                      }
                    >
                      Force Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReason("");
                    setCancelId(t.id);
                  }}
                >
                  <span className="text-danger">Batalkan Paksa</span>
                </Button>
              ))}
          </div>
        ))
      )}
    </div>
  );
}
