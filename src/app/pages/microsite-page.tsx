import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { ManagedSite } from "../lib/site-templates";
import { toTelHref } from "../lib/site-templates";
import {
  enrichTaxireyhanliSite,
  isTaxireyhanliSite,
  requestTaxireyhanliGbpSignup,
  TAXIREYHANLI_SERVICE_AREAS,
} from "../lib/microsites/taxireyhanli-content";
import { micrositeSlugFromHostname } from "../lib/microsites/domain-site";
import { TaxiMicrosite } from "../components/microsites/taxi-microsite";
import { UnderConstruction } from "../components/microsites/under-construction";

type LoadState = "loading" | "ready" | "notfound" | "error";

function setMeta(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setProperty(prop: string, content: string) {
  let el = document.head.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", prop);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

function applyJsonLd(id: string, data: Record<string, unknown> | null) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function buildTaxiJsonLd(site: ManagedSite, url: string) {
  const enriched = isTaxireyhanliSite(site) ? enrichTaxireyhanliSite(site) : site;
  const b = enriched.config.business;
  const tel = toTelHref(b.phone);
  const areaServed = isTaxireyhanliSite(site)
    ? [...TAXIREYHANLI_SERVICE_AREAS, "Hatay", "Reyhanlı"]
    : [b.district, b.city].filter(Boolean);

  const graph: Record<string, unknown>[] = [
    {
      "@type": ["LocalBusiness", "TaxiService"],
      "@id": `${url}#taxi`,
      name: isTaxireyhanliSite(site) ? "Reyhanlı Taksi — Mehmet Y." : b.name,
      alternateName: isTaxireyhanliSite(site) ? ["Reyhanlı taksi", "Hatay Reyhanlı taksi"] : undefined,
      description: enriched.config.seo.description,
      url,
      telephone: tel,
      areaServed: areaServed.map((name) => ({ "@type": "Place", name })),
      address: {
        "@type": "PostalAddress",
        addressLocality: b.district || "Reyhanlı",
        addressRegion: b.city || "Hatay",
        addressCountry: "TR",
        description: b.addressText,
      },
      openingHours: b.hours === "7/24" ? "Mo-Su 00:00-23:59" : b.hours,
      priceRange: "₺₺",
      knowsAbout: isTaxireyhanliSite(site)
        ? ["Reyhanlı taksi", "Reyhanlı taksi telefon", "Cilvegözü taksi", "Reyhanlı şahıs taksi"]
        : undefined,
      employee: isTaxireyhanliSite(site)
        ? {
            "@type": "Person",
            name: "Mehmet Y.",
            jobTitle: "Taksi sürücüsü",
            telephone: tel,
          }
        : undefined,
    },
  ];

  if (enriched.config.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: enriched.config.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function MicrositePage() {
  const { slug: routeSlug } = useParams();
  const domainSlug = typeof window !== "undefined" ? micrositeSlugFromHostname(window.location.hostname) : null;
  const slug = routeSlug || domainSlug || "";
  const [state, setState] = useState<LoadState>("loading");
  const [site, setSite] = useState<ManagedSite | null>(null);

  useEffect(() => {
    if (!slug) {
      setState("notfound");
      return;
    }
    let alive = true;
    setState("loading");
    fetch(`/api/sites/${encodeURIComponent(slug)}`, { headers: { Accept: "application/json" } })
      .then(async (res) => {
        if (res.status === 404) return { notfound: true };
        if (!res.ok) throw new Error("load");
        return res.json();
      })
      .then((data: { notfound?: boolean; site?: ManagedSite }) => {
        if (!alive) return;
        if (data.notfound || !data.site) {
          setState("notfound");
          return;
        }
        const loaded = data.site;
        setSite(isTaxireyhanliSite(loaded) ? enrichTaxireyhanliSite(loaded) : loaded);
        setState("ready");
      })
      .catch(() => {
        if (alive) setState("error");
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (state !== "ready" || !site || !isTaxireyhanliSite(site)) return;
    requestTaxireyhanliGbpSignup();
  }, [state, site]);

  useEffect(() => {
    if (state !== "ready" || !site) return;
    const url = window.location.origin + window.location.pathname;
    const isLive = site.status === "live";
    document.title = site.config.seo.title || site.config.business.name || "Site";
    setMeta("description", site.config.seo.description || "");
    setMeta("keywords", site.config.seo.keywords || "");
    setMeta("robots", isLive ? "index, follow" : "noindex, follow");
    setProperty("og:title", document.title);
    setProperty("og:description", site.config.seo.description || "");
    setProperty("og:type", "website");
    setProperty("og:locale", "tr_TR");
    setProperty("og:url", url);
    setCanonical(url);
    applyJsonLd("microsite-jsonld", isLive && site.category === "taxi" ? buildTaxiJsonLd(site, url) : null);
    return () => {
      applyJsonLd("microsite-jsonld", null);
    };
  }, [state, site]);

  if (state === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0b1220] text-white/70">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (state === "notfound" || state === "error" || !site) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0b1220] px-4 text-center text-white">
        <div>
          <h1 className="text-2xl font-black">Site bulunamadı</h1>
          <p className="mt-2 text-white/60">Bu adres için yayında bir site yok.</p>
          <a href="https://hatay360.com" className="mt-6 inline-block rounded-full bg-[#00a8c4] px-5 py-2.5 text-[14px] font-black">
            Hatay360'a git
          </a>
        </div>
      </div>
    );
  }

  if (site.status === "construction") {
    return <UnderConstruction site={site} />;
  }

  if (site.category === "taxi") {
    return <TaxiMicrosite site={site} />;
  }

  return <UnderConstruction site={site} />;
}
