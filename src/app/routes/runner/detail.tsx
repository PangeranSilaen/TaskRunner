import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, MapPin, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { UrgentBadge } from "@/components/task/status-badge";
import { FeeBreakdown } from "@/components/task/fee-breakdown";
import { LocationPicker } from "@/components/map/location-picker";
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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      await accept.mutateAsync(task.id);
      navigate(`/tasks/${task.id}/tracking`, { replace: true });
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Gagal menerima task. Coba lagi.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-dvh w-full max-w-md bg-background pb-8">
      <PageHeader title="Detail Task" closeIcon onBack={() => navigate("/runner")} />

      <div className="flex flex-col gap-4 p-5">
        <div className="rounded-card bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-ink">{task.title}</h2>
            {task.task_type === "urgent" && <UrgentBadge />}
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">
            {categoryLabel(task.category)}
          </p>
          <p className="mt-2 text-sm text-ink-soft">{task.description}</p>
        </div>

        {/* Location */}
        <div className="rounded-card bg-surface p-4 shadow-card">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
            <MapPin className="size-4 text-primary" /> {task.location_name}
            {task.distance_label && (
              <span className="text-xs text-ink-muted">
                · {task.distance_label}
              </span>
            )}
          </div>
          {task.latitude != null && task.longitude != null && (
            <LocationPicker
              value={{ lat: task.latitude, lng: task.longitude }}
              onChange={() => {}}
              readOnly
              height={160}
            />
          )}
        </div>

        {/* Posted time + customer */}
        <div className="rounded-card bg-surface p-4 shadow-card text-sm">
          <div className="flex items-center gap-2 text-ink-soft">
            <Clock className="size-4" /> Diposting {formatDateTime(task.created_at)}
          </div>
          {task.customer && (
            <p className="mt-2 text-ink">
              <span className="text-ink-muted">Customer: </span>
              {task.customer.full_name}
            </p>
          )}
        </div>

        {/* Estimated earning */}
        <FeeBreakdown runnerFee={task.runner_fee} variant="runner" />

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {isOwnTask ? (
          <p className="rounded-lg bg-surface-muted px-3 py-2 text-center text-sm text-ink-muted">
            Ini task milikmu sendiri.
          </p>
        ) : !available ? (
          <p className="rounded-lg bg-surface-muted px-3 py-2 text-center text-sm text-ink-muted">
            Task ini sudah tidak tersedia.
          </p>
        ) : (
          <Button
            fullWidth
            size="lg"
            loading={accept.isPending}
            onClick={onAccept}
          >
            Terima Task
          </Button>
        )}
      </div>
    </div>
  );
}
