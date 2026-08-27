export const SEO_RANK_WAIT_MESSAGE =
  "Sıralama verisi bekleniyor — Hatay360 Google API bağlayınca haftalık konumlar burada görünecek.";

export type SeoKeywordRow = {
  id: number;
  keyword: string;
  locale: string;
  active?: boolean;
  createdAt?: string;
  position: number | null;
  previousPosition: number | null;
  delta: number | null;
  lastChecked: string | null;
  url?: string;
  source?: string;
  customerId?: number;
  companyName?: string;
};

export type SeoPayload = {
  keywords: SeoKeywordRow[];
  connected: false;
  message: string;
  score?: number;
  scoreLabel?: string;
  scoreNote?: string;
  scoreAdminConfigured?: boolean;
  metrics?: Array<{ id: string; label: string; value: number; max?: number; hint?: string }>;
};

export function hasSeoSnapshot(row: SeoKeywordRow) {
  return Boolean(row.lastChecked);
}

export function seoDeltaTone(delta: number | null) {
  if (delta == null || delta === 0) return "neutral" as const;
  return delta > 0 ? ("up" as const) : ("down" as const);
}
