import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReport, type CreateReportInput } from "@/features/reports/api";
import { useAuthStore } from "@/stores/auth-store";

export function useCreateReport() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user.id);
  return useMutation({
    mutationFn: (input: CreateReportInput) => createReport(input, userId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
