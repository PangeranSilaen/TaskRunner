import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

export type RunnerProfile = Tables<"runner_profiles">;

/** A runner profile joined with the user's basic info (for discovery). */
export interface RunnerWithProfile extends RunnerProfile {
  profile: Pick<Tables<"profiles">, "full_name" | "avatar_url"> | null;
}

/** Fetch the runner stats for a given user. */
export async function getRunnerProfile(
  userId: string,
): Promise<RunnerProfile | null> {
  const { data, error } = await supabase
    .from("runner_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Toggle the current runner's availability. */
export async function setAvailability(active: boolean) {
  const { error } = await supabase.rpc("set_runner_availability", {
    p_active: active,
  });
  if (error) throw error;
}

/** List currently-available runners (for "runner terdekat"). */
export async function listAvailableRunners(
  limit = 5,
): Promise<RunnerWithProfile[]> {
  const { data, error } = await supabase
    .from("runner_profiles")
    .select("*, profile:profiles!runner_profiles_user_id_fkey(full_name, avatar_url)")
    .eq("availability_status", true)
    .order("last_active_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as RunnerWithProfile[];
}
