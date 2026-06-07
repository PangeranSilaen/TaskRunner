import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

export type AdminTask = Tables<"tasks"> & {
  customer: Pick<Tables<"profiles">, "full_name"> | null;
  runner: Pick<Tables<"profiles">, "full_name"> | null;
};

export type AdminReport = Tables<"reports"> & {
  reporter: Pick<Tables<"profiles">, "full_name" | "email"> | null;
};

/** List all tasks for monitoring, optionally filtered by status. */
export async function adminListTasks(status?: string): Promise<AdminTask[]> {
  let query = supabase
    .from("tasks")
    .select(
      "*, customer:profiles!tasks_customer_id_fkey(full_name), runner:profiles!tasks_runner_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as AdminTask[];
}

/** Admin force-cancel a task with a reason. */
export async function adminCancelTask(taskId: string, reason: string) {
  const { error } = await supabase.rpc("cancel_task", {
    p_task_id: taskId,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function adminListReports(): Promise<AdminReport[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*, reporter:profiles!reports_reporter_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AdminReport[];
}

export async function adminUpdateReport(
  reportId: string,
  status: string,
  adminNotes?: string,
) {
  const { error } = await supabase
    .from("reports")
    .update({
      status,
      admin_notes: adminNotes ?? null,
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", reportId);
  if (error) throw error;
}

export interface AdminStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalUsers: number;
  pendingVerifications: number;
}

/** Lightweight platform stats for the admin dashboard. */
export async function adminGetStats(): Promise<AdminStats> {
  const [tasks, active, completed, users, pending] = await Promise.all([
    supabase.from("tasks").select("id", { count: "exact", head: true }),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("status", ["waiting_runner", "accepted", "in_progress"]),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("verification_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);
  return {
    totalTasks: tasks.count ?? 0,
    activeTasks: active.count ?? 0,
    completedTasks: completed.count ?? 0,
    totalUsers: users.count ?? 0,
    pendingVerifications: pending.count ?? 0,
  };
}
