import { NavLink } from "react-router-dom";
import { Home, ClipboardList, Bike, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/runner", label: "Runner", icon: Bike },
  { to: "/profile", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="safe-bottom sticky bottom-0 z-20 border-t border-line bg-surface">
      <div className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-ink-muted",
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
