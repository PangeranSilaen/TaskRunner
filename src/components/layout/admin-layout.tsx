import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShieldCheck, ClipboardList, Flag, LogOut } from "lucide-react";
import { signOut } from "@/features/auth/api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/verifications", label: "Verifikasi", icon: ShieldCheck, end: false },
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
      <header className="safe-top flex items-center justify-between bg-primary-dark px-5 pb-4 pt-5 text-white">
        <div>
          <h1 className="text-lg font-bold">Admin Task Runner</h1>
          <p className="text-xs text-white/70">Panel pengelolaan platform</p>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Keluar"
          className="flex size-9 items-center justify-center rounded-lg hover:bg-white/10"
        >
          <LogOut className="size-5" />
        </button>
      </header>

      <nav className="grid grid-cols-4 border-b border-line bg-surface">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-2.5 text-xs font-medium",
                isActive ? "text-primary" : "text-ink-muted",
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 p-5">
        <Outlet />
      </main>
    </div>
  );
}
