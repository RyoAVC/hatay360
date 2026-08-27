import { Bell, ClipboardCheck, FileCheck2, MapPinned, MessageSquareText, PenLine, PlusCircle, Wallet } from "lucide-react";
import { countPortalNapIssues } from "../lib/seo";
import { formatTry } from "../lib/payment-balance";
import type { PortalContract, PortalPayment, PortalPaymentSummary } from "./customer-billing-panel";

export type CustomerPortalTab =
  | "overview"
  | "website"
  | "campaigns"
  | "contracts"
  | "approvals"
  | "quotes"
  | "payments"
  | "support"
  | "services"
  | "seo"
  | "domain"
  | "security"
  | "users";

export type CustomerOpsAlerts = {
  total: number;
  overdueRows: number;
  overduePenalty: number;
  overdueRemaining: number;
  openBalance: number;
  contractsNeedingSign: number;
  approvalsPending: number;
  quotesPending: number;
  ticketsOpen: number;
  ticketsAnswering: number;
  ticketsAnswered: number;
  serviceRequestsActive: number;
  /** Harita ↔ site adı/telefon uyumsuz veya eksik alan sayısı; adres eksik sayılmaz. */
  napIssues: number;
};

type TicketLike = { status?: string | null };
type ServiceLike = { status?: string | null };
type MapsLike = { businessName?: string | null; phone?: string | null; address?: string | null };

export function computeCustomerOpsAlerts({
  payments,
  paymentSummary,
  contracts,
  approvalsPending = 0,
  quotesPending = 0,
  tickets,
  serviceRequests,
  maps,
  companyName,
  companyPhone,
  websitePhone,
  websiteAddress,
}: {
  payments: PortalPayment[];
  paymentSummary: PortalPaymentSummary;
  contracts: PortalContract[];
  approvalsPending?: number;
  quotesPending?: number;
  tickets: TicketLike[];
  serviceRequests: ServiceLike[];
  maps?: MapsLike[] | null;
  companyName?: string | null;
  companyPhone?: string | null;
  websitePhone?: string | null;
  websiteAddress?: string | null;
}): CustomerOpsAlerts {
  const overdue = (payments || []).filter((item) => item.overdue && Number(item.remaining || 0) > 0);
  const overdueRemaining = overdue.reduce((sum, item) => sum + Number(item.remaining || 0), 0);
  const overduePenalty =
    Number(paymentSummary?.penalty || 0) ||
    overdue.reduce((sum, item) => sum + Number(item.penalty || 0), 0);
  const openBalance = Number(paymentSummary?.remaining || 0);
  const contractsNeedingSign = (contracts || []).filter((item) => {
    if (!item.current) return false;
    const status = item.signStatus || "pending";
    return status === "pending" || status === "rejected" || status === "";
  }).length;
  const ticketsOpen = (tickets || []).filter((item) => item.status === "open").length;
  const ticketsAnswering = (tickets || []).filter((item) => item.status === "answering").length;
  const ticketsAnswered = (tickets || []).filter((item) => item.status === "answered").length;
  const serviceRequestsActive = (serviceRequests || []).filter((item) =>
    ["new", "reviewing", "quoted"].includes(String(item.status || "")),
  ).length;
  const napIssues = countPortalNapIssues({
    maps,
    companyName,
    companyPhone,
    websitePhone,
    websiteAddress,
  });

  const pendingApprovals = Math.max(0, Number(approvalsPending) || 0);
  const pendingQuotes = Math.max(0, Number(quotesPending) || 0);

  const total =
    overdue.length +
    contractsNeedingSign +
    pendingApprovals +
    pendingQuotes +
    ticketsOpen +
    ticketsAnswering +
    ticketsAnswered +
    serviceRequestsActive +
    napIssues +
    (openBalance > 0 && overdue.length === 0 ? 1 : 0);

  return {
    total,
    overdueRows: overdue.length,
    overduePenalty,
    overdueRemaining,
    openBalance,
    contractsNeedingSign,
    approvalsPending: pendingApprovals,
    quotesPending: pendingQuotes,
    ticketsOpen,
    ticketsAnswering,
    ticketsAnswered,
    serviceRequestsActive,
    napIssues,
  };
}

export function customerNavBadge(alerts: CustomerOpsAlerts, tab: CustomerPortalTab) {
  if (tab === "payments") return alerts.overdueRows || (alerts.openBalance > 0 ? 1 : 0);
  if (tab === "contracts") return alerts.contractsNeedingSign;
  if (tab === "approvals") return alerts.approvalsPending;
  if (tab === "quotes") return alerts.quotesPending;
  if (tab === "support") return alerts.ticketsOpen + alerts.ticketsAnswering + alerts.ticketsAnswered;
  if (tab === "services") return alerts.serviceRequestsActive;
  if (tab === "website") return alerts.napIssues;
  return 0;
}

export function CustomerOpsAlertsBar({
  alerts,
  onNavigate,
}: {
  alerts: CustomerOpsAlerts;
  onNavigate: (tab: CustomerPortalTab) => void;
}) {
  const items: {
    key: string;
    tab: CustomerPortalTab;
    count: number;
    label: string;
    hint: string;
    icon: typeof Bell;
    tone: string;
  }[] = [
    {
      key: "overdue",
      tab: "payments",
      count: alerts.overdueRows,
      label: "Gecikmiş ödeme",
      hint:
        alerts.overduePenalty > 0
          ? `CEZA %15 · ${formatTry(alerts.overdueRemaining)}`
          : formatTry(alerts.overdueRemaining),
      icon: Wallet,
      tone: "border-rose-200 bg-rose-50 text-rose-900",
    },
    {
      key: "balance",
      tab: "payments",
      count: alerts.overdueRows === 0 && alerts.openBalance > 0 ? 1 : 0,
      label: "Açık bakiye",
      hint: formatTry(alerts.openBalance),
      icon: Wallet,
      tone: "border-amber-200 bg-amber-50 text-amber-950",
    },
    {
      key: "contracts",
      tab: "contracts",
      count: alerts.contractsNeedingSign,
      label: "İmza bekliyor",
      hint: "Sözleşmeyi imzalayın",
      icon: FileCheck2,
      tone: "border-violet-200 bg-violet-50 text-violet-950",
    },
    {
      key: "approvals",
      tab: "approvals",
      count: alerts.approvalsPending,
      label: "Onay bekliyor",
      hint: "Görsel / tasarım onayı",
      icon: ClipboardCheck,
      tone: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-950",
    },
    {
      key: "quotes",
      tab: "quotes",
      count: alerts.quotesPending,
      label: "Teklif bekliyor",
      hint: "Kayıtlı kabul",
      icon: PenLine,
      tone: "border-sky-200 bg-sky-50 text-sky-950",
    },
    {
      key: "tickets",
      tab: "support",
      count: alerts.ticketsOpen + alerts.ticketsAnswering,
      label: "Açık ticket",
      hint: alerts.ticketsAnswering ? `${alerts.ticketsAnswering} cevaplanıyor` : "Destek sırası",
      icon: MessageSquareText,
      tone: "border-cyan-200 bg-cyan-50 text-cyan-950",
    },
    {
      key: "replies",
      tab: "support",
      count: alerts.ticketsAnswered,
      label: "Yanıt geldi",
      hint: "Yardım sekmesinde okuyun",
      icon: MessageSquareText,
      tone: "border-emerald-200 bg-emerald-50 text-emerald-950",
    },
    {
      key: "services",
      tab: "services",
      count: alerts.serviceRequestsActive,
      label: "Hizmet talebi",
      hint: "İnceleme / teklif aşaması",
      icon: PlusCircle,
      tone: "border-[#bfe1e6] bg-[#edf9fa] text-[#0b5f6e]",
    },
    {
      key: "nap",
      tab: "website",
      count: alerts.napIssues,
      label: "NAP uyumsuz",
      hint: "Harita ↔ site adı / telefon / adres",
      icon: MapPinned,
      tone: "border-amber-200 bg-amber-50 text-amber-950",
    },
  ];

  const active = items.filter((item) => item.count > 0);

  return (
    <section className="mt-5 rounded-[22px] border border-[#d5e6ea] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center gap-2">
        <Bell className="h-4 w-4 text-[#00a8c4]" />
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Hesap uyarıları</p>
        {alerts.total === 0 ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
            Bekleyen iş yok
          </span>
        ) : (
          <span className="rounded-full border border-[#d5e6ea] bg-[#f7fbfc] px-2.5 py-0.5 text-[10px] font-black text-[#49616b]">
            {alerts.total} aksiyon
          </span>
        )}
      </div>
      {active.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {active.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.tab)}
                className={`inline-flex max-w-full items-start gap-2 rounded-xl border px-3 py-2 text-left transition hover:brightness-[0.98] ${item.tone}`}
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
      ) : (
        <p className="mt-2 text-[11px] font-bold text-[#6c7c84]">Ödeme, imza, NAP ve destek tarafında bekleyen bir şey yok.</p>
      )}
    </section>
  );
}
