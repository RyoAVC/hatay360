import assert from "node:assert/strict";
import test from "node:test";

import { toTelHref, toWhatsAppHref, sanitizePhoneInput, isValidTrPhone } from "../src/app/lib/contact.ts";
import {
  DEFAULT_DISTRICTS,
  districtPath,
  districtSlug,
  findDistrictBySlug,
  resolveDistricts,
} from "../src/app/lib/seo.ts";

test("telefon numarası arama bağlantısına dönüştürülür", () => {
  assert.equal(toTelHref("+90 (850) 888 00 00"), "tel:+908508880000");
});

test("telefon alanına harf ve fazla rakam yazılamaz", () => {
  assert.equal(sanitizePhoneInput("054444444444444444"), "0544 444 44 44");
  assert.equal(sanitizePhoneInput("0544abcxyz99"), "0544 99");
  assert.equal(sanitizePhoneInput("merhaba"), "");
  assert.equal(isValidTrPhone("0544 444 44 44"), true);
  assert.equal(isValidTrPhone("0544"), false);
  assert.equal(isValidTrPhone("abc"), false);
});

test("WhatsApp bağlantısı Türkçe mesajı güvenli biçimde kodlar", () => {
  const href = toWhatsAppHref("+90 850 888 00 00", "Merhaba, teklif almak istiyorum.");
  assert.equal(
    href,
    "https://wa.me/908508880000?text=Merhaba%2C%20teklif%20almak%20istiyorum.",
  );
});

test("Türkçe ilçe adları kararlı adreslere dönüşür", () => {
  assert.equal(districtSlug("İskenderun"), "iskenderun");
  assert.equal(districtSlug("Altınözü"), "altinozu");
  assert.equal(districtSlug("Yayladağı"), "yayladagi");
  assert.equal(districtPath("Dörtyol"), "/hatay/dortyol");
});

test("ilçe adresinden doğru kayıt bulunur", () => {
  assert.equal(findDistrictBySlug(DEFAULT_DISTRICTS, "kirikhan")?.name, "Kırıkhan");
  assert.equal(findDistrictBySlug(DEFAULT_DISTRICTS, "olmayan"), undefined);
});

test("boş ilçe listesi resmi Hatay ilçelerine geri döner", () => {
  assert.equal(resolveDistricts([]).length, 15);
  assert.equal(resolveDistricts(null), DEFAULT_DISTRICTS);
});
