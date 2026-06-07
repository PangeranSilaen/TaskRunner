import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState, SkeletonCard } from "@/components/task/empty-state";
import { useToast } from "@/components/ui/toast";
import { useAdminReports, useAdminUpdateReport } from "@/features/admin/hooks";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const statusTone: Record<string, Tone> = {
  open: "warning",
  in_progress: "info",
  resolved: "success",
};

const statusLabel: Record<string, string> = {
  open: "Terbuka",
  in_progress: "Diproses",
  resolved: "Selesai",
};

export function AdminReportsPage() {
  const { data: reports, isLoading } = useAdminReports();
  const update = useAdminUpdateReport();
  const toast = useToast();
  const [notesId, setNotesId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-ink">Laporan Masalah</h2>
        <EmptyState
          icon={Flag}
          title="Belum ada laporan"
          message="Laporan masalah dari pengguna akan tampil di sini."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-ink">Laporan Masalah</h2>
      {reports.map((r) => (
        <Card key={r.id} className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-ink">{r.reason}</p>
              <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                <Avatar name={r.reporter?.full_name} size="sm" />
                {r.reporter?.full_name ?? "Tanpa nama"}
              </span>
            </div>
            <Badge tone={statusTone[r.status] ?? "neutral"} dot>
              {statusLabel[r.status] ?? r.status}
            </Badge>
          </div>

          {r.description && (
            <p className="text-sm leading-relaxed text-ink-soft">
              {r.description}
            </p>
          )}
          {r.admin_notes && (
            <p className="rounded-xl bg-surface-muted px-3 py-2 text-xs text-ink-soft">
              <span className="font-semibold">Catatan admin: </span>
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
                        {
                          onSuccess: () => {
                            toast.success("Laporan ditandai selesai.");
                            setNotesId(null);
                          },
                          onError: () =>
                            toast.error("Gagal memperbarui laporan."),
                        },
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
                    loading={update.isPending}
                    onClick={() =>
                      update.mutate(
                        { reportId: r.id, status: "in_progress" },
                        {
                          onSuccess: () => toast.success("Laporan diproses."),
                          onError: () =>
                            toast.error("Gagal memperbarui laporan."),
                        },
                      )
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
        </Card>
      ))}
    </div>
  );
}
