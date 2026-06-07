import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

export type PaymentRecord = Tables<"payment_records">;

const PROOF_BUCKET = "payment-proofs";

/** Fetch the payment record for a task, if any. */
export async function getPayment(taskId: string): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from("payment_records")
    .select("*")
    .eq("task_id", taskId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Upload a transfer proof image into the task folder. Returns the path. */
export async function uploadProof(file: File, taskId: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${taskId}/proof-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function getProofSignedUrl(
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(PROOF_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

/** Customer uploads / updates a transfer proof for a task. */
export async function submitProof(taskId: string, method: string, proofPath: string) {
  const { error } = await supabase
    .from("payment_records")
    .upsert(
      {
        task_id: taskId,
        method,
        proof_url: proofPath,
        status: "proof_uploaded",
      },
      { onConflict: "task_id" },
    );
  if (error) throw error;
  await supabase
    .from("tasks")
    .update({ payment_status: "proof_uploaded" })
    .eq("id", taskId);
}

/** Runner confirms a payment manually. */
export async function confirmPayment(taskId: string) {
  const { error } = await supabase
    .from("payment_records")
    .update({
      status: "runner_confirmed",
      runner_confirmed_at: new Date().toISOString(),
    })
    .eq("task_id", taskId);
  if (error) throw error;
  await supabase
    .from("tasks")
    .update({ payment_status: "runner_confirmed" })
    .eq("id", taskId);
}
