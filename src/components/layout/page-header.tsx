import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";

/** White header used on form/detail pages (back or close button + title). */
export function PageHeader({
  title,
  onBack,
  closeIcon = false,
}: {
  title: string;
  onBack?: () => void;
  closeIcon?: boolean;
}) {
  const navigate = useNavigate();
  const Icon = closeIcon ? X : ArrowLeft;
  return (
    <header className="safe-top sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        aria-label={closeIcon ? "Tutup" : "Kembali"}
        className="flex size-9 items-center justify-center rounded-lg hover:bg-surface-muted"
      >
        <Icon className="size-5" />
      </button>
      <h1 className="font-semibold text-ink">{title}</h1>
    </header>
  );
}
