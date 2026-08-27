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

export const NATIONAL_ID_ERROR = "TC kimlik numarasını 11 haneli rakam olarak yazın.";

export function nationalIdDigits(value: string) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
}

/** Türkiye Cumhuriyeti kimlik numarası doğrulama (11 hane + algoritma). */
export function isValidNationalId(value: string) {
  const digits = nationalIdDigits(value);
  if (digits.length !== 11 || digits[0] === "0") return false;
  const nums = digits.split("").map(Number);
  const odd = nums[0] + nums[2] + nums[4] + nums[6] + nums[8];
  const even = nums[1] + nums[3] + nums[5] + nums[7];
  const tenth = ((odd * 7 - even) % 10 + 10) % 10;
  const eleventh = (nums.slice(0, 10).reduce((sum, n) => sum + n, 0) % 10);
  return tenth === nums[9] && eleventh === nums[10];
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

/** Admin / iletişim varsayılan mesai (Europe/Istanbul). */
export const DEFAULT_SUPPORT_WEEKDAY_HOURS = "09:00–18:00";
export const DEFAULT_SUPPORT_SATURDAY_HOURS = "10:00–14:00";

/** "09:00–18:00" veya "09:00-18:00" → dakika aralığı. */
export function parseHourRangeMinutes(value: string) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})\s*[–\-]\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const openHour = Number(match[1]);
  const openMin = Number(match[2]);
  const closeHour = Number(match[3]);
  const closeMin = Number(match[4]);
  if ([openHour, openMin, closeHour, closeMin].some((n) => !Number.isFinite(n))) return null;
  if (openHour > 23 || closeHour > 23 || openMin > 59 || closeMin > 59) return null;
  const open = openHour * 60 + openMin;
  const close = closeHour * 60 + closeMin;
  if (open >= close) return null;
  return { open, close };
}

/** Geçerli aralığı normalize eder; boş Cumartesi = kapalı. */
export function normalizeSupportHours(value: string, fallback: string, allowEmpty = false) {
  const raw = String(value || "").trim().slice(0, 32);
  if (!raw) return allowEmpty ? "" : fallback;
  const parsed = parseHourRangeMinutes(raw.replace(/-/g, "–"));
  if (!parsed) return allowEmpty && !raw ? "" : fallback;
  const fmt = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  return `${fmt(parsed.open)}–${fmt(parsed.close)}`;
}

function istanbulClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const map = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  const hour = Number(map.hour === "24" ? "0" : map.hour);
  const minute = Number(map.minute);
  return {
    weekday: map.weekday || "",
    minutes: hour * 60 + minute,
  };
}

const ISTANBUL_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const ISTANBUL_DAY_TR: Record<(typeof ISTANBUL_DAYS)[number], string> = {
  Sun: "Pazar",
  Mon: "Pazartesi",
  Tue: "Salı",
  Wed: "Çarşamba",
  Thu: "Perşembe",
  Fri: "Cuma",
  Sat: "Cumartesi",
};

function formatClockMinutes(mins: number) {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

function supportRangeForDay(day: string, weekdayHours: string, saturdayHours: string) {
  if (day === "Sun") return null;
  if (day === "Sat") return parseHourRangeMinutes(saturdayHours);
  return parseHourRangeMinutes(weekdayHours || DEFAULT_SUPPORT_WEEKDAY_HOURS);
}

/** Mesai şu an açık mı? Pazar kapalı; Cumartesi satırı boşsa Cumartesi kapalı. */
export function isSupportOpenNow(weekdayHours: string, saturdayHours: string, now = new Date()) {
  const { weekday, minutes } = istanbulClock(now);
  const range = supportRangeForDay(weekday, weekdayHours, saturdayHours);
  if (!range) return false;
  return minutes >= range.open && minutes < range.close;
}

/**
 * Açıkken kapanış, kapalıyken sonraki açılış (Europe/Istanbul).
 * Örn. "Bugün 18:00'da kapanır" / "Pazartesi 09:00'da açılır"
 */
export function nextSupportChange(weekdayHours: string, saturdayHours: string, now = new Date()) {
  const { weekday, minutes } = istanbulClock(now);
  const dayIndex = ISTANBUL_DAYS.indexOf(weekday as (typeof ISTANBUL_DAYS)[number]);
  if (dayIndex < 0) return { kind: "unknown" as const, label: "" };

  const todayRange = supportRangeForDay(weekday, weekdayHours, saturdayHours);
  if (todayRange && minutes >= todayRange.open && minutes < todayRange.close) {
    return { kind: "closes" as const, label: `Bugün ${formatClockMinutes(todayRange.close)}'da kapanır` };
  }
  if (todayRange && minutes < todayRange.open) {
    return { kind: "opens" as const, label: `Bugün ${formatClockMinutes(todayRange.open)}'da açılır` };
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const day = ISTANBUL_DAYS[(dayIndex + offset) % 7];
    const range = supportRangeForDay(day, weekdayHours, saturdayHours);
    if (!range) continue;
    const when = offset === 1 ? "Yarın" : ISTANBUL_DAY_TR[day];
    return { kind: "opens" as const, label: `${when} ${formatClockMinutes(range.open)}'da açılır` };
  }
  return { kind: "unknown" as const, label: "" };
}

export function supportHoursCopy(weekdayHours: string, saturdayHours: string) {
  const weekday = weekdayHours || DEFAULT_SUPPORT_WEEKDAY_HOURS;
  const saturday = saturdayHours;
  return {
    weekdayLine: `Hafta içi ${weekday}`,
    weekendLine: saturday ? `Cumartesi ${saturday} · Pazar kapalı` : "Cumartesi ve Pazar kapalı",
    phoneHint: `Hafta içi ${weekday}`,
  };
}

/** Müşteri ticket / destek paneli için kısa mesai durumu. */
export function supportDeskStatus(weekdayHours: string, saturdayHours: string, now = new Date()) {
  const open = isSupportOpenNow(weekdayHours, saturdayHours, now);
  const copy = supportHoursCopy(weekdayHours, saturdayHours);
  const next = nextSupportChange(weekdayHours, saturdayHours, now);
  if (open) {
    return {
      open: true as const,
      badge: "Mesai açık",
      nextLabel: next.label,
      detail: next.label
        ? `Ticket kuyruğa girer; yanıt mesai içinde sırayla gelir. ${next.label}.`
        : "Ticket kuyruğa girer; yanıt mesai içinde sırayla gelir.",
    };
  }
  return {
    open: false as const,
    badge: "Mesai dışı",
    nextLabel: next.label,
    detail: next.label
      ? `Ticket yine de kaydedilir. ${next.label}; yanıt mesai içinde sırayla gelir.`
      : `Ticket yine de kaydedilir. Yanıt ${copy.weekdayLine.toLowerCase()} beklenir.`,
  };
}

/** Ticket gönderildikten sonra kuyruk kartı — SLA yok, yalnızca mesai. */
export function ticketQueueConfirmCopy(weekdayHours: string, saturdayHours: string, now = new Date()) {
  const desk = supportDeskStatus(weekdayHours, saturdayHours, now);
  const hours = supportHoursCopy(weekdayHours, saturdayHours);
  const next = desk.nextLabel ? ` · ${desk.nextLabel}` : "";
  return `Destek ekibi mesai saatine göre sırayla bakar. ${hours.weekdayLine}${next}.`;
}

/** schema.org openingHours satırları. */
export function supportOpeningHoursSchema(weekdayHours: string, saturdayHours: string) {
  const toSchema = (value: string) => String(value).replace(/–/g, "-").replace(/\s/g, "");
  const lines = [`Mo-Fr ${toSchema(weekdayHours || DEFAULT_SUPPORT_WEEKDAY_HOURS)}`];
  if (saturdayHours) lines.push(`Sa ${toSchema(saturdayHours)}`);
  return lines;
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
