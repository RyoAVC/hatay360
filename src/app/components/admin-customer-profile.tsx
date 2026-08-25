import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarClock, CheckCircle2, ClipboardCheck, Copy, Download, ExternalLink, FileText, History, Image as ImageIcon, KeyRound, Megaphone, MessageCircle, MessageSquareText, Milestone, PenLine, RotateCcw, Save, Search, ShieldCheck, Trash2, Undo2, Upload, UserPlus, Users } from "lucide-react";
import { StatusDot } from "./status-dot";
import { apiRequest } from "../lib/api";
import { approvalFilePayload, contractFilePayload, openContractFile } from "../lib/contract-upload";
import { QUOTE_LEGAL_NOTE } from "./customer-quotes-panel";
import { sanitizePhoneInput, toWhatsAppHref } from "../lib/contact";
import { siteDotKind, paymentDotKind } from "../lib/ops-status";
import {
  ACCOUNT_STATUS_LABELS,
  CATALOG_KIND_LABELS,
  PAYMENT_STATUS_LABELS,
  SITE_STATUS_LABELS,
  formatTry,
  paymentInvoiceFileName,
  type CatalogKind,
  type PaymentStatus,
  type SiteStatus,
} from "../lib/payment-balance";
import { PORTAL_PACKAGE_IDS, packageLabel } from "../lib/portal-package";
import { auditActionLabel, auditActionTone, auditActorLabel, formatAuditTime, type AuditLog } from "../lib/audit";
import {
  RENEWAL_KINDS,
  RENEWAL_KIND_LABELS,
  RENEWAL_STATUS_LABELS,
  renewalCountdownLabel,
  formatRenewDate,
  type Renewal,
  type RenewalKind,
  type RenewalStatus,
} from "../lib/renewals";
import { SEO_RANK_WAIT_MESSAGE, type SeoKeywordRow } from "../lib/seo-rank";
import { QUOTE_TEMPLATES } from "../lib/quote-templates";
import { ADS_BOUND_NO_API_DETAIL, type AdsAccountBinding } from "../lib/ads-bind";

export type CatalogItem = { id: number; kind: CatalogKind; title: string; details: string; amount: number; quantity: number; createdAt: string; status?: string };
export type PaymentItem = { id: number; period: string; amount: number; paidAmount: number; remaining: number; unpaidBase?: number; penalty?: number; overdue?: boolean; daysLeft?: number | null; daysOverdue?: number; startDate?: string; endDate?: string; status: PaymentStatus; note: string; gatewayRef?: string; gatewayProvider?: string };
export type ContractItem = { id: number; familyId: number; version: number; title: string; fileName: string; mimeType: string; sizeBytes: number; uploadedBy: string; current: boolean; createdAt: string; templateId?: number; bodyHtml?: string; signStatus?: string; signReason?: string; signedAt?: string; hasSignature?: boolean; sigX?: number; sigY?: number; sigW?: number; sigH?: number };
export type ProfileApproval = { id: number; customerId: number; companyName?: string; title: string; description: string; kind: "file" | "image" | "text"; bodyText: string; status: "pending" | "approved" | "revision"; feedbackText: string; hasFile: boolean; fileName: string; mimeType: string; fileUrl: string; createdBy: string; createdAt: string; respondedAt: string; waitingDays: number };
export type ProfileQuote = { id: number; customerId: number; companyName?: string; title: string; status: "pending" | "accepted" | "withdrawn"; hasFile: boolean; fileName: string; mimeType: string; fileUrl: string; acceptName: string; acceptedAt: string; createdAt: string; waitingDays: number };
export type PaymentSummary = { total: number; paid: number; unpaid: number; remaining: number; penalty?: number; overdueCount?: number };
export type SubUser = { id: number; name: string; email: string; role: "full" | "limited"; status: "active" | "disabled"; created_at: string };
type ContractTemplate = { id: number; name: string; bodyHtml: string; sigX: number; sigY: number; sigW: number; sigH: number };
export type CustomerProfile = {
  customer: {
    id: number;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    national_id?: string;
    status: string;
    package_id: string;
    website_url: string;
    ssl_status: string;
    site_status: SiteStatus;
    site_error?: number | boolean;
    last_backup_at: string;
    last_update_at: string;
    googleAdsCustomerId?: string;
    metaAdAccountId?: string;
    google_ads_customer_id?: string;
    meta_ad_account_id?: string;
    site_phone?: string;
    site_address?: string;
    site_hours?: string;
    seo_score_override?: number | null;
    seo_score_label?: string;
    seo_score_note?: string;
  };
  products: CatalogItem[];
  services: CatalogItem[];
  invoices: CatalogItem[];
  extras?: CatalogItem[];
  payments: PaymentItem[];
  paymentSummary: PaymentSummary;
  contracts: ContractItem[];
  renewals?: Renewal[];
  project?: ProjectStatus;
  projectEvents?: ProjectEvent[];
  announcements?: PortalAnnouncementAdmin[];
};
export type ProjectStage = { key: string; label: string; done: boolean; current: boolean };
export type ProjectStatus = { stage: string; stageLabel: string; stageIndex: number; totalStages: number; stages: ProjectStage[]; pendingApprovals?: number; updatedAt: string; celebrationPending?: boolean };
export type PortalAnnouncementAdmin = { id: number; customerId: number | null; title: string; body: string; linkUrl: string; tone: string; active: boolean; sortOrder: number };
export type ProjectEvent = { id: number; fromStage: string | null; fromLabel: string; toStage: string; toLabel: string; note: string; actor: string; createdAt: string };

const fieldClass = "mt-1 w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-[12px] font-bold text-white outline-none focus:border-[#00a8c4]";
const labelClass = "text-[10px] font-black uppercase tracking-wide text-white/50";
const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(Number(value || 0));
type PaymentFilter = "all" | "overdue" | "open";

function dashNap(value: string) {
  return String(value || "").trim() || "—";
}

/** Admin ops NAP — müşteri portalı butonu ve /araclar/nap-kontrol değil. */
export function buildAdminNapPack({
  companyName,
  phone,
  address,
  hours,
}: {
  companyName: string;
  phone: string;
  address: string;
  hours: string;
}) {
  return [
    dashNap(companyName),
    `Telefon: ${dashNap(phone)}`,
    `Adres: ${dashNap(address)}`,
    `Çalışma saati: ${dashNap(hours)}`,
  ].join("\n");
}

function adminOpsWhatsAppMessage(companyName: string) {
  const firm = String(companyName || "").trim() || "hesabınız";
  return `Merhaba, Hatay360 operasyon. ${firm} için yazıyorum.`;
}

async function copyPlainText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* execCommand yedek */
  }
  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.setAttribute("aria-hidden", "true");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    field.style.top = "0";
    document.body.appendChild(field);
    field.focus();
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  } catch {
    return false;
  }
}

function AdminNapOpsBar({
  companyName,
  phone,
  waPhone,
  address,
  hours,
}: {
  companyName: string;
  phone: string;
  waPhone: string;
  address: string;
  hours: string;
}) {
  const [copied, setCopied] = useState(false);
  const waHref = toWhatsAppHref(waPhone, adminOpsWhatsAppMessage(companyName));
  const copy = async () => {
    const ok = await copyPlainText(buildAdminNapPack({ companyName, phone, address, hours }));
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={copied ? "NAP panoya kopyalandı" : "Firma adı, telefon, adres ve çalışma saatini kopyala"}
        aria-live="polite"
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-[10px] font-black text-white/85"
      >
        {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Kopyalandı" : "NAP kopyala"}
      </button>
      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Müşteri telefonuna WhatsApp operasyon mesajı"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#16a34a] px-3 py-2 text-[10px] font-black text-white"
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="Telefon kaydı yok — WhatsApp açılamaz"
          aria-label="Telefon kaydı yok — WhatsApp açılamaz"
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black text-white/35"
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </button>
      )}
    </div>
  );
}

export function AdminCustomerProfile({ customerId, onClose, onChanged }: { customerId: number; onClose: () => void; onChanged: () => void }) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState({ companyName: "", contactName: "", email: "", phone: "", packageId: "", websiteUrl: "", siteStatus: "open" as SiteStatus, siteError: false, sslStatus: "unknown", lastBackupAt: "", lastUpdateAt: "" });
  const [password, setPassword] = useState("");
  const [catalog, setCatalog] = useState({ kind: "product" as CatalogKind, title: "", details: "", amount: "", quantity: "1" });
  const [payment, setPayment] = useState({ period: new Date().toISOString().slice(0, 7), startDate: new Date().toISOString().slice(0, 8) + "01", endDate: new Date().toISOString().slice(0, 10), amount: "", paidAmount: "", status: "unpaid" as PaymentStatus, note: "" });
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [renewal, setRenewal] = useState({ kind: "domain" as RenewalKind, label: "", renewDate: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10), amount: "", note: "" });
  const [contractTitle, setContractTitle] = useState("");
  const [contractMissing, setContractMissing] = useState<string[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [sigBox, setSigBox] = useState({ x: 12, y: 78, w: 36, h: 12 });
  const [reviewReason, setReviewReason] = useState<Record<number, string>>({});
  const [approvals, setApprovals] = useState<ProfileApproval[]>([]);
  const [approvalForm, setApprovalForm] = useState({ title: "", description: "", kind: "image" as ProfileApproval["kind"], bodyText: "" });
  const [quotes, setQuotes] = useState<ProfileQuote[]>([]);
  const [quoteForm, setQuoteForm] = useState({ title: "" });
  const [project, setProject] = useState<ProjectStatus | null>(null);
  const [projectEvents, setProjectEvents] = useState<ProjectEvent[]>([]);
  const [stageChoice, setStageChoice] = useState("");
  const [stageNote, setStageNote] = useState("");
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [subUserForm, setSubUserForm] = useState({ name: "", email: "", role: "limited" as "full" | "limited", password: "" });
  const [auditRows, setAuditRows] = useState<AuditLog[]>([]);
  const [seoKeywords, setSeoKeywords] = useState<SeoKeywordRow[]>([]);
  const [seoKeyword, setSeoKeyword] = useState("");
  const [adsAccounts, setAdsAccounts] = useState({ googleAdsCustomerId: "", metaAdAccountId: "" });
  const [announcements, setAnnouncements] = useState<PortalAnnouncementAdmin[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", body: "", linkUrl: "", tone: "promo", global: false });
  const [seoScoreForm, setSeoScoreForm] = useState({ scoreOverride: "", scoreLabel: "", scoreNote: "" });

  const applyTemplateFields = (item?: ContractTemplate | null) => {
    if (!item) {
      setTemplateName("");
      setTemplateBody("");
      setSigBox({ x: 12, y: 78, w: 36, h: 12 });
      return;
    }
    setTemplateName(item.name || "");
    setTemplateBody(item.bodyHtml || "");
    setSigBox({
      x: Number(item.sigX) || 12,
      y: Number(item.sigY) || 78,
      w: Number(item.sigW) || 36,
      h: Number(item.sigH) || 12,
    });
  };

  const clampSig = (value: number, fallback: number) => {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(2, Math.min(90, Math.round(value * 10) / 10));
  };

  const load = async () => {
    const next = await apiRequest<CustomerProfile>(`/api/admin/customers/${customerId}`);
    setProfile(next);
    if (next.project) {
      setProject(next.project);
      setStageChoice(next.project.stage);
    }
    if (next.projectEvents) setProjectEvents(next.projectEvents);
    if (next.announcements) setAnnouncements(next.announcements);
    const library = await apiRequest<{ templates: ContractTemplate[] }>("/api/admin/contract-templates");
    setTemplates(library.templates);
    if (library.templates[0] && !templateId) {
      setTemplateId(String(library.templates[0].id));
      applyTemplateFields(library.templates[0]);
    }
    setEdit({
      companyName: next.customer.company_name,
      contactName: next.customer.contact_name,
      email: next.customer.email,
      phone: next.customer.phone,
      packageId: next.customer.package_id || "",
      websiteUrl: next.customer.website_url || "",
      siteStatus: next.customer.site_status || "open",
      siteError: Boolean(next.customer.site_error),
      sslStatus: next.customer.ssl_status || "unknown",
      lastBackupAt: String(next.customer.last_backup_at || "").slice(0, 10),
      lastUpdateAt: String(next.customer.last_update_at || "").slice(0, 10),
    });
    setAdsAccounts({
      googleAdsCustomerId: next.customer.googleAdsCustomerId || next.customer.google_ads_customer_id || "",
      metaAdAccountId: next.customer.metaAdAccountId || next.customer.meta_ad_account_id || "",
    });
    setSeoScoreForm({
      scoreOverride: next.customer.seo_score_override == null ? "" : String(next.customer.seo_score_override),
      scoreLabel: next.customer.seo_score_label || "",
      scoreNote: next.customer.seo_score_note || "",
    });
  };

  const loadApprovals = async () => {
    const result = await apiRequest<{ approvals: ProfileApproval[] }>(`/api/admin/approvals?customerId=${customerId}`);
    setApprovals(result.approvals || []);
  };

  const loadQuotes = async () => {
    const result = await apiRequest<{ quotes: ProfileQuote[] }>(`/api/admin/quotes?customerId=${customerId}`);
    setQuotes(result.quotes || []);
  };

  const loadSubUsers = async () => {
    const result = await apiRequest<{ users: SubUser[] }>(`/api/admin/customers/${customerId}/users`);
    setSubUsers(result.users || []);
  };

  const loadAudit = async () => {
    const result = await apiRequest<{ rows: AuditLog[] }>(`/api/admin/customers/${customerId}/audit?perPage=15&days=365`);
    setAuditRows(result.rows || []);
  };

  const loadSeoKeywords = async () => {
    const result = await apiRequest<{ keywords: SeoKeywordRow[] }>(`/api/admin/customers/${customerId}/seo-keywords`);
    setSeoKeywords(result.keywords || []);
  };

  useEffect(() => {
    void load().catch((error) => setNotice(error instanceof Error ? error.message : "Profil yüklenemedi."));
    void loadApprovals().catch(() => undefined);
    void loadQuotes().catch(() => undefined);
    void loadSubUsers().catch(() => undefined);
    void loadAudit().catch(() => undefined);
    void loadSeoKeywords().catch(() => undefined);
  }, [customerId]);

  const addSubUser = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await apiRequest<{ users: SubUser[] }>(`/api/admin/customers/${customerId}/users`, {
        method: "POST",
        body: JSON.stringify(subUserForm),
      });
      setSubUsers(result.users || []);
      setSubUserForm({ name: "", email: "", role: "limited", password: "" });
      setNotice("Alt kullanıcı eklendi. Giriş bilgilerini firmaya iletin.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Alt kullanıcı eklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const patchSubUser = async (id: number, body: Record<string, unknown>, message: string) => {
    setBusy(true);
    try {
      const result = await apiRequest<{ users: SubUser[] }>(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setSubUsers(result.users || []);
      setNotice(message);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Alt kullanıcı güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const resetSubUserPassword = async (id: number) => {
    const next = window.prompt("Yeni şifre (en az 10 karakter):", "");
    if (next === null) return;
    if (next.length < 10) {
      setNotice("Şifre en az 10 karakter olmalıdır.");
      return;
    }
    await patchSubUser(id, { password: next }, "Alt kullanıcı şifresi güncellendi.");
  };

  const removeSubUser = async (id: number) => {
    setBusy(true);
    try {
      const result = await apiRequest<{ users: SubUser[] }>(`/api/admin/users/${id}`, { method: "DELETE" });
      setSubUsers(result.users || []);
      setNotice("Alt kullanıcı silindi.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Alt kullanıcı silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  const saveAdsAccounts = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await apiRequest<{ ok: boolean; binding: AdsAccountBinding }>(`/api/admin/customers/${customerId}/ads-accounts`, {
        method: "PUT",
        body: JSON.stringify(adsAccounts),
      });
      setAdsAccounts({
        googleAdsCustomerId: result.binding?.googleId || "",
        metaAdAccountId: result.binding?.metaId || "",
      });
      setNotice(result.binding?.detail || "Reklam hesap ID’leri kaydedildi. Canlı API bağlı değil.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Reklam hesapları kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const addSeoKeyword = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await apiRequest<{ keywords: SeoKeywordRow[] }>(`/api/admin/customers/${customerId}/seo-keywords`, {
        method: "POST",
        body: JSON.stringify({ keyword: seoKeyword }),
      });
      setSeoKeywords(result.keywords || []);
      setSeoKeyword("");
      setNotice("SEO kelimesi eklendi. Sıralama Google API bağlanınca dolar.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Kelime eklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const removeSeoKeyword = async (id: number) => {
    setBusy(true);
    try {
      const result = await apiRequest<{ keywords: SeoKeywordRow[] }>(`/api/admin/seo-keywords/${id}`, { method: "DELETE" });
      setSeoKeywords(result.keywords || []);
      setNotice("SEO kelimesi silindi.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Kelime silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  const applyRecords = (next: Partial<CustomerProfile>) => {
    setProfile((current) => (current ? { ...current, ...next } : current));
  };

  const sendApproval = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!approvalForm.title.trim()) {
      setNotice("Onay başlığı girin.");
      return;
    }
    const input = event.currentTarget.elements.namedItem("approvalFile") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (approvalForm.kind === "text") {
      if (approvalForm.bodyText.trim().length < 3) {
        setNotice("Metin onayı için açıklama yazın.");
        return;
      }
    } else if (!file) {
      setNotice("Onay için görsel/dosya seçin.");
      return;
    }
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        title: approvalForm.title,
        description: approvalForm.description,
        kind: approvalForm.kind,
        bodyText: approvalForm.bodyText,
      };
      if (approvalForm.kind !== "text" && file) {
        const filePayload = await approvalFilePayload(file);
        Object.assign(payload, filePayload);
      }
      const result = await apiRequest<{ approvals: ProfileApproval[] }>(`/api/admin/customers/${customerId}/approvals`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setApprovals(result.approvals || []);
      setApprovalForm({ title: "", description: "", kind: approvalForm.kind, bodyText: "" });
      if (input) input.value = "";
      setNotice("Onay isteği müşteriye gönderildi.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Onay gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const remindApproval = async (item: ProfileApproval) => {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/approvals/${item.id}/remind`, { method: "POST", body: JSON.stringify({}) });
      await loadApprovals();
      setNotice("Panel içi hatırlatma işlendi.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Hatırlatma işlenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const sendQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quoteForm.title.trim()) {
      setNotice("Teklif başlığı girin.");
      return;
    }
    const input = event.currentTarget.elements.namedItem("quoteFile") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      setNotice("Teklif için PDF veya görsel seçin.");
      return;
    }
    setBusy(true);
    try {
      const filePayload = await approvalFilePayload(file);
      const result = await apiRequest<{ id: number; quotes?: ProfileQuote[] }>(`/api/admin/customers/${customerId}/quotes`, {
        method: "POST",
        body: JSON.stringify({ title: quoteForm.title, ...filePayload }),
      });
      if (result.quotes) setQuotes(result.quotes);
      else await loadQuotes();
      setQuoteForm({ title: "" });
      if (input) input.value = "";
      setNotice("Teklif müşteriye gönderildi.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Teklif gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const withdrawQuote = async (item: ProfileQuote) => {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/quotes/${item.id}/withdraw`, { method: "POST", body: JSON.stringify({}) });
      await loadQuotes();
      setNotice("Teklif geri çekildi.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Teklif geri çekilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const moveStage = async (stage: string, note: string) => {
    if (!stage) {
      setNotice("Aşama seçin.");
      return;
    }
    if (project && stage === project.stage) {
      setNotice("Aşama değişmedi.");
      return;
    }
    if (note.trim().length < 4) {
      setNotice("Müşteri panelinde görünecek kısa not yazın.");
      return;
    }
    setBusy(true);
    try {
      const result = await apiRequest<{ project: ProjectStatus; events: ProjectEvent[] }>(`/api/admin/customers/${customerId}/project/stage`, {
        method: "POST",
        body: JSON.stringify({ stage, note }),
      });
      setProject(result.project);
      setProjectEvents(result.events || []);
      setStageChoice(result.project.stage);
      setStageNote("");
      setNotice(`Proje aşaması güncellendi: ${result.project.stageLabel}.`);
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Aşama güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await apiRequest(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        body: JSON.stringify({
          companyName: edit.companyName,
          contactName: edit.contactName,
          email: edit.email,
          phone: edit.phone,
          packageId: edit.packageId,
          websiteUrl: edit.websiteUrl,
          siteStatus: edit.siteStatus,
          siteError: edit.siteError,
          sslStatus: edit.sslStatus,
          lastBackupAt: edit.lastBackupAt,
          lastUpdateAt: edit.lastUpdateAt,
        }),
      });
      setNotice("Müşteri kaydı güncellendi.");
      await load();
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Kayıt güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await apiRequest<{ message?: string }>(`/api/admin/customers/${customerId}/password`, { method: "POST", body: JSON.stringify({ password }) });
      setPassword("");
      setNotice(result.message || "Şifre güncellendi.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Şifre kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const addCatalog = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await apiRequest<CustomerProfile>(`/api/admin/customers/${customerId}/catalog`, {
        method: "POST",
        body: JSON.stringify({ kind: catalog.kind, title: catalog.title, details: catalog.details, amount: Number(catalog.amount || 0), quantity: Number(catalog.quantity || 1) }),
      });
      setCatalog({ kind: catalog.kind, title: "", details: "", amount: "", quantity: "1" });
      applyRecords(result);
      setNotice(`${CATALOG_KIND_LABELS[catalog.kind]} satırı eklendi.`);
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Satır eklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const removeCatalog = async (item: CatalogItem) => {
    setBusy(true);
    try {
      const result = await apiRequest<CustomerProfile>(`/api/admin/customers/${customerId}/catalog/${item.id}`, { method: "DELETE" });
      applyRecords(result);
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Satır silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  const decideExtraCatalog = async (item: CatalogItem, accept: boolean) => {
    setBusy(true);
    try {
      const result = await apiRequest<CustomerProfile>(`/api/admin/customers/${customerId}/catalog/${item.id}/${accept ? "confirm" : "reject"}`, { method: "POST", body: "{}" });
      applyRecords(result);
      setNotice(accept ? "Ek hizmet onaylandı; faturaya yansıdı." : "Ek hizmet taslağı iptal edildi.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ek hizmet güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const savePayment = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await apiRequest<CustomerProfile>(`/api/admin/customers/${customerId}/payments`, {
        method: "POST",
        body: JSON.stringify({
          period: payment.period,
          startDate: payment.startDate,
          endDate: payment.endDate,
          amount: Number(payment.amount || 0),
          paidAmount: Number(payment.paidAmount || 0),
          status: payment.status,
          note: payment.note,
        }),
      });
      setPayment({ period: payment.period, startDate: payment.startDate, endDate: payment.endDate, amount: "", paidAmount: "", status: "unpaid", note: "" });
      applyRecords(result);
      setNotice("Aylık ödeme kaydedildi.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ödeme kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const patchPayment = async (item: PaymentItem, body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const result = await apiRequest<CustomerProfile>(`/api/admin/customers/${customerId}/payments/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      applyRecords(result);
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ödeme kaydı güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const markPayment = async (item: PaymentItem, status: PaymentStatus) => {
    await patchPayment(item, { status, paidAmount: status === "paid" ? item.amount : status === "unpaid" ? 0 : item.paidAmount });
  };

  const savePaymentRow = async (event: FormEvent<HTMLFormElement>, item: PaymentItem) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await patchPayment(item, {
      amount: Number(form.get("amount") || 0),
      paidAmount: Number(form.get("paidAmount") || 0),
      startDate: String(form.get("startDate") || ""),
      endDate: String(form.get("endDate") || ""),
      status: item.status,
    });
    setNotice("Tutar ve dönem güncellendi.");
  };

  const removePayment = async (item: PaymentItem) => {
    if (!window.confirm(`${item.period} dönem ödemesini silmek istediğinize emin misiniz?`)) return;
    setBusy(true);
    try {
      const result = await apiRequest<CustomerProfile>(`/api/admin/customers/${customerId}/payments/${item.id}`, { method: "DELETE" });
      applyRecords(result);
      setNotice("Ödeme kaydı silindi.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ödeme silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  const removeTemplate = async () => {
    if (!templateId) return;
    if (!window.confirm("Bu sözleşme şablonunu kütüphaneden kaldırmak istiyor musunuz?")) return;
    setBusy(true);
    try {
      const result = await apiRequest<{ templates: ContractTemplate[] }>(`/api/admin/contract-templates/${templateId}`, { method: "DELETE" });
      setTemplates(result.templates);
      setTemplateId(result.templates[0] ? String(result.templates[0].id) : "");
      applyTemplateFields(result.templates[0] || null);
      setNotice("Şablon kaldırıldı.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Şablon silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  const enterCustomerPortal = async () => {
    setBusy(true);
    try {
      const result = await apiRequest<{ portalPath: string }>(`/api/admin/customers/${customerId}/impersonate`, { method: "POST", body: "{}" });
      window.open(result.portalPath, "_blank", "noopener,noreferrer");
      setNotice("Müşteri paneli yeni sekmede açıldı (müşteri loglarına yazılmaz).");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Panele giriş açılamadı.");
    } finally {
      setBusy(false);
    }
  };

  const addAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await apiRequest<{ announcements: PortalAnnouncementAdmin[] }>(`/api/admin/customers/${customerId}/announcements`, {
        method: "POST",
        body: JSON.stringify(announcementForm),
      });
      setAnnouncements(result.announcements);
      setAnnouncementForm({ title: "", body: "", linkUrl: "", tone: "promo", global: false });
      setNotice("Duyuru eklendi.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Duyuru eklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const removeAnnouncement = async (item: PortalAnnouncementAdmin) => {
    setBusy(true);
    try {
      const result = await apiRequest<{ announcements: PortalAnnouncementAdmin[] }>(`/api/admin/customers/${customerId}/announcements/${item.id}`, { method: "DELETE" });
      setAnnouncements(result.announcements);
      setNotice("Duyuru kaldırıldı.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Duyuru silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  const sendQuoteTemplate = async (templateKey: string) => {
    setBusy(true);
    try {
      const tpl = QUOTE_TEMPLATES.find((item) => item.key === templateKey);
      const result = await apiRequest<{ quotes?: ProfileQuote[] }>(`/api/admin/customers/${customerId}/quotes/from-template`, {
        method: "POST",
        body: JSON.stringify({ templateKey, title: quoteForm.title || tpl?.defaultTitle }),
      });
      if (result.quotes) setQuotes(result.quotes);
      else await loadQuotes();
      setQuoteForm({ title: "" });
      setNotice(`${tpl?.name || "Teklif"} müşteriye gönderildi.`);
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Şablon teklifi gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const saveSeoScore = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await apiRequest(`/api/admin/customers/${customerId}/seo-score`, {
        method: "PATCH",
        body: JSON.stringify({
          scoreOverride: seoScoreForm.scoreOverride === "" ? null : Number(seoScoreForm.scoreOverride),
          scoreLabel: seoScoreForm.scoreLabel,
          scoreNote: seoScoreForm.scoreNote,
        }),
      });
      setNotice("SEO puan ayarları kaydedildi.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "SEO puanı kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const addRenewal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await apiRequest<{ renewals: Renewal[] }>(`/api/admin/customers/${customerId}/renewals`, {
        method: "POST",
        body: JSON.stringify({
          kind: renewal.kind,
          label: renewal.label,
          renew_date: renewal.renewDate,
          amount: Number(renewal.amount || 0),
          note: renewal.note,
        }),
      });
      applyRecords({ renewals: result.renewals });
      setRenewal({ ...renewal, label: "", amount: "", note: "" });
      setNotice("Yenileme kaydı eklendi.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Yenileme eklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const setRenewalStatus = async (item: Renewal, status: RenewalStatus) => {
    setBusy(true);
    try {
      const result = await apiRequest<{ renewals: Renewal[] }>(`/api/admin/renewals/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      applyRecords({ renewals: result.renewals });
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Durum güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const removeRenewal = async (item: Renewal) => {
    setBusy(true);
    try {
      const result = await apiRequest<{ renewals: Renewal[] }>(`/api/admin/renewals/${item.id}`, { method: "DELETE" });
      applyRecords({ renewals: result.renewals });
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  const openInvoicePdf = async (item: PaymentItem, mode: "view" | "download") => {
    const base = `/api/admin/customers/${customerId}/payments/${item.id}/invoice.pdf`;
    const url = mode === "download" ? `${base}?download=1` : `${base}?download=0`;
    const fileName = mode === "download" ? paymentInvoiceFileName(item.period, Boolean(item.overdue && item.remaining > 0), item.id) : undefined;
    try {
      await openContractFile(url, fileName);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "PDF alınamadı.");
    }
  };

  const downloadOverdueInvoicePdfs = async () => {
    const rows = (profile?.payments || []).filter((item) => item.overdue && item.remaining > 0);
    if (!rows.length) {
      setNotice("Gecikmiş ödeme yok.");
      return;
    }
    setBusy(true);
    try {
      for (const item of rows) {
        await openContractFile(
          `/api/admin/customers/${customerId}/payments/${item.id}/invoice.pdf?download=1`,
          paymentInvoiceFileName(item.period, true, item.id),
        );
        await new Promise((resolve) => window.setTimeout(resolve, 320));
      }
      setNotice(`${rows.length} gecikmiş PDF indirildi (CEZA ×1,15 satırlı).`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Toplu PDF indirilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const uploadContract = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("contract") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      setNotice("PDF veya JPG seçin.");
      return;
    }
    setBusy(true);
    try {
      const payload = await contractFilePayload(file);
      const result = await apiRequest<CustomerProfile>(`/api/admin/customers/${customerId}/contracts`, {
        method: "POST",
        body: JSON.stringify({ title: contractTitle, ...payload }),
      });
      setContractTitle("");
      if (input) input.value = "";
      applyRecords(result);
      setNotice("Sözleşme yüklendi.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Sözleşme yüklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const restoreContract = async (item: ContractItem) => {
    setBusy(true);
    try {
      const result = await apiRequest<CustomerProfile>(`/api/admin/customers/${customerId}/contracts/${item.id}/restore`, { method: "POST", body: JSON.stringify({}) });
      applyRecords(result);
      setNotice("Önceki sözleşme sürümü geri yüklendi.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Geri yükleme yapılamadı.");
    } finally {
      setBusy(false);
    }
  };

  const assignTemplate = async () => {
    if (!templateId) {
      setNotice("Şablon seçin.");
      return;
    }
    setBusy(true);
    try {
      const result = await apiRequest<CustomerProfile>(`/api/admin/customers/${customerId}/contracts/from-template`, {
        method: "POST",
        body: JSON.stringify({ templateId: Number(templateId), title: contractTitle }),
      });
      applyRecords(result);
      setNotice("Şablon bu müşteriye atandı.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Şablon atanamadı.");
    } finally {
      setBusy(false);
    }
  };

  const createAutomaticContract = async () => {
    setBusy(true);
    setContractMissing([]);
    try {
      const result = await apiRequest<CustomerProfile & { missingFields?: string[] }>(`/api/admin/customers/${customerId}/contracts/automatic`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      applyRecords(result);
      const missing = result.missingFields || [];
      setContractMissing(missing);
      setNotice(missing.length ? "Sözleşme oluşturuldu; boş bırakılan alanları aşağıdaki listeden kontrol edin." : "Sözleşme otomatik doldurularak oluşturuldu.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Sözleşme oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  };

  const saveTemplate = async () => {
    setBusy(true);
    try {
      const box = {
        sigX: clampSig(sigBox.x, 12),
        sigY: clampSig(sigBox.y, 78),
        sigW: clampSig(sigBox.w, 36),
        sigH: clampSig(sigBox.h, 12),
      };
      const selected = templates.find((item) => String(item.id) === templateId);
      if (selected) {
        const result = await apiRequest<{ templates: ContractTemplate[] }>(`/api/admin/contract-templates/${selected.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: templateName || selected.name, bodyHtml: templateBody || selected.bodyHtml, ...box }),
        });
        setTemplates(result.templates);
        const updated = result.templates.find((item) => item.id === selected.id);
        if (updated) applyTemplateFields(updated);
        setNotice("Şablon, metin ve imza/damga kutusu kaydedildi.");
      } else {
        const result = await apiRequest<{ templates: ContractTemplate[]; id: number }>("/api/admin/contract-templates", {
          method: "POST",
          body: JSON.stringify({ name: templateName || "Yeni şablon", bodyHtml: templateBody, ...box }),
        });
        setTemplates(result.templates);
        setTemplateId(String(result.id));
        const created = result.templates.find((item) => item.id === result.id);
        if (created) applyTemplateFields(created);
        setNotice("Yeni şablon kütüphaneye eklendi (damga kutusu dahil).");
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Şablon kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const reviewContract = async (item: ContractItem, status: "approved" | "rejected") => {
    setBusy(true);
    try {
      const result = await apiRequest<CustomerProfile>(`/api/admin/customers/${customerId}/contracts/${item.id}/review`, {
        method: "POST",
        body: JSON.stringify({ status, reason: reviewReason[item.id] || "" }),
      });
      applyRecords(result);
      setNotice(status === "approved" ? "Sözleşme onaylandı." : "Sözleşme reddedildi.");
      onChanged();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Durum kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const groupedContracts = useMemo(() => {
    const map = new Map<number, ContractItem[]>();
    for (const item of profile?.contracts || []) {
      const list = map.get(item.familyId) || [];
      list.push(item);
      map.set(item.familyId, list);
    }
    return [...map.values()];
  }, [profile]);

  if (!profile) return <section className="rounded-[24px] border border-white/10 bg-[#18181f] p-5 text-[12px] font-bold text-white/60">{notice || "Profil açılıyor…"}</section>;

  const summary = profile.paymentSummary || { total: 0, paid: 0, unpaid: 0, remaining: 0 };
  const payments = profile.payments || [];
  const renewals = profile.renewals || [];
  const overdueCount = payments.filter((item) => item.overdue && item.remaining > 0).length;
  const openCount = payments.filter((item) => item.status !== "paid" && !item.overdue && item.remaining > 0).length;
  const visiblePayments = paymentFilter === "overdue"
    ? payments.filter((item) => item.overdue && item.remaining > 0)
    : paymentFilter === "open"
      ? payments.filter((item) => item.status !== "paid" && !item.overdue && item.remaining > 0)
      : payments;
  const hasOverdue = overdueCount > 0;

  return (
    <section className="space-y-5 rounded-[24px] border border-[#00a8c4]/30 bg-[#18181f] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3ec8dc]">Müşteri profili</p>
          <h3 className="mt-2 text-[20px] font-black">{profile.customer.company_name}</h3>
          <p className="mt-1 text-[11px] text-white/50">{profile.customer.contact_name} · {profile.customer.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusDot kind={siteDotKind(profile.customer.site_status, profile.customer.site_error)} />
            {hasOverdue ? <StatusDot kind={paymentDotKind("unpaid", true)} label="Gecikmiş" /> : Number(summary.remaining || 0) > 0 ? <StatusDot kind={paymentDotKind("unpaid", false)} label="Bakiye" /> : <StatusDot kind={paymentDotKind("paid", false)} label="Temiz" />}
          </div>
          <AdminNapOpsBar
            companyName={profile.customer.company_name}
            phone={profile.customer.site_phone || profile.customer.phone || ""}
            waPhone={profile.customer.phone || profile.customer.site_phone || ""}
            address={profile.customer.site_address || ""}
            hours={profile.customer.site_hours || ""}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={busy} onClick={() => void enterCustomerPortal()} className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a8c4] px-3 py-2 text-[10px] font-black text-white disabled:opacity-50">
            <ExternalLink className="h-3.5 w-3.5" /> Panele gir
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/15 px-3 py-2 text-[10px] font-black text-white/60">Kapat</button>
        </div>
      </div>
      {notice && <p className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-[11px] font-bold text-cyan-100">{notice}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[["Toplam", formatTry(summary.total)], ["Ödendi", formatTry(summary.paid)], ["Ödenmedi", formatTry(summary.unpaid)]].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-black/25 p-3"><p className="text-[8px] text-white/40">{label}</p><p className="mt-1 text-[13px] font-black">{value}</p></div>
        ))}
        <div className={`rounded-xl p-3 ${hasOverdue ? "border border-rose-300/30 bg-rose-950/30" : "bg-black/25"}`}>
          <p className="text-[8px] text-white/40">Kalan</p>
          <p className={`mt-1 text-[13px] font-black ${hasOverdue ? "text-rose-200" : ""}`}>{formatTry(summary.remaining)}</p>
          {hasOverdue && Number(summary.penalty || 0) > 0 ? <p className="mt-1 text-[9px] font-black text-rose-300">CEZA %15 dahil · {overdueCount} satır</p> : null}
        </div>
        <button type="button" onClick={() => setPaymentFilter(hasOverdue ? "overdue" : "open")} className={`rounded-xl p-3 text-left ${hasOverdue ? "border border-rose-300/30 bg-rose-950/30" : "bg-black/25"}`}>
          <p className="text-[8px] text-white/40">Takip</p>
          <p className="mt-1 text-[13px] font-black">{overdueCount}<span className="text-[10px] font-bold text-white/40"> / {openCount}</span></p>
          <p className="mt-1 text-[9px] font-bold text-white/45">Gecikmiş / açık dönem</p>
        </button>
      </div>

      <form onSubmit={saveEdit} className="grid gap-3 md:grid-cols-2">
        {[["Firma", "companyName"], ["Yetkili", "contactName"], ["E-posta", "email"]].map(([label, key]) => (
          <label key={key} className={labelClass}>{label}<input required value={edit[key as "companyName" | "contactName" | "email"]} onChange={(event) => setEdit({ ...edit, [key]: event.target.value })} className={fieldClass} /></label>
        ))}
        <label className={labelClass}>Telefon<input value={edit.phone} onChange={(event) => setEdit({ ...edit, phone: sanitizePhoneInput(event.target.value) })} className={fieldClass} /></label>
        <label className={labelClass}>Paket<select value={edit.packageId} onChange={(event) => setEdit({ ...edit, packageId: event.target.value })} className={fieldClass}><option value="">Atanmadı</option>{PORTAL_PACKAGE_IDS.map((id) => <option key={id} value={id}>{packageLabel(id)}</option>)}</select></label>
        <label className={labelClass}>Site durumu<select value={edit.siteStatus} onChange={(event) => setEdit({ ...edit, siteStatus: event.target.value as SiteStatus })} className={fieldClass}>{Object.entries(SITE_STATUS_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-white/50"><input type="checkbox" checked={edit.siteError} onChange={(event) => setEdit({ ...edit, siteError: event.target.checked })} /> Sorun / hata ışığı</label>
        <label className={`md:col-span-2 ${labelClass}`}>Site adresi<input value={edit.websiteUrl} onChange={(event) => setEdit({ ...edit, websiteUrl: event.target.value })} className={fieldClass} /></label>
        <label className={labelClass}>SSL<select value={edit.sslStatus} onChange={(event) => setEdit({ ...edit, sslStatus: event.target.value })} className={fieldClass}><option value="active">SSL açık</option><option value="pending">SSL bekleniyor</option><option value="unknown">SSL durumu yok</option></select></label>
        <label className={labelClass}>Son yedek<input type="date" value={edit.lastBackupAt} onChange={(event) => setEdit({ ...edit, lastBackupAt: event.target.value })} className={fieldClass} /></label>
        <label className={labelClass}>Son güncelleme<input type="date" value={edit.lastUpdateAt} onChange={(event) => setEdit({ ...edit, lastUpdateAt: event.target.value })} className={fieldClass} /></label>
        <p className="md:col-span-2 text-[10px] text-white/45">Müşteri panelindeki “Son güncelleme” çipi; telefon kaydı bu tarihi oynatmaz.</p>
        <p className="md:col-span-2 text-[10px] text-white/45">Müşteri panelindeki SSL/yedek çipi ve uyarı buradan gelir; canlı tarayıcı taraması yok.</p>
        <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black disabled:opacity-50"><Save className="h-4 w-4" /> Kaydı güncelle</button>
      </form>

      <form onSubmit={savePassword} className="grid gap-3 rounded-2xl border border-white/10 p-4 md:grid-cols-[1fr_auto]">
        <label className={labelClass}>Yeni müşteri şifresi<input required minLength={8} maxLength={128} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} /></label>
        <button disabled={busy} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[11px] font-black text-white/80 disabled:opacity-50"><KeyRound className="h-4 w-4" /> Şifreyi ata</button>
      </form>

      <form onSubmit={(event) => void saveAdsAccounts(event)} className="rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Megaphone className="h-4 w-4 text-[#70dce9]" aria-hidden="true" />
          <h4 className="text-[14px] font-black">Reklam hesapları</h4>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black text-white/60">canlı API kapalı</span>
        </div>
        <p className="mt-1 text-[10px] text-white/45">Yalnızca hesap ID’si kaydı. Google Ads / Meta Marketing API çağrılmaz; harcama uydurulmaz.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className={labelClass}>Google Ads Customer ID
            <input
              value={adsAccounts.googleAdsCustomerId}
              onChange={(event) => setAdsAccounts({ ...adsAccounts, googleAdsCustomerId: event.target.value })}
              placeholder="123-456-7890"
              inputMode="numeric"
              autoComplete="off"
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>Meta Ad Account ID
            <input
              value={adsAccounts.metaAdAccountId}
              onChange={(event) => setAdsAccounts({ ...adsAccounts, metaAdAccountId: event.target.value })}
              placeholder="act_1234567890"
              autoComplete="off"
              className={fieldClass}
            />
          </label>
        </div>
        <button disabled={busy} className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black disabled:opacity-50">
          <Save className="h-4 w-4" /> Kaydet
        </button>
        <p className="mt-2 text-[9px] font-bold text-white/35">{ADS_BOUND_NO_API_DETAIL}</p>
      </form>

      <section className="rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-[#70dce9]" aria-hidden="true" />
          <h4 className="text-[14px] font-black">Müşteri panel duyuruları</h4>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black text-white/60">{announcements.length} aktif</span>
        </div>
        <p className="mt-1 text-[10px] text-white/45">Üst bantta kayan kampanya / duyuru metinleri. Müşteriye özel veya tüm müşterilere (global) gösterilir.</p>
        <form onSubmit={(event) => void addAnnouncement(event)} className="mt-3 grid gap-3 md:grid-cols-2">
          <label className={labelClass}>Başlık<input required value={announcementForm.title} onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })} className={fieldClass} /></label>
          <label className={labelClass}>Ton<select value={announcementForm.tone} onChange={(event) => setAnnouncementForm({ ...announcementForm, tone: event.target.value })} className={fieldClass}><option value="promo">Kampanya</option><option value="info">Bilgi</option><option value="alert">Uyarı</option></select></label>
          <label className={`md:col-span-2 ${labelClass}`}>Metin<textarea required rows={2} value={announcementForm.body} onChange={(event) => setAnnouncementForm({ ...announcementForm, body: event.target.value })} className={fieldClass} /></label>
          <label className={labelClass}>Bağlantı (opsiyonel)<input value={announcementForm.linkUrl} onChange={(event) => setAnnouncementForm({ ...announcementForm, linkUrl: event.target.value })} placeholder="https://..." className={fieldClass} /></label>
          <label className="flex items-center gap-2 self-end text-[10px] font-black uppercase tracking-wide text-white/50"><input type="checkbox" checked={announcementForm.global} onChange={(event) => setAnnouncementForm({ ...announcementForm, global: event.target.checked })} /> Tüm müşterilere</label>
          <button disabled={busy} className="rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black md:col-span-2">Duyuru ekle</button>
        </form>
        <div className="mt-4 space-y-2">
          {announcements.length ? announcements.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/25 px-3 py-2">
              <div className="min-w-0">
                <p className="text-[12px] font-black">{item.title}{item.customerId == null ? " · Global" : ""}</p>
                <p className="text-[10px] text-white/45">{item.body}{item.linkUrl ? ` · ${item.linkUrl}` : ""}</p>
              </div>
              <button type="button" disabled={busy} onClick={() => void removeAnnouncement(item)} className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-1 text-[8px] font-black text-rose-200"><Trash2 className="h-3 w-3" /> Kaldır</button>
            </div>
          )) : (
            <p className="rounded-xl bg-black/25 px-3 py-3 text-[11px] font-bold text-white/45">Henüz duyuru yok.</p>
          )}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <form onSubmit={addCatalog} className="rounded-2xl border border-white/10 p-4">
          <h4 className="text-[14px] font-black">Ürün, hizmet, fatura</h4>
          <div className="mt-3 grid gap-3">
            <label className={labelClass}>Tür<select value={catalog.kind} onChange={(event) => setCatalog({ ...catalog, kind: event.target.value as CatalogKind })} className={fieldClass}>{Object.entries(CATALOG_KIND_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label className={labelClass}>Başlık<input required value={catalog.title} onChange={(event) => setCatalog({ ...catalog, title: event.target.value })} className={fieldClass} /></label>
            <label className={labelClass}>Açıklama<input value={catalog.details} onChange={(event) => setCatalog({ ...catalog, details: event.target.value })} className={fieldClass} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className={labelClass}>Tutar<input type="number" min="0" step="0.01" value={catalog.amount} onChange={(event) => setCatalog({ ...catalog, amount: event.target.value })} className={fieldClass} /></label>
              <label className={labelClass}>Adet<input type="number" min="1" step="1" value={catalog.quantity} onChange={(event) => setCatalog({ ...catalog, quantity: event.target.value })} className={fieldClass} /></label>
            </div>
          </div>
          <button disabled={busy} className="mt-3 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black">Satır ekle</button>
          <div className="mt-4 space-y-2">
            {[...profile.products, ...profile.services, ...profile.invoices, ...(profile.extras || [])].map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl bg-black/25 px-3 py-2">
                <div>
                  <p className="text-[8px] font-black uppercase text-[#3ec8dc]">{CATALOG_KIND_LABELS[item.kind] || item.kind}{item.status === "draft" ? " · taslak" : item.status === "cancelled" ? " · iptal" : ""}</p>
                  <p className="text-[12px] font-black">{item.title}</p>
                  <p className="text-[10px] text-white/45">{item.quantity} adet · {money(item.amount)}</p>
                  {item.kind === "extra" && item.status === "draft" ? (
                    <div className="mt-2 flex gap-2">
                      <button type="button" disabled={busy} onClick={() => void decideExtraCatalog(item, true)} className="rounded-lg bg-[#00a8c4] px-2.5 py-1 text-[9px] font-black text-white">Onayla</button>
                      <button type="button" disabled={busy} onClick={() => void decideExtraCatalog(item, false)} className="rounded-lg border border-rose-300/25 px-2.5 py-1 text-[9px] font-black text-rose-200">Reddet</button>
                    </div>
                  ) : null}
                </div>
                <button type="button" onClick={() => void removeCatalog(item)} className="text-white/40 hover:text-white"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </form>

        <form onSubmit={savePayment} className="rounded-2xl border border-white/10 p-4">
          <h4 className="text-[14px] font-black">Aylık ödeme</h4>
          <div className="mt-3 grid gap-3">
            <label className={labelClass}>Dönem<input required type="month" value={payment.period} onChange={(event) => setPayment({ ...payment, period: event.target.value, startDate: `${event.target.value}-01` })} className={fieldClass} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className={labelClass}>Başlangıç<input required type="date" value={payment.startDate} onChange={(event) => setPayment({ ...payment, startDate: event.target.value, period: event.target.value.slice(0, 7) })} className={fieldClass} /></label>
              <label className={labelClass}>Bitiş / vade<input required type="date" value={payment.endDate} onChange={(event) => setPayment({ ...payment, endDate: event.target.value })} className={fieldClass} /></label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className={labelClass}>Tutar<input required type="number" min="0" step="0.01" value={payment.amount} onChange={(event) => setPayment({ ...payment, amount: event.target.value })} className={fieldClass} /></label>
              <label className={labelClass}>Ödenen<input type="number" min="0" step="0.01" value={payment.paidAmount} onChange={(event) => setPayment({ ...payment, paidAmount: event.target.value })} className={fieldClass} /></label>
            </div>
            <label className={labelClass}>Durum<select value={payment.status} onChange={(event) => setPayment({ ...payment, status: event.target.value as PaymentStatus })} className={fieldClass}>{Object.entries(PAYMENT_STATUS_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label className={labelClass}>Not<input value={payment.note} onChange={(event) => setPayment({ ...payment, note: event.target.value })} className={fieldClass} /></label>
          </div>
          <button disabled={busy} className="mt-3 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black">Ayı kaydet</button>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setPaymentFilter("all")} className={`rounded-full px-3 py-1.5 text-[10px] font-black ${paymentFilter === "all" ? "bg-[#00a8c4] text-white" : "bg-white/5 text-white/60"}`}>
              Tümü ({payments.length})
            </button>
            <button type="button" onClick={() => setPaymentFilter("overdue")} className={`rounded-full px-3 py-1.5 text-[10px] font-black ${paymentFilter === "overdue" ? "bg-rose-500 text-white" : "bg-white/5 text-white/60"}`}>
              Gecikmiş ({overdueCount})
            </button>
            <button type="button" onClick={() => setPaymentFilter("open")} className={`rounded-full px-3 py-1.5 text-[10px] font-black ${paymentFilter === "open" ? "bg-amber-500 text-[#071b22]" : "bg-white/5 text-white/60"}`}>
              Açık dönem ({openCount})
            </button>
            {hasOverdue ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void downloadOverdueInvoicePdfs()}
                className="inline-flex items-center gap-1 rounded-full border border-rose-300/40 bg-rose-500/15 px-3 py-1.5 text-[10px] font-black text-rose-100"
              >
                <Download className="h-3 w-3" /> Gecikmiş PDF ({overdueCount})
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-[9px] font-bold text-white/40">Kalan = ödenmeyen. Vade geçtiyse aynı satıra CEZA ×1,15; PDF’de Gör / İndir. Reklam tıklaması para değildir.</p>
          <div className="mt-4 space-y-2">
            {visiblePayments.length ? visiblePayments.map((item) => (
              <form key={`${item.id}-${item.amount}-${item.startDate}-${item.endDate}-${item.status}`} onSubmit={(event) => void savePaymentRow(event, item)} className={`rounded-xl p-3 ${item.overdue ? "border border-rose-300/30 bg-rose-950/25" : "bg-black/25"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-black">{item.period}</p>
                  <StatusDot kind={paymentDotKind(item.status, item.overdue)} label={item.overdue ? "Gecikmiş" : PAYMENT_STATUS_LABELS[item.status]} />
                </div>
                <p className="mt-1 text-[10px] text-white/50">{formatTry(item.paidAmount)} ödendi · {formatTry(item.remaining)} kalan{item.penalty ? ` · CEZA %15 ${formatTry(item.penalty)}` : ""}</p>
                <p className="mt-1 text-[9px] font-bold text-white/40">iyzico ref: {item.gatewayRef?.trim() ? item.gatewayRef : "—"}</p>
                {item.overdue ? <p className="mt-1 text-[10px] font-black text-rose-300">{item.daysOverdue} gün geçti · ödenmeyen {formatTry(item.unpaidBase || 0)} × 1,15 = {formatTry(item.remaining)}</p> : item.daysLeft != null ? <p className="mt-1 text-[9px] text-white/40">{item.daysLeft} gün kaldı</p> : null}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className={labelClass}>Başlangıç<input name="startDate" required type="date" defaultValue={item.startDate} className={fieldClass} /></label>
                  <label className={labelClass}>Bitiş<input name="endDate" required type="date" defaultValue={item.endDate} className={fieldClass} /></label>
                  <label className={labelClass}>Tutar<input name="amount" required type="number" min="0" step="0.01" defaultValue={item.amount} className={fieldClass} /></label>
                  <label className={labelClass}>Ödenen<input name="paidAmount" type="number" min="0" step="0.01" defaultValue={item.paidAmount} className={fieldClass} /></label>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button disabled={busy} className="rounded-full bg-[#00a8c4] px-2 py-1 text-[8px] font-black">Kaydet</button>
                  <button type="button" onClick={() => void markPayment(item, "paid")} className="rounded-full bg-emerald-400/10 px-2 py-1 text-[8px] font-black text-emerald-300">Ödendi</button>
                  <button type="button" onClick={() => void markPayment(item, "unpaid")} className="rounded-full bg-amber-400/10 px-2 py-1 text-[8px] font-black text-amber-200">Ödenmedi</button>
                  <button type="button" onClick={() => void markPayment(item, "remaining")} className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-black text-white/70">Kalan</button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void openInvoicePdf(item, "view")}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[8px] font-black text-[#70dce9]"
                  >
                    <FileText className="h-3 w-3" /> Gör
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void openInvoicePdf(item, "download")}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[8px] font-black text-[#70dce9]"
                  >
                    <Download className="h-3 w-3" /> İndir{item.overdue && item.remaining > 0 ? " · CEZA" : ""}
                  </button>
                  <button type="button" disabled={busy} onClick={() => void removePayment(item)} className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-1 text-[8px] font-black text-rose-200">
                    <Trash2 className="h-3 w-3" /> Sil
                  </button>
                </div>
              </form>
            )) : (
              <p className="rounded-xl bg-black/25 px-3 py-3 text-[11px] font-bold text-white/45">
                {paymentFilter === "overdue" ? "Gecikmiş ödeme yok." : paymentFilter === "open" ? "Açık dönem yok." : "Aylık ödeme satırı yok."}
                {paymentFilter !== "all" ? " Filtreyi Tümü yapın." : ""}
              </p>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 p-4">
        <h4 className="flex items-center gap-2 text-[14px] font-black"><CalendarClock className="h-4 w-4 text-[#00a8c4]" /> Yenilemeler</h4>
        <p className="mt-1 text-[9px] font-bold text-white/40">Alan adı, hosting, bakım, SSL, web tasarım, yazılım, reklam ve özel kodlama yenilemeleri. Panel-içi hatırlatma; e-posta/SMS gönderilmez.</p>
        <form onSubmit={addRenewal} className="mt-3 grid gap-3 md:grid-cols-2">
          <label className={labelClass}>Tür<select value={renewal.kind} onChange={(event) => setRenewal({ ...renewal, kind: event.target.value as RenewalKind })} className={fieldClass}>{RENEWAL_KINDS.map((kind) => <option key={kind} value={kind}>{RENEWAL_KIND_LABELS[kind]}</option>)}</select></label>
          <label className={labelClass}>Etiket<input value={renewal.label} onChange={(event) => setRenewal({ ...renewal, label: event.target.value })} placeholder="örn. site alan adı" className={fieldClass} /></label>
          <label className={labelClass}>Yenileme tarihi<input required type="date" value={renewal.renewDate} onChange={(event) => setRenewal({ ...renewal, renewDate: event.target.value })} className={fieldClass} /></label>
          <label className={labelClass}>Tutar (₺)<input type="number" min="0" step="0.01" value={renewal.amount} onChange={(event) => setRenewal({ ...renewal, amount: event.target.value })} className={fieldClass} /></label>
          <label className={`md:col-span-2 ${labelClass}`}>Not<input value={renewal.note} onChange={(event) => setRenewal({ ...renewal, note: event.target.value })} className={fieldClass} /></label>
          <button disabled={busy} className="rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black md:col-span-2">Yenileme ekle</button>
        </form>
        <div className="mt-4 space-y-2">
          {renewals.length ? renewals.map((item) => (
            <div key={item.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 ${item.status === "active" && item.bucket === "overdue" ? "border border-rose-300/30 bg-rose-950/25" : item.status === "active" && item.bucket === "due" ? "border border-amber-300/25 bg-amber-950/15" : "bg-black/25"}`}>
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase text-[#3ec8dc]">{RENEWAL_KIND_LABELS[item.kind]}</p>
                <p className="text-[12px] font-black">{item.label || RENEWAL_KIND_LABELS[item.kind]}</p>
                <p className="text-[10px] text-white/45">{formatRenewDate(item.renewDate)}{item.amount ? ` · ${formatTry(item.amount)}` : ""} · {item.status === "active" ? renewalCountdownLabel(item.daysLeft) : RENEWAL_STATUS_LABELS[item.status]}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                {item.status !== "done" ? <button type="button" disabled={busy} onClick={() => void setRenewalStatus(item, "done")} className="rounded-full bg-cyan-400/10 px-2 py-1 text-[8px] font-black text-cyan-200">Yenilendi</button> : null}
                {item.status !== "active" ? <button type="button" disabled={busy} onClick={() => void setRenewalStatus(item, "active")} className="rounded-full bg-emerald-400/10 px-2 py-1 text-[8px] font-black text-emerald-200">Aktif</button> : null}
                {item.status !== "cancelled" ? <button type="button" disabled={busy} onClick={() => void setRenewalStatus(item, "cancelled")} className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-black text-white/60">İptal</button> : null}
                <button type="button" disabled={busy} onClick={() => void removeRenewal(item)} className="text-white/40 hover:text-white"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          )) : (
            <p className="rounded-xl bg-black/25 px-3 py-3 text-[11px] font-bold text-white/45">Yenileme kaydı yok.</p>
          )}
        </div>
      </div>

      <form onSubmit={uploadContract} className="rounded-2xl border border-white/10 p-4">
        <h4 className="text-[14px] font-black">Sözleşme şablonları</h4>
        <p className="mt-1 text-[10px] text-white/45">Kütüphaneden seçin; imza ve Hatay360 onay damgası PDF’te aşağıdaki kutuya basılır. Her seferinde dosya yüklemeniz gerekmez.</p>
        <div className="mt-3 rounded-xl border border-cyan-300/20 bg-cyan-300/[.06] p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-[11px] font-black text-cyan-100">Otomatik müşteri sözleşmesi</p><p className="mt-1 text-[9px] text-white/45">Müşteri, paket, tutar ve uygun paketlerde domain bilgisi kayıtlı veriden doldurulur.</p></div>
            <button type="button" disabled={busy} onClick={() => void createAutomaticContract()} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-[10px] font-black text-[#071318] disabled:opacity-50"><FileText className="h-4 w-4" /> Sözleşme Oluştur</button>
          </div>
          {contractMissing.length ? <div className="mt-3 rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-[10px] font-bold text-amber-100">{contractMissing.map((field) => <p key={field}>Eksik bilgi: {field}</p>)}</div> : null}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className={labelClass}>Şablon
            <select value={templateId} onChange={(event) => {
              const next = templates.find((item) => String(item.id) === event.target.value);
              setTemplateId(event.target.value);
              applyTemplateFields(next || null);
            }} className={fieldClass}>
              <option value="">Seçin veya yeni yazın</option>
              {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <button type="button" disabled={busy} onClick={() => void assignTemplate()} className="mt-5 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black">Müşteriye ata</button>
          <button type="button" disabled={busy} onClick={() => void saveTemplate()} className="mt-5 rounded-xl border border-white/15 px-4 py-2.5 text-[11px] font-black">Şablonu kaydet</button>
          <button type="button" disabled={busy || !templateId} onClick={() => void removeTemplate()} className="mt-5 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-2.5 text-[11px] font-black text-rose-200">Şablonu kaldır</button>
        </div>
        <label className={`${labelClass} mt-3 block`}>Şablon adı<input value={templateName} onChange={(event) => setTemplateName(event.target.value)} className={fieldClass} /></label>
        <label className={`${labelClass} mt-3 block`}>Metin (HTML)<textarea rows={5} value={templateBody} onChange={(event) => setTemplateBody(event.target.value)} className={fieldClass} /></label>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-white/50">İmza / onay damgası kutusu (%)</p>
            <p className="mt-1 text-[10px] text-white/40">Önizlemeye tıklayınca kutu oraya taşınır. Onayda PDF’e “Imza + onay” damgası bu alana yazılır.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  ["X", "x", 12],
                  ["Y", "y", 78],
                  ["Genişlik", "w", 36],
                  ["Yükseklik", "h", 12],
                ] as const
              ).map(([label, key, fallback]) => (
                <label key={key} className={labelClass}>
                  {label}
                  <input
                    type="number"
                    min={2}
                    max={90}
                    step={0.5}
                    value={sigBox[key]}
                    onChange={(event) => setSigBox((prev) => ({ ...prev, [key]: clampSig(Number(event.target.value), fallback) }))}
                    className={fieldClass}
                  />
                </label>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSigBox({ x: 12, y: 78, w: 36, h: 12 })}
                className="rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black text-white/60"
              >
                Alt sol (varsayılan)
              </button>
              <button
                type="button"
                onClick={() => setSigBox({ x: 52, y: 78, w: 36, h: 12 })}
                className="rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black text-white/60"
              >
                Alt sağ
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Damga kutusu önizlemesi — tıklayarak konumlayın"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const pctX = ((event.clientX - rect.left) / rect.width) * 100;
              const pctY = ((event.clientY - rect.top) / rect.height) * 100;
              setSigBox((prev) => ({
                ...prev,
                x: clampSig(pctX - prev.w / 2, prev.x),
                y: clampSig(pctY - prev.h / 2, prev.y),
              }));
            }}
            className="relative mx-auto aspect-[210/297] w-full max-w-[180px] overflow-hidden rounded-xl border border-white/15 bg-[#f4f7f8] text-left shadow-inner"
          >
            <span className="absolute left-2 top-2 text-[7px] font-black uppercase tracking-wide text-[#64748b]">A4 önizleme</span>
            <span className="absolute left-2 right-2 top-6 h-1 rounded bg-[#cbd5e1]/80" />
            <span className="absolute left-2 right-6 top-9 h-1 rounded bg-[#e2e8f0]" />
            <span className="absolute left-2 right-4 top-12 h-1 rounded bg-[#e2e8f0]" />
            <span
              className="absolute rounded border-2 border-dashed border-[#00a8c4] bg-[#00a8c4]/15"
              style={{ left: `${sigBox.x}%`, top: `${sigBox.y}%`, width: `${sigBox.w}%`, height: `${sigBox.h}%` }}
            >
              <span className="absolute inset-x-0 top-0 truncate px-0.5 text-center text-[6px] font-black leading-tight text-[#087f98]">İmza + damga</span>
            </span>
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className={labelClass}>Başlık<input value={contractTitle} onChange={(event) => setContractTitle(event.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Dosya (isteğe bağlı)<input name="contract" type="file" accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg" className={`${fieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#00a8c4] file:px-3 file:py-1 file:text-[10px] file:font-black file:text-white`} /></label>
          <button disabled={busy} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black"><Upload className="h-4 w-4" /> Yükle</button>
        </div>
        <div className="mt-4 space-y-3">
          {groupedContracts.map((group) => (
            <article key={group[0].familyId} className="rounded-xl bg-black/25 p-3">
              {group.map((item) => (
                <div key={item.id} className="border-t border-white/5 py-2 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[12px] font-black">{item.title || item.fileName} · v{item.version}</p>
                      <p className="text-[9px] text-white/45">{item.current ? "Güncel" : "Önceki"} · {item.uploadedBy === "customer" ? "Müşteri" : "Admin"} · {item.signStatus === "approved" ? "Onaylandı" : item.signStatus === "rejected" ? "Reddedildi" : item.signStatus === "signed" ? "İmzalandı" : "Bekliyor"}</p>
                      {item.signReason ? <p className="mt-1 text-[10px] text-amber-200">{item.signReason}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" onClick={() => void openContractFile(`/api/admin/customers/${customerId}/contracts/${item.id}/file`).catch((error) => setNotice(error instanceof Error ? error.message : "Açılamadı."))} className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-black text-white/70"><FileText className="mr-1 inline h-3 w-3" /> Gör</button>
                      <button type="button" onClick={() => void openContractFile(`/api/admin/customers/${customerId}/contracts/${item.id}/file?download=1`, item.fileName).catch((error) => setNotice(error instanceof Error ? error.message : "İndirilemedi."))} className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-black text-white/70"><Download className="mr-1 inline h-3 w-3" /> İndir</button>
                      {!item.current && <button type="button" onClick={() => void restoreContract(item)} className="rounded-full bg-[#00a8c4]/20 px-2 py-1 text-[8px] font-black text-[#7ee7f3]"><RotateCcw className="mr-1 inline h-3 w-3" /> Geri yükle</button>}
                    </div>
                  </div>
                  {item.current ? (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex flex-wrap gap-2">
                        <input value={reviewReason[item.id] || ""} onChange={(event) => setReviewReason({ ...reviewReason, [item.id]: event.target.value })} placeholder="Red gerekçesi" className="min-w-[180px] flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-white" />
                        <button type="button" onClick={() => void reviewContract(item, "approved")} className="rounded-full bg-emerald-500/20 px-2 py-1 text-[8px] font-black text-emerald-200">
                          {item.signStatus === "signed" || item.hasSignature ? "Onayla + damgala" : "Onayla"}
                        </button>
                        <button type="button" onClick={() => void reviewContract(item, "rejected")} className="rounded-full bg-rose-500/20 px-2 py-1 text-[8px] font-black text-rose-200">Reddet</button>
                      </div>
                      {(item.signStatus === "signed" || item.hasSignature) && item.signStatus !== "approved" ? (
                        <p className="text-[9px] font-bold text-emerald-200/70">Onayda yeni PDF sürümü üretilir; imza kutusuna Hatay360 onay damgası basılır.</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </article>
          ))}
        </div>
      </form>

      {project ? (
        <section className="rounded-2xl border border-white/10 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Milestone className="h-4 w-4 text-[#70dce9]" aria-hidden="true" />
            <h4 className="text-[14px] font-black">Proje Aşaması</h4>
            <span className="rounded-full border border-[#00a8c4]/30 bg-[#00a8c4]/15 px-2 py-0.5 text-[9px] font-black text-[#7ee7f3]">{project.stageLabel}</span>
            <span className="text-[9px] font-bold text-white/40">{project.stageIndex + 1} / {project.totalStages}</span>
            {project.stage === "onay" && Number(project.pendingApprovals || 0) > 0 ? (
              <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[9px] font-black text-amber-200">{project.pendingApprovals} onay bekliyor</span>
            ) : null}
          </div>

          <ol className="mt-3 flex flex-wrap gap-2" role="list">
            {project.stages.map((stage, index) => (
              <li
                key={stage.key}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black ${
                  stage.done ? "bg-[#00a8c4]/20 text-[#7ee7f3]" : stage.current ? "bg-[#00a8c4] text-white" : "bg-white/5 text-white/45"
                }`}
              >
                {stage.done ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : <span>{index + 1}</span>}
                {stage.label}
              </li>
            ))}
          </ol>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <label className={labelClass}>Aşama
              <select value={stageChoice} onChange={(event) => setStageChoice(event.target.value)} className={fieldClass}>
                {project.stages.map((stage) => <option key={stage.key} value={stage.key}>{stage.label}</option>)}
              </select>
            </label>
            <label className={labelClass}>Not (müşteri görür)<input value={stageNote} onChange={(event) => setStageNote(event.target.value)} placeholder="Örn. Tasarım onaya gönderildi" className={fieldClass} /></label>
            <button type="button" disabled={busy} onClick={() => void moveStage(stageChoice, stageNote)} className="mt-5 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black disabled:opacity-50">Aşamayı kaydet</button>
          </div>
          {project.stageIndex < project.totalStages - 1 ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void moveStage(project.stages[project.stageIndex + 1].key, stageNote)}
              className="mt-3 rounded-xl border border-white/15 px-4 py-2 text-[11px] font-black text-white/80 disabled:opacity-50"
            >
              Sonraki aşama → {project.stages[project.stageIndex + 1].label}
            </button>
          ) : null}

          <div className="mt-4 space-y-2">
            {projectEvents.length ? (
              projectEvents.map((item) => (
                <div key={item.id} className="rounded-xl bg-black/25 px-3 py-2">
                  <p className="text-[11px] font-black">{item.fromLabel ? `${item.fromLabel} → ` : ""}{item.toLabel}</p>
                  <p className="text-[9px] text-white/45">{item.actor} · {new Date(item.createdAt).toLocaleString("tr-TR")}{item.note ? ` · ${item.note}` : ""}</p>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-white/40">Henüz aşama geçmişi yok.</p>
            )}
          </div>
        </section>
      ) : null}

      <form onSubmit={sendApproval} className="rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-[#70dce9]" aria-hidden="true" />
          <h4 className="text-[14px] font-black">Onaya Gönder</h4>
          {approvals.filter((item) => item.status === "pending").length ? (
            <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[9px] font-black text-amber-200">{approvals.filter((item) => item.status === "pending").length} bekliyor</span>
          ) : null}
        </div>
        <p className="mt-1 text-[10px] text-white/45">Görsel, dosya veya tasarım notunu müşteri paneline gönderin. Müşteri “Onaylıyorum” ya da “Revize İstiyorum” ile yanıtlar.</p>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr]">
          <label className={labelClass}>Başlık<input value={approvalForm.title} onChange={(event) => setApprovalForm((prev) => ({ ...prev, title: event.target.value }))} className={fieldClass} /></label>
          <label className={labelClass}>Tür
            <select value={approvalForm.kind} onChange={(event) => setApprovalForm((prev) => ({ ...prev, kind: event.target.value as ProfileApproval["kind"] }))} className={fieldClass}>
              <option value="image">Görsel</option>
              <option value="file">Dosya (PDF)</option>
              <option value="text">Metin / not</option>
            </select>
          </label>
        </div>
        <label className={`${labelClass} mt-3 block`}>Açıklama<textarea rows={2} value={approvalForm.description} onChange={(event) => setApprovalForm((prev) => ({ ...prev, description: event.target.value }))} className={fieldClass} /></label>

        {approvalForm.kind === "text" ? (
          <label className={`${labelClass} mt-3 block`}>Metin içeriği<textarea rows={4} value={approvalForm.bodyText} onChange={(event) => setApprovalForm((prev) => ({ ...prev, bodyText: event.target.value }))} className={fieldClass} placeholder="Müşterinin onaylayacağı metni / tasarım notunu yazın." /></label>
        ) : (
          <label className={`${labelClass} mt-3 block`}>Dosya ({approvalForm.kind === "image" ? "JPG / PNG / WebP" : "PDF veya görsel"})<input name="approvalFile" type="file" accept={approvalForm.kind === "image" ? "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" : ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"} className={`${fieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#00a8c4] file:px-3 file:py-1 file:text-[10px] file:font-black file:text-white`} /></label>
        )}

        <button disabled={busy} className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black"><Upload className="h-4 w-4" /> Onaya gönder</button>

        <div className="mt-4 space-y-2">
          {approvals.length ? (
            approvals.map((item) => (
              <article key={item.id} className="rounded-xl bg-black/25 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[12px] font-black">
                      {item.kind === "image" ? <ImageIcon className="h-3 w-3 text-white/50" /> : item.kind === "text" ? <MessageSquareText className="h-3 w-3 text-white/50" /> : <FileText className="h-3 w-3 text-white/50" />}
                      {item.title}
                    </p>
                    <p className="text-[9px] text-white/45">
                      {item.status === "approved" ? "Onaylandı" : item.status === "revision" ? "Revize istendi" : `Bekliyor · ${item.waitingDays} gün`}
                      {item.respondedAt ? ` · ${new Date(item.respondedAt).toLocaleDateString("tr-TR")}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.hasFile ? (
                      <button type="button" onClick={() => void openContractFile(item.fileUrl).catch((error) => setNotice(error instanceof Error ? error.message : "Açılamadı."))} className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-black text-white/70"><FileText className="mr-1 inline h-3 w-3" /> Gör</button>
                    ) : null}
                    {item.status === "pending" ? (
                      <button type="button" disabled={busy} onClick={() => void remindApproval(item)} className="rounded-full bg-[#00a8c4]/20 px-2 py-1 text-[8px] font-black text-[#7ee7f3]">Hatırlat</button>
                    ) : null}
                  </div>
                </div>
                {item.status === "revision" && item.feedbackText ? (
                  <p className="mt-2 rounded-lg border border-rose-400/25 bg-rose-950/25 px-2 py-1.5 text-[10px] text-rose-100">Revize notu: {item.feedbackText}</p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-[10px] text-white/40">Bu müşteriye henüz onay gönderilmedi.</p>
          )}
        </div>
      </form>

      <form onSubmit={sendQuote} className="rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <PenLine className="h-4 w-4 text-[#70dce9]" aria-hidden="true" />
          <h4 className="text-[14px] font-black">Teklif gönder</h4>
          {quotes.filter((item) => item.status === "pending").length ? (
            <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[9px] font-black text-amber-200">{quotes.filter((item) => item.status === "pending").length} bekliyor</span>
          ) : null}
        </div>
        <p className="mt-1 text-[10px] text-white/45">PDF veya görsel teklifi müşteri paneline gönderin. Müşteri ad-soyad ve onay kutusu ile kayıtlı kabul üretir.</p>
        <p className="mt-2 text-[10px] font-bold leading-relaxed text-amber-200/90">{QUOTE_LEGAL_NOTE}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUOTE_TEMPLATES.map((tpl) => (
            <button key={tpl.key} type="button" disabled={busy} onClick={() => void sendQuoteTemplate(tpl.key)} className="rounded-full border border-[#00a8c4]/40 bg-[#00a8c4]/15 px-3 py-1.5 text-[9px] font-black text-[#7ee7f3]">
              {tpl.name}
            </button>
          ))}
        </div>

        <label className={`${labelClass} mt-3 block`}>Başlık<input value={quoteForm.title} onChange={(event) => setQuoteForm({ title: event.target.value })} className={fieldClass} placeholder="Boş bırakılırsa şablon adı kullanılır" /></label>
        <label className={`${labelClass} mt-3 block`}>Dosya (PDF veya görsel)<input name="quoteFile" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" className={`${fieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#00a8c4] file:px-3 file:py-1 file:text-[10px] file:font-black file:text-white`} /></label>
        <button disabled={busy} className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black"><Upload className="h-4 w-4" /> Teklif gönder</button>

        <div className="mt-4 space-y-2">
          {quotes.length ? (
            quotes.map((item) => (
              <article key={item.id} className="rounded-xl bg-black/25 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[12px] font-black">
                      <FileText className="h-3 w-3 text-white/50" />
                      {item.title}
                    </p>
                    <p className="text-[9px] text-white/45">
                      {item.status === "accepted" ? `Kabul edildi${item.acceptName ? ` · ${item.acceptName}` : ""}` : item.status === "withdrawn" ? "Geri çekildi" : `Bekliyor · ${item.waitingDays} gün`}
                      {item.acceptedAt ? ` · ${new Date(item.acceptedAt).toLocaleDateString("tr-TR")}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.hasFile ? (
                      <button type="button" onClick={() => void openContractFile(item.fileUrl).catch((error) => setNotice(error instanceof Error ? error.message : "Açılamadı."))} className="rounded-full border border-white/10 px-2 py-1 text-[8px] font-black text-white/70"><FileText className="mr-1 inline h-3 w-3" /> Gör</button>
                    ) : null}
                    {item.status === "pending" ? (
                      <button type="button" disabled={busy} onClick={() => void withdrawQuote(item)} className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-black text-white/70"><Undo2 className="mr-1 inline h-3 w-3" /> Geri çek</button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-[10px] text-white/40">Bu müşteriye henüz teklif gönderilmedi.</p>
          )}
        </div>
      </form>

      <section className="rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Users className="h-4 w-4 text-[#70dce9]" aria-hidden="true" />
          <h4 className="text-[14px] font-black">Kullanıcılar &amp; Roller</h4>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black text-white/60">{subUsers.length} alt kullanıcı</span>
        </div>
        <p className="mt-1 text-[10px] text-white/45">Firma sahibi (ana hesap) her zaman tam yetkilidir. Sınırlı kullanıcılar fatura, ödeme, sözleşme, yenileme ve güvenlik alanlarını göremez. Şifre manuel belirlenir; e-posta daveti gönderilmez.</p>
        <form onSubmit={addSubUser} className="mt-3 grid gap-3 md:grid-cols-2">
          <label className={labelClass}>Ad soyad<input value={subUserForm.name} onChange={(event) => setSubUserForm({ ...subUserForm, name: event.target.value })} className={fieldClass} /></label>
          <label className={labelClass}>E-posta (giriş)<input required type="email" value={subUserForm.email} onChange={(event) => setSubUserForm({ ...subUserForm, email: event.target.value })} className={fieldClass} /></label>
          <label className={labelClass}>Rol<select value={subUserForm.role} onChange={(event) => setSubUserForm({ ...subUserForm, role: event.target.value as "full" | "limited" })} className={fieldClass}><option value="limited">Sınırlı</option><option value="full">Tam Yetkili</option></select></label>
          <label className={labelClass}>Şifre (en az 10)<input required minLength={10} maxLength={128} type="text" value={subUserForm.password} onChange={(event) => setSubUserForm({ ...subUserForm, password: event.target.value })} className={fieldClass} /></label>
          <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black md:col-span-2 disabled:opacity-50"><UserPlus className="h-4 w-4" /> Alt kullanıcı ekle</button>
        </form>
        <div className="mt-4 space-y-2">
          {subUsers.length ? subUsers.map((user) => (
            <div key={user.id} className="rounded-xl bg-black/25 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[12px] font-black">{user.name || user.email}</p>
                  <p className="text-[10px] text-white/45">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${user.role === "full" ? "bg-[#00a8c4]/20 text-[#7ee7f3]" : "bg-white/10 text-white/60"}`}>{user.role === "full" ? "Tam" : "Sınırlı"}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${user.status === "active" ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200"}`}>{user.status === "active" ? "Aktif" : "Pasif"}</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <select value={user.role} disabled={busy} onChange={(event) => void patchSubUser(user.id, { role: event.target.value }, "Rol güncellendi.")} className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] font-black text-white outline-none">
                  <option value="limited">Sınırlı</option>
                  <option value="full">Tam Yetkili</option>
                </select>
                <button type="button" disabled={busy} onClick={() => void patchSubUser(user.id, { status: user.status === "active" ? "disabled" : "active" }, user.status === "active" ? "Kullanıcı pasifleştirildi." : "Kullanıcı aktifleştirildi.")} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[8px] font-black text-white/70"><ShieldCheck className="h-3 w-3" /> {user.status === "active" ? "Pasifleştir" : "Aktifleştir"}</button>
                <button type="button" disabled={busy} onClick={() => void resetSubUserPassword(user.id)} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[8px] font-black text-[#70dce9]"><KeyRound className="h-3 w-3" /> Şifre sıfırla</button>
                <button type="button" disabled={busy} onClick={() => void removeSubUser(user.id)} className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-1 text-[8px] font-black text-rose-200"><Trash2 className="h-3 w-3" /> Sil</button>
              </div>
            </div>
          )) : (
            <p className="rounded-xl bg-black/25 px-3 py-3 text-[11px] font-bold text-white/45">Bu firmada alt kullanıcı yok.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Search className="h-4 w-4 text-[#70dce9]" aria-hidden="true" />
          <h4 className="text-[14px] font-black">SEO kelimeleri</h4>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black text-white/60">{seoKeywords.length} kelime</span>
        </div>
        <p className="mt-1 text-[10px] text-white/45">Örn. “hatay web tasarım”. Konum uydurulmaz; Google API bağlanınca haftalık snapshot dolar.</p>
        <form onSubmit={(event) => void addSeoKeyword(event)} className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className={labelClass}>Kelime
            <input
              required
              minLength={2}
              maxLength={80}
              value={seoKeyword}
              onChange={(event) => setSeoKeyword(event.target.value)}
              placeholder="hatay web tasarım"
              className={fieldClass}
            />
          </label>
          <button disabled={busy} className="mt-5 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black disabled:opacity-50">Ekle</button>
        </form>
        <p className="mt-2 text-[9px] font-bold text-white/35">{SEO_RANK_WAIT_MESSAGE}</p>
        <form onSubmit={(event) => void saveSeoScore(event)} className="mt-3 grid gap-3 rounded-xl border border-white/10 bg-black/20 p-3 md:grid-cols-3">
          <label className={labelClass}>SEO puan (0–100)<input type="number" min="0" max="100" value={seoScoreForm.scoreOverride} onChange={(event) => setSeoScoreForm({ ...seoScoreForm, scoreOverride: event.target.value })} placeholder="Otomatik" className={fieldClass} /></label>
          <label className={labelClass}>Etiket<input value={seoScoreForm.scoreLabel} onChange={(event) => setSeoScoreForm({ ...seoScoreForm, scoreLabel: event.target.value })} placeholder="Güçlü görünürlük" className={fieldClass} /></label>
          <label className={labelClass}>Not<input value={seoScoreForm.scoreNote} onChange={(event) => setSeoScoreForm({ ...seoScoreForm, scoreNote: event.target.value })} placeholder="Müşteri panelinde görünür" className={fieldClass} /></label>
          <button disabled={busy} className="rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black md:col-span-3">SEO puanını kaydet</button>
        </form>
        <div className="mt-4 space-y-2">
          {seoKeywords.length ? seoKeywords.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/25 px-3 py-2">
              <div className="min-w-0">
                <p className="text-[12px] font-black">{item.keyword}</p>
                <p className="text-[10px] text-white/45">Konum: {item.position ?? "—"}{item.locale ? ` · ${item.locale}` : ""}</p>
              </div>
              <button type="button" disabled={busy} onClick={() => void removeSeoKeyword(item.id)} className="text-white/40 hover:text-white" aria-label="Kelimeyi sil">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )) : (
            <p className="rounded-xl bg-black/25 px-3 py-3 text-[11px] font-bold text-white/45">Takip kelimesi yok.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <History className="h-4 w-4 text-[#70dce9]" aria-hidden="true" />
          <h4 className="text-[14px] font-black">Son Aktiviteler</h4>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black text-white/60">son {auditRows.length}</span>
        </div>
        <p className="mt-1 text-[10px] text-white/45">Bu firmaya ait giriş, fatura, dosya, onay ve yönetim işlemleri. Tümü için üst menüde “Aktivite Kaydı”.</p>
        <div className="mt-3 space-y-2">
          {auditRows.length ? auditRows.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/25 px-3 py-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[8px] font-black ${auditActionTone(row.action)}`}>{auditActionLabel(row.action)}</span>
                  <p className="text-[11px] font-black text-white">{row.actorLabel || auditActorLabel(row.actorType)}</p>
                </div>
                <p className="mt-1 text-[9px] text-white/45">{auditActorLabel(row.actorType)}{row.target ? ` · ${row.target}` : ""}{row.ip ? ` · ${row.ip}` : ""}</p>
              </div>
              <p className="shrink-0 text-[9px] font-bold tabular-nums text-white/40">{formatAuditTime(row.createdAt)}</p>
            </div>
          )) : (
            <p className="rounded-xl bg-black/25 px-3 py-3 text-[11px] font-bold text-white/45">Bu firma için aktivite kaydı yok.</p>
          )}
        </div>
      </section>

      <p className="text-[9px] text-white/35">Hesap durumu: {ACCOUNT_STATUS_LABELS[profile.customer.status as keyof typeof ACCOUNT_STATUS_LABELS] || profile.customer.status}</p>
    </section>
  );
}
