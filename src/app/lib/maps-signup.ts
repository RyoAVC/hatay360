import { isValidTrPhone } from "./contact.ts";
import { OFFICIAL_HATAY_DISTRICTS } from "./seo.ts";

export const MAPS_DRAFT_KEY = "hatay360_maps_draft";

export const WEEK_DAYS = [
  { id: "pazartesi", label: "Pazartesi" },
  { id: "sali", label: "Salı" },
  { id: "carsamba", label: "Çarşamba" },
  { id: "persembe", label: "Perşembe" },
  { id: "cuma", label: "Cuma" },
  { id: "cumartesi", label: "Cumartesi" },
  { id: "pazar", label: "Pazar" },
] as const;

export type WeekDayId = (typeof WEEK_DAYS)[number]["id"];

export type DayHours = {
  closed: boolean;
  open: string;
  close: string;
};

export type MapsDraft = {
  businessName: string;
  sector: string;
  district: string;
  address: string;
  phone: string;
  website: string;
  hours: string;
  description: string;
  dayHours: Record<WeekDayId, DayHours>;
};

/** Google İşletme Profili tarzı yaygın kategoriler */
export const GOOGLE_CATEGORIES = [
  "Restoran",
  "Kafe",
  "Pastane",
  "Tatlıcı",
  "Fırın",
  "Otel",
  "Pansiyon",
  "Kuaför",
  "Güzellik salonu",
  "Berber",
  "Diş kliniği",
  "Doktor",
  "Klinik",
  "Eczane",
  "Veteriner",
  "Avukat",
  "Muhasebeci",
  "Emlak ofisi",
  "Oto tamir",
  "Oto kaporta",
  "Oto galeri",
  "Lastikçi",
  "Taksi durağı",
  "Nakliyat",
  "Kargo",
  "Market",
  "Manav",
  "Kasap",
  "Şarküteri",
  "Aktar",
  "Giyim mağazası",
  "Butik",
  "Ayakkabı mağazası",
  "Kuyumcu",
  "Takı mağazası",
  "Nalbur",
  "Hırdavat",
  "Züccaciye",
  "Mobilya mağazası",
  "Elektronik mağazası",
  "Telefon tamiri",
  "Bilgisayar tamiri",
  "Teknik servis",
  "Kuru temizleme",
  "Halı yıkama",
  "Çamaşırhane",
  "Çiçekçi",
  "Spor salonu",
  "Okul",
  "Kreş",
  "İnşaat firması",
  "PVC doğrama",
  "Tesisatçı",
  "Elektrikçi",
  "Temizlik hizmeti",
  "Fotoğraf stüdyosu",
  "Düğün organizasyonu",
  "Seyahat acentesi",
  "Sigorta acentesi",
  "Web tasarım ajansı",
  "Reklam ajansı",
  "Yazılım şirketi",
  "Diğer",
];

const GBP_ALIASES: [string, string][] = [
  ["tras", "Berber"],
  ["traş", "Berber"],
  ["berber", "Berber"],
  ["kuafor", "Kuaför"],
  ["kuaför", "Kuaför"],
  ["dental", "Diş kliniği"],
  ["dis ", "Diş kliniği"],
  ["diş", "Diş kliniği"],
  ["eczane", "Eczane"],
  ["kombi", "Teknik servis"],
  ["klima", "Teknik servis"],
  ["kaporta", "Oto kaporta"],
  ["lastik", "Lastikçi"],
  ["taksi", "Taksi durağı"],
  ["kuyum", "Kuyumcu"],
  ["kasap", "Kasap"],
  ["spor", "Spor salonu"],
  ["fitness", "Spor salonu"],
  ["manav", "Manav"],
  ["sigorta", "Sigorta acentesi"],
  ["dask", "Sigorta acentesi"],
  ["kasko", "Sigorta acentesi"],
  ["marangoz", "Mobilya mağazası"],
  ["mutfak", "Mobilya mağazası"],
  ["organizasyon", "Düğün organizasyonu"],
  ["düğün", "Düğün organizasyonu"],
  ["zucca", "Züccaciye"],
  ["zücca", "Züccaciye"],
  ["porselen", "Züccaciye"],
  ["halı yıka", "Halı yıkama"],
  ["hali yika", "Halı yıkama"],
  ["kilim", "Halı yıkama"],
  ["künefe", "Tatlıcı"],
  ["kunefe", "Tatlıcı"],
  ["koltuk", "Mobilya mağazası"],
  ["kanepe", "Mobilya mağazası"],
  ["ayakkabı", "Ayakkabı mağazası"],
  ["ayakkabi", "Ayakkabı mağazası"],
  ["pvc", "PVC doğrama"],
  ["doğrama", "PVC doğrama"],
  ["dograma", "PVC doğrama"],
  ["sucuk", "Şarküteri"],
  ["pastırma", "Şarküteri"],
  ["pastirma", "Şarküteri"],
  ["şarküteri", "Şarküteri"],
  ["sarkuteri", "Şarküteri"],
];

export function suggestGbpCategories(hint: string, catalog: readonly string[] = GOOGLE_CATEGORIES, limit = 6) {
  const term = String(hint || "").replace(/[<>]/g, "").trim().toLocaleLowerCase("tr-TR");
  if (term.length < 3) return [];
  const scored = catalog.map((item) => {
    const name = item.toLocaleLowerCase("tr-TR");
    let score = 0;
    if (name === term) score = 100;
    else if (name.includes(term) || term.includes(name)) score = 80;
    else {
      const words = term.split(/[^a-z0-9çğıöşü]+/i).filter((word) => word.length >= 3);
      score = words.reduce((sum, word) => sum + (name.includes(word) ? 25 : 0), 0);
    }
    for (const [alias, category] of GBP_ALIASES) {
      if (term.includes(alias) && item === category) score = Math.max(score, 90);
    }
    return { item, score };
  });
  return [...new Set(scored.filter((row) => row.score > 0).sort((a, b) => b.score - a.score).map((row) => row.item))].slice(0, limit);
}

export function buildGbpDescription(input: { name: string; sector: string; district: string }) {
  const name = String(input.name || "").replace(/[<>]/g, "").trim().slice(0, 80);
  const sector = String(input.sector || "").replace(/[<>]/g, "").trim().slice(0, 40);
  const district = String(input.district || "").replace(/[<>]/g, "").trim().slice(0, 30) || "Hatay";
  if (!name) return "";
  const what = sector || "yerel hizmet";
  return `${name}, ${district} bölgesinde ${what} sunar. Randevu, fiyat ve yol tarifi için arayın. Sahte yorum veya teşvik karşılığı puan istemeyiz.`.slice(0, 750);
}

export const MAPS_DISTRICTS = [...OFFICIAL_HATAY_DISTRICTS];

export function defaultDayHours(): Record<WeekDayId, DayHours> {
  return {
    pazartesi: { closed: false, open: "09:00", close: "18:00" },
    sali: { closed: false, open: "09:00", close: "18:00" },
    carsamba: { closed: false, open: "09:00", close: "18:00" },
    persembe: { closed: false, open: "09:00", close: "18:00" },
    cuma: { closed: false, open: "09:00", close: "18:00" },
    cumartesi: { closed: false, open: "09:00", close: "18:00" },
    pazar: { closed: true, open: "09:00", close: "18:00" },
  };
}

export function emptyMapsDraft(): MapsDraft {
  return {
    businessName: "",
    sector: "",
    district: "Antakya",
    address: "",
    phone: "",
    website: "",
    hours: "",
    description: "",
    dayHours: defaultDayHours(),
  };
}

export function formatHours(dayHours: Record<WeekDayId, DayHours>) {
  return WEEK_DAYS.map((day) => {
    const value = dayHours[day.id];
    if (value.closed) return `${day.label} Kapalı`;
    return `${day.label} ${value.open}–${value.close}`;
  }).join(" · ");
}

const WEEKDAY_SHORT_TO_ID: Record<string, WeekDayId> = {
  Mon: "pazartesi",
  Tue: "sali",
  Wed: "carsamba",
  Thu: "persembe",
  Fri: "cuma",
  Sat: "cumartesi",
  Sun: "pazar",
};

export function minutesFromHhmm(value: string) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function istanbulClock(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value || "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  return {
    dayId: WEEKDAY_SHORT_TO_ID[weekday] || ("pazartesi" as WeekDayId),
    minutes: hour * 60 + minute,
  };
}

function dayOpenAt(value: DayHours | undefined, minutes: number) {
  if (!value || value.closed) return false;
  const open = minutesFromHhmm(value.open);
  const close = minutesFromHhmm(value.close);
  if (open == null || close == null) return false;
  if (close > open) return minutes >= open && minutes < close;
  if (close < open) return minutes >= open || minutes < close;
  return true;
}

/** Girilen haftalık saatlere göre Hatay (Europe/Istanbul) anlık Açık / Kapalı. */
export function resolveMapsOpenNow(dayHours: Record<WeekDayId, DayHours>, now: Date = new Date()) {
  const { dayId, minutes } = istanbulClock(now);
  const dayMeta = WEEK_DAYS.find((day) => day.id === dayId) || WEEK_DAYS[0];
  const today = dayHours[dayId];
  const dayIndex = WEEK_DAYS.findIndex((day) => day.id === dayId);
  const prevId = WEEK_DAYS[(dayIndex + 6) % 7]?.id;
  const prev = prevId ? dayHours[prevId] : undefined;
  const prevClose = prev && !prev.closed ? minutesFromHhmm(prev.close) : null;
  const prevOpen = prev && !prev.closed ? minutesFromHhmm(prev.open) : null;
  const fromOvernight =
    prevOpen != null && prevClose != null && prevClose < prevOpen && minutes < prevClose;

  const open = fromOvernight || dayOpenAt(today, minutes);
  if (!today || today.closed) {
    return {
      open: fromOvernight,
      statusLabel: fromOvernight ? "Açık" : "Kapalı",
      todayLabel: dayMeta.label,
      detail: fromOvernight
        ? `Dünden devam · ${prev?.open}–${prev?.close}`
        : "Bugün kapalı yazılmış",
    };
  }

  return {
    open,
    statusLabel: open ? "Açık" : "Kapalı",
    todayLabel: dayMeta.label,
    detail: open
      ? fromOvernight && !dayOpenAt(today, minutes)
        ? `Dünden devam · ${prev?.open}–${prev?.close}`
        : `Bugün ${today.open}–${today.close}`
      : `Bugün ${today.open}–${today.close} · şu an kapalı`,
  };
}

const SCHEMA_DAYS: Record<WeekDayId, string> = {
  pazartesi: "Mo",
  sali: "Tu",
  carsamba: "We",
  persembe: "Th",
  cuma: "Fr",
  cumartesi: "Sa",
  pazar: "Su",
};

function schemaTime(value: string) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "09:00";
  const hour = Math.min(23, Number(match[1]));
  const minute = Math.min(59, Number(match[2]));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function buildOpeningHoursSchema(dayHours: Record<WeekDayId, DayHours>) {
  return WEEK_DAYS.flatMap((day) => {
    const value = dayHours[day.id];
    if (value.closed) return [];
    return [`${SCHEMA_DAYS[day.id]} ${schemaTime(value.open)}-${schemaTime(value.close)}`];
  });
}

export function saveMapsDraft(draft: MapsDraft) {
  const next = { ...draft, hours: formatHours(draft.dayHours) };
  sessionStorage.setItem(MAPS_DRAFT_KEY, JSON.stringify(next));
  return next;
}

export function readMapsDraft(): MapsDraft | null {
  try {
    const raw = sessionStorage.getItem(MAPS_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MapsDraft>;
    return { ...emptyMapsDraft(), ...parsed, dayHours: { ...defaultDayHours(), ...parsed.dayHours } };
  } catch {
    return null;
  }
}

export function clearMapsDraft() {
  sessionStorage.removeItem(MAPS_DRAFT_KEY);
}

export function mapsDraftHasProgress(draft: MapsDraft) {
  return (
    draft.businessName.trim().length >= 2 ||
    draft.sector.trim().length >= 2 ||
    draft.address.trim().length >= 8 ||
    draft.phone.trim().length >= 10 ||
    draft.description.trim().length >= 20
  );
}

export function districtFromMapsSearch(search: string) {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const raw = String(params.get("ilce") || params.get("district") || "").trim();
  if (!raw) return "";
  const needle = raw.toLocaleLowerCase("tr-TR");
  return MAPS_DISTRICTS.find((item) => item.toLocaleLowerCase("tr-TR") === needle) || "";
}

export function applyMapsQueryDistrict(draft: MapsDraft, search: string): MapsDraft {
  if (mapsDraftHasProgress(draft)) return draft;
  const district = districtFromMapsSearch(search);
  if (!district || draft.district === district) return draft;
  return { ...draft, district };
}

/** Adım tamam mı? (1–6). Saatler (5) her zaman geçerli. */
export function isMapsStepComplete(step: number, draft: MapsDraft) {
  if (step === 1) return draft.businessName.trim().length >= 2;
  if (step === 2) return draft.sector.trim().length >= 2;
  if (step === 3) return Boolean(draft.district) && draft.address.trim().length >= 8;
  if (step === 4) return isValidTrPhone(draft.phone);
  if (step === 5) return true;
  if (step === 6) return draft.description.trim().length >= 20;
  return false;
}

/** Kayıtlı taslaktan devam: ilk eksik adım (hepsi doluysa 6). */
export function firstIncompleteMapsStep(draft: MapsDraft) {
  for (let step = 1; step <= 6; step += 1) {
    if (!isMapsStepComplete(step, draft)) return step;
  }
  return 6;
}

/** İleri zıplamayı kilitle: en fazla ilk eksik adım. */
export function maxReachableMapsStep(draft: MapsDraft) {
  return firstIncompleteMapsStep(draft);
}
