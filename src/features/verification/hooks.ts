import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyVerification,
  submitVerification,
  adminListPending,
  adminReview,
} from "@/features/verification/api";
import { uploadKtm } from "@/lib/supabase/storage";
import { useAuthStore } from "@/stores/auth-store";

export function useMyVerification() {
  return useQuery({
    queryKey: ["verification", "me"],
    queryFn: getMyVerification,
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const userId = useAuthStore((s) => s.session?.user.id);

  return useMutation({
    mutationFn: async ({ phone, file }: { phone: string; file: File }) => {
      if (!userId) throw new Error("Sesi tidak ditemukan");
      const ktmPath = await uploadKtm(file, userId);
      await submitVerification(phone, ktmPath);
    },
    onSuccess: async () => {
      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: ["verification"] });
    },
  });
}

export function useAdminPendingVerifications() {
  return useQuery({
    queryKey: ["verification", "pending"],
    queryFn: adminListPending,
  });
}

export function useAdminReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      approve,
      reason,
    }: {
      userId: string;
      approve: boolean;
      reason?: string;
    }) => adminReview(userId, approve, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["verification"] });
    },
  });
}
