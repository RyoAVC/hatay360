/**
 * Firma paneli — "Bu PC'ye güven" yerel deposu.
 * Şifre tarayıcıda saklanır; bu kasıtlı olarak risklidir ve güvenlik sağlamaz.
 */

export const PARTNER_TRUST_STORAGE_KEY = "hatay360_partner_trusted_device_v1";

export type PartnerTrustedDevice = {
  email: string;
  /** Kasitli olarak zayıf ofuskasyon — gerçek sifreleme degil */
  secret: string;
  ip: string;
  userAgentHint: string;
  trustedAt: string;
  acceptedRiskAt: string;
};

const RISK_DISCLAIMER =
  "Bu PC’ye güven / beni hatırla özelliği şifrenizi bu cihazda saklar ve oturumu uzatır. Ortak bilgisayar, kayıp/çalıntı cihaz veya zararlı yazılım riski vardır. Hatay360 / Avcı E-Ticaret bu tercihten doğan yetkisiz erişim, veri kaybı veya zarardan sorumlu değildir; risk tamamen size aittir.";

export function partnerTrustRiskDisclaimer(): string {
  return RISK_DISCLAIMER;
}

function deviceKey(): string {
  if (typeof navigator === "undefined") return "hatay360-partner";
  return `h360|${navigator.userAgent.slice(0, 80)}|partner`;
}

function obfuscateSecret(text: string, key: string): string {
  const bytes = new TextEncoder().encode(text);
  const keyBytes = new TextEncoder().encode(key || "hatay360");
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) {
    out[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
  }
  let bin = "";
  for (let i = 0; i < out.length; i += 1) bin += String.fromCharCode(out[i]);
  return btoa(bin);
}

function deobfuscateSecret(encoded: string, key: string): string {
  try {
    const bin = atob(encoded);
    const out = new Uint8Array(bin.length);
    const keyBytes = new TextEncoder().encode(key || "hatay360");
    for (let i = 0; i < bin.length; i += 1) {
      out[i] = bin.charCodeAt(i) ^ keyBytes[i % keyBytes.length];
    }
    return new TextDecoder().decode(out);
  } catch {
    return "";
  }
}

export function readPartnerTrustedDevice(): PartnerTrustedDevice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PARTNER_TRUST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PartnerTrustedDevice>;
    if (!parsed.email || !parsed.secret || !parsed.acceptedRiskAt) return null;
    return {
      email: String(parsed.email).toLowerCase().slice(0, 160),
      secret: String(parsed.secret),
      ip: typeof parsed.ip === "string" ? parsed.ip.slice(0, 80) : "",
      userAgentHint: typeof parsed.userAgentHint === "string" ? parsed.userAgentHint.slice(0, 120) : "",
      trustedAt: typeof parsed.trustedAt === "string" ? parsed.trustedAt : "",
      acceptedRiskAt: String(parsed.acceptedRiskAt),
    };
  } catch {
    return null;
  }
}

export function savePartnerTrustedDevice(input: {
  email: string;
  password: string;
  ip?: string;
}): PartnerTrustedDevice {
  const now = new Date().toISOString();
  const record: PartnerTrustedDevice = {
    email: input.email.trim().toLowerCase().slice(0, 160),
    secret: obfuscateSecret(input.password, deviceKey()),
    ip: (input.ip || "").slice(0, 80),
    userAgentHint: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "",
    trustedAt: now,
    acceptedRiskAt: now,
  };
  window.localStorage.setItem(PARTNER_TRUST_STORAGE_KEY, JSON.stringify(record));
  return record;
}

export function clearPartnerTrustedDevice(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PARTNER_TRUST_STORAGE_KEY);
}

export function revealPartnerTrustedPassword(device: PartnerTrustedDevice): string {
  return deobfuscateSecret(device.secret, deviceKey());
}

export function updatePartnerTrustedIp(ip: string): void {
  const current = readPartnerTrustedDevice();
  if (!current) return;
  const next = { ...current, ip: ip.slice(0, 80) };
  window.localStorage.setItem(PARTNER_TRUST_STORAGE_KEY, JSON.stringify(next));
}
