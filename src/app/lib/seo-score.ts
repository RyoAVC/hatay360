import { hasSeoSnapshot, type SeoKeywordRow } from "./seo-rank";

export type SeoMetric = {
  id: string;
  label: string;
  value: number;
  max?: number;
  hint?: string;
  tone?: "good" | "warn" | "muted";
};

export type SeoScorePayload = {
  score: number;
  label: string;
  sublabel: string;
  tracked: number;
  ranked: number;
  avgPosition: number | null;
  bestPosition: number | null;
  metrics: SeoMetric[];
  adminConfigured: boolean;
};

function positionPoints(position: number): number {
  if (position <= 3) return 100;
  if (position <= 10) return 82;
  if (position <= 20) return 68;
  if (position <= 50) return 48;
  return 28;
}

/** Kelime konumlarından görünürlük puanı; admin override varsa onu kullanır. */
export function buildSeoScore(
  keywords: SeoKeywordRow[],
  options?: { scoreOverride?: number | null; scoreLabel?: string; scoreNote?: string },
): SeoScorePayload {
  const tracked = keywords.length;
  const rankedRows = keywords.filter((row) => hasSeoSnapshot(row) && row.position != null);
  const ranked = rankedRows.length;
  const positions = rankedRows.map((row) => Number(row.position));
  const avgPosition = positions.length ? Math.round(positions.reduce((a, b) => a + b, 0) / positions.length) : null;
  const bestPosition = positions.length ? Math.min(...positions) : null;
  const computed =
    ranked > 0
      ? Math.round(rankedRows.reduce((sum, row) => sum + positionPoints(Number(row.position)), 0) / ranked)
      : 0;

  const override = options?.scoreOverride;
  const adminConfigured = override != null && Number.isFinite(Number(override)) && Number(override) > 0;
  const score = adminConfigured ? Math.min(100, Math.max(0, Math.round(Number(override)))) : computed;

  const label = options?.scoreLabel?.trim() || (score >= 80 ? "Güçlü görünürlük" : score >= 55 ? "Gelişiyor" : score > 0 ? "Takip altında" : "Veri bekleniyor");
  const sublabel =
    options?.scoreNote?.trim() ||
    (ranked > 0
      ? `${ranked} kelimede konum · ortalama ${avgPosition ?? "—"}`
      : "Google sıralama API bağlanınca haftalık güncellenir");

  const metrics: SeoMetric[] = [
    { id: "visibility", label: "SEO puanı", value: score, max: 100, tone: score >= 70 ? "good" : score >= 40 ? "warn" : "muted" },
    { id: "keywords", label: "Takip kelimesi", value: tracked, max: Math.max(tracked, 5), hint: "Hatay360 panelinden" },
    { id: "ranked", label: "Sıralamada", value: ranked, max: Math.max(tracked, 1), tone: ranked > 0 ? "good" : "muted" },
    {
      id: "avg",
      label: "Ort. konum",
      value: avgPosition ?? 0,
      max: 100,
      hint: avgPosition != null ? `#${avgPosition}` : "—",
      tone: avgPosition != null && avgPosition <= 10 ? "good" : "warn",
    },
    {
      id: "best",
      label: "En iyi",
      value: bestPosition != null ? Math.max(0, 100 - bestPosition) : 0,
      max: 100,
      hint: bestPosition != null ? `#${bestPosition}` : "—",
      tone: bestPosition != null && bestPosition <= 5 ? "good" : "muted",
    },
  ];

  return { score, label, sublabel, tracked, ranked, avgPosition, bestPosition, metrics, adminConfigured };
}
