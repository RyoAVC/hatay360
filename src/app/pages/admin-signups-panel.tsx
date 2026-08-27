import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Download, FileSearch, Handshake, Megaphone, MessageCircle, Phone, RefreshCw, Search, UserPlus } from "lucide-react";
import { EmptyRow } from "../components/empty-row";
import { StatusDot } from "../components/status-dot";
import { writeAdminCustomerDraft } from "../lib/admin-customer-draft";
import { apiRequest } from "../lib/api";
import { leadDotKind, partnerDotKind } from "../lib/ops-status";
import type { OpsAlertTarget } from "../components/admin-ops-alerts";

type LeadKind = "callback" | "maps" | "new_customer" | "partner" | "partner_referral" | string;
type Lead = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  service: string;
  source_path: string;
  status: "new" | "contacted" | "won" | "closed";
  kind?: LeadKind;
  sector?: string;
  district?: string;
  address?: string;
  hours?: string;
  website?: string;
  notes?: string;
  sms_ok?: number;
  partner_id?: number | null;
  referral_code?: string;
  referred_by_customer_id?: number | null;
  referral_rewarded?: number;
  referrer_company_name?: string | null;
  created_at: string;
};

const SMS_TEMPLATE_DEFAULT =
  "Merhaba {ad}, Hatay360 {ilce} ekibinden yazıyoruz. Web / harita / reklam için kısa bir görüşme ayarlayalım mı? İstemiyorsanız yazın: DUR";

function fillSmsTemplate(template: string, lead: Pick<Lead, "name" | "district" | "sector">) {
  return template
    .split("{ad}").join(lead.name?.trim() || "yetkili")
    .split("{ilce}").join(lead.district?.trim() || "Hatay")
    .split("{sektor}").join(lead.sector?.trim() || "işletme");
}

function uniqueSmsPhones(leads: Lead[]) {
  const seen = new Set<string>();
  const phones: string[] = [];
  for (const lead of leads) {
    if (lead.sms_ok === 0) continue;
    const phone = String(lead.phone || "").trim();
    const digits = phone.replace(/\D/g, "");
    if (!digits || seen.has(digits)) continue;
    seen.add(digits);
    phones.push(phone);
  }
  return phones;
}
type Partner = {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  website: string;
  notes: string;
  commission_rate: number;
  status: "pending" | "active" | "paused";
  created_at: string;
};

const KIND_LABELS: Record<string, string> = {
  callback: "Sizi arayalım",
  maps: "Harita kaydı",
  new_customer: "Yeni müşteri",
  partner: "Bayi",
  partner_referral: "Bayi yönlendirme",
};
const STATUS_LABELS = { new: "Yeni", contacted: "Arandı", won: "Müşteri oldu", closed: "Kapatıldı" };
const PARTNER_STATUS = { pending: "Onay bekliyor", active: "Aktif", paused: "Duraklatıldı" };
const APPROVABLE_KINDS = new Set(["new_customer", "maps", "callback", "partner_referral"]);

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function leadNeedsApprove(lead: Lead) {
  return APPROVABLE_KINDS.has(lead.kind || "callback") && lead.status !== "won" && lead.status !== "closed";
}

/** TR telefonunu son 10 haneye indir; boş olanları atla. */
function normalizePhone10(phone: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("90") && digits.length === 12) return digits.slice(-10);
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/** İsim, telefon, sektör, ilçe, not (hesaplayıcı / paket bağlamı) üzerinde arama. */
function leadMatchesQuery(lead: Lead, raw: string) {
  const q = raw.trim().toLocaleLowerCase("tr-TR");
  if (!q) return true;
  const digits = q.replace(/\D/g, "");
  const hay = [
    lead.name,
    lead.email,
    lead.phone,
    lead.service,
    lead.sector,
    lead.district,
    lead.address,
    lead.notes,
    lead.kind,
    lead.source_path,
  ]
    .map((value) => String(value || "").toLocaleLowerCase("tr-TR"))
    .join(" ");
  if (hay.includes(q)) return true;
  if (digits.length >= 3) {
    const phoneDigits = String(lead.phone || "").replace(/\D/g, "");
    if (phoneDigits.includes(digits)) return true;
  }
  return false;
}

/** İletişim formuna taşınan hesaplayıcı notundan hızlı etiketler. */
function parseLeadQuoteHints(notes?: string) {
  const text = String(notes || "");
  if (!text) return null;
  const needs = text.match(/İhtiyaç:\s*([^·]+)/)?.[1]?.trim() || "";
  const packageName = text.match(/Paket:\s*([^·]+)/)?.[1]?.trim() || "";
  const monthly = text.match(/Örnek aylık yönetim:\s*([^·(]+)/)?.[1]?.trim() || "";
  if (!needs && !packageName && !monthly) return null;
  return { needs, packageName, monthly };
}

function sortLeads(a: Lead, b: Lead) {
  const aNeed = leadNeedsApprove(a) ? 0 : 1;
  const bNeed = leadNeedsApprove(b) ? 0 : 1;
  if (aNeed !== bNeed) return aNeed - bNeed;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

function sortPartners(a: Partner, b: Partner) {
  const rank = (status: Partner["status"]) => (status === "pending" ? 0 : status === "active" ? 1 : 2);
  const diff = rank(a.status) - rank(b.status);
  if (diff !== 0) return diff;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function AdminSignupsPanel({
  opsJump = null,
  onOpenCustomerForm,
}: {
  opsJump?: { target: OpsAlertTarget; token: number } | null;
  onOpenCustomerForm?: () => void;
}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filter, setFilter] = useState<"all" | "needs_approve" | LeadKind>("all");
  const [leadQuery, setLeadQuery] = useState("");
  const [leadDistrict, setLeadDistrict] = useState("all");
  const [leadService, setLeadService] = useState("all");
  const [leadSector, setLeadSector] = useState("all");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [reveal, setReveal] = useState<{ title: string; email: string; password: string; phone?: string } | null>(null);
  const [smsDistrict, setSmsDistrict] = useState("all");
  const [smsTemplate, setSmsTemplate] = useState(SMS_TEMPLATE_DEFAULT);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsResult, partnersResult] = await Promise.all([
        apiRequest<{ leads: Lead[] }>("/api/leads"),
        apiRequest<{ partners: Partner[] }>("/api/admin/partners"),
      ]);
      setLeads(leadsResult.leads);
      setPartners(partnersResult.partners);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Kayıtlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!opsJump || opsJump.target !== "leads") return;
    setFilter("needs_approve");
    window.requestAnimationFrame(() => {
      document.getElementById("admin-kayit-onay")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [opsJump]);

  const pendingLeadCount = useMemo(() => leads.filter(leadNeedsApprove).length, [leads]);
  const pendingPartnerCount = useMemo(() => partners.filter((item) => item.status === "pending").length, [partners]);

  const leadDistricts = useMemo(() => {
    const set = new Set<string>();
    for (const lead of leads) {
      const district = String(lead.district || "").trim();
      if (district) set.add(district);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "tr"));
  }, [leads]);

  const leadServices = useMemo(() => {
    const set = new Set<string>();
    for (const lead of leads) {
      const service = String(lead.service || "").trim();
      if (service) set.add(service);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "tr"));
  }, [leads]);

  const leadSectors = useMemo(() => {
    const set = new Set<string>();
    for (const lead of leads) {
      const sector = String(lead.sector || "").trim();
      if (sector) set.add(sector);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "tr"));
  }, [leads]);

  const visible = useMemo(() => {
    const base =
      filter === "all"
        ? leads
        : filter === "needs_approve"
          ? leads.filter(leadNeedsApprove)
          : leads.filter((lead) => (lead.kind || "callback") === filter);
    const byDistrict =
      leadDistrict === "all"
        ? base
        : base.filter((lead) => String(lead.district || "").trim() === leadDistrict);
    const byService =
      leadService === "all"
        ? byDistrict
        : byDistrict.filter((lead) => String(lead.service || "").trim() === leadService);
    const bySector =
      leadSector === "all"
        ? byService
        : byService.filter((lead) => String(lead.sector || "").trim() === leadSector);
    return bySector.filter((lead) => leadMatchesQuery(lead, leadQuery)).sort(sortLeads);
  }, [filter, leadDistrict, leadQuery, leadSector, leadService, leads]);

  const phoneDupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const lead of leads) {
      const key = normalizePhone10(lead.phone);
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [leads]);

  const dupPhoneNumbers = useMemo(() => {
    let n = 0;
    for (const count of phoneDupCounts.values()) {
      if (count >= 2) n += 1;
    }
    return n;
  }, [phoneDupCounts]);

  const sortedPartners = useMemo(() => [...partners].sort(sortPartners), [partners]);

  const smsDistricts = useMemo(() => {
    const set = new Set<string>();
    for (const lead of leads) {
      if (lead.sms_ok === 0) continue;
      const district = String(lead.district || "").trim();
      if (district) set.add(district);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "tr"));
  }, [leads]);

  const smsPool = useMemo(() => {
    return leads.filter((lead) => {
      if (lead.sms_ok === 0 || !String(lead.phone || "").trim()) return false;
      if (smsDistrict === "all") return true;
      return String(lead.district || "").trim() === smsDistrict;
    });
  }, [leads, smsDistrict]);

  const smsPhones = useMemo(() => uniqueSmsPhones(smsPool), [smsPool]);
  const smsPreviewLead = smsPool[0];
  const smsPreview = smsPreviewLead ? fillSmsTemplate(smsTemplate, smsPreviewLead) : fillSmsTemplate(smsTemplate, { name: "yetkili", district: "Hatay", sector: "işletme" });
  const smsSegments = Math.max(1, Math.ceil(smsPreview.length / 160));

  const copyPhones = async () => {
    await navigator.clipboard.writeText(smsPhones.join("\n"));
    setNotice(
      smsDistrict === "all"
        ? `${smsPhones.length} SMS onaylı numara kopyalandı.`
        : `${smsDistrict}: ${smsPhones.length} SMS onaylı numara kopyalandı.`,
    );
  };

  const copySmsTemplate = async () => {
    await navigator.clipboard.writeText(smsTemplate.trim());
    setNotice("SMS şablonu kopyalandı. {ad} {ilce} {sektor} panoda kaldı — toplu araçta birleştirin veya örnek metni kullanın.");
  };

  const copySmsPreview = async () => {
    await navigator.clipboard.writeText(smsPreview);
    setNotice("Örnek SMS metni kopyalandı (ilk kayıtla dolduruldu).");
  };

  const updateLead = async (id: number, status: Lead["status"]) => {
    setBusyKey(`lead-status-${id}`);
    try {
      await apiRequest(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Durum güncellenemedi.");
    } finally {
      setBusyKey("");
    }
  };

  const updatePartner = async (id: number, payload: { status?: Partner["status"]; commissionRate?: number }) => {
    setBusyKey(`partner-status-${id}`);
    try {
      await apiRequest(`/api/admin/partners/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Bayi güncellenemedi.");
    } finally {
      setBusyKey("");
    }
  };

  const approveLead = async (lead: Lead) => {
    if (!leadNeedsApprove(lead)) return;
    const ok = window.confirm(
      `${lead.name} için müşteri hesabı açılsın mı?\n\nE-posta: ${lead.email || "(üretilir)"}\nTelefon: ${lead.phone || "—"}\nKaynak: ${KIND_LABELS[lead.kind || "callback"] || lead.kind}`,
    );
    if (!ok) return;
    setBusyKey(`lead-approve-${lead.id}`);
    try {
      const result = await apiRequest<{ email: string; generatedPassword: string; existing?: boolean }>(
        `/api/admin/leads/${lead.id}/approve`,
        { method: "POST", body: JSON.stringify({}) },
      );
      setReveal({ title: lead.name, email: result.email, password: result.generatedPassword, phone: lead.phone });
      setNotice(
        result.existing
          ? "Mevcut hesaba bağlandı. Şifre bir kez gösterilir — kopyalayıp müşteriye iletin."
          : "Hesap açıldı. Şifre bir kez gösterilir; kopyalayıp müşteriye gönderin.",
      );
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Onaylanamadı.");
    } finally {
      setBusyKey("");
    }
  };

  const approvePartner = async (partner: Partner) => {
    if (partner.status === "active") return;
    const ok = window.confirm(
      `${partner.company_name} bayisini onaylayıp firma girişini açmak istiyor musunuz?\n\nE-posta: ${partner.email}\nYetkili: ${partner.contact_name}\n\nBayi, kayıt olurken yazdığı şifreyle /firma/giris sayfasından giriş yapar.`,
    );
    if (!ok) return;
    setBusyKey(`partner-approve-${partner.id}`);
    try {
      const result = await apiRequest<{ email: string; passwordKept?: boolean }>(
        `/api/admin/partners/${partner.id}/approve`,
        { method: "POST", body: JSON.stringify({}) },
      );
      setNotice(
        `Bayi onaylandı (${result.email}). Firma girişi açıldı — kayıt şifresiyle https://hatay360.com/firma/giris adresinden giriş yapabilir.`,
      );
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Bayi onaylanamadı.");
    } finally {
      setBusyKey("");
    }
  };

  const credentialText = reveal ? `Hatay360 giriş\nE-posta: ${reveal.email}\nŞifre: ${reveal.password}\nPortal: https://hatay360.com/musteri/giris` : "";
  const whatsappHref = reveal?.phone
    ? `https://wa.me/${reveal.phone.replace(/\D/g, "").replace(/^0/, "90")}?text=${encodeURIComponent(credentialText)}`
    : "";

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#3ec8dc]">Kayıt kutusu</p>
          <h2 className="mt-1 text-[26px] font-black text-white">Yeni müşteri, harita ve bayi başvuruları</h2>
          <p className="mt-1 max-w-3xl text-[13px] text-white/55">
            Önce arayın, sonra onaylayın. İsim / telefon / ilçe / hesaplayıcı notu ile süzün. Onay hesabı açar ve şifreyi bir kez gösterir. SMS onayı veren numaralar toplu dışa aktarılır.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void copyPhones()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-white/10">
            <Copy className="h-4 w-4" /> Numaraları kopyala
          </button>
          <a href="/api/leads/sms.csv" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-white/10">
            <Download className="h-4 w-4" /> SMS CSV
          </a>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-white/10">
            <RefreshCw className="h-4 w-4" /> Yenile
          </button>
        </div>
      </div>

      <div id="admin-kayit-onay" className="grid scroll-mt-24 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setFilter("needs_approve")}
          className={`rounded-2xl border px-4 py-3 text-left ${filter === "needs_approve" ? "border-amber-300/40 bg-amber-950/35" : "border-white/10 bg-[#18181f]"}`}
        >
          <p className="text-[10px] font-black uppercase tracking-wide text-amber-200">Onay bekleyen lead</p>
          <p className="mt-1 text-[28px] font-black text-white">{pendingLeadCount}</p>
          <p className="mt-1 text-[11px] text-white/45">Yeni / arandı — henüz müşteri hesabı yok</p>
        </button>
        <div className="rounded-2xl border border-white/10 bg-[#18181f] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-[#a5b4fc]">Onay bekleyen bayi</p>
          <p className="mt-1 text-[28px] font-black text-white">{pendingPartnerCount}</p>
          <p className="mt-1 text-[11px] text-white/45">Onaylayınca bayi paneli açılır</p>
        </div>
      </div>

      {notice && <p className="rounded-2xl border border-cyan-400/25 bg-cyan-950/40 px-4 py-3 text-[13px] font-bold text-cyan-100">{notice}</p>}
      {reveal && (
        <div className="rounded-2xl border border-amber-300/30 bg-amber-950/40 px-4 py-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-amber-200">Bir kez gösterilen üye şifresi</p>
              <p className="mt-1 text-[13px] font-bold text-white">{reveal.title} · {reveal.email}</p>
              <p className="mt-2 break-all rounded-xl bg-black/40 px-3 py-2 font-mono text-[14px] text-amber-100">{reveal.password}</p>
              <p className="mt-2 text-[11px] text-amber-100/70">Bu kutuyu kapattıktan sonra şifre tekrar görünmez. Hemen kopyalayın veya WhatsApp ile iletin.</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => void navigator.clipboard.writeText(credentialText)} className="rounded-xl bg-white px-3 py-1.5 text-[10px] font-black text-[#071b22]">
              E-posta + şifre kopyala
            </button>
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/30 bg-emerald-950/40 px-3 py-1.5 text-[10px] font-black text-emerald-100">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp ile gönder
              </a>
            ) : null}
            <button type="button" onClick={() => setReveal(null)} className="rounded-xl border border-white/15 px-3 py-1.5 text-[10px] font-black text-white/70">
              Gizle
            </button>
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-[#18181f] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-[#7ee0ec]" />
              <h3 className="text-[17px] font-black text-white">SMS kampanya kutusu</h3>
            </div>
            <p className="mt-1 max-w-2xl text-[12px] text-white/45">
              Yalnızca SMS onayı veren kayıtlar. İlçe süzün, şablonu yazın, numaraları toplu SMS aracınıza yapıştırın. Hatay360 SMS göndermez.
            </p>
          </div>
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/30 px-3 py-2 text-right">
            <p className="text-[10px] font-black uppercase tracking-wide text-cyan-200">Hedef numara</p>
            <p className="text-[22px] font-black text-white">{smsPhones.length}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-wide text-white/45">
              İlçe
              <select
                value={smsDistrict}
                onChange={(event) => setSmsDistrict(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[13px] font-bold text-white"
              >
                <option value="all">Tüm ilçeler</option>
                {smsDistricts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </label>
            <p className="text-[11px] text-white/40">
              {smsDistrict === "all" ? "Tüm SMS onaylı leadler" : `${smsDistrict} · SMS onaylı`} · {smsPool.length} kayıt · {smsPhones.length} benzersiz numara
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void copyPhones()} disabled={!smsPhones.length} className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a8c4] px-3 py-2 text-[11px] font-black text-white disabled:opacity-40">
                <Copy className="h-3.5 w-3.5" /> Numaraları kopyala
              </button>
              <a href="/api/leads/sms.csv" className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black text-white hover:bg-white/10">
                <Download className="h-3.5 w-3.5" /> SMS CSV
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-wide text-white/45">
              Şablon · {"{ad}"} {"{ilce}"} {"{sektor}"}
              <textarea
                value={smsTemplate}
                onChange={(event) => setSmsTemplate(event.target.value.slice(0, 480))}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[13px] leading-relaxed text-white outline-none focus:border-[#00a8c4]"
              />
            </label>
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-wide text-[#7ee0ec]">Örnek metin</p>
                <p className="text-[10px] font-bold text-white/40">{smsPreview.length} karakter · ~{smsSegments} SMS</p>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-white/75">{smsPreview}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void copySmsPreview()} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black text-white hover:bg-white/10">
                Örnek metni kopyala
              </button>
              <button type="button" onClick={() => void copySmsTemplate()} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black text-white hover:bg-white/10">
                Şablonu kopyala
              </button>
              <button type="button" onClick={() => setSmsTemplate(SMS_TEMPLATE_DEFAULT)} className="rounded-xl border border-white/10 px-3 py-2 text-[11px] font-black text-white/50 hover:text-white/80">
                Varsayılana dön
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-end gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Lead ara</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" aria-hidden="true" />
          <input
            type="search"
            value={leadQuery}
            onChange={(event) => setLeadQuery(event.target.value)}
            placeholder="İsim, telefon, sektör, ilçe, kaynak, not…"
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-3 text-[13px] font-bold text-white outline-none focus:border-[#00a8c4]"
          />
        </label>
        <label className="block text-[10px] font-black uppercase tracking-wide text-white/45">
          İlçe
          <select
            value={leadDistrict}
            onChange={(event) => setLeadDistrict(event.target.value)}
            className="mt-1.5 block min-w-[160px] rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[13px] font-bold text-white"
          >
            <option value="all">Tüm ilçeler</option>
            {leadDistricts.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] font-black uppercase tracking-wide text-white/45">
          Hizmet
          <select
            value={leadService}
            onChange={(event) => setLeadService(event.target.value)}
            className="mt-1.5 block min-w-[160px] rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[13px] font-bold text-white"
          >
            <option value="all">Tüm hizmetler</option>
            {leadServices.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </label>
        <label className="block text-[10px] font-black uppercase tracking-wide text-white/45">
          Sektör
          <select
            value={leadSector}
            onChange={(event) => setLeadSector(event.target.value)}
            className="mt-1.5 block min-w-[160px] rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[13px] font-bold text-white"
          >
            <option value="all">Tüm sektörler</option>
            {leadSectors.map((sector) => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </label>
        <p className="pb-2 text-[11px] font-bold text-white/40">{visible.length} kayıt</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "needs_approve", "maps", "new_customer", "partner_referral", "partner", "callback"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-black ${filter === item ? "bg-[#00a8c4] text-white" : "bg-white/5 text-white/60"}`}
          >
            {item === "all" ? "Tümü" : item === "needs_approve" ? `Onay bekleyen (${pendingLeadCount})` : KIND_LABELS[item]}
          </button>
        ))}
      </div>

      {dupPhoneNumbers > 0 ? (
        <p className="text-[11px] font-bold text-white/40">Tekrarlayan telefon: {dupPhoneNumbers} numara</p>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#18181f]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-[12px]">
            <thead className="bg-black/25 text-white/45">
              <tr>
                <th className="px-5 py-3">Tarih</th>
                <th className="px-5 py-3">Kaynak</th>
                <th className="px-5 py-3">Kişi</th>
                <th className="px-5 py-3">Telefon</th>
                <th className="px-5 py-3">İş / sektör</th>
                <th className="px-5 py-3">Adres</th>
                <th className="px-5 py-3">SMS</th>
                <th className="px-5 py-3">Durum / onay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visible.map((lead) => {
                const needs = leadNeedsApprove(lead);
                const approving = busyKey === `lead-approve-${lead.id}`;
                const quote = parseLeadQuoteHints(lead.notes);
                const partnerName = lead.partner_id
                  ? partners.find((item) => item.id === lead.partner_id)?.company_name
                  : "";
                const phoneKey = normalizePhone10(lead.phone);
                const phoneDup = phoneKey ? phoneDupCounts.get(phoneKey) || 0 : 0;
                return (
                  <tr key={lead.id} className={`align-top text-white/75 hover:bg-white/[0.03] ${needs ? "bg-amber-950/15" : ""}`}>
                    <td className="whitespace-nowrap px-5 py-3">{formatDate(lead.created_at)}</td>
                    <td className="px-5 py-3 font-black text-[#7ee0ec]">
                      {KIND_LABELS[lead.kind || "callback"] || lead.kind}
                      {partnerName ? <p className="mt-1 text-[10px] font-bold text-violet-200/80">{partnerName}</p> : null}
                      {lead.referrer_company_name || lead.referral_code ? (
                        <p className="mt-1 text-[10px] font-bold text-amber-200/85">
                          Tavsiye: {lead.referrer_company_name || lead.referral_code}
                          {lead.referral_code && lead.referrer_company_name ? ` · ${lead.referral_code}` : ""}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-bold text-white">{lead.name}</p>
                      <p className="text-[10px] text-white/40">{lead.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <a className="inline-flex items-center gap-1 text-[#7ee0ec] hover:underline" href={`tel:${lead.phone}`}>
                        <Phone className="h-3.5 w-3.5" /> {lead.phone}
                      </a>
                      {phoneDup >= 2 ? (
                        <button
                          type="button"
                          aria-label={`Bu telefonla ${phoneDup} kayıt`}
                          onClick={() => setLeadQuery(phoneKey)}
                          className="mt-1 block rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white/45 hover:bg-white/[0.08] hover:text-white/70"
                        >
                          Aynı no ×{phoneDup}
                        </button>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <p>{lead.service}</p>
                      <p className="text-[10px] text-white/40">{[lead.sector, lead.district].filter(Boolean).join(" · ")}</p>
                      {lead.source_path ? (
                        <p className="mt-0.5 max-w-[220px] truncate text-[10px] text-white/35" title={lead.source_path}>
                          {lead.source_path}
                        </p>
                      ) : null}
                      {quote ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {quote.needs ? (
                            <span className="rounded-md border border-cyan-400/25 bg-cyan-950/40 px-1.5 py-0.5 text-[9px] font-black text-cyan-100">
                              {quote.needs}
                            </span>
                          ) : null}
                          {quote.packageName ? (
                            <span className="rounded-md border border-violet-400/25 bg-violet-950/35 px-1.5 py-0.5 text-[9px] font-black text-violet-100">
                              {quote.packageName}
                            </span>
                          ) : null}
                          {quote.monthly ? (
                            <span className="rounded-md border border-amber-400/25 bg-amber-950/35 px-1.5 py-0.5 text-[9px] font-black text-amber-100">
                              {quote.monthly}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      {lead.notes && <p className="mt-1 max-w-xs text-[10px] leading-relaxed text-white/45">{lead.notes}</p>}
                      {lead.hours && <p className="mt-1 max-w-xs text-[10px] text-white/35">{lead.hours}</p>}
                    </td>
                    <td className="max-w-[220px] px-5 py-3 text-white/60">{lead.address || "—"}</td>
                    <td className="px-5 py-3">{lead.sms_ok === 0 ? "Hayır" : "Evet"}</td>
                    <td className="px-5 py-3">
                      <div className="mb-2">
                        <StatusDot kind={leadDotKind(lead.status)} label={STATUS_LABELS[lead.status]} />
                      </div>
                      <select
                        value={lead.status}
                        disabled={Boolean(busyKey)}
                        onChange={(event) => void updateLead(lead.id, event.target.value as Lead["status"])}
                        className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-bold text-white disabled:opacity-50"
                      >
                        {(Object.keys(STATUS_LABELS) as Array<Lead["status"]>).map((status) => (
                          <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          writeAdminCustomerDraft({
                            leadId: lead.id,
                            companyName: lead.name,
                            contactName: lead.name,
                            email: lead.email || "",
                            phone: lead.phone || "",
                            sector: lead.sector,
                            district: lead.district,
                            service: lead.service,
                            address: lead.address,
                            kind: lead.kind,
                          });
                          onOpenCustomerForm?.();
                        }}
                        className="mt-2 inline-flex items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-950/40 px-2.5 py-1.5 text-[10px] font-black text-cyan-100"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Hesaba taşı
                      </button>
                      {needs ? (
                        <button
                          type="button"
                          disabled={Boolean(busyKey)}
                          onClick={() => void approveLead(lead)}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[10px] font-black text-white disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {approving ? "Açılıyor…" : "Hesabı aç / onayla"}
                        </button>
                      ) : lead.status === "won" ? (
                        <p className="mt-2 text-[10px] font-bold text-emerald-300">Hesap bağlı</p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {!visible.length && !loading && (
                <tr>
                  <td colSpan={8} className="px-5 py-10"><EmptyRow dark icon={FileSearch} title="Bu filtrede kayıt yok" /></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#18181f] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Handshake className="h-5 w-5 text-[#a5b4fc]" />
          <h3 className="text-[17px] font-black text-white">Bayi firmalar</h3>
        </div>
        <p className="mt-1 text-[12px] text-white/45">Onaylayınca firma girişi açılır. Komisyon yüzdesini buradan yazın. Bekleyenler üstte.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {sortedPartners.map((partner) => {
            const approving = busyKey === `partner-approve-${partner.id}`;
            return (
              <article
                key={partner.id}
                className={`rounded-2xl border p-4 ${partner.status === "pending" ? "border-amber-300/25 bg-amber-950/20" : "border-white/10 bg-black/25"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-black text-white">{partner.company_name}</p>
                    <p className="mt-1 text-[11px] text-white/50">{partner.contact_name} · {partner.email} · {partner.phone}</p>
                    <p className="mt-1 text-[11px] text-white/40">{partner.city} {partner.website ? `· ${partner.website}` : ""}</p>
                  </div>
                  <StatusDot kind={partnerDotKind(partner.status)} label={PARTNER_STATUS[partner.status]} />
                </div>
                {partner.notes && <p className="mt-3 text-[11px] leading-relaxed text-white/50">{partner.notes}</p>}
                <div className="mt-4 flex flex-wrap items-end gap-2">
                  <label className="text-[10px] font-black text-white/45">
                    Komisyon %
                    <input
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={partner.commission_rate}
                      disabled={Boolean(busyKey)}
                      onBlur={(event) => void updatePartner(partner.id, { commissionRate: Number(event.target.value) })}
                      className="mt-1 w-24 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
                    />
                  </label>
                  <select
                    value={partner.status}
                    disabled={Boolean(busyKey)}
                    onChange={(event) => void updatePartner(partner.id, { status: event.target.value as Partner["status"] })}
                    className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[12px] font-bold text-white disabled:opacity-50"
                  >
                    <option value="pending">Onay bekliyor</option>
                    <option value="active">Aktif et</option>
                    <option value="paused">Duraklat</option>
                  </select>
                  {partner.status !== "active" ? (
                    <button
                      type="button"
                      disabled={Boolean(busyKey)}
                      onClick={() => void approvePartner(partner)}
                      className="rounded-xl bg-emerald-500 px-3 py-2 text-[10px] font-black text-white disabled:opacity-50"
                    >
                      {approving ? "Onaylanıyor…" : "Onayla"}
                    </button>
                  ) : (
                    <span className="rounded-xl border border-emerald-400/20 bg-emerald-950/30 px-3 py-2 text-[10px] font-black text-emerald-200">Aktif bayi</span>
                  )}
                </div>
              </article>
            );
          })}
          {!partners.length && <EmptyRow dark icon={Handshake} title="Bayi başvurusu yok" />}
        </div>
      </section>
    </div>
  );
}
