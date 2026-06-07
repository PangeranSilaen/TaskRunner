import { useParams, useNavigate } from "react-router-dom";
import { Loader2, MapPin, Clock, Hash } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { UrgentBadge } from "@/components/task/status-badge";
import { FeeBreakdown } from "@/components/task/fee-breakdown";
import { LocationPicker } from "@/components/map/location-picker";
import { useToast } from "@/components/ui/toast";
import { useTask, useAcceptTask } from "@/features/tasks/hooks";
import { useAuthStore } from "@/stores/auth-store";
import { TASK_CATEGORIES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils/cn";

function categoryLabel(value: string): string {
  return TASK_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function RunnerTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.session?.user.id);
  const { data: task, isLoading } = useTask(id);
  const accept = useAcceptTask();
  const toast = useToast();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-dvh w-full max-w-md bg-background">
        <PageHeader title="Detail Task" closeIcon />
        <p className="p-5 text-sm text-ink-muted">Task tidak ditemukan.</p>
      </div>
    );
  }

  const isOwnTask = task.customer_id === userId;
  const available = task.status === "waiting_runner";

  const onAccept = async () => {
    try {
      await accept.mutateAsync(task.id);
      toast.success("Task diterima! Selamat bekerja.");
      navigate(`/tasks/${task.id}/tracking`, { replace: true });
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Gagal menerima task. Coba lagi.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-dvh w-full max-w-md bg-background pb-28">
      <PageHeader
        title="Detail Task"
        subtitle={`#${task.public_code}`}
        closeIcon
        onBack={() => navigate("/runner")}
      />

      <div className="flex flex-col gap-4 p-5">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-ink">{task.title}</h2>
            {task.task_type === "urgent" && <UrgentBadge />}
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-ink-muted">
            <Hash className="size-3" />
            {categoryLabel(task.category)}
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
            {task.description}
          </p>
        </Card>

        {/* Location */}
        <Card className="p-4">
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-ink">
            <MapPin className="size-4 text-primary" /> {task.location_name}
            {task.distance_label && (
              <span className="text-xs font-normal text-ink-muted">
                · {task.distance_label}
              </span>
            )}
          </div>
          {task.latitude != null && task.longitude != null && (
            <div className="overflow-hidden rounded-xl">
              <LocationPicker
                value={{ lat: task.latitude, lng: task.longitude }}
                onChange={() => {}}
                readOnly
                height={160}
              />
            </div>
          )}
        </Card>

        {/* Posted time + customer */}
        <Card className="flex flex-col gap-3 p-4 text-sm">
          <div className="flex items-center gap-2 text-ink-soft">
            <Clock className="size-4" /> Diposting{" "}
            {formatDateTime(task.created_at)}
          </div>
          {task.customer && (
            <div className="flex items-center gap-2.5 border-t border-line pt-3">
              <Avatar name={task.customer.full_name} size="md" />
              <div className="min-w-0">
                <p className="text-xs text-ink-muted">Customer</p>
                <p className="truncate font-semibold text-ink">
                  {task.customer.full_name}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Estimated earning */}
        <FeeBreakdown runnerFee={task.runner_fee} variant="runner" />

        {isOwnTask && (
          <p className="rounded-xl bg-surface-muted px-3 py-2.5 text-center text-sm text-ink-muted">
            Ini task milikmu sendiri.
          </p>
        )}
        {!isOwnTask && !available && (
          <p className="rounded-xl bg-surface-muted px-3 py-2.5 text-center text-sm text-ink-muted">
            Task ini sudah tidak tersedia.
          </p>
        )}
      </div>

      {/* Sticky accept CTA in thumb zone */}
      {!isOwnTask && available && (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-line bg-surface/95 p-4 backdrop-blur-lg">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-ink-soft">Kamu akan menerima</span>
            <span className="text-lg font-bold text-primary-dark">
              {task.runner_fee.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              })}
            </span>
          </div>
          <Button
            fullWidth
            size="lg"
            loading={accept.isPending}
            onClick={onAccept}
          >
            Terima Task
          </Button>
        </div>
      )}
    </div>
  );
}
