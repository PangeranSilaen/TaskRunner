import { useState } from "react";
import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/task/status-badge";
import { EmptyState, SkeletonCard } from "@/components/task/empty-state";
import { useToast } from "@/components/ui/toast";
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
  const toast = useToast();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const closeSheet = () => {
    setCancelId(null);
    setReason("");
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-ink">Monitoring Task</h2>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === f.key
                ? "bg-primary text-white shadow-soft"
                : "border border-line bg-surface text-ink-soft",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !tasks || tasks.length === 0 ? (
        <EmptyState
          title="Tidak ada task"
          message="Belum ada task pada filter ini."
        />
      ) : (
        tasks.map((t) => (
          <Card key={t.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{t.title}</p>
                <p className="text-xs font-medium text-ink-muted">
                  #{t.public_code}
                </p>
              </div>
              <StatusBadge status={t.status} />
            </div>

            <div className="flex flex-col gap-2 rounded-2xl bg-surface-muted/60 p-3 text-sm">
              <PartyRow
                label="Customer"
                name={t.customer?.full_name ?? "-"}
              />
              <PartyRow
                label="Runner"
                name={t.runner?.full_name ?? null}
              />
              <div className="flex items-center justify-between border-t border-line pt-2">
                <span className="text-xs text-ink-muted">Total biaya</span>
                <span className="font-bold text-primary-dark">
                  {formatRupiah(t.total_fee)}
                </span>
              </div>
            </div>

            {["waiting_runner", "accepted", "in_progress"].includes(
              t.status,
            ) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReason("");
                  setCancelId(t.id);
                }}
                className="text-danger"
              >
                <Ban className="size-4" /> Batalkan Paksa
              </Button>
            )}
          </Card>
        ))
      )}

      <Sheet
        open={cancelId !== null}
        onClose={closeSheet}
        title="Batalkan Task Paksa"
      >
        <p className="mb-3 text-sm text-ink-soft">
          Task akan dibatalkan dan kedua pihak mendapat notifikasi. Tindakan ini
          tidak bisa dibatalkan.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Alasan pembatalan (wajib)"
          className="mb-4 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="flex gap-2">
          <Button variant="outline" fullWidth onClick={closeSheet}>
            Batal
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={cancel.isPending}
            disabled={reason.trim().length === 0}
            onClick={() =>
              cancelId &&
              cancel.mutate(
                { taskId: cancelId, reason: reason.trim() },
                {
                  onSuccess: () => {
                    toast.success("Task berhasil dibatalkan.");
                    closeSheet();
                  },
                  onError: () =>
                    toast.error("Gagal membatalkan task. Coba lagi."),
                },
              )
            }
          >
            Force Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function PartyRow({ label, name }: { label: string; name: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-ink-muted">{label}</span>
      {name ? (
        <span className="flex items-center gap-1.5 text-ink">
          <Avatar name={name} size="sm" />
          <span className="truncate font-medium">{name}</span>
        </span>
      ) : (
        <span className="text-ink-muted">Belum ada</span>
      )}
    </div>
  );
}
