import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { FullScreenLoader } from "@/components/ui/loader";
import {
  RequireAuth,
  RequireGuest,
  RequireAdmin,
} from "@/features/auth/guards";
import { AuthLayout } from "@/components/layout/auth-layout";
import { AppLayout } from "@/components/layout/app-layout";
import { AdminLayout } from "@/components/layout/admin-layout";
import { LoginPage } from "@/app/routes/auth/login";
import { RegisterPage } from "@/app/routes/auth/register";
import { HomePage } from "@/app/routes/home";
import { ProfilePage } from "@/app/routes/profile";
import { VerificationPage } from "@/app/routes/profile/verification";
import { SettingsPage } from "@/app/routes/profile/settings";
import { AdminIndexPage } from "@/app/routes/admin";
import { AdminVerificationsPage } from "@/app/routes/admin/verifications";
import { MyTasksPage } from "@/app/routes/tasks";
import { NewTaskPage } from "@/app/routes/tasks/new";
import { TaskDetailPage } from "@/app/routes/tasks/detail";
import { TrackingPage } from "@/app/routes/tasks/tracking";
import { ChatPage } from "@/app/routes/tasks/chat";
import { RunnerDashboardPage } from "@/app/routes/runner";
import { RunnerTaskDetailPage } from "@/app/routes/runner/detail";

export function App() {
  const init = useAuthStore((s) => s.init);
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    init();
  }, [init]);

  if (!initialized || loading) return <FullScreenLoader />;

  return (
    <Routes>
      {/* Auth (guests only) */}
      <Route
        element={
          <RequireGuest>
            <AuthLayout />
          </RequireGuest>
        }
      >
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
      </Route>

      {/* Verification stands alone (no bottom nav) */}
      <Route
        path="/profile/verification"
        element={
          <RequireAuth>
            <VerificationPage />
          </RequireAuth>
        }
      />
      <Route
        path="/profile/settings"
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />

      {/* Standalone task screens (no bottom nav) */}
      <Route
        path="/tasks/new"
        element={
          <RequireAuth>
            <NewTaskPage />
          </RequireAuth>
        }
      />
      <Route
        path="/tasks/:id"
        element={
          <RequireAuth>
            <TaskDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/tasks/:id/tracking"
        element={
          <RequireAuth>
            <TrackingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/tasks/:id/chat"
        element={
          <RequireAuth>
            <ChatPage />
          </RequireAuth>
        }
      />
      <Route
        path="/runner/tasks/:id"
        element={
          <RequireAuth>
            <RunnerTaskDetailPage />
          </RequireAuth>
        }
      />

      {/* Main tabs */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/tasks" element={<MyTasksPage />} />
        <Route path="/runner" element={<RunnerDashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Admin (admin role only) */}
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
        <Route
          path="/admin/tasks"
          element={
            <div className="rounded-card border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-muted">
              Monitoring task tersedia pada fase berikutnya.
            </div>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <div className="rounded-card border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-muted">
              Laporan masalah tersedia pada fase berikutnya.
            </div>
          }
        />
      </Route>
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminIndexPage />
          </RequireAdmin>
        }
      />

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
