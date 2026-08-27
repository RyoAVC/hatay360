import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { readReferralCode } from "../lib/referral";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { PhoneCall, Send, CheckCircle2, MessageCircle, MapPin, Package } from "lucide-react";
import { useContent } from "../context/content-context";
import { isSupportOpenNow, isValidTrPhone, nextSupportChange, PHONE_ERROR, toWhatsAppHref } from "../lib/contact";
import { turkishFormProps } from "../lib/form-validation";
import { apiRequest } from "../lib/api";
import { parseIletisimQuoteParams } from "../lib/needs-calculator";
import { FormError } from "./form-error";
import { PhoneField } from "./phone-field";
import { HoneypotField } from "./honeypot-field";

const SERVICES = [
  "Web tasarım",
  "Google / Meta reklam",
  "Google Maps / harita",
  "E-ticaret (isteğe bağlı)",
  "Pazarla (ayrı ürün)",
  "Özel yazılım",
  "Diğer",
];

const SERVICE_ALIASES: Record<string, string> = {
  "E-Ticaret altyapısı": "E-ticaret (isteğe bağlı)",
  "Pazaryeri entegrasyonu": "Pazarla (ayrı ürün)",
};

function resolveServiceOption(service: string) {
  if (!service) return "";
  if (SERVICES.includes(service)) return service;
  if (SERVICE_ALIASES[service]) return SERVICE_ALIASES[service];
  const aliased = Object.entries(SERVICE_ALIASES).find(
    ([legacy]) => service.includes(legacy) || legacy.includes(service),
  );
  if (aliased) return aliased[1];
  return "";
}

const CALL_WINDOWS = [
  { id: "any", label: "Fark etmez", hint: "Uygun olduğunuzda arayın" },
  { id: "morning", label: "Sabah", hint: "09:00 – 12:00" },
  { id: "afternoon", label: "Öğleden sonra", hint: "12:00 – 17:00" },
  { id: "evening", label: "Akşam", hint: "17:00 – 20:00" },
] as const;

type CallWindowId = (typeof CALL_WINDOWS)[number]["id"];

const DRAFT_KEY = "hatay360.callback.draft";
const CALL_WINDOW_IDS = new Set<string>(CALL_WINDOWS.map((item) => item.id));

type CallbackDraft = {
  name: string;
  phone: string;
  service: string;
  callWindow: CallWindowId;
};

function quoteServiceValue(service: string) {
  const resolved = resolveServiceOption(service);
  if (resolved) return resolved;
  if (service) return "Diğer";
  return "";
}

function serviceFromSearch(search: string) {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return String(params.get("service") || "").trim();
}

function readCallbackDraft(): CallbackDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CallbackDraft>;
    if (!parsed || typeof parsed !== "object") return null;
    const name = typeof parsed.name === "string" ? parsed.name : "";
    const phone = typeof parsed.phone === "string" ? parsed.phone : "";
    const service = typeof parsed.service === "string" ? resolveServiceOption(parsed.service) : "";
    const callWindow = CALL_WINDOW_IDS.has(String(parsed.callWindow)) ? (parsed.callWindow as CallWindowId) : "any";
    return { name, phone, service, callWindow };
  } catch {
    return null;
  }
}

function clearCallbackDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

function callbackDraftHasTypedContent(draft: CallbackDraft, quoteService: string) {
  return (
    draft.name.trim().length > 0 ||
    draft.phone.trim().length > 0 ||
    draft.callWindow !== "any" ||
    (draft.service.length > 0 && draft.service !== quoteService)
  );
}

type CallbackFormProps = {
  compact?: boolean;
  defaultDistrict?: string;
  defaultSector?: string;
  defaultService?: string;
};

function pickInitialService(quoteService: string, defaultService?: string, draftService?: string) {
  return quoteService || resolveServiceOption(defaultService || "") || (draftService ? resolveServiceOption(draftService) : "");
}

const fieldClass =
  "mt-2 w-full rounded-xl border border-[#ecebf5] bg-white px-4 py-3 text-[15px] text-[#1a1a1a] outline-none transition focus:border-[#00a8c4]";
const labelClass = "block text-[12px] font-bold text-[#425965]";

function callbackReturnCopy(openNow: boolean, nextLabel: string) {
  if (openNow) return "Aynı gün, mesai içinde sizi ararız.";
  if (nextLabel) return `Mesai dışında kaydedildi. ${nextLabel}; ardından sizi ararız.`;
  return "Talebiniz kaydedildi; mesai saatlerinde sizi ararız.";
}

export function CallbackForm({ compact = false, defaultDistrict, defaultSector, defaultService }: CallbackFormProps) {
  const { settings } = useContent();
  const { pathname, search } = useLocation();
  const formId = useId();
  const nameId = `${formId}-name`;
  const phoneId = `${formId}-phone`;
  const serviceId = `${formId}-service`;
  const errorId = `${formId}-error`;
  const callWindowGroupId = `${formId}-call-window`;
  const quote = useMemo(() => parseIletisimQuoteParams(search), [search]);
  const leadDistrict = (quote.district || defaultDistrict || "").trim();
  const leadSector = (quote.sector || defaultSector || "").trim();
  const referralCode = useMemo(() => readReferralCode(search), [search]);
  const quoteService = quoteServiceValue(serviceFromSearch(search) || quote.service);
  const draft = useMemo(() => readCallbackDraft(), []);
  const [sent, setSent] = useState(false);
  const [waHref, setWaHref] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(() => draft?.name || "");
  const [phone, setPhone] = useState(() => draft?.phone || "");
  const [callWindow, setCallWindow] = useState<CallWindowId>(() => draft?.callWindow || "any");
  const [service, setService] = useState(() => pickInitialService(quoteService, defaultService, draft?.service));
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sent) return;
    const next: CallbackDraft = { name, phone, service, callWindow };
    const timer = window.setTimeout(() => {
      try {
        if (!callbackDraftHasTypedContent(next, quoteService)) {
          sessionStorage.removeItem(DRAFT_KEY);
          return;
        }
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota / private mode */
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [name, phone, service, callWindow, quoteService, sent]);

  useEffect(() => {
    if (!sent) return;
    successHeadingRef.current?.focus();
  }, [sent]);

  const callWindowMeta = CALL_WINDOWS.find((item) => item.id === callWindow) || CALL_WINDOWS[0];
  const hoursNote =
    callWindow === "any"
      ? "Arama tercihi: fark etmez"
      : `Arama tercihi: ${callWindowMeta.label} (${callWindowMeta.hint})`;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidTrPhone(phone)) {
      setError(PHONE_ERROR);
      return;
    }
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    const trimmedName = name.trim();
    const selectedService = String(form.get("service") || service || "Genel bilgi").trim();
    const companyFax = String(form.get("company_fax") || "").trim();
    if (trimmedName.length < 2) {
      setError("Adınızı ve soyadınızı yazın.");
      return;
    }
    const message = [
      "Merhaba Hatay360, web sitenizden teklif almak istiyorum.",
      `Ad Soyad: ${trimmedName}`,
      `Telefon: ${phone}`,
      `İlgilendiğim hizmet: ${selectedService}`,
      leadDistrict ? `İlçe: ${leadDistrict}` : "",
      leadSector ? `Sektör: ${leadSector}` : "",
      hoursNote,
      quote.summary ? `Seçim: ${quote.summary}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitting(true);
    setError("");
    try {
      await apiRequest<{ ok: boolean; id: number }>("/api/leads", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          phone,
          service: selectedService,
          sourcePath: pathname + (search || ""),
          company_fax: companyFax,
          sector: quote.sector || defaultSector || "",
          district: quote.district || defaultDistrict || "",
          notes: quote.notes,
          hours: hoursNote,
          ref: referralCode || undefined,
        }),
      });
      setWaHref(toWhatsAppHref(settings.phone, message));
      setSent(true);
      formElement.reset();
      setName("");
      setPhone("");
      setCallWindow("any");
      setService(pickInitialService(quoteService, defaultService));
      clearCallbackDraft();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Talep kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    const openNow = isSupportOpenNow(settings.supportWeekdayHours, settings.supportSaturdayHours);
    const nextHours = nextSupportChange(settings.supportWeekdayHours, settings.supportSaturdayHours);
    const waLink = waHref || toWhatsAppHref(settings.phone, "Merhaba Hatay360, teklif almak istiyorum.");
    const steps = [
      callbackReturnCopy(openNow, nextHours.label),
      "Dilerseniz WhatsApp ile hemen yazabilirsiniz.",
      "İsterseniz Google Maps kaydı da başlatabilirsiniz.",
    ];

    return (
      <div
        className={`rounded-2xl border border-[#b3e5ee] bg-[#e8f8fb] text-left ${compact ? "p-5" : "p-7 sm:p-8"}`}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="h-10 w-10 text-[#00a8c4]" aria-hidden="true" />
        <h3
          ref={successHeadingRef}
          tabIndex={-1}
          className="mt-3 text-[20px] font-bold text-[#1a1a1a] outline-none focus-visible:ring-2 focus-visible:ring-[#00a8c4] focus-visible:ring-offset-2"
        >
          Talebiniz alındı
        </h3>
        <p className="mt-1 text-[14px] text-[#6f6c8f]">Sırada ne olacak:</p>
        <ol className="mt-4 space-y-2.5">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00a8c4] text-[12px] font-black text-white">
                {index + 1}
              </span>
              <span className="text-[14px] leading-relaxed text-[#334155]">{step}</span>
            </li>
          ))}
        </ol>
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3.5 text-[16px] font-semibold text-white shadow-[0px_10px_28px_rgba(0,168,196,0.35)]"
        >
          <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
          WhatsApp ile yaz
        </a>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link
            to="/google-maps-harita-kaydi"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#b3e5ee] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#007f98] hover:border-[#00a8c4]"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Google Maps kaydı
          </Link>
          <Link
            to="/paketler"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#b3e5ee] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#007f98] hover:border-[#00a8c4]"
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            Paketler
          </Link>
        </div>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setWaHref("");
          }}
          className="mt-4 text-[13px] font-semibold text-[#00a8c4] hover:underline"
        >
          Yeni bir talep oluştur
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} {...turkishFormProps} className="space-y-4" aria-describedby={error ? errorId : undefined}>
      {!compact && (
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00a8c4] text-white" aria-hidden="true">
            <PhoneCall className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-[20px] font-bold text-[#1a1a1a]">Numaranızı bırakın, sizi arayalım</h3>
            <p className="text-[14px] text-[#6f6c8f]">Ücretsiz keşif görüşmesi. Kredi kartı gerekmez.</p>
          </div>
        </div>
      )}
      {compact && (
        <div>
          <p className="text-[15px] font-semibold text-[#1a1a1a]">Numaranızı bırakın, sizi arayalım</p>
          {leadDistrict ? (
            <p className="mt-1 text-[11px] font-semibold text-[#007f98]">{leadDistrict}</p>
          ) : null}
        </div>
      )}

      {quote.hasPrefill && quote.summary ? (
        <div className="rounded-xl border border-[#b3e5ee] bg-[#f4fbfd] px-4 py-3">
          <p className="text-[11px] font-black uppercase tracking-wide text-[#00a8c4]">Seçiminiz</p>
          <p className="mt-1 text-[13px] leading-relaxed text-[#334155]">{quote.summary}</p>
        </div>
      ) : null}

      {error ? (
        <div id={errorId}>
          <FormError>{error}</FormError>
        </div>
      ) : null}
      <HoneypotField />

      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <label className={labelClass} htmlFor={nameId}>
            Ad Soyad
          </label>
          <input
            id={nameId}
            required
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Adınız Soyadınız"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={phoneId}>
            Telefon
          </label>
          <PhoneField
            id={phoneId}
            value={phone}
            onChange={setPhone}
            className="mt-2 w-full rounded-xl border border-[#ecebf5] bg-white px-4 py-3 text-[15px] text-[#1a1a1a] outline-none transition focus:border-[#00a8c4] aria-[invalid=true]:border-2 aria-[invalid=true]:border-red-500 aria-[invalid=true]:bg-red-50"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor={serviceId}>
          İlgilendiğiniz hizmet
        </label>
        <select
          id={serviceId}
          required
          name="service"
          value={service}
          onChange={(event) => setService(event.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>
            Seçin
          </option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-2">
        <legend id={callWindowGroupId} className="text-[12px] font-bold text-[#425965]">
          Ne zaman arayalım?
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-labelledby={callWindowGroupId}>
          {CALL_WINDOWS.map((item) => {
            const selected = callWindow === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setCallWindow(item.id)}
                className={`rounded-xl border px-3 py-2.5 text-left transition ${
                  selected
                    ? "border-[#00a8c4] bg-[#e8f8fb] shadow-[0_0_0_1px_rgba(0,168,196,0.35)]"
                    : "border-[#ecebf5] bg-white hover:border-[#b3e5ee]"
                }`}
              >
                <span className={`block text-[12px] font-black ${selected ? "text-[#007f98]" : "text-[#1a1a1a]"}`}>
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[10px] font-medium text-[#6f6c8f]">{item.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-[13px] leading-relaxed text-[#6f6c8f]">
        <input required type="checkbox" className="mt-1 accent-[#00a8c4]" />
        <span>
          <Link to="/gizlilik" className="font-medium text-[#00a8c4] hover:underline">
            Gizlilik
          </Link>{" "}
          ve{" "}
          <Link to="/kvkk" className="font-medium text-[#00a8c4] hover:underline">
            KVKK
          </Link>{" "}
          metnini okudum, aranmayı kabul ediyorum.
        </span>
      </label>

      <motion.button
        type="submit"
        disabled={submitting}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3.5 text-[16px] font-semibold text-white shadow-[0px_10px_28px_rgba(0,168,196,0.35)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Kaydediliyor…" : "Beni Arayın"} <Send className="h-[18px] w-[18px]" aria-hidden="true" />
      </motion.button>
    </form>
  );
}
