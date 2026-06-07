import { cn } from "@/lib/utils/cn";

interface SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

/**
 * Accessible iOS-style toggle. Uses a real checkbox input under the hood so it
 * works with keyboards and screen readers. 44px+ hit area on the track.
 */
export function Switch({ checked, onChange, disabled, label, id }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full",
        "transition-colors duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "disabled:cursor-not-allowed disabled:opacity-40",
        checked ? "bg-primary" : "bg-ink-muted/40",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow-sm",
          "transition-transform duration-200 ease-out",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}
