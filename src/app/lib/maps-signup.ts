import { OFFICIAL_HATAY_DISTRICTS } from "./seo";

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
  "Mobilya mağazası",
  "Elektronik mağazası",
  "Telefon tamiri",
  "Bilgisayar tamiri",
  "Teknik servis",
  "Kuru temizleme",
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
  "Seyahat acentesi",
  "Sigorta acentesi",
  "Web tasarım ajansı",
  "Reklam ajansı",
  "Yazılım şirketi",
  "Diğer",
];

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
