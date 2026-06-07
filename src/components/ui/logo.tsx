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

/** The standalone Task Runner mark (no wordmark). */
export function LogoMark({
  className,
  iconClass,
}: {
  className?: string;
  /** @deprecated kept for call-site compatibility; ignored. */
  iconClass?: string;
}) {
  void iconClass;
  return (
    <img
      src="/logo.svg"
      alt="Task Runner"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}
