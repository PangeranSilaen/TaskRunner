import { useState } from "react";
import { Bell, Check, CheckCheck, BellOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "@/features/notifications/hooks";
import { Sheet } from "@/components/ui/sheet";
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
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
        className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/15 active:bg-white/15"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white ring-2 ring-primary">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} hideClose title="Notifikasi">
        {unreadCount > 0 && (
          <div className="mb-2 flex justify-end">
            <button
              onClick={() => markAll.mutate()}
              className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-dark"
            >
              <CheckCheck className="size-3.5" /> Tandai semua dibaca
            </button>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
              <BellOff className="size-7" />
            </span>
            <p className="text-sm font-medium text-ink">Belum ada notifikasi</p>
            <p className="max-w-[15rem] text-xs text-ink-muted">
              Kabar tentang task dan pesanmu akan muncul di sini.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    if (!n.is_read) markRead.mutate(n.id);
                    if (n.related_task_id) {
                      setOpen(false);
                      navigate(`/tasks/${n.related_task_id}`);
                    }
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                    n.is_read
                      ? "hover:bg-surface-muted"
                      : "bg-primary-soft/40 hover:bg-primary-soft/60",
                  )}
                >
                  {!n.is_read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <div className={cn("min-w-0 flex-1", n.is_read && "pl-5")}>
                    <p className="text-sm font-semibold text-ink">{n.title}</p>
                    <p className="text-xs text-ink-soft">{n.body}</p>
                    <p className="mt-1 text-[11px] text-ink-muted">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {n.is_read && (
                    <Check className="mt-1 size-3.5 shrink-0 text-ink-muted" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </>
  );
}
