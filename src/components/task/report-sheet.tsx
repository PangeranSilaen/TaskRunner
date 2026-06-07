import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useCreateReport } from "@/features/reports/hooks";
import { cn } from "@/lib/utils/cn";

const REASONS = [
  "Runner tidak merespons",
  "Customer tidak merespons",
  "Pembayaran bermasalah",
  "Perilaku tidak pantas",
  "Task tidak sesuai deskripsi",
  "Lainnya",
] as const;

interface ReportSheetProps {
  open: boolean;
  onClose: () => void;
  taskId?: string | null;
  reportedUserId?: string | null;
}

export function ReportSheet({
  open,
  onClose,
  taskId,
  reportedUserId,
}: ReportSheetProps) {
  const create = useCreateReport();
  const toast = useToast();
  const [reason, setReason] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const reset = () => {
    setReason(null);
    setDescription("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = () => {
    if (!reason) return;
    create.mutate(
      { taskId, reportedUserId, reason, description },
      {
        onSuccess: () => {
          toast.success("Laporan terkirim. Admin akan meninjau.");
          handleClose();
        },
        onError: () => toast.error("Gagal mengirim laporan. Coba lagi."),
      },
    );
  };

  return (
    <Sheet open={open} onClose={handleClose} title="Laporkan Masalah">
      <p className="mb-3 text-sm text-ink-soft">
        Pilih jenis masalah yang ingin kamu laporkan ke admin.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {REASONS.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={cn(
              "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              reason === r
                ? "bg-primary text-white shadow-soft"
                : "border border-line bg-surface text-ink-soft",
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Jelaskan detail masalahnya (opsional)"
        className="mb-4 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />

      <Button
        fullWidth
        size="lg"
        loading={create.isPending}
        disabled={!reason}
        onClick={submit}
      >
        Kirim Laporan
      </Button>
    </Sheet>
  );
}
