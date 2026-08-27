import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  ClipboardCheck,
  Inbox,
  MessageSquareText,
  PenLine,
  RefreshCw,
  ShoppingBag,
  UserRoundPlus,
} from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";
import type { OpsAlertTarget } from "./admin-ops-alerts";

export type AdminInboxType = "approval" | "quote" | "extra" | "renewal" | "ticket" | "lead";
export type AdminInboxUrgency = "now" | "soon" | "normal";

export type AdminInboxItem = {
  type: AdminInboxType;
  id: number;
  customerId: number;
  title: string;
  subtitle: string;
  createdAt: string;
  hrefTab: string;
  urgency: AdminInboxUrgency;
};

type TypeFilter = "all" | AdminInboxType;

const TYPE_META: Record<AdminInboxType, { label: string; icon: typeof Inbox; tone: string }> = {
  approval: { label: "Onay", icon: ClipboardCheck, tone: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100" },
  quote: { label: "Teklif", icon: PenLine, tone: "border-sky-400/30 bg-sky-500/10 text-sky-100" },
  extra: { label: "Ek hizmet", icon: ShoppingBag, tone: "border-teal-400/30 bg-teal-500/10 text-teal-100" },
  renewal: { label: "Yenileme", icon: CalendarClock, tone: "border-orange-400/30 bg-orange-500/10 text-orange-100" },
  ticket: { label: "Ticket", icon: MessageSquareText, tone: "border-cyan-400/30 bg-cyan-500/10 text-cyan-100" },
  lead: { label: "Kayıt", icon: UserRoundPlus, tone: "border-amber-400/30 bg-amber-500/10 text-amber-100" },
};

const URGENCY_LABEL: Record<AdminInboxUrgency, { label: string; tone: string }> = {
  now: { label: "Şimdi", tone: "bg-rose-500/90 text-white" },
  soon: { label: "Yakın", tone: "bg-amber-500/90 text-[#1a1204]" },
  normal: { label: "Normal", tone: "bg-white/10 text-white/70" },
};

const TYPE_ORDER: AdminInboxType[] = ["approval", "quote", "extra", "renewal", "ticket", "lead"];

export function inboxTypeTarget(type: AdminInboxType): OpsAlertTarget {
  if (type === "approval") return "approvals";
  if (type === "quote") return "quotes";
  if (type === "extra") return "extras";
  if (type === "renewal") return "renewals";
  if (type === "ticket") return "tickets";
  return "leads";
}

const formatWhen = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

export function useAdminInbox(pollMs = 45_000) {
  const [items, setItems] = useState<AdminInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await apiRequest<{ items: AdminInboxItem[] }>("/api/admin/inbox");
      setItems(result.items || []);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Bekleyen işler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), pollMs);
    return () => window.clearInterval(timer);
  }, [load, pollMs]);

  return { items, loading, error, reload: load };
}

export function AdminInboxPanel({
  items,
  loading,
  error,
  onRefresh,
  onOpen,
}: {
  items: AdminInboxItem[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onOpen: (target: OpsAlertTarget) => void;
}) {
  const [filter, setFilter] = useState<TypeFilter>("all");

  const counts = useMemo(() => {
    const next: Record<TypeFilter, number> = { all: items.length, approval: 0, quote: 0, extra: 0, renewal: 0, ticket: 0, lead: 0 };
    for (const item of items) next[item.type] += 1;
    return next;
  }, [items]);

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.type === filter);
  }, [items, filter]);

  const nowCount = items.filter((item) => item.urgency === "now").length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Bekleyen işler</p>
          <h2 className="mt-1 text-[22px] font-black text-white">Operasyon kutusu</h2>
          <p className="mt-1 text-[12px] text-white/55">Onay, teklif, ek hizmet, yenileme, ticket ve yeni kayıtlar tek listede.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-black tabular-nums text-white/75">
            {items.length} iş
          </span>
          {nowCount > 0 ? (
            <span className="rounded-full bg-rose-500/90 px-2.5 py-1 text-[10px] font-black tabular-nums text-white">
              {nowCount} acil
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void onRefresh()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-bold text-white/75 hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Yenile
          </button>
        </div>
      </div>

      {error ? <p className="text-[12px] font-bold text-rose-300">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-black ${
            filter === "all" ? "border-[#00a8c4] bg-[#00a8c4] text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          Tümü {counts.all}
        </button>
        {TYPE_ORDER.map((type) => {
          const meta = TYPE_META[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-black ${
                filter === type ? "border-[#00a8c4] bg-[#00a8c4] text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {meta.label} {counts[type]}
            </button>
          );
        })}
      </div>

      {loading && items.length === 0 ? <p className="text-[12px] font-bold text-white/40">Yükleniyor…</p> : null}

      {!loading && visible.length === 0 ? (
        <EmptyRow dark icon={Inbox} title="Bekleyen iş yok" hint="Onay, teklif, ticket ve kayıt kuyruğu boş." />
      ) : (
        <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#18181f]">
          {visible.map((item) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            const urgency = URGENCY_LABEL[item.urgency];
            return (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => onOpen(inboxTypeTarget(item.type))}
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-white/5"
              >
                <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${meta.tone}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-black text-white">{item.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${urgency.tone}`}>
                      {urgency.label}
                    </span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white/50">
                      {meta.label}
                    </span>
                  </span>
                  {item.subtitle ? <span className="mt-0.5 block truncate text-[11px] font-bold text-white/50">{item.subtitle}</span> : null}
                  {item.createdAt ? <span className="mt-0.5 block text-[10px] font-bold text-white/35">{formatWhen(item.createdAt)}</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
