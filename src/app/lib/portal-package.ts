export const PORTAL_PACKAGE_IDS = ["start", "pro", "scale", "enterprise", "shop-start", "shop-pro"] as const;

export type PortalPackageId = (typeof PORTAL_PACKAGE_IDS)[number];
export type SiteEditMode = "self-serve" | "own-panel" | "none";

const PACKAGE_NAMES: Record<PortalPackageId, string> = {
  start: "Hatay360 Reklam Start",
  pro: "Hatay360 Reklam Pro",
  scale: "Hatay360 Yerel Hizmet Reklamı",
  enterprise: "Hatay360 Kurumsal Reklam & Web",
  "shop-start": "Hatay360 Mağaza Start",
  "shop-pro": "Hatay360 Mağaza & Pazarla",
};

/** Hatay360 barındırmalı küçük vitrin: logo, telefon, adres, saat. Tam CMS değil. */
const SELF_SERVE = new Set<string>(["start", "pro", "scale", "shop-start"]);

/** Kendi site panelinden yönetilen / kurumsal paketler. */
const OWN_PANEL = new Set<string>(["enterprise", "shop-pro"]);

export function normalizePackageId(value: string | null | undefined) {
  const id = String(value || "").trim();
  return PORTAL_PACKAGE_IDS.includes(id as PortalPackageId) ? (id as PortalPackageId) : "";
}

export function packageLabel(packageId: string | null | undefined) {
  const id = normalizePackageId(packageId);
  return id ? PACKAGE_NAMES[id] : "Paket atanmadı";
}

export function resolveSiteEditMode(packageId: string | null | undefined): SiteEditMode {
  const id = normalizePackageId(packageId);
  if (SELF_SERVE.has(id)) return "self-serve";
  if (OWN_PANEL.has(id)) return "own-panel";
  return "none";
}

export function canEditSmallSiteFields(packageId: string | null | undefined) {
  return resolveSiteEditMode(packageId) === "self-serve";
}

export const SITE_EDIT_COPY: Record<SiteEditMode, string> = {
  "self-serve": "Paketinize göre logoyu, telefonu, adresi ve çalışma saatini buradan güncelleyebilirsiniz. Tam site içeriği CMS değildir.",
  "own-panel": "Bu pakette siteyi kendi panelinizden yönetirsiniz. Hatay360 burada durum, harita ve reklamı gösterir.",
  none: "Küçük alan düzenleme, web paketi bağlanınca açılır. Durum, harita ve reklam yine görünür.",
};
