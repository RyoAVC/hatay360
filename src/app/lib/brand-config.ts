/**
 * Marka bazlı ayar deposu (Hatay360 / Adana360).
 * Bayilik şartları ve ilerideki marka ayarları bu yapı üzerinden okunur.
 * Partner paneli / sözleşme henüz bu API’ye bağlı değildir.
 */

export type BrandId = "hatay360" | "adana360";

export type BrandMeta = {
  id: BrandId;
  label: string;
  shortLabel: string;
};

export const BRAND_LIST: BrandMeta[] = [
  { id: "hatay360", label: "Hatay360", shortLabel: "Hatay" },
  { id: "adana360", label: "Adana360", shortLabel: "Adana" },
];

export const DEFAULT_BRAND_ID: BrandId = "hatay360";

/** Marka ayar paketi — her markanın kendi dilimi */
export type BrandConfigSlice = {
  /** Bayilik şartları (komisyon, katılım, periyot) — bkz. bayilik-sartlari.ts */
  bayilikSartlari?: unknown;
};

export type BrandConfigStore = Record<BrandId, BrandConfigSlice>;

export const BRAND_CONFIG_STORAGE_KEY = "hatay360_brand_config_v1";

export function isBrandId(value: unknown): value is BrandId {
  return value === "hatay360" || value === "adana360";
}

export function emptyBrandConfigStore(): BrandConfigStore {
  return { hatay360: {}, adana360: {} };
}

export function readBrandConfigStore(): BrandConfigStore {
  if (typeof window === "undefined") return emptyBrandConfigStore();
  try {
    const raw = window.localStorage.getItem(BRAND_CONFIG_STORAGE_KEY);
    if (!raw) return emptyBrandConfigStore();
    const parsed = JSON.parse(raw) as Partial<BrandConfigStore>;
    return {
      hatay360: parsed?.hatay360 && typeof parsed.hatay360 === "object" ? parsed.hatay360 : {},
      adana360: parsed?.adana360 && typeof parsed.adana360 === "object" ? parsed.adana360 : {},
    };
  } catch {
    return emptyBrandConfigStore();
  }
}

export function writeBrandConfigStore(store: BrandConfigStore): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BRAND_CONFIG_STORAGE_KEY, JSON.stringify(store));
}

export function getBrandSlice(brandId: BrandId): BrandConfigSlice {
  const store = readBrandConfigStore();
  return store[brandId] || {};
}

export function patchBrandSlice(brandId: BrandId, patch: Partial<BrandConfigSlice>): BrandConfigStore {
  const store = readBrandConfigStore();
  const next: BrandConfigStore = {
    ...store,
    [brandId]: { ...store[brandId], ...patch },
  };
  writeBrandConfigStore(next);
  return next;
}

export function brandLabel(brandId: BrandId): string {
  return BRAND_LIST.find((b) => b.id === brandId)?.label || brandId;
}
