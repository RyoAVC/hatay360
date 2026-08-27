export type DailyMetricSource = "sample" | "panel";

export type DailyMetric = {
  day: string;
  adsClicks: number;
  adsImpressions: number;
  adsSpend: number;
  siteVisitors: number;
  siteSessions: number;
  source: DailyMetricSource;
};

export type AdsDay = {
  day: string;
  clicks: number;
  impressions: number;
  spend: number;
  source: DailyMetricSource;
};

export type WebDay = {
  day: string;
  visitors: number;
  sessions: number;
  source: DailyMetricSource;
};

/** Reklam tıklaması ile site ziyaretini ayrı serilerde tutar; asla tek sayıya birleştirmez. */
export function splitAdsAndWeb(rows: readonly DailyMetric[]) {
  const ads: AdsDay[] = rows.map((row) => ({
    day: row.day,
    clicks: Math.max(0, Number(row.adsClicks) || 0),
    impressions: Math.max(0, Number(row.adsImpressions) || 0),
    spend: Math.max(0, Number(row.adsSpend) || 0),
    source: row.source === "panel" ? "panel" : "sample",
  }));
  const web: WebDay[] = rows.map((row) => ({
    day: row.day,
    visitors: Math.max(0, Number(row.siteVisitors) || 0),
    sessions: Math.max(0, Number(row.siteSessions) || 0),
    source: row.source === "panel" ? "panel" : "sample",
  }));
  return { ads, web };
}

export function summarizeClickToSite(rows: readonly DailyMetric[]) {
  const adsClicks = rows.reduce((sum, row) => sum + Math.max(0, Number(row.adsClicks) || 0), 0);
  const siteVisitors = rows.reduce((sum, row) => sum + Math.max(0, Number(row.siteVisitors) || 0), 0);
  const siteSessions = rows.reduce((sum, row) => sum + Math.max(0, Number(row.siteSessions) || 0), 0);
  if (adsClicks <= 0) {
    return {
      adsClicks,
      siteVisitors,
      siteSessions,
      rate: null as number | null,
      percentLabel: "—",
      label: "Reklam tıklaması yok; tıklama → site çizgisi hesaplanmaz.",
    };
  }
  const rate = siteVisitors / adsClicks;
  return {
    adsClicks,
    siteVisitors,
    siteSessions,
    rate,
    percentLabel: `${(rate * 100).toFixed(1)}%`,
    label: `Tıklama → site: ${(rate * 100).toFixed(1)}% (${siteVisitors} site ziyareti / ${adsClicks} reklam tıklaması)`,
  };
}

export function metricsSourceLabel(rows: readonly DailyMetric[]) {
  if (!rows.length) return "kayıt yok";
  const sample = rows.some((row) => row.source !== "panel");
  const panel = rows.some((row) => row.source === "panel");
  if (sample && panel) return "karışık";
  return panel ? "panel" : "örnek";
}
