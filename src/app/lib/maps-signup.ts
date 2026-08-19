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
