import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  listMyTasks,
  listRunnerTasks,
  listAvailableTasks,
  getTask,
  acceptTask,
  startTask,
  completeTask,
  cancelTask,
  type AvailableFilter,
} from "@/features/tasks/api";
import type { CreateTaskInput } from "@/features/tasks/schemas";
import { useAuthStore } from "@/stores/auth-store";

export function useMyTasks(tab: "active" | "completed" | "cancelled") {
  return useQuery({
    queryKey: ["tasks", "mine", tab],
    queryFn: () => listMyTasks(tab),
  });
}

export function useRunnerTasks(tab: "active" | "completed") {
  const runnerId = useAuthStore((s) => s.session?.user.id);
  return useQuery({
    queryKey: ["tasks", "runner", tab, runnerId],
    queryFn: () => listRunnerTasks(tab, runnerId!),
    enabled: Boolean(runnerId),
  });
}

export function useAvailableTasks(filter: AvailableFilter = {}) {
  const userId = useAuthStore((s) => s.session?.user.id);
  return useQuery({
    queryKey: ["tasks", "available", userId, filter],
    queryFn: () => listAvailableTasks(userId!, filter),
    enabled: Boolean(userId),
  });
}

export function useTask(taskId: string | undefined) {
  return useQuery({
    queryKey: ["tasks", "detail", taskId],
    queryFn: () => getTask(taskId!),
    enabled: Boolean(taskId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.session?.user.id);
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input, userId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useAcceptTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => acceptTask(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useStartTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => startTask(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => completeTask(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCancelTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason?: string }) =>
      cancelTask(taskId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
