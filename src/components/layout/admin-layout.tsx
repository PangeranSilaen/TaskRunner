import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  ClipboardList,
  Flag,
  LogOut,
} from "lucide-react";
import { signOut } from "@/features/auth/api";
import { useAuthStore } from "@/stores/auth-store";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  {
    to: "/admin/verifications",
    label: "Verifikasi",
    icon: ShieldCheck,
    end: false,
  },
  { to: "/admin/tasks", label: "Task", icon: ClipboardList, end: false },
  { to: "/admin/reports", label: "Laporan", icon: Flag, end: false },
] as const;

export function AdminLayout() {
  const navigate = useNavigate();
  const reset = useAuthStore((s) => s.reset);

  const handleLogout = async () => {
    await signOut();
    reset();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="flex min-h-dvh w-full max-w-md flex-col bg-background">
      <header className="safe-top bg-gradient-to-br from-primary-dark to-primary px-5 pb-4 pt-5 text-white shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark className="size-10" iconClass="size-5" />
            <div>
              <h1 className="text-base font-bold leading-tight">
                Admin Console
              </h1>
              <p className="text-xs text-white/70">Task Runner</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Keluar"
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/15 active:bg-white/15"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </header>

      <nav className="sticky top-0 z-10 grid grid-cols-4 border-b border-line bg-surface/95 backdrop-blur-lg">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-ink-muted",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="size-5"
                  strokeWidth={isActive ? 2.4 : 2}
                />
                {label}
                <span
                  className={cn(
                    "h-0.5 w-8 rounded-full transition-colors",
                    isActive ? "bg-primary" : "bg-transparent",
                  )}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 p-5">
        <Outlet />
      </main>
    </div>
  );
}
