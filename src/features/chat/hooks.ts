import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  listMessages,
  sendMessage,
  type TaskMessage,
} from "@/features/chat/api";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Load chat history and subscribe to new messages in realtime
 * for a single task.
 */
export function useTaskChat(taskId: string | undefined) {
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    let active = true;

    setLoading(true);
    listMessages(taskId)
      .then((data) => {
        if (active) setMessages(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const channel = supabase
      .channel(`task_messages:${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "task_messages",
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          const msg = payload.new as TaskMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
          );
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [taskId]);

  return { messages, loading };
}

export function useSendMessage(taskId: string) {
  const senderId = useAuthStore((s) => s.session?.user.id);
  return useMutation({
    mutationFn: (message: string) => sendMessage(taskId, senderId!, message),
  });
}
