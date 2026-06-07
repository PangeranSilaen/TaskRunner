import { ClipboardList } from "lucide-react";

/** Lightweight placeholder for tabs implemented in later phases. */
export function PlaceholderPage({
  title,
  subtitle,
  message,
}: {
  title: string;
  subtitle?: string;
  message: string;
}) {
  return (
    <div>
      <header className="safe-top rounded-b-3xl bg-primary px-5 pb-6 pt-6 text-white">
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/80">{subtitle}</p>}
      </header>
      <div className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <ClipboardList className="size-7" />
        </span>
        <p className="text-sm text-ink-muted">{message}</p>
      </div>
    </div>
  );
}
