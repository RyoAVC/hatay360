import { useEffect, useId, useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { apiRequest } from "../lib/api";

export type PortalNotice = {
  id: number;
  kind: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string;
};

const timeFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" });

function formatNoticeTime(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : timeFmt.format(date);
}

function isUnread(item: PortalNotice) {
  return !String(item.readAt || "").trim();
}

export function CustomerNotificationBell({
  unreadCount,
  onUnreadChange,
}: {
  unreadCount: number;
  onUnreadChange: (unread: number, items?: PortalNotice[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PortalNotice[]>([]);
  const [loading, setLoading] = useState(false);
  const titleId = useId();
  const badge = Math.max(0, Number(unreadCount) || 0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void apiRequest<{ notifications: PortalNotice[]; unreadNotifications: number }>("/api/customer/notifications")
      .then((next) => {
        if (cancelled) return;
        const list = next.notifications || [];
        setItems(list);
        onUnreadChange(Number(next.unreadNotifications) || 0, list);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, onUnreadChange]);

  const markRead = async (id: number) => {
    const target = items.find((item) => item.id === id);
    if (target && !isUnread(target)) return;
    try {
      const next = await apiRequest<{ unreadNotifications: number }>(`/api/customer/notifications/${id}/read`, {
        method: "POST",
      });
      const now = new Date().toISOString();
      const updated = items.map((item) => (item.id === id ? { ...item, readAt: item.readAt || now } : item));
      setItems(updated);
      onUnreadChange(Number(next.unreadNotifications) || 0, updated);
    } catch {
      // Sessiz: panel kapanmaz; bir sonraki açılışta liste yenilenir.
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label="Bildirimler"
        aria-haspopup="dialog"
        className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#d7e4e7] bg-white px-3 py-2 text-[#49616b] outline-none focus-visible:ring-2 focus-visible:ring-[#00a8c4]/40"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {badge > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#00a8c4] px-1 text-center text-[9px] font-black leading-[18px] text-white">
            {badge > 9 ? "9+" : badge}
            <span className="sr-only"> okunmamış</span>
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        aria-labelledby={titleId}
        className="w-[min(22rem,calc(100vw-1.5rem))] border-[#d5e6ea] bg-white p-0 text-[#102b35] shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
      >
        <div className="border-b border-[#e4ecee] px-4 py-3">
          <p id={titleId} className="text-[11px] font-black uppercase tracking-[0.14em] text-[#00a8c4]">
            Bildirimler
          </p>
        </div>
        <ul className="max-h-[min(60vh,22rem)] overflow-y-auto p-2" aria-live="polite">
          {loading && !items.length ? (
            <li className="px-3 py-6 text-center text-[12px] font-bold text-[#6c7c84]">Yükleniyor…</li>
          ) : !items.length ? (
            <li className="px-3 py-6 text-center text-[12px] font-bold text-[#6c7c84]">Yeni bildirim yok</li>
          ) : (
            items.map((item) => {
              const unread = isUnread(item);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void markRead(item.id)}
                    className={`flex min-h-[44px] w-full flex-col items-start rounded-xl px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#00a8c4]/35 ${unread ? "bg-[#edf9fa]" : "bg-transparent"}`}
                  >
                    <span className="flex w-full items-start justify-between gap-2">
                      <span className={`text-[12px] ${unread ? "font-black text-[#17343c]" : "font-bold text-[#49616b]"}`}>
                        {item.title}
                      </span>
                      {unread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#00a8c4]" aria-label="Okunmadı" /> : null}
                    </span>
                    {item.body ? (
                      <span className="mt-0.5 text-[11px] font-bold leading-relaxed text-[#6c7c84]">{item.body}</span>
                    ) : null}
                    <time className="mt-1 text-[10px] font-bold text-[#8a989e]" dateTime={item.createdAt}>
                      {formatNoticeTime(item.createdAt)}
                    </time>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
