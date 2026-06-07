import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/** Password field with a show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [show, setShow] = useState(false);
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={show ? "text" : "password"}
            aria-invalid={Boolean(error)}
            className={cn(
              "h-11 w-full rounded-xl border bg-surface pl-3.5 pr-11 text-sm text-ink",
              "placeholder:text-ink-muted",
              "focus:outline-none focus:ring-2 focus:ring-primary/40",
              error ? "border-danger" : "border-line",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition-colors hover:text-ink"
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
