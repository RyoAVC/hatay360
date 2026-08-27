import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { BarChart3, CalendarClock, CheckCircle2, CircleDollarSign, ClipboardCheck, ClipboardList, Copy, Download, FileText, Gift, Globe2, HelpCircle, KeyRound, LayoutDashboard, LayoutTemplate, LogOut, Megaphone, PenLine, PlusCircle, RefreshCw, Search, Send, ShieldAlert, ShieldCheck, Smartphone, TrendingUp, Users, Wallet } from "lucide-react";
import { useNavigate } from "react-router";
import { SiteLogo } from "../components/site-logo";
import { FormError } from "../components/form-error";
import { EmptyRow } from "../components/empty-row";
import { AdsVsWebCard, AdsReportScaffold, CampaignsEmptyCard, CustomerWebsitePanel, MapsEmptyCard, needsMapsCta, OverviewTrust, PortalServiceStrip, TrustStrip, type PortalMaps, type PortalWebsite } from "../components/customer-website-panel";
import { ServiceMark } from "../components/service-mark";
import { SisterBrandRow } from "../components/sister-brands";
import { ContractActionCard, CustomerBillingPanel, CustomerContractsPanel, PaymentDueCard, type PortalCatalogItem, type PortalContract, type PortalPayment, type PortalPaymentSummary } from "../components/customer-billing-panel";
import { CustomerApprovalsPanel, type PortalApproval } from "../components/customer-approvals-panel";
import { CustomerQuotesPanel, type PortalQuote } from "../components/customer-quotes-panel";
import { CustomerExtrasPanel } from "../components/customer-extras-panel";
import { CustomerSeoPanel } from "../components/customer-seo-panel";
import { CustomerPortalAnnouncements, type PortalAnnouncement } from "../components/customer-portal-announcements";
import { PublishCelebration } from "../components/publish-celebration";
import { CustomerHelpCenter, type SupportLive, type TicketQueueConfirm } from "../components/customer-help-center";
import { CustomerUsersPanel } from "../components/customer-users-panel";
import { CustomerPortalDock } from "../components/customer-portal-dock";
import { CustomerNotificationBell, type PortalNotice } from "../components/customer-notification-bell";
import { computeCustomerOpsAlerts, CustomerOpsAlertsBar, customerNavBadge } from "../components/customer-ops-alerts";
import { StatusDot } from "../components/status-dot";
import { campaignDotKind, serviceDotKind } from "../lib/ops-status";
import { useCustomerAuth, type CustomerIdentity } from "../context/customer-auth-context";
import { useContent } from "../context/content-context";
import { toWhatsAppHref } from "../lib/contact";
import { apiRequest } from "../lib/api";
import type { DailyMetric } from "../lib/portal-metrics";
import { adsBindingFallback, type AdsAccountBinding, type AdsRange, type AdsReportPayload } from "../lib/ads-bind";
import { RENEWAL_KIND_LABELS, renewalCountdownLabel, formatRenewDate, urgentRenewals, type Renewal } from "../lib/renewals";
import type { SeoPayload } from "../lib/seo-rank";

type Campaign = { id: number; name: string; platform: "google" | "meta" | "other"; status: string; monthly_budget: number; management_fee: number; spend: number; impressions: number; clicks: number; leads: number; conversions: number; revenue: number; profit: number; roas: number; ctr: number };
type Ticket = { id: number; subject: string; message: string; status: string; priority: string; admin_reply: string; created_at: string; queue_position?: number };
type ServiceRequest = { id: number; service: string; details: string; status: string; kind?: string; amount?: number; created_at: string };
type DomainCheck = { id: number; domain: string; result: string; created_at: string };
type DomainProbe = { domain: string; result: string; note: string; signals?: { hasDns?: boolean; hasMx?: boolean } };
type CampaignStat = { id: number; campaign_id: number; campaign_name: string; platform: string; period_start: string; period_end: string; spend: number; impressions: number; clicks: number; leads: number; conversions: number; revenue: number };
type Dashboard = {
  role?: "full" | "limited";
  customer: CustomerIdentity;
  referralCode?: string;
  referralUrl?: string;
  referralContactUrl?: string;
  website: PortalWebsite;
  maps: PortalMaps[];
  dailyMetrics: DailyMetric[];
  metricsSource: string;
  adsConnection: AdsAccountBinding & { status: string };
  campaigns: Campaign[];
  totals: { monthlyBudget: number; managementFee: number; spend: number; impressions: number; clicks: number; leads: number; conversions: number; revenue: number; profit: number; roas: number; ctr: number };
  tickets: Ticket[];
  supportLive?: SupportLive;
  serviceRequests: ServiceRequest[];
  domainChecks: DomainCheck[];
  stats: CampaignStat[];
  products: PortalCatalogItem[];
  services: PortalCatalogItem[];
  invoices: PortalCatalogItem[];
  extras?: PortalCatalogItem[];
  payments: PortalPayment[];
  paymentSummary: PortalPaymentSummary;
  contracts: PortalContract[];
  approvals: PortalApproval[];
  approvalsPending: number;
  quotes?: PortalQuote[];
  quotesPending?: number;
  renewals?: Renewal[];
  unreadNotifications?: number;
  notifications?: PortalNotice[];
  project?: ProjectStatus;
  seo?: SeoPayload;
  announcements?: PortalAnnouncement[];
  twoFactor?: { enabled: boolean; available: boolean; reason: string };
  paymentGateway?: { available: boolean; provider: string; message: string };
};
type ProjectStage = { key: string; label: string; done: boolean; current: boolean };
type ProjectStatus = { stage: string; stageLabel: string; stageIndex: number; totalStages: number; stages: ProjectStage[]; pendingApprovals?: number; updatedAt: string; lastNote?: string; lastNoteAt?: string; celebrationPending?: boolean };
type PortalTab = "overview" | "website" | "campaigns" | "contracts" | "approvals" | "quotes" | "payments" | "support" | "services" | "seo" | "domain" | "security" | "users";
type SecurityEvent = { id: number; username: string; success: boolean; createdAt: string; visitorTag: string };
type SecuritySession = { id: string; createdAt: string; expiresAt: string; current: boolean };
type SecurityData = {
  email: string;
  companyName: string;
  activeSessions: number;
  failed24h: number;
  sessions?: SecuritySession[];
  events: SecurityEvent[];
};

function passwordStrength(value: string) {
  const lengthOk = value.length >= 10;
  const hasLetter = /[A-Za-zÀ-ÿ]/.test(value);
  const hasDigit = /\d/.test(value);
  const score = Number(lengthOk) + Number(hasLetter) + Number(hasDigit) + (value.length >= 14 ? 1 : 0);
  const label = score >= 4 ? "Güçlü" : score >= 3 ? "İyi" : score >= 2 ? "Orta" : value ? "Zayıf" : "";
  return { lengthOk, hasLetter, hasDigit, score, label };
}

const PORTAL_TAB_HASH: Record<PortalTab, string> = {
  overview: "genel",
  website: "site",
  campaigns: "reklam",
  contracts: "sozlesme",
  approvals: "onay",
  quotes: "teklif",
  payments: "odeme",
  support: "yardim",
  services: "hizmet",
  seo: "seo",
  domain: "domain",
  security: "guvenlik",
  users: "kullanicilar",
};
const PORTAL_HASH_TO_TAB: Record<string, PortalTab> = {
  ...Object.fromEntries(Object.entries(PORTAL_TAB_HASH).map(([tab, hash]) => [hash, tab as PortalTab])),
  overview: "overview",
  website: "website",
  campaigns: "campaigns",
  contracts: "contracts",
  approvals: "approvals",
  quotes: "quotes",
  payments: "payments",
  support: "support",
  services: "services",
  domain: "domain",
  security: "security",
  users: "users",
  kullanicilar: "users",
  odemeler: "payments",
  sozlesmeler: "contracts",
  onaylar: "approvals",
  teklif: "quotes",
  teklifler: "quotes",
  yardim: "support",
  "ek-hizmet": "services",
  "ek-hizmetler": "services",
  seo: "seo",
  "seo-siralama": "seo",
};

function parsePortalTabHash(raw: string): PortalTab | null {
  const key = raw.replace(/^#/, "").trim().toLocaleLowerCase("tr-TR");
  if (!key) return null;
  return PORTAL_HASH_TO_TAB[key] || null;
}

function readPortalTabFromLocation(): PortalTab {
  if (typeof window === "undefined") return "overview";
  return parsePortalTabHash(window.location.hash) || "overview";
}

function writePortalTabHash(tab: PortalTab) {
  if (typeof window === "undefined") return;
  const next = `#${PORTAL_TAB_HASH[tab]}`;
  if (window.location.hash === next) return;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
}

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(Number(value || 0));
const number = (value: number) => new Intl.NumberFormat("tr-TR").format(Number(value || 0));
const formatSecurityDate = (value: string) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
const statusLabel: Record<string, string> = { active: "Aktif", paused: "Duraklatıldı", open: "Açık", answering: "Cevaplanıyor", answered: "Yanıtlandı", closed: "Kapalı", new: "Yeni", reviewing: "İnceleniyor", quoted: "Teklif hazır", approved: "Onaylandı", accepted: "Onaylandı", registered: "Kayıtlı", potentially_available: "Uygun olabilir", unknown: "Doğrulanamadı" };

function ReferralShareCard({ code, url, contactUrl }: { code: string; url: string; contactUrl?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <section className="mt-5 rounded-2xl border border-[#cfe7ec] bg-[linear-gradient(180deg,#f7fcfd,#ffffff)] p-4 sm:p-5" aria-label="Tavsiye programı">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00a8c4]/12 text-[#007f98]">
          <Gift className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Tavsiye</p>
          <h2 className="mt-1 text-[16px] font-black text-[#17343c]">Arkadaşınızı Hatay360’a davet edin</h2>
          <p className="mt-1.5 text-[11px] font-bold leading-relaxed text-[#6c7c84]">
            Bu linkle gelen kayıtlar panelde sizin tavsiyeniz olarak görünür. Ödül/indirim Hatay360 tarafından manuel işaretlenir.
          </p>
          {code ? <p className="mt-2 text-[11px] font-black tracking-wide text-[#007f98]">Kod: {code}</p> : null}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 truncate rounded-xl border border-[#d5e6ea] bg-white px-3 py-2 text-[11px] font-bold text-[#17343c]">{url}</code>
            <button type="button" onClick={() => void copy()} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00a8c4] px-3 py-2 text-[11px] font-black text-white">
              {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Kopyalandı" : "Kopyala"}
            </button>
          </div>
          {contactUrl ? <p className="mt-2 text-[10px] font-bold text-[#87969c]">İletişim formu: {contactUrl}</p> : null}
        </div>
      </div>
    </section>
  );
}

function UnreadRenewalNotices({
  items,
  onRead,
}: {
  items: PortalNotice[];
  onRead: (id: number) => void;
}) {
  const notices = (items || []).filter((item) => String(item.kind || "").startsWith("renewal_"));
  if (!notices.length) return null;
  return (
    <section className="mt-5 rounded-2xl border border-[#dce7e9] bg-[#f7fbfc] p-4 sm:p-5" aria-label="Yenileme bildirimleri">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">
        Hatırlatmalar{notices.length ? ` · ${notices.length}` : ""}
      </p>
      <ul className="mt-3 space-y-2">
        {notices.map((item) => (
          <li key={item.id} className="flex flex-wrap items-start justify-between gap-2 rounded-xl bg-white px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[12px] font-black text-[#17343c]">{item.title}</p>
              <p className="mt-0.5 text-[11px] font-bold leading-relaxed text-[#6c7c84]">{item.body}</p>
            </div>
            <button
              type="button"
              onClick={() => onRead(item.id)}
              className="shrink-0 rounded-full border border-[#d5e6ea] px-2.5 py-1 text-[10px] font-black text-[#49616b]"
            >
              Okundu
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RenewalNotice({ renewals }: { renewals: Renewal[] }) {
  const urgent = urgentRenewals(renewals);
  if (!urgent.length) {
    return (
      <section className="mt-5 rounded-2xl border border-[#dce7e9] bg-white p-4 text-[11px] font-bold text-[#6c7c84]" aria-label="Yenileme durumu">
        Yaklaşan yenileme yok.
      </section>
    );
  }
  const hasOverdue = urgent.some((item) => item.bucket === "overdue");
  return (
    <section
      className={`mt-5 rounded-2xl border p-4 sm:p-5 ${hasOverdue ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"}`}
      aria-label="Yaklaşan yenileme hatırlatması"
      role="status"
    >
      <div className="flex items-center gap-2">
        <CalendarClock className={`h-4 w-4 ${hasOverdue ? "text-rose-600" : "text-amber-600"}`} aria-hidden="true" />
        <p className={`text-[11px] font-black uppercase tracking-[0.14em] ${hasOverdue ? "text-rose-800" : "text-amber-800"}`}>
          {hasOverdue ? "Yenileme zamanı geçti" : "Yaklaşan yenileme"}
        </p>
      </div>
      <ul className="mt-3 space-y-2">
        {urgent.map((item) => {
          const name = item.label || RENEWAL_KIND_LABELS[item.kind];
          return (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2">
              <span className="min-w-0 text-[12px] font-black text-[#0f172a]">
                {name} <span className="font-bold text-[#6c7c84]">· {RENEWAL_KIND_LABELS[item.kind]}</span>
              </span>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${item.bucket === "overdue" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-900"}`}>
                {formatRenewDate(item.renewDate)} · {renewalCountdownLabel(item.daysLeft)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className={`mt-3 text-[11px] font-bold ${hasOverdue ? "text-rose-700" : "text-amber-800"}`}>
        Yenileme için Hatay360 ekibiyle iletişime geçebilirsiniz.
      </p>
    </section>
  );
}

function projectNextAction(project: ProjectStatus): { text: string; tab: PortalTab; label: string } | null {
  const stage = String(project.stage || project.stages?.find((item) => item.current)?.key || "").trim();
  if (stage === "baslangic") return { text: "Keşif sürüyor. Eksik bilgi varsa Yardım’dan yazın.", tab: "support", label: "Yardım" };
  if (stage === "tasarim") return { text: "Tasarım hazırlanıyor. Onaya düşünce Onay sekmesinde görünür.", tab: "approvals", label: "Onay" };
  if (stage === "onay") {
    return {
      text: (project.pendingApprovals || 0) > 0 ? "Onay bekleyen iş var." : "Onay aşamasındasınız; Hatay360 yanıtınızı bekler.",
      tab: "approvals",
      label: "Onay",
    };
  }
  if (stage === "gelistirme") return { text: "Site geliştiriliyor. Adres bağlanınca Web sitesi’nde görünür.", tab: "website", label: "Web sitesi" };
  if (stage === "test") return { text: "Test aşaması. Hata görürseniz Yardım'dan bildirin.", tab: "support", label: "Yardım" };
  if (stage === "yayinlaniyor") return { text: "Siteniz yayına alınıyor — kısa süre içinde adresinizde görünür.", tab: "website", label: "Web sitesi" };
  if (stage === "yayinda") return { text: "Yayında. SSL ve yedek Web sitesi'nde.", tab: "website", label: "Web sitesi" };
  return null;
}

function ProjectStepper({ project, goTab }: { project: ProjectStatus; goTab: (tab: PortalTab) => void }) {
  const stages = project.stages || [];
  const total = stages.length || 1;
  const progress = Math.round((project.stageIndex / Math.max(1, total - 1)) * 100);
  const next = projectNextAction(project);
  return (
    <section className="mt-6 rounded-2xl border border-[#dce7e9] bg-white p-4 shadow-[0_8px_25px_rgba(15,23,42,0.04)] sm:p-5" aria-label="Proje ilerleme durumu">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Proje İlerleme</p>
          <h2 className="mt-1 text-[16px] font-black text-[#0f172a]">Şu anki aşama: {project.stageLabel}</h2>
        </div>
        <span className="rounded-full border border-[#bfe1e6] bg-[#edf9fa] px-3 py-1 text-[10px] font-black text-[#007f98]">
          {project.stageIndex + 1} / {total} aşama
        </span>
      </div>
      <ol className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-0" role="list">
        {stages.map((stage, index) => {
          const state = stage.done ? "done" : stage.current ? "current" : "todo";
          return (
            <li key={stage.key} className="relative flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2 sm:text-center">
              {index < total - 1 ? (
                <span
                  aria-hidden="true"
                  className={`hidden sm:block absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-[18px] h-[3px] rounded-full ${stage.done ? "bg-[#00a8c4]" : "bg-[#e2ecee]"}`}
                />
              ) : null}
              <span
                className={`relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-black ${
                  state === "done"
                    ? "border-[#00a8c4] bg-[#00a8c4] text-white"
                    : state === "current"
                      ? "border-[#00a8c4] bg-white text-[#007f98] ring-4 ring-[#00a8c4]/15"
                      : "border-[#dce7e9] bg-white text-[#9fb2b8]"
                }`}
                aria-current={stage.current ? "step" : undefined}
              >
                {state === "done" ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : index + 1}
              </span>
              <span className={`text-[11px] font-black ${state === "todo" ? "text-[#9fb2b8]" : "text-[#0f172a]"}`}>
                {stage.label}
                <span className="sr-only">{state === "done" ? " (tamamlandı)" : state === "current" ? " (şu an)" : " (bekliyor)"}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[#e2ecee] sm:hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <span className="block h-full rounded-full bg-[#00a8c4] transition-all" style={{ width: `${progress}%` }} />
      </div>
      {next ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dce7e9] bg-[#f7fbfc] px-3 py-2.5">
          <p className="min-w-0 text-[12px] font-bold leading-relaxed text-[#3d4f56]">
            <span className="mr-1.5 font-black text-[#007f98]">Şimdi ne?</span>
            {next.text}
          </p>
          <button
            type="button"
            onClick={() => goTab(next.tab)}
            className="shrink-0 rounded-full border border-[#bfe1e6] bg-white px-3 py-1.5 text-[10px] font-black text-[#007f98]"
          >
            {next.label}
          </button>
        </div>
      ) : null}
      {project.lastNote ? (
        <div className="mt-3 rounded-xl border border-[#e8f0f2] bg-[#fafcfd] px-3 py-2.5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7a8f96]">
            Hatay360 notu
            {project.lastNoteAt ? (
              <time className="ml-2 font-bold normal-case tracking-normal text-[#9fb2b8]" dateTime={project.lastNoteAt}>
                {new Date(project.lastNoteAt).toLocaleDateString("tr-TR")}
              </time>
            ) : null}
          </p>
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#5a6d74]">{project.lastNote}</p>
        </div>
      ) : null}
    </section>
  );
}

export function CustomerPortalPage() {
  const { customer, logout } = useCustomerAuth();
  const { settings } = useContent();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PortalTab>(readPortalTabFromLocation);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState({ subject: "", message: "", priority: "normal" });
  const [ticketConfirm, setTicketConfirm] = useState<TicketQueueConfirm | null>(null);
  const [request, setRequest] = useState({ service: "Google Ads yönetimi", details: "" });
  const [domain, setDomain] = useState("");
  const [brandName, setBrandName] = useState("");
  const [domainResult, setDomainResult] = useState<DomainProbe | null>(null);
  const [domainBatch, setDomainBatch] = useState<DomainProbe[]>([]);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordNotice, setPasswordNotice] = useState("");
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [twoFactorNotice, setTwoFactorNotice] = useState("");
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [live, setLive] = useState<SupportLive | null>(null);
  const [adsRange, setAdsRange] = useState<AdsRange>(7);
  const [adsReport, setAdsReport] = useState<AdsReportPayload | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const markCelebrationSeen = useCallback(async () => {
    setShowCelebration(false);
    try {
      await apiRequest("/api/customer/celebration/seen", { method: "POST", body: "{}" });
      setDashboard((current) =>
        current?.project ? { ...current, project: { ...current.project, celebrationPending: false } } : current,
      );
    } catch {
      /* sessiz */
    }
  }, []);
  const load = async () => {
    setError("");
    try {
      const next = await apiRequest<Dashboard>("/api/customer/dashboard");
      setDashboard(next);
      if (next.supportLive) setLive(next.supportLive);
      setBrandName((current) => current || next.customer.company_name || "");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Panel verileri alınamadı.");
    }
  };
  const onNotificationsChange = useCallback((unread: number, items?: PortalNotice[]) => {
    setDashboard((current) => {
      if (!current) return current;
      return {
        ...current,
        unreadNotifications: unread,
        notifications: items ? items.filter((item) => !String(item.readAt || "").trim()) : current.notifications,
      };
    });
  }, []);
  const loadSecurity = async () => {
    try {
      setSecurity(await apiRequest<SecurityData>("/api/customer/security"));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Güvenlik özeti yüklenemedi.");
    }
  };

  const goTab = (tab: PortalTab) => {
    setActiveTab(tab);
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (dashboard?.project?.celebrationPending) setShowCelebration(true);
  }, [dashboard?.project?.celebrationPending]);
  useEffect(() => {
    if (activeTab !== "campaigns") return;
    let cancelled = false;
    void apiRequest<AdsReportPayload>(`/api/customer/ads-report?range=${adsRange}`)
      .then((next) => {
        if (!cancelled) setAdsReport(next);
      })
      .catch(() => {
        if (!cancelled) setAdsReport(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, adsRange]);
  useEffect(() => {
    if (activeTab === "security" && (dashboard?.role || "full") === "full") void loadSecurity();
  }, [activeTab, dashboard?.role]);
  useEffect(() => {
    writePortalTabHash(activeTab);
  }, [activeTab]);
  useEffect(() => {
    const onHash = () => {
      const tab = parsePortalTabHash(window.location.hash);
      if (tab) setActiveTab(tab);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const next = await apiRequest<SupportLive>("/api/customer/support-live");
        if (!cancelled) setLive(next);
      } catch {
        // Canlı sayı sessiz yenilenir; panel kapanmaz.
      }
    };
    const timer = window.setInterval(() => void tick(), 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const submitTicket = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const created = await apiRequest<{ ok: true; id: number; queuePosition?: number }>("/api/customer/tickets", {
        method: "POST",
        body: JSON.stringify(ticket),
      });
      const queuePosition = Number(created.queuePosition);
      setTicket({ subject: "", message: "", priority: "normal" });
      setTicketConfirm({
        id: Number(created.id),
        queuePosition: Number.isFinite(queuePosition) && queuePosition > 0 ? queuePosition : null,
      });
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Mesaj gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };
  const submitService = async (event: FormEvent) => { event.preventDefault(); setBusy(true); try { await apiRequest("/api/customer/service-requests", { method: "POST", body: JSON.stringify(request) }); setRequest((current) => ({ ...current, details: "" })); await load(); } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Talep gönderilemedi."); } finally { setBusy(false); } };
  const saveWebsite = async (fields: { logoUrl: string; phone: string; address: string; hours: string }) => {
    setBusy(true);
    setError("");
    try {
      await apiRequest("/api/customer/website", { method: "POST", body: JSON.stringify(fields) });
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Site bilgileri kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };
  const checkDomain = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const probed = await apiRequest<DomainProbe>(`/api/customer/domain-check?domain=${encodeURIComponent(domain)}`);
      setDomainResult(probed);
      setDomainBatch([]);
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Domain sorgulanamadı.");
    } finally {
      setBusy(false);
    }
  };
  const checkDomainSuggestions = async () => {
    if (!domainSuggestions.length) return;
    setBusy(true);
    setError("");
    try {
      const response = await apiRequest<DomainProbe | { checks: DomainProbe[] }>("/api/customer/domain-check", {
        method: "POST",
        body: JSON.stringify({ domains: domainSuggestions }),
      });
      const checks = "checks" in response ? response.checks : [response];
      setDomainBatch(checks);
      setDomainResult(null);
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Domain önerileri sorgulanamadı.");
    } finally {
      setBusy(false);
    }
  };
  const requestDomainTicket = (target: string) => {
    setTicket({
      subject: `Domain talebi: ${target}`,
      message: `Merhaba Hatay360,\n\n${target} alan adını panelden kontrol ettim. Kayıt / yönlendirme için yardımcı olur musunuz?\n\nFirma: ${dashboard?.customer.company_name || ""}`,
      priority: "normal",
    });
    goTab("support");
  };
  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordNotice("");
    setError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Yeni şifre ve tekrarı aynı olmalıdır.");
      return;
    }
    setBusy(true);
    try {
      const result = await apiRequest<{ message: string }>("/api/customer/password", { method: "POST", body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }) });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordNotice(result.message || "Şifreniz güncellendi. Diğer cihazlardaki oturumlar kapatıldı.");
      await loadSecurity();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Şifre güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };
  const toggleTwoFactor = async (enabled: boolean) => {
    setTwoFactorNotice("");
    setError("");
    setBusy(true);
    try {
      await apiRequest("/api/customer/2fa", {
        method: "POST",
        body: JSON.stringify({ enabled, currentPassword: twoFactorPassword }),
      });
      setTwoFactorPassword("");
      setTwoFactorNotice(enabled ? "İki adımlı doğrulama açıldı." : "İki adımlı doğrulama kapatıldı.");
      await load();
    } catch (nextError) {
      setTwoFactorNotice(nextError instanceof Error ? nextError.message : "2FA güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const revokeOtherSessions = async () => {
    setBusy(true);
    setPasswordNotice("");
    setError("");
    try {
      const result = await apiRequest<{ ok: boolean; revoked: number }>("/api/customer/sessions/revoke-others", { method: "POST" });
      setPasswordNotice(
        result.revoked
          ? `${result.revoked} diğer oturum kapatıldı. Bu tarayıcı açık kaldı.`
          : "Kapatılacak başka oturum yoktu.",
      );
      await loadSecurity();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Oturumlar kapatılamadı.");
    } finally {
      setBusy(false);
    }
  };

  const maxSpend = useMemo(() => Math.max(1, ...(dashboard?.campaigns.map((item) => Number(item.spend)) || [1])), [dashboard]);
  const historyMax = useMemo(() => Math.max(1, ...(dashboard?.stats.flatMap((item) => [Number(item.spend), Number(item.revenue)]) || [1])), [dashboard]);
  const pwdStrength = passwordStrength(passwordForm.newPassword);
  const passwordsMatch = Boolean(passwordForm.confirmPassword) && passwordForm.newPassword === passwordForm.confirmPassword;
  const domainSuggestions = useMemo(() => {
    const base = brandName
      .toLocaleLowerCase("tr-TR")
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 40);
    if (!base) return [];
    return [...new Set([`${base}.com`, `${base}.com.tr`, `${base}.net`, `${base}hatay.com`])];
  }, [brandName]);
  if (!dashboard) return <div className="flex min-h-screen items-center justify-center bg-[#071b22] text-sm font-bold text-white/70">{error || "Müşteri paneli hazırlanıyor…"}</div>;
  const website = dashboard.website || { packageId: "", packageName: "Paket atanmadı", editMode: "none" as const, canEdit: false, url: "", logoUrl: "", phone: "", address: "", hours: "", sslStatus: "unknown", siteStatus: "open", lastBackupAt: "", lastUpdateAt: "" };
  const maps = dashboard.maps || [];
  const adsConnection = dashboard.adsConnection || adsBindingFallback({ status: "pending" });
  const dailyMetrics = dashboard.dailyMetrics || [];

  const downloadReport = () => {
    const quote = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Firma", "Kampanya", "Platform", "Dönem Başlangıç", "Dönem Bitiş", "Harcama", "Gelir", "Gösterim", "Tıklama", "Lead", "Dönüşüm"],
      ...dashboard.stats.map((item) => [dashboard.customer.company_name, item.campaign_name, item.platform, item.period_start, item.period_end, item.spend, item.revenue, item.impressions, item.clicks, item.leads, item.conversions]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(quote).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${dashboard.customer.company_name.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9]+/g, "-") || "hatay360"}-reklam-raporu.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  const isFull = (dashboard.role || "full") === "full";
  const fullNav = [
    { id: "overview" as const, label: "Genel Bakış", icon: LayoutDashboard },
    { id: "website" as const, label: "Web sitesi", icon: LayoutTemplate },
    { id: "campaigns" as const, label: "Reklamlarım", icon: Megaphone },
    { id: "contracts" as const, label: "Sözleşmeler", icon: FileText },
    { id: "approvals" as const, label: "Onay Bekleyenler", icon: ClipboardCheck },
    { id: "quotes" as const, label: "Teklifler", icon: PenLine },
    { id: "payments" as const, label: "Ödemeler", icon: Wallet },
    { id: "support" as const, label: "Yardım & Sorular", icon: HelpCircle },
    { id: "services" as const, label: "Ek Hizmetler", icon: PlusCircle },
    { id: "seo" as const, label: "SEO sıralamam", icon: Search },
    { id: "domain" as const, label: "Domain Sorgula", icon: Globe2 },
    { id: "security" as const, label: "Şifre & Güvenlik", icon: ShieldCheck },
    { id: "users" as const, label: "Kullanıcılar", icon: Users },
  ];
  // Sınırlı kullanıcılar yalnızca temel panel, onaylar ve destek görür.
  const limitedNav = [
    { id: "overview" as const, label: "Genel Bakış", icon: LayoutDashboard },
    { id: "approvals" as const, label: "Onay Bekleyenler", icon: ClipboardCheck },
    { id: "quotes" as const, label: "Teklifler", icon: PenLine },
    { id: "services" as const, label: "Ek Hizmetler", icon: PlusCircle },
    { id: "seo" as const, label: "SEO sıralamam", icon: Search },
    { id: "support" as const, label: "Yardım & Sorular", icon: HelpCircle },
  ];
  const nav = isFull ? fullNav : limitedNav;
  const whatsappHref = toWhatsAppHref(settings.phone, `Merhaba Hatay360, müşteri panelinden yazıyorum. Firma: ${dashboard.customer.company_name}`);
  const opsAlerts = computeCustomerOpsAlerts({
    payments: dashboard.payments || [],
    paymentSummary: dashboard.paymentSummary || { total: 0, paid: 0, unpaid: 0, remaining: 0 },
    contracts: dashboard.contracts || [],
    approvalsPending: dashboard.approvalsPending || 0,
    quotesPending: dashboard.quotesPending || 0,
    tickets: dashboard.tickets || [],
    serviceRequests: dashboard.serviceRequests || [],
    maps,
    companyName: dashboard.customer.company_name,
    companyPhone: dashboard.customer.phone,
    websitePhone: website.phone,
    websiteAddress: website.address,
  });
  const contractsNeedingSign = opsAlerts.contractsNeedingSign;
  const joinWhatsApp = async () => {
    try {
      await apiRequest("/api/customer/whatsapp-queue", { method: "POST" });
      const next = await apiRequest<SupportLive>("/api/customer/support-live");
      setLive(next);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "WhatsApp sırası alınamadı.");
    }
    window.open(whatsappHref, "_blank", "noopener,noreferrer");
  };
  const signOut = async () => {
    await logout();
    navigate("/musteri/giris", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f3f7f8] text-[#102b35] lg:grid lg:grid-cols-[245px_1fr]">
      <PublishCelebration active={showCelebration} onDone={() => void markCelebrationSeen()} />
      <aside className="border-b border-white/10 bg-[#071b22] p-4 text-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-5">
        <SiteLogo variant="onDark" preview={{ logoDarkHeight: 38 }} />
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 lg:mt-7 lg:p-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#70dce9]">Müşteri hesabı</p><p className="mt-2 text-[14px] font-black">{customer?.company_name}</p><p className="mt-1 truncate text-[10px] text-white/45">{customer?.email}</p></div>
        <nav className="mt-5 hidden grid-cols-1 gap-2 lg:grid">{nav.map(({ id, label, icon: Icon }) => {
          const badge = id === "overview" ? dashboard.unreadNotifications || 0 : customerNavBadge(opsAlerts, id);
          return (
            <button key={id} onClick={() => goTab(id)} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[11px] font-black transition ${activeTab === id ? "bg-[#00a8c4] text-white" : "text-white/60 hover:bg-white/7 hover:text-white"}`}>
              <Icon className="h-4 w-4" />
              {label}
              {badge > 0 ? <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[8px] text-white ${id === "payments" && opsAlerts.overdueRows ? "bg-rose-500" : id === "contracts" ? "bg-violet-500" : id === "approvals" ? "bg-fuchsia-500" : id === "quotes" ? "bg-sky-500" : id === "support" ? "bg-cyan-500" : id === "website" && opsAlerts.napIssues ? "bg-amber-500" : "bg-[#00a8c4]"}`}>{badge}</span> : null}
            </button>
          );
        })}</nav>
        <button onClick={() => void signOut()} className="mt-5 hidden items-center gap-2 text-[10px] font-black text-white/45 hover:text-white lg:flex"><LogOut className="h-4 w-4" /> Güvenli çıkış</button>
      </aside>

      <main className="min-w-0 p-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:p-7 lg:p-9 lg:pb-9">
        <header className="rounded-[24px] border border-[#d5e6ea] bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Hatay360 müşteri paneli</p>
              <h1 className="mt-2 text-[28px] font-black tracking-[-0.04em]">Merhaba, {dashboard.customer.contact_name}</h1>
              <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-[#6c7c84]">Site, reklam ve harita aynı hesapta. Reklam tıklaması ile site ziyareti ayrı tutulur.</p>
              <OverviewTrust website={website} maps={maps} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CustomerNotificationBell unreadCount={dashboard.unreadNotifications || 0} onUnreadChange={onNotificationsChange} />
              {isFull && <button onClick={downloadReport} disabled={!dashboard.stats.length} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#bfe1e6] bg-[#edf9fa] px-3 py-2 text-[10px] font-black text-[#007f98] disabled:cursor-not-allowed disabled:opacity-45"><Download className="h-3.5 w-3.5" /> CSV raporu</button>}
              <button onClick={() => void load()} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#d7e4e7] bg-white px-3 py-2 text-[10px] font-black text-[#49616b]"><RefreshCw className="h-3.5 w-3.5" /> Yenile</button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {([{ id: "website" as const, label: "Site" }, { id: "campaigns" as const, label: "Reklam" }, { id: "contracts" as const, label: contractsNeedingSign ? `Sözleşme (${contractsNeedingSign})` : "Sözleşme" }, { id: "approvals" as const, label: opsAlerts.approvalsPending ? `Onay (${opsAlerts.approvalsPending})` : "Onay" }, { id: "quotes" as const, label: opsAlerts.quotesPending ? `Teklif (${opsAlerts.quotesPending})` : "Teklifler" }, { id: "services" as const, label: "Ek Hizmetler" }, { id: "seo" as const, label: "SEO" }, { id: "support" as const, label: "Yardım" }] as const).filter((item) => isFull || item.id === "approvals" || item.id === "quotes" || item.id === "support" || item.id === "services" || item.id === "seo").map((item) => (
              <button key={item.id} type="button" onClick={() => goTab(item.id)} className={`rounded-full border px-3 py-1.5 text-[10px] font-black ${item.id === "contracts" && contractsNeedingSign ? "border-violet-300 bg-violet-50 text-violet-800" : item.id === "approvals" && opsAlerts.approvalsPending ? "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800" : item.id === "quotes" && opsAlerts.quotesPending ? "border-sky-300 bg-sky-50 text-sky-800" : "border-[#d5e6ea] bg-[#f7fbfc] text-[#007f98]"}`}>{item.label}</button>
            ))}
          </div>
          <CustomerPortalAnnouncements items={dashboard.announcements || []} />
        </header>
        {error && <div className="mt-5"><FormError>{error}</FormError></div>}

        {activeTab === "overview" && <>
          <CustomerOpsAlertsBar alerts={opsAlerts} onNavigate={goTab} />
          <UnreadRenewalNotices
            items={dashboard.notifications || []}
            onRead={(id) => {
              void apiRequest(`/api/customer/notifications/${id}/read`, { method: "POST" })
                .then(() => load())
                .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Bildirim güncellenemedi."));
            }}
          />
          <RenewalNotice renewals={dashboard.renewals || []} />
          {dashboard.project ? <ProjectStepper project={dashboard.project} goTab={goTab} /> : null}
          {!isFull ? (
            <section className="mt-5 rounded-2xl border border-[#dce7e9] bg-white p-4 text-[11px] font-bold leading-relaxed text-[#6c7c84]" aria-label="Sınırlı erişim bilgisi">
              Sınırlı kullanıcı hesabıyla giriş yaptınız. Fatura, ödeme, sözleşme, yenileme ve güvenlik alanları gizlenmiştir. Onaylar, teklifler, ek hizmet talebi ve destek açıktır. Teklif kabulü yalnızca tam yetkili kullanıcılar tarafından yapılır.
            </section>
          ) : null}
          {isFull && (
            <PortalServiceStrip
              website={website}
              maps={maps}
              campaignCount={dashboard.campaigns.length}
              adsSpend={money(dashboard.totals.spend)}
              onOpen={(tab) => {
                if (tab === "services") {
                  setRequest((current) => ({ ...current, service: "Google Maps SEO" }));
                }
                goTab(tab);
              }}
            />
          )}
          {needsMapsCta(maps) ? (
            <div className="mt-5">
              <MapsEmptyCard
                maps={maps}
                onRequestMaps={isFull ? () => {
                  setRequest((current) => ({ ...current, service: "Google Maps SEO" }));
                  goTab("services");
                } : undefined}
              />
            </div>
          ) : null}
          {isFull && (
            <PaymentDueCard
              payments={dashboard.payments || []}
              paymentSummary={dashboard.paymentSummary || { total: 0, paid: 0, unpaid: 0, remaining: 0 }}
              onOpen={() => goTab("payments")}
            />
          )}
          {isFull && (
            <ContractActionCard
              contracts={dashboard.contracts || []}
              onOpen={() => goTab("contracts")}
            />
          )}
          <TrustStrip website={website} maps={maps} companyName={dashboard.customer.company_name} companyPhone={dashboard.customer.phone} />
          {dashboard.referralUrl ? <ReferralShareCard code={dashboard.referralCode || ""} url={dashboard.referralUrl} contactUrl={dashboard.referralContactUrl} /> : null}
          <CustomerSeoPanel seo={dashboard.seo} />
          {isFull && <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
            { label: "Aylık reklam bütçesi", value: money(dashboard.totals.monthlyBudget), icon: CircleDollarSign, tone: "#00a8c4" },
            { label: "Toplam harcama", value: money(dashboard.totals.spend), icon: BarChart3, tone: "#007f98" },
            { label: "Ölçülen gelir", value: money(dashboard.totals.revenue), icon: TrendingUp, tone: "#10b981" },
            { label: "Net sonuç", value: money(dashboard.totals.profit), icon: CircleDollarSign, tone: dashboard.totals.profit >= 0 ? "#10b981" : "#ef4444" },
          ].map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-[#dce7e9] bg-white p-4 shadow-[0_8px_25px_rgba(15,23,42,0.04)]"><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${tone}15`, color: tone }}><Icon className="h-4 w-4" /></span><p className="mt-4 text-[9px] font-black uppercase tracking-wide text-[#84939a]">{label}</p><p className="mt-1 text-[22px] font-black">{value}</p></article>)}</section>}
          {isFull && <AdsVsWebCard dailyMetrics={dailyMetrics} metricsSource={dashboard.metricsSource} adsConnection={adsConnection} />}
        </>}

        {isFull && activeTab === "website" && (
          <CustomerWebsitePanel
            website={website}
            maps={maps}
            companyName={dashboard.customer.company_name}
            companyPhone={dashboard.customer.phone}
            busy={busy}
            onSave={saveWebsite}
            onRequestMaps={() => {
              setRequest((current) => ({ ...current, service: "Google Maps SEO" }));
              goTab("services");
            }}
            onRequestWebsite={() => {
              setRequest((current) => ({ ...current, service: "Web sitesi" }));
              goTab("services");
            }}
            onRequestSsl={() => {
              setRequest((current) => ({ ...current, service: "SSL sertifikası" }));
              goTab("services");
            }}
            onCheckDomain={() => goTab("domain")}
            onWhatsApp={() => void joinWhatsApp()}
          />
        )}

        {isFull && activeTab === "contracts" && (
          <CustomerContractsPanel
            contracts={dashboard.contracts || []}
            busy={busy}
            onError={setError}
            onRefresh={load}
          />
        )}

        {activeTab === "approvals" && (
          <CustomerApprovalsPanel
            approvals={dashboard.approvals || []}
            busy={busy}
            onError={setError}
            onRefresh={load}
          />
        )}

        {activeTab === "quotes" && (
          <CustomerQuotesPanel
            quotes={dashboard.quotes || []}
            busy={busy}
            canAccept={isFull}
            onError={setError}
            onRefresh={load}
          />
        )}

        {isFull && activeTab === "payments" && (
          <CustomerBillingPanel
            invoices={dashboard.invoices || []}
            products={dashboard.products || []}
            services={dashboard.services || []}
            extras={dashboard.extras || []}
            payments={dashboard.payments || []}
            paymentSummary={dashboard.paymentSummary || { total: 0, paid: 0, unpaid: 0, remaining: 0 }}
            paymentGateway={dashboard.paymentGateway}
            busy={busy}
            onError={setError}
            onRefresh={load}
          />
        )}

        {isFull && activeTab === "campaigns" && (() => {
          const hasCampaigns = dashboard.campaigns.length > 0;
          return <>
          <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
            { label: "Aylık reklam bütçesi", value: money(dashboard.totals.monthlyBudget), icon: CircleDollarSign, tone: "#00a8c4" },
            { label: "Toplam harcama", value: money(dashboard.totals.spend), icon: BarChart3, tone: "#007f98" },
            { label: "Ölçülen gelir", value: money(dashboard.totals.revenue), icon: TrendingUp, tone: "#10b981" },
            { label: "Net sonuç", value: money(dashboard.totals.profit), icon: CircleDollarSign, tone: dashboard.totals.profit >= 0 ? "#10b981" : "#ef4444" },
          ].map(({ label, value, icon: Icon, tone }) => (
            <article key={label} className={`rounded-2xl border bg-white p-4 shadow-[0_8px_25px_rgba(15,23,42,0.04)] ${hasCampaigns ? "border-[#dce7e9]" : "border-dashed border-[#cbdadd] opacity-80"}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${tone}15`, color: tone }}><Icon className="h-4 w-4" /></span>
              <p className="mt-4 text-[9px] font-black uppercase tracking-wide text-[#84939a]">{label}</p>
              <p className="mt-1 text-[22px] font-black">{value}</p>
              {!hasCampaigns ? <p className="mt-1 text-[8px] font-bold text-[#93a0a6]">Kampanya yok · özet değil</p> : null}
            </article>
          ))}</section>
          <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[
            ["Reklam gösterim", number(dashboard.totals.impressions)], ["Reklam tıklaması", number(dashboard.totals.clicks)], ["Potansiyel müşteri", number(dashboard.totals.leads)], ["Dönüşüm", number(dashboard.totals.conversions)], ["ROAS", `${dashboard.totals.roas.toFixed(2)}x`],
          ].map(([label, value]) => (
            <div key={label} className={`rounded-xl border px-4 py-3 ${hasCampaigns ? "border-[#dfe8ea] bg-[#f9fbfb]" : "border-dashed border-[#d5e0e3] bg-[#f7f9fa]"}`}>
              <p className="text-[9px] font-bold text-[#829097]">{label}</p>
              <p className="mt-1 text-[17px] font-black">{value}</p>
            </div>
          ))}</section>
          <p className="mt-3 text-[10px] font-bold text-[#87969c]">Google Ads / Meta API: {adsConnection.live ? "bağlı" : "kapalı"} · {adsConnection.detail}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wide ${adsConnection.googleBound ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              Google {adsConnection.googleBound ? "kayıtlı" : "yok"}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wide ${adsConnection.metaBound ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              Meta {adsConnection.metaBound ? "kayıtlı" : "yok"}
            </span>
          </div>
          <AdsReportScaffold
            report={adsReport || { range: adsRange, series: [], source: "none", binding: adsConnection }}
            range={adsRange}
            onRange={setAdsRange}
          />
          <section className="mt-7">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Kampanya performansı</p>
                <h2 className="mt-1 text-[21px] font-black">Google ve Meta reklamları</h2>
              </div>
              {hasCampaigns ? <span className="text-[9px] font-bold text-[#87969c]">Yönetim ücreti net sonuç hesabına dahildir</span> : null}
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {hasCampaigns ? dashboard.campaigns.map((campaign) => (
                <article key={campaign.id} className="rounded-[22px] border border-[#dce7e9] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <ServiceMark name={campaign.name} platform={campaign.platform} size={36} />
                      <div>
                        <span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase ${campaign.platform === "google" ? "bg-blue-50 text-blue-700" : campaign.platform === "meta" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>{campaign.platform}</span>
                        <h3 className="mt-2 text-[17px] font-black">{campaign.name}</h3>
                      </div>
                    </div>
                    <StatusDot kind={campaignDotKind(campaign.status)} label={statusLabel[campaign.status] || campaign.status} />
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf2f3]"><div className="h-full rounded-full bg-[#00a8c4]" style={{ width: `${Math.max(3, (Number(campaign.spend) / maxSpend) * 100)}%` }} /></div>
                  <div className="mt-4 grid grid-cols-3 gap-2">{[["Harcama", money(campaign.spend)], ["Gelir", money(campaign.revenue)], ["ROAS", `${Number(campaign.roas).toFixed(2)}x`], ["Tıklama", number(campaign.clicks)], ["Lead", number(campaign.leads)], ["Net", money(campaign.profit)]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#f6f9fa] p-3"><p className="text-[8px] font-bold text-[#87969c]">{label}</p><p className="mt-1 text-[12px] font-black">{value}</p></div>)}</div>
                </article>
              )) : (
                <CampaignsEmptyCard
                  adsConnection={adsConnection}
                  onRequestAds={() => {
                    setRequest((current) => ({ ...current, service: "Google Ads yönetimi" }));
                    goTab("services");
                  }}
                  onWhatsApp={() => void joinWhatsApp()}
                />
              )}
            </div>
          </section>
          {dashboard.stats.length > 0 && <section className="mt-7 rounded-[22px] border border-[#dce7e9] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Aylık gelişim</p><h2 className="mt-1 text-[20px] font-black">Harcama ve ölçülen gelir geçmişi</h2></div><div className="flex gap-3 text-[8px] font-black"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#00a8c4]" /> Harcama</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#10b981]" /> Gelir</span></div></div><div className="mt-6 flex min-h-[190px] items-end gap-3 overflow-x-auto pb-2">{dashboard.stats.map((item) => <div key={item.id} className="flex min-w-[76px] flex-1 flex-col items-center"><div className="flex h-[145px] items-end gap-1.5"><span role="img" aria-label={`Harcama: ${money(item.spend)}`} title={`Harcama: ${money(item.spend)}`} className="w-5 rounded-t-md bg-[#00a8c4]" style={{ height: `${Math.max(4, (Number(item.spend) / historyMax) * 100)}%` }} /><span role="img" aria-label={`Gelir: ${money(item.revenue)}`} title={`Gelir: ${money(item.revenue)}`} className="w-5 rounded-t-md bg-[#10b981]" style={{ height: `${Math.max(4, (Number(item.revenue) / historyMax) * 100)}%` }} /></div><p className="mt-2 text-[8px] font-black text-[#4e6570]">{new Date(`${item.period_start}T00:00:00`).toLocaleDateString("tr-TR", { month: "short", year: "2-digit" })}</p><p className="mt-0.5 max-w-[76px] truncate text-[7px] text-[#93a0a6]">{item.campaign_name}</p></div>)}</div></section>}
        </>;
        })()}

        {activeTab === "support" && (
          <CustomerHelpCenter
            tickets={dashboard.tickets}
            live={live}
            ticket={ticket}
            busy={busy}
            confirm={ticketConfirm}
            onTicketChange={setTicket}
            onSubmitTicket={submitTicket}
            onDismissConfirm={() => setTicketConfirm(null)}
            onWhatsApp={() => void joinWhatsApp()}
          />
        )}

        {activeTab === "services" && (
          <section className="mt-7 space-y-5">
            <CustomerExtrasPanel onRequested={load} />
            {isFull ? (
              <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={submitService} className="rounded-[22px] border border-[#dce7e9] bg-white p-5">
                  <div className="flex items-center gap-2"><ServiceMark name={request.service} size={36} /><PlusCircle className="h-5 w-5 text-[#00a8c4]" /></div>
                  <h2 className="mt-4 text-[20px] font-black">Özel hizmet isteyin</h2>
                  <select value={request.service} onChange={(event) => setRequest({ ...request, service: event.target.value })} className="mt-5 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px]">{["Google Ads yönetimi", "Meta reklam yönetimi", "Google Maps SEO", "Web sitesi", "SSL sertifikası", "E-ticaret", "Özel yazılım", "Diğer"].map((service) => <option key={service}>{service}</option>)}</select>
                  <textarea required rows={6} value={request.details} onChange={(event) => setRequest({ ...request, details: event.target.value })} placeholder="İhtiyacınızı ve hedefinizi anlatın" className="mt-3 w-full rounded-xl border border-[#dbe5e8] p-3 text-[12px] outline-none focus:border-[#00a8c4]" />
                  <button disabled={busy} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-3 text-[11px] font-black text-white"><Send className="h-4 w-4" /> Talep oluştur</button>
                </form>
                <div className="space-y-3">{dashboard.serviceRequests.length ? dashboard.serviceRequests.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-[#dce7e9] bg-white p-4">
                    <div className="flex justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <ServiceMark name={item.service} size={32} />
                        <div>
                          {item.kind === "extra" ? <p className="text-[8px] font-black uppercase tracking-wide text-[#00a8c4]">Ek Hizmet Talebi</p> : null}
                          <h3 className="text-[13px] font-black">{item.service}</h3>
                        </div>
                      </div>
                      <StatusDot kind={serviceDotKind(item.status)} label={statusLabel[item.status] || item.status} />
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-[#64767e]">{item.details}</p>
                  </article>
                )) : <EmptyRow icon={ClipboardList} title="Hizmet talebi yok" hint="Üstten ek hizmet veya soldan özel iş isteyin." />}</div>
              </div>
            ) : (
              <div className="space-y-3">{dashboard.serviceRequests.filter((item) => item.kind === "extra").length ? dashboard.serviceRequests.filter((item) => item.kind === "extra").map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#dce7e9] bg-white p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-wide text-[#00a8c4]">Ek Hizmet Talebi</p>
                      <h3 className="mt-1 text-[13px] font-black">{item.service}</h3>
                    </div>
                    <StatusDot kind={serviceDotKind(item.status)} label={statusLabel[item.status] || item.status} />
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#64767e]">{item.details}</p>
                </article>
              )) : <EmptyRow icon={ClipboardList} title="Ek hizmet talebi yok" hint="Kartlardan Talep Et deyince burada görünür. Faturalar sınırlı kullanıcıda gizlidir." />}</div>
            )}
          </section>
        )}

        {activeTab === "seo" && <CustomerSeoPanel seo={dashboard.seo} />}

        {isFull && activeTab === "domain" && (
          <section className="mt-7 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[24px] bg-[#071b22] p-6 text-white">
              <Globe2 className="h-6 w-6 text-[#70dce9]" />
              <h2 className="mt-5 text-[24px] font-black">Firma adınıza uygun domaini kontrol edin.</h2>
              <p className="mt-3 text-[12px] leading-relaxed text-white/55">
                Markadan .com / .com.tr / .net önerileri üretir; DNS ve MX kaydına bakarız. Kesin satın alınabilirlik kayıt kuruluşunda doğrulanır.
              </p>
              <label className="mt-5 block text-[9px] font-black uppercase tracking-wide text-white/50">
                Firma / marka adı
                <input value={brandName} onChange={(event) => setBrandName(event.target.value)} placeholder="Örnek: A Firması" className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-[12px] text-white outline-none" />
              </label>
              {domainSuggestions.length > 0 && (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {domainSuggestions.map((suggestion) => (
                      <button type="button" key={suggestion} onClick={() => setDomain(suggestion)} className="rounded-full border border-[#70dce9]/25 bg-[#70dce9]/10 px-3 py-1.5 text-[9px] font-black text-[#8ceaf3]">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <button type="button" disabled={busy} onClick={() => void checkDomainSuggestions()} className="rounded-xl border border-[#70dce9]/30 bg-[#70dce9]/10 px-4 py-2.5 text-[11px] font-black text-[#8ceaf3] disabled:opacity-40">
                    Önerileri toplu sorgula
                  </button>
                </div>
              )}
              <form onSubmit={checkDomain} className="mt-4 flex gap-2">
                <input required value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="firmam.com" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-[12px] text-white outline-none" />
                <button disabled={busy} className="rounded-xl bg-[#00a8c4] px-4 text-white"><Search className="h-4 w-4" /></button>
              </form>
              {domainResult && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[13px] font-black">{domainResult.domain}</p>
                  <p className="mt-1 text-[11px] font-black text-[#70dce9]">{statusLabel[domainResult.result] || domainResult.result}</p>
                  {domainResult.signals?.hasMx ? <p className="mt-1 text-[9px] font-bold text-white/45">MX (e-posta) kaydı var</p> : null}
                  <p className="mt-2 text-[9px] text-white/45">{domainResult.note}</p>
                  {domainResult.result === "potentially_available" ? (
                    <button type="button" onClick={() => requestDomainTicket(domainResult.domain)} className="mt-3 rounded-xl bg-[#00a8c4] px-3 py-2 text-[10px] font-black text-white">
                      Satın alma talebi aç
                    </button>
                  ) : null}
                </div>
              )}
              {domainBatch.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wide text-white/45">Toplu sonuç</p>
                  {domainBatch.map((item) => (
                    <div key={item.domain} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                      <div>
                        <p className="text-[12px] font-black">{item.domain}</p>
                        <p className="mt-0.5 text-[9px] font-bold text-[#70dce9]">{statusLabel[item.result] || item.result}{item.signals?.hasMx ? " · MX var" : ""}</p>
                      </div>
                      {item.result === "potentially_available" ? (
                        <button type="button" onClick={() => requestDomainTicket(item.domain)} className="rounded-lg bg-[#00a8c4] px-2.5 py-1.5 text-[9px] font-black text-white">
                          Ticket aç
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-[24px] border border-[#dce7e9] bg-white p-5">
              <h3 className="text-[17px] font-black">Son sorgular</h3>
              <div className="mt-4 space-y-2">
                {dashboard.domainChecks.length ? dashboard.domainChecks.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#f5f8f9] px-3 py-3">
                    <button type="button" onClick={() => setDomain(item.domain)} className="text-left text-[11px] font-black text-[#102b35] hover:text-[#00a8c4]">{item.domain}</button>
                    <span className="text-[8px] font-black text-[#00a8c4]">{statusLabel[item.result] || item.result}</span>
                  </div>
                )) : <EmptyRow icon={Globe2} title="Henüz sorgu yok" hint="Soldan bir alan adı kontrol edin." />}
              </div>
            </div>
          </section>
        )}

        {isFull && activeTab === "security" && (
          <section className="mt-7 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Hesap güvenliği</p>
                <h2 className="mt-1 text-[24px] font-black">Şifre, oturum ve giriş denemeleri</h2>
                <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[#718188]">
                  Şifrenizi yenileyin, açık oturumları görün, şüpheli girişleri izleyin; diğer cihazları tek tıkla kapatın.
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void loadSecurity()}
                className="inline-flex items-center gap-2 rounded-xl border border-[#dbe5e8] bg-white px-3 py-2 text-[11px] font-black text-[#355661] hover:bg-[#f5f8f9] disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Yenile
              </button>
            </div>

            {passwordNotice ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-700" role="status">{passwordNotice}</p> : null}

            {(() => {
              const twoFactor = dashboard.twoFactor || { enabled: false, available: false, reason: "E-posta gönderimi henüz bağlanmadı." };
              const switchOn = twoFactor.enabled;
              const looksUnavailable = !twoFactor.available && !twoFactor.enabled;
              return (
                <section className="rounded-[24px] border border-[#dce7e9] bg-white p-6 shadow-sm" aria-labelledby="two-factor-heading">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-[#00a8c4]" aria-hidden="true" />
                        <h3 id="two-factor-heading" className="text-[18px] font-black">İki adımlı doğrulama (2FA)</h3>
                      </div>
                      <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-[#718188]">
                        Açıldığında girişte şifreden sonra e-posta kodu istenir. E-posta gönderimi henüz bağlanmadı; mevcut girişiniz şifre ile aynı şekilde çalışır.
                      </p>
                      <p className="mt-3 inline-flex rounded-full bg-[#eef4f6] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#49616b]">
                        {looksUnavailable ? "Henüz kullanılamıyor" : switchOn ? "Açık" : "Kapalı"}
                      </p>
                      <p className="mt-2 text-[11px] font-semibold text-[#5d717a]">{twoFactor.reason}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={switchOn}
                      aria-disabled={looksUnavailable || busy}
                      disabled={busy}
                      onClick={() => {
                        if (busy) return;
                        if (!twoFactorPassword) {
                          setTwoFactorNotice("Bu değişikliği onaylamak için mevcut şifrenizi girin.");
                          return;
                        }
                        void toggleTwoFactor(!switchOn);
                      }}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed ${
                        switchOn ? "bg-[#00a8c4]" : "bg-[#c5d4d8]"
                      } ${looksUnavailable ? "opacity-45" : ""}`}
                    >
                      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${switchOn ? "left-[22px]" : "left-0.5"}`} />
                      <span className="sr-only">İki adımlı doğrulama</span>
                    </button>
                  </div>
                  <label className="mt-4 block text-[9px] font-black uppercase tracking-wide text-[#718188]">
                    Onay için mevcut şifre
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={twoFactorPassword}
                      onChange={(event) => setTwoFactorPassword(event.target.value)}
                      className="mt-2 w-full max-w-sm rounded-xl border border-[#dbe5e8] px-3 py-3 text-[12px] normal-case tracking-normal outline-none focus:border-[#00a8c4]"
                    />
                  </label>
                  {twoFactorNotice ? (
                    <p className="mt-3 rounded-xl border border-[#dbe5e8] bg-[#f7fafb] px-3 py-2.5 text-[11px] font-bold text-[#49616b]" role="status">
                      {twoFactorNotice}
                    </p>
                  ) : null}
                </section>
              );
            })()}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#dce7e9] bg-white px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-[#00a8c4]">Hesap</p>
                <p className="mt-1 truncate text-[16px] font-black">{security?.email || dashboard.customer.email}</p>
              </div>
              <div className="rounded-2xl border border-[#dce7e9] bg-white px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Aktif oturum</p>
                <p className="mt-1 text-[28px] font-black">{security?.activeSessions ?? "—"}</p>
              </div>
              <div className="rounded-2xl border border-[#dce7e9] bg-white px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-rose-700">Başarısız (24s)</p>
                <p className="mt-1 text-[28px] font-black">{security?.failed24h ?? "—"}</p>
              </div>
            </div>

            <section className="rounded-[24px] border border-[#dce7e9] bg-white p-6 shadow-sm" aria-labelledby="session-list-heading">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 id="session-list-heading" className="text-[18px] font-black">Açık oturumlar</h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#718188]">
                    Bu cihaz işaretlidir. Tanımadığınız oturum varsa diğerlerini kapatın; IP saklanmaz, yalnızca oturum etiketi görünür.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy || !security || security.activeSessions <= 1}
                  onClick={() => void revokeOtherSessions()}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#dbe5e8] bg-[#f5f8f9] px-3 py-2 text-[10px] font-black text-[#355661] hover:bg-[#eef4f6] disabled:opacity-40"
                >
                  <LogOut className="h-3.5 w-3.5" /> Diğer oturumları kapat
                </button>
              </div>
              <ul className="mt-4 space-y-2">
                {(security?.sessions || []).length ? (
                  security!.sessions!.map((session) => (
                    <li
                      key={session.id}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                        session.current ? "border-emerald-200 bg-emerald-50/70" : "border-[#e4ecee] bg-[#f7fafb]"
                      }`}
                    >
                      <div>
                        <p className="text-[12px] font-black">
                          {session.current ? "Bu cihaz" : "Başka oturum"}
                          <span className="ml-2 font-bold text-[#7a8b92]">· {session.id}</span>
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#7a8b92]">
                          Açılış {formatSecurityDate(session.createdAt)} · bitiş {formatSecurityDate(session.expiresAt)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${
                          session.current ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {session.current ? "Şu an" : "Aktif"}
                      </span>
                    </li>
                  ))
                ) : (
                  <EmptyRow icon={ShieldAlert} title="Oturum listesi yok" hint="Güvenlik özeti yenilenince burada görünür." />
                )}
              </ul>
            </section>

            <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <form onSubmit={changePassword} className="rounded-[24px] border border-[#dce7e9] bg-white p-6 shadow-sm">
                <KeyRound className="h-6 w-6 text-[#00a8c4]" aria-hidden="true" />
                <h3 className="mt-4 text-[18px] font-black">Şifrenizi yenileyin</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-[#718188]">
                  En az 10 karakter. Değişince diğer cihazlardaki oturumlar düşer; bu tarayıcıda kalırsınız.
                </p>
                <div className="mt-5 grid gap-3">
                  <label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">
                    Mevcut şifre
                    <input required type="password" autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-3 text-[12px] normal-case tracking-normal outline-none focus:border-[#00a8c4]" />
                  </label>
                  <label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">
                    Yeni şifre
                    <input required minLength={10} maxLength={128} type="password" autoComplete="new-password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-3 text-[12px] normal-case tracking-normal outline-none focus:border-[#00a8c4]" aria-describedby="password-strength-hint" />
                  </label>
                  {passwordForm.newPassword ? (
                    <div id="password-strength-hint" className="rounded-xl border border-[#e4ecee] bg-[#f7fafb] px-3 py-2.5" aria-live="polite">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-black text-[#49616b]">Şifre gücü</p>
                        <p className={`text-[10px] font-black ${pwdStrength.score >= 3 ? "text-emerald-700" : "text-amber-700"}`}>
                          {pwdStrength.label}
                        </p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e4ecee]" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={pwdStrength.score} aria-label="Şifre gücü">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pwdStrength.score >= 4
                              ? "bg-emerald-500"
                              : pwdStrength.score >= 3
                                ? "bg-[#00a8c4]"
                                : pwdStrength.score >= 2
                                  ? "bg-amber-400"
                                  : "bg-rose-400"
                          }`}
                          style={{ width: `${(pwdStrength.score / 4) * 100}%` }}
                        />
                      </div>
                      <ul className="mt-2 space-y-1 text-[10px] font-bold text-[#64767e]">
                        <li className={pwdStrength.lengthOk ? "text-emerald-700" : ""}>
                          {pwdStrength.lengthOk ? "✓" : "·"} En az 10 karakter
                        </li>
                        <li className={pwdStrength.hasLetter ? "text-emerald-700" : ""}>
                          {pwdStrength.hasLetter ? "✓" : "·"} En az bir harf
                        </li>
                        <li className={pwdStrength.hasDigit ? "text-emerald-700" : ""}>
                          {pwdStrength.hasDigit ? "✓" : "·"} En az bir rakam
                        </li>
                      </ul>
                    </div>
                  ) : null}
                  <label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">
                    Yeni şifre tekrar
                    <input required minLength={10} maxLength={128} type="password" autoComplete="new-password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-3 text-[12px] normal-case tracking-normal outline-none focus:border-[#00a8c4]" aria-describedby={passwordForm.confirmPassword ? "password-match-hint" : undefined} />
                  </label>
                  {passwordForm.confirmPassword ? (
                    <p
                      id="password-match-hint"
                      className={`text-[10px] font-bold ${passwordsMatch ? "text-emerald-700" : "text-rose-700"}`}
                      role="status"
                    >
                      {passwordsMatch ? "Şifreler eşleşiyor." : "Şifreler eşleşmiyor."}
                    </p>
                  ) : null}
                </div>
                <button disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-3 text-[11px] font-black text-white disabled:opacity-50">
                  <ShieldCheck className="h-4 w-4" /> {busy ? "Güncelleniyor…" : "Şifreyi güncelle"}
                </button>
              </form>

              <section className="rounded-[24px] border border-[#dce7e9] bg-white p-6 shadow-sm">
                <div>
                  <h3 className="text-[18px] font-black">Son giriş denemeleri</h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#718188]">
                    IP saklanmaz; ziyaretçi etiketi anonim hash’ten kısaltılır. Yalnızca bu e-posta görünür.
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  {security?.events?.length ? (
                    security.events.map((event) => (
                      <div
                        key={event.id}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                          event.success ? "border-[#e4ecee] bg-[#f7fafb]" : "border-rose-200 bg-rose-50"
                        }`}
                      >
                        <div>
                          <p className="text-[12px] font-black">{event.success ? "Başarılı giriş" : "Başarısız deneme"}</p>
                          <p className="mt-0.5 text-[10px] text-[#7a8b92]">
                            {formatSecurityDate(event.createdAt)} · etiket {event.visitorTag}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${
                            event.success ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {event.success ? "OK" : "Hata"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <EmptyRow icon={ShieldAlert} title="Henüz giriş kaydı yok" hint="Panel girişi denendiğinde burada görünür." />
                  )}
                </div>
              </section>
            </div>
          </section>
        )}

        {isFull && activeTab === "users" && (
          <CustomerUsersPanel onError={setError} />
        )}

        <footer className="mt-8 border-t border-[#dce6e8] pt-4">
          <SisterBrandRow compact />
          <p className="mt-2 text-[9px] font-bold text-[#8a989e]">Hatay360 ürünüdür. Taksi müşteridir, marka değildir.</p>
        </footer>
      </main>
      <CustomerPortalDock
        nav={nav}
        activeTab={activeTab}
        onTab={(id) => goTab(id as PortalTab)}
        onLogout={() => void signOut()}
        badgeFor={(id) => (id === "overview" ? dashboard.unreadNotifications || 0 : customerNavBadge(opsAlerts, id as PortalTab))}
      />
    </div>
  );
}
