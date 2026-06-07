import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/task/empty-state";
import { useAdminReports, useAdminUpdateReport } from "@/features/admin/hooks";
import { cn } from "@/lib/utils/cn";

const statusStyle: Record<string, string> = {
  open: "bg-warning/10 text-warning",
  in_progress: "bg-info/10 text-info",
  resolved: "bg-success/10 text-success",
};

const statusLabel: Record<string, string> = {
  open: "Terbuka",
  in_progress: "Diproses",
  resolved: "Selesai",
};

export function AdminReportsPage() {
  const { data: reports, isLoading } = useAdminReports();
  const update = useAdminUpdateReport();
  const [notesId, setNotesId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return <EmptyState message="Belum ada laporan masuk." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-ink">Laporan Masalah</h2>
      {reports.map((r) => (
        <div key={r.id} className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-ink">{r.reason}</p>
              <p className="text-xs text-ink-muted">
                Pelapor: {r.reporter?.full_name ?? "-"}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                statusStyle[r.status],
              )}
            >
              {statusLabel[r.status] ?? r.status}
            </span>
          </div>
          {r.description && (
            <p className="text-sm text-ink-soft">{r.description}</p>
          )}
          {r.admin_notes && (
            <p className="rounded-lg bg-surface-muted px-3 py-2 text-xs text-ink-soft">
              <span className="font-medium">Catatan admin: </span>
              {r.admin_notes}
            </p>
          )}

          {r.status !== "resolved" &&
            (notesId === r.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Catatan penyelesaian (opsional)"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setNotesId(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    fullWidth
                    loading={update.isPending}
                    onClick={() =>
                      update.mutate(
                        {
                          reportId: r.id,
                          status: "resolved",
                          adminNotes: notes.trim() || undefined,
                        },
                        { onSuccess: () => setNotesId(null) },
                      )
                    }
                  >
                    Tandai Selesai
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                {r.status === "open" && (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() =>
                      update.mutate({ reportId: r.id, status: "in_progress" })
                    }
                  >
                    Proses
                  </Button>
                )}
                <Button
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setNotes("");
                    setNotesId(r.id);
                  }}
                >
                  Selesaikan
                </Button>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
