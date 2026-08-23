import assert from "node:assert/strict";
import test from "node:test";

import { toTelHref, toWhatsAppHref, sanitizePhoneInput, isValidTrPhone, buildVCard, parseHourRangeMinutes, isSupportOpenNow, nextSupportChange, supportHoursCopy, supportDeskStatus, ticketQueueConfirmCopy, supportOpeningHoursSchema, normalizeSupportHours } from "../src/app/lib/contact.ts";
import {
  DEFAULT_DISTRICTS,
  districtPath,
  districtSlug,
  findDistrictBySlug,
  napMatches,
  buildNapCheckReport,
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
  buildAdsRsaTexts,
  buildOpenGraphTags,
  ADS_RSA_HEADLINE_MAX,
  ADS_RSA_DESCRIPTION_MAX,
  OG_TITLE_MAX,
  OG_DESCRIPTION_MAX,
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
  for (const slug of ["eczane", "oto-yikama", "dugun-salonu", "firin", "cicekci", "dis-klinigi", "optik", "kahve", "lastikci", "pet-shop", "fotografci", "muhasebeci", "dershane", "oto-elektrik", "klima", "tesisatci", "otel", "zeytinyagi", "elektrikci", "kres", "camci", "insaat", "marangoz", "berber", "kombi", "kaporta", "kasap", "spor-salonu", "manav", "sigorta", "dugun-organizasyon", "zuccaciye", "hali-yikama", "kunefe", "mobilya", "ayakkabi", "pvc-dograma", "sucuk"]) {
    assert.ok(EXTRA_DEMOS.some((demo) => demo.slug === slug), slug);
  }
});

test("NAP karşılaştırması Türkçe yazımı ve boşluğu yok sayar", () => {
  assert.equal(napMatches("Defne Eczanesi", "defne eczanesi"), true);
  assert.equal(napMatches("Atatürk Cad. No:10", "Ataturk Cad No 10"), true);
  assert.equal(napMatches("Defne Eczanesi", "Defne Eczane"), false);
});

test("NAP özet metni uyum ve fark satırlarını içerir", () => {
  const report = buildNapCheckReport({
    googleName: "Defne Eczanesi",
    googlePhone: "0326 123 45 67",
    googleAddress: "Atatürk Cad. No:10 Defne",
    siteName: "Defne Eczanesi",
    sitePhone: "0326 123 45 67",
    siteAddress: "Ataturk Caddesi No 10 Defne",
    cardName: "Defne Eczane",
    cardPhone: "03261234567",
    cardAddress: "Atatürk Cad. 10 Defne/Hatay",
    nameOk: false,
    phoneOk: true,
    addressOk: true,
  });
  assert.match(report, /FARK · İşletme adı/);
  assert.match(report, /UYUMLU · Telefon/);
  assert.match(report, /Kartvizit \/ tabela/);
  assert.match(report, /Defne Eczane/);
});

test("portal NAP uyarı sayısı harita ile site farklarını sayar", async () => {
  const { countPortalNapIssues } = await import("../src/app/lib/seo.ts");
  assert.equal(countPortalNapIssues({ maps: [] }), 0);
  assert.equal(
    countPortalNapIssues({
      maps: [{ businessName: "Defne Eczanesi", phone: "0850 308 68 37", address: "Kıbrıs Cad. No:13" }],
      companyName: "Defne Eczanesi",
      companyPhone: "0850 308 68 37",
      websitePhone: "0850 308 68 37",
      websiteAddress: "Kıbrıs Cad. No:13",
    }),
    0,
  );
  assert.equal(
    countPortalNapIssues({
      maps: [{ businessName: "Defne Eczanesi", phone: "0850 308 68 37", address: "Kıbrıs Cad." }],
      companyName: "Başka Eczane",
      websitePhone: "0326 000 00 00",
      websiteAddress: "",
    }),
    2,
  );
  assert.equal(
    countPortalNapIssues({
      maps: [{ businessName: "A Firması", phone: "0850 308 68 37", address: "Antakya" }],
      companyName: "A Firması",
      websitePhone: "0850 308 68 37",
      websiteAddress: "Defne",
    }),
    1,
  );
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

test("araç kategorisi filtresi kategori ve metni birlikte süzer", async () => {
  const { filterToolsByCategory, parseToolCategory, TOOL_CATEGORIES } = await import("../src/app/lib/extra-demos.ts");
  const sample = [
    { to: "/araclar/utm-link", title: "Reklam UTM Linki", desc: "kampanya", category: "seo" },
    { to: "/araclar/harita-linki", title: "Harita ve Yol Tarifi", desc: "yol tarifi", category: "harita" },
    { to: "/araclar/schema", title: "Yerel İşletme Şeması", desc: "JSON kodu", category: "seo" },
    { to: "/araclar/ozel-ihtiyac-hesaplayici", title: "Özel İhtiyaç Hesaplayıcı", desc: "paket", category: "hesap" },
  ];
  assert.equal(filterToolsByCategory(sample, "", "all").length, 4);
  assert.equal(filterToolsByCategory(sample, "", "seo").length, 2);
  assert.equal(filterToolsByCategory(sample, "", "hesap")[0].to, "/araclar/ozel-ihtiyac-hesaplayici");
  assert.equal(filterToolsByCategory(sample, "harita", "seo").length, 0);
  assert.equal(filterToolsByCategory(sample, "yol", "all").length, 1);
  assert.equal(parseToolCategory("seo"), "seo");
  assert.equal(parseToolCategory("metin"), "metin");
  assert.equal(parseToolCategory("?"), "all");
  assert.equal(parseToolCategory(null), "all");
  assert.deepEqual(TOOL_CATEGORIES.map((c) => c.id), ["seo", "harita", "metin", "hesap"]);
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

test("Google Ads RSA metni karakter limitine uyar ve tehlikeli karakteri temizler", () => {
  const result = buildAdsRsaTexts({
    brand: "Defne <Dental>",
    service: "diş kliniği",
    district: "Defne",
    offer: "Aynı gün randevu",
  });
  assert.equal(result.headlines.length >= 3, true);
  assert.equal(result.descriptions.length >= 1, true);
  for (const item of result.headlines) {
    assert.equal(item.max, ADS_RSA_HEADLINE_MAX);
    assert.equal(item.length <= ADS_RSA_HEADLINE_MAX, true);
    assert.equal(item.text.includes("<"), false);
  }
  for (const item of result.descriptions) {
    assert.equal(item.max, ADS_RSA_DESCRIPTION_MAX);
    assert.equal(item.length <= ADS_RSA_DESCRIPTION_MAX, true);
    assert.equal(item.text.includes("<"), false);
  }
  assert.match(result.disclaimer, /garantisi yoktur/i);
});

test("Open Graph satırları URL doğrular ve HTML kaçışını yapar", () => {
  const result = buildOpenGraphTags({
    title: 'Defne <Cafe> "Özel"',
    description: "Defne’de kahve <b>yok</b>",
    url: "ornek-isletme.com/kahve",
    imageUrl: "https://ornek-isletme.com/og.jpg",
    siteName: "Defne Cafe",
  });
  assert.equal(result.urlOk, true);
  assert.equal(result.titleOk, true);
  assert.equal(result.descriptionOk, true);
  assert.equal(result.title.length <= OG_TITLE_MAX, true);
  assert.equal(result.description.length <= OG_DESCRIPTION_MAX, true);
  assert.match(result.url, /^https:\/\//);
  assert.match(result.html, /og:title/);
  assert.match(result.html, /&quot;/);
  assert.equal(result.html.includes("<Cafe>"), false);
  assert.equal(result.html.includes("<b>"), false);
  assert.match(result.title, /Defne Cafe/);
  assert.equal(buildOpenGraphTags({ title: "X", description: "Y", url: "not a url" }).urlOk, false);
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
  assert.equal(suggestGbpCategories("Defne PVC").includes("PVC doğrama"), true);
  assert.equal(suggestGbpCategories("Antakya Sucuk").includes("Şarküteri"), true);
  assert.equal(suggestGbpCategories("Antakya Pastırma").includes("Şarküteri"), true);
});

test("ihtiyaç hesaplayıcı paket önerir, kesin tutar uydurmaz", async () => {
  const { estimateNeeds, NEEDS_DISCLAIMER } = await import("../src/app/lib/needs-calculator.ts");
  const empty = estimateNeeds({ sector: "Taksi", district: "Antakya", needs: [] });
  assert.equal(empty.packageName, "");
  assert.equal(empty.whatsapp, "");
  const taxi = estimateNeeds({ sector: "Taksi <24>", district: "Defne", needs: ["maps", "ads"] });
  assert.equal(JSON.stringify(taxi).includes("<"), false);
  assert.match(taxi.packageName, /reklam|Harita|Karma|görünürlük/i);
  assert.equal(taxi.modules.some((row) => /taksi işletmez/i.test(row) || /müşteri/i.test(row)), true);
  assert.equal(/\d[\d.\s]*\s*(tl|try|₺)/i.test(JSON.stringify(taxi)), false);
  assert.match(taxi.whatsapp, /Defne/);
  assert.match(taxi.whatsapp, /Taksi 24/);
  assert.equal(taxi.disclaimer, NEEDS_DISCLAIMER);
  const shop = estimateNeeds({ sector: "Perakende mağaza", district: "İskenderun", needs: ["shop", "ads"] });
  assert.equal(shop.packageName, "Mağaza + reklam");
  assert.equal(shop.modules.some((row) => /e-ticaret/i.test(row)), true);
});

test("paket yapılandırıcı ürün adedinden değil seçilen hizmetlerden örnek tutar üretir", async () => {
  const { estimatePackageConfig, PACKAGE_MODULE_PRICES, NEEDS_DISCLAIMER, formatTryAmount } = await import("../src/app/lib/needs-calculator.ts");
  const empty = estimatePackageConfig({ needs: [] });
  assert.equal(empty.monthly, 0);
  assert.equal(empty.packageName, "");
  assert.equal(empty.includeShop, false);

  const webAds = estimatePackageConfig({ needs: ["site", "ads"] });
  assert.equal(webAds.monthly, PACKAGE_MODULE_PRICES.site + PACKAGE_MODULE_PRICES.ads);
  assert.equal(webAds.exampleTotal, webAds.monthly * 12);
  assert.equal(webAds.packageName, "Web + reklam");
  assert.equal(webAds.includeShop, false);
  assert.equal(webAds.lines.some((line) => line.id === "shop"), false);
  assert.match(webAds.adsBudgetNote, /hesabınızda/i);
  assert.equal(webAds.disclaimer, NEEDS_DISCLAIMER);
  assert.match(webAds.quoteNote, /kesin tutar/i);

  const blob = JSON.stringify(webAds).toLocaleLowerCase("tr-TR");
  assert.equal(blob.includes("pagespeed"), false);
  assert.equal(blob.includes("ürün hacmi"), false);
  assert.equal(blob.includes("5000"), false);

  const withShop = estimatePackageConfig({ needs: ["site", "shop"] });
  assert.equal(withShop.includeShop, true);
  assert.equal(withShop.monthly, PACKAGE_MODULE_PRICES.site + PACKAGE_MODULE_PRICES.shop);
  assert.ok(withShop.monthly !== webAds.monthly);

  const mapsOnly = estimatePackageConfig({ needs: ["maps", "maps", "hack"] });
  assert.equal(mapsOnly.monthly, PACKAGE_MODULE_PRICES.maps);
  assert.match(formatTryAmount(2075), /₺2[.,\s]?075/);
});

test("ihtiyaç seçimi iletişim formuna query ile taşınır", async () => {
  const { buildIletisimQuotePath, parseIletisimQuoteParams } = await import("../src/app/lib/needs-calculator.ts");
  const path = buildIletisimQuotePath({
    sector: "Klinik / diş",
    district: "Defne",
    needs: ["site", "maps"],
    packageName: "Yerel görünürlük",
  });
  assert.match(path, /^\/iletisim\?/);
  assert.match(path, /sector=/);
  assert.match(path, /district=Defne/);
  assert.match(path, /needs=site%2Cmaps|needs=site,maps/);
  const parsed = parseIletisimQuoteParams(path.slice(path.indexOf("?")));
  assert.equal(parsed.district, "Defne");
  assert.equal(parsed.sector, "Klinik / diş");
  assert.deepEqual(parsed.needs, ["site", "maps"]);
  assert.equal(parsed.service, "Diğer");
  assert.match(parsed.notes, /İhtiyaç/);
  assert.match(parsed.notes, /Paket:/);
  assert.match(parsed.notes, /Yerel görünürlük/);
  assert.equal(parsed.hasPrefill, true);

  const mapsOnly = parseIletisimQuoteParams("needs=maps");
  assert.equal(mapsOnly.service, "Google Maps / harita");
  assert.deepEqual(mapsOnly.needs, ["maps"]);

  const blank = parseIletisimQuoteParams("");
  assert.equal(blank.hasPrefill, false);
  assert.equal(buildIletisimQuotePath({}), "/iletisim");
});

test("hazır paket CTA paket adı ve aylık örneği taşır", async () => {
  const { buildReadyPlanQuotePath, parseIletisimQuoteParams, parseMonthlyTryAmount, needsForReadyPlan } = await import(
    "../src/app/lib/needs-calculator.ts"
  );
  assert.equal(parseMonthlyTryAmount("₺2.075 / ay"), 2075);
  assert.equal(parseMonthlyTryAmount("Projenize Özel Bütçe"), 0);
  assert.deepEqual(needsForReadyPlan({ kind: "ads", id: "starter" }), ["ads"]);
  assert.deepEqual(needsForReadyPlan({ kind: "ads", id: "scale" }), ["ads", "maps"]);
  assert.deepEqual(needsForReadyPlan({ kind: "store", id: "shop-start" }), ["site", "shop"]);

  const path = buildReadyPlanQuotePath({
    id: "pro",
    name: "Hatay360 Reklam Pro",
    kind: "ads",
    monthlyPrice: "₺3.740 / ay",
  });
  assert.match(path, /^\/iletisim\?/);
  assert.match(path, /pkg=/);
  assert.match(path, /ornek=3740/);
  const parsed = parseIletisimQuoteParams(path.slice(path.indexOf("?")));
  assert.equal(parsed.packageName, "Hatay360 Reklam Pro");
  assert.equal(parsed.exampleMonthly, 3740);
  assert.match(parsed.notes, /yönetim/);
  assert.match(parsed.notes, /reklam bütçesi ayrı/);
});

test("Google işletme açıklaması bölge ve kategoriyi kullanır", async () => {
  const { buildGbpDescription } = await import("../src/app/lib/maps-signup.ts");
  const text = buildGbpDescription({ name: "Defne <Dental>", sector: "Diş kliniği", district: "Defne" });
  assert.equal(text.includes("<"), false);
  assert.match(text, /Defne Dental/);
  assert.match(text, /Diş kliniği/);
  assert.equal(buildGbpDescription({ name: "", sector: "Kafe", district: "Antakya" }), "");
});

test("reklam tıklaması ile site ziyareti ayrı seride kalır", async () => {
  const { splitAdsAndWeb, summarizeClickToSite, metricsSourceLabel } = await import("../src/app/lib/portal-metrics.ts");
  const { canEditSmallSiteFields, resolveSiteEditMode, packageLabel } = await import("../src/app/lib/portal-package.ts");
  const rows = [
    { day: "2026-08-20", adsClicks: 1000, adsImpressions: 20000, adsSpend: 400, siteVisitors: 5, siteSessions: 6, source: "sample" },
  ];
  const split = splitAdsAndWeb(rows);
  assert.equal(split.ads[0].clicks, 1000);
  assert.equal(split.web[0].visitors, 5);
  assert.notEqual(split.ads[0].clicks, split.web[0].visitors);
  const conversion = summarizeClickToSite(rows);
  assert.equal(conversion.rate, 0.005);
  assert.match(conversion.label, /5 site ziyareti \/ 1000 reklam tıklaması/);
  assert.equal(metricsSourceLabel(rows), "örnek");
  assert.equal(canEditSmallSiteFields("start"), true);
  assert.equal(resolveSiteEditMode("shop-pro"), "own-panel");
  assert.equal(canEditSmallSiteFields(""), false);
  assert.match(packageLabel("pro"), /Reklam Pro/);
});

test("destek saat aralığı parse edilir ve şema satırı üretir", () => {
  assert.deepEqual(parseHourRangeMinutes("09:00–18:00"), { open: 9 * 60, close: 18 * 60 });
  assert.deepEqual(parseHourRangeMinutes("09:00-18:00"), { open: 9 * 60, close: 18 * 60 });
  assert.equal(parseHourRangeMinutes("kapalı"), null);
  assert.equal(normalizeSupportHours("9:00-18:00", "09:00–18:00"), "09:00–18:00");
  assert.equal(normalizeSupportHours("", "", true), "");
  assert.deepEqual(supportOpeningHoursSchema("09:00–18:00", "10:00–14:00"), ["Mo-Fr 09:00-18:00", "Sa 10:00-14:00"]);
  assert.deepEqual(supportOpeningHoursSchema("09:00–18:00", ""), ["Mo-Fr 09:00-18:00"]);
  const copy = supportHoursCopy("09:00–18:00", "10:00–14:00");
  assert.equal(copy.weekdayLine, "Hafta içi 09:00–18:00");
  assert.match(copy.weekendLine, /Cumartesi 10:00–14:00/);
});

test("destek mesai açık/kapalı Istanbul saatine göre hesaplanır", () => {
  // 2026-08-21 Cuma 12:00 Istanbul ≈ 09:00 UTC
  const fridayNoon = new Date("2026-08-21T09:00:00.000Z");
  assert.equal(isSupportOpenNow("09:00–18:00", "10:00–14:00", fridayNoon), true);
  const fridayNight = new Date("2026-08-21T18:00:00.000Z"); // 21:00 Istanbul
  assert.equal(isSupportOpenNow("09:00–18:00", "10:00–14:00", fridayNight), false);
  // 2026-08-23 Pazar
  const sunday = new Date("2026-08-23T10:00:00.000Z");
  assert.equal(isSupportOpenNow("09:00–18:00", "10:00–14:00", sunday), false);
  // 2026-08-22 Cumartesi 12:00 Istanbul ≈ 09:00 UTC
  const saturday = new Date("2026-08-22T09:00:00.000Z");
  assert.equal(isSupportOpenNow("09:00–18:00", "10:00–14:00", saturday), true);
  assert.equal(isSupportOpenNow("09:00–18:00", "", saturday), false);
});

test("müşteri ticket mesai durumu kısa metin üretir", () => {
  const fridayNoon = new Date("2026-08-21T09:00:00.000Z");
  const openDesk = supportDeskStatus("09:00–18:00", "10:00–14:00", fridayNoon);
  assert.equal(openDesk.open, true);
  assert.equal(openDesk.badge, "Mesai açık");
  assert.match(openDesk.detail, /kuyruğa/);
  assert.match(openDesk.nextLabel, /18:00.*kapanır/);

  const fridayNight = new Date("2026-08-21T18:00:00.000Z");
  const closedDesk = supportDeskStatus("09:00–18:00", "10:00–14:00", fridayNight);
  assert.equal(closedDesk.open, false);
  assert.equal(closedDesk.badge, "Mesai dışı");
  assert.match(closedDesk.detail, /kaydedilir/);
  assert.match(closedDesk.nextLabel, /Yarın 10:00.*açılır/);
});

test("ticket kuyruk onay metni mesai helper kullanır, SLA uydurmaz", () => {
  const fridayNoon = new Date("2026-08-21T09:00:00.000Z");
  const copy = ticketQueueConfirmCopy("09:00–18:00", "10:00–14:00", fridayNoon);
  assert.match(copy, /mesai saatine göre/);
  assert.match(copy, /Hafta içi 09:00–18:00/);
  assert.doesNotMatch(copy, /dakika|saat içinde yanıt|SLA/i);
});

test("sonraki mesai açılış/kapanış etiketi Istanbul saatine göre", () => {
  const fridayNoon = new Date("2026-08-21T09:00:00.000Z");
  assert.equal(nextSupportChange("09:00–18:00", "10:00–14:00", fridayNoon).kind, "closes");
  assert.match(nextSupportChange("09:00–18:00", "10:00–14:00", fridayNoon).label, /Bugün 18:00/);

  const fridayMorning = new Date("2026-08-21T05:00:00.000Z"); // 08:00 Istanbul
  assert.equal(nextSupportChange("09:00–18:00", "10:00–14:00", fridayMorning).kind, "opens");
  assert.match(nextSupportChange("09:00–18:00", "10:00–14:00", fridayMorning).label, /Bugün 09:00/);

  const fridayNight = new Date("2026-08-21T18:00:00.000Z");
  assert.match(nextSupportChange("09:00–18:00", "10:00–14:00", fridayNight).label, /Yarın 10:00/);

  const sunday = new Date("2026-08-23T10:00:00.000Z");
  assert.match(nextSupportChange("09:00–18:00", "10:00–14:00", sunday).label, /Yarın 09:00/);

  const saturdayClosed = new Date("2026-08-22T12:00:00.000Z"); // 15:00 Istanbul, Cumartesi kapandı
  assert.match(nextSupportChange("09:00–18:00", "10:00–14:00", saturdayClosed).label, /Pazartesi 09:00/);
});
