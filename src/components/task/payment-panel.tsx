import { useState, useEffect } from "react";
import { Upload, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePayment,
  useSubmitProof,
  useConfirmPayment,
} from "@/features/payments/hooks";
import { getProofSignedUrl } from "@/features/payments/api";
import { PAYMENT_STATUS } from "@/lib/constants";

interface PaymentPanelProps {
  taskId: string;
  method: string;
  isCustomer: boolean;
  isRunner: boolean;
}

/** Transfer payment flow: customer uploads proof, runner confirms. */
export function PaymentPanel({
  taskId,
  method,
  isCustomer,
  isRunner,
}: PaymentPanelProps) {
  const { data: payment } = usePayment(taskId);
  const submit = useSubmitProof(taskId);
  const confirm = useConfirmPayment(taskId);

  const [file, setFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (payment?.proof_url) {
      getProofSignedUrl(payment.proof_url).then((url) => {
        if (active) setProofUrl(url);
      });
    }
    return () => {
      active = false;
    };
  }, [payment?.proof_url]);

  if (method === "cash") {
    return (
      <div className="rounded-card bg-surface p-4 shadow-card">
        <h3 className="mb-1 text-sm font-semibold text-ink">Pembayaran</h3>
        <p className="text-sm text-ink-soft">
          Metode: Cash. Bayar langsung ke runner saat task selesai.
        </p>
      </div>
    );
  }

  const status = payment?.status ?? "unpaid";
  const confirmed = status === "runner_confirmed";

  const onUpload = async () => {
    setError(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Upload gagal. Coba lagi dengan file yang lebih kecil (maks 5MB).");
      return;
    }
    try {
      await submit.mutateAsync({ method, file });
      setFile(null);
    } catch {
      setError("Gagal mengunggah bukti. Coba lagi.");
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Pembayaran Transfer</h3>
        <span className="text-xs font-medium text-primary-dark">
          {PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS] ?? status}
        </span>
      </div>

      {/* Proof preview */}
      {proofUrl && (
        <a href={proofUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={proofUrl}
            alt="Bukti transfer"
            className="max-h-48 w-full rounded-lg border border-line object-contain"
          />
        </a>
      )}

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Customer: upload / re-upload proof (until confirmed) */}
      {isCustomer && !confirmed && (
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface-muted py-3 text-sm text-ink-soft">
            <Upload className="size-4" />
            {file ? file.name : "Pilih bukti transfer"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <Button
            fullWidth
            size="sm"
            disabled={!file}
            loading={submit.isPending}
            onClick={onUpload}
          >
            {payment?.proof_url ? "Unggah Ulang Bukti" : "Unggah Bukti"}
          </Button>
        </div>
      )}

      {/* Runner: confirm payment */}
      {isRunner && status === "proof_uploaded" && (
        <Button
          fullWidth
          size="sm"
          loading={confirm.isPending}
          onClick={() => confirm.mutate()}
        >
          <CheckCircle2 className="size-4" /> Konfirmasi Pembayaran
        </Button>
      )}

      {confirmed && (
        <p className="flex items-center gap-1.5 text-sm text-success">
          <CheckCircle2 className="size-4" /> Pembayaran dikonfirmasi runner.
        </p>
      )}

      {isRunner && status === "unpaid" && (
        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
          <Loader2 className="size-4" /> Menunggu customer mengunggah bukti.
        </p>
      )}
    </div>
  );
}
