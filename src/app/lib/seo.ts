export type District = {
  name: string;
  blurb: string;
};

/** Hatay büyükşehir — resmi 15 ilçe */
export const OFFICIAL_HATAY_DISTRICTS = [
  "Antakya",
  "Defne",
  "Arsuz",
  "İskenderun",
  "Dörtyol",
  "Payas",
  "Erzin",
  "Kırıkhan",
  "Reyhanlı",
  "Kumlu",
  "Hassa",
  "Altınözü",
  "Yayladağı",
  "Samandağ",
  "Belen",
] as const;

export function districtBlurb(name: string) {
  return `${name} web tasarım, ${name} reklam ve e-ticaret. Hatay360 ile kurumsal site, Google Ads ve mağaza altyapısı.`;
}

export const DEFAULT_DISTRICTS: District[] = OFFICIAL_HATAY_DISTRICTS.map((name) => ({
  name,
  blurb: districtBlurb(name),
}));

export const FEATURED_DISTRICT_NAMES = ["Antakya", "Defne", "İskenderun", "Dörtyol", "Samandağ"] as const;

export function districtSlug(name: string) {
  return name
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function districtPath(name: string) {
  return `/hatay/${districtSlug(name)}`;
}

export function findDistrictBySlug(districts: District[], slug: string) {
  return districts.find((d) => districtSlug(d.name) === slug);
}

export function resolveDistricts(districts?: District[] | null) {
  return districts?.length ? districts : DEFAULT_DISTRICTS;
}

export const DEFAULT_SEO_LOCAL_LEAD =
  "Antakya merkezli Hatay360; Hatay’da web tasarım, reklam ajansı ve e-ticaret altyapısı sunar. İskenderun, Defne ve diğer ilçelere uzaktan da çalışırız.";

export const DEFAULT_SEO_KEYWORDS =
  "hatay reklam, hatay web tasarım, hatay web sitesi, hatay web siteciler, hatay ajans, hatay reklam ajansı, hatay e-ticaret, hatay yazılım, hatay360, antakya web tasarım, defne web tasarım, arsuz reklam, iskenderun web tasarım, iskenderun reklam, dörtyol web tasarım, payas reklam, erzin web sitesi, kırıkhan reklam, reyhanlı web tasarım, kumlu e-ticaret, hassa reklam, altınözü web tasarım, yayladağı web sitesi, samandağ reklam, belen web tasarım";


export const SEO_PATH_MAP: Record<string, SeoPageId> = {
  "/": "home",
  "/pazarla": "hizmetler",
  "/ozellikler": "ozellikler",
  "/paketler": "paketler",
  "/referanslar": "referanslar",
  "/hakkimizda": "hakkimizda",
  "/iletisim": "iletisim",
  "/gizlilik": "gizlilik",
  "/kosullar": "kosullar",
  "/sektor": "hizmetler",
};

export type SeoPageId =
  | "home"
  | "hizmetler"
  | "ozellikler"
  | "paketler"
  | "referanslar"
  | "hakkimizda"
  | "iletisim"
  | "gizlilik"
  | "kosullar";

export type SeoPage = {
  title: string;
  description: string;
};

export const DEFAULT_SEO_PAGES: Record<SeoPageId, SeoPage> = {
  home: {
    title: "Hatay360 | Hatay Web Tasarım, Reklam Ajansı ve E-Ticaret",
    description:
      "Hatay reklam ajansı ve web siteciler. Antakya & İskenderun web tasarım, Google Ads, e-ticaret altyapısı. Hatay360 yazılım firması.",
  },
  hizmetler: {
    title: "Hatay Web Tasarım ve Reklam | Hizmetler | Hatay360",
    description:
      "Hatay web sitesi, İskenderun tasarım, pazaryeri entegrasyonu, Google/Meta reklam ve özel yazılım. Tek ekip, tek muhatap.",
  },
  ozellikler: {
    title: "E-Ticaret Özellikleri | Hatay Web Sitesi Altyapısı | Hatay360",
    description:
      "SSL, sanal POS, sınırsız ürün, pazaryeri senkronu. Hatay’da e-ticaret ve web sitesi altyapısı.",
  },
  paketler: {
    title: "Hatay Web Tasarım ve E-Ticaret Paketleri | Hatay360",
    description:
      "Hatay reklam, web tasarım ve e-ticaret paketleri. 15 gün ücretsiz deneme. Antakya ve İskenderun işletmeleri için.",
  },
  referanslar: {
    title: "AVC Ekosistemi Referansları | Hatay360, Adana360 ve Avcı E-Ticaret",
    description:
      "Hatay360, Adana360 ve Avcı E-Ticaret ortak dijital ekosisteminden gerçek kurumsal web ve e-ticaret çalışmaları.",
  },
  hakkimizda: {
    title: "Hakkımızda | Hatay Reklam Ajansı ve Yazılım | Hatay360",
    description:
      "Antakya merkezli Hatay360: Hatay web tasarım, reklam ajansı, e-ticaret ve yazılım. İskenderun ve tüm ilçelere hizmet.",
  },
  iletisim: {
    title: "İletişim | Hatay Web Siteciler ve Reklam Ajansı | Hatay360",
    description:
      "Hatay reklam ve web tasarım teklifi. Antakya ofis, İskenderun dahil tüm ilçeler. Numaranızı bırakın, sizi arayalım.",
  },
  gizlilik: {
    title: "Gizlilik ve KVKK | Hatay360",
    description: "Hatay360 gizlilik politikası ve KVKK aydınlatma metni.",
  },
  kosullar: {
    title: "Kullanım Koşulları | Hatay360",
    description: "Hatay360 e-ticaret, web tasarım ve reklam hizmetleri kullanım koşulları.",
  },
};
