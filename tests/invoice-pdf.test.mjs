import assert from "node:assert/strict";
import test from "node:test";

import { buildInvoicePdf } from "../src/app/lib/contract-pdf.mjs";
import { resolvePaymentAmounts } from "../src/app/lib/payment-balance.ts";

test("ödeme PDF'i CEZA ×1.15 satırını içerir", () => {
  const resolved = resolvePaymentAmounts({
    amount: 1000,
    status: "unpaid",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    now: "2026-07-10",
  });
  assert.equal(resolved.penalty, 150);
  assert.equal(resolved.remaining, 1150);

  const pdf = buildInvoicePdf({
    companyName: "Deneme A.Ş.",
    contactName: "Ali",
    email: "ali@example.com",
    phone: "05321234567",
    period: resolved.period,
    startDate: resolved.startDate,
    endDate: resolved.endDate,
    statusLabel: "Gecikmis (CEZA %15)",
    amount: resolved.amount,
    paidAmount: resolved.paidAmount,
    unpaidBase: resolved.unpaidBase,
    penalty: resolved.penalty,
    remaining: resolved.remaining,
    overdue: resolved.overdue,
    daysOverdue: resolved.daysOverdue,
    note: "Test notu",
    issuedAt: "2026-07-10",
  });

  assert.ok(Buffer.isBuffer(pdf));
  assert.ok(pdf.length > 200);
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  const text = pdf.toString("latin1");
  assert.match(text, /CEZA %15/);
  assert.match(text, /1,15/);
  assert.match(text, /1\.150,00 TL/);
  assert.match(text, /150,00 TL/);
});

test("vadesi gelmemiş ödemede ceza satırı yok", () => {
  const resolved = resolvePaymentAmounts({
    amount: 800,
    status: "unpaid",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    now: "2026-08-20",
  });
  const pdf = buildInvoicePdf({
    companyName: "Firma",
    contactName: "Veli",
    period: resolved.period,
    startDate: resolved.startDate,
    endDate: resolved.endDate,
    statusLabel: "Odenmedi",
    amount: resolved.amount,
    paidAmount: resolved.paidAmount,
    unpaidBase: resolved.unpaidBase,
    penalty: resolved.penalty,
    remaining: resolved.remaining,
    overdue: resolved.overdue,
    daysOverdue: resolved.daysOverdue,
    issuedAt: "2026-08-20",
  });
  const text = pdf.toString("latin1");
  assert.match(text, /CEZA %15: yok/);
  assert.match(text, /800,00 TL/);
  assert.doesNotMatch(text, /odenmeyen x 1,15/);
});
