import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusStepper } from "@/components/task/status-stepper";
import { StatusBadge, UrgentBadge } from "@/components/task/status-badge";
import { FeeBreakdown } from "@/components/task/fee-breakdown";
import { PaymentPanel } from "@/components/task/payment-panel";
import { LocationPicker } from "@/components/map/location-picker";
import { useTask, useCompleteTask, useCancelTask } from "@/features/tasks/hooks";
import { useAuthStore } from "@/stores/auth-store";
import { TASK_CATEGORIES } from "@/lib/constants";
import { toWhatsAppNumber } from "@/lib/utils/validation";

function categoryLabel(value: string): string {
  return TASK_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.session?.user.id);
  const { data: task, isLoading } = useTask(id);
  const complete = useCompleteTask();
  const cancel = useCancelTask();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

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
        <PageHeader title="Detail Task" />
        <p className="p-5 text-sm text-ink-muted">Task tidak ditemukan.</p>
      </div>
    );
  }

  const isCustomer = task.customer_id === userId;
  const isRunner = task.runner_id === userId;
  const accepted = ["accepted", "in_progress"].includes(task.status);
  const canComplete = isCustomer && accepted;
  const canCancel =
    (isCustomer || isRunner) &&
    ["waiting_runner", "accepted", "in_progress"].includes(task.status);

  // WhatsApp target: the other party.
  const otherPhone = isCustomer
    ? task.runner?.phone_number
    : task.customer?.phone_number;
  const wa = accepted && otherPhone ? toWhatsAppNumber(otherPhone) : null;

  const onComplete = async () => {
    setActionError(null);
    try {
      await complete.mutateAsync(task.id);
      navigate(`/tasks/${task.id}/tracking`);
    } catch {
      setActionError("Gagal menandai selesai. Coba lagi.");
    }
  };

  const onCancel = async () => {
    setActionError(null);
    try {
      await cancel.mutateAsync({
        taskId: task.id,
        reason: task.status === "waiting_runner" ? undefined : reason.trim(),
      });
      setCancelOpen(false);
    } catch {
      setActionError("Gagal membatalkan task. Pastikan alasan terisi.");
    }
  };

  return (
    <div className="min-h-dvh w-full max-w-md bg-background pb-8">
      <PageHeader title="Detail Task" />

      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-muted">#{task.public_code}</span>
          <StatusBadge status={task.status} />
        </div>

        {/* Stepper */}
        <div className="rounded-card bg-surface p-4 shadow-card">
          <StatusStepper status={task.status} />
        </div>

        {/* Title + desc */}
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

        {/* Runner info (when assigned) */}
        {task.runner && (
          <div className="rounded-card bg-surface p-4 shadow-card">
            <p className="mb-1 text-xs text-ink-muted">Runner</p>
            <p className="font-semibold text-ink">{task.runner.full_name}</p>
          </div>
        )}

        {/* Fees */}
        <FeeBreakdown
          runnerFee={task.runner_fee}
          variant={isRunner ? "runner" : "customer"}
        />

        {/* Payment (after accepted) */}
        {accepted && (
          <PaymentPanel
            taskId={task.id}
            method={task.payment_method}
            isCustomer={isCustomer}
            isRunner={isRunner}
          />
        )}

        {/* Communication (after accepted) */}
        {accepted && (
          <div className="grid grid-cols-2 gap-3">
            <Link to={`/tasks/${task.id}/chat`}>
              <Button variant="outline" fullWidth>
                <MessageCircle className="size-4" /> Chat
              </Button>
            </Link>
            {wa ? (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" fullWidth>
                  <Phone className="size-4" /> WhatsApp
                </Button>
              </a>
            ) : (
              <Button variant="outline" fullWidth disabled>
                <Phone className="size-4" /> WhatsApp
              </Button>
            )}
          </div>
        )}

        {/* Tracking link */}
        {accepted && (
          <Link to={`/tasks/${task.id}/tracking`}>
            <Button variant="secondary" fullWidth>
              Lihat Tracking
            </Button>
          </Link>
        )}

        {actionError && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {actionError}
          </p>
        )}

        {/* Customer complete */}
        {canComplete && (
          <Button fullWidth size="lg" loading={complete.isPending} onClick={onComplete}>
            Tandai Selesai
          </Button>
        )}

        {/* Cancel */}
        {canCancel &&
          (cancelOpen ? (
            <div className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card">
              {task.status !== "waiting_runner" && (
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Alasan pembatalan (wajib)"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              )}
              <div className="flex gap-2">
                <Button variant="outline" fullWidth onClick={() => setCancelOpen(false)}>
                  Kembali
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  loading={cancel.isPending}
                  disabled={
                    task.status !== "waiting_runner" && reason.trim().length === 0
                  }
                  onClick={onCancel}
                >
                  Batalkan Task
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" fullWidth onClick={() => setCancelOpen(true)}>
              <span className="text-danger">Batalkan Task</span>
            </Button>
          ))}
      </div>
    </div>
  );
}
