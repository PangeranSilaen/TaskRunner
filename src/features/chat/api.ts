import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

export type TaskMessage = Tables<"task_messages">;

/** Fetch chat history for a task, oldest first. */
export async function listMessages(taskId: string): Promise<TaskMessage[]> {
  const { data, error } = await supabase
    .from("task_messages")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(
  taskId: string,
  senderId: string,
  message: string,
) {
  const { error } = await supabase.from("task_messages").insert({
    task_id: taskId,
    sender_id: senderId,
    message,
  });
  if (error) throw error;
}
