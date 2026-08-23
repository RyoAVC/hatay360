import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { BarChart3, CheckCircle2, ClipboardList, Globe, MapPinned, Megaphone, MessageCircle, MessageSquareText, MoreHorizontal, Pencil, Plus, RefreshCw, Search, Send, UserPlus, Users } from "lucide-react";
import { AdminCustomerProfile } from "../components/admin-customer-profile";
import { EmptyRow } from "../components/empty-row";
import { ServiceMark } from "../components/service-mark";
import { StatusDot } from "../components/status-dot";
import { clearAdminCustomerDraft, readAdminCustomerDraft } from "../lib/admin-customer-draft";
import { apiRequest } from "../lib/api";
import { sanitizePhoneInput } from "../lib/contact";
import { campaignDotKind, contractSignDotKind, paymentDotKind, serviceDotKind, siteDotKind, ticketDotKind, whatsappDotKind } from "../lib/ops-status";
import { ACCOUNT_STATUS_LABELS, SITE_STATUS_LABELS, formatTry, type AccountStatus, type SiteStatus } from "../lib/payment-balance";
import { PORTAL_PACKAGE_IDS, packageLabel } from "../lib/portal-package";
import type { OpsAlertTarget } from "../components/admin-ops-alerts";

type CustomerPaySummary = { remaining: number; unpaid?: number; penalty?: number; overdueCount?: number };
type ContractSummary = { status: "none" | "pending" | "signed" | "approved" | "rejected"; count: number };
type Customer = { id: number; company_name: string; contact_name: string; email: string; phone: string; status: string; campaign_count: number; spend: number; revenue: number; package_id?: string; website_url?: string; ssl_status?: string; site_status?: SiteStatus; site_error?: boolean; site_phone?: string; site_address?: string; last_backup_at?: string; last_update_at?: string; paymentSummary?: CustomerPaySummary; contractSummary?: ContractSummary; napIssues?: number };
type CustomerFilter = "all" | "overdue" | "balance" | "nap" | "contract_signed" | "contract_pending" | "contract_none";
type CustomersWorkspace = "list" | "account" | "ads" | "site" | "maps" | "daily";
type MapsRow = { customer_id: number; business_name?: string; phone?: string; address?: string; maps_url?: string; status?: string };
const CUSTOMERS_WORKSPACE_TABS: { id: CustomersWorkspace; label: string; icon: typeof Users }[] = [
  { id: "list", label: "Hesaplar", icon: Users },
  { id: "account", label: "Hesap aç", icon: UserPlus },
  { id: "ads", label: "Reklam", icon: Megaphone },
  { id: "site", label: "Site", icon: Globe },
  { id: "maps", label: "Harita", icon: MapPinned },
  { id: "daily", label: "Günlük", icon: BarChart3 },
];
const CUSTOMER_FILTER_OPTIONS: { id: CustomerFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "contract_signed", label: "İmza incele" },
  { id: "contract_pending", label: "İmza bekliyor" },
  { id: "contract_none", label: "Sözleşme yok" },
  { id: "overdue", label: "Gecikmiş" },
  { id: "nap", label: "NAP uyumsuz" },
  { id: "balance", label: "Bakiyeli" },
];
type CustomerMatchHit = { score: number; via: string[] };
const CONTRACT_FILTER_LABEL: Record<Exclude<ContractSummary["status"], "none">, string> = {
  pending: "İmza bekliyor",
  signed: "İmza incele",
  approved: "Onaylı",
  rejected: "Reddedildi",
};
type Campaign = { id: number; customer_id: number; name: string; platform: string; status: string; monthly_budget: number; management_fee: number; start_date: string };
type Ticket = { id: number; company_name: string; subject: string; message: string; status: string; priority: string; admin_reply: string; created_at?: string; queue_position?: number };

function ticketAgeMinutes(ticket: Ticket, nowMs = Date.now()) {
  const raw = ticket.created_at;
  if (!raw) return null;
  const created = new Date(raw).getTime();
  if (!Number.isFinite(created)) return null;
  return Math.max(0, Math.floor((nowMs - created) / 60000));
}

function formatTicketAge(minutes: number | null) {
  if (minutes == null) return "";
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours < 24) return rem ? `${hours} sa ${rem} dk` : `${hours} sa`;
  const days = Math.floor(hours / 24);
  const hoursRem = hours % 24;
  return hoursRem ? `${days}g ${hoursRem} sa` : `${days}g`;
}

function normTr(value: unknown) {
  return String(value || "").toLocaleLowerCase("tr-TR");
}

function fieldIncludes(value: unknown, q: string) {
  return Boolean(q) && normTr(value).includes(q);
}

function phoneIncludes(value: unknown, digits: string) {
  if (digits.length < 3) return false;
  return String(value || "").replace(/\D/g, "").includes(digits);
}

function customerMatchHit(
  customer: Customer,
  raw: string,
  extras?: { maps?: MapsRow | null; campaigns?: Campaign[] },
): CustomerMatchHit | null {
  const q = raw.trim().toLocaleLowerCase("tr-TR");
  if (!q) return { score: 0, via: [] };
  const digits = q.replace(/\D/g, "");
  const via: string[] = [];
  let score = 0;
  const idExact = String(customer.id) === q.replace(/^#/, "") || normTr(customer.id) === q;
  if (idExact || (q.startsWith("#") && String(customer.id) === q.slice(1))) {
    score += 100;
    via.push("id");
  }
  if (fieldIncludes(customer.company_name, q)) {
    score += normTr(customer.company_name).startsWith(q) ? 80 : 55;
    via.push("firma");
  }
  if (fieldIncludes(customer.contact_name, q)) {
    score += 40;
    via.push("yetkili");
  }
  if (fieldIncludes(customer.email, q)) {
    score += 45;
    via.push("e-posta");
  }
  if (fieldIncludes(customer.website_url, q)) {
    score += 30;
    via.push("site");
  }
  if (fieldIncludes(customer.package_id, q) || fieldIncludes(packageLabel(customer.package_id || ""), q)) {
    score += 25;
    via.push("paket");
  }
  if (fieldIncludes(ACCOUNT_STATUS_LABELS[(customer.status as AccountStatus)] || customer.status, q)) {
    score += 15;
    via.push("durum");
  }
  if (fieldIncludes(customer.site_address, q)) {
    score += 28;
    via.push("adres");
  }
  if (
    phoneIncludes(customer.phone, digits) ||
    phoneIncludes(customer.site_phone, digits) ||
    fieldIncludes(customer.phone, q) ||
    fieldIncludes(customer.site_phone, q)
  ) {
    score += 50;
    via.push("telefon");
  }
  const maps = extras?.maps;
  if (maps) {
    if (fieldIncludes(maps.business_name, q)) {
      score += 48;
      via.push("harita adı");
    }
    if (fieldIncludes(maps.address, q)) {
      score += 22;
      via.push("harita adres");
    }
    if (phoneIncludes(maps.phone, digits) || fieldIncludes(maps.phone, q)) {
      score += 35;
      via.push("harita tel");
    }
    if (fieldIncludes(maps.maps_url, q)) {
      score += 18;
      via.push("harita link");
    }
  }
  const campaignHit = (extras?.campaigns || []).find(
    (campaign) => fieldIncludes(campaign.name, q) || fieldIncludes(campaign.platform, q),
  );
  if (campaignHit) {
    score += 32;
    via.push("kampanya");
  }
  if (score <= 0) return null;
  return { score, via: [...new Set(via)] };
}

type WhatsAppQueue = { id: number; company_name: string; contact_name: string; status: string; queue_position: number };
type Request = { id: number; company_name: string; service: string; details: string; status: string; kind?: string; amount?: number; catalog_id?: number };
type AdminData = { customers: Customer[]; campaigns: Campaign[]; stats: unknown[]; tickets: Ticket[]; whatsappQueue?: WhatsAppQueue[]; serviceRequests: Request[]; domainChecks?: DomainCheckRow[]; maps?: MapsRow[]; ticketVitrin?: { open: number; answering: number; answered: number }; supportLive?: { real?: { open: number; answering: number; answered: number; waiting: number }; vitrin?: { open: number; answering: number; answered: number } } };
type DomainCheckRow = { id: number; domain: string; result: string; created_at: string; company_name: string };

const fieldClass = "mt-1 w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-[12px] font-bold text-white outline-none focus:border-[#00a8c4]";
const labelClass = "text-[10px] font-black uppercase tracking-wide text-white/50";
const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(Number(value || 0));

function scrollOpsTarget(id: string) {
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function isMapsLeadDraft(kind?: string, service?: string) {
  return kind === "maps" || /harita|maps/i.test(service || "");
}

function adsCampaignFromDraft(input: { kind?: string; service?: string; companyName?: string }): { name: string; platform: "google" | "meta" } | null {
  if (isMapsLeadDraft(input.kind, input.service)) return null;
  const service = input.service || "";
  const adsish = input.kind === "ads" || /reklam|\bads\b|google\s*\/\s*meta/i.test(service);
  if (!adsish) return null;
  const metaOnly = /meta|facebook|instagram/i.test(service) && !/google/i.test(service);
  const platform = metaOnly ? "meta" : "google";
  const company = String(input.companyName || "").trim().slice(0, 80);
  const suffix = platform === "meta" ? "Meta Ads" : "Google Ads";
  return { name: (company ? `${company} — ${suffix}` : suffix).slice(0, 80), platform };
}

export function AdminCustomerPanel({
  focus = "customers",
  opsJump = null,
}: {
  focus?: "customers" | "tickets";
  opsJump?: { target: OpsAlertTarget; token: number } | null;
}) {
  const [data, setData] = useState<AdminData | null>(null);
  const [notice, setNotice] = useState("");
  const [customerForm, setCustomerForm] = useState({ companyName: "", contactName: "", email: "", phone: "", password: "", packageId: "start" });
  const [campaignForm, setCampaignForm] = useState({ customerId: "", name: "", platform: "google", monthlyBudget: "5000", managementFee: "0", startDate: new Date().toISOString().slice(0, 10) });
  const [statsForm, setStatsForm] = useState({ campaignId: "", periodStart: new Date().toISOString().slice(0, 8) + "01", periodEnd: new Date().toISOString().slice(0, 10), spend: "", impressions: "", clicks: "", leads: "", conversions: "", revenue: "" });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [siteForm, setSiteForm] = useState({ customerId: "", packageId: "start", websiteUrl: "", sslStatus: "unknown", siteStatus: "open", siteError: false, lastBackupAt: "", lastUpdateAt: "" });
  const [mapsForm, setMapsForm] = useState({ customerId: "", businessName: "", status: "pending", mapsUrl: "", address: "", phone: "" });
  const [mapsFromLead, setMapsFromLead] = useState<{ businessName: string; phone: string; address: string } | null>(null);
  const [adsFromLead, setAdsFromLead] = useState<{ name: string; platform: "google" | "meta" } | null>(null);
  const [leadFromDraftId, setLeadFromDraftId] = useState<number | null>(null);
  const [dailyForm, setDailyForm] = useState({ customerId: "", day: new Date().toISOString().slice(0, 10), adsClicks: "1000", siteVisitors: "5", siteSessions: "6" });
  const [reply, setReply] = useState<Record<number, string>>({});
  const [ticketBusyId, setTicketBusyId] = useState<number | null>(null);
  const [vitrin, setVitrin] = useState({ open: 0, answering: 0, answered: 0 });
  const [ticketFilter, setTicketFilter] = useState<"needs" | "urgent" | "stale" | "all">("needs");
  const [focusTicketId, setFocusTicketId] = useState<number | null>(null);
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>("all");
  const [customerQuery, setCustomerQuery] = useState("");
  const [workspace, setWorkspace] = useState<CustomersWorkspace>("list");
  const [cardMenuId, setCardMenuId] = useState<number | null>(null);
  const customerSearchRef = useRef<HTMLInputElement | null>(null);

  const load = async () => { try { const next = await apiRequest<AdminData>("/api/admin/customers"); setData(next); if (next.ticketVitrin) setVitrin(next.ticketVitrin); setNotice(""); } catch (error) { setNotice(error instanceof Error ? error.message : "Müşteriler yüklenemedi."); } };
  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (focus !== "customers") return;
    const draft = readAdminCustomerDraft();
    if (!draft) return;
    setCustomerForm({
      companyName: draft.companyName,
      contactName: draft.contactName,
      email: draft.email,
      phone: draft.phone,
      password: "",
      packageId: "start",
    });
    const isMapsLead = isMapsLeadDraft(draft.kind, draft.service);
    if (isMapsLead) {
      setMapsFromLead({
        businessName: draft.companyName,
        phone: draft.phone,
        address: draft.address || "",
      });
      setAdsFromLead(null);
    } else {
      setMapsFromLead(null);
      setAdsFromLead(adsCampaignFromDraft({
        kind: draft.kind,
        service: draft.service,
        companyName: draft.companyName,
      }));
    }
    setLeadFromDraftId(draft.leadId || null);
    setWorkspace("account");
    const name = draft.companyName || draft.contactName || "kayıt";
    const bits = [name, draft.district, draft.service].filter(Boolean);
    setNotice(`Lead taşındı: ${bits.join(" · ")}. Şifreyi siz yazın; hesap henüz açılmadı.`);
    clearAdminCustomerDraft();
    scrollOpsTarget("admin-musteri-hesap");
  }, [focus]);

  useEffect(() => {
    if (!opsJump) return;
    const { target } = opsJump;
    if (focus === "customers") {
      if (target === "overdue") setCustomerFilter("overdue");
      else if (target === "contracts") setCustomerFilter("contract_signed");
      else if (target === "nap") setCustomerFilter("nap");
      else return;
      setWorkspace("list");
      scrollOpsTarget("admin-musteri-listesi");
      return;
    }
    if (focus === "tickets") {
      if (target === "tickets") {
        setTicketFilter("needs");
        scrollOpsTarget("admin-ticket-listesi");
      } else if (target === "services" || target === "extras") {
        scrollOpsTarget("admin-hizmet-talepleri");
      }
    }
  }, [opsJump, focus]);

  useEffect(() => {
    if (focus !== "customers") return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) return;
      event.preventDefault();
      customerSearchRef.current?.focus();
      scrollOpsTarget("admin-musteri-listesi");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus]);

  const campaignsByCustomer = useMemo(() => new Map((data?.customers || []).map((customer) => [customer.id, (data?.campaigns || []).filter((campaign) => campaign.customer_id === customer.id)])), [data]);
  const mapsByCustomer = useMemo(() => {
    const map = new Map<number, MapsRow>();
    for (const row of data?.maps || []) {
      if (!map.has(row.customer_id)) map.set(row.customer_id, row);
    }
    return map;
  }, [data]);

  const createCustomer = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const created = await apiRequest<{ ok: boolean; id: number }>("/api/admin/customers", { method: "POST", body: JSON.stringify(customerForm) });
      const { companyName, phone } = customerForm;
      const packageId = customerForm.packageId || "start";
      await load();
      const leadId = leadFromDraftId;
      let leadWonNote = "";
      if (leadId) {
        try {
          await apiRequest(`/api/leads/${leadId}`, { method: "PATCH", body: JSON.stringify({ status: "won" }) });
          leadWonNote = " Kayıt kazandı işaretlendi.";
        } catch {
          leadWonNote = " Hesap açıldı; kayıt kazandı işaretlenemedi.";
        }
        setLeadFromDraftId(null);
      }
      if (created.id) {
        setSelectedId(created.id);
        setSiteForm({
          customerId: String(created.id),
          packageId,
          websiteUrl: "",
          sslStatus: "unknown",
          siteStatus: "open",
          siteError: false,
          lastBackupAt: "",
          lastUpdateAt: "",
        });
        setCampaignForm((current) => ({
          ...current,
          customerId: String(created.id),
          ...(adsFromLead ? { name: adsFromLead.name, platform: adsFromLead.platform } : {}),
        }));
      }
      if (mapsFromLead && created.id) {
        setMapsForm({
          customerId: String(created.id),
          businessName: mapsFromLead.businessName || companyName,
          status: "pending",
          mapsUrl: "",
          address: mapsFromLead.address || "",
          phone: mapsFromLead.phone || phone,
        });
        setWorkspace("maps");
        setNotice(`Müşteri hesabı oluşturuldu. Harita formu dolduruldu; henüz kaydetmedik.${leadWonNote}`);
        scrollOpsTarget("admin-harita-bagla");
      } else if (adsFromLead && created.id) {
        setWorkspace("ads");
        setNotice(`Müşteri hesabı oluşturuldu. Kampanya adı ve platform dolduruldu; henüz kaydetmedik.${leadWonNote}`);
        scrollOpsTarget("admin-kampanya-ekle");
      } else {
        setWorkspace("list");
        setNotice(`Müşteri hesabı oluşturuldu.${leadWonNote}`);
        if (created.id) scrollOpsTarget("admin-musteri-listesi");
      }
      setMapsFromLead(null);
      setAdsFromLead(null);
      setCustomerForm({ companyName: "", contactName: "", email: "", phone: "", password: "", packageId: "start" });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Hesap oluşturulamadı.");
    }
  };
  const createCampaign = async (event: FormEvent) => { event.preventDefault(); try { await apiRequest("/api/admin/campaigns", { method: "POST", body: JSON.stringify({ ...campaignForm, customerId: Number(campaignForm.customerId), monthlyBudget: Number(campaignForm.monthlyBudget), managementFee: Number(campaignForm.managementFee) }) }); setNotice("Kampanya müşteriye bağlandı."); await load(); } catch (error) { setNotice(error instanceof Error ? error.message : "Kampanya eklenemedi."); } };
  const saveStats = async (event: FormEvent) => { event.preventDefault(); try { const { campaignId, ...payload } = statsForm; await apiRequest(`/api/admin/campaigns/${campaignId}/stats`, { method: "POST", body: JSON.stringify(payload) }); setNotice("Reklam performans raporu güncellendi."); await load(); } catch (error) { setNotice(error instanceof Error ? error.message : "Rapor kaydedilemedi."); } };
  const saveSite = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiRequest(`/api/admin/customers/${siteForm.customerId}`, { method: "PATCH", body: JSON.stringify({ ...siteForm, siteError: siteForm.siteError }) });
      setNotice("Paket ve site durumu kaydedildi.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Site kaydı güncellenemedi.");
    }
  };
  const saveMaps = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiRequest(`/api/admin/customers/${mapsForm.customerId}/maps`, { method: "POST", body: JSON.stringify(mapsForm) });
      setNotice("Harita kaydı bağlandı.");
      const savedSnapshot = { ...mapsForm };
      await load();
      setMapsForm(savedSnapshot);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Harita kaydı eklenemedi.");
    }
  };
  const saveDaily = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiRequest(`/api/admin/customers/${dailyForm.customerId}/daily-metrics`, {
        method: "POST",
        body: JSON.stringify({ ...dailyForm, adsClicks: Number(dailyForm.adsClicks), siteVisitors: Number(dailyForm.siteVisitors), siteSessions: Number(dailyForm.siteSessions) }),
      });
      setNotice("Günlük reklam tıklaması ve site ziyareti ayrı kaydedildi.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Günlük metrik kaydedilemedi.");
    }
  };
  const ticketReplyText = (ticket: Ticket) => String(reply[ticket.id] ?? ticket.admin_reply ?? "").trim();
  const answerTicket = async (ticket: Ticket) => {
    const adminReply = ticketReplyText(ticket);
    if (!adminReply) {
      setNotice("Yanıt yazmadan cevaplandı yapılamaz.");
      return;
    }
    if (ticketBusyId === ticket.id) return;
    setTicketBusyId(ticket.id);
    try {
      await apiRequest(`/api/admin/tickets/${ticket.id}`, { method: "PATCH", body: JSON.stringify({ status: "answered", adminReply }) });
      setReply((current) => {
        const next = { ...current };
        delete next[ticket.id];
        return next;
      });
      setNotice("Müşteri mesajı yanıtlandı.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Yanıt kaydedilemedi.");
    } finally {
      setTicketBusyId(null);
    }
  };
  const setTicketStatus = async (ticket: Ticket, status: string) => {
    if (ticketBusyId === ticket.id) return;
    setTicketBusyId(ticket.id);
    try {
      await apiRequest(`/api/admin/tickets/${ticket.id}`, { method: "PATCH", body: JSON.stringify({ status, adminReply: reply[ticket.id] ?? ticket.admin_reply }) });
      setNotice(status === "answering" ? "Ticket cevaplanıyor." : status === "closed" ? "Ticket kapatıldı." : "Durum güncellendi.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Durum güncellenemedi.");
    } finally {
      setTicketBusyId(null);
    }
  };
  const advanceTicket = async (ticket: Ticket) => {
    if (ticketBusyId === ticket.id) return;
    setTicketBusyId(ticket.id);
    try {
      await apiRequest(`/api/admin/tickets/${ticket.id}/advance`, { method: "POST" });
      setNotice("Sıra geçildi.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Sıra geçilemedi.");
    } finally {
      setTicketBusyId(null);
    }
  };
  const advanceWhatsapp = async (item: WhatsAppQueue) => {
    try {
      await apiRequest(`/api/admin/whatsapp-queue/${item.id}/advance`, { method: "POST" });
      setNotice("WhatsApp sırası geçildi.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "WhatsApp sırası geçilemedi.");
    }
  };
  const updateRequest = async (item: Request, status: string) => { await apiRequest(`/api/admin/service-requests/${item.id}`, { method: "PATCH", body: JSON.stringify({ status }) }); await load(); };
  const confirmExtraRequest = async (item: Request, accept: boolean) => {
    try {
      await apiRequest(`/api/admin/service-requests/${item.id}/${accept ? "confirm-extra" : "reject-extra"}`, { method: "POST", body: "{}" });
      setNotice(accept ? "Ek hizmet onaylandı; katalog satırı faturaya alındı." : "Ek hizmet talebi reddedildi.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ek hizmet güncellenemedi.");
    }
  };
  const setCustomerStatus = async (customer: Customer, status: AccountStatus) => {
    try {
      await apiRequest(`/api/admin/customers/${customer.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setNotice(status === "active" ? "Müşteri onaylandı." : "Durum güncellendi.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Durum güncellenemedi.");
    }
  };
  const saveVitrin = async () => {
    try {
      const result = await apiRequest<{ vitrin: { open: number; answering: number; answered: number } }>("/api/admin/ticket-vitrin", { method: "PUT", body: JSON.stringify(vitrin) });
      setVitrin(result.vitrin);
      setNotice("Vitrin sayıları kaydedildi. Gerçek SIRA GEÇ kuyruğu değişmedi.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Vitrin kaydedilemedi.");
    }
  };
  const moneyRemaining = (customer: Customer) => money(customer.paymentSummary?.remaining || 0);
  const customerIsOverdue = (customer: Customer) => Number(customer.paymentSummary?.overdueCount || 0) > 0 || Number(customer.paymentSummary?.penalty || 0) > 0;
  const customerHasBalance = (customer: Customer) => Number(customer.paymentSummary?.remaining || 0) > 0;
  const ticketNeedsAction = (ticket: Ticket) => ticket.status === "open" || ticket.status === "answering";
  const ticketIsUrgent = (ticket: Ticket) => ticket.priority === "urgent" && ticketNeedsAction(ticket);
  const ticketIsStale = (ticket: Ticket) => ticketNeedsAction(ticket) && (ticketAgeMinutes(ticket) ?? 0) >= 240;
  const focusTicketCard = (ticketId: number) => {
    setFocusTicketId(ticketId);
    window.requestAnimationFrame(() => {
      document.getElementById(`admin-ticket-${ticketId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };
  const ticketRank = (ticket: Ticket) => {
    if (ticketIsUrgent(ticket)) return 0;
    if (ticket.status === "open") return 1;
    if (ticket.status === "answering") return 2;
    return 3;
  };
  const ticketCreatedMs = (ticket: Ticket) => {
    const ms = ticket.created_at ? new Date(ticket.created_at).getTime() : NaN;
    return Number.isFinite(ms) ? ms : Number.POSITIVE_INFINITY;
  };
  const tickets = [...(data?.tickets || [])].sort(
    (a, b) => ticketRank(a) - ticketRank(b) || ticketCreatedMs(a) - ticketCreatedMs(b) || a.id - b.id,
  );
  const openTicketCount = tickets.filter(ticketNeedsAction).length;
  const urgentTicketCount = tickets.filter(ticketIsUrgent).length;
  const staleOpen = tickets.filter(ticketIsStale);
  const servingTickets = tickets
    .filter((item) => item.status === "answering")
    .sort((a, b) => ticketCreatedMs(a) - ticketCreatedMs(b) || a.id - b.id);
  const queuedTickets = tickets
    .filter((item) => ticketNeedsAction(item) && Number(item.queue_position || 0) > 0)
    .sort((a, b) => Number(a.queue_position) - Number(b.queue_position) || a.id - b.id);
  const nextQueuedTicket = queuedTickets[0] || tickets.find((item) => item.status === "open") || null;
  const oldestOpenAge = (() => {
    const open = tickets.filter(ticketNeedsAction);
    if (!open.length) return null;
    return Math.max(...open.map((item) => ticketAgeMinutes(item) ?? 0));
  })();
  const visibleTickets =
    ticketFilter === "needs"
      ? tickets.filter(ticketNeedsAction)
      : ticketFilter === "urgent"
        ? tickets.filter(ticketIsUrgent)
        : ticketFilter === "stale"
          ? tickets.filter(ticketIsStale)
          : tickets;
  const serviceRequests = data?.serviceRequests || [];
  const newRequestCount = serviceRequests.filter((item) => item.status === "new" || item.status === "reviewing").length;
  const whatsappQueue = data?.whatsappQueue || [];
  const waitingWhatsappCount = whatsappQueue.filter((item) => item.status === "waiting" || item.status === "serving").length;
  const domainChecks = data?.domainChecks || [];
  const DOMAIN_RESULT: Record<string, string> = { registered: "Kayıtlı", potentially_available: "Uygun olabilir", unknown: "Doğrulanamadı" };
  const customersAll = data?.customers || [];
  const contractStatusOf = (customer: Customer) => customer.contractSummary?.status || "none";
  const overdueCustomerCount = customersAll.filter(customerIsOverdue).length;
  const balanceCustomerCount = customersAll.filter(customerHasBalance).length;
  const napCustomerCount = customersAll.filter((customer) => Number(customer.napIssues || 0) > 0).length;
  const contractSignedCount = customersAll.filter((customer) => contractStatusOf(customer) === "signed").length;
  const contractPendingCount = customersAll.filter((customer) => contractStatusOf(customer) === "pending").length;
  const contractNoneCount = customersAll.filter((customer) => contractStatusOf(customer) === "none").length;
  const customersByStatus = customerFilter === "overdue"
    ? customersAll.filter(customerIsOverdue)
    : customerFilter === "balance"
      ? customersAll.filter(customerHasBalance)
      : customerFilter === "nap"
        ? customersAll.filter((customer) => Number(customer.napIssues || 0) > 0)
        : customerFilter === "contract_signed"
          ? customersAll.filter((customer) => contractStatusOf(customer) === "signed")
          : customerFilter === "contract_pending"
            ? customersAll.filter((customer) => contractStatusOf(customer) === "pending")
            : customerFilter === "contract_none"
              ? customersAll.filter((customer) => contractStatusOf(customer) === "none")
              : customersAll;
  const customerHits = useMemo(() => {
    const hits = new Map<number, CustomerMatchHit>();
    for (const customer of customersByStatus) {
      const hit = customerMatchHit(customer, customerQuery, {
        maps: mapsByCustomer.get(customer.id) || null,
        campaigns: campaignsByCustomer.get(customer.id) || [],
      });
      if (hit) hits.set(customer.id, hit);
    }
    return hits;
  }, [customersByStatus, customerQuery, mapsByCustomer, campaignsByCustomer]);
  const customers = useMemo(() => {
    const list = customersByStatus.filter((customer) => customerHits.has(customer.id));
    if (!customerQuery.trim()) return list;
    return [...list].sort((a, b) => (customerHits.get(b.id)?.score || 0) - (customerHits.get(a.id)?.score || 0) || a.company_name.localeCompare(b.company_name, "tr"));
  }, [customersByStatus, customerHits, customerQuery]);
  const customerQueryActive = customerQuery.trim().length > 0;
  const openCustomerSearchResult = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || customers.length !== 1) return;
    event.preventDefault();
    setSelectedId(customers[0].id);
    setNotice(`Tek eşleşme açıldı: ${customers[0].company_name}`);
  };
  const TICKET_STATUS: Record<string, string> = { open: "Açık", answering: "Cevaplanıyor", answered: "Cevaplandı", closed: "Kapalı" };
  const WP_STATUS = (item: WhatsAppQueue) =>
    item.status === "waiting" && item.queue_position > 0 ? `Sıra ${item.queue_position}` : item.status === "serving" ? "Bakılıyor" : "Bitti";

  return (
    <div className="mt-8 space-y-7">
      {focus === "tickets" ? (
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3ec8dc]">Destek kuyruğu</p><h2 className="mt-2 text-[26px] font-black">Ticket, WhatsApp sırası ve talepler</h2><p className="mt-2 text-[12px] text-white/55">Açık mesajları yanıtlayın, sırayı geçin. Müşteri hesapları ayrı menüdedir.</p></div><button onClick={() => void load()} className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[11px] font-black text-white/70"><RefreshCw className="h-4 w-4" /> Yenile</button></div>
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3ec8dc]">Müşteri operasyon merkezi</p><h2 className="mt-2 text-[26px] font-black">Site, reklam ve harita müşteri paneli</h2><p className="mt-2 text-[12px] text-white/55">Hesap açın, paketi bağlayın. Reklam tıklaması ile site ziyaretini ayrı girin. Google Ads API yok; panel kaydı veya örnek seri kullanılır.</p></div><button onClick={() => void load()} className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[11px] font-black text-white/70"><RefreshCw className="h-4 w-4" /> Yenile</button></div>
      )}
      {notice && <p className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-[11px] font-bold text-cyan-100">{notice}</p>}

      {focus === "customers" ? (
      <>
      <nav className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Müşteri merkezi bölümleri">
        {CUSTOMERS_WORKSPACE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = workspace === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setWorkspace(tab.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-black transition ${
                active ? "bg-[#00a8c4] text-white" : "bg-white/5 text-white/55 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {workspace === "account" ? (
        <form id="admin-musteri-hesap" onSubmit={createCustomer} className="mx-auto max-w-xl rounded-[24px] border border-white/10 bg-[#18181f] p-5">
          <UserPlus className="h-5 w-5 text-[#3ec8dc]" />
          <h3 className="mt-4 text-[18px] font-black">Müşteri hesabı aç</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {([["Firma", "companyName"], ["Yetkili", "contactName"], ["E-posta", "email"], ["Telefon", "phone"], ["Geçici şifre", "password"]] as const).map(([label, key]) => (
              <label key={key} className={`${labelClass} block ${key === "password" ? "sm:col-span-2" : ""}`}>
                {label}
                <input
                  required={key !== "phone"}
                  maxLength={key === "phone" ? 14 : 80}
                  type={key === "password" ? "password" : key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                  inputMode={key === "phone" ? "numeric" : undefined}
                  value={customerForm[key]}
                  onChange={(event) => setCustomerForm({ ...customerForm, [key]: key === "phone" ? sanitizePhoneInput(event.target.value) : event.target.value })}
                  className={fieldClass}
                />
              </label>
            ))}
            <label className={`${labelClass} block sm:col-span-2`}>
              Paket
              <select value={customerForm.packageId} onChange={(event) => setCustomerForm({ ...customerForm, packageId: event.target.value })} className={fieldClass}>
                <option value="">Atanmadı</option>
                {PORTAL_PACKAGE_IDS.map((id) => <option key={id} value={id}>{packageLabel(id)}</option>)}
              </select>
            </label>
          </div>
          <button className="mt-4 flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black"><Plus className="h-4 w-4" /> Hesabı oluştur</button>
        </form>
      ) : null}

      {workspace === "ads" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <form id="admin-kampanya-ekle" onSubmit={createCampaign} className="scroll-mt-24 rounded-[24px] border border-white/10 bg-[#18181f] p-5">
            <Megaphone className="h-5 w-5 text-[#a5b4fc]" />
            <h3 className="mt-4 text-[18px] font-black">Kampanya ve bütçe ekle</h3>
            <p className="mt-2 text-[10px] text-white/45">Reklam kaydından adı ve platform gelir. Bütçeyi siz yazın; bağla demeden kayıt yok.</p>
            <label className={`${labelClass} mt-5 block`}>Müşteri<select required value={campaignForm.customerId} onChange={(event) => setCampaignForm({ ...campaignForm, customerId: event.target.value })} className={fieldClass}><option value="">Seçin</option>{data?.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.company_name}</option>)}</select></label>
            <label className={`${labelClass} mt-3 block`}>Kampanya adı<input required value={campaignForm.name} onChange={(event) => setCampaignForm({ ...campaignForm, name: event.target.value })} className={fieldClass} /></label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className={labelClass}>Platform<select value={campaignForm.platform} onChange={(event) => setCampaignForm({ ...campaignForm, platform: event.target.value })} className={fieldClass}><option value="google">Google</option><option value="meta">Meta</option><option value="other">Diğer</option></select></label>
              <label className={labelClass}>Başlangıç<input type="date" value={campaignForm.startDate} onChange={(event) => setCampaignForm({ ...campaignForm, startDate: event.target.value })} className={fieldClass} /></label>
              <label className={labelClass}>Aylık bütçe<input type="number" value={campaignForm.monthlyBudget} onChange={(event) => setCampaignForm({ ...campaignForm, monthlyBudget: event.target.value })} className={fieldClass} /></label>
              <label className={labelClass}>Yönetim ücreti<input type="number" value={campaignForm.managementFee} onChange={(event) => setCampaignForm({ ...campaignForm, managementFee: event.target.value })} className={fieldClass} /></label>
            </div>
            <button className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-[11px] font-black"><Plus className="h-4 w-4" /> Kampanyayı bağla</button>
          </form>
          <form onSubmit={saveStats} className="rounded-[24px] border border-white/10 bg-[#18181f] p-5">
            <BarChart3 className="h-5 w-5 text-[#6ee7b7]" />
            <h3 className="mt-4 text-[18px] font-black">Aylık rapor gir</h3>
            <label className={`${labelClass} mt-5 block`}>Kampanya<select required value={statsForm.campaignId} onChange={(event) => setStatsForm({ ...statsForm, campaignId: event.target.value })} className={fieldClass}><option value="">Seçin</option>{data?.campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></label>
            <div className="mt-3 grid grid-cols-2 gap-3">{[["Dönem başlangıç", "periodStart", "date"], ["Dönem bitiş", "periodEnd", "date"], ["Harcama", "spend", "number"], ["Ölçülen gelir", "revenue", "number"], ["Gösterim", "impressions", "number"], ["Tıklama", "clicks", "number"], ["Lead", "leads", "number"], ["Dönüşüm", "conversions", "number"]].map(([label, key, type]) => <label key={key} className={labelClass}>{label}<input required type={type} value={statsForm[key as keyof typeof statsForm]} onChange={(event) => setStatsForm({ ...statsForm, [key]: event.target.value })} className={fieldClass} /></label>)}</div>
            <button className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-[11px] font-black"><BarChart3 className="h-4 w-4" /> Raporu kaydet</button>
          </form>
        </div>
      ) : null}

      {workspace === "site" ? (
        <form id="admin-paket-site" onSubmit={saveSite} className="mx-auto max-w-xl scroll-mt-24 rounded-[24px] border border-white/10 bg-[#18181f] p-5">
          <Globe className="h-5 w-5 text-[#3ec8dc]" />
          <h3 className="mt-4 text-[18px] font-black">Paket ve site durumu</h3>
          <label className={`${labelClass} mt-5 block`}>Müşteri<select required value={siteForm.customerId} onChange={(event) => {
          const customerId = event.target.value;
          const customer = data?.customers.find((item) => String(item.id) === customerId);
          const sslStatus = ["active", "pending", "unknown"].includes(String(customer?.ssl_status || "")) ? String(customer?.ssl_status) : "unknown";
          const siteStatus = (customer?.site_status && customer.site_status in SITE_STATUS_LABELS) ? customer.site_status : "open";
          setSiteForm({
            ...siteForm,
            customerId,
            packageId: customer?.package_id || "start",
            websiteUrl: customer?.website_url || "",
            sslStatus,
            siteStatus,
            siteError: Boolean(customer?.site_error),
            lastBackupAt: String(customer?.last_backup_at || "").slice(0, 10),
            lastUpdateAt: String(customer?.last_update_at || "").slice(0, 10),
          });
        }} className={fieldClass}><option value="">Seçin</option>{data?.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.company_name}</option>)}</select></label>
          <label className={`${labelClass} mt-3 block`}>Paket<select value={siteForm.packageId} onChange={(event) => setSiteForm({ ...siteForm, packageId: event.target.value })} className={fieldClass}>{PORTAL_PACKAGE_IDS.map((id) => <option key={id} value={id}>{packageLabel(id)}</option>)}</select></label>
          <label className={`${labelClass} mt-3 block`}>Site adresi<input value={siteForm.websiteUrl} onChange={(event) => setSiteForm({ ...siteForm, websiteUrl: event.target.value })} className={fieldClass} /></label>
          <div className="mt-3 grid grid-cols-2 gap-3"><label className={labelClass}>Site<select value={siteForm.siteStatus} onChange={(event) => setSiteForm({ ...siteForm, siteStatus: event.target.value })} className={fieldClass}>{Object.entries(SITE_STATUS_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label className={labelClass}>SSL<select value={siteForm.sslStatus} onChange={(event) => setSiteForm({ ...siteForm, sslStatus: event.target.value })} className={fieldClass}><option value="unknown">Yok</option><option value="pending">Bekleniyor</option><option value="active">Açık</option></select></label></div>
          <label className={`${labelClass} mt-3 flex items-center gap-2`}><input type="checkbox" checked={Boolean(siteForm.siteError)} onChange={(event) => setSiteForm({ ...siteForm, siteError: event.target.checked })} /> Sorun / hata (turuncu ışık)</label>
          <div className="mt-3 grid grid-cols-2 gap-3"><label className={labelClass}>Son yedek<input type="date" value={siteForm.lastBackupAt} onChange={(event) => setSiteForm({ ...siteForm, lastBackupAt: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Son güncelleme<input type="date" value={siteForm.lastUpdateAt} onChange={(event) => setSiteForm({ ...siteForm, lastUpdateAt: event.target.value })} className={fieldClass} /></label></div>
          <button className="mt-4 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black">Site durumunu kaydet</button>
        </form>
      ) : null}

      {workspace === "maps" ? (
        <form id="admin-harita-bagla" onSubmit={saveMaps} className="mx-auto max-w-xl scroll-mt-24 rounded-[24px] border border-white/10 bg-[#18181f] p-5">
          <MapPinned className="h-5 w-5 text-[#fbbf24]" />
          <h3 className="mt-4 text-[18px] font-black">Harita kaydı bağla</h3>
          <p className="mt-2 text-[10px] text-white/45">Ad, telefon ve adres site ile aynı olmalı (NAP). Eksik veya farklı alan operasyon uyarısına düşer.</p>
          <label className={`${labelClass} mt-5 block`}>Müşteri<select required value={mapsForm.customerId} onChange={(event) => {
          const customerId = event.target.value;
          const customer = data?.customers.find((item) => String(item.id) === customerId);
          const existing = customerId ? mapsByCustomer.get(Number(customerId)) : undefined;
          const status = existing?.status && ["pending", "live", "paused"].includes(existing.status) ? existing.status : "pending";
          setMapsForm({
            customerId,
            businessName: existing?.business_name || customer?.company_name || "",
            status,
            mapsUrl: existing?.maps_url || "",
            phone: existing?.phone || customer?.site_phone || customer?.phone || "",
            address: existing?.address || customer?.site_address || "",
          });
        }} className={fieldClass}><option value="">Seçin</option>{data?.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.company_name}{Number(customer.napIssues || 0) > 0 ? " · NAP!" : ""}</option>)}</select></label>
          <label className={`${labelClass} mt-3 block`}>İşletme adı<input required value={mapsForm.businessName} onChange={(event) => setMapsForm({ ...mapsForm, businessName: event.target.value })} className={fieldClass} /></label>
          <label className={`${labelClass} mt-3 block`}>Durum<select value={mapsForm.status} onChange={(event) => setMapsForm({ ...mapsForm, status: event.target.value })} className={fieldClass}><option value="pending">Kayıt bekleniyor</option><option value="live">Yayında</option><option value="paused">Duraklatıldı</option></select></label>
          <label className={`${labelClass} mt-3 block`}>Harita bağlantısı<input value={mapsForm.mapsUrl} onChange={(event) => setMapsForm({ ...mapsForm, mapsUrl: event.target.value })} className={fieldClass} /></label>
          <label className={`${labelClass} mt-3 block`}>Telefon<input maxLength={14} inputMode="numeric" value={mapsForm.phone} onChange={(event) => setMapsForm({ ...mapsForm, phone: sanitizePhoneInput(event.target.value) })} className={fieldClass} /></label>
          <label className={`${labelClass} mt-3 block`}>Adres<input value={mapsForm.address} onChange={(event) => setMapsForm({ ...mapsForm, address: event.target.value })} className={fieldClass} /></label>
          <button className="mt-4 rounded-xl bg-amber-500 px-4 py-2.5 text-[11px] font-black">Haritayı bağla</button>
        </form>
      ) : null}

      {workspace === "daily" ? (
        <form onSubmit={saveDaily} className="mx-auto max-w-xl rounded-[24px] border border-white/10 bg-[#18181f] p-5">
          <BarChart3 className="h-5 w-5 text-[#67e8f9]" />
          <h3 className="mt-4 text-[18px] font-black">Günlük reklam vs site</h3>
          <p className="mt-2 text-[10px] text-white/45">Aynı güne iki sayı: reklam tıklaması ve siteye giren kişi. Karıştırmayın.</p>
          <label className={`${labelClass} mt-4 block`}>Müşteri<select required value={dailyForm.customerId} onChange={(event) => setDailyForm({ ...dailyForm, customerId: event.target.value })} className={fieldClass}><option value="">Seçin</option>{data?.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.company_name}</option>)}</select></label>
          <label className={`${labelClass} mt-3 block`}>Gün<input required type="date" value={dailyForm.day} onChange={(event) => setDailyForm({ ...dailyForm, day: event.target.value })} className={fieldClass} /></label>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"><label className={labelClass}>Reklam tıklama<input required type="number" value={dailyForm.adsClicks} onChange={(event) => setDailyForm({ ...dailyForm, adsClicks: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Site ziyaret<input required type="number" value={dailyForm.siteVisitors} onChange={(event) => setDailyForm({ ...dailyForm, siteVisitors: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Oturum<input required type="number" value={dailyForm.siteSessions} onChange={(event) => setDailyForm({ ...dailyForm, siteSessions: event.target.value })} className={fieldClass} /></label></div>
          <button className="mt-4 rounded-xl bg-cyan-600 px-4 py-2.5 text-[11px] font-black">Günü kaydet</button>
        </form>
      ) : null}

      {workspace === "list" ? (
      <section id="admin-musteri-listesi" className="scroll-mt-24 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-2"><Users className="h-5 w-5 text-[#3ec8dc]" /><h3 className="text-[19px] font-black">Müşteri hesapları</h3></div>
          <label className="block text-[10px] font-black uppercase tracking-wide text-white/45">
            Filtre
            <select
              value={customerFilter}
              onChange={(event) => setCustomerFilter(event.target.value as CustomerFilter)}
              className="mt-1 block min-w-[180px] rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-[12px] font-bold text-white outline-none focus:border-[#00a8c4]"
            >
              {CUSTOMER_FILTER_OPTIONS.map((option) => {
                const count =
                  option.id === "all" ? customersAll.length
                    : option.id === "contract_signed" ? contractSignedCount
                      : option.id === "contract_pending" ? contractPendingCount
                        : option.id === "contract_none" ? contractNoneCount
                          : option.id === "overdue" ? overdueCustomerCount
                            : option.id === "nap" ? napCustomerCount
                              : balanceCustomerCount;
                return <option key={option.id} value={option.id}>{option.label} ({count})</option>;
              })}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button type="button" onClick={() => setCustomerFilter("contract_signed")} className={`rounded-2xl border px-4 py-3 text-left ${customerFilter === "contract_signed" ? "border-violet-300/40 bg-violet-950/35" : "border-white/10 bg-[#18181f]"}`}>
            <p className="text-[10px] font-black uppercase tracking-wide text-violet-200">İmza incele</p>
            <p className="mt-1 text-[28px] font-black text-white">{contractSignedCount}</p>
          </button>
          <button type="button" onClick={() => setCustomerFilter("contract_pending")} className={`rounded-2xl border px-4 py-3 text-left ${customerFilter === "contract_pending" ? "border-sky-300/40 bg-sky-950/35" : "border-white/10 bg-[#18181f]"}`}>
            <p className="text-[10px] font-black uppercase tracking-wide text-sky-200">İmza bekliyor</p>
            <p className="mt-1 text-[28px] font-black text-white">{contractPendingCount}</p>
          </button>
          <button type="button" onClick={() => setCustomerFilter("overdue")} className={`rounded-2xl border px-4 py-3 text-left ${customerFilter === "overdue" ? "border-rose-300/40 bg-rose-950/35" : "border-white/10 bg-[#18181f]"}`}>
            <p className="text-[10px] font-black uppercase tracking-wide text-rose-200">Gecikmiş</p>
            <p className="mt-1 text-[28px] font-black text-white">{overdueCustomerCount}</p>
          </button>
          <button type="button" onClick={() => setCustomerFilter("nap")} className={`rounded-2xl border px-4 py-3 text-left ${customerFilter === "nap" ? "border-amber-300/40 bg-amber-950/35" : "border-white/10 bg-[#18181f]"}`}>
            <p className="text-[10px] font-black uppercase tracking-wide text-amber-200">NAP</p>
            <p className="mt-1 text-[28px] font-black text-white">{napCustomerCount}</p>
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Müşteri ara</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" aria-hidden="true" />
            <input
              ref={customerSearchRef}
              type="search"
              value={customerQuery}
              onChange={(event) => setCustomerQuery(event.target.value)}
              onKeyDown={openCustomerSearchResult}
              placeholder="Firma, yetkili, e-posta, telefon, harita, kampanya, paket veya #id"
              autoComplete="off"
              className="w-full rounded-xl border border-white/15 bg-black/35 py-2.5 pl-10 pr-14 text-[12px] font-bold text-white outline-none placeholder:text-white/35 focus:border-[#00a8c4]"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[9px] font-black text-white/40">/</kbd>
          </label>
          {customerQueryActive ? (
            <button type="button" onClick={() => setCustomerQuery("")} className="rounded-full border border-white/15 px-3 py-2 text-[10px] font-black text-white/60">
              Aramayı temizle
            </button>
          ) : null}
          <p className="text-[11px] font-bold text-white/45">
            {customerQueryActive
              ? customers.length === 1
                ? "1 sonuç · Enter ile profili aç"
                : `${customers.length} / ${customersByStatus.length} sonuç`
              : `${customers.length} hesap · / ile ara`}
          </p>
        </div>
        {selectedId ? <div><AdminCustomerProfile customerId={selectedId} onClose={() => setSelectedId(null)} onChanged={() => void load()} /></div> : null}
        <div className="grid gap-3 lg:grid-cols-2">{customers.length ? customers.map((customer) => {
          const overdue = customerIsOverdue(customer);
          const remainingLabel = moneyRemaining(customer);
          const contractStatus = contractStatusOf(customer);
          const napIssues = Number(customer.napIssues || 0);
          const matchVia = customerQueryActive ? (customerHits.get(customer.id)?.via || []).slice(0, 3) : [];
          const menuOpen = cardMenuId === customer.id;
          return (
          <article key={customer.id} className={`relative rounded-2xl border bg-[#18181f] p-4 ${selectedId === customer.id ? "border-[#00a8c4]/50" : contractStatus === "signed" ? "border-violet-300/30" : overdue ? "border-rose-300/30" : napIssues ? "border-amber-300/30" : "border-white/10"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-black">{customer.company_name}</p>
                <p className="mt-1 text-[10px] text-white/45">{customer.contact_name} · {customer.email}</p>
                <p className="mt-1 text-[10px] font-bold text-[#3ec8dc]">{packageLabel(customer.package_id || "")}</p>
                {matchVia.length ? (
                  <p className="mt-2 text-[9px] font-black uppercase tracking-wide text-[#70dce9]/90">Eşleşme: {matchVia.join(" · ")}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusDot kind={siteDotKind(customer.site_status, customer.site_error)} label={SITE_STATUS_LABELS[(customer.site_status || "open") as SiteStatus]} />
                  {contractStatus !== "none" ? (
                    <StatusDot kind={contractSignDotKind(contractStatus)} label={CONTRACT_FILTER_LABEL[contractStatus]} />
                  ) : (
                    <StatusDot kind="off" label="Sözleşme yok" />
                  )}
                  {overdue ? <StatusDot kind={paymentDotKind("unpaid", true)} label="Gecikmiş" /> : customerHasBalance(customer) ? <StatusDot kind={paymentDotKind("unpaid", false)} label="Bakiye" /> : null}
                  {napIssues > 0 ? <StatusDot kind="maintenance" label={`NAP ${napIssues}`} /> : null}
                </div>
                {overdue && Number(customer.paymentSummary?.penalty || 0) > 0 ? (
                  <p className="mt-2 text-[10px] font-black text-rose-300">CEZA %15 dahil kalan {formatTry(customer.paymentSummary?.remaining || 0)}</p>
                ) : null}
                {napIssues > 0 ? (
                  <p className="mt-2 text-[10px] font-black text-amber-200">NAP: harita ile site ad / telefon / adres uyumsuz ({napIssues} alan)</p>
                ) : null}
              </div>
              <span className="shrink-0 rounded-full bg-emerald-400/10 px-2 py-1 text-[8px] font-black text-emerald-300">{ACCOUNT_STATUS_LABELS[(customer.status as AccountStatus)] || customer.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{[["Kampanya", customer.campaign_count], ["Harcama", money(customer.spend)], ["Gelir", money(customer.revenue)], ["Kalan", remainingLabel]].map(([label, value]) => <div key={label} className={`rounded-xl p-3 ${label === "Kalan" && overdue ? "bg-rose-950/40" : "bg-black/25"}`}><p className="text-[8px] text-white/40">{label}</p><p className={`mt-1 text-[11px] font-black ${label === "Kalan" && overdue ? "text-rose-200" : ""}`}>{value}</p></div>)}</div>
            {(campaignsByCustomer.get(customer.id) || []).length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">{(campaignsByCustomer.get(customer.id) || []).slice(0, 3).map((campaign) => <span key={campaign.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-1 text-[8px] font-bold text-white/55"><StatusDot kind={campaignDotKind(campaign.status)} /> {campaign.platform} · {campaign.name}</span>)}</div>
            ) : null}
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={() => setSelectedId(customer.id)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#00a8c4] px-3 py-2 text-[10px] font-black sm:flex-none"><Pencil className="h-3.5 w-3.5" /> Düzenle</button>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Diğer işlemler"
                  aria-expanded={menuOpen}
                  onClick={() => setCardMenuId(menuOpen ? null : customer.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 text-white/70 hover:bg-white/5"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen ? (
                  <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-white/15 bg-[#12121a] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
                    <label className="block px-2 py-1.5 text-[9px] font-black uppercase tracking-wide text-white/40">
                      Durum
                      <select
                        value={customer.status}
                        onChange={(event) => {
                          void setCustomerStatus(customer, event.target.value as AccountStatus);
                          setCardMenuId(null);
                        }}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-2 py-1.5 text-[11px] font-black text-white"
                      >
                        {Object.entries(ACCOUNT_STATUS_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                      </select>
                    </label>
                    <button
                      type="button"
                      disabled={customer.status === "active"}
                      onClick={() => {
                        void setCustomerStatus(customer, "active");
                        setCardMenuId(null);
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[11px] font-black text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-40"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Onayla
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkspace("site");
                        setSiteForm({
                          customerId: String(customer.id),
                          packageId: customer.package_id || "start",
                          websiteUrl: customer.website_url || "",
                          sslStatus: ["active", "pending", "unknown"].includes(String(customer.ssl_status || "")) ? String(customer.ssl_status) : "unknown",
                          siteStatus: (customer.site_status && customer.site_status in SITE_STATUS_LABELS) ? customer.site_status : "open",
                          siteError: Boolean(customer.site_error),
                          lastBackupAt: String(customer.last_backup_at || "").slice(0, 10),
                          lastUpdateAt: String(customer.last_update_at || "").slice(0, 10),
                        });
                        setCardMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[11px] font-black text-white/75 hover:bg-white/5"
                    >
                      <Globe className="h-3.5 w-3.5" /> Site durumuna git
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkspace("maps");
                        const existing = mapsByCustomer.get(customer.id);
                        setMapsForm({
                          customerId: String(customer.id),
                          businessName: existing?.business_name || customer.company_name || "",
                          status: existing?.status && ["pending", "live", "paused"].includes(existing.status) ? existing.status : "pending",
                          mapsUrl: existing?.maps_url || "",
                          phone: existing?.phone || customer.site_phone || customer.phone || "",
                          address: existing?.address || customer.site_address || "",
                        });
                        setCardMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[11px] font-black text-white/75 hover:bg-white/5"
                    >
                      <MapPinned className="h-3.5 w-3.5" /> Harita bağla
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
          );
        }) : <EmptyRow dark icon={Users} title={
          customerQueryActive ? "Aramayla eşleşen hesap yok"
            : customerFilter === "overdue" ? "Gecikmiş ödeme yok"
            : customerFilter === "balance" ? "Açık bakiyeli müşteri yok"
              : customerFilter === "nap" ? "NAP uyumsuz hesap yok"
              : customerFilter === "contract_signed" ? "İncelenecek imza yok"
                : customerFilter === "contract_pending" ? "İmza bekleyen sözleşme yok"
                  : customerFilter === "contract_none" ? "Sözleşmesiz hesap yok"
                    : "Müşteri hesabı yok"
        } hint={
          customerQueryActive
            ? "Firma, yetkili, e-posta, telefon, harita adı, kampanya, paket veya #id ile yeniden deneyin."
            : customerFilter === "all"
              ? "Hesap aç sekmesinden yeni müşteri ekleyin."
              : "Filtreyi Tümü yaparak tüm hesapları görün."
        } />}</div>
      </section>
      ) : null}
      </>
      ) : null}


      {focus === "tickets" ? (
      <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => setTicketFilter("needs")}
          className={`rounded-2xl border px-4 py-3 text-left ${ticketFilter === "needs" ? "border-amber-300/40 bg-amber-950/35" : "border-white/10 bg-[#18181f]"}`}
        >
          <p className="text-[10px] font-black uppercase tracking-wide text-amber-200">Açık ticket</p>
          <p className="mt-1 text-[28px] font-black text-white">{openTicketCount}</p>
          <p className="mt-1 text-[11px] text-white/45">{urgentTicketCount ? `${urgentTicketCount} acil` : "Yanıt veya sıra bekliyor"}</p>
        </button>
        <button
          type="button"
          onClick={() => setTicketFilter("stale")}
          className={`rounded-2xl border px-4 py-3 text-left ${ticketFilter === "stale" ? "border-rose-300/45 bg-rose-950/40" : staleOpen.length ? "border-rose-300/35 bg-rose-950/25" : "border-white/10 bg-[#18181f]"}`}
        >
          <p className="text-[10px] font-black uppercase tracking-wide text-rose-200">4+ sa bekleyen</p>
          <p className="mt-1 text-[28px] font-black text-white">{staleOpen.length}</p>
          <p className="mt-1 text-[11px] text-white/45">{oldestOpenAge != null && staleOpen.length ? `En eski ${formatTicketAge(oldestOpenAge)}` : "Eskimiş açık yok"}</p>
        </button>
        <div className="rounded-2xl border border-white/10 bg-[#18181f] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-[#86efac]">WhatsApp sırası</p>
          <p className="mt-1 text-[28px] font-black text-white">{waitingWhatsappCount}</p>
          <p className="mt-1 text-[11px] text-white/45">Bekleyen veya bakılan</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#18181f] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-[#a5b4fc]">Yeni hizmet talebi</p>
          <p className="mt-1 text-[28px] font-black text-white">{newRequestCount}</p>
          <p className="mt-1 text-[11px] text-white/45">Yeni / inceleniyor</p>
        </div>
      </div>

      <section id="admin-ticket-sira" className="scroll-mt-24 rounded-[24px] border border-[#00a8c4]/25 bg-[linear-gradient(160deg,rgba(0,168,196,0.12),rgba(24,24,31,0.95))] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-[#3ec8dc]">Canlı sıra panosu</p>
            <h3 className="mt-1 text-[18px] font-black">Şimdi bakılan ve bekleyen sıra</h3>
            <p className="mt-2 text-[11px] text-white/50">
              Bakılanı yanıtlayın; sıradaki karttan SIRA GEÇ ile bir sonraki müşteriye geçin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {servingTickets[0] ? (
              <button
                type="button"
                onClick={() => {
                  setTicketFilter("needs");
                  focusTicketCard(servingTickets[0].id);
                }}
                className="rounded-xl bg-[#00a8c4] px-3 py-2 text-[10px] font-black"
              >
                Bakılana git
              </button>
            ) : null}
            {nextQueuedTicket ? (
              <button
                type="button"
                disabled={ticketBusyId === nextQueuedTicket.id}
                onClick={() => {
                  setTicketFilter("needs");
                  focusTicketCard(nextQueuedTicket.id);
                  void advanceTicket(nextQueuedTicket);
                }}
                className="rounded-xl bg-white px-3 py-2 text-[10px] font-black text-[#071b22] disabled:opacity-40"
              >
                Sıradakini al
              </button>
            ) : null}
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-[9px] font-black uppercase tracking-wide text-emerald-200">Şimdi bakılan</p>
            {servingTickets.length ? (
              <div className="mt-3 space-y-2">
                {servingTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => {
                      setTicketFilter("needs");
                      focusTicketCard(ticket.id);
                    }}
                    className="w-full rounded-xl border border-emerald-400/25 bg-emerald-950/30 px-3 py-3 text-left transition hover:border-emerald-300/45"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-black text-white">{ticket.company_name}</p>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[8px] font-black text-emerald-100">
                        {formatTicketAge(ticketAgeMinutes(ticket)) || "—"} · cevaplanıyor
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[12px] font-bold text-white/80">{ticket.subject}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[12px] font-bold text-white/45">Kimse bakılmıyor. Sıradakini alın veya bir ticketı Cevaplanıyor yapın.</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-black uppercase tracking-wide text-amber-200">Bekleyen sıra</p>
              <span className="text-[10px] font-black text-white/40">{queuedTickets.length} kişi</span>
            </div>
            {queuedTickets.length ? (
              <ol className="mt-3 space-y-2">
                {queuedTickets.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setTicketFilter("needs");
                        focusTicketCard(ticket.id);
                      }}
                      className="flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:border-[#00a8c4]/40"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00a8c4]/20 text-[12px] font-black text-[#9beaf2]">
                        {ticket.queue_position}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[11px] font-black text-white">{ticket.company_name}</span>
                          {ticketIsUrgent(ticket) ? <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[7px] font-black text-white">ACİL</span> : null}
                          {ticketIsStale(ticket) ? <span className="rounded-full bg-rose-500/80 px-1.5 py-0.5 text-[7px] font-black text-white">4+ sa</span> : null}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-white/55">{ticket.subject}</span>
                      </span>
                      <span className="shrink-0 text-[9px] font-bold text-white/35">{formatTicketAge(ticketAgeMinutes(ticket))}</span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-[12px] font-bold text-white/45">Numaralı sıra boş. Açık ticketlar listede; SIRA GEÇ ile kuyruğa alınırlar.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-[#18181f] p-5">
        <p className="text-[10px] font-black uppercase tracking-wide text-[#3ec8dc]">Vitrin sayıları</p>
        <h3 className="mt-1 text-[18px] font-black">Yardım panelindeki açık / cevaplanıyor / cevaplandı</h3>
        <p className="mt-2 text-[11px] text-white/50">Müşteri chip’i bu sayılardır. Gerçek sıra SIRA GEÇ ile yürür.</p>
        <p className="mt-2 text-[10px] text-white/35">Gerçek kuyruk: açık {data?.supportLive?.real?.open ?? "—"} · cevaplanıyor {data?.supportLive?.real?.answering ?? "—"} · cevaplandı {data?.supportLive?.real?.answered ?? "—"} · sıra {data?.supportLive?.real?.waiting ?? "—"}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {([["Açık", "open"], ["Cevaplanıyor", "answering"], ["Cevaplandı", "answered"]] as const).map(([label, key]) => (
            <label key={key} className={labelClass}>{label}
              <input type="number" min={0} value={vitrin[key]} onChange={(event) => setVitrin({ ...vitrin, [key]: Number(event.target.value) })} className={fieldClass} />
            </label>
          ))}
        </div>
        <button type="button" onClick={() => void saveVitrin()} className="mt-4 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black">Vitrini kaydet</button>
      </section>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Ticket filtreleri">
        <button type="button" onClick={() => setTicketFilter("needs")} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${ticketFilter === "needs" ? "bg-[#00a8c4] text-white" : "bg-white/5 text-white/60"}`}>
          İşlem bekleyen ({openTicketCount})
        </button>
        <button type="button" onClick={() => setTicketFilter("urgent")} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${ticketFilter === "urgent" ? "bg-rose-500 text-white" : "bg-white/5 text-white/60"}`}>
          Acil ({urgentTicketCount})
        </button>
        <button type="button" onClick={() => setTicketFilter("stale")} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${ticketFilter === "stale" ? "bg-rose-500 text-white" : "bg-white/5 text-white/60"}`}>
          4+ sa ({staleOpen.length})
        </button>
        <button type="button" onClick={() => setTicketFilter("all")} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${ticketFilter === "all" ? "bg-[#00a8c4] text-white" : "bg-white/5 text-white/60"}`}>
          Tüm ticketler
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section id="admin-ticket-listesi" className="scroll-mt-24">
          <div className="flex items-center gap-2"><MessageSquareText className="h-5 w-5 text-[#3ec8dc]" /><h3 className="text-[19px] font-black">Destek mesajları</h3></div>
          <div className="mt-4 space-y-3">{visibleTickets.length ? visibleTickets.map((ticket) => {
            const urgent = ticketIsUrgent(ticket);
            const ageMin = ticketAgeMinutes(ticket);
            const stale = ticketIsStale(ticket);
            const busy = ticketBusyId === ticket.id;
            const draft = reply[ticket.id] ?? ticket.admin_reply ?? "";
            const canSend = Boolean(draft.trim());
            const ageLabel = formatTicketAge(ageMin);
            const focused = focusTicketId === ticket.id;
            return (
            <article id={`admin-ticket-${ticket.id}`} key={ticket.id} className={`scroll-mt-28 rounded-2xl border p-4 ${focused ? "ring-2 ring-[#00a8c4]/70" : ""} ${stale ? "border-rose-300/40 bg-rose-950/30" : urgent ? "border-rose-300/35 bg-rose-950/25" : ticketNeedsAction(ticket) ? "border-amber-300/25 bg-amber-950/20" : "border-white/10 bg-[#18181f]"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-[9px] font-black uppercase text-[#3ec8dc]">{ticket.company_name} · {ticket.priority === "urgent" ? "Acil" : "Normal"}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {ageLabel ? (
                    <span className={`rounded-full px-2 py-1 text-[8px] font-black ${stale ? "bg-rose-500/25 text-rose-100" : ticketNeedsAction(ticket) ? "bg-amber-500/20 text-amber-100" : "bg-white/10 text-white/55"}`}>
                      {ticketNeedsAction(ticket) ? `${ageLabel} bekliyor` : ageLabel}
                    </span>
                  ) : null}
                  {stale ? <span className="rounded-full bg-rose-500 px-2 py-1 text-[8px] font-black text-white">4+ sa</span> : null}
                  {ticket.queue_position && ticket.queue_position > 0 ? <span className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-black">Sıra {ticket.queue_position}</span> : null}
                  <StatusDot kind={ticketDotKind(ticket.status)} label={TICKET_STATUS[ticket.status] || ticket.status} />
                </div>
              </div>
              <h4 className="mt-2 text-[13px] font-black">{ticket.subject}</h4>
              {ticket.created_at ? <p className="mt-1 text-[9px] font-bold text-white/35">{new Date(ticket.created_at).toLocaleString("tr-TR")}</p> : null}
              <p className="mt-2 text-[10px] leading-relaxed text-white/55">{ticket.message}</p>
              {ticket.admin_reply && (ticket.status === "answered" || ticket.status === "closed") ? (
                <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-950/25 px-3 py-2">
                  <p className="text-[9px] font-black uppercase tracking-wide text-emerald-200">Gönderilen yanıt</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-emerald-50/90">{ticket.admin_reply}</p>
                </div>
              ) : null}
              <label className={`${labelClass} mt-3 block`}>
                {ticket.status === "answered" || ticket.status === "closed" ? "Yanıtı düzelt" : "Müşteriye yanıt"}
                <textarea
                  value={draft}
                  disabled={busy}
                  onChange={(event) => setReply({ ...reply, [ticket.id]: event.target.value })}
                  onKeyDown={(event) => {
                    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                      event.preventDefault();
                      void answerTicket(ticket);
                    }
                  }}
                  placeholder="Yanıt yazın — Ctrl+Enter ile gönder"
                  rows={3}
                  className={fieldClass}
                />
              </label>
              <p className="mt-1 text-[9px] text-white/35">{canSend ? "Ctrl+Enter · Cevaplandı" : "Önce yanıt yazın"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => void advanceTicket(ticket)} className="rounded-xl bg-white px-3 py-2 text-[10px] font-black text-[#071b22] disabled:opacity-40">SIRA GEÇ</button>
                <button type="button" disabled={busy || ticket.status === "answering"} onClick={() => void setTicketStatus(ticket, "answering")} className="rounded-xl border border-white/15 px-3 py-2 text-[10px] font-black text-white/80 disabled:opacity-40">Cevaplanıyor</button>
                <button type="button" disabled={busy || !canSend} onClick={() => void answerTicket(ticket)} className="flex items-center gap-2 rounded-xl bg-[#00a8c4] px-3 py-2 text-[10px] font-black disabled:opacity-40"><Send className="h-3.5 w-3.5" /> {busy ? "Kaydediliyor…" : "Cevaplandı"}</button>
                {(ticket.status === "answered" || ticket.status === "answering") ? (
                  <button type="button" disabled={busy} onClick={() => void setTicketStatus(ticket, "closed")} className="rounded-xl border border-white/15 px-3 py-2 text-[10px] font-black text-white/55 disabled:opacity-40">Kapat</button>
                ) : null}
              </div>
            </article>
            );
          }) : <EmptyRow dark icon={MessageSquareText} title={ticketFilter === "needs" ? "İşlem bekleyen ticket yok" : ticketFilter === "urgent" ? "Acil ticket yok" : ticketFilter === "stale" ? "4+ sa bekleyen yok" : "Ticket yok"} hint="Müşteri panelinden gelen mesajlar burada açılır." />}</div>
        </section>
        <section>
          <h3 className="text-[19px] font-black">WhatsApp sırası</h3>
          <div className="mt-4 space-y-3">
            {(whatsappQueue.length) ? whatsappQueue.map((item) => (
              <article key={item.id} className={`rounded-2xl border p-4 ${(item.status === "waiting" || item.status === "serving") ? "border-emerald-300/25 bg-emerald-950/20" : "border-white/10 bg-[#18181f]"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-black uppercase text-[#86efac]">{item.company_name}</p>
                    <p className="mt-1 text-[12px] font-black">{item.contact_name}</p>
                  </div>
                  <StatusDot kind={whatsappDotKind(item.status)} label={WP_STATUS(item)} />
                </div>
                <button type="button" onClick={() => void advanceWhatsapp(item)} className="mt-3 rounded-xl bg-white px-3 py-2 text-[10px] font-black text-[#071b22]">SIRA GEÇ</button>
              </article>
            )) : <EmptyRow dark icon={MessageCircle} title="WhatsApp sırası boş" />}
          </div>
          <h3 id="admin-hizmet-talepleri" className="mt-8 scroll-mt-24 text-[19px] font-black">Yeni hizmet talepleri</h3>
          <div className="mt-4 space-y-3">{serviceRequests.length ? serviceRequests.map((item) => (
            <article key={item.id} className={`rounded-2xl border p-4 ${(item.status === "new" || item.status === "reviewing") ? "border-indigo-300/25 bg-indigo-950/20" : "border-white/10 bg-[#18181f]"}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9px] font-black uppercase text-[#a5b4fc]">{item.company_name}</p>
                <div className="flex items-center gap-2">
                  {item.kind === "extra" ? <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[8px] font-black uppercase text-teal-200">Ek Hizmet Talebi</span> : null}
                  <StatusDot kind={serviceDotKind(item.status)} />
                </div>
              </div>
              <div className="mt-2 flex items-start gap-2"><ServiceMark name={item.service} size={28} /><h4 className="text-[13px] font-black">{item.service}</h4></div>
              <p className="mt-2 text-[10px] leading-relaxed text-white/55">{item.details}</p>
              {item.kind === "extra" && (item.status === "new" || item.status === "reviewing") ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => void confirmExtraRequest(item, true)} className="rounded-xl bg-[#00a8c4] px-3 py-2 text-[10px] font-black text-white">Onayla</button>
                  <button type="button" onClick={() => void confirmExtraRequest(item, false)} className="rounded-xl border border-rose-300/25 px-3 py-2 text-[10px] font-black text-rose-200">Reddet</button>
                </div>
              ) : (
                <select value={item.status} onChange={(event) => void updateRequest(item, event.target.value)} className={`${fieldClass} mt-3`}>
                  <option value="new">Yeni</option>
                  <option value="reviewing">İnceleniyor</option>
                  <option value="quoted">Teklif hazır</option>
                  <option value="approved">Onaylandı</option>
                  <option value="accepted">Kabul</option>
                  <option value="closed">Kapalı</option>
                </select>
              )}
            </article>
          )) : <EmptyRow dark icon={ClipboardList} title="Hizmet talebi yok" />}</div>
          <h3 className="mt-8 flex items-center gap-2 text-[19px] font-black"><Globe className="h-5 w-5 text-[#70dce9]" /> Son domain sorguları</h3>
          <p className="mt-2 text-[11px] text-white/45">Müşteri panelinden yapılan DNS ön kontrolleri. Domain ticket’ı gelince buradan bakın.</p>
          <div className="mt-4 space-y-2">
            {domainChecks.length ? domainChecks.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#18181f] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-black text-white">{item.domain}</p>
                  <p className="mt-0.5 truncate text-[9px] font-bold text-white/40">{item.company_name}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-black ${item.result === "potentially_available" ? "bg-emerald-500/15 text-emerald-200" : item.result === "registered" ? "bg-rose-500/15 text-rose-200" : "bg-white/10 text-white/55"}`}>
                  {DOMAIN_RESULT[item.result] || item.result}
                </span>
              </div>
            )) : <EmptyRow dark icon={Globe} title="Domain sorgusu yok" hint="Müşteri Domain Sorgula sekmesinden kontrol eder." />}
          </div>
        </section>
      </div>
      </>
      ) : null}
    </div>
  );
}
