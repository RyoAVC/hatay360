// Çoklu müşteri sitesi (microsite) motoru.
// Amaç: Hatay360 admin panelinden kategori seçip hızlıca müşteri sitesi üretmek.
// Tasarım ilkesi: her şey config (JSON) ile sürülür; şablon eklemek = yeni kategori + bileşen.
// Müşteri paneli sabit kalır; buradaki config'ler managed_sites tablosunda tutulur.

export type SiteCategory = "taxi" | "generic";
export type SiteStatus = "construction" | "live";

export interface SiteBusiness {
  name: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  district: string;
  addressText: string;
  mapsUrl: string;
  mapEmbedUrl: string;
  hours: string;
}

export interface SiteBrand {
  logoUrl: string;
  primary: string;
  accent: string;
  dark: string;
}

export interface SiteHero {
  badge: string;
  title: string;
  subtitle: string;
  callLabel: string;
  whatsappLabel: string;
}

export interface SiteHighlight {
  label: string;
  value: string;
}

export interface SiteService {
  title: string;
  desc: string;
}

export interface SiteFaq {
  q: string;
  a: string;
}

export interface SiteSeo {
  title: string;
  description: string;
  keywords: string;
}

export interface SiteConfig {
  business: SiteBusiness;
  brand: SiteBrand;
  hero: SiteHero;
  highlights: SiteHighlight[];
  services: SiteService[];
  areas: string[];
  faqs: SiteFaq[];
  seo: SiteSeo;
  whatsappTemplate: string;
  footerNote: string;
}

export interface ManagedSite {
  id: number;
  slug: string;
  domain: string;
  category: SiteCategory;
  status: SiteStatus;
  customerId: number | null;
  config: SiteConfig;
  createdAt?: string;
  updatedAt?: string;
}

export const SITE_CATEGORY_LABEL: Record<SiteCategory, string> = {
  taxi: "Taksi sitesi",
  generic: "Genel kurumsal site",
};

export const SITE_STATUS_LABEL: Record<SiteStatus, string> = {
  construction: "Yapım aşamasında",
  live: "Yayında",
};

/** 05xx numarayı wa.me için 90'lı uluslararası formata çevirir. */
export function toWaNumber(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("90")) return digits;
  if (digits.startsWith("0")) return `90${digits.slice(1)}`;
  if (digits.length === 10) return `90${digits}`;
  return digits;
}

/** tel: bağlantısı için +90'lı biçim. */
export function toTelHref(phone: string): string {
  const wa = toWaNumber(phone);
  return wa ? `+${wa}` : "";
}

/** Ekranda gösterilecek okunur telefon (0541 882 28 02 gibi). */
export function prettyPhone(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  const local = digits.startsWith("90") ? `0${digits.slice(2)}` : digits.startsWith("0") ? digits : `0${digits}`;
  if (local.length === 11) {
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7, 9)} ${local.slice(9, 11)}`;
  }
  return phone;
}

export function waLink(phone: string, message: string): string {
  const num = toWaNumber(phone);
  if (!num) return "#";
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${num}${text}`;
}

const TAXI_DEFAULT_BRAND: SiteBrand = {
  logoUrl: "",
  primary: "#f5b301",
  accent: "#111827",
  dark: "#0b1220",
};

/** Kategoriye göre boş/başlangıç config üretir (admin sihirbazı için). */
export function buildDefaultConfig(category: SiteCategory, seed?: Partial<SiteBusiness>): SiteConfig {
  const business: SiteBusiness = {
    name: seed?.name || "",
    ownerName: seed?.ownerName || "",
    phone: seed?.phone || "",
    whatsapp: seed?.whatsapp || seed?.phone || "",
    email: seed?.email || "",
    city: seed?.city || "Hatay",
    district: seed?.district || "",
    addressText: seed?.addressText || "",
    mapsUrl: seed?.mapsUrl || "",
    mapEmbedUrl: seed?.mapEmbedUrl || "",
    hours: seed?.hours || "7/24",
  };

  if (category === "taxi") {
    const place = [business.district, business.city].filter(Boolean).join(" ");
    return {
      business,
      brand: TAXI_DEFAULT_BRAND,
      hero: {
        badge: `${business.hours} açık taksi hattı`,
        title: `${business.district || "Bölge"} Taksi`,
        subtitle: `${place} ve çevresinde 7/24 güvenilir taksi hizmeti. Tek dokunuşla arayın veya WhatsApp'tan konum gönderin.`,
        callLabel: "Hemen Ara",
        whatsappLabel: "WhatsApp'tan Yaz",
      },
      highlights: [
        { value: business.hours, label: "Aktif hizmet" },
        { value: "365", label: "Gün ulaşılabilir" },
        { value: prettyPhone(business.phone), label: "Taksi numarası" },
        { value: "WhatsApp", label: "Konum paylaşımı" },
      ],
      services: [
        { title: "Şehir içi taksi", desc: "Merkez, çarşı, otogar ve mahalle içi ulaşım için hızlı taksi." },
        { title: "Hastane taksi", desc: "Devlet hastanesi ve sağlık kuruluşlarına güvenli ulaşım." },
        { title: "7/24 taksi", desc: "Gece, sabah erken veya acil yolculuklarda hat her zaman açık." },
        { title: "Havalimanı / transfer", desc: "Planlı transfer ve çevre güzergâhlar için önceden randevu." },
      ],
      areas: [],
      faqs: [
        { q: "7/24 hizmet veriyor musunuz?", a: `Evet. ${place} hattında günün her saati telefon ve WhatsApp üzerinden taksi talebi alıyoruz.` },
        { q: "Taksi numarası nedir?", a: `${prettyPhone(business.phone)} numarasını arayarak bulunduğunuz konuma taksi isteyebilirsiniz.` },
        { q: "WhatsApp ile taksi çağırabilir miyim?", a: "Evet. Konumunuzu ve gideceğiniz adresi WhatsApp'tan paylaşarak taksi talebinizi iletebilirsiniz." },
      ],
      seo: {
        title: `${business.district} Taksi | 7/24 Taksi ${business.district} ${business.city}`.trim(),
        description: `${place} taksi hattı 7/24 açık. ${prettyPhone(business.phone)} numarasından arayın veya WhatsApp'tan konum gönderin.`,
        keywords: `${business.district?.toLocaleLowerCase("tr-TR")} taksi, taksi ${business.district?.toLocaleLowerCase("tr-TR")}, ${business.city?.toLocaleLowerCase("tr-TR")} taksi, 7/24 taksi, taksi numarası`,
      },
      whatsappTemplate: "Merhaba, taksi talebim var. Konumum: ",
      footerNote: "",
    };
  }

  // generic
  return {
    business,
    brand: { logoUrl: "", primary: "#00a8c4", accent: "#0b1220", dark: "#0b1220" },
    hero: {
      badge: business.city,
      title: business.name || "Kurumsal Site",
      subtitle: "Hizmetlerimiz, iletişim ve konum bilgileri.",
      callLabel: "Hemen Ara",
      whatsappLabel: "WhatsApp'tan Yaz",
    },
    highlights: [],
    services: [],
    areas: [],
    faqs: [],
    seo: {
      title: business.name || "Kurumsal Site",
      description: "",
      keywords: "",
    },
    whatsappTemplate: "Merhaba, bilgi almak istiyorum.",
    footerNote: "",
  };
}
