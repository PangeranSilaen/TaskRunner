import { Navigate } from "react-router-dom";

/** Admin entry point — redirect to the verifications tab. */
export function AdminIndexPage() {
  return <Navigate to="/admin/verifications" replace />;
}
