import {
  normalizeAttentionEffect,
  type AttentionEffectId,
} from "./attention-effects";

export type LoginPromoMediaType = "none" | "image" | "gif" | "video";

export type LoginPromoBanner = {
  id: string;
  label: string;
  title: string;
  /** CSS gradient; görsel yoksa kullanılır */
  gradient: string;
  /** @deprecated imageUrl — mediaUrl tercih edilir */
  imageUrl?: string;
  mediaType?: LoginPromoMediaType;
  mediaUrl?: string;
  /** Ana medya dikkat efekti */
  effectId?: AttentionEffectId;
  /** Üstüne binen dikkat katmanı (sticker) */
  overlayUrl?: string;
  overlayEffect?: AttentionEffectId;
  /** Admin’de efektin görünen adı (isteğe bağlı özel etiket) */
  overlayName?: string;
};

export type LoginPromoStat = {
  label: string;
  value: number;
  suffix?: string;
};

export const DEFAULT_CUSTOMER_LOGIN_BANNERS: LoginPromoBanner[] = [
  {
    id: "c1",
    label: "Web + reklam",
    title: "Tek panelde site ve kampanya",
    gradient: "linear-gradient(135deg, #064e56 0%, #00a8c4 48%, #7ee0ec 100%)",
    mediaType: "none",
    effectId: "none",
  },
  {
    id: "c2",
    label: "Harita kaydı",
    title: "Google Maps görünürlüğü",
    gradient: "linear-gradient(135deg, #0b3d4a 0%, #0891b2 45%, #67e8f9 100%)",
    mediaType: "none",
    effectId: "none",
  },
  {
    id: "c3",
    label: "Canlı destek",
    title: "Ticket ve WhatsApp aynı yerde",
    gradient: "linear-gradient(145deg, #134e4a 0%, #0e7490 50%, #5eead4 100%)",
    mediaType: "none",
    effectId: "none",
  },
  {
    id: "c4",
    label: "AVC güvencesi",
    title: "Ölçülen sonuç, şeffaf rapor",
    gradient: "linear-gradient(125deg, #164e63 0%, #0284c7 42%, #22d3ee 100%)",
    mediaType: "none",
    effectId: "none",
  },
];

export const DEFAULT_PARTNER_LOGIN_BANNERS: LoginPromoBanner[] = [
  {
    id: "p1",
    label: "Bayilik ağı",
    title: "Firmanızla birlikte büyüyen satış",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 48%, #a5b4fc 100%)",
    mediaType: "none",
    effectId: "none",
  },
  {
    id: "p2",
    label: "Komisyon",
    title: "Getirdiğiniz müşteriden kazanç",
    gradient: "linear-gradient(135deg, #312e81 0%, #6366f1 45%, #c4b5fd 100%)",
    mediaType: "none",
    effectId: "none",
  },
  {
    id: "p3",
    label: "Referans linki",
    title: "Tek link, ölçülen dönüşüm",
    gradient: "linear-gradient(145deg, #2e1065 0%, #7c3aed 50%, #ddd6fe 100%)",
    mediaType: "none",
    effectId: "none",
  },
  {
    id: "p4",
    label: "Panel",
    title: "Kazanç ve ödeme takibi",
    gradient: "linear-gradient(125deg, #1e1b4b 0%, #4338ca 42%, #818cf8 100%)",
    mediaType: "none",
    effectId: "none",
  },
];

export const DEFAULT_CUSTOMER_LOGIN_STATS: LoginPromoStat[] = [
  { label: "Bu ay yeni müşteri", value: 48, suffix: "" },
  { label: "Yönetilen site", value: 320, suffix: "+" },
  { label: "Aktif kampanya", value: 186, suffix: "" },
];

export const DEFAULT_PARTNER_LOGIN_STATS: LoginPromoStat[] = [
  { label: "Bu ay yeni bayi", value: 14, suffix: "" },
  { label: "Aktif partner", value: 86, suffix: "" },
  { label: "Yönlendirilen lead", value: 240, suffix: "+" },
];

export const DEFAULT_CUSTOMER_LOGIN_CHART = [42, 48, 55, 52, 68, 78];
export const DEFAULT_PARTNER_LOGIN_CHART = [28, 34, 41, 39, 52, 64];

const FALLBACK_GRADIENT = "linear-gradient(135deg, #0f172a 0%, #334155 100%)";

function detectMediaType(url: string, hinted?: string): LoginPromoMediaType {
  if (hinted === "video" || hinted === "gif" || hinted === "image" || hinted === "none") {
    return hinted;
  }
  const lower = url.toLowerCase();
  if (!url) return "none";
  if (lower.includes("video") || lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.startsWith("data:video")) {
    return "video";
  }
  if (lower.includes("gif") || lower.endsWith(".gif") || lower.startsWith("data:image/gif")) {
    return "gif";
  }
  return "image";
}

export function normalizeLoginBanners(raw: unknown, fallback: LoginPromoBanner[]): LoginPromoBanner[] {
  if (!Array.isArray(raw) || raw.length === 0) return fallback.map((b) => ({ ...b }));
  const next = raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label = String(row.label || "").trim().slice(0, 60);
      const title = String(row.title || "").trim().slice(0, 120);
      if (!label && !title) return null;
      const legacyImage = String(row.imageUrl || "").trim().slice(0, 2_000_000);
      const mediaUrl = String(row.mediaUrl || legacyImage || "").trim().slice(0, 2_000_000);
      const mediaType = detectMediaType(mediaUrl, String(row.mediaType || ""));
      return {
        id: String(row.id || `banner-${index}-${Date.now()}`).slice(0, 80),
        label: label || "Banner",
        title: title || label || "Kampanya",
        gradient: String(row.gradient || FALLBACK_GRADIENT).slice(0, 400) || FALLBACK_GRADIENT,
        imageUrl: legacyImage || undefined,
        mediaType: mediaUrl ? mediaType : "none",
        mediaUrl: mediaUrl || undefined,
        effectId: normalizeAttentionEffect(row.effectId),
        overlayUrl: String(row.overlayUrl || "").trim().slice(0, 2_000_000) || undefined,
        overlayEffect: normalizeAttentionEffect(row.overlayEffect),
        overlayName: String(row.overlayName || "").trim().slice(0, 80) || undefined,
      } satisfies LoginPromoBanner;
    })
    .filter(Boolean) as LoginPromoBanner[];
  return next.length ? next : fallback.map((b) => ({ ...b }));
}

export function emptyLoginBanner(theme: "customer" | "partner"): LoginPromoBanner {
  return {
    id: `b-${Date.now()}`,
    label: "Yeni banner",
    title: "Başlık buraya",
    gradient:
      theme === "partner"
        ? "linear-gradient(135deg, #1e1b4b 0%, #6366f1 50%, #a5b4fc 100%)"
        : "linear-gradient(135deg, #064e56 0%, #00a8c4 50%, #7ee0ec 100%)",
    mediaType: "none",
    mediaUrl: "",
    effectId: "pulse",
    overlayUrl: "",
    overlayEffect: "tada",
    overlayName: "Dikkat katmanı",
  };
}

/** Banner için gösterilecek medya URL’si */
export function bannerMediaUrl(banner: LoginPromoBanner): string {
  return String(banner.mediaUrl || banner.imageUrl || "").trim();
}
