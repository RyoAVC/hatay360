export const PAYMENT_STATUSES = ["paid", "unpaid", "remaining"] as const;
export const SITE_STATUSES = ["open", "maintenance", "closed"] as const;
export const ACCOUNT_STATUSES = ["pending", "active", "paused", "closed"] as const;
export const CATALOG_KINDS = ["product", "service", "invoice", "extra"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type SiteStatus = (typeof SITE_STATUSES)[number];
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
export type CatalogKind = (typeof CATALOG_KINDS)[number];

export const LATE_FEE_RATE = 0.15;

export type PaymentLike = {
  amount?: number | string | null;
  paidAmount?: number | string | null;
  paid_amount?: number | string | null;
  status?: string | null;
  startDate?: string | null;
  start_date?: string | null;
  endDate?: string | null;
  end_date?: string | null;
  period?: string | null;
  now?: Date | string | null;
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Ödendi",
  unpaid: "Ödenmedi",
  remaining: "Kalan",
};

export const SITE_STATUS_LABELS: Record<SiteStatus, string> = {
  open: "Açık",
  maintenance: "Bakımda",
  closed: "Kapalı",
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  pending: "Beklemede",
  active: "Aktif",
  paused: "Duraklatıldı",
  closed: "Kapalı",
};

export const CATALOG_KIND_LABELS: Record<CatalogKind, string> = {
  product: "Ürün",
  service: "Hizmet",
  invoice: "Fatura",
  extra: "Ek hizmet",
};

/** Kuruş: her zaman 2 hane, asla negatif değil. */
export function roundMoney(value: number | string | null | undefined) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return 0;
  return Math.round(Math.max(0, number) * 100) / 100;
}

export function formatTry(value: number | string | null | undefined) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundMoney(value));
}

/** Ödeme özeti PDF dosya adı — vadesi geçmişte CEZA işareti. */
export function paymentInvoiceFileName(period?: string | null, overdue?: boolean, id?: number | string) {
  const slug = String(period || id || "odeme")
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "odeme";
  return overdue ? `hatay360-odeme-${slug}-ceza.pdf` : `hatay360-odeme-${slug}.pdf`;
}

export function isPaymentStatus(value: string | null | undefined): value is PaymentStatus {
  return PAYMENT_STATUSES.includes(String(value || "") as PaymentStatus);
}

export function isSiteStatus(value: string | null | undefined): value is SiteStatus {
  return SITE_STATUSES.includes(String(value || "") as SiteStatus);
}

export function isAccountStatus(value: string | null | undefined): value is AccountStatus {
  return ACCOUNT_STATUSES.includes(String(value || "") as AccountStatus);
}

export function isCatalogKind(value: string | null | undefined): value is CatalogKind {
  return CATALOG_KINDS.includes(String(value || "") as CatalogKind);
}

export function parseYmd(value: string | null | undefined) {
  const match = String(value || "").trim().match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3] || 1);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1) return null;
  return date;
}

export function formatYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function lastDayOfMonth(year: number, month: number) {
  return formatYmd(new Date(year, month, 0));
}

export function periodFromStart(startDate: string | null | undefined, fallback = "") {
  const parsed = parseYmd(startDate);
  if (parsed) return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
  const period = String(fallback || "").slice(0, 7);
  return /^\d{4}-\d{2}$/.test(period) ? period : "";
}

export function defaultPaymentDates(period: string, startDate?: string | null, endDate?: string | null) {
  const start = parseYmd(startDate) || parseYmd(`${String(period || "").slice(0, 7)}-01`);
  const startText = start ? formatYmd(start) : "";
  const endText = parseYmd(endDate)
    ? formatYmd(parseYmd(endDate) as Date)
    : start
      ? lastDayOfMonth(start.getFullYear(), start.getMonth() + 1)
      : "";
  return {
    period: periodFromStart(startText, period),
    startDate: startText,
    endDate: endText,
  };
}

export function calendarDaysBetween(from: Date, to: Date) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function paymentDueState(endDate: string | null | undefined, now: Date | string | null | undefined = new Date()) {
  const end = parseYmd(endDate);
  const today = now instanceof Date ? now : parseYmd(String(now || "")) || new Date();
  if (!end) return { overdue: false, daysLeft: null as number | null, daysOverdue: 0 };
  const delta = calendarDaysBetween(today, end);
  if (delta >= 0) return { overdue: false, daysLeft: delta, daysOverdue: 0 };
  return { overdue: true, daysLeft: 0, daysOverdue: Math.abs(delta) };
}

/** Ceza satırda saklanmaz. remaining = unpaid * 1.15, kuruş yuvarlanır. */
export function applyLateFee(unpaid: number | string | null | undefined, overdue: boolean) {
  const unpaidBase = roundMoney(unpaid);
  if (!overdue || unpaidBase <= 0) return { unpaidBase, penalty: 0, remaining: unpaidBase };
  const remaining = roundMoney(unpaidBase * (1 + LATE_FEE_RATE));
  return { unpaidBase, penalty: roundMoney(remaining - unpaidBase), remaining };
}

/**
 * Ödeme satırı: amount + periodStart/periodEnd.
 * Ödendi yalnızca admin "paid" işaretlerse.
 * Kalan = ödenmeyen; vade geçtiyse ödenmeyen × 1.15.
 * Reklam tıklaması bu hesaba girmez.
 */
export function resolvePaymentAmounts(input: PaymentLike) {
  const amount = roundMoney(input.amount);
  const givenPaid = roundMoney(input.paidAmount ?? input.paid_amount);
  const status = isPaymentStatus(input.status) ? input.status : "";
  const dates = defaultPaymentDates(
    String(input.period || ""),
    input.startDate ?? input.start_date,
    input.endDate ?? input.end_date,
  );
  const due = paymentDueState(dates.endDate, input.now);

  let paidAmount = 0;
  let unpaidBase = amount;
  let resolvedStatus: PaymentStatus = "unpaid";

  if (status === "paid") {
    paidAmount = amount;
    unpaidBase = 0;
    resolvedStatus = "paid";
  } else if (status === "unpaid") {
    paidAmount = 0;
    unpaidBase = amount;
    resolvedStatus = "unpaid";
  } else if (status === "remaining") {
    paidAmount = Math.min(givenPaid, amount);
    unpaidBase = roundMoney(amount - paidAmount);
    resolvedStatus = unpaidBase <= 0 ? (amount > 0 ? "paid" : "unpaid") : paidAmount <= 0 ? "unpaid" : "remaining";
    if (resolvedStatus === "paid") {
      paidAmount = amount;
      unpaidBase = 0;
    }
  } else {
    paidAmount = 0;
    unpaidBase = amount;
    resolvedStatus = "unpaid";
  }

  const chargeOverdue = Boolean(dates.endDate) && due.overdue && resolvedStatus !== "paid";
  const fee = applyLateFee(unpaidBase, chargeOverdue);
  return {
    amount,
    paidAmount,
    status: resolvedStatus,
    remaining: fee.remaining,
    unpaidBase: fee.unpaidBase,
    penalty: fee.penalty,
    overdue: chargeOverdue && fee.unpaidBase > 0,
    daysLeft: due.daysLeft,
    daysOverdue: due.daysOverdue,
    startDate: dates.startDate,
    endDate: dates.endDate,
    period: dates.period,
  };
}

export function summarizePayments(rows: readonly PaymentLike[]) {
  let total = 0;
  let paid = 0;
  let unpaid = 0;
  let remaining = 0;
  let penalty = 0;
  let overdueCount = 0;

  for (const row of rows || []) {
    const item = resolvePaymentAmounts(row);
    total += item.amount;
    paid += item.paidAmount;
    unpaid += item.unpaidBase;
    remaining += item.remaining;
    penalty += item.penalty;
    if (item.overdue) overdueCount += 1;
  }

  return {
    total: roundMoney(total),
    paid: roundMoney(paid),
    unpaid: roundMoney(unpaid),
    remaining: roundMoney(remaining),
    penalty: roundMoney(penalty),
    overdueCount,
  };
}
