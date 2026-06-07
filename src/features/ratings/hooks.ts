import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTaskRating, submitRating } from "@/features/ratings/api";
import { useAuthStore } from "@/stores/auth-store";

export function useTaskRating(taskId: string | undefined) {
  return useQuery({
    queryKey: ["rating", taskId],
    queryFn: () => getTaskRating(taskId!),
    enabled: Boolean(taskId),
  });
}

export function useSubmitRating(taskId: string, runnerId: string) {
  const queryClient = useQueryClient();
  const customerId = useAuthStore((s) => s.session?.user.id);
  return useMutation({
    mutationFn: ({ rating, review }: { rating: number; review?: string }) =>
      submitRating({
        taskId,
        customerId: customerId!,
        runnerId,
        rating,
        review,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["rating", taskId] });
      void queryClient.invalidateQueries({ queryKey: ["runner-profile"] });
    },
  });
}
