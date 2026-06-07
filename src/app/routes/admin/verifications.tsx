import { useState, useEffect } from "react";
import { ShieldCheck, ImageOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState, SkeletonCard } from "@/components/task/empty-state";
import { useToast } from "@/components/ui/toast";
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
      <div className="flex flex-col gap-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!pending || pending.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-ink">Verifikasi</h2>
        <EmptyState
          icon={ShieldCheck}
          title="Semua beres"
          message="Tidak ada user yang menunggu verifikasi saat ini."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-ink">
        Menunggu Verifikasi
        <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-sm text-amber-600">
          {pending.length}
        </span>
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
  const toast = useToast();
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
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <Avatar name={req.profile?.full_name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">
            {req.profile?.full_name || "Tanpa Nama"}
          </p>
          <p className="truncate text-sm text-ink-soft">{req.campus_email}</p>
          <p className="flex items-center gap-1.5 text-sm text-ink-soft">
            {req.phone_number}
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-semibold text-primary"
              >
                WhatsApp <ExternalLink className="size-3" />
              </a>
            )}
          </p>
        </div>
      </div>

      {ktmUrl ? (
        <a
          href={ktmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-2xl border border-line"
        >
          <img
            src={ktmUrl}
            alt="Foto KTM"
            className="max-h-52 w-full bg-surface-muted object-contain"
          />
        </a>
      ) : (
        <div className="flex h-28 flex-col items-center justify-center gap-2 rounded-2xl bg-surface-muted text-xs text-ink-muted">
          {req.ktm_photo_url ? (
            "Memuat foto KTM..."
          ) : (
            <>
              <ImageOff className="size-6" />
              Tidak ada foto KTM
            </>
          )}
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
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              fullWidth
              loading={review.isPending}
              disabled={reason.trim().length === 0}
              onClick={() =>
                review.mutate(
                  {
                    userId: req.user_id,
                    approve: false,
                    reason: reason.trim(),
                  },
                  {
                    onSuccess: () => toast.success("Verifikasi ditolak."),
                    onError: () => toast.error("Gagal memproses. Coba lagi."),
                  },
                )
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
            onClick={() =>
              review.mutate(
                { userId: req.user_id, approve: true },
                {
                  onSuccess: () => toast.success("User berhasil diverifikasi."),
                  onError: () => toast.error("Gagal memproses. Coba lagi."),
                },
              )
            }
          >
            <ShieldCheck className="size-4" /> Setujui
          </Button>
        </div>
      )}
    </Card>
  );
}
