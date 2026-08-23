import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ArrowRight, CheckCircle2, Handshake, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { SiteLogo } from "../components/site-logo";
import { FormError } from "../components/form-error";
import { PhoneField } from "../components/phone-field";
import { HoneypotField } from "../components/honeypot-field";
import { LoginPromoBannerSlider, LoginPromoLineChart, LoginPromoStats } from "../components/login-promo-panel";
import { useContent } from "../context/content-context";
import { apiRequest } from "../lib/api";
import { isValidTrPhone, PHONE_ERROR, toWhatsAppHref } from "../lib/contact";
import { turkishFormProps } from "../lib/form-validation";
import {
  DEFAULT_PARTNER_LOGIN_CHART,
  DEFAULT_PARTNER_LOGIN_STATS,
} from "../lib/login-promo";
import { OFFICIAL_HATAY_DISTRICTS } from "../lib/seo";

const NEXT_STEPS = [
  "Bayilik başvurunuzu inceleriz: firma, yetkili ve iletişim bilgileri.",
  "Uygun görülürse firma giriş bilgilerinizi sizinle paylaşırız.",
  "Onaylanmadan panel açılmaz; sonucu size iletiriz.",
];

const CHART_BARS = [28, 42, 35, 52, 44, 68, 58, 76, 64, 82];

function PartnerSignupAmbient({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(#1e1b4b 1px, transparent 1px), linear-gradient(90deg, #1e1b4b 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -left-[8%] top-[10%] h-[360px] w-[360px] rounded-full bg-indigo-500/[0.14] blur-[100px]"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, 32, 8, 0], y: [0, -20, 12, 0] }}
        transition={reducedMotion ? undefined : { duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-[5%] bottom-[15%] h-[280px] w-[280px] rounded-full bg-violet-500/[0.1] blur-[90px]"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, -24, -4, 0], y: [0, 16, -8, 0] }}
        transition={reducedMotion ? undefined : { duration: 32, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
      />
      <div className="pointer-events-none absolute bottom-0 right-0 flex items-end gap-2 px-8 pb-10 opacity-[0.22]" aria-hidden="true">
        {CHART_BARS.map((height, index) => (
          <motion.div
            key={index}
            className="w-2 rounded-t-sm bg-gradient-to-t from-indigo-600/40 to-violet-300/70"
            initial={{ height: reducedMotion ? height : 8 }}
            animate={reducedMotion ? { height } : { height: [height * 0.55, height, height * 0.72, height * 0.92, height] }}
            transition={
              reducedMotion
                ? undefined
                : { duration: 7 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }
            }
            style={{ maxHeight: 96 }}
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent"
        aria-hidden="true"
      />
    </>
  );
}

export function PartnerSignupPage() {
  const { settings } = useContent();
  const reducedMotion = useReducedMotion() ?? false;
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "Antakya",
    website: "",
    notes: "",
    password: "",
    smsOk: true,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!sent) return;
    successHeadingRef.current?.focus();
  }, [sent]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidTrPhone(form.phone)) {
      setError(PHONE_ERROR);
      return;
    }
    if (form.password.length < 10) {
      setError("Şifre en az 10 karakter olmalıdır.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const companyFax = String(new FormData(event.currentTarget).get("company_fax") || "");
      await apiRequest("/api/partners/register", {
        method: "POST",
        body: JSON.stringify({ ...form, company_fax: companyFax }),
      });
      setSent(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Başvuru gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <label className="mt-4 block text-[11px] font-black text-[#425965]">
      {label}
      <input
        required={key !== "website" && key !== "notes"}
        type={type}
        minLength={key === "password" ? 10 : key === "email" ? undefined : 2}
        maxLength={key === "password" ? 128 : 80}
        value={typeof form[key] === "string" ? form[key] : ""}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
        className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#3b4fd4]"
      />
    </label>
  );

  const banners = settings.partnerLoginBanners || [];

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-[#0c0a18] lg:grid-cols-[1.05fr_0.95fr]">
      <PartnerSignupAmbient reducedMotion={reducedMotion} />
      <div className="relative hidden overflow-y-auto overflow-x-hidden border-r border-indigo-500/15 p-12 lg:flex lg:flex-col lg:justify-between">
        <motion.div
          initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <SiteLogo variant="onDark" />
          <p className="mt-10 text-[11px] font-black uppercase tracking-[0.23em] text-[#a5b4fc]">Bayilik başvurusu</p>
          <h1 className="mt-4 max-w-xl text-[42px] font-black leading-[0.98] tracking-[-0.055em] text-white xl:text-[48px]">
            Siz satarsınız, Hatay360 üretir.
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/58">
            Web tasarım firmanız müşteri getirir; site, reklam ve harita kaydını birlikte yürütürüz. Komisyon oranı onay sonrası belirlenir.
          </p>
          <LoginPromoBannerSlider
            banners={banners}
            accentDot="bg-[#a5b4fc]"
            borderClass="border-indigo-400/20"
          />
          <LoginPromoStats
            stats={DEFAULT_PARTNER_LOGIN_STATS}
            tone="text-[#a5b4fc]"
            cardClass="rounded-2xl border border-indigo-400/15 bg-indigo-500/10 px-3 py-3"
          />
          <LoginPromoLineChart
            points={DEFAULT_PARTNER_LOGIN_CHART}
            stroke="#a5b4fc"
            fill="rgba(99,102,241,0.22)"
            title="Son 6 ay bayi büyümesi"
            borderClass="border-indigo-400/15"
          />
        </motion.div>
        <ul className="relative mt-8 space-y-2 text-[13px] font-bold text-white/70">
          <li className="flex items-start gap-2">
            <Handshake className="mt-0.5 h-4 w-4 shrink-0 text-[#a5b4fc]" />
            Müşteri sizde kalır, teslimat Hatay360’ta.
          </li>
          <li>Komisyon panoda görünür, gizli kesinti yok.</li>
          <li>Onaylanmadan giriş açılmaz.</li>
        </ul>
      </div>
      <div className="relative flex items-center justify-center p-5 sm:p-10">
        {sent ? (
          <div
            className="w-full max-w-md rounded-[30px] border border-white/10 bg-white p-8 text-left shadow-[0_28px_90px_rgba(99,102,241,0.18)]"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-12 w-12 text-[#3b4fd4]" aria-hidden="true" />
            <h2
              ref={successHeadingRef}
              tabIndex={-1}
              className="mt-5 text-[26px] font-black text-[#102b35] outline-none focus-visible:ring-2 focus-visible:ring-[#3b4fd4] focus-visible:ring-offset-2"
            >
              Başvurunuz alındı
            </h2>
            <p className="mt-2 text-[13px] text-[#5b6b75]">Sırada ne olacak:</p>
            <ol className="mt-4 space-y-2.5">
              {NEXT_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3b4fd4] text-[12px] font-black text-white">
                    {index + 1}
                  </span>
                  <span className="text-[13px] leading-relaxed text-[#425965]">{step}</span>
                </li>
              ))}
            </ol>
            <a
              href={toWhatsAppHref(settings.phone, "Merhaba Hatay360, bayilik başvurumu gönderdim.")}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b4fd4] px-5 py-3 text-[13px] font-black text-white"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp ile yaz
            </a>
            <Link
              to="/firma/giris"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#dbe6ea] bg-white px-5 py-3 text-[13px] font-black text-[#3b4fd4]"
            >
              Zaten hesabım var
            </Link>
          </div>
        ) : (
          <form
            onSubmit={submit}
            {...turkishFormProps}
            className="w-full max-w-md rounded-[30px] border border-white/10 bg-white p-7 shadow-[0_28px_90px_rgba(99,102,241,0.18)] sm:p-9"
          >
            <h2 className="text-[26px] font-black text-[#102b35]">Firma kaydı</h2>
            <p className="mt-2 text-[12px] text-[#71818a]">Bayilik için firmanızı, yetkiliyi ve şifrenizi yazın.</p>
            <p className="mt-2 text-[12px] leading-relaxed text-[#5b6b75] lg:hidden">
              Web, reklam ve Google Maps birlikte yürür. Komisyon onay sonrası belirlenir.
            </p>
            {error && (
              <div className="mt-4">
                <FormError>{error}</FormError>
              </div>
            )}
            <HoneypotField />
            {field("companyName", "Firma adı")}
            {field("contactName", "Yetkili adı")}
            {field("email", "E-posta", "email")}
            <label className="mt-4 block text-[11px] font-black text-[#425965]">
              Telefon
              <div className="mt-2">
                <PhoneField value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
              </div>
            </label>
            <label className="mt-4 block text-[11px] font-black text-[#425965]">
              İlçe
              <span className="ml-1 font-bold text-[#87959c]">(Hatay)</span>
              <select
                required
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                className="mt-2 w-full rounded-xl border border-[#dbe6ea] bg-white px-4 py-3 text-[13px] outline-none focus:border-[#3b4fd4]"
              >
                {OFFICIAL_HATAY_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </label>
            {field("website", "Web siteniz")}
            {field("password", "Şifre (en az 10 karakter)", "password")}
            <label className="mt-4 block text-[11px] font-black text-[#425965]">
              Not
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className="mt-2 w-full rounded-xl border border-[#dbe6ea] px-4 py-3 text-[13px] outline-none focus:border-[#3b4fd4]"
              />
            </label>
            <label className="mt-4 flex items-start gap-2 text-[12px] text-[#5b6b75]">
              <input
                type="checkbox"
                checked={form.smsOk}
                onChange={(event) => setForm({ ...form, smsOk: event.target.checked })}
                className="mt-1 accent-[#3b4fd4]"
              />
              SMS ve arama ile bilgi almak istiyorum.
            </label>
            <button
              disabled={busy}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b4fd4] px-5 py-3.5 text-[13px] font-black text-white disabled:opacity-60"
            >
              {busy ? "Gönderiliyor…" : "Bayilik başvurusu"} <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-5 text-center text-[11px] text-[#87959c]">
              Hesabınız varsa{" "}
              <Link to="/firma/giris" className="font-black text-[#3b4fd4] hover:underline">
                firma girişi
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
