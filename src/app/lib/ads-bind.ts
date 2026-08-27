export type AdsAccountBinding = {
  googleId: string;
  metaId: string;
  googleBound: boolean;
  metaBound: boolean;
  live: boolean;
  label: string;
  detail: string;
  status: string;
};

export type AdsReportPoint = {
  day: string;
  adsClicks: number;
  adsImpressions: number;
  adsSpend: number;
};

export type AdsReportPayload = {
  range: number;
  series: AdsReportPoint[];
  source: "none" | "hatay360" | string;
  binding: AdsAccountBinding;
};

export const ADS_RANGES = [7, 30, 90] as const;
export type AdsRange = (typeof ADS_RANGES)[number];

export const ADS_UNBOUND_DETAIL = "Hesap ID’si henüz eşleşmedi.";
export const ADS_BOUND_NO_API_DETAIL =
  "Google Ads / Meta hesap ID kayıtlı; canlı API henüz bağlı değil. Sayılar Hatay360 kaydıdır.";

export function adsBindingFallback(partial?: Partial<AdsAccountBinding>): AdsAccountBinding {
  return {
    googleId: "",
    metaId: "",
    googleBound: false,
    metaBound: false,
    live: false,
    label: "eşleşmedi",
    detail: ADS_UNBOUND_DETAIL,
    status: "pending",
    ...partial,
  };
}
