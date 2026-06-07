import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase/client";
import { APP_NAME, APP_VERSION } from "@/lib/constants";
import { toWhatsAppNumber } from "@/lib/utils/validation";
import { cn } from "@/lib/utils/cn";

type Tab = "umum" | "akun" | "notifikasi";

interface AccountForm {
  fullName: string;
  phone: string;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [tab, setTab] = useState<Tab>("umum");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<AccountForm>({
    defaultValues: {
      fullName: profile?.full_name ?? "",
      phone: profile?.phone_number ?? "",
    },
  });

  const onSaveAccount = async (values: AccountForm) => {
    setError(null);
    setSaved(false);
    if (values.phone && toWhatsAppNumber(values.phone) === null) {
      setError("Nomor WhatsApp tidak valid.");
      return;
    }
    const { error: err } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        phone_number: values.phone || null,
      })
      .eq("id", profile!.id);
    if (err) {
      setError("Gagal menyimpan perubahan. Coba lagi.");
      return;
    }
    await refreshProfile();
    setSaved(true);
  };

  return (
    <div className="min-h-dvh w-full max-w-md bg-background">
      <PageHeader title="Pengaturan" closeIcon onBack={() => navigate("/profile")} />

      {/* Tabs */}
      <div className="grid grid-cols-3 border-b border-line bg-surface">
        {(["umum", "akun", "notifikasi"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "py-3 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-ink-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 p-5">
        {tab === "umum" && (
          <>
            <ToggleRow label="Mode Gelap" hint="Segera hadir" disabled />
            <ToggleRow label="Suara Notifikasi" defaultOn />
            <div className="rounded-card bg-surface p-4 shadow-card text-sm">
              <p className="font-medium text-ink">Tentang Aplikasi</p>
              <p className="mt-1 text-ink-soft">
                {APP_NAME} v{APP_VERSION}
              </p>
              <p className="text-ink-muted">
                © 2026 Institut Teknologi Kalimantan
              </p>
            </div>
          </>
        )}

        {tab === "akun" && (
          <form
            onSubmit={handleSubmit(onSaveAccount)}
            className="flex flex-col gap-4"
          >
            <Input label="Nama Lengkap" {...register("fullName")} />
            <Input
              label="Email"
              value={profile?.email ?? ""}
              disabled
              readOnly
            />
            <Input
              label="Nomor Telepon (WhatsApp)"
              type="tel"
              placeholder="08xxxxxxxxxx"
              {...register("phone")}
            />
            {error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            {saved && (
              <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                Perubahan disimpan.
              </p>
            )}
            <Button type="submit" fullWidth>
              Simpan Perubahan
            </Button>
          </form>
        )}

        {tab === "notifikasi" && (
          <>
            <ToggleRow label="Notifikasi Push" hint="Segera hadir" disabled />
            <ToggleRow label="Task baru tersedia" defaultOn />
            <ToggleRow label="Task diterima runner" defaultOn />
            <ToggleRow label="Pesan baru" defaultOn />
            <p className="text-xs text-ink-muted">
              Preferensi notifikasi push akan tersedia setelah MVP stabil.
              Saat ini notifikasi tampil di dalam aplikasi.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  defaultOn = false,
  disabled = false,
}: {
  label: string;
  hint?: string;
  defaultOn?: boolean;
  disabled?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between rounded-card bg-surface p-4 shadow-soft">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {hint && <p className="text-xs text-ink-muted">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={() => setOn((v) => !v)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors disabled:opacity-40",
          on ? "bg-primary" : "bg-line",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
            on ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
