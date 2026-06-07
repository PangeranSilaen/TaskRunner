import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

export type VerificationRequest = Tables<"verification_requests">;

/** A pending request joined with the user's profile (for admin list). */
export interface PendingVerification extends VerificationRequest {
  profile: Pick<Tables<"profiles">, "full_name" | "email"> | null;
}

/** Fetch the current user's verification request, if any. */
export async function getMyVerification(): Promise<VerificationRequest | null> {
  const { data, error } = await supabase
    .from("verification_requests")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Submit (or resubmit) verification: stores phone + KTM path, sets pending. */
export async function submitVerification(phone: string, ktmPath: string) {
  const { error } = await supabase.rpc("submit_verification", {
    p_phone: phone,
    p_ktm_url: ktmPath,
  });
  if (error) throw error;
}

/** Admin: list all pending verification requests with profile info. */
export async function adminListPending(): Promise<PendingVerification[]> {
  const { data, error } = await supabase
    .from("verification_requests")
    .select("*, profile:profiles!verification_requests_user_id_fkey(full_name, email)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as PendingVerification[];
}

/** Admin: approve or reject a verification request. */
export async function adminReview(
  userId: string,
  approve: boolean,
  reason?: string,
) {
  const { error } = await supabase.rpc("admin_review_verification", {
    p_user_id: userId,
    p_approve: approve,
    p_reason: reason ?? undefined,
  });
  if (error) throw error;
}
