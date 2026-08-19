import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, Clock, MapPin, Search, Store, Phone } from "lucide-react";
import { PhoneField } from "./phone-field";
import { isValidTrPhone, sanitizePhoneInput } from "../lib/contact";
import {
  GOOGLE_CATEGORIES,
  MAPS_DISTRICTS,
  WEEK_DAYS,
  emptyMapsDraft,
  formatHours,
  saveMapsDraft,
  type MapsDraft,
  type WeekDayId,
} from "../lib/maps-signup";

const STEPS = [
  { id: 1, title: "İşletme adı" },
  { id: 2, title: "Kategori" },
  { id: 3, title: "Konum" },
  { id: 4, title: "İletişim" },
  { id: 5, title: "Saatler" },
  { id: 6, title: "İçerik" },
];

export function MapsListingWizard() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<MapsDraft>(emptyMapsDraft);

  const categories = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr-TR");
    if (!term) return GOOGLE_CATEGORIES;
    return GOOGLE_CATEGORIES.filter((item) => item.toLocaleLowerCase("tr-TR").includes(term));
  }, [query]);

  useEffect(() => {
    if (hash === "#harita-kaydi") {
      document.getElementById("harita-kaydi")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  const canNext =
    (step === 1 && draft.businessName.trim().length >= 2) ||
    (step === 2 && draft.sector.trim().length >= 2) ||
    (step === 3 && draft.district && draft.address.trim().length >= 8) ||
    (step === 4 && isValidTrPhone(draft.phone)) ||
    step === 5 ||
    (step === 6 && draft.description.trim().length >= 20);

  const goRegister = () => {
    const saved = saveMapsDraft(draft);
    navigate("/musteri/kayit", { state: { fromMaps: true, draft: saved } });
  };

  return (
    <section id="harita-kaydi" className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
      <div className="overflow-hidden rounded-[28px] border border-[#d2e3fc] bg-white shadow-[0_24px_70px_rgba(66,133,244,0.12)]">
        <div className="flex items-center gap-3 border-b border-[#e8eaed] bg-[#f8f9fa] px-5 py-4 sm:px-7">
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

        <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
          <ol className="hidden border-r border-[#e8eaed] bg-[#f8f9fa] p-5 lg:block">
            {STEPS.map((item) => (
              <li key={item.id} className="mb-2">
                <button
                  type="button"
                  onClick={() => setStep(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-bold ${
                    step === item.id ? "bg-white text-[#1a73e8] shadow-sm" : "text-[#5f6368] hover:bg-white/70"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                      step > item.id ? "bg-[#34a853] text-white" : step === item.id ? "bg-[#1a73e8] text-white" : "bg-[#e8eaed] text-[#5f6368]"
                    }`}
                  >
                    {step > item.id ? <Check className="h-3.5 w-3.5" /> : item.id}
                  </span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>

          <div className="p-5 sm:p-7">
            <p className="text-[11px] font-bold text-[#5f6368]">Adım {step} / {STEPS.length}</p>

            {step === 1 && (
              <div>
                <h3 className="mt-2 flex items-center gap-2 text-[24px] font-black text-[#202124]"><Store className="h-6 w-6 text-[#1a73e8]" /> İşletmenizin adı nedir?</h3>
                <p className="mt-2 text-[13px] text-[#5f6368]">Tabelada ve faturada görünen resmi adı yazın. Google’daki kayıt da bu isimle açılır.</p>
                <input
                  value={draft.businessName}
                  onChange={(event) => setDraft({ ...draft, businessName: event.target.value })}
                  placeholder="Örn. Defne Dental Klinik"
                  className="mt-5 w-full rounded-xl border border-[#dadce0] px-4 py-3.5 text-[15px] outline-none focus:border-[#1a73e8]"
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="mt-2 text-[24px] font-black text-[#202124]">Ana kategorinizi seçin</h3>
                <p className="mt-2 text-[13px] text-[#5f6368]">Müşteriler Google’da sizi bu sektörle arar. En yakın eşleşmeyi seçin.</p>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#dadce0] px-3 py-2.5">
                  <Search className="h-4 w-4 text-[#5f6368]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Kategori ara (restoran, kuaför, emlak…)"
                    className="w-full bg-transparent text-[14px] outline-none"
                  />
                </div>
                <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
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
                    className="mt-3 w-full rounded-xl border border-dashed border-[#1a73e8] px-4 py-3 text-left text-[13px] font-bold text-[#174ea6]"
                  >
                    “{query.trim()}” kategorisini kullan
                  </button>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="mt-2 flex items-center gap-2 text-[24px] font-black text-[#202124]"><MapPin className="h-6 w-6 text-[#ea4335]" /> Konum bilgisi</h3>
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
                    className="mt-2 w-full rounded-xl border border-[#dadce0] px-4 py-3 text-[14px] outline-none focus:border-[#1a73e8]"
                  />
                </label>
              </div>
            )}

            {step === 4 && (
              <div>
                <h3 className="mt-2 flex items-center gap-2 text-[24px] font-black text-[#202124]"><Phone className="h-6 w-6 text-[#34a853]" /> Telefon ve web sitesi</h3>
                <p className="mt-2 text-[13px] text-[#5f6368]">Haritada Ara düğmesine basıldığında bu numara aranır.</p>
                <div className="mt-5">
                  <PhoneField value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone: sanitizePhoneInput(phone) })} />
                </div>
                <input
                  value={draft.website}
                  onChange={(event) => setDraft({ ...draft, website: event.target.value.slice(0, 120) })}
                  placeholder="Web sitesi (varsa)"
                  maxLength={120}
                  className="mt-3 w-full rounded-xl border border-[#dadce0] px-4 py-3.5 text-[15px] outline-none focus:border-[#1a73e8]"
                />
              </div>
            )}

            {step === 5 && (
              <div>
                <h3 className="mt-2 flex items-center gap-2 text-[24px] font-black text-[#202124]"><Clock className="h-6 w-6 text-[#fbbc04]" /> Çalışma saatleri</h3>
                <p className="mt-2 text-[13px] text-[#5f6368]">Google’daki Açık / Kapalı bilgisinin kaynağı bu listedir.</p>
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
                <h3 className="mt-2 text-[24px] font-black text-[#202124]">İşletme açıklaması</h3>
                <p className="mt-2 text-[13px] text-[#5f6368]">Müşterinin haritada okuyacağı kısa tanıtım. Hizmet, bölge ve farkınızı yazın.</p>
                <textarea
                  rows={5}
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  placeholder="Örn. Defne’de 12 yıldır diş tedavisi. İmplant, ortodonti ve acil muayene."
                  className="mt-5 w-full rounded-xl border border-[#dadce0] px-4 py-3 text-[14px] outline-none focus:border-[#1a73e8]"
                />
                <div className="mt-4 rounded-2xl bg-[#f8f9fa] p-4 text-[12px] leading-relaxed text-[#5f6368]">
                  <p className="font-black text-[#202124]">{draft.businessName || "İşletme adı"}</p>
                  <p className="mt-1">{draft.sector || "Kategori"} · {draft.district}</p>
                  <p className="mt-1">{draft.address}</p>
                  <p className="mt-1">{draft.phone}</p>
                  <p className="mt-2">{formatHours(draft.dayHours)}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep((value) => value - 1)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-[#1a73e8] disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" /> Geri
              </button>
              {step < 6 ? (
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => setStep((value) => value + 1)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1a73e8] px-5 py-2.5 text-[13px] font-black text-white disabled:opacity-40"
                >
                  İleri <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={goRegister}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#188038] px-5 py-2.5 text-[13px] font-black text-white disabled:opacity-40"
                >
                  Kayıt <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-[#80868b]">
              Kayıt dediğinizde Google hesabı açılmaz. Hatay360 kayıt ekranına geçersiniz; ekibimiz sizi arayıp harita kaydını sizin adınıza tamamlar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
