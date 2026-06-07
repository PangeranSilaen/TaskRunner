import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubmitRating } from "@/features/ratings/hooks";
import { cn } from "@/lib/utils/cn";

interface RatingModalProps {
  taskId: string;
  runnerId: string;
  runnerName?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function RatingModal({
  taskId,
  runnerId,
  runnerName,
  onClose,
  onSubmitted,
}: RatingModalProps) {
  const submit = useSubmitRating(taskId, runnerId);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (rating < 1) {
      setError("Pilih rating bintang terlebih dahulu.");
      return;
    }
    try {
      await submit.mutateAsync({ rating, review: review.trim() || undefined });
      onSubmitted?.();
      onClose();
    } catch {
      setError("Gagal mengirim rating. Coba lagi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-surface p-5 sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Beri Rating Runner</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-8 items-center justify-center rounded-lg hover:bg-surface-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        {runnerName && (
          <p className="mb-4 text-sm text-ink-soft">
            Bagaimana pengalamanmu dengan {runnerName}?
          </p>
        )}

        {/* Stars */}
        <div className="mb-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} bintang`}
            >
              <Star
                className={cn(
                  "size-9 transition-colors",
                  (hover || rating) >= n
                    ? "fill-warning text-warning"
                    : "text-line",
                )}
              />
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          placeholder="Tulis ulasan singkat (opsional)"
          className="mb-3 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />

        {error && (
          <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button fullWidth size="lg" loading={submit.isPending} onClick={onSubmit}>
          Kirim Rating
        </Button>
      </div>
    </div>
  );
}
