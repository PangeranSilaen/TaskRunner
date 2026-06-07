import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, MessageCircle, Phone, MapPin, Star } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { StatusStepper } from "@/components/task/status-stepper";
import { RatingModal } from "@/components/task/rating-modal";
import { LocationPicker } from "@/components/map/location-picker";
import { useToast } from "@/components/ui/toast";
import {
  useTask,
  useTaskRealtime,
  useStartTask,
  useCompleteTask,
} from "@/features/tasks/hooks";
import { useTaskRating } from "@/features/ratings/hooks";
import { useAuthStore } from "@/stores/auth-store";
import { TASK_TYPE } from "@/lib/constants";
import { toWhatsAppNumber } from "@/lib/utils/validation";

export function TrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.session?.user.id);
  const { data: task, isLoading } = useTask(id);
  const { data: existingRating } = useTaskRating(id);
  const start = useStartTask();
  const complete = useCompleteTask();
  const toast = useToast();
  const [showRating, setShowRating] = useState(false);

  // Live status updates (accept -> start -> complete/cancel).
  useTaskRealtime(id);

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
    try {
      await start.mutateAsync(task.id);
      toast.success("Task dimulai. Selamat bekerja!");
    } catch {
      toast.error("Gagal memulai task. Coba lagi.");
    }
  };

  const onComplete = async () => {
    try {
      await complete.mutateAsync(task.id);
      if (isCustomer) setShowRating(true);
    } catch {
      toast.error("Gagal menandai selesai. Coba lagi.");
    }
  };

  return (
    <div className="min-h-dvh w-full max-w-md bg-background pb-8">
      <PageHeader title="Tracking Task" subtitle={`#${task.public_code}`} />

      <div className="flex flex-col gap-4 p-5">
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

        {/* Live status bubble */}
        {accepted && (
          <div className="flex items-start gap-3 rounded-card bg-primary-soft/60 px-4 py-3">
            <span className="relative mt-1 flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary-dark">
                {task.status === "accepted"
                  ? "Runner akan segera menuju lokasi"
                  : "Runner sedang mengerjakan task"}
              </p>
              {eta && <p className="text-xs text-ink-soft">Estimasi: {eta}</p>}
            </div>
          </div>
        )}

        {/* Stepper */}
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-bold text-ink">Status Task</h3>
          <StatusStepper status={task.status} />
        </Card>

        {/* Detail */}
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-bold text-ink">Detail Task</h3>
          <p className="font-semibold text-ink">{task.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {task.description}
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-ink-muted">
            <MapPin className="size-3.5" /> {task.location_name}
          </div>
        </Card>

        {/* Party info */}
        {otherParty && (
          <Card className="flex items-center gap-3 p-4">
            <Avatar name={otherParty.full_name} size="md" />
            <div className="min-w-0">
              <p className="text-xs text-ink-muted">
                {isCustomer ? "Runner" : "Customer"}
              </p>
              <p className="truncate font-semibold text-ink">
                {otherParty.full_name}
              </p>
            </div>
          </Card>
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

        {/* Runner: start task */}
        {isRunner && task.status === "accepted" && (
          <Button
            fullWidth
            size="lg"
            loading={start.isPending}
            onClick={onStart}
          >
            Mulai Kerjakan
          </Button>
        )}

        {/* Customer: mark complete */}
        {isCustomer && accepted && (
          <Button
            fullWidth
            size="lg"
            loading={complete.isPending}
            onClick={onComplete}
          >
            Tandai Selesai
          </Button>
        )}

        {task.status === "completed" && (
          <>
            {isCustomer && !existingRating && (
              <Button fullWidth size="lg" onClick={() => setShowRating(true)}>
                <Star className="size-4" /> Beri Rating
              </Button>
            )}
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate("/tasks")}
            >
              Kembali ke Task Saya
            </Button>
          </>
        )}
      </div>

      {showRating && task.runner_id && (
        <RatingModal
          taskId={task.id}
          runnerId={task.runner_id}
          runnerName={task.runner?.full_name ?? undefined}
          onClose={() => setShowRating(false)}
        />
      )}
    </div>
  );
}
