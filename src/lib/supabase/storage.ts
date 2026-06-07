import { supabase } from "@/lib/supabase/client";

const KTM_BUCKET = "ktm-photos";

/** Upload a KTM photo into the user's folder. Returns the storage path. */
export async function uploadKtm(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/ktm-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(KTM_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

/** Create a short-lived signed URL to preview a private KTM photo. */
export async function getKtmSignedUrl(
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(KTM_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}
