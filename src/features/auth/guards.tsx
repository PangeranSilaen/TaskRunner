import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, selectIsAdmin } from "@/stores/auth-store";
import { FullScreenLoader } from "@/components/ui/loader";

/** Requires an authenticated session; redirects guests to /auth/login. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!session) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

/** Only for guests; authenticated users get bounced to /home. */
export function RequireGuest({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore();
  if (loading) return <FullScreenLoader />;
  if (session) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

/** Admin-only routes. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore();
  const isAdmin = useAuthStore(selectIsAdmin);
  if (loading) return <FullScreenLoader />;
  if (!session) return <Navigate to="/auth/login" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  return <>{children}</>;
}
