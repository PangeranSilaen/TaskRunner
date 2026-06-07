import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface TabItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Exact match (used for index routes like /admin). */
  end?: boolean;
}

/**
 * Shared mobile bottom navigation. Used by both the user app shell and the
 * admin console so the two stay visually consistent. Thumb-zone, 56px targets,
 * pill active state.
 */
export function TabBar({ items }: { items: readonly TabItem[] }) {
  return (
    <nav className="safe-bottom sticky bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur-lg">
      <div
        className="mx-auto grid max-w-md px-1"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "group relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-ink-muted",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full px-4 py-1 transition-all duration-200",
                    isActive ? "bg-primary-soft" : "bg-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 transition-transform duration-200",
                      isActive && "scale-110",
                    )}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
