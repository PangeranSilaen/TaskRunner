import { cn } from "@/lib/utils/cn";

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
};

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-primary-soft font-semibold text-primary-dark select-none",
        sizes[size],
        className,
      )}
      aria-hidden={!name}
    >
      {src ? (
        <img
          src={src}
          alt={name ?? ""}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
