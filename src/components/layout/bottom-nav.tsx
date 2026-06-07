import { NavLink } from "react-router-dom";
import { Home, ClipboardList, Bike, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/tasks", label: "Task Saya", icon: ClipboardList },
  { to: "/runner", label: "Runner", icon: Bike },
  { to: "/profile", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="safe-bottom sticky bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur-lg">
      <div className="mx-auto grid max-w-md grid-cols-4 px-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
