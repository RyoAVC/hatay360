import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { DEFAULT_DISTRICTS, DEFAULT_SEO_KEYWORDS, DEFAULT_SEO_LOCAL_LEAD, DEFAULT_SEO_PAGES, type District, type SeoPage, type SeoPageId } from "../lib/seo";
import { apiRequest } from "../lib/api";
import {
  DEFAULT_CUSTOMER_LOGIN_BANNERS,
  DEFAULT_PARTNER_LOGIN_BANNERS,
  normalizeLoginBanners,
  type LoginPromoBanner,
} from "../lib/login-promo";
import { normalizeAttentionEffect, type AttentionEffectId } from "../lib/attention-effects";
import { DEFAULT_CORPORATE_CONTENT, normalizeCorporateContent, type CorporateContent } from "../lib/corporate-content";

export type PlanFeature = {
  text: string;
  iconPng?: string; // İsteğe bağlı özel PNG ikon URL'si
};

export type Plan = {
  id: string;
  name: string;
  badge: string;
  oldPrice: string;
  price: string;
  monthlyPrice: string;
  installments: string;
  desc: string;
  cta: string;
  featured?: boolean;
  contact?: boolean;
  effectStyle?: "none" | "fire" | "ice" | "speed" | "neon" | "electric" | "gold" | "cosmic";
  effectText?: string;
  kind?: "ads" | "store";
  features: PlanFeature[];
  pills?: { text: string; color: string }[];
};

export type Slide = {
  id: number;
  badge: string;
  title: string;
  desc: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  /** Hero görsel katmanı */
  mediaType?: "none" | "image" | "gif" | "video";
  mediaUrl?: string;
  /** Özel CSS (önizleme + canlı hero’da uygulanır) */
  effectCss?: string;
  /** Ana medya dikkat efekti (Animate.css / Hatay360) */
  effectPreset?: AttentionEffectId;
  /** Hero üstüne binen dikkat katmanı (resim/gif) */
  overlayUrl?: string;
  overlayEffect?: AttentionEffectId;
  /** Admin’de görünen özel efekt adı */
  overlayName?: string;
};

export type HeroDesignSnapshot = {
  id: string;
  name: string;
  savedAt: string;
  slides: Slide[];
};

export type EcosystemService = {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  badge: string;
  highlights: string[];
  externalUrl?: string;
  iconPng?: string;
};

export type SectorTheme = {
  primary: string;
  soft: string;
  dark: string;
};

export type SectorMetric = {
  label: string;
  value: string;
};

export type SectorHighlight = {
  title: string;
  text: string;
  icon: string;
};

export type SectorItem = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  headline: string;
  description: string;
  cta: string;
  keywords: string[];
  heroPoints: string[];
  pain: string;
  offer: string;
  metrics: SectorMetric[];
  highlights: SectorHighlight[];
  plan: string[];
  theme: SectorTheme;
  demoBadge?: string;
  demoAccent?: string;
  demoImage?: string;
};

export function slugifySector(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "") || "yeni-sektor";
}

const DEFAULT_DEMO_IMAGE = "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=82";

const SECTOR_DEMO_DEFAULTS: Record<string, { badge: string; accent: string; image: string }> = {
  taxi: {
    badge: "Hatay 7/24 Taksi",
    accent: "#facc15",
    image: "https://images.unsplash.com/photo-1628068147323-4b27e9ac750d?auto=format&fit=crop&w=1400&q=82",
  },
  nakliyat: {
    badge: "Evden Eve Nakliyat",
    accent: "#38bdf8",
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1400&q=82",
  },
  klinik: {
    badge: "Klinik & Randevu",
    accent: "#2dd4bf",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1400&q=82",
  },
  servis: {
    badge: "Teknik Servis",
    accent: "#fb923c",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1400&q=82",
  },
};

export function normalizeSector(sector: Partial<SectorItem>): SectorItem {
  const theme = sector.theme ?? { primary: "#00a8c4", soft: "#e8f8fb", dark: "#0f172a" };
  const slug = sector.slug || slugifySector(sector.title || "yeni-sektor");
  const demoDefaults = SECTOR_DEMO_DEFAULTS[slug];

  return {
    id: sector.id ?? `sector-${Date.now()}`,
    slug,
    title: sector.title || "Yeni Sektör Sayfası",
    eyebrow: sector.eyebrow || "Sektör reklamı",
    headline: sector.headline || "Bu sektör için özel sayfa ve görünürlük oluşturun.",
    description: sector.description || "Google Ads, Meta ve landing page ile daha çok çağrı ve dönüşüm elde edebilirsiniz.",
    cta: sector.cta || "Teklif alın",
    keywords: sector.keywords && sector.keywords.length ? sector.keywords : ["Yeni sektör", "Hatay", "Google Ads"],
    heroPoints: sector.heroPoints && sector.heroPoints.length ? sector.heroPoints : ["Hedefli reklam", "Sayfa netliği", "Telefon dönüşümü"],
    pain: sector.pain || "Bu sektöre özel mesaj ve hedefleme ile daha hızlı satış yapılabilir.",
    offer: sector.offer || "Google Ads + landing page + yerel görünürlük paketi.",
    metrics: sector.metrics && sector.metrics.length ? sector.metrics : [
      { label: "Arama", value: "Google" },
      { label: "Başvuru", value: "WhatsApp" },
      { label: "Odak", value: "Dönüşüm" },
    ],
    highlights: sector.highlights && sector.highlights.length ? sector.highlights : [
      { title: "Ana başlık", text: "Öne çıkan hizmet açıklaması", icon: "target" },
    ],
    plan: sector.plan && sector.plan.length ? sector.plan : ["İhtiyaç analizi", "Reklam kurulumu", "Yayın sonrası optimizasyon"],
    theme,
    demoBadge: sector.demoBadge || demoDefaults?.badge || "Sektör demo",
    demoAccent: sector.demoAccent || demoDefaults?.accent || theme.primary,
    demoImage: sector.demoImage || demoDefaults?.image || DEFAULT_DEMO_IMAGE,
  };
}

export type ReferenceItem = {
  id: number;
  name: string;
  category: string;
  categoryLabel: string;
  sector: string;
  desc: string;
  result: string;
  subResult: string;
  beforeAfter: string;
  rating: number;
  quote: string;
  author: string;
  role: string;
  badgeColor: string;
  logoPng?: string;
};

export type HomeSectionId =
  | "pillars"
  | "maps"
  | "sectors"
  | "howItWorks"
  | "features"
  | "specialDesign"
  | "integrations"
  | "pricing"
  | "districts"
  | "callback"
  | "bottomCta"
  | "supportCta"
  | "mascot"
  | "stickyCta"
  | "floatingLock"
  | "packageBuilder"
  | "siteProtect"
  | "footerTrust";

export const DEFAULT_HOME_SECTIONS: Record<HomeSectionId, boolean> = {
  pillars: true,
  maps: false,
  sectors: true,
  howItWorks: false,
  features: false,
  specialDesign: false,
  integrations: false,
  pricing: true,
  districts: true,
  callback: true,
  bottomCta: false,
  supportCta: true,
  mascot: false,
  stickyCta: true,
  floatingLock: true,
  packageBuilder: false,
  siteProtect: true,
  footerTrust: true,
};

export const HOME_SECTION_OPTIONS: { id: HomeSectionId; label: string }[] = [
  { id: "pillars", label: "Hizmet sütunları" },
  { id: "maps", label: "Google Maps bloğu" },
  { id: "sectors", label: "Sektör çözümleri" },
  { id: "howItWorks", label: "Nasıl çalışır" },
  { id: "features", label: "Özellikler bloğu" },
  { id: "specialDesign", label: "Özel tasarım stüdyosu" },
  { id: "integrations", label: "Entegrasyon vitrini" },
  { id: "pricing", label: "Paketler" },
  { id: "districts", label: "Hatay ilçeleri" },
  { id: "callback", label: "Sizi arayalım formu" },
  { id: "bottomCta", label: "Alt renkli çağrı bandı" },
  { id: "supportCta", label: "Destek / iletişim şeridi" },
  { id: "mascot", label: "Asistan bot" },
  { id: "stickyCta", label: "Mobil alt bar" },
  { id: "floatingLock", label: "AVC sahiplik kilidi" },
  { id: "packageBuilder", label: "Paket yapılandırıcı" },
  { id: "siteProtect", label: "Sağ tık ve kopya uyarısı" },
  { id: "footerTrust", label: "Footer kurumsal güvence" },
];

export type VisibilityFlag =
  | "stickyPhoneMobile"
  | "stickyPhoneDesktop"
  | "stickyWhatsAppMobile"
  | "stickyWhatsAppDesktop"
  | "botMobile"
  | "botDesktop";

export const DEFAULT_VISIBILITY: Record<VisibilityFlag, boolean> = {
  stickyPhoneMobile: true,
  stickyPhoneDesktop: true,
  stickyWhatsAppMobile: true,
  stickyWhatsAppDesktop: true,
  botMobile: true,
  botDesktop: true,
};

export type SiteSettings = {
  siteTitle: string;
  phone: string;
  email: string;
  address: string;
  /** Ofis / destek mesai — hafta içi, örn. 09:00–18:00 */
  supportWeekdayHours: string;
  /** Cumartesi mesai; boş = Cumartesi kapalı */
  supportSaturdayHours: string;
  avciLabsUrl: string;
  mascotName: string;
  mascotActive: boolean;
  headerCtaText: string;
  headerCtaHref: string;
  logoUrl: string;
  logoHeight: number;
  logoFooterHeight: number;
  logoDarkHeight: number;
  logoBackground: "black" | "none";
  logoPadding: number;
  logoRadius: number;
  seoKeywords: string;
  seoPages: Record<SeoPageId, SeoPage>;
  districts: District[];
  seoLocalLead: string;
  aiProvider: "gemini" | "openai" | "none";
  aiApiKey: string;
  aiModel: string;
  homeSections: Record<HomeSectionId, boolean>;
  stickyPhoneMobile: boolean;
  stickyPhoneDesktop: boolean;
  stickyWhatsAppMobile: boolean;
  stickyWhatsAppDesktop: boolean;
  botMobile: boolean;
  botDesktop: boolean;
  /** Müşteri giriş sol panel banner’ları */
  customerLoginBanners: LoginPromoBanner[];
  /** Bayilik giriş + kayıt sol panel banner’ları */
  partnerLoginBanners: LoginPromoBanner[];
  /** Hero slayt tasarım geçmişi (aktif dışı arşiv) */
  heroDesignHistory: HeroDesignSnapshot[];
  /** Kurumsal hub + misyon/vizyon + KVKK / yasal metinler */
  corporate: CorporateContent;
};

export function sectionOn(settings: SiteSettings, id: HomeSectionId): boolean {
  const value = settings.homeSections?.[id];
  return typeof value === "boolean" ? value : DEFAULT_HOME_SECTIONS[id];
}

export function settingOn(settings: SiteSettings, id: VisibilityFlag): boolean {
  const value = settings[id];
  return typeof value === "boolean" ? value : DEFAULT_VISIBILITY[id];
}

function boolOr(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

const LEGACY_HIZMETLER_PAZARYERI_DESCRIPTION =
  "Hatay web sitesi, İskenderun tasarım, pazaryeri entegrasyonu, Google/Meta reklam ve özel yazılım. Tek ekip, tek muhatap.";

const LEGACY_SEO_LOCAL_LEAD =
  "Antakya merkezli Hatay360; Hatay’da web tasarım, reklam ajansı ve e-ticaret altyapısı sunar. İskenderun, Defne ve diğer ilçelere uzaktan da çalışırız.";

function migrateHizmetlerSeoPages(pages: Record<SeoPageId, SeoPage>): Record<SeoPageId, SeoPage> {
  if (pages.hizmetler?.description !== LEGACY_HIZMETLER_PAZARYERI_DESCRIPTION) return pages;
  return {
    ...pages,
    hizmetler: {
      ...pages.hizmetler,
      description: DEFAULT_SEO_PAGES.hizmetler.description,
    },
  };
}

function migrateSeoLocalLead(lead: unknown): string {
  if (typeof lead !== "string") return DEFAULT_SEO_LOCAL_LEAD;
  if (lead === LEGACY_SEO_LOCAL_LEAD) return DEFAULT_SEO_LOCAL_LEAD;
  return lead;
}

function mergeSiteSettings(parsed: Partial<SiteSettings> | null | undefined): SiteSettings {
  const next = parsed && typeof parsed === "object" ? parsed : {};
  const weekdayRaw = typeof next.supportWeekdayHours === "string" ? next.supportWeekdayHours : INITIAL_SETTINGS.supportWeekdayHours;
  const saturdayRaw = typeof next.supportSaturdayHours === "string" ? next.supportSaturdayHours : INITIAL_SETTINGS.supportSaturdayHours;
  return {
    ...INITIAL_SETTINGS,
    ...next,
    phone:
      !next.phone || ["+90 (850) 888 00 00", "+90 850 308 68 97"].includes(next.phone)
        ? INITIAL_SETTINGS.phone
        : next.phone,
    supportWeekdayHours: weekdayRaw.trim() || INITIAL_SETTINGS.supportWeekdayHours,
    supportSaturdayHours: saturdayRaw.trim(),
    aiApiKey: "",
    seoPages: migrateHizmetlerSeoPages({ ...INITIAL_SETTINGS.seoPages, ...(next.seoPages || {}) }),
    seoLocalLead: migrateSeoLocalLead(next.seoLocalLead),
    districts: Array.isArray(next.districts) && next.districts.length ? next.districts : INITIAL_SETTINGS.districts,
    homeSections: { ...DEFAULT_HOME_SECTIONS, ...(next.homeSections || {}) },
    stickyPhoneMobile: boolOr(next.stickyPhoneMobile, true),
    stickyPhoneDesktop: boolOr(next.stickyPhoneDesktop, true),
    stickyWhatsAppMobile: boolOr(next.stickyWhatsAppMobile, true),
    stickyWhatsAppDesktop: boolOr(next.stickyWhatsAppDesktop, true),
    botMobile: boolOr(next.botMobile, true),
    botDesktop: boolOr(next.botDesktop, true),
    avciLabsUrl: next.avciLabsUrl === "/pazarla" ? "/demolar" : next.avciLabsUrl || INITIAL_SETTINGS.avciLabsUrl,
    customerLoginBanners: normalizeLoginBanners(next.customerLoginBanners, DEFAULT_CUSTOMER_LOGIN_BANNERS),
    partnerLoginBanners: normalizeLoginBanners(next.partnerLoginBanners, DEFAULT_PARTNER_LOGIN_BANNERS),
    heroDesignHistory: normalizeHeroDesignHistory(next.heroDesignHistory),
    corporate: normalizeCorporateContent(next.corporate),
  };
}

function normalizeHeroDesignHistory(raw: unknown): HeroDesignSnapshot[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const slides = Array.isArray(row.slides) ? migrateSlides(row.slides as Slide[]) : [];
      if (!slides.length) return null;
      return {
        id: String(row.id || `hist-${index}-${Date.now()}`).slice(0, 80),
        name: String(row.name || `Tasarım ${index + 1}`).trim().slice(0, 80) || `Tasarım ${index + 1}`,
        savedAt: String(row.savedAt || new Date().toISOString()).slice(0, 40),
        slides,
      } satisfies HeroDesignSnapshot;
    })
    .filter(Boolean)
    .slice(0, 24) as HeroDesignSnapshot[];
}

function migrateSlides(slides: Slide[]): Slide[] {
  return slides.map((slide) => {
    const mediaUrl = String(slide.mediaUrl || "");
    let mediaType: Slide["mediaType"] = "none";
    if (slide.mediaType === "video" || slide.mediaType === "gif" || slide.mediaType === "image") {
      mediaType = slide.mediaType;
    } else if (mediaUrl) {
      const lower = mediaUrl.toLowerCase();
      mediaType =
        lower.includes("video") || lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.startsWith("data:video")
          ? "video"
          : lower.includes("gif") || lower.endsWith(".gif") || lower.startsWith("data:image/gif")
            ? "gif"
            : "image";
    }
    const next: Slide = {
      ...slide,
      mediaType,
      mediaUrl,
      effectCss: String(slide.effectCss || ""),
      effectPreset: normalizeAttentionEffect(slide.effectPreset),
      overlayUrl: String(slide.overlayUrl || ""),
      overlayEffect: normalizeAttentionEffect(slide.overlayEffect),
      overlayName: String(slide.overlayName || "").slice(0, 80),
    };
    if (next.secondaryCtaHref === "/pazarla") next.secondaryCtaHref = "/paketler";
    return next;
  });
}

const INITIAL_PLANS: Plan[] = [
  {
    id: "start",
    name: "Hatay360 Reklam Start",
    badge: "Google Ads & Meta",
    oldPrice: "₺35.000",
    price: "₺24.900",
    monthlyPrice: "₺2.075 / ay",
    installments: "12 Taksit İmkânı",
    desc: "Yerel işletmeler için Google Arama, Meta ve akıllı landing page ile aylık satış akışı kurmak isteyenler.",
    cta: "Reklam Teklifi Al",
    kind: "ads",
    features: [
      { text: "Google Ads arama ve dönüşüm kampanyaları" },
      { text: "Meta Facebook & Instagram reklam yönetimi" },
      { text: "Telefon dönüşüm odaklı landing page" },
      { text: "Haftalık rapor ve optimizasyon" },
      { text: "Yönetim + reklam stratejisi birlikte" },
    ],
    pills: [
      { text: "Google Ads", color: "#2563eb" },
      { text: "Meta", color: "#a855f7" },
    ],
  },
  {
    id: "pro",
    name: "Hatay360 Reklam Pro",
    badge: "EN ÇOK TERCİH EDİLEN",
    featured: true,
    oldPrice: "₺65.000",
    price: "₺44.900",
    monthlyPrice: "₺3.740 / ay",
    installments: "12 Taksit İmkânı",
    desc: "Google Ads, Meta, yerel SEO ve web görünürlüğünü bir arada büyütmek isteyen işletmeler için.",
    cta: "Büyüme Planı Hazırla",
    kind: "ads",
    features: [
      { text: "Google Search + Performance Max + E-ticaret kampanyaları" },
      { text: "Meta reklam yönetimi ve kreatif optimizasyon" },
      { text: "Yerel SEO + ilçelere göre hedefleme" },
      { text: "A/B landing page ve dönüşüm artırımı" },
      { text: "Aylık rapor + reklam bütçesi danışmanlığı" },
    ],
    pills: [
      { text: "Google Ads", color: "#3b82f6" },
      { text: "SEO", color: "#10b981" },
      { text: "Meta", color: "#e11d48" },
    ],
  },
  {
    id: "scale",
    name: "Hatay360 Yerel Hizmet Reklamı",
    badge: "Taksi • Nakliyat • Klinik • Servis",
    oldPrice: "₺95.000",
    price: "₺69.900",
    monthlyPrice: "₺5.825 / ay",
    installments: "12 Taksit İmkânı",
    desc: "Taksi, nakliyat, klinik, servis ve yerel hizmet sektörlerinde telefon ve başvuru artışı hedefleyen reklam paketi.",
    cta: "Sektöre Özel Teklif Al",
    kind: "ads",
    effectStyle: "none",
    effectText: "",
    features: [
      { text: "Google yerel arama ve yakınımda hedeflemesi" },
      { text: "Reklam çağrısı ve WhatsApp dönüşüm optimizasyonu" },
      { text: "İlçelere göre devreye alınan mesafe hedefi" },
      { text: "İçerik + ücret/kurumsal sayfa optimizasyonu" },
      { text: "Sonuç odaklı kampanya yönetimi" },
    ],
    pills: [
      { text: "Yerel SEO", color: "#0ea5e9" },
      { text: "WhatsApp", color: "#22c55e" },
      { text: "Google Maps", color: "#f59e0b" },
    ],
  },
  {
    id: "enterprise",
    name: "Hatay360 Kurumsal Reklam & Web",
    badge: "Kurumsal Görünürlük",
    oldPrice: "Özel Teklif",
    price: "Özel Fiyat",
    monthlyPrice: "Projenize Özel Bütçe",
    installments: "Esnek Ödeme Vadesi",
    desc: "Google reklamları, kurumsal web görünürlüğü ve özel landing page çalışmasıyla marka değeri kurmak isteyenler.",
    cta: "İletişime Geçin",
    kind: "ads",
    contact: true,
    effectStyle: "ice",
    effectText: "Özel teklif fırsatı",
    features: [
      { text: "Kurumsal landing page + marka sayfası" },
      { text: "Google Ads + Meta + SEO birlikte planlama" },
      { text: "İlçe bazlı içerik ve hedef kitle segmentasyonu" },
      { text: "Özel kampanya tasarımı ve A/B testleri" },
      { text: "Özel müşavirlik ve düzenli strateji toplantıları" },
    ],
    pills: [
      { text: "Branding", color: "#14b8a6" },
      { text: "Landing Page", color: "#8b5cf6" },
    ],
  },
  {
    id: "shop-start",
    name: "Hatay360 Mağaza Start",
    badge: "Web + e-ticaret",
    oldPrice: "₺35.000",
    price: "₺24.900",
    monthlyPrice: "₺2.075 / ay",
    installments: "12 Taksit İmkânı",
    desc: "Özel vitrin, katalog, sanal POS ve SSL. Kendi sitenizden satış; reklam paketi ayrıdır.",
    cta: "Mağaza Aç",
    kind: "store",
    features: [
      { text: "Mobil uyumlu web tasarım ve vitrin" },
      { text: "Anahtar teslim e-ticaret altyapısı" },
      { text: "Sanal POS & ödeme altyapısı" },
      { text: "1.000 ürüne kadar performans" },
      { text: "Ücretsiz panel eğitimi" },
    ],
    pills: [{ text: "iyzico", color: "#1e3a8a" }],
  },
  {
    id: "shop-pro",
    name: "Hatay360 Mağaza & Pazarla",
    badge: "Web + mağaza + pazaryeri",
    oldPrice: "₺65.000",
    price: "₺44.900",
    monthlyPrice: "₺3.740 / ay",
    installments: "12 Taksit İmkânı",
    desc: "Özel web arayüzü, kendi mağazanız ve Trendyol / Hepsiburada / N11 stok senkronu. Reklam ayrı.",
    cta: "Pazarla ile Başla",
    kind: "store",
    features: [
      { text: "Özel web tasarım ve ürün arayüzü" },
      { text: "E-ticaret mağazası + sanal POS" },
      { text: "Pazarla: Trendyol, HB, N11 senkron" },
      { text: "Sınırsız ürün hedefi" },
      { text: "Kurulum ve eğitim" },
    ],
    pills: [
      { text: "Trendyol", color: "#f27a1a" },
      { text: "Hepsiburada", color: "#ff6000" },
    ],
  },
];

const INITIAL_SLIDES: Slide[] = [
  {
    id: 0,
    badge: "Google Ads & Meta Reklam",
    title: "Hatay’da müşteriyi doğru anahtar kelimeyle yakalayın.",
    desc: "Google Arama, Meta kampanyaları ve yerel hedefleme ile potansiyel müşteriyi telefon çağrısına, WhatsApp’a ve başvurulara çeviren reklam sistemi kuruyoruz.",
    primaryCtaText: "Reklam Teklifi Alın",
    primaryCtaHref: "/iletisim",
    secondaryCtaText: "Paketleri İncele",
    secondaryCtaHref: "#paketler",
  },
  {
    id: 1,
    badge: "360° Dijital Reklam & Medya",
    title: "Google Ads ve Meta ile bütçenizi satışa çevirin.",
    desc: "Arama reklamları, performans kampanyaları, kreatif optimizasyon ve aylık raporlama ile Hatay’da daha çok aranma, daha çok dönüşüm ve daha iyi ROAS hedefliyoruz.",
    primaryCtaText: "Bütçe Planı Alın",
    primaryCtaHref: "/iletisim",
    secondaryCtaText: "Ajans Hizmetleri",
    secondaryCtaHref: "/paketler",
  },
  {
    id: 2,
    badge: "Kurumsal Görünürlük & Landing Page",
    title: "Markanız için net mesaj, güçlü sayfa ve yüksek dönüşüm.",
    desc: "Reklam kadar doğru sayfa da önemlidir. Sektörünüze özel landing page, kurumsal içerik ve web görünürlüğüyle müşteri karar sürecini hızlandırıyoruz.",
    primaryCtaText: "Teklif İsteyin",
    primaryCtaHref: "/iletisim",
    secondaryCtaText: "Özellikleri Keşfet",
    secondaryCtaHref: "/ozellikler",
  },
];

const INITIAL_SERVICES: EcosystemService[] = [
  {
    id: "reklam",
    title: "Google Ads & Meta Reklam Yönetimi",
    subtitle: "Yerel arama, dönüşüm ve marka görünürlüğü",
    desc: "Google Ads ve Meta reklam kampanyalarını doğru hedef kitleye ulaştıran, telefon çağrısı ve WhatsApp dönüşümünü artıran reklam yönetimi.",
    badge: "Reklam & Dönüşüm",
    highlights: [
      "Google Arama, Performance Max ve yerel hedefleme",
      "Instagram & Facebook dönüşüm kampanyaları",
      "Haftalık optimizasyon ve net ROAS raporlaması",
    ],
  },
  {
    id: "webtasarim",
    title: "Kurumsal Web Tasarım & Landing Page",
    subtitle: "%100 Özgün, hız ve mesaj netliği odaklı arayüzler",
    desc: "Taksici, klinik, nakliyat, servis gibi sektörler için satışa odaklı, mobil uyumlu ve hızlı landing page ve kurumsal web çözümleri.",
    badge: "Özel Web Arayüzü",
    highlights: [
      "Mobil uyumlu, hızlı açılan arayüz",
      "Telefon & WhatsApp CTA odaklı tasarım",
      "Masaüstü, tablet ve mobil cihazlara %100 tam uyum",
    ],
  },
  {
    id: "googleads",
    title: "Yerel SEO & Görünürlük Ajansı",
    subtitle: "Antakya, Defne, İskenderun ve ilçelere göre organik görünürlük",
    desc: "Google’da doğru sektör ve doğru ilçeler için görünürlük yaratır, aramalarda ön plana çıkar ve harita/yerel aramalarda kurumsal güven inşa ederiz.",
    badge: "Google Partner Ajans",
    highlights: [
      "İlçe bazlı yerel içerik ve arama hedeflemesi",
      "Google Maps ve yerel arama optimizasyonu",
      "Organik görünürlük + reklam ile tek ekip yönetimi",
    ],
  },
  {
    id: "mobilapp",
    title: "iOS & Android Mobil Uygulama",
    subtitle: "App Store & Play Store Yayınlı Mobil E-Ticaret",
    desc: "Müşterilerinizin telefonuna özel uygulamanızla girin. Sınırsız push bildirim, biometrik giriş ve anlık indirim kampanyaları.",
    badge: "App Store & Play Store",
    highlights: [
      "App Store & Play Store Yayını ve Onay Süreçleri",
      "Sınırsız Anlık Push Bildirimi & Flaş Kampanyalar",
      "Yüksek Performanslı Native Mobil Uygulama Deneyimi",
    ],
  },
  {
    id: "yazilim",
    title: "Özel Yazılım & Otomasyon",
    subtitle: "API, Bot ve İş Süreçleri Otomasyonu",
    desc: "Stok botları, e-fatura, özel API ve otomasyon araçlarıyla operasyonunuzu Hatay360 yazılım ekibi kurar.",
    badge: "Hatay360 Yazılım",
    highlights: [
      "Özel API entegrasyonları ve otomasyon botları",
      "E-fatura ve stok senkronu lisansları",
      "7/24 kesintisiz yazılım desteği ve güncellemeler",
    ],
  },
];

const INITIAL_SECTORS: SectorItem[] = [
  {
    id: "sector-taxi",
    slug: "taxi",
    title: "Hatay Taksi Reklamı & Görünürlük",
    eyebrow: "Taksi reklamı",
    headline: "Hatay’da taksi arayan müşteriyi doğrudan size ulaştırın.",
    description:
      "Google Ads + Meta + yerel görünürlük ile çağrı, WhatsApp ve rezervasyon başvurularını artırırız.",
    cta: "Taksi paketi",
    keywords: ["Hatay taksi", "İskenderun taksi", "Antakya taksi", "7/24 transfer", "Taksi fiyatları"],
    heroPoints: ["Google Arama hedefleme", "WhatsApp dönüşüm", "İlçe bazlı reklam"],
    pain: "Taksi ve transfer arayan müşteriler çoğu zaman ilk 3 sonuca bakar. Doğru reklam ve net mesajla müşteriyi kaçırmanız çok kolaydır.",
    offer: "Google Ads + Meta + landing page ile daha çok çağrı ve rezervasyon elde edin.",
    metrics: [
      { label: "Arama hedefi", value: "Google + Meta" },
      { label: "Dönüşüm odaklı", value: "Çağrı & WhatsApp" },
      { label: "Uygulama", value: "İlçe bazlı kampanya" },
    ],
    highlights: [
      { title: "Doğru arama kelimeleri", text: "Hatay taksi, Antakya transfer ve ilçe bazlı yönergelerle hedeflemeyi optimize ediyoruz.", icon: "target" },
      { title: "Mesaj netliği", text: "Müşteri hemen hizmetinizi anlar; fiyat, çağrı ve WhatsApp CTA tek sayfada öne çıkar.", icon: "message" },
      { title: "Hızlı dönüşüm", text: "Arayan kişiye anında geri dönüş ve rezervasyon desteğiyle kayıpları minimuma indiriyoruz.", icon: "clock" },
    ],
    plan: [
      "Anahtar kelime analizi",
      "Google Ads ve Meta reklam kurulumu",
      "Landing page ve çağrı odaklı tasarım",
      "Haftalık optimizasyon ve raporlama",
    ],
    theme: { primary: "#00a8c4", soft: "#e8f8fb", dark: "#0f172a" },
  },
  {
    id: "sector-nakliyat",
    slug: "nakliyat",
    title: "Hatay Nakliyat Reklamı & Dönüşüm",
    eyebrow: "Nakliyat reklamı",
    headline: "Taşıma ihtiyacı olan müşterilere hızlı ve güvenli teklif verin.",
    description:
      "Evden eve, ofis taşıma ve şehir içi nakliyat için reklam, yerel arama ve landing page çalışması kuruyoruz.",
    cta: "Nakliyat paketi",
    keywords: ["Hatay nakliyat", "Nakliye fiyatları", "Evden eve nakliyat", "Ofis taşıma", "Nakliyat firması"],
    heroPoints: ["Yerel arama", "Güven & fiyat netliği", "WhatsApp teklif"],
    pain: "Nakliyat müşterileri fiyat, güven ve hız ister. Bu üçlüyi doğru anlatan bir sayfa ve doğru arama planı satışın anahtarıdır.",
    offer: "Google reklamları + fiyat netliği + hızlı teklif sayfası ile daha çok sipariş alın.",
    metrics: [
      { label: "Hedef", value: "Telefon + WhatsApp" },
      { label: "Güven", value: "Fiyat netliği" },
      { label: "Görünürlük", value: "Yerel SEO + Ads" },
    ],
    highlights: [
      { title: "Hedefli arama", text: "Hatay ve ilçeler bazlı arama kelimeleriyle doğru segmentte görünür hale geliyoruz.", icon: "target" },
      { title: "Güven artışı", text: "Çalışma alanı, taşıma süresi ve fiyat açıklığı ile müşteri güvenini yükseltiyoruz.", icon: "badge" },
      { title: "Hızlı teklif", text: "Müşteri bir tıkla WhatsApp veya telefonla iletişime geçebilir; satış süreci kısalır.", icon: "truck" },
    ],
    plan: [
      "Nakliyat arama analizi",
      "Google Ads çalışması",
      "Fiyat ve güven sayfası tasarımı",
      "Dönüşüm ve çağrı optimizasyonu",
    ],
    theme: { primary: "#0ea5e9", soft: "#e0f2fe", dark: "#082f49" },
  },
  {
    id: "sector-klinik",
    slug: "klinik",
    title: "Hatay Klinik & Sağlık Reklamı",
    eyebrow: "Klinik ve sağlık reklamı",
    headline: "Randevu ve tedavi arayan hastaları doğru sektöre yönlendirin.",
    description:
      "Diş, estetik, doktor, psikolog ve kliniklerde Google arama ve yerel görünürlük ile daha çok başvuru hedefliyoruz.",
    cta: "Sağlık paketi",
    keywords: ["Hatay diş doktoru", "Antakya estetik", "Hatay doktor", "Randevu", "Klinik reklam"],
    heroPoints: ["Randevu hedefleme", "Yerel görünürlük", "Güvenli içerik"],
    pain: "Sağlık sektöründe müşteri, güven ve yakınlık ister. Bu yüzden net açıklama, randevu CTA ve doğru arama kelimeleri çok kritik olur.",
    offer: "Google arama + yerel SEO + güven odaklı landing page ile daha çok randevu alın.",
    metrics: [
      { label: "Odak", value: "Randevu & başvuru" },
      { label: "Hedef", value: "Google + Harita" },
      { label: "Güven", value: "İçerik + sosyal delil" },
    ],
    highlights: [
      { title: "Hizmet netliği", text: "Hangi hizmeti verdiğiniz, hangi bölgede çalıştığınız ve nasıl randevu alacağınız net anlatılır.", icon: "stethoscope" },
      { title: "Güven inşa", text: "Yorumlar, hizmet açıklaması ve açık çağrı butonları ile marka güveni artırılır.", icon: "badge" },
      { title: "Doğru arama", text: "Google aramalarda doğru hitap ve hedef kitleyle görünürlük sağlarız.", icon: "target" },
    ],
    plan: [
      "Sektör anahtar kelime planı",
      "Google Ads kampanyası",
      "Randevu odaklı landing page",
      "Aylık görünürlük ve dönüşüm optimizasyonu",
    ],
    theme: { primary: "#14b8a6", soft: "#dff7f5", dark: "#0f172a" },
  },
  {
    id: "sector-servis",
    slug: "servis",
    title: "Hatay Servis & Tamirat Reklamı",
    eyebrow: "Servis ve tamirat reklamı",
    headline: "Telefon, klima, araba ve tamirat arayan müşteriyi anında yakalayın.",
    description:
      "Yerel hizmetlerde çağrı, WhatsApp ve anında dönüşüm odaklı reklam kampanyaları kuruyoruz.",
    cta: "Servis paketi",
    keywords: ["Hatay klima servisi", "Oto tamir", "Elektronik servis", "Tamirat", "Su tesisatçısı"],
    heroPoints: ["Anında çağrı", "WhatsApp dönüşüm", "Yerel hedefleme"],
    pain: "Yerel servis müşterileri hemen çözüm ister. Yavaş cevap veren firmalar müşteriyi kaybeder. Hızlı ve net iletişim reklamın temelidir.",
    offer: "Google Ads + WhatsApp + çağrı odaklı landing page ile servis taleplerinizi artırın.",
    metrics: [
      { label: "Odak", value: "Hızlı çözüm" },
      { label: "İletişim", value: "Telefon & WhatsApp" },
      { label: "Reklam", value: "Yerel hedefleme" },
    ],
    highlights: [
      { title: "Net hizmet açıklaması", text: "Hangi işlerde çalıştığınız, hangi bölgede hizmet verdiğiniz ve ne kadar hızlı yanıt verdiğiniz gösterilir.", icon: "wrench" },
      { title: "Hızlı iletişim", text: "WhatsApp ve telefon butonları ile müşteri doğrudan size ulaşır; kayıp oran düşer.", icon: "message" },
      { title: "Dönüşüm kampanyası", text: "Google arama ve sosyal medya reklamları ile fiyat ve hızlı çözüm üzerinden dönüşüme gideriz.", icon: "megaphone" },
    ],
    plan: [
      "Hizmet alanı ve anahtar kelime planı",
      "Raporlu Google ve Meta reklam kurulumu",
      "Dönüşüm odaklı landing page",
      "Aylık kampanya optimizasyonu",
    ],
    theme: { primary: "#f97316", soft: "#fff7ed", dark: "#431407" },
  },
];

export const INITIAL_REFERENCES: ReferenceItem[] = [
  {
    id: 1,
    name: "Kuyumcu Doğan",
    category: "webtasarim",
    categoryLabel: "Kurumsal Web Tasarım",
    sector: "Kuyumculuk",
    desc: "Markanın kurumsal kimliğini dijitale taşıyan modern, güven odaklı ve mobil uyumlu web deneyimi.",
    result: "Kurumsal Web",
    subResult: "Mobil uyumlu marka vitrini",
    beforeAfter: "Adana360 çalışmalar arşivinde yayınlanan gerçek ekosistem projesi",
    rating: 5,
    quote: "Kurumsal kimliği yansıtan, modern ve yüksek performanslı web sitesi çalışması.",
    author: "AVC Dijital Ekosistemi",
    role: "Adana360 / Avcı E-Ticaret portföyü",
    badgeColor: "#00a8c4",
  },
  {
    id: 2,
    name: "Ceptematbaa",
    category: "eticaret",
    categoryLabel: "E-Ticaret & Web",
    sector: "Baskı & Matbaa",
    desc: "Baskı hizmetlerini dijital sipariş akışına taşıyan, ürün ve hizmet sunumunu kolaylaştıran web projesi.",
    result: "Dijital Sipariş Vitrini",
    subResult: "Ürün ve hizmet odaklı yapı",
    beforeAfter: "Adana360 çalışmalar arşivinde yayınlanan gerçek ekosistem projesi",
    rating: 5,
    quote: "Kurumsal kimliği yansıtan, modern ve yüksek performanslı web sitesi çalışması.",
    author: "AVC Dijital Ekosistemi",
    role: "Adana360 / Avcı E-Ticaret portföyü",
    badgeColor: "#f97316",
  },
  {
    id: 3,
    name: "Söyle Yerinden",
    category: "webtasarim",
    categoryLabel: "Platform Tasarımı",
    sector: "Yerel Platform",
    desc: "Yerel içerik ve kullanıcı akışını anlaşılır bir arayüzde buluşturan dijital platform çalışması.",
    result: "Dijital Platform",
    subResult: "Kullanıcı odaklı arayüz",
    beforeAfter: "Adana360 çalışmalar arşivinde yayınlanan gerçek ekosistem projesi",
    rating: 5,
    quote: "Kurumsal kimliği yansıtan, modern ve yüksek performanslı web sitesi çalışması.",
    author: "AVC Dijital Ekosistemi",
    role: "Adana360 / Avcı E-Ticaret portföyü",
    badgeColor: "#10b981",
  },
  {
    id: 4,
    name: "Kamil Keskin",
    category: "webtasarim",
    categoryLabel: "Kişisel Marka Web",
    sector: "Kişisel Marka",
    desc: "Kişisel marka anlatısını, hizmetleri ve iletişim kanallarını tek noktada sunan kurumsal web çalışması.",
    result: "Kişisel Marka Sitesi",
    subResult: "Net hizmet ve iletişim akışı",
    beforeAfter: "Adana360 çalışmalar arşivinde yayınlanan gerçek ekosistem projesi",
    rating: 5,
    quote: "Kurumsal kimliği yansıtan, modern ve yüksek performanslı web sitesi çalışması.",
    author: "AVC Dijital Ekosistemi",
    role: "Adana360 / Avcı E-Ticaret portföyü",
    badgeColor: "#8b5cf6",
  },
  {
    id: 5,
    name: "Benguen",
    category: "webtasarim",
    categoryLabel: "Kurumsal Web Tasarım",
    sector: "Kurumsal Marka",
    desc: "Marka kimliğine uygun görsel dil, mobil uyum ve anlaşılır hizmet sunumuyla hazırlanan web projesi.",
    result: "Marka Deneyimi",
    subResult: "Modern ve mobil uyumlu",
    beforeAfter: "Adana360 çalışmalar arşivinde yayınlanan gerçek ekosistem projesi",
    rating: 5,
    quote: "Kurumsal kimliği yansıtan, modern ve yüksek performanslı web sitesi çalışması.",
    author: "AVC Dijital Ekosistemi",
    role: "Adana360 / Avcı E-Ticaret portföyü",
    badgeColor: "#ec4899",
  },
  {
    id: 6,
    name: "Baskimo.com",
    category: "eticaret",
    categoryLabel: "E-Ticaret & Web",
    sector: "Online Baskı",
    desc: "Online baskı ürünlerinin keşif ve sipariş sürecini destekleyen ürün odaklı web vitrini.",
    result: "Online Ürün Vitrini",
    subResult: "Sipariş odaklı yapı",
    beforeAfter: "Adana360 çalışmalar arşivinde yayınlanan gerçek ekosistem projesi",
    rating: 5,
    quote: "Kurumsal kimliği yansıtan, modern ve yüksek performanslı web sitesi çalışması.",
    author: "AVC Dijital Ekosistemi",
    role: "Adana360 / Avcı E-Ticaret portföyü",
    badgeColor: "#f59e0b",
  },
  {
    id: 7,
    name: "Antpisos",
    category: "webtasarim",
    categoryLabel: "Kurumsal Web Tasarım",
    sector: "Kurumsal Marka",
    desc: "Hizmetleri ve marka kimliğini çağdaş bir arayüzle sunan kurumsal web tasarım çalışması.",
    result: "Kurumsal Dijital Vitrin",
    subResult: "Hızlı ve anlaşılır arayüz",
    beforeAfter: "Adana360 çalışmalar arşivinde yayınlanan gerçek ekosistem projesi",
    rating: 5,
    quote: "Kurumsal kimliği yansıtan, modern ve yüksek performanslı web sitesi çalışması.",
    author: "AVC Dijital Ekosistemi",
    role: "Adana360 / Avcı E-Ticaret portföyü",
    badgeColor: "#0ea5e9",
  },
  {
    id: 8,
    name: "Hatay Yörem",
    category: "eticaret",
    categoryLabel: "Yerel Marka & Web",
    sector: "Yerel Ürünler",
    desc: "Hatay’ın yerel marka değerini ve ürünlerini dijitalde görünür kılan kurumsal web çalışması.",
    result: "Yerel Marka Vitrini",
    subResult: "Hatay odaklı dijital sunum",
    beforeAfter: "Adana360 çalışmalar arşivinde yayınlanan gerçek ekosistem projesi",
    rating: 5,
    quote: "Kurumsal kimliği yansıtan, modern ve yüksek performanslı web sitesi çalışması.",
    author: "AVC Dijital Ekosistemi",
    role: "Adana360 / Avcı E-Ticaret portföyü",
    badgeColor: "#14b8a6",
  },
];

const INITIAL_SETTINGS: SiteSettings = {
  siteTitle: "Hatay360",
  phone: "+90 850 308 68 37",
  email: "info@hatay360.com",
  address: "Antakya / Hatay",
  supportWeekdayHours: "09:00–18:00",
  supportSaturdayHours: "10:00–14:00",
  avciLabsUrl: "/demolar",
  mascotName: "360 Bot",
  mascotActive: false,
  headerCtaText: "Sizi Arayalım",
  headerCtaHref: "/iletisim",
  logoUrl: "",
  logoHeight: 36,
  logoFooterHeight: 44,
  logoDarkHeight: 52,
  logoBackground: "black",
  logoPadding: 6,
  logoRadius: 10,
  seoKeywords: DEFAULT_SEO_KEYWORDS,
  seoPages: DEFAULT_SEO_PAGES,
  districts: DEFAULT_DISTRICTS,
  seoLocalLead: DEFAULT_SEO_LOCAL_LEAD,
  aiProvider: "gemini",
  aiApiKey: "",
  aiModel: "gemini-2.0-flash",
  homeSections: DEFAULT_HOME_SECTIONS,
  stickyPhoneMobile: true,
  stickyPhoneDesktop: true,
  stickyWhatsAppMobile: true,
  stickyWhatsAppDesktop: true,
  botMobile: true,
  botDesktop: true,
  customerLoginBanners: DEFAULT_CUSTOMER_LOGIN_BANNERS,
  partnerLoginBanners: DEFAULT_PARTNER_LOGIN_BANNERS,
  heroDesignHistory: [],
  corporate: DEFAULT_CORPORATE_CONTENT,
};

export type ContentSnapshot = {
  plans: Plan[];
  slides: Slide[];
  services: EcosystemService[];
  sectors: SectorItem[];
  references: ReferenceItem[];
  settings: SiteSettings;
};

type ContentContextType = ContentSnapshot & {
  databaseStatus: "loading" | "connected" | "offline";
  databaseHasContent: boolean;
  contentError: string;
  updatePlans: (newPlans: Plan[]) => void;
  updateSlides: (newSlides: Slide[]) => void;
  updateServices: (newServices: EcosystemService[]) => void;
  updateSectors: (newSectors: SectorItem[]) => void;
  updateReferences: (newRefs: ReferenceItem[]) => void;
  updateSettings: (newSettings: SiteSettings) => void;
  saveAllContent: (snapshot: ContentSnapshot) => Promise<string>;
  resetAll: () => Promise<void>;
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const STORE = {
  plans: "hatay360_plans",
  slides: "hatay360_slides",
  services: "hatay360_services",
  sectors: "hatay360_sectors",
  references: "hatay360_references",
  settings: "hatay360_settings",
};

const LEGACY_KEYS = ["avci_plans", "avci_slides", "avci_services", "avci_references", "avci_settings"];

/** localStorage ~5 MB; base64 görsel/video sığmaz. Önbelleğe yalnızca küçük veriler yazılır. */
const LOCAL_CACHE_DATA_URL_MAX = 48_000;

function stripHeavyDataUrls<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, nested) => {
      if (typeof nested === "string" && nested.startsWith("data:") && nested.length > LOCAL_CACHE_DATA_URL_MAX) {
        return "";
      }
      return nested;
    }),
  ) as T;
}

function turkishStorageError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  const message = error instanceof Error ? error.message : String(error || "");
  if (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    /exceeded the quota|QuotaExceeded/i.test(message)
  ) {
    return "Tarayıcı depolama kotası doldu. Büyük resim/GIF/video dosyaları tarayıcıya sığmıyor; ‘Kaydet’ ile sunucuya yazın. Gerekirse bazı görselleri küçültün veya URL kullanın.";
  }
  if (/Failed to execute 'setItem'|setItem/i.test(message)) {
    return "Tarayıcı önbelleğine yazılamadı. Büyük medya dosyaları kotayı aşıyor olabilir; Kaydet ile sunucuya kaydedin.";
  }
  return message || "Tarayıcı önbelleği güncellenemedi.";
}

export function turkishContentError(error: unknown): string {
  if (!(error instanceof Error)) return "İçerik kaydedilemedi.";
  const msg = error.message || "";
  if (/exceeded the quota|QuotaExceeded|Failed to execute 'setItem'/i.test(msg)) {
    return turkishStorageError(error);
  }
  if (/Failed to fetch|NetworkError|Load failed|network/i.test(msg)) {
    return "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.";
  }
  if (/JSON|Unexpected token/i.test(msg)) {
    return "Sunucu yanıtı okunamadı. Sayfayı yenileyip tekrar deneyin.";
  }
  // Zaten Türkçe görünen mesajları olduğu gibi bırak
  return msg;
}

function writeLocalStore(key: string, value: unknown): void {
  try {
    const payload = JSON.stringify(stripHeavyDataUrls(value));
    localStorage.setItem(key, payload);
  } catch (error) {
    // Kotayı açmak için anahtarı temizlemeyi dene; uygulama belleğindeki veri korunur.
    try {
      localStorage.removeItem(key);
      localStorage.setItem(key, JSON.stringify(stripHeavyDataUrls(value)));
    } catch {
      console.warn(turkishStorageError(error));
    }
  }
}

export function planKind(plan: Plan): "ads" | "store" {
  return plan.kind === "store" || String(plan.id).startsWith("shop-") ? "store" : "ads";
}

function mergePlans(saved: Plan[]): Plan[] {
  const next = saved.map((plan) => ({ ...plan, kind: planKind(plan) }));
  for (const extra of INITIAL_PLANS) {
    if (!next.some((plan) => plan.id === extra.id)) next.push({ ...extra, kind: planKind(extra) });
  }
  return next;
}

function readStore<T>(key: string, fallback: T): T {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function readSectorsStore(): SectorItem[] {
  const saved = readStore<SectorItem[] | null>(STORE.sectors, null);
  if (!Array.isArray(saved) || saved.length === 0) {
    return INITIAL_SECTORS.map((sector) => normalizeSector(sector));
  }
  return saved.map((sector) => normalizeSector(sector));
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [databaseStatus, setDatabaseStatus] = useState<ContentContextType["databaseStatus"]>("loading");
  const [databaseHasContent, setDatabaseHasContent] = useState(false);
  const [contentError, setContentError] = useState("");
  const [plans, setPlans] = useState<Plan[]>(() => mergePlans(readStore(STORE.plans, INITIAL_PLANS)));

  const [slides, setSlides] = useState<Slide[]>(() => migrateSlides(readStore(STORE.slides, INITIAL_SLIDES)));

  const [services, setServices] = useState<EcosystemService[]>(() => readStore(STORE.services, INITIAL_SERVICES));

  const [sectors, setSectors] = useState<SectorItem[]>(() => readSectorsStore());

  const [references, setReferences] = useState<ReferenceItem[]>(() => readStore(STORE.references, INITIAL_REFERENCES));

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem(STORE.settings);
    if (!saved) return INITIAL_SETTINGS;
    try {
      return mergeSiteSettings(JSON.parse(saved));
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  useEffect(() => {
    let active = true;
    apiRequest<{ content: Partial<ContentSnapshot>; updatedAt: string | null }>("/api/content")
      .then(({ content, updatedAt }) => {
        if (!active) return;
        if (Array.isArray(content.plans)) updatePlans(mergePlans(content.plans));
        if (Array.isArray(content.slides)) updateSlides(migrateSlides(content.slides));
        if (Array.isArray(content.services)) updateServices(content.services);
        if (Array.isArray(content.sectors)) updateSectors(content.sectors);
        if (Array.isArray(content.references)) updateReferences(content.references);
        if (content.settings && typeof content.settings === "object") {
          updateSettings(mergeSiteSettings(content.settings));
        }
        setDatabaseStatus("connected");
        setDatabaseHasContent(Boolean(updatedAt));
        setContentError("");
      })
      .catch(() => {
        if (!active) return;
        setDatabaseStatus("offline");
        setContentError("Veritabanı sunucusuna ulaşılamadı; tarayıcı önbelleğindeki içerik gösteriliyor.");
      });
    return () => {
      active = false;
    };
  }, []);

  const updatePlans = (newPlans: Plan[]) => {
    setPlans(newPlans);
    writeLocalStore(STORE.plans, newPlans);
  };

  const updateSlides = (newSlides: Slide[]) => {
    setSlides(newSlides);
    writeLocalStore(STORE.slides, newSlides);
  };

  const updateServices = (newServices: EcosystemService[]) => {
    setServices(newServices);
    writeLocalStore(STORE.services, newServices);
  };

  const updateSectors = (newSectors: SectorItem[]) => {
    const normalized = newSectors.map((sector) => normalizeSector(sector));
    setSectors(normalized);
    writeLocalStore(STORE.sectors, normalized);
  };

  const updateReferences = (newRefs: ReferenceItem[]) => {
    setReferences(newRefs);
    writeLocalStore(STORE.references, newRefs);
  };

  const updateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    writeLocalStore(STORE.settings, { ...newSettings, aiApiKey: "" });
  };

  const saveAllContent = async (snapshot: ContentSnapshot) => {
    const sanitized: ContentSnapshot = {
      ...snapshot,
      sectors: snapshot.sectors.map((sector) => normalizeSector(sector)),
      settings: { ...snapshot.settings, aiApiKey: "" },
    };
    const result = await apiRequest<{ ok: boolean; updatedAt: string }>("/api/content", {
      method: "PUT",
      body: JSON.stringify({ content: sanitized }),
    });
    updatePlans(sanitized.plans);
    updateSlides(sanitized.slides);
    updateServices(sanitized.services);
    updateSectors(sanitized.sectors);
    updateReferences(sanitized.references);
    updateSettings({ ...snapshot.settings });
    setDatabaseStatus("connected");
    setDatabaseHasContent(true);
    setContentError("");
    return result.updatedAt;
  };

  const resetAll = async () => {
    await saveAllContent({
      plans: INITIAL_PLANS,
      slides: INITIAL_SLIDES,
      services: INITIAL_SERVICES,
      sectors: INITIAL_SECTORS.map((sector) => normalizeSector(sector)),
      references: INITIAL_REFERENCES,
      settings: INITIAL_SETTINGS,
    });
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  };

  return (
    <ContentContext.Provider
      value={{
        plans,
        slides,
        services,
        sectors,
        references,
        settings,
        databaseStatus,
        databaseHasContent,
        contentError,
        updatePlans,
        updateSlides,
        updateServices,
        updateSectors,
        updateReferences,
        updateSettings,
        saveAllContent,
        resetAll,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent ContentProvider içinde kullanılmalıdır.");
  }
  return context;
}
