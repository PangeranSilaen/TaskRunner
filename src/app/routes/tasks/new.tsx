import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationPicker } from "@/components/map/location-picker";
import { FeeBreakdown } from "@/components/task/fee-breakdown";
import { useToast } from "@/components/ui/toast";
import {
  createTaskSchema,
  type CreateTaskInput,
} from "@/features/tasks/schemas";
import { useCreateTask } from "@/features/tasks/hooks";
import { TASK_CATEGORIES, TASK_TYPE } from "@/lib/constants";
import { useAuthStore, selectIsVerified } from "@/stores/auth-store";
import { formatRupiah } from "@/lib/utils/cn";
import { cn } from "@/lib/utils/cn";

export function NewTaskPage() {
  const navigate = useNavigate();
  const isVerified = useAuthStore(selectIsVerified);
  const createTask = useCreateTask();
  const toast = useToast();

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [taskType, setTaskType] = useState<"regular" | "urgent">("regular");
  const [runnerFee, setRunnerFee] = useState<number>(TASK_TYPE.regular.minFee);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      taskType: "regular",
      runnerFee: TASK_TYPE.regular.minFee,
      paymentMethod: "cash",
    },
  });

  const selectType = (type: "regular" | "urgent") => {
    setTaskType(type);
    setValue("taskType", type);
    const min = TASK_TYPE[type].minFee;
    setRunnerFee(min);
    setValue("runnerFee", min);
  };

  const onFeeChange = (value: number) => {
    setRunnerFee(value);
    setValue("runnerFee", value);
  };

  const onPickLocation = (c: { lat: number; lng: number }) => {
    setCoords(c);
    setValue("latitude", c.lat, { shouldValidate: true });
    setValue("longitude", c.lng, { shouldValidate: true });
  };

  const onSubmit = async (values: CreateTaskInput) => {
    try {
      const task = await createTask.mutateAsync(values);
      toast.success("Task berhasil diposting!");
      navigate(`/tasks/${task.id}`, { replace: true });
    } catch {
      toast.error("Gagal memposting task. Silakan coba lagi.");
    }
  };

  const typeMeta = TASK_TYPE[taskType];

  return (
    <div className="min-h-dvh w-full max-w-md bg-background">
      <PageHeader title="Buat Task Baru" />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-5">
        {!isVerified && (
          <p className="rounded-xl bg-warning/10 px-3 py-2.5 text-sm font-medium text-amber-700">
            Akun kamu perlu diverifikasi terlebih dahulu.
          </p>
        )}

        <Input
          label="Judul Task"
          placeholder="Contoh: Titip beli kopi"
          error={errors.title?.message}
          {...register("title")}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Deskripsi</label>
          <textarea
            rows={3}
            placeholder="Jelaskan detail bantuan yang kamu butuhkan"
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-danger">{errors.description.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Kategori</label>
          <select
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            defaultValue=""
            {...register("category")}
          >
            <option value="" disabled>
              Pilih kategori
            </option>
            {TASK_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-danger">{errors.category.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Lokasi</label>
          <Input
            placeholder="Nama lokasi (cth: Gedung Kuliah Umum)"
            error={errors.locationName?.message}
            {...register("locationName")}
          />
          <div className="relative overflow-hidden rounded-xl">
            <LocationPicker value={coords} onChange={onPickLocation} />
            {!coords && (
              <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center">
                <span className="flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-medium text-white">
                  <MapPin className="size-3.5" /> Tap untuk pilih lokasi
                </span>
              </div>
            )}
          </div>
          {(errors.latitude || errors.longitude) && (
            <p className="text-xs text-danger">Lokasi task wajib dipilih.</p>
          )}
        </div>

        {/* Task type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Tipe Biaya</label>
          <div className="grid grid-cols-2 gap-3">
            {(["regular", "urgent"] as const).map((type) => {
              const meta = TASK_TYPE[type];
              const active = taskType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => selectType(type)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-2xl border-2 p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary-soft/50"
                      : "border-line bg-surface",
                  )}
                >
                  <span className="font-bold text-ink">{meta.label}</span>
                  <span className="text-xs text-ink-soft">
                    {formatRupiah(meta.minFee)} - {formatRupiah(meta.maxFee)}
                    {type === "urgent" ? "+" : ""}
                  </span>
                  <span className="text-xs text-ink-muted">{meta.etaLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Runner fee slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-ink">Biaya Runner</label>
            <span className="text-lg font-bold text-primary-dark">
              {formatRupiah(runnerFee)}
            </span>
          </div>
          <input
            type="range"
            min={typeMeta.minFee}
            max={typeMeta.maxFee}
            step={500}
            value={runnerFee}
            onChange={(e) => onFeeChange(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary-soft accent-primary"
          />
          <div className="flex justify-between text-[11px] text-ink-muted">
            <span>{formatRupiah(typeMeta.minFee)}</span>
            <span>{formatRupiah(typeMeta.maxFee)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line bg-surface px-3 py-2.5 text-sm font-medium has-[:checked]:border-primary has-[:checked]:bg-primary-soft/50">
              <input
                type="radio"
                value="cash"
                className="accent-primary"
                {...register("paymentMethod")}
              />
              Cash
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line bg-surface px-3 py-2.5 text-sm font-medium has-[:checked]:border-primary has-[:checked]:bg-primary-soft/50">
              <input
                type="radio"
                value="transfer"
                className="accent-primary"
                {...register("paymentMethod")}
              />
              Transfer
            </label>
          </div>
        </div>

        {/* Fee estimate */}
        <FeeBreakdown runnerFee={runnerFee} variant="customer" />

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={createTask.isPending}
          disabled={!isVerified}
        >
          Posting Task
        </Button>
      </form>
    </div>
  );
}
