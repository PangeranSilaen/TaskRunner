import { useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "@/features/notifications/hooks";
import { cn } from "@/lib/utils/cn";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifikasi"
        className="relative flex size-9 items-center justify-center rounded-lg hover:bg-white/10"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-11 z-50 max-h-[70vh] w-80 overflow-hidden rounded-card bg-surface text-ink shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-semibold">Notifikasi</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAll.mutate()}
                  className="flex items-center gap-1 text-xs text-primary"
                >
                  <CheckCheck className="size-3.5" /> Tandai semua dibaca
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-muted">
                  Belum ada notifikasi.
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.is_read) markRead.mutate(n.id);
                      if (n.related_task_id) {
                        setOpen(false);
                        navigate(`/tasks/${n.related_task_id}`);
                      }
                    }}
                    className={cn(
                      "flex w-full items-start gap-2 border-b border-line px-4 py-3 text-left last:border-b-0 hover:bg-surface-muted",
                      !n.is_read && "bg-primary-soft/30",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      <p className="text-xs text-ink-soft">{n.body}</p>
                      <p className="mt-0.5 text-[10px] text-ink-muted">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {n.is_read && (
                      <Check className="mt-1 size-3.5 shrink-0 text-ink-muted" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
