import { useEffect } from "react";
import { useLocation } from "react-router";
import { useContent } from "../context/content-context";
import {
  DEFAULT_SEO_PAGES,
  FEATURED_DISTRICT_NAMES,
  SEO_PATH_MAP,
  CONTACT_FAQS,
  PACKAGE_FAQS,
  SERVICE_FAQS,
  MAPS_FAQS,
  ABOUT_FAQS,
  FEATURE_FAQS,
  PRIVACY_FAQS,
  TERMS_FAQS,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  attachJsonLdGraph,
  districtFaqs,
  findDistrictBySlug,
  resolveDistricts,
  type SeoPageId,
} from "../lib/seo";
import { districtAngle } from "../lib/district-copy";
import { supportOpeningHoursSchema } from "../lib/contact";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function isIndexedPublicPath(pathname: string) {
  if (SEO_PATH_MAP[pathname]) return true;
  if (pathname === "/hatay" || pathname.startsWith("/hatay/")) return true;
  if (pathname === "/demolar" || pathname.startsWith("/demo/")) return true;
  if (pathname.startsWith("/sektor/")) return true;
  if (pathname === "/araclar" || pathname.startsWith("/araclar/")) return true;
  if (pathname === "/google-maps-harita-kaydi") return true;
  if (pathname === "/hatay-kesfet" || pathname === "/hatayda-nerede-kahvalti-yapilir") return true;
  if (pathname === "/hesap") return true;
  return false;
}

export function SeoHead() {
  const { pathname } = useLocation();
  const { settings } = useContent();

  useEffect(() => {
    const districts = resolveDistricts(settings.districts);
    const origin = window.location.origin;
    const url = `${origin}${pathname}`;
    const brand = settings.siteTitle || "Hatay360";

    if (pathname.startsWith("/demo/")) {
      document.title = `Örnek site | ${brand}`;
      upsertMeta("name", "description", "Hatay360 sektör demo sitesi. Müşteri sitesinin nasıl duracağına örnektir.");
      upsertMeta("name", "robots", "noindex, follow");
      return;
    }

    if (pathname.startsWith("/panel") || pathname.startsWith("/musteri") || pathname.startsWith("/firma") || pathname === "/admin") {
      const label = pathname.startsWith("/musteri") ? "Müşteri Paneli" : pathname.startsWith("/firma") ? "Firma Paneli" : "Yönetim Paneli";
      document.title = `${label} | ${brand}`;
      upsertMeta("name", "description", "Hatay360 güvenli hesap paneli.");
      upsertMeta("name", "robots", "noindex, nofollow, noarchive");
      document.head.querySelector('link[rel="canonical"]')?.remove();
      document.getElementById("hatay360-jsonld")?.remove();
      return;
    }

    if (!isIndexedPublicPath(pathname)) {
      document.title = `Sayfa bulunamadı | ${brand}`;
      upsertMeta("name", "description", "Bu adres Hatay360’ta yok. Ana sayfa, paketler, ücretsiz araçlar veya Hatay ilçelerinden devam edin.");
      upsertMeta("name", "robots", "noindex, follow");
      document.head.querySelector('link[rel="canonical"]')?.remove();
      document.getElementById("hatay360-jsonld")?.remove();
      return;
    }

    let title = brand;
    let description = "";
    let keywords = settings.seoKeywords || "";
    let areaServed: string[] = ["Hatay", ...FEATURED_DISTRICT_NAMES];
    let json: Record<string, unknown>;

    const slugMatch = pathname.match(/^\/hatay\/([^/]+)\/?$/);
    const district = slugMatch ? findDistrictBySlug(districts, slugMatch[1]) : undefined;
    const sectorSlugMatch = pathname.match(/^\/(?:sektor|demo)\/([^/]+)\/?$/);
    const sectorSlug = sectorSlugMatch?.[1] === "taksi" ? "taxi" : sectorSlugMatch?.[1];
    const sectorMeta = sectorSlug
      ? {
          taxi: {
            title: `Hatay Taksi Reklamı | Google Ads & Meta | ${brand}`,
            description:
              "Hatay taksi reklamı, Google Ads, Meta reklamları ve özel landing page ile daha çok çağrı ve WhatsApp dönüşümü elde edin.",
            keywords:
              "hatay taksi, iskenderun taksi, antakya taksi, taksi reklam, google ads taksi, transfer reklam",
          },
          nakliyat: {
            title: `Hatay Nakliyat Reklamı | Google Ads & Yerel Görünürlük | ${brand}`,
            description:
              "Hatay nakliyat firmaları için Google Ads, yerel görünürlük, hızlı teklif ve çağrı odaklı landing page çözümleri.",
            keywords:
              "hatay nakliyat, nakliyat firması hatay, nakliye fiyatları, evden eve nakliyat, ofis taşıma",
          },
          klinik: {
            title: `Hatay Klinik Reklamı | Randevu & Görünürlük | ${brand}`,
            description:
              "Hatay klinik, diş doktoru ve estetik merkezleri için Google reklamları, yerel görünürlük ve randevu odaklı landing page çözümleri.",
            keywords:
              "hatay diş doktoru, antakya estetik, hatay doktor, klinik reklam, randevu odaklı reklam",
          },
          servis: {
            title: `Hatay Servis & Tamirat Reklamı | Google Ads & WhatsApp | ${brand}`,
            description:
              "Hatay servis, tamirat ve yerel hizmet firmaları için Google Ads, Meta reklamları ve hızlı dönüşüm odaklı sayfa tasarımı.",
            keywords:
              "hatay klima servisi, oto tamir, elektronik servis, tamirat reklam, hatay servis firması",
          },
        }[sectorSlug] || null
      : null;
    const toolMeta = ({
      "/araclar": {
        title: `Ücretsiz SEO Araçları | ${brand}`,
        description: "Google sıra kontrolü, meta etiket oluşturucu ve yerel anahtar kelime üretici araçlarını ücretsiz kullanın.",
        keywords: "ücretsiz seo araçları, google sıra bulucu, meta etiket oluşturucu, anahtar kelime oluşturucu",
      },
      "/araclar/google-sira-bulucu": {
        title: `Google Sıra Bulucu - Ücretsiz Kontrol | ${brand}`,
        description: "Web sitenizin anahtar kelimesini Google'da güvenli ve manuel kontrol edin. İzinsiz kazıma yapmayan ücretsiz sıra kontrol aracı.",
        keywords: "google sıra bulucu, google sıralama kontrol, site sıra sorgulama, kelime sıra takip",
      },
      "/araclar/meta-etiket-olusturucu": {
        title: `Meta Etiket Oluşturucu - Ücretsiz SEO Aracı | ${brand}`,
        description: "SEO başlığı, meta açıklaması, anahtar kelime ve Google sonuç önizlemesini ücretsiz oluşturun.",
        keywords: "meta etiket oluşturucu, meta title oluşturucu, meta description oluşturucu, seo başlık aracı",
      },
      "/araclar/yerel-anahtar-kelime-olusturucu": {
        title: `Yerel Anahtar Kelime Oluşturucu | ${brand}`,
        description: "Sektör ve ilçeye göre satın alma niyetli yerel SEO anahtar kelimelerini ücretsiz üretin.",
        keywords: "anahtar kelime oluşturucu, yerel seo kelime, hatay anahtar kelime, seo kelime üretici",
      },
      "/araclar/yorum-mesaji": {
        title: `Google Yorum Davet Mesajı | ${brand}`,
        description: "Hatay işletmeleri için Google yorum davet WhatsApp ve SMS metni. Sahte puan yok; müşteriye gönderilecek dürüst metin.",
        keywords: "google yorum mesajı, yorum daveti, hatay google maps yorum, whatsapp yorum metni",
      },
      "/araclar/yorum-cevabi": {
        title: `Google Yorum Cevap Şablonu | ${brand}`,
        description: "Hatay işletmeleri için Google yorum yanıtı. Düşük puanda herkese açık tartışma yok; sahte yorum yazılmaz.",
        keywords: "google yorum cevap, işletme yorum yanıtı, hatay maps yorum, yorum şablonu",
      },
      "/araclar/randevu-hatirlatma": {
        title: `Randevu Hatırlatma Metni | ${brand}`,
        description: "Hatay işletmeleri için WhatsApp ve SMS randevu hatırlatması. Toplu spam yok; iptalde saati başkasına açın.",
        keywords: "randevu hatırlatma, whatsapp randevu, sms hatırlatma, hatay diş randevu mesajı",
      },
      "/araclar/qr-menu": {
        title: `QR Menü ve WhatsApp Sipariş Karesi | ${brand}`,
        description: "Restoran ve kafe için masaya konacak QR menü. Müşteri WhatsApp’tan sipariş verir; sahte menü uygulaması yok.",
        keywords: "qr menü, hatay restoran qr, whatsapp sipariş, kafe menü karesi",
      },
      "/araclar/nap-kontrol": {
        title: `NAP Tutarlılık Kontrolü | ${brand}`,
        description: "Google, web sitesi ve kartvizitteki işletme adı, adres ve telefon aynı mı kontrol edin. Yerel SEO için NAP uyumu.",
        keywords: "nap tutarlılık, google işletme adı, hatay yerel seo, adres telefon uyumu",
      },
      "/araclar/utm-link": {
        title: `Reklam UTM Link Oluşturucu | ${brand}`,
        description: "Google Ads ve Instagram kampanyaları için UTM bağlantısı üretin. Tıklamanın hangi ilandan geldiğini ölçün.",
        keywords: "utm oluşturucu, google ads utm, instagram kampanya linki, hatay reklam ölçüm",
      },
      "/araclar/reklam-metni": {
        title: `Google Ads Metin Taslağı | ${brand}`,
        description: "Hatay işletmeleri için Google Ads RSA başlık (30) ve açıklama (90) taslağı. Sıra veya satış garantisi yoktur.",
        keywords: "google ads metin, rsa başlık, reklam açıklama, hatay google ads, reklam karakter limiti",
      },
      "/araclar/sosyal-onizleme": {
        title: `Sosyal Paylaşım Önizlemesi (Open Graph) | ${brand}`,
        description: "WhatsApp ve Facebook kartı için Open Graph meta satırları. Google Ads metni değildir; sıra veya tıklama garantisi yoktur.",
        keywords: "open graph, whatsapp önizleme, facebook paylaşım kartı, og:title, hatay sosyal meta",
      },
      "/araclar/schema": {
        title: `Yerel İşletme Şema Kodu | ${brand}`,
        description: "Hatay işletmeleri için LocalBusiness JSON-LD üretin. Google’a göndermez; kopyalayıp sitenize yapıştırırsınız.",
        keywords: "localbusiness schema, json-ld üretici, hatay seo şema, işletme structured data",
      },
      "/araclar/musteri-linki": {
        title: `WhatsApp Sipariş ve Google Yorum Linki | ${brand}`,
        description: "Hatay işletmeleri için WhatsApp sipariş bağlantısı ve Google yorum yazma linki. 05xx numara 90’a çevrilir; sahte puan basılmaz.",
        keywords: "whatsapp sipariş linki, google yorum linki, hatay whatsapp, place id yorum",
      },
      "/araclar/kartvizit": {
        title: `Dijital Kartvizit (vCard) | ${brand}`,
        description: "Hatay işletmeleri için telefona kaydedilecek vCard. Sunucuya yazılmaz; .vcf dosyasını indirip WhatsApp’tan gönderirsiniz.",
        keywords: "dijital kartvizit, vcard indir, hatay işletme rehber, vcf kartvizit",
      },
      "/araclar/harita-linki": {
        title: `Google Harita ve Yol Tarifi Linki | ${brand}`,
        description: "Hatay işletmeleri için Google Maps arama ve yol tarifi bağlantısı. Konum kaydı oluşturmaz; mevcut haritayı açar.",
        keywords: "google yol tarifi linki, hatay harita bağlantısı, işletme maps linki, yol tarifi whatsapp",
      },
      "/araclar/calisma-saati": {
        title: `Çalışma Saati Metni ve Şema | ${brand}`,
        description: "Hatay işletmeleri için haftalık çalışma saati metni ve Google openingHours satırları. Kapalı günler metinde yazılır.",
        keywords: "çalışma saati metni, openingHours schema, hatay işletme saatleri, google çalışma günleri",
      },
      "/araclar/kapaliyiz": {
        title: `Kapalıyız / Tatil Notu | ${brand}`,
        description: "Hatay işletmeleri için WhatsApp ve Google Maps kapalıyız metni. Sahte açık yazılmaz; tarih ve dönüş net.",
        keywords: "kapalıyız notu, bayram tatil mesajı, google maps kapalı, hatay işletme tatil",
      },
      "/araclar/ozel-ihtiyac-hesaplayici": {
        title: `Özel İhtiyaç Hesaplayıcı | ${brand}`,
        description: "Hatay işletmeleri için web, reklam, harita ve e-ticaret ihtiyacına göre paket önerisi. Sitedeki fiyatlar örnektir; kesin teklif yazılıdır. Sıra garantisi yok.",
        keywords: "hatay paket hesaplayıcı, ihtiyaç hesaplayıcı, hatay web tasarım teklif, google ads paket, e-ticaret ihtiyaç",
      },
      "/google-maps-harita-kaydi": {
        title: `Google Maps Harita Kaydı ve Yerel Görünürlük | ${brand}`,
        description: "Hatay işletmeleri için Google Business Profile kurulumu, harita SEO'su, yerel görünürlük ve gerçek müşteri yorumu yönetimi.",
        keywords: "google maps harita kaydı, hatay harita seo, google işletme profili, haritada üst sıralar, yorum yönetimi",
      },
      "/hesap": {
        title: `Hesap Seçimi — Müşteri, Bayi ve Yönetim | ${brand}`,
        description: "Hatay360 hesap kapıları: müşteri paneli, bayi paneli ve yönetim girişi ayrı tutulur.",
        keywords: "hatay360 giriş, müşteri paneli, bayi paneli, hatay360 hesap",
      },
      "/hatay-kesfet": {
        title: `Hatay Keşif Planlayıcı - İlçeye Göre Öneriler | ${brand}`,
        description: "Hatay'ın ilçelerini kahvaltı, doğa ve aile planlarına göre keşfedin; ihtiyacınıza uygun canlı Google Maps aramalarına ulaşın.",
        keywords: "hatay gezilecek yerler, hatay kahvaltı, hatay doğa, antakya gezi, iskenderun mekan",
      },
      "/hatayda-nerede-kahvalti-yapilir": {
        title: `Hatay'da Nerede Kahvaltı Yapılır? İlçe Rehberi | ${brand}`,
        description: "Antakya, Defne, Arsuz, İskenderun ve diğer ilçelerde kahvaltı mekanı seçerken kullanabileceğiniz yerel karar rehberi.",
        keywords: "hatay kahvaltı yerleri, antakya kahvaltı, arsuz kahvaltı, iskenderun kahvaltı, hatay serpme kahvaltı",
      },
    } as Record<string, { title: string; description: string; keywords: string }>)[pathname];

    if (pathname === "/hatay") {
      title = `Hatay İlçeleri | Web Tasarım ve Reklam | ${brand}`;
      description =
        "Antakya, Defne, İskenderun ve tüm Hatay ilçelerinde web tasarım, reklam ve e-ticaret. İlçenizi seçin.";
      keywords = "hatay web tasarım, hatay reklam, iskenderun web tasarım, antakya web tasarım, defne web tasarım";
      json = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url,
      };
    } else if (district) {
      title = `${district.name} Web Tasarım ve Reklam | ${brand}`;
      description =
        district.blurb ||
        `${district.name} web tasarım, reklam ve e-ticaret. Antakya merkezli ${brand} ile kurumsal site ve Google Ads.`;
      keywords = `${district.name.toLocaleLowerCase("tr-TR")} web tasarım, ${district.name.toLocaleLowerCase("tr-TR")} reklam, ${district.name.toLocaleLowerCase("tr-TR")} e-ticaret, hatay web tasarım`;
      areaServed = ["Hatay", district.name];
      json = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Service",
            name: `${district.name} web tasarım ve reklam`,
            description,
            url,
            areaServed: district.name,
            provider: {
              "@type": "ProfessionalService",
              name: brand,
              telephone: settings.phone,
              email: settings.email,
              address: {
                "@type": "PostalAddress",
                streetAddress: settings.address,
                addressLocality: "Antakya",
                addressRegion: "Hatay",
                addressCountry: "TR",
              },
            },
          },
          buildFaqJsonLd(districtFaqs(district.name, districtAngle(district.name).hook)),
        ],
      };
    } else if (sectorMeta) {
      title = sectorMeta.title;
      description = sectorMeta.description;
      keywords = sectorMeta.keywords;
      areaServed = ["Hatay", "Antakya", "İskenderun"];
      json = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: sectorMeta.title,
        description,
        url,
        areaServed,
        provider: {
          "@type": "ProfessionalService",
          name: brand,
          telephone: settings.phone,
          email: settings.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressLocality: "Antakya",
            addressRegion: "Hatay",
            addressCountry: "TR",
          },
        },
      };
    } else if (toolMeta) {
      title = toolMeta.title;
      description = toolMeta.description;
      keywords = toolMeta.keywords;
      json = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: title,
        description,
        url,
        applicationCategory: pathname.startsWith("/araclar") ? "SEOApplication" : "LocalBusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
      };
      if (pathname === "/google-maps-harita-kaydi") json = attachJsonLdGraph(json, [buildFaqJsonLd(MAPS_FAQS)]);
    } else if (pathname === "/iletisim") {
      const page = settings.seoPages?.iletisim || DEFAULT_SEO_PAGES.iletisim;
      title = page.title || brand;
      description = page.description || "";
      json = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "ProfessionalService",
            name: brand,
            description,
            url: origin,
            telephone: settings.phone,
            email: settings.email,
            address: {
              "@type": "PostalAddress",
              streetAddress: settings.address,
              addressLocality: "Antakya",
              addressRegion: "Hatay",
              addressCountry: "TR",
            },
            openingHours: supportOpeningHoursSchema(settings.supportWeekdayHours, settings.supportSaturdayHours),
            areaServed,
          },
          buildFaqJsonLd(CONTACT_FAQS),
        ],
      };
    } else if (pathname === "/paketler") {
      const page = settings.seoPages?.paketler || DEFAULT_SEO_PAGES.paketler;
      title = page.title || brand;
      description = page.description || "";
      json = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "OfferCatalog",
            name: title,
            description,
            url,
          },
          buildFaqJsonLd(PACKAGE_FAQS),
        ],
      };
    } else if (pathname === "/pazarla") {
      const page = settings.seoPages?.hizmetler || DEFAULT_SEO_PAGES.hizmetler;
      title = page.title || brand;
      description = page.description || "";
      json = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Service",
            name: title,
            description,
            url,
            areaServed,
            provider: { "@type": "ProfessionalService", name: brand },
          },
          buildFaqJsonLd(SERVICE_FAQS),
        ],
      };
    } else {
      const id: SeoPageId = SEO_PATH_MAP[pathname] || "home";
      const page = settings.seoPages?.[id] || DEFAULT_SEO_PAGES[id];
      title = page.title || brand;
      description = page.description || "";
      json = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: brand,
        description,
        url: origin,
        telephone: settings.phone,
        email: settings.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressLocality: "Antakya",
          addressRegion: "Hatay",
          addressCountry: "TR",
        },
        areaServed,
        knowsAbout: ["Hatay web tasarım", "Hatay reklam ajansı", "Google Ads", "Google Maps"],
      };
      if (pathname === "/") json = attachJsonLdGraph(json, [buildFaqJsonLd(CONTACT_FAQS)]);
      if (pathname === "/hakkimizda") json = attachJsonLdGraph(json, [buildFaqJsonLd(ABOUT_FAQS)]);
      if (pathname === "/ozellikler") json = attachJsonLdGraph(json, [buildFaqJsonLd(FEATURE_FAQS)]);
      if (pathname === "/gizlilik") json = attachJsonLdGraph(json, [buildFaqJsonLd(PRIVACY_FAQS)]);
      if (pathname === "/kosullar") json = attachJsonLdGraph(json, [buildFaqJsonLd(TERMS_FAQS)]);
    }

    const crumbs: { name: string; path: string }[] = [{ name: "Ana sayfa", path: "/" }];
    if (pathname === "/hatay") crumbs.push({ name: "Hatay ilçeleri", path: "/hatay" });
    else if (district) crumbs.push({ name: "Hatay ilçeleri", path: "/hatay" }, { name: district.name, path: pathname });
    else if (pathname === "/araclar") crumbs.push({ name: "Araçlar", path: "/araclar" });
    else if (pathname.startsWith("/araclar/") && toolMeta) crumbs.push({ name: "Araçlar", path: "/araclar" }, { name: title.split("|")[0].trim(), path: pathname });
    else if (pathname === "/demolar") crumbs.push({ name: "Demolar", path: "/demolar" });
    else if (pathname === "/iletisim") crumbs.push({ name: "İletişim", path: "/iletisim" });
    else if (pathname === "/paketler") crumbs.push({ name: "Paketler", path: "/paketler" });
    else if (pathname === "/pazarla") crumbs.push({ name: "Pazarla", path: "/pazarla" });
    else if (pathname === "/hakkimizda") crumbs.push({ name: "Hakkımızda", path: "/hakkimizda" });
    else if (pathname === "/kurumsal") crumbs.push({ name: "Kurumsal", path: "/kurumsal" });
    else if (pathname === "/misyon") crumbs.push({ name: "Kurumsal", path: "/kurumsal" }, { name: "Misyon", path: "/misyon" });
    else if (pathname === "/vizyon") crumbs.push({ name: "Kurumsal", path: "/kurumsal" }, { name: "Vizyon", path: "/vizyon" });
    else if (pathname === "/referanslar") crumbs.push({ name: "Referanslar", path: "/referanslar" });
    else if (pathname === "/ozellikler") crumbs.push({ name: "Özellikler", path: "/ozellikler" });
    else if (pathname === "/gizlilik") crumbs.push({ name: "Gizlilik", path: "/gizlilik" });
    else if (pathname === "/kvkk") crumbs.push({ name: "KVKK", path: "/kvkk" });
    else if (pathname === "/mesafeli-satis") crumbs.push({ name: "Mesafeli satış", path: "/mesafeli-satis" });
    else if (pathname === "/kosullar") crumbs.push({ name: "Kullanım koşulları", path: "/kosullar" });
    else if (pathname === "/google-maps-harita-kaydi") crumbs.push({ name: "Google Maps kaydı", path: "/google-maps-harita-kaydi" });
    else if (pathname === "/hatay-kesfet") crumbs.push({ name: "Hatay keşif", path: "/hatay-kesfet" });
    else if (pathname === "/hatayda-nerede-kahvalti-yapilir") crumbs.push({ name: "Hatay keşif", path: "/hatay-kesfet" }, { name: "Kahvaltı rehberi", path: "/hatayda-nerede-kahvalti-yapilir" });
    else if (pathname === "/hesap") crumbs.push({ name: "Hesap", path: "/hesap" });
    if (crumbs.length > 1) json = attachJsonLdGraph(json, [buildBreadcrumbJsonLd(origin, crumbs)]);

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", keywords);
    upsertMeta("name", "robots", "index, follow");
    upsertMeta("name", "geo.region", "TR-31");
    upsertMeta("name", "geo.placename", district?.name || "Hatay");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:locale", "tr_TR");
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", `${origin}/hatay360-logo.png`);
    upsertMeta("property", "og:site_name", brand);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", `${origin}/hatay360-logo.png`);
    upsertLink("canonical", url);

    let script = document.getElementById("hatay360-jsonld") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "hatay360-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(json);
  }, [pathname, settings]);

  return null;
}
