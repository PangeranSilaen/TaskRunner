import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";

/** White header used on form/detail pages (back or close button + title). */
export function PageHeader({
  title,
  subtitle,
  onBack,
  closeIcon = false,
  action,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  closeIcon?: boolean;
  /** Optional right-aligned slot (e.g. menu, call button). */
  action?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const Icon = closeIcon ? X : ArrowLeft;
  return (
    <header className="safe-top sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface/95 px-3 py-3 backdrop-blur-lg">
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        aria-label={closeIcon ? "Tutup" : "Kembali"}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted active:bg-surface-muted"
      >
        <Icon className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold leading-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs text-ink-soft">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
