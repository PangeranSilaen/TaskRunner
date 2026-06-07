import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, Clock, XCircle, ArrowLeft, Upload } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VERIFICATION_STATUS } from "@/lib/constants";
import {
  verificationSchema,
  type VerificationInput,
} from "@/features/verification/schemas";
import {
  useMyVerification,
  useSubmitVerification,
} from "@/features/verification/hooks";

const statusVisual = {
  incomplete: { icon: Clock, color: "text-ink-soft", bg: "bg-surface-muted" },
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  verified: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
  rejected: { icon: XCircle, color: "text-danger", bg: "bg-danger/10" },
} as const;

export function VerificationPage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const { data: request } = useMyVerification();
  const submit = useSubmitVerification();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const status = (profile?.verification_status ??
    "incomplete") as keyof typeof statusVisual;
  const visual = statusVisual[status];
  const Icon = visual.icon;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationInput>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { phone: profile?.phone_number ?? "" },
  });

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canEdit = status === "incomplete" || status === "rejected";

  const onSubmit = async (values: VerificationInput) => {
    setFormError(null);
    if (!file) {
      setFormError("Foto KTM wajib diunggah.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Upload gagal. Coba lagi dengan file yang lebih kecil (maks 5MB).");
      return;
    }
    try {
      await submit.mutateAsync({ phone: values.phone, file });
    } catch {
      setFormError("Gagal mengirim verifikasi. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-dvh w-full max-w-md bg-background">
      <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="flex size-9 items-center justify-center rounded-lg hover:bg-surface-muted"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-semibold text-ink">Verifikasi Akun</h1>
      </header>

      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col items-center gap-3 rounded-card bg-surface p-6 text-center shadow-card">
          <span
            className={`flex size-16 items-center justify-center rounded-2xl ${visual.bg}`}
          >
            <Icon className={`size-8 ${visual.color}`} />
          </span>
          <h2 className="text-lg font-bold text-ink">
            {VERIFICATION_STATUS[status]}
          </h2>
          <p className="text-sm text-ink-soft">
            {status === "verified"
              ? "Akun kamu sudah diverifikasi dengan email kampus ITK."
              : status === "pending"
                ? "Data kamu sedang ditinjau admin. Verifikasi biasanya memakan waktu 1x24 jam."
                : "Lengkapi nomor telepon dan upload foto KTM untuk diverifikasi admin."}
          </p>
        </div>

        {/* Rejection reason */}
        {status === "rejected" && request?.rejection_reason && (
          <div className="rounded-card bg-danger/10 p-3.5 text-sm text-danger">
            <span className="font-semibold">Alasan ditolak: </span>
            {request.rejection_reason}
          </div>
        )}

        {/* Checklist when verified */}
        {status === "verified" && (
          <div className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card">
            {["Email Kampus", "Nomor Telepon", "Foto KTM"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <ShieldCheck className="size-4 text-success" />
                <span className="text-ink">{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Form (only when editable) */}
        {canEdit && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 rounded-card bg-surface p-4 shadow-card"
          >
            <Input
              label="Nomor Telepon (WhatsApp)"
              type="tel"
              inputMode="tel"
              placeholder="08xxxxxxxxxx"
              error={errors.phone?.message}
              {...register("phone")}
            />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">
                Foto Kartu Tanda Mahasiswa (KTM)
              </span>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface-muted py-6 text-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview KTM"
                    className="max-h-40 rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <Upload className="size-6 text-ink-muted" />
                    <span className="text-sm text-ink-soft">
                      Tap untuk pilih foto KTM
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="text-xs text-ink-muted">
                Pastikan nama, NIM, dan foto pada KTM terlihat jelas.
              </p>
            </div>

            {formError && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                {formError}
              </p>
            )}

            <Button type="submit" fullWidth loading={submit.isPending}>
              {status === "rejected" ? "Kirim Ulang" : "Kirim Verifikasi"}
            </Button>
          </form>
        )}

        <Button variant="outline" fullWidth onClick={() => navigate("/home")}>
          Tutup
        </Button>
      </div>
    </div>
  );
}
