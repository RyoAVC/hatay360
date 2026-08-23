import { isSiteStatus, type SiteStatus } from "./payment-balance";

export const OPS_DOTS = ["live", "off", "maintenance", "error"] as const;
export type OpsDot = (typeof OPS_DOTS)[number];

export const OPS_DOT_LABELS: Record<OpsDot, string> = {
  live: "LIVE",
  off: "Kapalı",
  maintenance: "Bakımda",
  error: "Sorun",
};

export function siteDotKind(siteStatus: string | null | undefined, siteError?: boolean | number | null): OpsDot {
  if (Number(siteError) === 1 || siteError === true) return "error";
  const status: SiteStatus = isSiteStatus(siteStatus) ? siteStatus : "open";
  if (status === "open") return "live";
  if (status === "maintenance") return "maintenance";
  return "off";
}

export function campaignDotKind(status: string | null | undefined, hasError?: boolean | number | null): OpsDot {
  if (Number(hasError) === 1 || hasError === true) return "error";
  const value = String(status || "active");
  if (value === "active") return "live";
  if (value === "paused" || value === "closed") return "off";
  return "maintenance";
}

export function serviceDotKind(status: string | null | undefined): OpsDot {
  const value = String(status || "new");
  if (value === "approved" || value === "accepted") return "live";
  if (value === "closed") return "off";
  if (value === "quoted") return "error";
  return "maintenance";
}

export function leadDotKind(status: string | null | undefined): OpsDot {
  const value = String(status || "new");
  if (value === "won") return "live";
  if (value === "closed") return "off";
  if (value === "contacted") return "maintenance";
  return "error";
}

export function partnerDotKind(status: string | null | undefined): OpsDot {
  const value = String(status || "pending");
  if (value === "active") return "live";
  if (value === "paused") return "off";
  return "error";
}

export function paymentDotKind(status: string | null | undefined, overdue?: boolean): OpsDot {
  if (overdue) return "error";
  const value = String(status || "unpaid");
  if (value === "paid") return "live";
  if (value === "remaining") return "maintenance";
  return "off";
}

export function contractSignDotKind(status: string | null | undefined): OpsDot {
  const value = String(status || "pending");
  if (value === "approved") return "live";
  if (value === "rejected") return "off";
  if (value === "signed") return "maintenance";
  return "error";
}

export function ticketDotKind(status: string | null | undefined): OpsDot {
  const value = String(status || "open");
  if (value === "answered" || value === "closed") return "live";
  if (value === "answering") return "maintenance";
  return "error";
}

export function whatsappDotKind(status: string | null | undefined): OpsDot {
  const value = String(status || "waiting");
  if (value === "done" || value === "closed") return "live";
  if (value === "serving") return "maintenance";
  return "error";
}
