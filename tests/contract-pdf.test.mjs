import assert from "node:assert/strict";
import test from "node:test";

import { readFileSync } from "node:fs";
import { buildAutomaticContractPdf, buildContractPdf } from "../src/app/lib/contract-pdf.mjs";

test("sözleşme PDF'i imza ve onay damgası içerir", () => {
  const pdf = buildContractPdf({
    title: "Hizmet sozlesmesi",
    body: "<p>Hatay360 dijital hizmet kosullari.</p>",
    companyName: "Deneme A.S.",
    contactName: "Ali Veli",
    signedAt: "2026-08-20T12:00:00.000Z",
    approvedAt: "2026-08-21T09:30:00.000Z",
    statusLabel: "Hatay360 onaylandi",
    sigBox: { x: 12, y: 82, w: 38, h: 12 },
  });

  assert.ok(Buffer.isBuffer(pdf));
  assert.ok(pdf.length > 200);
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  const text = pdf.toString("latin1");
  assert.match(text, /Imza tarihi: 2026-08-20/);
  assert.match(text, /Hatay360 onay: 2026-08-21/);
  assert.match(text, /Hatay360 onaylandi/);
  assert.match(text, /Imza \+ onay/);
});

test("imzasız şablon PDF'inde imza alanı etiketi kalır", () => {
  const pdf = buildContractPdf({
    title: "Taslak",
    body: "Metin",
    companyName: "Firma",
    contactName: "Yetkili",
  });
  const text = pdf.toString("latin1");
  assert.match(text, /Imza alani/);
  assert.doesNotMatch(text, /Imza tarihi/);
  assert.doesNotMatch(text, /Hatay360 onay:/);
});

test("otomatik sözleşme PNG logo ve Unicode fontla üretilir", async () => {
  const pdf = await buildAutomaticContractPdf({
    title: "Hatay360 Hizmet ve Abonelik Sözleşmesi",
    body: "<h2>MADDE 1 – TARAFLAR</h2><p>Müşteri: Örnek Şirket A.Ş.<br>Bedel: 120.000,00 ₺</p>",
    logoPng: readFileSync(new URL("../public/brands/hatay360.png", import.meta.url)),
  });

  assert.ok(Buffer.isBuffer(pdf));
  assert.ok(pdf.length > 20_000);
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.match(pdf.toString("latin1"), /DejaVuSans/);
  assert.match(pdf.toString("latin1"), /\/Subtype \/Image/);
});
