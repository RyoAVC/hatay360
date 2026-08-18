import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { DEFAULT_DISTRICTS, DEFAULT_SEO_KEYWORDS, DEFAULT_SEO_LOCAL_LEAD, DEFAULT_SEO_PAGES, type District, type SeoPage, type SeoPageId } from "../lib/seo";
import { apiRequest } from "../lib/api";

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
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=82",
  },
  nakliyat: {
    badge: "Evden Eve Nakliyat",
    accent: "#38bdf8",
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1400&q=82",
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

export type SiteSettings = {
  siteTitle: string;
  phone: string;
  email: string;
  address: string;
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
};

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
    effectStyle: "fire",
    effectText: "Alev alan yerel fırsat",
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
    secondaryCtaHref: "/pazarla",
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
      "Google PageSpeed 99+ uyumlu performans",
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
  avciLabsUrl: "/pazarla",
  mascotName: "360 Bot",
  mascotActive: true,
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

export function planKind(plan: Plan): "ads" | "store" {
  return plan.kind === "store" || String(plan.id).startsWith("shop-") ? "store" : "ads";
}

function mergePlans(saved: Plan[]): Plan[] {
  const next = saved.map((plan) => ({ ...plan, kind: planKind(plan) }));
  for (const extra of INITIAL_PLANS) {
    if (!next.some((plan) => plan.id === extra.id)) next.push(extra);
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

  const [slides, setSlides] = useState<Slide[]>(() => readStore(STORE.slides, INITIAL_SLIDES));

  const [services, setServices] = useState<EcosystemService[]>(() => readStore(STORE.services, INITIAL_SERVICES));

  const [sectors, setSectors] = useState<SectorItem[]>(() => readSectorsStore());

  const [references, setReferences] = useState<ReferenceItem[]>(() => readStore(STORE.references, INITIAL_REFERENCES));

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem(STORE.settings);
    if (!saved) return INITIAL_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
        phone:
          !parsed.phone || ["+90 (850) 888 00 00", "+90 850 308 68 97"].includes(parsed.phone)
            ? INITIAL_SETTINGS.phone
            : parsed.phone,
        aiApiKey: "",
        seoPages: { ...INITIAL_SETTINGS.seoPages, ...(parsed.seoPages || {}) },
        districts: Array.isArray(parsed.districts) && parsed.districts.length ? parsed.districts : INITIAL_SETTINGS.districts,
      };
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
        if (Array.isArray(content.slides)) updateSlides(content.slides);
        if (Array.isArray(content.services)) updateServices(content.services);
        if (Array.isArray(content.sectors)) updateSectors(content.sectors);
        if (Array.isArray(content.references)) updateReferences(content.references);
        if (content.settings && typeof content.settings === "object") {
          updateSettings({
            ...INITIAL_SETTINGS,
            ...content.settings,
            phone:
              !content.settings.phone || ["+90 (850) 888 00 00", "+90 850 308 68 97"].includes(content.settings.phone)
                ? INITIAL_SETTINGS.phone
                : content.settings.phone,
            aiApiKey: "",
            seoPages: { ...INITIAL_SETTINGS.seoPages, ...(content.settings.seoPages || {}) },
            districts:
              Array.isArray(content.settings.districts) && content.settings.districts.length
                ? content.settings.districts
                : INITIAL_SETTINGS.districts,
          });
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
    localStorage.setItem(STORE.plans, JSON.stringify(newPlans));
  };

  const updateSlides = (newSlides: Slide[]) => {
    setSlides(newSlides);
    localStorage.setItem(STORE.slides, JSON.stringify(newSlides));
  };

  const updateServices = (newServices: EcosystemService[]) => {
    setServices(newServices);
    localStorage.setItem(STORE.services, JSON.stringify(newServices));
  };

  const updateSectors = (newSectors: SectorItem[]) => {
    const normalized = newSectors.map((sector) => normalizeSector(sector));
    setSectors(normalized);
    localStorage.setItem(STORE.sectors, JSON.stringify(normalized));
  };

  const updateReferences = (newRefs: ReferenceItem[]) => {
    setReferences(newRefs);
    localStorage.setItem(STORE.references, JSON.stringify(newRefs));
  };

  const updateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORE.settings, JSON.stringify({ ...newSettings, aiApiKey: "" }));
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
