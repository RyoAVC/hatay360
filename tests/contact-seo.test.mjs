import assert from "node:assert/strict";
import test from "node:test";

import { toTelHref, toWhatsAppHref, sanitizePhoneInput, isValidTrPhone, buildVCard } from "../src/app/lib/contact.ts";
import {
  DEFAULT_DISTRICTS,
  districtPath,
  districtSlug,
  findDistrictBySlug,
  napMatches,
  buildUtmUrl,
  buildLocalBusinessJsonLd,
  buildGoogleReviewUrl,
  buildMapsSearchUrl,
  buildMapsDirectionsUrl,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  buildReviewReplies,
  buildAppointmentReminder,
  buildClosedNotice,
  CONTACT_FAQS,
  PACKAGE_FAQS,
  SERVICE_FAQS,
  MAPS_FAQS,
  ABOUT_FAQS,
  FEATURE_FAQS,
  PRIVACY_FAQS,
  TERMS_FAQS,
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
  assert.equal(toWhatsAppHref("0544 444 44 44"), "https://wa.me/905444444444");
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

test("yeni yerel demolar vitrine eklenir", async () => {
  const { EXTRA_DEMOS } = await import("../src/app/lib/extra-demos.ts");
  for (const slug of ["eczane", "oto-yikama", "dugun-salonu", "firin", "cicekci", "dis-klinigi", "optik", "kahve", "lastikci", "pet-shop", "fotografci", "muhasebeci", "dershane", "oto-elektrik", "klima", "tesisatci", "otel", "zeytinyagi", "elektrikci", "kres", "camci", "insaat", "marangoz", "berber", "kombi", "kaporta", "kasap", "spor-salonu", "manav", "sigorta", "dugun-organizasyon", "zuccaciye", "hali-yikama", "kunefe", "mobilya", "ayakkabi"]) {
    assert.ok(EXTRA_DEMOS.some((demo) => demo.slug === slug), slug);
  }
});

test("NAP karşılaştırması Türkçe yazımı ve boşluğu yok sayar", () => {
  assert.equal(napMatches("Defne Eczanesi", "defne eczanesi"), true);
  assert.equal(napMatches("Atatürk Cad. No:10", "Ataturk Cad No 10"), true);
  assert.equal(napMatches("Defne Eczanesi", "Defne Eczane"), false);
});

test("UTM bağlantısı kaynak ve kampanyayı ekler", () => {
  const href = buildUtmUrl("hatay360.com/iletisim", "google", "cpc", "hatay-web");
  assert.equal(href, "https://hatay360.com/iletisim?utm_source=google&utm_medium=cpc&utm_campaign=hatay-web");
});

test("demo araması eczane kaydını bulur", async () => {
  const { filterExtraDemos, filterTools } = await import("../src/app/lib/extra-demos.ts");
  assert.equal(filterExtraDemos("eczane").some((demo) => demo.slug === "eczane"), true);
  assert.equal(filterExtraDemos("eczane", "shop").length, 0);
  assert.equal(filterTools([{ to: "/araclar/utm-link", title: "Reklam UTM Linki", desc: "kampanya" }], "utm").length, 1);
});

test("vCard işletme telefonunu uluslararası yazar", () => {
  const vcf = buildVCard({
    name: "Arsuz;Sahil",
    phone: "0326 123 45 67",
    email: "info@ornek.com",
    street: "Sahil Cad.",
    city: "Arsuz",
    url: "ornek-otel.com",
  });
  assert.match(vcf, /^BEGIN:VCARD/);
  assert.match(vcf, /FN:Arsuz\\;Sahil/);
  assert.match(vcf, /TEL;TYPE=CELL:\+903261234567/);
  assert.match(vcf, /URL:https:\/\/ornek-otel.com\//);
  assert.equal(vcf.includes("<"), false);
  assert.equal(buildVCard({ name: "", phone: "0555 000 00 00" }), "");
});

test("Google yorum bağlantısı Place ID ve URL’den üretilir", () => {
  assert.equal(
    buildGoogleReviewUrl("ChIJN1t_tDeuEmsRUsoyG83frY4"),
    "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
  );
  assert.equal(
    buildGoogleReviewUrl("https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4"),
    "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
  );
  assert.equal(buildGoogleReviewUrl(""), "");
});

test("harita arama ve yol tarifi bağlantısı üretir", () => {
  assert.equal(
    buildMapsSearchUrl("Defne Eczanesi"),
    "https://www.google.com/maps/search/?api=1&query=Defne%20Eczanesi",
  );
  assert.equal(buildMapsSearchUrl(""), "");
  assert.equal(buildMapsSearchUrl("<Defne Eczanesi>").includes("<"), false);
  assert.equal(
    buildMapsDirectionsUrl("Kıbrıs Caddesi No:13 Antakya"),
    "https://www.google.com/maps/dir/?api=1&destination=K%C4%B1br%C4%B1s%20Caddesi%20No%3A13%20Antakya",
  );
});

test("yerel işletme şeması tehlikeli karakterleri temizler", () => {
  const json = buildLocalBusinessJsonLd({
    name: "Defne <Eczane>",
    phone: "0326 123 45 67",
    address: "Atatürk Cad.",
    city: "Defne",
    url: "https://ornek.com",
    hours: "Mo-Sa 09:00-19:00",
  });
  assert.equal(json.includes("<"), false);
  assert.equal(JSON.parse(json)["@type"], "LocalBusiness");
  assert.equal(JSON.parse(json).name, "Defne Eczane");
});

test("çalışma saati şeması kapalı günü atlar", async () => {
  const { defaultDayHours, formatHours, buildOpeningHoursSchema } = await import("../src/app/lib/maps-signup.ts");
  const days = defaultDayHours();
  assert.match(formatHours(days), /Pazar Kapalı/);
  const schema = buildOpeningHoursSchema(days);
  assert.equal(schema.some((row) => row.startsWith("Su ")), false);
  assert.equal(schema.includes("Mo 09:00-18:00"), true);
  assert.equal(schema.includes("Sa 09:00-18:00"), true);
});

test("SSS şeması tehlikeli karakterleri temizler", () => {
  const data = buildFaqJsonLd([{ q: "Süre <kaç> gün?", a: "7–14 gün." }, ...CONTACT_FAQS.slice(0, 1)]);
  assert.equal(data["@type"], "FAQPage");
  assert.equal(JSON.stringify(data).includes("<"), false);
  assert.equal(data.mainEntity[0].name, "Süre kaç gün?");
});

test("yol izi şeması sıra ve temiz ad verir", () => {
  const data = buildBreadcrumbJsonLd("https://hatay360.com/", [
    { name: "Ana sayfa", path: "/" },
    { name: "Hatay ilçeleri", path: "/hatay" },
    { name: "Defne <ilçe>", path: "/hatay/defne" },
  ]);
  assert.equal(data["@type"], "BreadcrumbList");
  assert.equal(data.itemListElement[0].item, "https://hatay360.com/");
  assert.equal(data.itemListElement[2].name, "Defne ilçe");
  assert.equal(data.itemListElement[2].position, 3);
});

test("paket SSS bütçe maddesini içerir", () => {
  assert.equal(PACKAGE_FAQS.some((item) => item.q.includes("reklam bütçesi")), true);
  assert.equal(buildFaqJsonLd(PACKAGE_FAQS).mainEntity.length, 3);
});

test("hizmet SSS siteden reklam maddesini içerir", () => {
  assert.equal(SERVICE_FAQS.some((item) => item.q.includes("Google Ads")), true);
  assert.equal(buildFaqJsonLd(SERVICE_FAQS).mainEntity.length, 3);
});

test("harita SSS sahte yorum maddesini içerir", () => {
  assert.equal(MAPS_FAQS.some((item) => item.q.toLocaleLowerCase("tr-TR").includes("sahte")), true);
  assert.equal(buildFaqJsonLd(MAPS_FAQS).mainEntity.length, 3);
});

test("hakkımızda SSS Hatay360 ile AvcNova’yı ayırır", () => {
  assert.equal(ABOUT_FAQS.some((item) => item.a.includes("AvcNova")), true);
  assert.equal(buildFaqJsonLd(ABOUT_FAQS).mainEntity.length, 3);
});

test("özellikler SSS SSL’in pakete dahil olduğunu söyler", () => {
  assert.equal(FEATURE_FAQS.some((item) => item.q.includes("SSL")), true);
  assert.equal(buildFaqJsonLd(FEATURE_FAQS).mainEntity.length, 3);
});

test("gizlilik SSS kart bilgisinin tutulmadığını söyler", () => {
  assert.equal(PRIVACY_FAQS.some((item) => item.q.toLocaleLowerCase("tr-TR").includes("kart")), true);
  assert.equal(buildFaqJsonLd(PRIVACY_FAQS).mainEntity.length, 3);
});

test("koşullar SSS demoların kopyalanamayacağını söyler", () => {
  assert.equal(TERMS_FAQS.some((item) => item.a.includes("Avcı E-Ticaret")), true);
  assert.equal(buildFaqJsonLd(TERMS_FAQS).mainEntity.length, 3);
});

test("yorum cevap şablonu puanı sınırlar ve tehlikeli karakteri temizler", () => {
  const high = buildReviewReplies({ brand: "Defne <Cafe>", customer: "Ali", stars: 9, topic: "kahve" });
  assert.equal(high.length, 2);
  assert.equal(JSON.stringify(high).includes("<"), false);
  assert.match(high[0], /Defne Cafe/);
  const low = buildReviewReplies({ brand: "X", customer: "", stars: 1 });
  assert.match(low[0], /üzgünüz/);
});

test("randevu hatırlatması tehlikeli karakteri temizler", () => {
  const texts = buildAppointmentReminder({ brand: "Defne <Dental>", customer: "Ali", when: "yarın 14:00", service: "kontrol" });
  assert.equal(JSON.stringify(texts).includes("<"), false);
  assert.match(texts.whatsapp, /Defne Dental/);
  assert.match(texts.sms, /yarın 14:00/);
});

test("kapalıyız notu tehlikeli karakteri temizler", () => {
  const texts = buildClosedNotice({ brand: "Defne <Cafe>", from: "1 Eylül", to: "3 Eylül", reason: "bayram" });
  assert.equal(JSON.stringify(texts).includes("<"), false);
  assert.match(texts.whatsapp, /Defne Cafe/);
  assert.match(texts.maps, /kapalı/);
});

test("Google kategori önerisi işletme adından sektör çıkarır", async () => {
  const { suggestGbpCategories } = await import("../src/app/lib/maps-signup.ts");
  assert.deepEqual(suggestGbpCategories("ab"), []);
  const dental = suggestGbpCategories("Defne Dental <Klinik>");
  assert.equal(dental.includes("Diş kliniği"), true);
  assert.equal(JSON.stringify(dental).includes("<"), false);
  assert.equal(suggestGbpCategories("Antakya Traş").includes("Berber"), true);
  assert.equal(suggestGbpCategories("Antakya Kasap").includes("Kasap"), true);
  assert.equal(suggestGbpCategories("Defne Fitness").includes("Spor salonu"), true);
  assert.equal(suggestGbpCategories("Antakya Manav").includes("Manav"), true);
  assert.equal(suggestGbpCategories("Defne DASK").includes("Sigorta acentesi"), true);
  assert.equal(suggestGbpCategories("Antakya Organizasyon").includes("Düğün organizasyonu"), true);
  assert.equal(suggestGbpCategories("Antakya Züccaciye").includes("Züccaciye"), true);
  assert.equal(suggestGbpCategories("Defne porselen").includes("Züccaciye"), true);
  assert.equal(suggestGbpCategories("Antakya Halı Yıkama").includes("Halı yıkama"), true);
  assert.equal(suggestGbpCategories("Defne kilim").includes("Halı yıkama"), true);
  assert.equal(suggestGbpCategories("Antakya Künefe").includes("Tatlıcı"), true);
  assert.equal(suggestGbpCategories("Antakya koltuk").includes("Mobilya mağazası"), true);
  assert.equal(suggestGbpCategories("Antakya Ayakkabı").includes("Ayakkabı mağazası"), true);
});

test("Google işletme açıklaması bölge ve kategoriyi kullanır", async () => {
  const { buildGbpDescription } = await import("../src/app/lib/maps-signup.ts");
  const text = buildGbpDescription({ name: "Defne <Dental>", sector: "Diş kliniği", district: "Defne" });
  assert.equal(text.includes("<"), false);
  assert.match(text, /Defne Dental/);
  assert.match(text, /Diş kliniği/);
  assert.equal(buildGbpDescription({ name: "", sector: "Kafe", district: "Antakya" }), "");
});
