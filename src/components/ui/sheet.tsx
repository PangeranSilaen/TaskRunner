import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Hide the close (X) button in the header. */
  hideClose?: boolean;
  className?: string;
}

/**
 * Mobile bottom sheet. Slides up from the bottom (thumb zone), dims the
 * backdrop, locks body scroll, and closes on backdrop tap / Escape.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  hideClose = false,
  className,
}: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-ink/40 animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 w-full max-w-md rounded-t-3xl bg-surface",
          "shadow-[0_-8px_32px_rgba(15,23,42,0.18)] safe-bottom",
          "animate-[sheetUp_0.22s_cubic-bezier(0.32,0.72,0,1)]",
          className,
        )}
      >
        <div className="flex justify-center pt-3">
          <span className="h-1.5 w-10 rounded-full bg-line" />
        </div>
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-5 pb-2 pt-3">
            <h2 className="text-base font-bold text-ink">{title}</h2>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted active:bg-surface-muted"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        )}
        <div className="max-h-[75vh] overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}
