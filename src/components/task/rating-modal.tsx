import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { useSubmitRating } from "@/features/ratings/hooks";
import { cn } from "@/lib/utils/cn";

interface RatingModalProps {
  taskId: string;
  runnerId: string;
  runnerName?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

const labels = ["", "Buruk", "Kurang", "Cukup", "Bagus", "Luar biasa"];

export function RatingModal({
  taskId,
  runnerId,
  runnerName,
  onClose,
  onSubmitted,
}: RatingModalProps) {
  const submit = useSubmitRating(taskId, runnerId);
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");

  const onSubmit = async () => {
    if (rating < 1) {
      toast.error("Pilih rating bintang terlebih dahulu.");
      return;
    }
    try {
      await submit.mutateAsync({ rating, review: review.trim() || undefined });
      toast.success("Terima kasih atas penilaianmu!");
      onSubmitted?.();
      onClose();
    } catch {
      toast.error("Gagal mengirim rating. Coba lagi.");
    }
  };

  const display = hover || rating;

  return (
    <Sheet open onClose={onClose} title="Beri Rating Runner">
      <div className="flex flex-col items-center gap-2 pb-2">
        <Avatar name={runnerName} size="lg" />
        {runnerName && (
          <p className="text-sm text-ink-soft">
            Bagaimana pengalamanmu dengan{" "}
            <span className="font-semibold text-ink">{runnerName}</span>?
          </p>
        )}
      </div>

      {/* Stars */}
      <div className="my-3 flex flex-col items-center gap-1.5">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} bintang`}
              className="transition-transform active:scale-90"
            >
              <Star
                className={cn(
                  "size-10 transition-colors",
                  display >= n ? "fill-warning text-warning" : "text-line",
                )}
              />
            </button>
          ))}
        </div>
        <span className="h-5 text-sm font-semibold text-primary-dark">
          {labels[display]}
        </span>
      </div>

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={3}
        placeholder="Tulis ulasan singkat (opsional)"
        className="mb-4 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />

      <Button
        fullWidth
        size="lg"
        loading={submit.isPending}
        onClick={onSubmit}
      >
        Kirim Rating
      </Button>
    </Sheet>
  );
}
