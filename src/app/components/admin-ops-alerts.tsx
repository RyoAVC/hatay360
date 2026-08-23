import { useCallback, useEffect, useState } from "react";
import { Bell, CalendarClock, ClipboardCheck, FileCheck2, MapPinned, MessageSquareText, PenLine, RefreshCw, ShoppingBag, UserRoundPlus, Users, Wallet } from "lucide-react";
import { apiRequest } from "../lib/api";
import { formatTry } from "../lib/payment-balance";

export type OpsAlerts = {
  total: number;
  ticketsOpen: number;
  ticketsAnswering: number;
  whatsappWaiting: number;
  overdueCustomers: number;
  overdueRows: number;
  overduePenalty: number;
  overdueRemaining: number;
  contractsAwaitingApprove: number;
  approvalsPending: number;
  quotesPending: number;
  leadsNeedingApprove: number;
  pendingPartners: number;
  serviceRequestsNew: number;
  extraRequestsNew: number;
  /** Harita kaydı olan ve NAP (ad/telefon/adres) uyumsuz hesap sayısı. */
  napCustomers: number;
  /** Toplam NAP alan uyumsuzluğu (ad + telefon + adres). */
  napIssues: number;
  /** Süresi geçmiş aktif yenileme (alan adı/hosting/bakım/SSL) sayısı. */
  renewalsOverdue: number;
  /** 14 gün içinde yenilenmesi gereken aktif kayıt sayısı. */
  renewalsDue: number;
};

export type OpsAlertTab = "tickets" | "customers" | "signups" | "approvals" | "quotes" | "renewals" | "extras";
/** Üst uyarı çiplerinin gideceği aksiyon hedefi (sekme + filtre). */
export type OpsAlertTarget = "tickets" | "overdue" | "contracts" | "approvals" | "quotes" | "leads" | "services" | "extras" | "nap" | "renewals";

export function opsTargetTab(target: OpsAlertTarget): OpsAlertTab {
  if (target === "tickets" || target === "services" || target === "extras") return "tickets";
  if (target === "leads") return "signups";
  if (target === "approvals") return "approvals";
  if (target === "quotes") return "quotes";
  if (target === "renewals") return "renewals";
  return "customers";
}

const EMPTY: OpsAlerts = {
  total: 0,
  ticketsOpen: 0,
  ticketsAnswering: 0,
  whatsappWaiting: 0,
  overdueCustomers: 0,
  overdueRows: 0,
  overduePenalty: 0,
  overdueRemaining: 0,
  contractsAwaitingApprove: 0,
  approvalsPending: 0,
  quotesPending: 0,
  leadsNeedingApprove: 0,
  pendingPartners: 0,
  serviceRequestsNew: 0,
  extraRequestsNew: 0,
  napCustomers: 0,
  napIssues: 0,
  renewalsOverdue: 0,
  renewalsDue: 0,
};

export function useAdminOpsAlerts(pollMs = 45_000) {
  const [alerts, setAlerts] = useState<OpsAlerts>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await apiRequest<{ alerts: OpsAlerts }>("/api/admin/ops-alerts");
      setAlerts(result.alerts || EMPTY);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Uyarılar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), pollMs);
    return () => window.clearInterval(timer);
  }, [load, pollMs]);

  return { alerts, loading, error, reload: load };
}

export function AdminOpsAlertsBar({
  alerts,
  loading,
  error,
  onNavigate,
  onRefresh,
}: {
  alerts: OpsAlerts;
  loading: boolean;
  error: string;
  onNavigate: (target: OpsAlertTarget) => void;
  onRefresh: () => void;
}) {
  const items: { key: OpsAlertTarget; count: number; label: string; hint: string; icon: typeof Bell; tone: string }[] = [
    {
      key: "tickets",
      count: alerts.ticketsOpen + alerts.ticketsAnswering,
      label: "Ticket",
      hint: alerts.whatsappWaiting ? `+${alerts.whatsappWaiting} WA sıra` : "Açık / cevaplanıyor",
      icon: MessageSquareText,
      tone: "border-cyan-400/30 bg-cyan-500/10 text-cyan-100",
    },
    {
      key: "overdue",
      count: alerts.overdueCustomers,
      label: "Gecikmiş ödeme",
      hint: alerts.overduePenalty > 0 ? `CEZA %15 · ${formatTry(alerts.overdueRemaining)}` : "Vadesi geçmiş müşteri",
      icon: Wallet,
      tone: "border-rose-400/35 bg-rose-500/10 text-rose-100",
    },
    {
      key: "contracts",
      count: alerts.contractsAwaitingApprove,
      label: "İmza onayı",
      hint: "Müşteri imzaladı · admin onayı",
      icon: FileCheck2,
      tone: "border-violet-400/30 bg-violet-500/10 text-violet-100",
    },
    {
      key: "approvals",
      count: alerts.approvalsPending,
      label: "Onay bekliyor",
      hint: "Müşteri görsel / tasarım onayı",
      icon: ClipboardCheck,
      tone: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100",
    },
    {
      key: "quotes",
      count: alerts.quotesPending,
      label: "Teklif bekliyor",
      hint: "Kayıtlı kabul (ad, tarih, IP)",
      icon: PenLine,
      tone: "border-sky-400/30 bg-sky-500/10 text-sky-100",
    },
    {
      key: "leads",
      count: alerts.leadsNeedingApprove + alerts.pendingPartners,
      label: "Kayıt / bayi",
      hint: alerts.pendingPartners ? `${alerts.leadsNeedingApprove} lead · ${alerts.pendingPartners} bayi` : "Onay bekleyen kayıt",
      icon: UserRoundPlus,
      tone: "border-amber-400/30 bg-amber-500/10 text-amber-100",
    },
    {
      key: "services",
      count: alerts.serviceRequestsNew,
      label: "Hizmet talebi",
      hint: alerts.extraRequestsNew ? `${alerts.extraRequestsNew} ek hizmet` : "Yeni müşteri isteği",
      icon: Users,
      tone: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
    },
    {
      key: "extras",
      count: alerts.extraRequestsNew,
      label: "Ek hizmet",
      hint: "Onay bekleyen upsell talebi",
      icon: ShoppingBag,
      tone: "border-teal-400/30 bg-teal-500/10 text-teal-100",
    },
    {
      key: "nap",
      count: alerts.napCustomers,
      label: "NAP uyumsuz",
      hint: alerts.napIssues ? `${alerts.napIssues} alan · harita ↔ site` : "Harita ↔ firma / telefon",
      icon: MapPinned,
      tone: "border-amber-400/30 bg-amber-500/10 text-amber-100",
    },
    {
      key: "renewals",
      count: alerts.renewalsOverdue + alerts.renewalsDue,
      label: "Yenileme",
      hint: alerts.renewalsOverdue ? `${alerts.renewalsOverdue} süresi geçmiş · ${alerts.renewalsDue} yakın` : "14 gün içinde yenilenecek",
      icon: CalendarClock,
      tone: "border-orange-400/30 bg-orange-500/10 text-orange-100",
    },
  ];

  const active = items.filter((item) => item.count > 0);

  return (
    <section className="border-b border-white/10 bg-[#101018] px-6 py-3">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Bell className="h-4 w-4 text-[#70dce9]" />
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Operasyon uyarıları</p>
            {loading ? <span className="text-[10px] font-bold text-white/40">yükleniyor…</span> : null}
            {!loading && alerts.total === 0 ? (
              <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-200">
                Bekleyen iş yok
              </span>
            ) : null}
            {!loading && alerts.total > 0 ? (
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-black text-white/70">
                {alerts.total} aksiyon
              </span>
            ) : null}
          </div>
          {error ? <p className="mt-2 text-[11px] font-bold text-rose-300">{error}</p> : null}
          {active.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {active.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    title={`${item.label} listesine git`}
                    className={`inline-flex max-w-full items-start gap-2 rounded-xl border px-3 py-2 text-left transition hover:brightness-110 ${item.tone}`}
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-90" />
                    <span className="min-w-0">
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-[15px] font-black tabular-nums">{item.count}</span>
                        <span className="text-[10px] font-black uppercase tracking-wide opacity-90">{item.label}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[9px] font-bold opacity-70">{item.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void onRefresh()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-bold text-white/75 hover:bg-white/10"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Yenile
        </button>
      </div>
    </section>
  );
}

export function opsNavBadge(alerts: OpsAlerts, tab: "tickets" | "customers" | "signups" | "approvals" | "quotes" | "renewals" | "extras") {
  if (tab === "tickets") return alerts.ticketsOpen + alerts.ticketsAnswering + alerts.whatsappWaiting;
  if (tab === "signups") return alerts.leadsNeedingApprove + alerts.pendingPartners;
  if (tab === "approvals") return alerts.approvalsPending;
  if (tab === "quotes") return alerts.quotesPending;
  if (tab === "renewals") return alerts.renewalsOverdue + alerts.renewalsDue;
  if (tab === "extras") return alerts.extraRequestsNew;
  return alerts.overdueCustomers + alerts.contractsAwaitingApprove + alerts.serviceRequestsNew + alerts.napCustomers;
}
