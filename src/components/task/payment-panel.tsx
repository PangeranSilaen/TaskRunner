import { useState, useEffect } from "react";
import { Upload, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
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

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const statusTone: Record<string, Tone> = {
  unpaid: "neutral",
  proof_uploaded: "warning",
  runner_confirmed: "success",
};

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
  const toast = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

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
      <Card className="flex items-start gap-3 p-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Wallet className="size-5" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-ink">Pembayaran Cash</h3>
          <p className="text-sm text-ink-soft">
            Bayar langsung ke runner saat task selesai.
          </p>
        </div>
      </Card>
    );
  }

  const status = payment?.status ?? "unpaid";
  const confirmed = status === "runner_confirmed";

  const onUpload = async () => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File terlalu besar. Maksimal 5MB.");
      return;
    }
    try {
      await submit.mutateAsync({ method, file });
      setFile(null);
      toast.success("Bukti transfer terunggah.");
    } catch {
      toast.error("Gagal mengunggah bukti. Coba lagi.");
    }
  };

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">Pembayaran Transfer</h3>
        <Badge tone={statusTone[status] ?? "neutral"} dot>
          {PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS] ?? status}
        </Badge>
      </div>

      {/* Proof preview */}
      {proofUrl && (
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-xl border border-line"
        >
          <img
            src={proofUrl}
            alt="Bukti transfer"
            className="max-h-48 w-full bg-surface-muted object-contain"
          />
        </a>
      )}

      {/* Customer: upload / re-upload proof (until confirmed) */}
      {isCustomer && !confirmed && (
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-surface-muted/60 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-primary/40">
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
          onClick={() =>
            confirm.mutate(undefined, {
              onSuccess: () => toast.success("Pembayaran dikonfirmasi."),
              onError: () => toast.error("Gagal konfirmasi. Coba lagi."),
            })
          }
        >
          <CheckCircle2 className="size-4" /> Konfirmasi Pembayaran
        </Button>
      )}

      {confirmed && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-success">
          <CheckCircle2 className="size-4" /> Pembayaran dikonfirmasi runner.
        </p>
      )}

      {isRunner && status === "unpaid" && (
        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
          <Loader2 className="size-4 animate-spin" /> Menunggu customer
          mengunggah bukti.
        </p>
      )}
    </Card>
  );
}
