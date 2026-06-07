import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { FullScreenLoader } from "@/components/ui/loader";
import {
  RequireAuth,
  RequireGuest,
} from "@/features/auth/guards";
import { AuthLayout } from "@/components/layout/auth-layout";
import { AppLayout } from "@/components/layout/app-layout";
import { LoginPage } from "@/app/routes/auth/login";
import { RegisterPage } from "@/app/routes/auth/register";
import { HomePage } from "@/app/routes/home";
import { ProfilePage } from "@/app/routes/profile";
import { VerificationPage } from "@/app/routes/profile/verification";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

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

      {/* Main tabs */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route
          path="/tasks"
          element={
            <PlaceholderPage
              title="My Tasks"
              subtitle="Kelola semua task kamu di sini"
              message="Daftar task akan tersedia pada fase berikutnya."
            />
          }
        />
        <Route
          path="/runner"
          element={
            <PlaceholderPage
              title="Runner Dashboard"
              subtitle="Pilih task yang ingin kamu kerjakan"
              message="Daftar task tersedia akan muncul pada fase berikutnya."
            />
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
