import { supabase } from "@/lib/supabase/client";

export interface CreateReportInput {
  taskId?: string | null;
  reportedUserId?: string | null;
  reason: string;
  description?: string | null;
}

/** Create a problem report. RLS enforces reporter_id = auth.uid(). */
export async function createReport(
  input: CreateReportInput,
  reporterId: string,
) {
  const { error } = await supabase.from("reports").insert({
    task_id: input.taskId ?? null,
    reporter_id: reporterId,
    reported_user_id: input.reportedUserId ?? null,
    reason: input.reason,
    description: input.description?.trim() || null,
  });
  if (error) throw error;
}
