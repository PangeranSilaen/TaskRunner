import { useState, useEffect } from "react";
import { ShieldCheck, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAdminPendingVerifications,
  useAdminReview,
} from "@/features/verification/hooks";
import { getKtmSignedUrl } from "@/lib/supabase/storage";
import type { PendingVerification } from "@/features/verification/api";
import { toWhatsAppNumber } from "@/lib/utils/validation";

export function AdminVerificationsPage() {
  const { data: pending, isLoading } = useAdminPendingVerifications();
  const [rejecting, setRejecting] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!pending || pending.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-muted">
        Belum ada user menunggu verifikasi.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-ink">
        Menunggu Verifikasi ({pending.length})
      </h2>
      {pending.map((req) => (
        <VerificationCard
          key={req.id}
          req={req}
          isRejecting={rejecting === req.user_id}
          onToggleReject={(open) => setRejecting(open ? req.user_id : null)}
        />
      ))}
    </div>
  );
}

function VerificationCard({
  req,
  isRejecting,
  onToggleReject,
}: {
  req: PendingVerification;
  isRejecting: boolean;
  onToggleReject: (open: boolean) => void;
}) {
  const review = useAdminReview();
  const [ktmUrl, setKtmUrl] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    let active = true;
    if (req.ktm_photo_url) {
      getKtmSignedUrl(req.ktm_photo_url).then((url) => {
        if (active) setKtmUrl(url);
      });
    }
    return () => {
      active = false;
    };
  }, [req.ktm_photo_url]);

  const wa = req.phone_number ? toWhatsAppNumber(req.phone_number) : null;

  return (
    <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
      <div>
        <p className="font-semibold text-ink">
          {req.profile?.full_name || "Tanpa Nama"}
        </p>
        <p className="text-sm text-ink-soft">{req.campus_email}</p>
        <p className="text-sm text-ink-soft">
          WhatsApp: {req.phone_number}
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-primary underline"
            >
              buka
            </a>
          )}
        </p>
      </div>

      {ktmUrl ? (
        <a href={ktmUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={ktmUrl}
            alt="Foto KTM"
            className="max-h-48 w-full rounded-lg border border-line object-contain"
          />
        </a>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-lg bg-surface-muted text-xs text-ink-muted">
          Memuat foto KTM...
        </div>
      )}

      {isRejecting ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Alasan penolakan (wajib)"
            rows={2}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => onToggleReject(false)}
            >
              <X className="size-4" /> Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              fullWidth
              loading={review.isPending}
              disabled={reason.trim().length === 0}
              onClick={() =>
                review.mutate({
                  userId: req.user_id,
                  approve: false,
                  reason: reason.trim(),
                })
              }
            >
              Tolak
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => onToggleReject(true)}
          >
            Tolak
          </Button>
          <Button
            size="sm"
            fullWidth
            loading={review.isPending}
            onClick={() => review.mutate({ userId: req.user_id, approve: true })}
          >
            <ShieldCheck className="size-4" /> Setujui
          </Button>
        </div>
      )}
    </div>
  );
}
