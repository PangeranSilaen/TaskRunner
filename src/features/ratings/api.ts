import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

export type Rating = Tables<"ratings">;

/** Fetch the rating for a task, if it exists. */
export async function getTaskRating(taskId: string): Promise<Rating | null> {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("task_id", taskId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Customer submits a rating for a completed task's runner. */
export async function submitRating(params: {
  taskId: string;
  customerId: string;
  runnerId: string;
  rating: number;
  review?: string;
}) {
  const { error } = await supabase.from("ratings").insert({
    task_id: params.taskId,
    customer_id: params.customerId,
    runner_id: params.runnerId,
    rating: params.rating,
    review: params.review || null,
  });
  if (error) throw error;
}
