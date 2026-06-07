import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Flag,
  Hash,
  Ban,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { StatusStepper } from "@/components/task/status-stepper";
import { StatusBadge, UrgentBadge } from "@/components/task/status-badge";
import { FeeBreakdown } from "@/components/task/fee-breakdown";
import { PaymentPanel } from "@/components/task/payment-panel";
import { ReportSheet } from "@/components/task/report-sheet";
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
  const toast = useToast();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

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
  const canReport =
    (isCustomer || isRunner) &&
    ["accepted", "in_progress", "completed", "cancelled"].includes(task.status);

  // WhatsApp target: the other party.
  const otherPhone = isCustomer
    ? task.runner?.phone_number
    : task.customer?.phone_number;
  const wa = accepted && otherPhone ? toWhatsAppNumber(otherPhone) : null;

  const onComplete = async () => {
    try {
      await complete.mutateAsync(task.id);
      toast.success("Task ditandai selesai. Beri rating untuk runner-mu.");
      navigate(`/tasks/${task.id}/tracking`);
    } catch {
      toast.error("Gagal menandai selesai. Coba lagi.");
    }
  };

  const onCancel = async () => {
    try {
      await cancel.mutateAsync({
        taskId: task.id,
        reason: task.status === "waiting_runner" ? undefined : reason.trim(),
      });
      toast.success("Task dibatalkan.");
      setCancelOpen(false);
    } catch {
      toast.error("Gagal membatalkan task. Pastikan alasan terisi.");
    }
  };

  return (
    <div className="min-h-dvh w-full max-w-md bg-background pb-8">
      <PageHeader
        title="Detail Task"
        subtitle={`#${task.public_code}`}
        action={
          canReport ? (
            <button
              onClick={() => setReportOpen(true)}
              aria-label="Laporkan masalah"
              className="flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted"
            >
              <Flag className="size-5" />
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-4 p-5">
        {/* Stepper (hidden when cancelled) */}
        {task.status !== "cancelled" && (
          <Card className="p-4">
            <StatusStepper status={task.status} />
          </Card>
        )}

        {/* Cancellation banner with reason */}
        {task.status === "cancelled" && (
          <div className="flex items-start gap-3 rounded-card bg-danger/10 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger">
              <Ban className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-danger">Task dibatalkan</p>
              {task.cancellation_reason ? (
                <p className="mt-0.5 text-sm text-ink-soft">
                  <span className="font-medium text-ink">Alasan: </span>
                  {task.cancellation_reason}
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-ink-muted">
                  Tidak ada alasan yang dicantumkan.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Title + desc */}
        <Card className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-ink">{task.title}</h2>
              {task.task_type === "urgent" && <UrgentBadge />}
            </div>
            <StatusBadge status={task.status} />
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
          <div className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-ink">
            <MapPin className="size-4 text-primary" /> {task.location_name}
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

        {/* Runner info (when assigned) */}
        {task.runner && (
          <Card className="flex items-center gap-3 p-4">
            <Avatar name={task.runner.full_name} size="md" />
            <div className="min-w-0">
              <p className="text-xs text-ink-muted">Runner</p>
              <p className="truncate font-semibold text-ink">
                {task.runner.full_name}
              </p>
            </div>
          </Card>
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
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
              >
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

        {/* Customer complete */}
        {canComplete && (
          <Button
            fullWidth
            size="lg"
            loading={complete.isPending}
            onClick={onComplete}
          >
            Tandai Selesai
          </Button>
        )}

        {/* Cancel */}
        {canCancel && (
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              setReason("");
              setCancelOpen(true);
            }}
            className="text-danger"
          >
            Batalkan Task
          </Button>
        )}
      </div>

      {/* Cancel sheet */}
      <Sheet
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Batalkan Task"
      >
        <p className="mb-3 text-sm text-ink-soft">
          {task.status === "waiting_runner"
            ? "Yakin ingin membatalkan task ini?"
            : "Beri tahu alasan pembatalan. Pihak lain akan mendapat notifikasi."}
        </p>
        {task.status !== "waiting_runner" && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Alasan pembatalan (wajib)"
            className="mb-4 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setCancelOpen(false)}
          >
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
      </Sheet>

      {/* Report sheet */}
      <ReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        taskId={task.id}
      />
    </div>
  );
}
