/** Paket maddesi metninden modern/renkli ikon URL önerisi (Iconify CDN). */

const ICONIFY = "https://api.iconify.design";

function icon(collection: string, name: string, color?: string) {
  const base = `${ICONIFY}/${collection}:${name}.svg`;
  if (!color) return `${base}?height=48`;
  return `${base}?color=${encodeURIComponent(color)}&height=48`;
}

type Rule = { test: RegExp; url: string };

/** Önce marka / ürün, sonra genel kavram — ilk eşleşen kazanır. */
const RULES: Rule[] = [
  { test: /google\s*ads|adsense|adwords/i, url: icon("logos", "google-ads") },
  { test: /google\s*maps|harita|maps|maps?\s*kay/i, url: icon("logos", "google-maps") },
  { test: /\bgoogle\b|gmb|işletme profil/i, url: icon("logos", "google-icon") },
  { test: /\bmeta\b|facebook|instagram|ig\b/i, url: icon("logos", "meta-icon") },
  { test: /whatsapp|wp\b|whats\s*app/i, url: icon("logos", "whatsapp-icon") },
  { test: /youtube/i, url: icon("logos", "youtube-icon") },
  { test: /tiktok/i, url: icon("logos", "tiktok-icon") },
  { test: /linkedin/i, url: icon("logos", "linkedin-icon") },
  { test: /iyzico|ödeme|payment|pos\b/i, url: icon("fluent-emoji", "credit-card") },
  { test: /ssl|https|sertifika|kilit/i, url: icon("fluent-emoji", "locked-with-key") },
  { test: /araba|araç|otomobil|motor|galeri|oto\b/i, url: icon("fluent-emoji", "automobile") },
  { test: /taksi|uber|transfer/i, url: icon("fluent-emoji", "taxi") },
  { test: /yemek|restoran|cafe|kahve|mutfak/i, url: icon("fluent-emoji", "fork-and-knife-with-plate") },
  { test: /otel|konaklama|turizm|seyahat/i, url: icon("fluent-emoji", "hotel") },
  { test: /sağlık|klinik|diş|hastane|doktor/i, url: icon("fluent-emoji", "medical-symbol") },
  { test: /e-?ticaret|mağaza|shop|ürün|sepet/i, url: icon("fluent-emoji", "shopping-cart") },
  { test: /seo|sıralama|arama motor/i, url: icon("fluent-emoji", "magnifying-glass-tilted-left") },
  { test: /reklam|kampanya|bütçe|medya/i, url: icon("fluent-emoji", "megaphone") },
  { test: /sms|bildirim|push/i, url: icon("fluent-emoji", "mobile-phone") },
  { test: /e-?posta|mail|newsletter/i, url: icon("fluent-emoji", "e-mail") },
  { test: /destek|canlı\s*destek|chat|chatbot/i, url: icon("fluent-emoji", "speech-balloon") },
  { test: /analitik|rapor|istatistik|dashboard|panel/i, url: icon("fluent-emoji", "bar-chart") },
  { test: /domain|alan\s*adı|hosting|sunucu/i, url: icon("fluent-emoji", "globe-with-meridians") },
  { test: /site|web|landing|sayfa|kurumsal/i, url: icon("fluent-emoji", "laptop") },
  { test: /mobil|uygulama|app\b/i, url: icon("fluent-emoji", "mobile-phone") },
  { test: /foto|görsel|galeri|video/i, url: icon("fluent-emoji", "camera") },
  { test: /hız|cdn|performans|optimiz/i, url: icon("fluent-emoji", "high-voltage") },
  { test: /güvenlik|firewall|koruma/i, url: icon("fluent-emoji", "shield") },
  { test: /yedek|backup/i, url: icon("fluent-emoji", "floppy-disk") },
  { test: /sosyal|sosyal\s*medya/i, url: icon("fluent-emoji", "glowing-star") },
  { test: /paket|abonelik|üyelik/i, url: icon("fluent-emoji", "package") },
  { test: /qr|barkod/i, url: icon("lucide", "qr-code", "#00a8c4") },
  { test: /telefon|ara\b|çağrı|callback/i, url: icon("fluent-emoji", "telephone-receiver") },
  { test: /konum|adres|ilçe|şehir/i, url: icon("fluent-emoji", "round-pushpin") },
  { test: /ai|yapay\s*zeka|chatgpt/i, url: icon("fluent-emoji", "robot") },
];

const FALLBACK = icon("fluent-emoji", "sparkles");

export function isAutoFeatureIcon(url?: string | null) {
  if (!url) return false;
  return url.includes("api.iconify.design/") || url.startsWith("data:image/svg+xml");
}

/** Madde metnine göre renkli / modern ikon URL’si. Eşleşme yoksa null (admin manuel girebilir). */
export function suggestFeatureIcon(text: string): string | null {
  const raw = String(text || "").trim();
  if (raw.length < 2) return null;
  for (const rule of RULES) {
    if (rule.test.test(raw)) return rule.url;
  }
  // Genel ama zayıf öneri — yalnızca kısa genel maddeler için
  if (/özellik|destek|dahil|ücretsiz|sınırsız/i.test(raw)) return FALLBACK;
  return null;
}
