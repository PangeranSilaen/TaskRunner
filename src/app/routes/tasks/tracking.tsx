import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, MessageCircle, Phone, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusStepper } from "@/components/task/status-stepper";
import { LocationPicker } from "@/components/map/location-picker";
import {
  useTask,
  useStartTask,
  useCompleteTask,
} from "@/features/tasks/hooks";
import { useAuthStore } from "@/stores/auth-store";
import { TASK_TYPE } from "@/lib/constants";
import { toWhatsAppNumber } from "@/lib/utils/validation";

export function TrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.session?.user.id);
  const { data: task, isLoading } = useTask(id);
  const start = useStartTask();
  const complete = useCompleteTask();
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
        <PageHeader title="Tracking Task" />
        <p className="p-5 text-sm text-ink-muted">Task tidak ditemukan.</p>
      </div>
    );
  }

  const isCustomer = task.customer_id === userId;
  const isRunner = task.runner_id === userId;
  const accepted = ["accepted", "in_progress"].includes(task.status);

  const otherParty = isCustomer ? task.runner : task.customer;
  const wa =
    accepted && otherParty?.phone_number
      ? toWhatsAppNumber(otherParty.phone_number)
      : null;

  const eta = TASK_TYPE[task.task_type as "regular" | "urgent"]?.etaLabel ?? "";

  const onStart = async () => {
    setError(null);
    try {
      await start.mutateAsync(task.id);
    } catch {
      setError("Gagal memulai task. Coba lagi.");
    }
  };

  const onComplete = async () => {
    setError(null);
    try {
      await complete.mutateAsync(task.id);
    } catch {
      setError("Gagal menandai selesai. Coba lagi.");
    }
  };

  return (
    <div className="min-h-dvh w-full max-w-md bg-background pb-8">
      <PageHeader title="Tracking Task" />

      <div className="flex flex-col gap-4 p-5">
        <span className="text-xs text-ink-muted">#{task.public_code}</span>

        {/* Map */}
        {task.latitude != null && task.longitude != null && (
          <div className="overflow-hidden rounded-card shadow-card">
            <LocationPicker
              value={{ lat: task.latitude, lng: task.longitude }}
              onChange={() => {}}
              readOnly
              height={200}
            />
          </div>
        )}

        {/* Info bubble */}
        {accepted && (
          <div className="rounded-card bg-primary-soft/60 px-4 py-3 text-sm">
            <p className="font-medium text-primary-dark">
              {task.status === "accepted"
                ? "Runner akan segera menuju lokasi"
                : "Runner sedang mengerjakan task"}
            </p>
            {eta && <p className="text-xs text-ink-soft">Estimasi: {eta}</p>}
          </div>
        )}

        {/* Stepper */}
        <div className="rounded-card bg-surface p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-ink">Status Task</h3>
          <StatusStepper status={task.status} />
        </div>

        {/* Detail */}
        <div className="rounded-card bg-surface p-4 shadow-card">
          <h3 className="mb-2 text-sm font-semibold text-ink">Detail Task</h3>
          <p className="font-medium text-ink">{task.title}</p>
          <p className="mt-1 text-sm text-ink-soft">{task.description}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
            <MapPin className="size-3.5" /> {task.location_name}
          </div>
        </div>

        {/* Party info */}
        {otherParty && (
          <div className="rounded-card bg-surface p-4 shadow-card">
            <p className="mb-1 text-xs text-ink-muted">
              {isCustomer ? "Runner" : "Customer"}
            </p>
            <p className="font-semibold text-ink">{otherParty.full_name}</p>
          </div>
        )}

        {/* Communication */}
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

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {/* Runner: start task */}
        {isRunner && task.status === "accepted" && (
          <Button fullWidth size="lg" loading={start.isPending} onClick={onStart}>
            Mulai Kerjakan
          </Button>
        )}

        {/* Customer: mark complete */}
        {isCustomer && accepted && (
          <Button
            fullWidth
            size="lg"
            className="bg-ink hover:bg-ink/90"
            loading={complete.isPending}
            onClick={onComplete}
          >
            Tandai Selesai
          </Button>
        )}

        {task.status === "completed" && (
          <Button variant="secondary" fullWidth onClick={() => navigate("/tasks")}>
            Kembali ke My Tasks
          </Button>
        )}
      </div>
    </div>
  );
}
