import { useEffect } from "react";
import { useLocation } from "react-router";
import { useContent } from "../context/content-context";
import {
  DEFAULT_SEO_PAGES,
  FEATURED_DISTRICT_NAMES,
  SEO_PATH_MAP,
  findDistrictBySlug,
  resolveDistricts,
  type SeoPageId,
} from "../lib/seo";

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

    if (pathname.startsWith("/panel") || pathname.startsWith("/musteri") || pathname === "/admin") {
      document.title = `${pathname.startsWith("/musteri") ? "Müşteri Paneli" : "Yönetim Paneli"} | ${brand}`;
      upsertMeta("name", "description", "Hatay360 güvenli hesap paneli.");
      upsertMeta("name", "robots", "noindex, nofollow, noarchive");
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
      "/google-maps-harita-kaydi": {
        title: `Google Maps Harita Kaydı ve Yerel Görünürlük | ${brand}`,
        description: "Hatay işletmeleri için Google Business Profile kurulumu, harita SEO'su, yerel görünürlük ve gerçek müşteri yorumu yönetimi.",
        keywords: "google maps harita kaydı, hatay harita seo, google işletme profili, haritada üst sıralar, yorum yönetimi",
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
        knowsAbout: ["Hatay web tasarım", "Hatay reklam ajansı", "Hatay e-ticaret", "Google Ads"],
      };
    }

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
