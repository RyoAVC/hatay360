import type { ManagedSite } from "../site-templates";

/** Yalnızca /s/taxireyhanli — şahıs taksi (Mehmet Y.), durak değil. */
export const TAXIREYHANLI_SLUG = "taxireyhanli";

export function isTaxireyhanliSite(site: ManagedSite | null | undefined): boolean {
  return site?.slug === TAXIREYHANLI_SLUG;
}

/** Hizmet bölgeleri: rakip sitede kamuya açık listelenen Reyhanlı mahalle/güzergâhlar (içerik kopyası değil, coğrafi referans). */
export const TAXIREYHANLI_SERVICE_AREAS = [
  "Reyhanlı Merkez",
  "Yenişehir",
  "Bağlar",
  "Cumhuriyet",
  "Bayır",
  "Değirmenkaşı",
  "Kuşaklı",
  "Harran",
  "Cilvegözü Yolu",
  "Cilvegözü Sınır Kapısı",
  "Reyhanlı Devlet Hastanesi",
  "Otogar",
  "Çarşı",
] as const;

export const TAXIREYHANLI_SEO = {
  /** ≤60 karakter */
  title: "Reyhanlı Taksi | Mehmet Y. - 7/24 Taksi Reyhanlı, Hatay",
  /** ~155 karakter */
  description:
    "Reyhanlı taksi ve Reyhanlı taksi telefon: Mehmet Y. şahıs taksi 7/24 açık hat. Hatay Reyhanlı merkez, hastane, otogar ve Cilvegözü hattında. Arayın: 0541 882 28 02.",
  keywords:
    "reyhanlı taksi, hatay reyhanlı taksi, reyhanlı taksi telefon, reyhanlı taksi numarası, reyhanlıda taksi çağır, cilvegözü taksi, reyhanlı şahıs taksi, mehmet y taksi",
};

export const TAXIREYHANLI_WHY_CHOOSE = [
  {
    title: "7/24 açık hat",
    desc: "Gece, sabah erken veya acil yolculukta Reyhanlı taksi talebinizi telefon veya WhatsApp ile iletebilirsiniz.",
  },
  {
    title: "Şahıs taksi sürücüsü",
    desc: "Durak veya çağrı merkezi değil; Mehmet Y. doğrudan sizinle iletişim kurar, yerel güzergâhlara hakimdir.",
  },
  {
    title: "Tek dokunuşla arama",
    desc: "Mobilde numaraya dokunup arayın veya WhatsApp'tan konum gönderin; Reyhanlı'da taksi çağırma pratik kalır.",
  },
  {
    title: "Cilvegözü ve merkez hattı",
    desc: "Reyhanlı merkez, hastane, otogar ve Cilvegözü Sınır Kapısı bağlantılarında düzenli hizmet.",
  },
] as const;

export const TAXIREYHANLI_INTRO =
  "Hatay Reyhanlı taksi arayanlar için Mehmet Y. şahıs taksi hizmeti sunuyor. Reyhanlı taksi telefon hattı 7/24 açıktır; " +
  "Reyhanlı merkez, mahalle içi ulaşım, Reyhanlı Devlet Hastanesi, otogar ve Cilvegözü güzergâhlarında " +
  "Reyhanlı'da taksi çağırmanız için tek numara: 0541 882 28 02. Durak beklemeden doğrudan sürücüyle konuşursunuz.";

export const TAXIREYHANLI_FAQS_EXTRA = [
  {
    q: "Reyhanlı taksi telefon numarası nedir?",
    a: "Reyhanlı taksi telefon: 0541 882 28 02. Sayfadaki Ara butonu mobilde doğrudan arama başlatır.",
  },
  {
    q: "Hatay Reyhanlı taksi durağı mısınız?",
    a: "Hayır; şahıs taksi sürücüsü Mehmet Y. hizmet verir. Reyhanlı taksi talebinizi doğrudan bu numaradan iletebilirsiniz.",
  },
] as const;

const GBP_LEAD_SENT_KEY = "hatay360_taxireyhanli_gbp_lead_v1";

/** Admin kayıtlarında Google İşletme Profili başvurusu oluşur (aynı telefon birleştirilir). */
export function requestTaxireyhanliGbpSignup(): void {
  try {
    if (localStorage.getItem(GBP_LEAD_SENT_KEY)) return;
  } catch {
    return;
  }
  void fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      kind: "maps",
      name: "Mehmet Y.",
      phone: "05418822802",
      sector: "taksi",
      district: "Reyhanlı",
      address: "Reyhanlı / Hatay — şahıs taksi (Mehmet Y.)",
      hours: "7/24",
      website: "https://taxireyhanli.com",
      service: "Google Maps / harita kaydı",
      sourcePath: "/s/taxireyhanli",
      notes:
        "taxireyhanli.com microsite — Google İşletme Profili kayıt talebi (şahıs taksi sürücüsü Mehmet Y.). Manuel doğrulama Hatay360 tarafından yapılacak.",
      smsOk: 1,
    }),
  })
    .then((res) => {
      if (res.ok) {
        try {
          localStorage.setItem(GBP_LEAD_SENT_KEY, "1");
        } catch {
          /* ignore */
        }
      }
    })
    .catch(() => {
      /* sessiz; sayfa çalışmaya devam eder */
    });
}

/** API'den gelen site config'ini taxireyhanli SEO içeriğiyle zenginleştirir. */
export function enrichTaxireyhanliSite(site: ManagedSite): ManagedSite {
  const config = { ...site.config };
  config.seo = { ...config.seo, ...TAXIREYHANLI_SEO };
  config.business = {
    ...config.business,
    name: "Reyhanlı Taksi — Mehmet Y.",
    ownerName: "Mehmet Y.",
    phone: "05418822802",
    whatsapp: "05418822802",
    city: "Hatay",
    district: "Reyhanlı",
    hours: "7/24",
    addressText: "Reyhanlı / Hatay — merkez, mahalleler, hastane, otogar ve Cilvegözü hattı",
    mapsUrl: config.business.mapsUrl || "https://www.google.com/maps/search/?api=1&query=Reyhanl%C4%B1+Taksi",
  };
  config.hero = {
    ...config.hero,
    badge: "7/24 Reyhanlı taksi — şahıs sürücü",
    title: "Reyhanlı Taksi",
    subtitle:
      "Hatay Reyhanlı taksi: Mehmet Y. şahıs taksi. Reyhanlı'da taksi çağır, merkez, hastane, otogar ve Cilvegözü hattında 7/24 ulaş.",
    callLabel: "Reyhanlı Taksi Telefon",
    whatsappLabel: "WhatsApp'tan Konum Gönder",
  };
  config.areas = [...TAXIREYHANLI_SERVICE_AREAS];
  config.whatsappTemplate = "Merhaba, Reyhanlı'da taksi talebim var. Konumum: ";
  const existingFaqs = config.faqs.filter((f) => !TAXIREYHANLI_FAQS_EXTRA.some((e) => e.q === f.q));
  config.faqs = [...existingFaqs, ...TAXIREYHANLI_FAQS_EXTRA];
  return { ...site, config };
}
