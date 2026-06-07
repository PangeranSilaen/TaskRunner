import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getRunnerProfile,
  setAvailability,
  listAvailableRunners,
} from "@/features/runner/api";
import { useAuthStore } from "@/stores/auth-store";

export function useMyRunnerProfile() {
  const userId = useAuthStore((s) => s.session?.user.id);
  return useQuery({
    queryKey: ["runner-profile", userId],
    queryFn: () => getRunnerProfile(userId!),
    enabled: Boolean(userId),
  });
}

export function useRunnerProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["runner-profile", userId],
    queryFn: () => getRunnerProfile(userId!),
    enabled: Boolean(userId),
  });
}

export function useSetAvailability() {
  const queryClient = useQueryClient();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  return useMutation({
    mutationFn: (active: boolean) => setAvailability(active),
    onSuccess: async () => {
      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: ["runner-profile"] });
    },
  });
}

export function useAvailableRunners(limit = 5) {
  return useQuery({
    queryKey: ["runners", "available", limit],
    queryFn: () => listAvailableRunners(limit),
  });
}
