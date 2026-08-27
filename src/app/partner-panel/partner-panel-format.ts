export function formatTry(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatPartnerDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(value));
}

export function formatPartnerMonth(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date(value));
}
