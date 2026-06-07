import { Outlet, useNavigate } from "react-router-dom";
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
import { TabBar, type TabItem } from "@/components/layout/tab-bar";

const navItems: readonly TabItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/verifications", label: "Verifikasi", icon: ShieldCheck },
  { to: "/admin/tasks", label: "Task", icon: ClipboardList },
  { to: "/admin/reports", label: "Laporan", icon: Flag },
];

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
      <header className="safe-top sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/95 px-4 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-9" />
          <div>
            <h1 className="text-sm font-bold leading-tight text-ink">
              Admin Console
            </h1>
            <p className="text-[11px] text-ink-muted">Task Runner</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Keluar"
          className="flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted active:bg-surface-muted"
        >
          <LogOut className="size-5" />
        </button>
      </header>

      <main className="flex-1 p-5">
        <Outlet />
      </main>

      <TabBar items={navItems} />
    </div>
  );
}
