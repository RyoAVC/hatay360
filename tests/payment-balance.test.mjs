import assert from "node:assert/strict";
import test from "node:test";

import { applyLateFee, LATE_FEE_RATE, paymentInvoiceFileName, resolvePaymentAmounts, roundMoney, summarizePayments } from "../src/app/lib/payment-balance.ts";

test("ödeme PDF adı vadesi geçmişte ceza soneki alır", () => {
  assert.equal(paymentInvoiceFileName("2026-08", false, 12), "hatay360-odeme-2026-08.pdf");
  assert.equal(paymentInvoiceFileName("2026-08", true, 12), "hatay360-odeme-2026-08-ceza.pdf");
  assert.equal(paymentInvoiceFileName("", true, 9), "hatay360-odeme-9-ceza.pdf");
});

test("admin ödendi işaretlemeden tutar ödenmiş sayılmaz", () => {
  const open = resolvePaymentAmounts({ amount: 1500, paidAmount: 1500 });
  assert.equal(open.status, "unpaid");
  assert.equal(open.paidAmount, 0);
  assert.equal(open.remaining, 1500);

  const markedUnpaid = resolvePaymentAmounts({ amount: 1500, paidAmount: 1500, status: "unpaid" });
  assert.equal(markedUnpaid.status, "unpaid");
  assert.equal(markedUnpaid.paidAmount, 0);
  assert.equal(markedUnpaid.remaining, 1500);

  const markedPaid = resolvePaymentAmounts({ amount: 1500, paidAmount: 0, status: "paid" });
  assert.equal(markedPaid.status, "paid");
  assert.equal(markedPaid.paidAmount, 1500);
  assert.equal(markedPaid.remaining, 0);
});

test("kısmi ödeme kalan bakiyeyi tutar", () => {
  const partial = resolvePaymentAmounts({ amount: 2000, paidAmount: 750, status: "remaining" });
  assert.equal(partial.status, "remaining");
  assert.equal(partial.paidAmount, 750);
  assert.equal(partial.remaining, 1250);
});

test("dönem içinde kalan = ödenmeyen, vade geçince kalan = ödenmeyen × 1.15 kuruş", () => {
  const inPeriod = resolvePaymentAmounts({
    amount: 1000,
    status: "unpaid",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    now: "2026-08-20",
  });
  assert.equal(inPeriod.overdue, false);
  assert.equal(inPeriod.unpaidBase, 1000);
  assert.equal(inPeriod.remaining, 1000);
  assert.equal(inPeriod.penalty, 0);
  assert.equal(inPeriod.daysLeft, 11);
  assert.equal(inPeriod.daysOverdue, 0);

  const overdueUnpaid = resolvePaymentAmounts({
    amount: 1000,
    status: "unpaid",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    now: "2026-07-10",
  });
  assert.equal(LATE_FEE_RATE, 0.15);
  assert.equal(overdueUnpaid.unpaidBase, 1000);
  assert.equal(overdueUnpaid.penalty, 150);
  assert.equal(overdueUnpaid.remaining, 1150);
  assert.equal(overdueUnpaid.daysOverdue, 10);
  assert.equal(overdueUnpaid.daysLeft, 0);

  const kurus = resolvePaymentAmounts({
    amount: 333.33,
    status: "unpaid",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    now: "2026-02-01",
  });
  assert.equal(kurus.unpaidBase, 333.33);
  assert.equal(kurus.remaining, roundMoney(333.33 * 1.15));
  assert.equal(kurus.remaining, 383.33);
  assert.equal(kurus.penalty, 50);

  const fee = applyLateFee(99.99, true);
  assert.equal(fee.remaining, 114.99);
  assert.equal(fee.penalty, 15);
});

test("aylık ödemelerde ödenen, ödenmeyen ve kalan toplamı doğru", () => {
  const summary = summarizePayments([
    { amount: 1000, status: "paid", startDate: "2026-06-01", endDate: "2026-06-30", now: "2026-08-20" },
    { amount: 1000, status: "unpaid", startDate: "2026-08-01", endDate: "2026-08-31", now: "2026-08-20" },
    { amount: 1000, paidAmount: 400, status: "remaining", startDate: "2026-08-01", endDate: "2026-08-31", now: "2026-08-20" },
  ]);
  assert.equal(summary.total, 3000);
  assert.equal(summary.paid, 1400);
  assert.equal(summary.unpaid, 1600);
  assert.equal(summary.remaining, 1600);
  assert.equal(summary.penalty, 0);
  assert.equal(summary.overdueCount, 0);
});

test("vadesi geçmiş kalan tutara yüzde 15 ceza bir kez eklenir", () => {
  const overdueUnpaid = resolvePaymentAmounts({
    amount: 1000,
    status: "unpaid",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    now: "2026-07-10",
  });
  assert.equal(overdueUnpaid.remaining, 1150);
  const again = applyLateFee(overdueUnpaid.unpaidBase, true);
  assert.equal(again.remaining, 1150);

  const summaryOverdue = summarizePayments([
    { amount: 1000, status: "unpaid", startDate: "2026-06-01", endDate: "2026-06-30", now: "2026-07-10" },
    { amount: 500, status: "paid", startDate: "2026-05-01", endDate: "2026-05-31", now: "2026-07-10" },
  ]);
  assert.equal(summaryOverdue.overdueCount, 1);
  assert.equal(summaryOverdue.penalty, 150);
  assert.equal(summaryOverdue.remaining, 1150);

  const stillOpen = resolvePaymentAmounts({
    amount: 1000,
    status: "unpaid",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    now: "2026-08-20",
  });
  assert.equal(stillOpen.penalty, 0);
  assert.equal(stillOpen.remaining, 1000);
  assert.equal(stillOpen.daysLeft, 11);

  const partialOverdue = resolvePaymentAmounts({
    amount: 2000,
    paidAmount: 500,
    status: "remaining",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    now: "2026-06-05",
  });
  assert.equal(partialOverdue.unpaidBase, 1500);
  assert.equal(partialOverdue.remaining, 1725);

  const paidNoFee = resolvePaymentAmounts({
    amount: 1000,
    status: "paid",
    endDate: "2026-01-01",
    now: "2026-08-20",
  });
  assert.equal(paidNoFee.penalty, 0);
  assert.equal(paidNoFee.remaining, 0);
});
