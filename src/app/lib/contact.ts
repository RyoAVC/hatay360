export const PHONE_ERROR = "Telefonu 05xx xxx xx xx şeklinde, yalnızca rakam yazın.";

export function phoneDigits(value: string) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length >= 12) digits = `0${digits.slice(2)}`;
  if (digits.length === 10 && digits.startsWith("5")) digits = `0${digits}`;
  return digits.slice(0, 11);
}

export function formatTrPhone(digits: string) {
  const d = phoneDigits(digits);
  const parts = [d.slice(0, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)].filter(Boolean);
  return parts.join(" ");
}

/** Harf ve fazla rakamı keser: 0544 444 44 44 */
export function sanitizePhoneInput(value: string) {
  return formatTrPhone(value);
}

export function isValidTrPhone(value: string) {
  const digits = phoneDigits(value);
  return digits.length === 11 && digits.startsWith("0");
}

/** Telefondaki boşluk ve parantezleri temizler: "tel:+908508880000" */
export function toTelHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

/** WhatsApp linki üretir; istenirse hazır mesaj ekler. */
export function toWhatsAppHref(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
