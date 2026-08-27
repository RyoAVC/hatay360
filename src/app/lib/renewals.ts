export type RenewalKind = "domain" | "hosting" | "bakim" | "ssl" | "web_tasarim" | "yazilim" | "reklam" | "ozel_kodlama" | "diger";
export type RenewalStatus = "active" | "cancelled" | "done";
export type RenewalBucket = "overdue" | "due" | "upcoming" | "later";

export type Renewal = {
  id: number;
  customerId: number;
  companyName: string;
  kind: RenewalKind;
  label: string;
  renewDate: string;
  amount: number;
  note: string;
  status: RenewalStatus;
  daysLeft: number;
  bucket: RenewalBucket;
  createdAt: string;
  updatedAt: string;
};

export const RENEWAL_KIND_LABELS: Record<RenewalKind, string> = {
  domain: "Alan adı",
  hosting: "Hosting",
  bakim: "Bakım paketi",
  ssl: "SSL",
  web_tasarim: "Web Tasarım Hizmeti",
  yazilim: "Yazılım Geliştirme",
  reklam: "Reklam Hizmeti",
  ozel_kodlama: "Özel Kodlama",
  diger: "Diğer",
};

export const RENEWAL_STATUS_LABELS: Record<RenewalStatus, string> = {
  active: "Aktif",
  cancelled: "İptal",
  done: "Yenilendi",
};

export const RENEWAL_KINDS = Object.keys(RENEWAL_KIND_LABELS) as RenewalKind[];

export const RENEWAL_BUCKET_LABELS: Record<RenewalBucket, string> = {
  overdue: "Süresi geçmiş",
  due: "14 gün içinde",
  upcoming: "Yaklaşan",
  later: "İleri tarih",
};

/** "3 gün kaldı" / "Bugün" / "5 gün geçti" gibi kısa geri sayım metni. */
export function renewalCountdownLabel(daysLeft: number): string {
  if (daysLeft < 0) return `${Math.abs(daysLeft)} gün geçti`;
  if (daysLeft === 0) return "Bugün";
  return `${daysLeft} gün kaldı`;
}

export function renewalKindLabel(kind: string): string {
  return RENEWAL_KIND_LABELS[(kind as RenewalKind)] || RENEWAL_KIND_LABELS.diger;
}

/** Panel-içi bildirim için: müşteriye gösterilecek acil (süresi geçmiş veya <=14 gün) yenilemeler. */
export function urgentRenewals(renewals: Renewal[]): Renewal[] {
  return (renewals || []).filter(
    (item) => item.status === "active" && (item.bucket === "overdue" || item.bucket === "due"),
  );
}

const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

export function formatRenewDate(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}
