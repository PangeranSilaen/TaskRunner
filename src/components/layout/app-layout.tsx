import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/layout/bottom-nav";

/** Shell for the main authenticated tabs (home, tasks, runner, profile). */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh w-full max-w-md flex-col bg-background">
      <main className="flex-1 pb-2">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
