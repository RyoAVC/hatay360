import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RATE_WINDOW_MS = 15 * 60 * 1000;
export const SMTP_NOT_CONFIGURED = "smtp-not-configured";
export const OTP_SMTP_UNAVAILABLE_TR =
  "İki adımlı doğrulama şu an açılamıyor. E-posta gönderimi henüz bağlanmadı.";
export const OTP_DASHBOARD_REASON = "E-posta gönderimi henüz bağlanmadı.";
export const OTP_PURPOSES = ["login", "stepup"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export const CUSTOMER_OTP_SCHEMA = `
CREATE TABLE IF NOT EXISTS customer_otp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS customer_otp_customer_idx ON customer_otp(customer_id);
`;

type SqlStatement = {
  run: (...params: unknown[]) => { changes?: number };
  get: (...params: unknown[]) => Record<string, unknown> | undefined;
};

type SqlDb = {
  prepare: (sql: string) => SqlStatement;
};

export type RateLimitedFn = (req: unknown, key: string, limit: number, windowMs: number) => boolean;

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; error: string; locked?: boolean; rateLimited?: boolean };

function nowIsoDefault() {
  return new Date().toISOString();
}

export function isOtpPurpose(value: string): value is OtpPurpose {
  return OTP_PURPOSES.includes(value as OtpPurpose);
}

export function generateOtpCode() {
  const n = randomBytes(4).readUInt32BE(0) % 1_000_000;
  return String(n).padStart(6, "0");
}

export function hashOtp(customerId: number, purpose: string, code: string) {
  return createHash("sha256")
    .update(`otp|${Number(customerId)}|${purpose}|${String(code || "").trim()}`)
    .digest("hex");
}

function hashesMatch(leftHex: string, rightHex: string) {
  try {
    const left = Buffer.from(leftHex, "hex");
    const right = Buffer.from(rightHex, "hex");
    return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

/** SMTP henüz yok: gerçek e-posta gönderilmez. */
export function sendCustomerOtpEmail(_customer: unknown, _code: string) {
  return { ok: false as const, error: SMTP_NOT_CONFIGURED };
}

export function bindCustomerOtp({
  db,
  nowIso = nowIsoDefault,
  rateLimited = null,
}: {
  db: SqlDb;
  nowIso?: () => string;
  rateLimited?: RateLimitedFn | null;
}) {
  function createOtp(customerId: number, purpose: string) {
    if (!isOtpPurpose(purpose)) throw new Error("invalid-otp-purpose");
    const id = Number(customerId);
    const code = generateOtpCode();
    const createdAt = nowIso();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
    db.prepare("DELETE FROM customer_otp WHERE customer_id = ? AND purpose = ?").run(id, purpose);
    db.prepare(
      `INSERT INTO customer_otp (customer_id, purpose, code_hash, expires_at, attempts, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
    ).run(id, purpose, hashOtp(id, purpose, code), expiresAt, createdAt);
    return code;
  }

  function verifyOtp(customerId: number, purpose: string, code: string, req: unknown = null): VerifyOtpResult {
    if (!isOtpPurpose(purpose)) return { ok: false, error: "Geçersiz doğrulama amacı." };
    const id = Number(customerId);
    const otpKey = `otp-${id}`;
    if (req && rateLimited && rateLimited(req, otpKey, OTP_MAX_ATTEMPTS, OTP_RATE_WINDOW_MS)) {
      return {
        ok: false,
        error: "Çok fazla hatalı kod. Geçici kilit: 15 dakika sonra tekrar deneyin.",
        rateLimited: true,
        locked: true,
      };
    }
    const row = db
      .prepare(
        `SELECT id, code_hash, expires_at, attempts
         FROM customer_otp
         WHERE customer_id = ? AND purpose = ?
         ORDER BY id DESC LIMIT 1`,
      )
      .get(id, purpose) as
      | { id: number; code_hash: string; expires_at: string; attempts: number }
      | undefined;
    if (!row) return { ok: false, error: "Doğrulama kodu bulunamadı. Yeniden giriş yapın." };
    if (String(row.expires_at) <= nowIso()) {
      db.prepare("DELETE FROM customer_otp WHERE id = ?").run(row.id);
      return { ok: false, error: "Kodun süresi doldu. Yeniden giriş yapın." };
    }
    if (Number(row.attempts) >= OTP_MAX_ATTEMPTS) {
      if (req && rateLimited) rateLimited(req, otpKey, OTP_MAX_ATTEMPTS, OTP_RATE_WINDOW_MS);
      return {
        ok: false,
        error: "Çok fazla hatalı kod. Geçici kilit: 15 dakika sonra tekrar deneyin.",
        locked: true,
      };
    }
    const expected = String(row.code_hash || "");
    const actual = hashOtp(id, purpose, String(code || "").trim());
    if (!hashesMatch(expected, actual)) {
      const nextAttempts = Number(row.attempts) + 1;
      db.prepare("UPDATE customer_otp SET attempts = ? WHERE id = ?").run(nextAttempts, row.id);
      if (nextAttempts >= OTP_MAX_ATTEMPTS) {
        if (req && rateLimited) rateLimited(req, otpKey, OTP_MAX_ATTEMPTS, OTP_RATE_WINDOW_MS);
        return {
          ok: false,
          error: "Çok fazla hatalı kod. Geçici kilit: 15 dakika sonra tekrar deneyin.",
          locked: true,
        };
      }
      return { ok: false, error: "Kod hatalı." };
    }
    db.prepare("DELETE FROM customer_otp WHERE id = ?").run(row.id);
    return { ok: true };
  }

  return { createOtp, verifyOtp };
}
