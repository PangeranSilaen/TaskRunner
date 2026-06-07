import { cn } from "@/lib/utils/cn";

const sizeMap = {
  sm: { box: "size-8", text: "text-sm", icon: "size-4" },
  md: { box: "size-10", text: "text-base", icon: "size-5" },
  lg: { box: "size-12", text: "text-lg", icon: "size-6" },
};

interface LogoProps {
  size?: keyof typeof sizeMap;
  withWordmark?: boolean;
  className?: string;
}

/**
 * Task Runner logo.
 *
 * SLOT: drop the final logo here. Replace the inline SVG `<mark>` below with an
 * <img src="/logo.svg" /> (place the asset in /public) once the Illustrator
 * export is ready. Everything else (sizing, wordmark) stays the same.
 */
export function Logo({ size = "md", withWordmark = true, className }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={s.box} iconClass={s.icon} />
      {withWordmark && (
        <span className={cn("font-bold tracking-tight text-ink", s.text)}>
          Task<span className="text-primary">Runner</span>
        </span>
      )}
    </div>
  );
}

/** The standalone mark (no wordmark). Placeholder until the real asset lands. */
export function LogoMark({
  className,
  iconClass,
}: {
  className?: string;
  iconClass?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-soft",
        className,
      )}
    >
      {/* Running figure glyph — swap for /logo.svg when ready */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("size-5", iconClass)}
        aria-hidden
      >
        <circle cx="13" cy="4" r="1.6" />
        <path d="M4 17l3-3 3 1 2-4 3 2h3" />
        <path d="M9 21l2-5 3-2" />
        <path d="M14 12l-1-4-4 1-2 3" />
      </svg>
    </div>
  );
}
