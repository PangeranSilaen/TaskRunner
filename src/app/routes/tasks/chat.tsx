import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useTask } from "@/features/tasks/hooks";
import { useTaskChat, useSendMessage } from "@/features/chat/hooks";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils/cn";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.session?.user.id);
  const { data: task } = useTask(id);
  const { messages, loading } = useTaskChat(id);
  const send = useSendMessage(id!);

  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const otherName =
    task?.customer_id === userId
      ? task?.runner?.full_name
      : task?.customer?.full_name;

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    try {
      await send.mutateAsync(value);
    } catch {
      setText(value); // restore on failure
    }
  };

  return (
    <div className="flex min-h-dvh w-full max-w-md flex-col bg-background">
      {/* Header */}
      <header className="safe-top flex items-center gap-3 bg-gradient-to-r from-primary to-primary-dark px-3 py-3 text-white shadow-soft">
        <button
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15"
        >
          <ArrowLeft className="size-5" />
        </button>
        <Avatar name={otherName} size="md" className="bg-white/20 text-white" />
        <div className="min-w-0">
          <p className="truncate font-bold">{otherName || "Lawan bicara"}</p>
          <p className="text-xs text-white/70">#{task?.public_code}</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <MessageCircle className="size-7" />
            </span>
            <p className="text-sm font-medium text-ink">Belum ada pesan</p>
            <p className="max-w-[14rem] text-xs text-ink-muted">
              Sapa lawan bicaramu untuk mulai berkoordinasi.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === userId;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                    mine
                      ? "rounded-br-md bg-primary text-white"
                      : "rounded-bl-md bg-surface text-ink shadow-soft",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.message}</p>
                  <p
                    className={cn(
                      "mt-0.5 text-right text-[10px]",
                      mine ? "text-white/70" : "text-ink-muted",
                    )}
                  >
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={onSend}
        className="safe-bottom flex items-center gap-2 border-t border-line bg-surface p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan..."
          className="h-11 flex-1 rounded-full border border-line bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={!text.trim() || send.isPending}
          aria-label="Kirim"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform active:scale-95 disabled:opacity-50"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
}
