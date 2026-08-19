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

/** WhatsApp uluslararası rakam: 05xx → 905xx, +90 korunur. */
export function whatsAppDigits(phone: string) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length >= 12) return digits.slice(0, 15);
  if (digits.startsWith("0") && digits.length >= 11) return `90${digits.slice(1, 11)}`;
  if (digits.length === 10 && digits.startsWith("5")) return `90${digits}`;
  return digits.slice(0, 15);
}

/** WhatsApp linki üretir; istenirse hazır mesaj ekler. */
export function toWhatsAppHref(phone: string, message?: string) {
  const digits = whatsAppDigits(phone);
  if (!digits) return "";
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function vcardText(value: string, max = 80) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, " ")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .trim()
    .slice(0, max);
}

export function buildVCard(input: {
  name: string;
  phone: string;
  email?: string;
  street?: string;
  city?: string;
  url?: string;
}) {
  const name = vcardText(input.name, 80);
  if (!name) return "";
  const tel = whatsAppDigits(input.phone);
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:;${name};;;`, `FN:${name}`, `ORG:${name}`];
  if (tel) lines.push(`TEL;TYPE=CELL:+${tel}`);
  const email = vcardText(input.email || "", 80);
  if (email.includes("@")) lines.push(`EMAIL;TYPE=WORK:${email}`);
  const street = vcardText(input.street || "", 80);
  const city = vcardText(input.city || "", 40);
  if (street || city) lines.push(`ADR;TYPE=WORK:;;${street};${city};Hatay;;TR`);
  const rawUrl = String(input.url || "").trim().replace(/[\r\n<>]/g, "");
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") lines.push(`URL:${parsed.toString()}`);
    } catch {
      /* geçersiz adres atlanır */
    }
  }
  lines.push("END:VCARD");
  return lines.join("\r\n");
}
