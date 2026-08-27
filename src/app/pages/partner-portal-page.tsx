import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Handshake,
  KeyRound,
  ListChecks,
  LogOut,
  MessageCircle,
  Package,
  Percent,
  Phone,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { EmptyRow } from "../components/empty-row";
import { FormError } from "../components/form-error";
import { PhoneField } from "../components/phone-field";
import { SiteLogo } from "../components/site-logo";
import { useContent } from "../context/content-context";
import { usePartnerAuth } from "../context/partner-auth-context";
import { apiRequest } from "../lib/api";
import { toWhatsAppHref } from "../lib/contact";
import { OFFICIAL_HATAY_DISTRICTS } from "../lib/seo";

type SecurityEvent = { id: number; username: string; success: boolean; createdAt: string; visitorTag: string };
type SecuritySession = { id: string; createdAt: string; expiresAt: string; current: boolean; ip?: string; trusted?: boolean };
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
type PartnerReferral = {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
  sector: string;
  district: string;
  notes: string;
  status: string;
  created_at: string;
};

const REFERRAL_SERVICES = [
  "Web sitesi",
  "Google Ads",
  "Google Maps kaydı",
  "E-ticaret",
  "Meta reklam",
  "Paket teklifi",
] as const;

const REFERRAL_STATUS: Record<string, string> = {
  new: "Yeni",
  contacted: "Arandı",
  won: "Müşteri oldu",
  closed: "Kapatıldı",
};

const PIPELINE_FILTERS = ["all", "new", "contacted", "won", "closed"] as const;
type PipelineFilter = (typeof PIPELINE_FILTERS)[number];

const REFERRAL_STATUS_TONE: Record<string, string> = {
  new: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  contacted: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  won: "border-emerald-400/35 bg-emerald-400/15 text-emerald-100",
  closed: "border-white/15 bg-white/5 text-white/55",
};

function normalizeReferralStatus(status: string) {
  const key = String(status || "").toLowerCase();
  return key in REFERRAL_STATUS ? key : "new";
}

function statusLabel(status: string) {
  const key = String(status || "").toLowerCase();
  if (key === "active" || key === "approved") return { text: "Aktif", tone: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" };
  if (key === "pending") return { text: "Onay bekliyor", tone: "border-amber-400/30 bg-amber-400/10 text-amber-100" };
  return { text: status || "Durum yok", tone: "border-white/15 bg-white/5 text-white/70" };
}

function formatSecurityDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function PartnerPortalPage() {
  const { partner, logout } = usePartnerAuth();
  const { settings } = useContent();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [referrals, setReferrals] = useState<PartnerReferral[]>([]);
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>("all");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [referralForm, setReferralForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Web sitesi" as string,
    sector: "",
    district: "",
    notes: "",
  });

  const loadSecurity = async () => {
    try {
      setSecurity(await apiRequest<SecurityData>("/api/partners/security"));
      setError("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Güvenlik özeti yüklenemedi.");
    }
  };

  const loadReferrals = async () => {
    try {
      const result = await apiRequest<{ referrals: PartnerReferral[] }>("/api/partners/referrals");
      setReferrals(result.referrals || []);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Yönlendirmeler yüklenemedi.");
    }
  };

  useEffect(() => {
    void loadSecurity();
    void loadReferrals();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => void loadReferrals(), 45_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!partner) return null;

  const chip = statusLabel(partner.status);
  const pipelineCounts = PIPELINE_FILTERS.reduce(
    (acc, key) => {
      if (key === "all") {
        acc.all = referrals.length;
        return acc;
      }
      acc[key] = referrals.filter((item) => normalizeReferralStatus(item.status) === key).length;
      return acc;
    },
    { all: 0, new: 0, contacted: 0, won: 0, closed: 0 } as Record<PipelineFilter, number>,
  );
  const filteredReferrals =
    pipelineFilter === "all"
      ? referrals
      : referrals.filter((item) => normalizeReferralStatus(item.status) === pipelineFilter);
  const openPipeline = pipelineCounts.new + pipelineCounts.contacted;
  const partnerStatusKey = String(partner.status || "").toLowerCase();
  const bayilikDone = partnerStatusKey === "active" || partnerStatusKey === "approved";
  const firstCustomerDone = referrals.length >= 1;
  const followHasWon = pipelineCounts.won > 0;
  const followHasOpen = openPipeline > 0;
  const followReferralForm = () => {
    const form = document.getElementById("partner-referral-form");
    if (!(form instanceof HTMLElement)) return;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    const field = form.querySelector<HTMLElement>("input, select, textarea, button");
    field?.focus({ preventScroll: true });
  };
  const waHref = toWhatsAppHref(
    settings.phone,
    `Merhaba, ${partner.company_name} bayilik paneli. Müşteri / komisyon için yazıyorum.`,
  );

  const pwdStrength = passwordStrength(passwordForm.newPassword);
  const passwordsMatch =
    passwordForm.confirmPassword.length > 0 && passwordForm.newPassword === passwordForm.confirmPassword;

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setNotice("");
    setError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Yeni şifre ve tekrarı aynı olmalıdır.");
      return;
    }
    setBusy(true);
    try {
      const result = await apiRequest<{ message: string }>("/api/partners/password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice(result.message || "Şifreniz güncellendi. Diğer cihazlardaki oturumlar kapatıldı.");
      await loadSecurity();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Şifre güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const revokeOtherSessions = async () => {
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const result = await apiRequest<{ ok: boolean; revoked: number }>("/api/partners/sessions/revoke-others", {
        method: "POST",
      });
      setNotice(
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

  const submitReferral = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    setError("");
    try {
      await apiRequest<{ ok: boolean; id: number }>("/api/partners/referrals", {
        method: "POST",
        body: JSON.stringify(referralForm),
      });
      setReferralForm({
        name: "",
        phone: "",
        email: "",
        service: REFERRAL_SERVICES[0],
        sector: "",
        district: "",
        notes: "",
      });
      setNotice("Müşteri yönlendirmesi kaydedildi. Hatay360 kayıt kutusuna düştü.");
      await loadReferrals();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Yönlendirme gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06121c] text-white">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <SiteLogo variant="onDark" />
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/firma/giris", { replace: true });
            }}
            className="inline-flex items-center gap-2 text-[11px] font-black text-white/50 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Çıkış
          </button>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a5b4fc]">Bayi paneli</p>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-black ${chip.tone}`}>{chip.text}</span>
        </div>
        <h1 className="mt-3 text-[36px] font-black tracking-[-0.04em]">{partner.company_name}</h1>
        <p className="mt-2 text-[14px] text-white/55">
          {partner.contact_name} · {partner.email}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-bold text-white/55">
          {partner.phone ? (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#7ee0ec]" /> {partner.phone}
            </span>
          ) : null}
          {partner.city ? (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#a5b4fc]" /> {partner.city}
            </span>
          ) : null}
          {partner.website ? (
            <a href={partner.website.startsWith("http") ? partner.website : `https://${partner.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#7ee0ec] hover:underline">
              {partner.website.replace(/^https?:\/\//, "")}
            </a>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <Percent className="h-5 w-5 text-[#a5b4fc]" />
            <p className="mt-4 text-[12px] font-bold text-white/50">Komisyon oranınız</p>
            <p className="mt-2 text-[40px] font-black">%{partner.commission_rate}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-white/50">Satış başına Hatay360 payı. Değişiklik için temsilcinizle konuşun.</p>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <Handshake className="h-5 w-5 text-[#7ee0ec]" />
            <p className="mt-4 text-[12px] font-bold text-white/50">Çalışma düzeni</p>
            <p className="mt-3 text-[14px] leading-relaxed text-white/75">
              Siz müşteriyi getirirsiniz. Site, reklam ve harita kaydını Hatay360 üretir. Teslim sonrası komisyon netleşir.
            </p>
          </article>
        </div>

        <section
          className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-6"
          aria-labelledby="partner-next-steps-heading"
        >
          <div className="flex items-start gap-3">
            <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-[#a5b4fc]" aria-hidden="true" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#a5b4fc]">Başlangıç</p>
              <h2 id="partner-next-steps-heading" className="mt-2 text-[20px] font-black tracking-[-0.03em]">
                Sonraki adımlar
              </h2>
            </div>
          </div>
          <ol className="mt-5 space-y-2.5" aria-label="Bayi sonraki adımlar">
            <li
              className="flex gap-3 rounded-2xl border border-white/10 bg-[#0c1a28] px-4 py-3.5"
              aria-current={!bayilikDone ? "step" : undefined}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                  bayilikDone
                    ? "bg-emerald-400/15 text-emerald-200"
                    : "border border-amber-400/30 bg-amber-400/10 text-amber-100"
                }`}
                aria-hidden="true"
              >
                {bayilikDone ? <CheckCircle2 className="h-4 w-4" /> : "1"}
              </span>
              <div>
                <p className="text-[13px] font-black">Bayilik</p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                  {bayilikDone
                    ? "Onaylandı — panel aktif."
                    : partnerStatusKey === "pending"
                      ? "Onay bekleniyor"
                      : chip.text}
                </p>
                <span className="sr-only">{bayilikDone ? "Tamamlandı" : "Bekliyor"}</span>
              </div>
            </li>
            <li
              className="flex gap-3 rounded-2xl border border-white/10 bg-[#0c1a28] px-4 py-3.5"
              aria-current={bayilikDone && !firstCustomerDone ? "step" : undefined}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                  firstCustomerDone
                    ? "bg-emerald-400/15 text-emerald-200"
                    : "border border-white/15 bg-white/5 text-white/70"
                }`}
                aria-hidden="true"
              >
                {firstCustomerDone ? <CheckCircle2 className="h-4 w-4" /> : "2"}
              </span>
              <div>
                <p className="text-[13px] font-black">İlk müşteri</p>
                {firstCustomerDone ? (
                  <p className="mt-1 text-[12px] leading-relaxed text-white/55">Yönlendirme kaydı var.</p>
                ) : (
                  <>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                      Getirdiğiniz ilk müşteriyi aşağıdaki forma yazın.
                    </p>
                    <button
                      type="button"
                      onClick={followReferralForm}
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-black text-[#7ee0ec] hover:underline"
                    >
                      Forma git <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </>
                )}
                <span className="sr-only">{firstCustomerDone ? "Tamamlandı" : "Bekliyor"}</span>
              </div>
            </li>
            <li
              className="flex gap-3 rounded-2xl border border-white/10 bg-[#0c1a28] px-4 py-3.5"
              aria-current={firstCustomerDone && !followHasWon ? "step" : undefined}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                  followHasWon
                    ? "bg-emerald-400/15 text-emerald-200"
                    : "border border-white/15 bg-white/5 text-white/70"
                }`}
                aria-hidden="true"
              >
                {followHasWon ? <CheckCircle2 className="h-4 w-4" /> : "3"}
              </span>
              <div>
                <p className="text-[13px] font-black">Takip</p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                  {followHasWon
                    ? "Müşteri oldu — komisyon Hatay360 onayıyla işlenir"
                    : followHasOpen
                      ? "Hatay360 arıyor / siz durumdan bakın"
                      : firstCustomerDone
                        ? "Durum hattından bakın."
                        : "İlk yönlendirmeden sonra Hatay360 arar."}
                </p>
                <span className="sr-only">{followHasWon ? "Tamamlandı" : followHasOpen ? "Devam ediyor" : "Bekliyor"}</span>
              </div>
            </li>
          </ol>
        </section>

        <section className="mt-6 space-y-5 rounded-[24px] border border-white/10 bg-gradient-to-br from-[#1a2744]/80 to-white/5 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#a5b4fc]">Müşteri yönlendir</p>
              <h2 className="mt-3 text-[22px] font-black tracking-[-0.03em]">Getirdiğiniz müşteriyi panele yazın</h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60">
                Kayıt admin kutuna düşer; aranır, onaylanır, hesabı açılır. Teslimat ve faturalama Hatay360’da kalır — komisyon teslim sonrası netleşir.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/paketler" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black text-white hover:bg-white/10">
                <Package className="h-3.5 w-3.5" /> Paketler
              </Link>
              {waHref ? (
                <a href={waHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black text-white hover:bg-white/10">
                  <MessageCircle className="h-3.5 w-3.5 text-[#7ee0ec]" /> WhatsApp
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <form id="partner-referral-form" onSubmit={submitReferral} className="rounded-[22px] border border-white/10 bg-[#0c1a28] p-5">
              <UserPlus className="h-5 w-5 text-[#7ee0ec]" />
              <h3 className="mt-4 text-[18px] font-black">Yeni müşteri kaydı</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-white/50">Ad + telefon zorunlu. E-posta varsa onayda hesap açımı hızlanır.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="text-[9px] font-black uppercase tracking-wide text-white/45 sm:col-span-2">
                  Müşteri / işletme adı
                  <input
                    required
                    value={referralForm.name}
                    onChange={(event) => setReferralForm({ ...referralForm, name: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-[13px] font-bold text-white outline-none focus:border-[#7ee0ec]/50"
                    placeholder="Örn. Defne Eczanesi"
                  />
                </label>
                <label className="text-[9px] font-black uppercase tracking-wide text-white/45">
                  Telefon
                  <PhoneField
                    value={referralForm.phone}
                    onChange={(phone) => setReferralForm({ ...referralForm, phone })}
                    required
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-[13px] font-bold text-white outline-none focus:border-[#7ee0ec]/50"
                  />
                </label>
                <label className="text-[9px] font-black uppercase tracking-wide text-white/45">
                  E-posta (opsiyonel)
                  <input
                    type="email"
                    value={referralForm.email}
                    onChange={(event) => setReferralForm({ ...referralForm, email: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-[13px] font-bold text-white outline-none focus:border-[#7ee0ec]/50"
                    placeholder="isletme@ornek.com"
                  />
                </label>
                <label className="text-[9px] font-black uppercase tracking-wide text-white/45">
                  Hizmet
                  <select
                    value={referralForm.service}
                    onChange={(event) => setReferralForm({ ...referralForm, service: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-[13px] font-bold text-white outline-none focus:border-[#7ee0ec]/50"
                  >
                    {REFERRAL_SERVICES.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[9px] font-black uppercase tracking-wide text-white/45">
                  İlçe
                  <select
                    value={referralForm.district}
                    onChange={(event) => setReferralForm({ ...referralForm, district: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-[13px] font-bold text-white outline-none focus:border-[#7ee0ec]/50"
                  >
                    <option value="">Seçin</option>
                    {OFFICIAL_HATAY_DISTRICTS.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[9px] font-black uppercase tracking-wide text-white/45 sm:col-span-2">
                  Sektör
                  <input
                    value={referralForm.sector}
                    onChange={(event) => setReferralForm({ ...referralForm, sector: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-[13px] font-bold text-white outline-none focus:border-[#7ee0ec]/50"
                    placeholder="Eczane, restoran, klinik…"
                  />
                </label>
                <label className="text-[9px] font-black uppercase tracking-wide text-white/45 sm:col-span-2">
                  Not
                  <textarea
                    rows={3}
                    value={referralForm.notes}
                    onChange={(event) => setReferralForm({ ...referralForm, notes: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-[13px] font-bold text-white outline-none focus:border-[#7ee0ec]/50"
                    placeholder="Konuştuğunuz paket, bütçe veya özel istek"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#3b4fd4] px-4 py-3 text-[12px] font-black text-white hover:bg-[#3346c0] disabled:opacity-40"
              >
                <Send className="h-4 w-4" /> Yönlendirmeyi gönder <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="rounded-[22px] border border-white/10 bg-[#0c1a28] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wide text-[#a5b4fc]">Yönlendirme hattı</p>
                  <h3 className="mt-1 text-[18px] font-black">
                    {pipelineFilter === "all"
                      ? `${referrals.length} kayıt`
                      : `${filteredReferrals.length} / ${referrals.length}`}
                  </h3>
                  <p className="mt-1 text-[11px] text-white/45">
                    {openPipeline > 0
                      ? `${openPipeline} açık · ${pipelineCounts.won} müşteri oldu`
                      : referrals.length
                        ? `${pipelineCounts.won} müşteri oldu · süreç tamam`
                        : "Admin durumu burada güncellenir"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void loadReferrals()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-black text-white/70 hover:bg-white/5 disabled:opacity-40"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Yenile
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5" role="tablist" aria-label="Yönlendirme durumu">
                {PIPELINE_FILTERS.map((key) => {
                  const active = pipelineFilter === key;
                  const label = key === "all" ? "Tümü" : REFERRAL_STATUS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setPipelineFilter(key)}
                      className={`rounded-xl border px-2.5 py-2 text-left transition ${
                        active
                          ? "border-[#7ee0ec]/40 bg-[#7ee0ec]/10 text-white"
                          : "border-white/10 bg-black/20 text-white/70 hover:bg-white/5"
                      }`}
                    >
                      <p className="text-[9px] font-black uppercase tracking-wide opacity-80">{label}</p>
                      <p className="mt-0.5 text-[18px] font-black tabular-nums">{pipelineCounts[key]}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 max-h-[420px] space-y-2 overflow-auto pr-1">
                {filteredReferrals.map((item) => {
                  const statusKey = normalizeReferralStatus(item.status);
                  const won = statusKey === "won";
                  return (
                    <article
                      key={item.id}
                      className={`rounded-xl border px-3 py-3 ${
                        won
                          ? "border-emerald-400/25 bg-emerald-950/25"
                          : "border-white/10 bg-black/25"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[13px] font-black text-white">{item.name}</p>
                          <p className="mt-1 text-[11px] text-white/50">{item.phone}{item.district ? ` · ${item.district}` : ""}</p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black ${
                            REFERRAL_STATUS_TONE[statusKey] || REFERRAL_STATUS_TONE.new
                          }`}
                        >
                          {REFERRAL_STATUS[statusKey] || item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-white/55">{item.service}{item.sector ? ` · ${item.sector}` : ""}</p>
                      <p className="mt-1 text-[10px] text-white/35">#{item.id} · {formatSecurityDate(item.created_at)}</p>
                    </article>
                  );
                })}
                {!referrals.length ? (
                  <EmptyRow dark icon={UserPlus} title="Henüz yönlendirme yok" hint="Soldaki formdan ilk müşteriyi gönderin." />
                ) : !filteredReferrals.length ? (
                  <EmptyRow
                    dark
                    icon={Handshake}
                    title="Bu durumda kayıt yok"
                    hint="Başka bir filtre seçin veya yeni yönlendirme gönderin."
                  />
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#a5b4fc]">Şifre & güvenlik</p>
              <h2 className="mt-2 text-[22px] font-black tracking-[-0.03em]">Bayi hesabını koruyun</h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/55">
                Şifreyi yenileyin, açık oturumları görün, şüpheli girişleri izleyin; diğer cihazları tek tıkla kapatın.
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void loadSecurity()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black text-white/80 hover:bg-white/10 disabled:opacity-40"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Yenile
            </button>
          </div>

          {error ? <FormError tone="dark">{error}</FormError> : null}
          {notice ? <p className="rounded-xl border border-emerald-400/25 bg-emerald-950/40 px-3 py-2 text-[12px] font-medium text-emerald-100" role="status">{notice}</p> : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#0c1a28] px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-[#7ee0ec]">Hesap</p>
              <p className="mt-1 truncate text-[16px] font-black">{security?.email || partner.email}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0c1a28] px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-emerald-200">Aktif oturum</p>
              <p className="mt-1 text-[28px] font-black">{security?.activeSessions ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0c1a28] px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-rose-200">Başarısız (24s)</p>
              <p className="mt-1 text-[28px] font-black">{security?.failed24h ?? "—"}</p>
            </div>
          </div>

          <section className="rounded-[22px] border border-white/10 bg-[#0c1a28] p-5" aria-labelledby="partner-session-list-heading">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 id="partner-session-list-heading" className="text-[18px] font-black">Açık oturumlar</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-white/50">
                  Bu cihaz işaretlidir. Tanımadığınız oturum varsa diğerlerini kapatın; IP saklanmaz, yalnızca oturum etiketi görünür.
                </p>
              </div>
              <button
                type="button"
                disabled={busy || !security || security.activeSessions <= 1}
                onClick={() => void revokeOtherSessions()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-black text-white/80 hover:bg-white/10 disabled:opacity-40"
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
                      session.current ? "border-emerald-400/30 bg-emerald-950/35" : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <div>
                      <p className="text-[12px] font-black">
                        {session.current ? "Bu cihaz" : "Başka oturum"}
                        <span className="ml-2 font-bold text-white/40">· {session.id}</span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/45">
                        Açılış {formatSecurityDate(session.createdAt)} · bitiş {formatSecurityDate(session.expiresAt)}
                        {session.ip ? ` · IP ${session.ip}` : ""}
                        {session.trusted ? " · güvenilen PC" : ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${
                        session.current ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-white/65"
                      }`}
                    >
                      {session.current ? "Şu an" : "Aktif"}
                    </span>
                  </li>
                ))
              ) : (
                <EmptyRow dark icon={ShieldAlert} title="Oturum listesi yok" hint="Güvenlik özeti yenilenince burada görünür." />
              )}
            </ul>
          </section>

          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={changePassword} className="rounded-[22px] border border-white/10 bg-[#0c1a28] p-5">
              <KeyRound className="h-5 w-5 text-[#7ee0ec]" aria-hidden="true" />
              <h3 className="mt-4 text-[18px] font-black">Şifrenizi yenileyin</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-white/50">
                En az 10 karakter. Değişince diğer cihazlardaki oturumlar düşer; bu tarayıcıda kalırsınız.
              </p>
              <div className="mt-5 grid gap-3">
                <label className="text-[9px] font-black uppercase tracking-wide text-white/45">
                  Mevcut şifre
                  <input
                    required
                    type="password"
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-[12px] text-white outline-none focus:border-[#7ee0ec]"
                  />
                </label>
                <label className="text-[9px] font-black uppercase tracking-wide text-white/45">
                  Yeni şifre
                  <input
                    required
                    minLength={10}
                    maxLength={128}
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-[12px] text-white outline-none focus:border-[#7ee0ec]"
                    aria-describedby="partner-password-strength-hint"
                  />
                </label>
                {passwordForm.newPassword ? (
                  <div id="partner-password-strength-hint" className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5" aria-live="polite">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-black text-white/70">Şifre gücü</p>
                      <p className={`text-[10px] font-black ${pwdStrength.score >= 3 ? "text-emerald-300" : "text-amber-200"}`}>
                        {pwdStrength.label}
                      </p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={pwdStrength.score} aria-label="Şifre gücü">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pwdStrength.score >= 4
                            ? "bg-emerald-400"
                            : pwdStrength.score >= 3
                              ? "bg-[#7ee0ec]"
                              : pwdStrength.score >= 2
                                ? "bg-amber-400"
                                : "bg-rose-400"
                        }`}
                        style={{ width: `${(pwdStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    <ul className="mt-2 space-y-1 text-[10px] font-bold text-white/45">
                      <li className={pwdStrength.lengthOk ? "text-emerald-300" : ""}>
                        {pwdStrength.lengthOk ? "✓" : "·"} En az 10 karakter
                      </li>
                      <li className={pwdStrength.hasLetter ? "text-emerald-300" : ""}>
                        {pwdStrength.hasLetter ? "✓" : "·"} En az bir harf
                      </li>
                      <li className={pwdStrength.hasDigit ? "text-emerald-300" : ""}>
                        {pwdStrength.hasDigit ? "✓" : "·"} En az bir rakam
                      </li>
                    </ul>
                  </div>
                ) : null}
                <label className="text-[9px] font-black uppercase tracking-wide text-white/45">
                  Yeni şifre tekrar
                  <input
                    required
                    minLength={10}
                    maxLength={128}
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-[12px] text-white outline-none focus:border-[#7ee0ec]"
                    aria-describedby={passwordForm.confirmPassword ? "partner-password-match-hint" : undefined}
                  />
                </label>
                {passwordForm.confirmPassword ? (
                  <p
                    id="partner-password-match-hint"
                    className={`text-[10px] font-bold ${passwordsMatch ? "text-emerald-300" : "text-rose-300"}`}
                    role="status"
                  >
                    {passwordsMatch ? "Şifreler eşleşiyor." : "Şifreler eşleşmiyor."}
                  </p>
                ) : null}
              </div>
              <button
                disabled={busy}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#3b4fd4] px-4 py-3 text-[11px] font-black text-white hover:bg-[#3346c0] disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" /> {busy ? "Güncelleniyor…" : "Şifreyi güncelle"}
              </button>
            </form>

            <section className="rounded-[22px] border border-white/10 bg-[#0c1a28] p-5">
              <div>
                <h3 className="text-[18px] font-black">Son giriş denemeleri</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-white/50">
                  IP saklanmaz; ziyaretçi etiketi anonim hash’ten kısaltılır. Yalnızca bu e-posta görünür.
                </p>
              </div>
              <div className="mt-4 space-y-2">
                {security?.events?.length ? (
                  security.events.map((event) => (
                    <div
                      key={event.id}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                        event.success ? "border-white/10 bg-white/[0.03]" : "border-rose-400/25 bg-rose-950/30"
                      }`}
                    >
                      <div>
                        <p className="text-[12px] font-black">{event.success ? "Başarılı giriş" : "Başarısız deneme"}</p>
                        <p className="mt-0.5 text-[10px] text-white/45">
                          {formatSecurityDate(event.createdAt)} · etiket {event.visitorTag}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${
                          event.success ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200"
                        }`}
                      >
                        {event.success ? "OK" : "Hata"}
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyRow dark icon={ShieldAlert} title="Henüz giriş kaydı yok" hint="Bayi girişi denendiğinde burada görünür." />
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
