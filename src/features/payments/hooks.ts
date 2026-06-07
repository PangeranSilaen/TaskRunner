import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPayment,
  uploadProof,
  submitProof,
  confirmPayment,
} from "@/features/payments/api";

export function usePayment(taskId: string | undefined) {
  return useQuery({
    queryKey: ["payment", taskId],
    queryFn: () => getPayment(taskId!),
    enabled: Boolean(taskId),
  });
}

export function useSubmitProof(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ method, file }: { method: string; file: File }) => {
      const path = await uploadProof(file, taskId);
      await submitProof(taskId, method, path);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payment", taskId] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useConfirmPayment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => confirmPayment(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payment", taskId] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
