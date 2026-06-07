import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminListTasks,
  adminCancelTask,
  adminListReports,
  adminUpdateReport,
  adminGetStats,
} from "@/features/admin/api";

export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: adminGetStats });
}

export function useAdminTasks(status?: string) {
  return useQuery({
    queryKey: ["admin", "tasks", status],
    queryFn: () => adminListTasks(status),
  });
}

export function useAdminCancelTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) =>
      adminCancelTask(taskId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ["admin", "reports"],
    queryFn: adminListReports,
  });
}

export function useAdminUpdateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      status,
      adminNotes,
    }: {
      reportId: string;
      status: string;
      adminNotes?: string;
    }) => adminUpdateReport(reportId, status, adminNotes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
}
