import { FormEvent, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Link, useLocation } from "react-router";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, MapPin, MessageCircle, RotateCcw, Search, Store, Phone } from "lucide-react";
import { PhoneField } from "./phone-field";
import { FormError } from "./form-error";
import { HoneypotField } from "./honeypot-field";
import { useContent } from "../context/content-context";
import { apiRequest } from "../lib/api";
import { readReferralCode } from "../lib/referral";
import { sanitizePhoneInput, toWhatsAppHref } from "../lib/contact";
import {
  GOOGLE_CATEGORIES,
  MAPS_DISTRICTS,
  WEEK_DAYS,
  clearMapsDraft,
  emptyMapsDraft,
  applyMapsQueryDistrict,
  districtFromMapsSearch,
  firstIncompleteMapsStep,
  formatHours,
  isMapsStepComplete,
  mapsDraftHasProgress,
  maxReachableMapsStep,
  readMapsDraft,
  resolveMapsOpenNow,
  saveMapsDraft,
  suggestGbpCategories,
  buildGbpDescription,
  type MapsDraft,
  type WeekDayId,
} from "../lib/maps-signup";

type MapsListingWizardProps = {
  onSubmitted?: (sent: boolean) => void;
};

const STEPS = [
  { id: 1, title: "İşletme adı" },
  { id: 2, title: "Kategori" },
  { id: 3, title: "Konum" },
  { id: 4, title: "İletişim" },
  { id: 5, title: "Saatler" },
  { id: 6, title: "İçerik" },
];

function stepBlockHint(step: number, draft: MapsDraft): string | null {
  if (step === 1 && draft.businessName.trim().length < 2) return "İşletme adını en az 2 karakter yazın.";
  if (step === 2 && draft.sector.trim().length < 2) return "Listeden bir kategori seçin veya yazın.";
  if (step === 3 && draft.address.trim().length < 8) return "Mahalle, cadde ve numara olacak şekilde adresi tamamlayın.";
  if (step === 4 && !isMapsStepComplete(4, draft)) return "Geçerli bir Türkiye telefon numarası girin.";
  if (step === 6 && draft.description.trim().length < 20) return `Açıklama en az 20 karakter olmalı (${draft.description.trim().length}/20).`;
  return null;
}

export function MapsListingWizard({ onSubmitted }: MapsListingWizardProps) {
  const { settings } = useContent();
  const { hash, pathname, search } = useLocation();
  const referralCode = useMemo(() => readReferralCode(search), [search]);
  const initialDraft = useMemo(() => {
    const base = readMapsDraft() || emptyMapsDraft();
    return applyMapsQueryDistrict(base, search);
  }, []);
  const [step, setStep] = useState(() => firstIncompleteMapsStep(initialDraft));
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<MapsDraft>(() => initialDraft);
  const [resumeNote, setResumeNote] = useState(() =>
    mapsDraftHasProgress(initialDraft) ? "Kaldığınız yerden devam ediyorsunuz." : "",
  );
  const [sent, setSent] = useState(false);
  const [waHref, setWaHref] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const stepInitialized = useRef(false);

  const categories = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr-TR");
    if (!term) return GOOGLE_CATEGORIES;
    return GOOGLE_CATEGORIES.filter((item) => item.toLocaleLowerCase("tr-TR").includes(term));
  }, [query]);
  const hints = useMemo(
    () => suggestGbpCategories(`${draft.businessName} ${query}`),
    [draft.businessName, query],
  );
  const openNow = useMemo(() => resolveMapsOpenNow(draft.dayHours), [draft.dayHours]);
  const hasProgress = mapsDraftHasProgress(draft);
  const maxStep = maxReachableMapsStep(draft);

  useEffect(() => {
    if (hash === "#harita-kaydi") {
      document.getElementById("harita-kaydi")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  useEffect(() => {
    const fromQuery = districtFromMapsSearch(search);
    if (!fromQuery) return;
    setDraft((current) => {
      if (mapsDraftHasProgress(current)) return current;
      const next = current.district === fromQuery ? current : { ...current, district: fromQuery };
      saveMapsDraft(next);
      return next;
    });
  }, [search]);

  useEffect(() => {
    if (!hasProgress) return;
    saveMapsDraft(draft);
  }, [draft, hasProgress]);

  useEffect(() => {
    if (!stepInitialized.current) {
      stepInitialized.current = true;
      return;
    }
    if (sent) return;
    stepHeadingRef.current?.focus({ preventScroll: true });
  }, [step, sent]);

  useEffect(() => {
    if (!sent) return;
    successHeadingRef.current?.focus();
    document.getElementById("harita-kaydi")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [sent]);

  useEffect(() => {
    if (step > maxStep) setStep(maxStep);
  }, [step, maxStep]);

  const canNext = isMapsStepComplete(step, draft);
  const blockHint = canNext ? null : stepBlockHint(step, draft);

  const goToStep = (next: number) => {
    if (next < 1 || next > 6) return;
    if (next > maxStep) return;
    setStep(next);
  };

  const clearDraft = () => {
    clearMapsDraft();
    const fresh = applyMapsQueryDistrict(emptyMapsDraft(), search);
    setDraft(fresh);
    if (districtFromMapsSearch(search)) saveMapsDraft(fresh);
    setQuery("");
    setStep(1);
    setResumeNote("");
    setSent(false);
    setWaHref("");
    setError("");
    onSubmitted?.(false);
  };

  const goNext = () => {
    if (!canNext) return;
    if (step < 6) setStep((value) => value + 1);
    else formRef.current?.requestSubmit();
  };

  const onStepKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA" || target.tagName === "BUTTON" || target.tagName === "SELECT") return;
    if (target.getAttribute("type") === "checkbox" || target.getAttribute("type") === "time") return;
    event.preventDefault();
    goNext();
  };

  const applyMondayHoursToOpenDays = () => {
    const monday = draft.dayHours.pazartesi;
    const next = { ...draft.dayHours };
    for (const day of WEEK_DAYS) {
      if (day.id === "pazartesi") continue;
      if (next[day.id].closed) continue;
      next[day.id] = { ...next[day.id], open: monday.open, close: monday.close, closed: false };
    }
    setDraft({ ...draft, dayHours: next });
  };

  const goRegister = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (step !== 6 || !canNext || submitting) return;
    const saved = saveMapsDraft(draft);
    const formElement = event?.currentTarget;
    const companyFax = formElement ? String(new FormData(formElement).get("company_fax") || "").trim() : "";
    const waMessage = [
      "Merhaba Hatay360, Google Maps kaydı için yazıyorum.",
      `İşletme: ${saved.businessName}`,
      `Kategori: ${saved.sector}`,
      `İlçe: ${saved.district}`,
      saved.address ? `Adres: ${saved.address}` : "",
      saved.phone ? `Telefon: ${saved.phone}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitting(true);
    setError("");
    try {
      await apiRequest<{ ok: boolean; id: number }>("/api/leads", {
        method: "POST",
        body: JSON.stringify({
          name: saved.businessName,
          phone: saved.phone,
          kind: "maps",
          service: "Google Maps / harita",
          sourcePath: pathname + (search || ""),
          sector: saved.sector || "",
          district: saved.district || "",
          address: saved.address || "",
          hours: saved.hours || "",
          website: saved.website || "",
          notes: [
            saved.businessName && `İşletme: ${saved.businessName}`,
            saved.sector && `Sektör: ${saved.sector}`,
            saved.description,
          ]
            .filter(Boolean)
            .join("\n"),
          company_fax: companyFax,
          ref: referralCode || undefined,
        }),
      });
      setWaHref(toWhatsAppHref(settings.phone, waMessage));
      setSent(true);
      onSubmitted?.(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Talep kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="harita-kaydi" className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
      <div className="overflow-hidden rounded-[28px] border border-[#d2e3fc] bg-white shadow-[0_24px_70px_rgba(66,133,244,0.12)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8eaed] bg-[#f8f9fa] px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <path fill="#4285F4" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" />
                <circle cx="12" cy="9" r="2.4" fill="#fff" />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1a73e8]">Google Haritalar kaydı</p>
              <h2 className="text-[18px] font-black tracking-[-0.03em] text-[#202124]">İşletme profili bilgilerini doldurun</h2>
            </div>
          </div>
          {hasProgress && !sent ? (
            <button
              type="button"
              onClick={clearDraft}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#dadce0] bg-white px-3 py-2 text-[11px] font-black text-[#5f6368] hover:bg-[#f8f9fa]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Taslağı sil
            </button>
          ) : null}
        </div>

        {sent ? (
          <div className="p-5 sm:p-8" role="status" aria-live="polite">
            <CheckCircle2 className="h-10 w-10 text-[#1a73e8]" aria-hidden="true" />
            <h3
              ref={successHeadingRef}
              tabIndex={-1}
              className="mt-3 text-[22px] font-black text-[#202124] outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2"
            >
              Talebiniz alındı
            </h3>
            <p className="mt-1 text-[14px] text-[#5f6368]">Sırada ne olacak:</p>
            <ol className="mt-4 space-y-2.5">
              {[
                "Çalışma saatleri ile NAP (işletme adı, adres, telefon) bilgilerinizi inceleriz.",
                "Ardından Google harita kaydını sizin adınıza ilerletiriz.",
                "Dilerseniz WhatsApp’tan yazın veya iletişim sayfasından ulaşın.",
              ].map((item, index) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-[12px] font-black text-white">
                    {index + 1}
                  </span>
                  <span className="text-[14px] leading-relaxed text-[#3c4043]">{item}</span>
                </li>
              ))}
            </ol>
            <a
              href={waHref || toWhatsAppHref(settings.phone, "Merhaba Hatay360, Google Maps kaydı için yazıyorum.")}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a73e8] px-6 py-3.5 text-[16px] font-semibold text-white"
            >
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
              WhatsApp ile yaz
            </a>
            <Link
              to="/iletisim"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d2e3fc] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#174ea6] hover:border-[#1a73e8]"
            >
              İletişim
            </Link>
            <Link
              to="/musteri/kayit"
              state={{ fromMaps: true, draft }}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d2e3fc] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#174ea6] hover:border-[#1a73e8]"
            >
              Müşteri başvurusu
            </Link>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setWaHref("");
                setError("");
                onSubmitted?.(false);
              }}
              className="mt-4 text-[13px] font-semibold text-[#1a73e8] hover:underline"
            >
              Yeni bir kayıt başlat
            </button>
          </div>
        ) : null}

        {resumeNote && !sent ? (
          <p className="border-b border-[#d2e3fc] bg-[#e8f0fe] px-5 py-2.5 text-[12px] font-bold text-[#174ea6] sm:px-7" role="status">
            {resumeNote}
          </p>
        ) : null}

        {!sent ? (
        <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
          <ol className="hidden border-r border-[#e8eaed] bg-[#f8f9fa] p-5 lg:block" aria-label="Kayıt adımları">
            {STEPS.map((item) => {
              const locked = item.id > maxStep;
              return (
                <li key={item.id} className="mb-2">
                  <button
                    type="button"
                    onClick={() => goToStep(item.id)}
                    disabled={locked}
                    aria-current={step === item.id ? "step" : undefined}
                    aria-disabled={locked}
                    title={locked ? "Önce önceki adımları tamamlayın" : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
                      step === item.id ? "bg-white text-[#1a73e8] shadow-sm" : "text-[#5f6368] hover:bg-white/70"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                        item.id < step && isMapsStepComplete(item.id, draft)
                          ? "bg-[#34a853] text-white"
                          : step === item.id
                            ? "bg-[#1a73e8] text-white"
                            : "bg-[#e8eaed] text-[#5f6368]"
                      }`}
                    >
                      {item.id < step && isMapsStepComplete(item.id, draft) ? <Check className="h-3.5 w-3.5" /> : item.id}
                    </span>
                    {item.title}
                  </button>
                </li>
              );
            })}
          </ol>

          <form ref={formRef} onSubmit={goRegister} className="relative p-5 sm:p-7" onKeyDown={onStepKeyDown}>
            <HoneypotField />
            <div className="lg:hidden">
              <ol className="flex gap-1.5 overflow-x-auto pb-1" aria-label="Kayıt adımları">
                {STEPS.map((item) => {
                  const locked = item.id > maxStep;
                  const complete = item.id < step && isMapsStepComplete(item.id, draft);
                  return (
                    <li key={item.id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => goToStep(item.id)}
                        disabled={locked}
                        aria-current={step === item.id ? "step" : undefined}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-black disabled:opacity-35 ${
                          step === item.id
                            ? "bg-[#1a73e8] text-white"
                            : complete
                              ? "bg-[#e6f4ea] text-[#137333]"
                              : "bg-[#f1f3f4] text-[#5f6368]"
                        }`}
                      >
                        {item.id}. {item.title}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8eaed]" aria-hidden>
                <div
                  className="h-full rounded-full bg-[#1a73e8] transition-[width] duration-300"
                  style={{ width: `${(step / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <p className="mt-3 text-[11px] font-bold text-[#5f6368] lg:mt-0" aria-live="polite">
              Adım {step} / {STEPS.length}: {STEPS[step - 1]?.title}
            </p>

            {step === 1 && (
              <div>
                <h3
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="mt-2 flex items-center gap-2 text-[24px] font-black text-[#202124] outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40 focus-visible:ring-offset-2"
                >
                  <Store className="h-6 w-6 text-[#1a73e8]" aria-hidden /> İşletmenizin adı nedir?
                </h3>
                <p className="mt-2 text-[13px] text-[#5f6368]">Tabelada ve faturada görünen resmi adı yazın. Google’daki kayıt da bu isimle açılır.</p>
                <input
                  value={draft.businessName}
                  onChange={(event) => setDraft({ ...draft, businessName: event.target.value })}
                  placeholder="Örn. Defne Dental Klinik"
                  aria-label="İşletme adı"
                  aria-invalid={draft.businessName.trim().length > 0 && draft.businessName.trim().length < 2}
                  className="mt-5 w-full rounded-xl border border-[#dadce0] px-4 py-3.5 text-[15px] outline-none focus:border-[#1a73e8]"
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <h3
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="mt-2 text-[24px] font-black text-[#202124] outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40 focus-visible:ring-offset-2"
                >
                  Ana kategorinizi seçin
                </h3>
                <p className="mt-2 text-[13px] text-[#5f6368]">Müşteriler Google’da sizi bu sektörle arar. En yakın eşleşmeyi seçin.</p>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#dadce0] px-3 py-2.5">
                  <Search className="h-4 w-4 text-[#5f6368]" aria-hidden />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Kategori ara (restoran, kuaför, emlak…)"
                    aria-label="Kategori ara"
                    className="w-full bg-transparent text-[14px] outline-none"
                  />
                </div>
                {hints.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1a73e8]">Ada göre öneriler</p>
                    <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Önerilen kategoriler">
                      {hints.map((item) => (
                        <button
                          key={`hint-${item}`}
                          type="button"
                          onClick={() => setDraft({ ...draft, sector: item })}
                          aria-pressed={draft.sector === item}
                          className={`rounded-full border px-3 py-1.5 text-[12px] font-bold ${
                            draft.sector === item ? "border-[#1a73e8] bg-[#e8f0fe] text-[#174ea6]" : "border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa]"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2" role="listbox" aria-label="Kategori listesi">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="option"
                      aria-selected={draft.sector === item}
                      onClick={() => setDraft({ ...draft, sector: item })}
                      className={`rounded-xl border px-3 py-2.5 text-left text-[13px] font-bold ${
                        draft.sector === item ? "border-[#1a73e8] bg-[#e8f0fe] text-[#174ea6]" : "border-[#e8eaed] text-[#3c4043] hover:bg-[#f8f9fa]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {query.trim() && !GOOGLE_CATEGORIES.some((item) => item.toLocaleLowerCase("tr-TR") === query.trim().toLocaleLowerCase("tr-TR")) && (
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, sector: query.trim() })}
                    aria-pressed={draft.sector === query.trim()}
                    className="mt-3 w-full rounded-xl border border-dashed border-[#1a73e8] px-4 py-3 text-left text-[13px] font-bold text-[#174ea6]"
                  >
                    “{query.trim()}” kategorisini kullan
                  </button>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h3
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="mt-2 flex items-center gap-2 text-[24px] font-black text-[#202124] outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40 focus-visible:ring-offset-2"
                >
                  <MapPin className="h-6 w-6 text-[#ea4335]" aria-hidden /> Konum bilgisi
                </h3>
                <p className="mt-2 text-[13px] text-[#5f6368]">Haritada pin’in duracağı adres. İlçe ve sokak/no yazın.</p>
                <label className="mt-5 block text-[11px] font-black text-[#3c4043]">
                  İlçe
                  <select
                    value={draft.district}
                    onChange={(event) => setDraft({ ...draft, district: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-[#dadce0] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#1a73e8]"
                  >
                    {MAPS_DISTRICTS.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="mt-4 block text-[11px] font-black text-[#3c4043]">
                  Adres
                  <input
                    value={draft.address}
                    onChange={(event) => setDraft({ ...draft, address: event.target.value })}
                    placeholder="Mahalle, cadde, no, kat"
                    aria-invalid={draft.address.trim().length > 0 && draft.address.trim().length < 8}
                    className="mt-2 w-full rounded-xl border border-[#dadce0] px-4 py-3 text-[14px] outline-none focus:border-[#1a73e8]"
                  />
                </label>
              </div>
            )}

            {step === 4 && (
              <div>
                <h3
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="mt-2 flex items-center gap-2 text-[24px] font-black text-[#202124] outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40 focus-visible:ring-offset-2"
                >
                  <Phone className="h-6 w-6 text-[#34a853]" aria-hidden /> Telefon ve web sitesi
                </h3>
                <p className="mt-2 text-[13px] text-[#5f6368]">Haritada Ara düğmesine basıldığında bu numara aranır.</p>
                <div className="mt-5">
                  <PhoneField value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone: sanitizePhoneInput(phone) })} />
                </div>
                <input
                  value={draft.website}
                  onChange={(event) => setDraft({ ...draft, website: event.target.value.slice(0, 120) })}
                  placeholder="Web sitesi (varsa)"
                  aria-label="Web sitesi"
                  maxLength={120}
                  className="mt-3 w-full rounded-xl border border-[#dadce0] px-4 py-3.5 text-[15px] outline-none focus:border-[#1a73e8]"
                />
              </div>
            )}

            {step === 5 && (
              <div>
                <h3
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="mt-2 flex items-center gap-2 text-[24px] font-black text-[#202124] outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40 focus-visible:ring-offset-2"
                >
                  <Clock className="h-6 w-6 text-[#fbbc04]" aria-hidden /> Çalışma saatleri
                </h3>
                <p className="mt-2 text-[13px] text-[#5f6368]">Google’daki Açık / Kapalı bilgisinin kaynağı bu listedir.</p>
                <div
                  className={`mt-3 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 ${
                    openNow.open ? "border-[#ceead6] bg-[#e6f4ea]" : "border-[#fad2cf] bg-[#fce8e6]"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  <span className={`text-[12px] font-black ${openNow.open ? "text-[#137333]" : "text-[#c5221f]"}`}>
                    Şu an {openNow.statusLabel}
                  </span>
                  <span className="text-[11px] font-bold text-[#5f6368]">
                    {openNow.todayLabel} · {openNow.detail}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={applyMondayHoursToOpenDays}
                  className="mt-3 rounded-xl border border-[#dadce0] px-3 py-2 text-[12px] font-black text-[#174ea6] hover:bg-[#f8f9fa]"
                >
                  Pazartesi saatini açık günlere uygula
                </button>
                <div className="mt-4 space-y-2">
                  {WEEK_DAYS.map((day) => {
                    const value = draft.dayHours[day.id];
                    return (
                      <div key={day.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-xl border border-[#e8eaed] px-3 py-2">
                        <span className="text-[12px] font-black text-[#202124]">{day.label}</span>
                        <label className="flex items-center gap-1 text-[11px] font-bold text-[#5f6368]">
                          <input
                            type="checkbox"
                            checked={value.closed}
                            onChange={(event) =>
                              setDraft({
                                ...draft,
                                dayHours: { ...draft.dayHours, [day.id]: { ...value, closed: event.target.checked } },
                              })
                            }
                          />
                          Kapalı
                        </label>
                        <input
                          type="time"
                          disabled={value.closed}
                          value={value.open}
                          aria-label={`${day.label} açılış`}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              dayHours: { ...draft.dayHours, [day.id as WeekDayId]: { ...value, open: event.target.value } },
                            })
                          }
                          className="rounded-lg border border-[#dadce0] px-2 py-1 text-[12px] disabled:opacity-40"
                        />
                        <input
                          type="time"
                          disabled={value.closed}
                          value={value.close}
                          aria-label={`${day.label} kapanış`}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              dayHours: { ...draft.dayHours, [day.id as WeekDayId]: { ...value, close: event.target.value } },
                            })
                          }
                          className="rounded-lg border border-[#dadce0] px-2 py-1 text-[12px] disabled:opacity-40"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <h3
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="mt-2 text-[24px] font-black text-[#202124] outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/40 focus-visible:ring-offset-2"
                >
                  İşletme açıklaması
                </h3>
                <p className="mt-2 text-[13px] text-[#5f6368]">Müşterinin haritada okuyacağı kısa tanıtım. Hizmet, bölge ve farkınızı yazın.</p>
                <textarea
                  rows={5}
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  placeholder="Örn. Defne’de 12 yıldır diş tedavisi. İmplant, ortodonti ve acil muayene."
                  aria-label="İşletme açıklaması"
                  aria-invalid={draft.description.trim().length > 0 && draft.description.trim().length < 20}
                  className="mt-5 w-full rounded-xl border border-[#dadce0] px-4 py-3 text-[14px] outline-none focus:border-[#1a73e8]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      description: buildGbpDescription({
                        name: draft.businessName,
                        sector: draft.sector,
                        district: draft.district,
                      }),
                    })
                  }
                  className="mt-3 rounded-xl border border-[#dadce0] px-4 py-2 text-[12px] font-black text-[#174ea6] hover:bg-[#f8f9fa]"
                >
                  Ad ve kategoriden açıklama öner
                </button>
                <div className="mt-4 rounded-2xl border border-[#e8eaed] bg-[#f8f9fa] p-4 text-[12px] leading-relaxed text-[#5f6368]" aria-live="polite">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-black text-[#202124]">{draft.businessName || "İşletme adı"}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                        openNow.open ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#fce8e6] text-[#c5221f]"
                      }`}
                    >
                      {openNow.statusLabel}
                    </span>
                  </div>
                  <p className="mt-1">{draft.sector || "Kategori"} · {draft.district}</p>
                  <p className="mt-1">{draft.address}</p>
                  <p className="mt-1">{draft.phone}</p>
                  <p className="mt-2 text-[11px] font-bold text-[#3c4043]">
                    {openNow.todayLabel}: {openNow.detail}
                  </p>
                  <p className="mt-2">{formatHours(draft.dayHours)}</p>
                </div>
              </div>
            )}

            {error ? (
              <div className="mt-5">
                <FormError>{error}</FormError>
              </div>
            ) : null}

            {blockHint ? (
              <p className="mt-5 text-[12px] font-bold text-[#c5221f]" role="status" aria-live="polite">
                {blockHint}
              </p>
            ) : null}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep((value) => value - 1)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-[#1a73e8] disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden /> Geri
              </button>
              {step < 6 ? (
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={goNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1a73e8] px-5 py-2.5 text-[13px] font-black text-white disabled:opacity-40"
                >
                  İleri <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canNext || submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#188038] px-5 py-2.5 text-[13px] font-black text-white disabled:opacity-40"
                >
                  {submitting ? "Kaydediliyor…" : "Kayıt"} <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-[#80868b]">
              Kayıt dediğinizde Google hesabı açılmaz. Talebiniz Hatay360’a düşer; ekibimiz çalışma saatleri ve NAP bilgilerini inceler, ardından harita kaydını ilerletir.
            </p>
          </form>
        </div>
        ) : null}
      </div>
    </section>
  );
}
