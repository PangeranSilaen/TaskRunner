import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { ShieldCheck, ClipboardList, Flag, LogOut } from "lucide-react";
import { signOut } from "@/features/auth/api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { to: "/admin/verifications", label: "Verifikasi", icon: ShieldCheck },
  { to: "/admin/tasks", label: "Task", icon: ClipboardList },
  { to: "/admin/reports", label: "Laporan", icon: Flag },
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

      <nav className="grid grid-cols-3 border-b border-line bg-surface">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
