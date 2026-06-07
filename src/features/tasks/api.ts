import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";
import { calculateFees } from "@/lib/utils/fees";
import { NORMAL_SERVICE_RADIUS_KM } from "@/lib/constants";
import type { CreateTaskInput } from "@/features/tasks/schemas";

export type Task = Tables<"tasks">;

/** Task joined with minimal customer/runner profile info. */
export interface TaskWithParties extends Task {
  customer: Pick<Tables<"profiles">, "full_name" | "phone_number"> | null;
  runner: Pick<Tables<"profiles">, "full_name" | "phone_number"> | null;
}

const TASK_SELECT =
  "*, customer:profiles!tasks_customer_id_fkey(full_name, phone_number), runner:profiles!tasks_runner_id_fkey(full_name, phone_number)";

export async function createTask(input: CreateTaskInput, customerId: string) {
  const fees = calculateFees(input.runnerFee);
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      customer_id: customerId,
      title: input.title,
      description: input.description,
      category: input.category,
      location_name: input.locationName,
      latitude: input.latitude,
      longitude: input.longitude,
      task_type: input.taskType,
      runner_fee: fees.runnerFee,
      platform_fee: fees.platformFee,
      total_fee: fees.totalFee,
      payment_method: input.paymentMethod,
      payment_status:
        input.paymentMethod === "cash" ? "cash_on_complete" : "unpaid",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

const ACTIVE_STATUSES = ["waiting_runner", "accepted", "in_progress"];

/** Customer's tasks filtered by a UI tab. */
export async function listMyTasks(
  tab: "active" | "completed" | "cancelled",
): Promise<TaskWithParties[]> {
  let query = supabase.from("tasks").select(TASK_SELECT);
  if (tab === "active") query = query.in("status", ACTIVE_STATUSES);
  else if (tab === "completed") query = query.eq("status", "completed");
  else query = query.eq("status", "cancelled");

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as TaskWithParties[];
}

/** Tasks where the current user is the assigned runner. */
export async function listRunnerTasks(
  tab: "active" | "completed",
  runnerId: string,
): Promise<TaskWithParties[]> {
  let query = supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("runner_id", runnerId);
  if (tab === "active") query = query.in("status", ["accepted", "in_progress"]);
  else query = query.eq("status", "completed");
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as TaskWithParties[];
}

export interface AvailableFilter {
  onlyUrgent?: boolean;
  maxFee?: number;
  minFee?: number;
}

/** Available tasks (waiting_runner) for runners, excluding own tasks. */
export async function listAvailableTasks(
  currentUserId: string,
  filter: AvailableFilter = {},
): Promise<TaskWithParties[]> {
  let query = supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("status", "waiting_runner")
    .neq("customer_id", currentUserId);

  if (filter.onlyUrgent) query = query.eq("task_type", "urgent");
  if (filter.minFee != null) query = query.gte("runner_fee", filter.minFee);
  if (filter.maxFee != null) query = query.lte("runner_fee", filter.maxFee);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as TaskWithParties[];
}

export async function getTask(taskId: string): Promise<TaskWithParties | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("id", taskId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as TaskWithParties | null;
}

export async function acceptTask(taskId: string) {
  const { error } = await supabase.rpc("accept_task", { p_task_id: taskId });
  if (error) throw error;
}

export async function startTask(taskId: string) {
  const { error } = await supabase.rpc("start_task", { p_task_id: taskId });
  if (error) throw error;
}

export async function completeTask(taskId: string) {
  const { error } = await supabase.rpc("complete_task", { p_task_id: taskId });
  if (error) throw error;
}

export async function cancelTask(taskId: string, reason?: string) {
  const { error } = await supabase.rpc("cancel_task", {
    p_task_id: taskId,
    p_reason: reason ?? undefined,
  });
  if (error) throw error;
}

/** Label a straight-line distance (km) relative to the normal service radius. */
export function distanceLabel(km: number): string {
  if (km > NORMAL_SERVICE_RADIUS_KM) return "Extra Distance";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
