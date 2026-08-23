import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import {
  bindCustomerOtp,
  CUSTOMER_OTP_SCHEMA,
  generateOtpCode,
  hashOtp,
  OTP_MAX_ATTEMPTS,
  sendCustomerOtpEmail,
  SMTP_NOT_CONFIGURED,
} from "../src/app/lib/customer-otp.ts";

function memoryDb() {
  const db = new DatabaseSync(":memory:");
  db.exec(CUSTOMER_OTP_SCHEMA);
  return db;
}

test("OTP 6 haneli üretilir, düz metin saklanmaz", () => {
  const db = memoryDb();
  const { createOtp } = bindCustomerOtp({ db });
  const code = createOtp(7, "login");
  assert.match(code, /^\d{6}$/);
  const row = db.prepare("SELECT code_hash, attempts FROM customer_otp WHERE customer_id = 7").get();
  assert.ok(row);
  assert.equal(row.code_hash, hashOtp(7, "login", code));
  assert.notEqual(row.code_hash, code);
  assert.equal(Number(row.attempts), 0);
  db.close();
});

test("doğru kod tek kullanımlıktır", () => {
  const db = memoryDb();
  const { createOtp, verifyOtp } = bindCustomerOtp({ db });
  const code = createOtp(3, "stepup");
  assert.deepEqual(verifyOtp(3, "stepup", code), { ok: true });
  const again = verifyOtp(3, "stepup", code);
  assert.equal(again.ok, false);
  db.close();
});

test("5 hatalı denemeden sonra OTP kilitlenir", () => {
  const db = memoryDb();
  const rateCalls = [];
  const { createOtp, verifyOtp } = bindCustomerOtp({
    db,
    rateLimited: (req, key, limit, windowMs) => {
      rateCalls.push({ req, key, limit, windowMs });
      return false;
    },
  });
  const code = createOtp(11, "login");
  assert.match(code, /^\d{6}$/);
  const fakeReq = { ip: "test" };
  for (let i = 0; i < OTP_MAX_ATTEMPTS - 1; i += 1) {
    const result = verifyOtp(11, "login", "000000", fakeReq);
    assert.equal(result.ok, false);
    assert.equal("locked" in result && result.locked, false);
    assert.equal(result.error, "Kod hatalı.");
  }
  const locked = verifyOtp(11, "login", "000000", fakeReq);
  assert.equal(locked.ok, false);
  assert.equal(locked.locked, true);
  assert.match(locked.error, /geçici kilit/i);
  const stillLocked = verifyOtp(11, "login", code, fakeReq);
  assert.equal(stillLocked.ok, false);
  assert.equal(stillLocked.locked, true);
  assert.ok(rateCalls.some((call) => call.key === "otp-11" && call.limit === 5));
  const row = db.prepare("SELECT attempts FROM customer_otp WHERE customer_id = 11").get();
  assert.equal(Number(row.attempts), OTP_MAX_ATTEMPTS);
  db.close();
});

test("sendCustomerOtpEmail SMTP yokken gönderim yapmaz", () => {
  const result = sendCustomerOtpEmail({ email: "musteri@example.com" }, "123456");
  assert.deepEqual(result, { ok: false, error: SMTP_NOT_CONFIGURED });
});

test("generateOtpCode her zaman 6 rakam", () => {
  for (let i = 0; i < 20; i += 1) {
    assert.match(generateOtpCode(), /^\d{6}$/);
  }
});
