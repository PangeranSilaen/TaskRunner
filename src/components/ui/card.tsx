import { cn } from "@/lib/utils/cn";

/**
 * Surface card. Use `interactive` for tappable cards (adds press feedback).
 */
export function Card({
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-card bg-surface shadow-card",
        interactive &&
          "transition-transform duration-150 active:scale-[0.98] cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
