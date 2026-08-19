export type District = {
  name: string;
  blurb: string;
};

/** Hatay büyükşehir — resmi 15 ilçe */
export const OFFICIAL_HATAY_DISTRICTS = [
  "Antakya",
  "Defne",
  "Arsuz",
  "İskenderun",
  "Dörtyol",
  "Payas",
  "Erzin",
  "Kırıkhan",
  "Reyhanlı",
  "Kumlu",
  "Hassa",
  "Altınözü",
  "Yayladağı",
  "Samandağ",
  "Belen",
] as const;

export function districtBlurb(name: string) {
  return `${name} web tasarım, ${name} reklam ve e-ticaret. Hatay360 ile kurumsal site, Google Ads ve mağaza altyapısı.`;
}

export const DEFAULT_DISTRICTS: District[] = OFFICIAL_HATAY_DISTRICTS.map((name) => ({
  name,
  blurb: districtBlurb(name),
}));

export const FEATURED_DISTRICT_NAMES = ["Antakya", "Defne", "İskenderun", "Dörtyol", "Samandağ"] as const;

export function districtSlug(name: string) {
  return name
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function districtPath(name: string) {
  return `/hatay/${districtSlug(name)}`;
}

export function normalizeNap(value: string) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function napMatches(left: string, right: string) {
  const a = normalizeNap(left);
  const b = normalizeNap(right);
  return Boolean(a && b && a === b);
}

export function buildUtmUrl(base: string, source: string, medium: string, campaign: string, content = "") {
  const raw = String(base || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (source.trim()) url.searchParams.set("utm_source", source.trim());
    if (medium.trim()) url.searchParams.set("utm_medium", medium.trim());
    if (campaign.trim()) url.searchParams.set("utm_campaign", campaign.trim());
    if (content.trim()) url.searchParams.set("utm_content", content.trim());
    return url.toString();
  } catch {
    return "";
  }
}

export function mapsQuery(value: string) {
  return String(value || "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

export function buildMapsSearchUrl(query: string) {
  const q = mapsQuery(query);
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : "";
}

export function buildMapsDirectionsUrl(destination: string, origin = "") {
  const dest = mapsQuery(destination);
  if (!dest) return "";
  let href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
  const from = mapsQuery(origin);
  if (from) href += `&origin=${encodeURIComponent(from)}`;
  return href;
}

function schemaText(value: string, max = 200) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

export function buildReviewReplies(input: { brand: string; customer: string; stars: number; topic?: string }) {
  const brand = schemaText(input.brand, 60) || "İşletmemiz";
  const customer = schemaText(input.customer, 40);
  const topic = schemaText(input.topic || "", 80);
  const stars = Math.min(5, Math.max(1, Math.round(Number(input.stars) || 1)));
  const hello = customer ? `${customer}, ` : "";
  const about = topic ? ` ${topic} konusunda` : "";
  if (stars >= 4) {
    return [
      `${hello}yorumunuz için teşekkür ederiz. ${brand} olarak${about} sizi ağırlamak bizim için değerli. Tekrar bekleriz.`,
      `${hello}güzel sözleriniz ekibimize ulaştı. ${brand} adına teşekkür ederiz.`,
    ];
  }
  if (stars === 3) {
    return [
      `${hello}paylaşımınız için teşekkür ederiz. ${brand} olarak${about} eksik kalan noktayı telefonla netleştirmek isteriz. Bizi aramanız yeterli.`,
    ];
  }
  return [
    `${hello}yaşadığınız deneyim için üzgünüz. ${brand} olarak bu konuyu herkese açık alanda tartışmak yerine sizi arayıp düzeltmek istiyoruz. Lütfen bizi arayın.`,
    `${hello}yorumunuz bize ulaştı. ${brand} adına özür dileriz. Detayı özelden konuşup çözüm üretelim.`,
  ];
}

export function buildAppointmentReminder(input: { brand: string; customer: string; when: string; service?: string }) {
  const brand = schemaText(input.brand, 60) || "İşletmemiz";
  const customer = schemaText(input.customer, 40);
  const when = schemaText(input.when, 80) || "randevu saatinizde";
  const service = schemaText(input.service || "", 60);
  const hello = customer ? `${customer}, ` : "";
  const about = service ? ` ${service}` : "";
  return {
    whatsapp: `${hello}${brand} randevunuz${about} ${when}. Gelebilirseniz sorun yok; gelemeyecekseniz lütfen yazın, saati başkasına açalım.`,
    sms: `${brand}: randevu${about} ${when}. İptal için yazın.`,
  };
}

export function buildClosedNotice(input: { brand: string; from: string; to: string; reason?: string }) {
  const brand = schemaText(input.brand, 60) || "İşletmemiz";
  const from = schemaText(input.from, 40) || "bugün";
  const to = schemaText(input.to, 40) || "yarın";
  const reason = schemaText(input.reason || "", 50);
  const why = reason ? ` ${reason} nedeniyle` : "";
  return {
    whatsapp: `${brand}${why} ${from} – ${to} kapalıyız. Acilse bu mesajı bırakın; açılınca döneriz. Bu tarihlerde sipariş / randevu yok.`,
    maps: `${brand} ${from} – ${to} kapalı.${why} Acil aramalara mesaj bırakın.`,
  };
}

export function extractGooglePlaceId(input: string) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const fromQuery = url.searchParams.get("placeid") || url.searchParams.get("place_id") || "";
    if (fromQuery.trim()) return fromQuery.trim();
  } catch {
    /* düz Place ID */
  }
  if (/^[A-Za-z0-9_-]{10,}$/.test(raw)) return raw;
  return "";
}

export function buildGoogleReviewUrl(placeIdOrUrl: string) {
  const id = extractGooglePlaceId(placeIdOrUrl);
  return id ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id)}` : "";
}

export function buildLocalBusinessJsonLd(input: {
  name: string;
  phone: string;
  address: string;
  city: string;
  url: string;
  hours: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: schemaText(input.name, 120),
    telephone: schemaText(input.phone, 40),
    url: schemaText(input.url, 200),
    address: {
      "@type": "PostalAddress",
      streetAddress: schemaText(input.address, 160),
      addressLocality: schemaText(input.city, 80),
      addressCountry: "TR",
    },
    openingHours: schemaText(input.hours, 120),
  };
  return JSON.stringify(data, null, 2);
}

export function findDistrictBySlug(districts: District[], slug: string) {
  return districts.find((d) => districtSlug(d.name) === slug);
}

export function resolveDistricts(districts?: District[] | null) {
  return districts?.length ? districts : DEFAULT_DISTRICTS;
}

export const DEFAULT_SEO_LOCAL_LEAD =
  "Antakya merkezli Hatay360; Hatay’da web tasarım, reklam ajansı ve e-ticaret altyapısı sunar. İskenderun, Defne ve diğer ilçelere uzaktan da çalışırız.";

export const DEFAULT_SEO_KEYWORDS =
  "hatay reklam, hatay web tasarım, hatay web sitesi, hatay web siteciler, hatay ajans, hatay reklam ajansı, hatay e-ticaret, hatay yazılım, hatay360, antakya web tasarım, defne web tasarım, arsuz reklam, iskenderun web tasarım, iskenderun reklam, dörtyol web tasarım, payas reklam, erzin web sitesi, kırıkhan reklam, reyhanlı web tasarım, kumlu e-ticaret, hassa reklam, altınözü web tasarım, yayladağı web sitesi, samandağ reklam, belen web tasarım";

export const CONTACT_FAQS = [
  {
    q: "Hatay’da web tasarım ne kadar sürer?",
    a: "Kurumsal site genelde 7–14 gün, e-ticaret altyapısı aynı gün kurulup içeriğe göre yayına alınır. İskenderun ve diğer ilçelerde uzaktan ilerleriz.",
  },
  {
    q: "Reklam için ofise gelmem gerekir mi?",
    a: "Hayır. Keşif görüşmesi telefon veya video ile yapılır. Antakya’daysanız ofise de uğrayabilirsiniz.",
  },
  {
    q: "Hangi ilçelere hizmet veriyorsunuz?",
    a: "Hatay’ın tamamı. Antakya, Defne, İskenderun öne çıkar; diğer ilçelerin kendi sayfası /hatay altında.",
  },
  {
    q: "Paket fiyatına reklam bütçesi dahil mi?",
    a: "Hayır. Paket tutarı yönetim ücretidir. Google Ads ve Meta harcaması sizin hesabınızda kalır; biz kampanyayı yönetiriz.",
  },
  {
    q: "Google Maps kaydı da yapıyor musunuz?",
    a: "Evet. İşletme profili, kategori, saat ve yorum daveti ayrı hizmet. Harita kaydı sihirbazından başlayabilirsiniz.",
  },
];

export const PACKAGE_FAQS = [
  CONTACT_FAQS[3],
  {
    q: "15 gün deneme nasıl işler?",
    a: "E-ticaret altyapısını kurup içeriği doldurursunuz. Beğenmezseniz süre sonunda durdurulur; reklam bütçesi zaten sizin hesabınızdadır.",
  },
  {
    q: "Hazır paket mi özel teklif mi?",
    a: "Hazır paket reklam + site için yeter. Katalog, pazaryeri veya özel yazılım varsa keşif sonrası ayrı teklif yazılır.",
  },
];

export const SERVICE_FAQS = [
  {
    q: "Sitem yokken Google Ads yapılır mı?",
    a: "Yapılır ama önce sade bir satış sayfası öneririz. Reklam tıklaması boş sayfaya giderse bütçe boşa gider.",
  },
  {
    q: "Pazaryeri ve kendi sitem aynı stokta mı durur?",
    a: "Evet. Trendyol, Hepsiburada ve kendi mağaza stoku tek panelden güncellenir; çift satış riski azalır.",
  },
  CONTACT_FAQS[3],
];

export const MAPS_FAQS = [
  {
    q: "Google harita kaydı ne kadar sürer?",
    a: "Doğrulama Google’a bağlıdır; form ve kategori hazırlığı aynı gün başlar. Pin ve doğrulama kartı/telefon süreci işletmeye göre değişir.",
  },
  {
    q: "Sahte yorum veya puan basıyor musunuz?",
    a: "Hayır. Yalnızca hizmet alan gerçek müşteriye yorum bağlantısı gider. Teşvik karşılığı puan ve toplu sahte yorum hesap kapatır.",
  },
  {
    q: "Sadece kayıt mı, harita SEO’su da var mı?",
    a: "Kayıt, kategori, saat, fotoğraf ve gerçek yorum akışı birlikte planlanır. Sıra garantisi yok; doğru profil ve içerik hedeflenir.",
  },
];

export const ABOUT_FAQS = [
  {
    q: "Hatay360 ile AvcNova aynı şey mi?",
    a: "Hayır. Hatay360 Hatay’da web tasarım, reklam ve görünürlük işidir. AvcNova, AVC ailesinin BUNG lisanslı yazılım markasıdır; araç kiralama gibi operasyon yazılımlarını üretir.",
  },
  {
    q: "Taksi şoförleri markanın sahibi mi?",
    a: "Değil. Taksi işletmeleri reklam ve site müşterisidir. Hatay360 markası Avcı E-Ticaret / Mahir Avcı üretimindedir.",
  },
  {
    q: "Sadece Antakya’ya mı bakıyorsunuz?",
    a: "Hayır. Merkez Antakya’dır; İskenderun, Defne ve diğer ilçelere uzaktan kurulum ve reklam yönetimi yapılır.",
  },
];

export const FEATURE_FAQS = [
  {
    q: "SSL ve mobil uyum ayrı ücret mi?",
    a: "Hayır. Site paketinde SSL ve mobil uyum vardır. Sanal POS ve pazaryeri senkronu e-ticaret paketinde; kurumsal vitrinde zorunlu değildir.",
  },
  {
    q: "Sadece e-ticaret mi kuruyorsunuz?",
    a: "Hayır. Kuaför, taksi, klinik gibi çağrı siteleri de aynı altyapıda. Mağaza, stok ve kargo modülleri ürün satan işletmeye açılır.",
  },
  {
    q: "15 gün deneme gerçekten ücretsiz mi?",
    a: "Kurulum denemesi ücret alınmadan başlar. Kart bağlama şartı yok. Beğenmezseniz içerik teslim edilir, abonelik açılmaz.",
  },
];

export const PRIVACY_FAQS = [
  {
    q: "Kart bilgim bu sitede tutulur mu?",
    a: "Hayır. İletişim formunda kart alanı yok. Tahsilat sanal POS veya fatura ile ayrıca yürür; Hatay360 form kaydına kart yazılmaz.",
  },
  {
    q: "Telefonumu reklam listesine satıyor musunuz?",
    a: "Hayır. Numara yalnızca sizi aramak ve kurulum için kullanılır. İzinsiz SMS veya üçüncü taraf listesine eklenmez.",
  },
  {
    q: "Verilerimin silinmesini nasıl isterim?",
    a: "İletişim sayfasındaki telefon veya e-posta ile yazmanız yeter. KVKK kapsamında düzeltme ve silme talebi aynı kanaldan alınır.",
  },
];

export const TERMS_FAQS = [
  {
    q: "Demo siteleri kopyalayıp kendi markamda kullanabilir miyim?",
    a: "Hayır. Demolar örnek vitrindir. Tasarım, yazılım ve metin Mahir Avcı / Avcı E-Ticaret’e aittir; izinsiz kopya ve başka markada kullanım yasaktır.",
  },
  {
    q: "Sitedeki fiyat kesin sözleşme mi?",
    a: "Hayır. Paket tutarları örnek / kampanya olabilir. Kesin ücret, süre ve teslim yazılı teklifte belirtilir.",
  },
  {
    q: "Deneme bitince kartımdan otomatik çekim olur mu?",
    a: "Olmaz. Kart bağlama şartı yok. Canlıya geçiş sizin onayınız ve ayrı kurulum planı ile başlar.",
  },
];

export function districtFaqs(name: string, visitHook: string) {
  return [
    {
      q: `${name} için web sitesi ne kadar sürer?`,
      a: "Kurumsal site genelde 7–14 gün. E-ticaret altyapısı aynı gün kurulup içeriğe göre yayına alınır. Keşif uzaktan da olur.",
    },
    {
      q: "Sadece reklam yaptırabilir miyim?",
      a: "Evet. Elinizde site varsa reklamı ayrı yönetiriz. Yoksa önce sade bir sayfa, sonra reklam öneririz.",
    },
    {
      q: "Antakya’ya gelmem gerekir mi?",
      a: visitHook,
    },
  ];
}

export function buildFaqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: schemaText(item.q, 160),
      acceptedAnswer: {
        "@type": "Answer",
        text: schemaText(item.a, 400),
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(origin: string, crumbs: { name: string; path: string }[]) {
  const base = String(origin || "").replace(/\/$/, "");
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: schemaText(crumb.name, 80),
      item: `${base}${crumb.path === "/" ? "/" : crumb.path}`,
    })),
  };
}

export function attachJsonLdGraph(json: Record<string, unknown>, extras: Record<string, unknown>[]) {
  const context = json["@context"] || "https://schema.org";
  const graph = json["@graph"];
  if (Array.isArray(graph)) {
    return { "@context": context, "@graph": [...graph, ...extras] };
  }
  const { "@context": _ignored, ...rest } = json;
  return { "@context": context, "@graph": [rest, ...extras] };
}


export const SEO_PATH_MAP: Record<string, SeoPageId> = {
  "/": "home",
  "/pazarla": "hizmetler",
  "/ozellikler": "ozellikler",
  "/paketler": "paketler",
  "/referanslar": "referanslar",
  "/hakkimizda": "hakkimizda",
  "/iletisim": "iletisim",
  "/gizlilik": "gizlilik",
  "/kosullar": "kosullar",
  "/sektor": "hizmetler",
};

export type SeoPageId =
  | "home"
  | "hizmetler"
  | "ozellikler"
  | "paketler"
  | "referanslar"
  | "hakkimizda"
  | "iletisim"
  | "gizlilik"
  | "kosullar";

export type SeoPage = {
  title: string;
  description: string;
};

export const DEFAULT_SEO_PAGES: Record<SeoPageId, SeoPage> = {
  home: {
    title: "Hatay360 | Hatay Web Tasarım, Reklam Ajansı ve E-Ticaret",
    description:
      "Hatay reklam ajansı ve web siteciler. Antakya & İskenderun web tasarım, Google Ads, e-ticaret altyapısı. Hatay360 yazılım firması.",
  },
  hizmetler: {
    title: "Hatay Web Tasarım ve Reklam | Hizmetler | Hatay360",
    description:
      "Hatay web sitesi, İskenderun tasarım, pazaryeri entegrasyonu, Google/Meta reklam ve özel yazılım. Tek ekip, tek muhatap.",
  },
  ozellikler: {
    title: "E-Ticaret Özellikleri | Hatay Web Sitesi Altyapısı | Hatay360",
    description:
      "SSL, sanal POS, sınırsız ürün, pazaryeri senkronu. Hatay’da e-ticaret ve web sitesi altyapısı.",
  },
  paketler: {
    title: "Hatay Web Tasarım ve E-Ticaret Paketleri | Hatay360",
    description:
      "Hatay reklam, web tasarım ve e-ticaret paketleri. 15 gün ücretsiz deneme. Antakya ve İskenderun işletmeleri için.",
  },
  referanslar: {
    title: "AVC Ekosistemi Referansları | Hatay360, Adana360 ve Avcı E-Ticaret",
    description:
      "Hatay360, Adana360 ve Avcı E-Ticaret ortak dijital ekosisteminden gerçek kurumsal web ve e-ticaret çalışmaları.",
  },
  hakkimizda: {
    title: "Hakkımızda | Hatay Reklam Ajansı ve Yazılım | Hatay360",
    description:
      "Antakya merkezli Hatay360: Hatay web tasarım, reklam ajansı, e-ticaret ve yazılım. İskenderun ve tüm ilçelere hizmet.",
  },
  iletisim: {
    title: "İletişim | Hatay Web Siteciler ve Reklam Ajansı | Hatay360",
    description:
      "Hatay reklam ve web tasarım teklifi. Antakya ofis, İskenderun dahil tüm ilçeler. Numaranızı bırakın, sizi arayalım.",
  },
  gizlilik: {
    title: "Gizlilik ve KVKK | Hatay360",
    description: "Hatay360 gizlilik politikası ve KVKK aydınlatma metni.",
  },
  kosullar: {
    title: "Kullanım Koşulları | Hatay360",
    description: "Hatay360 e-ticaret, web tasarım ve reklam hizmetleri kullanım koşulları.",
  },
};
