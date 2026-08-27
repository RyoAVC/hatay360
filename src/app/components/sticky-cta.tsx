import { MessageCircle, Phone } from "lucide-react";
import { useLocation } from "react-router";
import { sectionOn, settingOn, useContent } from "../context/content-context";
import { toTelHref, toWhatsAppHref } from "../lib/contact";
import { readMapsDraft } from "../lib/maps-signup";
import { DEFAULT_DISTRICTS, findDistrictBySlug } from "../lib/seo";

type StickyRouteCopy = {
  message: string;
  label: string;
  short: string;
};

/** Form / giriş / oturum panellerinde sticky CTA gereksiz. */
export function stickyCtaHiddenOnPath(pathname: string) {
  if (pathname === "/iletisim") return true;
  if (pathname.startsWith("/musteri")) return true;
  if (pathname.startsWith("/firma")) return true;
  if (pathname.startsWith("/panel") || pathname === "/giris" || pathname === "/hesap") return true;
  if (pathname.startsWith("/demo/") && pathname.includes("/panel")) return true;
  return false;
}

function pathSegment(pathname: string, index: number) {
  return pathname.split("/").filter(Boolean)[index] || "";
}

function humanizeSlug(slug: string) {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1))
    .join(" ");
}

function stickyRouteCopy(pathname: string): StickyRouteCopy {
  if (pathname.startsWith("/google-maps-harita-kaydi")) {
    const name = readMapsDraft()?.businessName?.trim() || "";
    if (name.length >= 2) {
      return {
        message: `Merhaba Hatay360, Google Maps kaydı için yazıyorum. İşletme: ${name}`,
        label: "WhatsApp — harita",
        short: "Harita WA",
      };
    }
    return {
      message: "Merhaba Hatay360, Google Maps harita kaydı / yükseltme için yazıyorum.",
      label: "WhatsApp — harita",
      short: "Harita WA",
    };
  }

  if (pathname.startsWith("/paketler")) {
    return {
      message: "Merhaba Hatay360, paketler sayfasından teklif almak istiyorum.",
      label: "WhatsApp — paketler",
      short: "Paket WA",
    };
  }

  if (pathname.startsWith("/araclar")) {
    const tool = pathSegment(pathname, 1);
    if (tool) {
      const title = humanizeSlug(tool);
      return {
        message: `Merhaba Hatay360, «${title}» aracından geldim; işletmem için teklif istiyorum.`,
        label: "WhatsApp — araç",
        short: "Araç WA",
      };
    }
    return {
      message: "Merhaba Hatay360, ücretsiz araçlardan geldim; işletmem için teklif istiyorum.",
      label: "WhatsApp — araçlar",
      short: "Araçlar WA",
    };
  }

  if (pathname.startsWith("/demolar") || pathname.startsWith("/demo/")) {
    const slug = pathSegment(pathname, 1);
    if (pathname.startsWith("/demo/") && slug) {
      const demo = humanizeSlug(slug === "taxi" || slug === "taksi" ? "taksi" : slug);
      return {
        message: `Merhaba Hatay360, «${demo}» demosunu inceledim; benzer site / reklam istiyorum.`,
        label: "WhatsApp — demo",
        short: "Demo WA",
      };
    }
    return {
      message: "Merhaba Hatay360, demolar sayfasından geldim; sektörüme uygun site istiyorum.",
      label: "WhatsApp — demolar",
      short: "Demo WA",
    };
  }

  if (pathname.startsWith("/sektor/")) {
    const slug = pathSegment(pathname, 1);
    const sector =
      slug === "taxi" || slug === "taksi"
        ? "Taksi"
        : slug
          ? humanizeSlug(slug)
          : "sektör";
    return {
      message: `Merhaba Hatay360, ${sector} sektör sayfasından yazıyorum; teklif istiyorum.`,
      label: `WhatsApp — ${sector}`,
      short: "Sektör WA",
    };
  }

  if (pathname.startsWith("/hatay/")) {
    const slug = pathSegment(pathname, 1);
    const district = findDistrictBySlug(DEFAULT_DISTRICTS, slug)?.name || (slug ? humanizeSlug(slug) : "Hatay");
    return {
      message: `Merhaba Hatay360, ${district} için web / reklam / harita teklifi istiyorum.`,
      label: `WhatsApp — ${district}`,
      short: district.length > 12 ? "İlçe WA" : `${district} WA`,
    };
  }

  if (pathname === "/hatay") {
    return {
      message: "Merhaba Hatay360, Hatay ilçe hizmetleri için teklif istiyorum.",
      label: "WhatsApp — Hatay",
      short: "Hatay WA",
    };
  }

  if (pathname.startsWith("/hatay-kesfet") || pathname.startsWith("/hatayda-nerede")) {
    return {
      message: "Merhaba Hatay360, Hatay keşif sayfasından geldim; işletmemi öne çıkarmak istiyorum.",
      label: "WhatsApp — keşif",
      short: "Keşif WA",
    };
  }

  if (pathname.startsWith("/referanslar")) {
    return {
      message: "Merhaba Hatay360, referansları inceledim; benzer bir iş istiyorum.",
      label: "WhatsApp — referans",
      short: "Referans WA",
    };
  }

  if (pathname.startsWith("/hakkimizda") || pathname.startsWith("/kurumsal") || pathname.startsWith("/misyon") || pathname.startsWith("/vizyon")) {
    return {
      message: "Merhaba Hatay360, kurumsal / hakkımızda sayfasından yazıyorum; kısa görüşme istiyorum.",
      label: "WhatsApp — iletişime geç",
      short: "WhatsApp",
    };
  }

  if (pathname.startsWith("/pazarla")) {
    return {
      message: "Merhaba Hatay360, Pazarla (pazaryeri, kardeş ürün) hakkında teklif almak istiyorum.",
      label: "WhatsApp — Pazarla",
      short: "Pazarla WA",
    };
  }

  if (pathname.startsWith("/ozellikler")) {
    return {
      message: "Merhaba Hatay360, web / reklam / Maps teklifi istiyorum.",
      label: "WhatsApp ile teklif iste",
      short: "WhatsApp",
    };
  }

  return {
    message: "Merhaba Hatay360, teklif almak istiyorum.",
    label: "WhatsApp ile teklif iste",
    short: "WhatsApp",
  };
}

export function StickyCta() {
  const { pathname } = useLocation();
  const { settings } = useContent();
  const phoneMobile = settingOn(settings, "stickyPhoneMobile");
  const phoneDesktop = settingOn(settings, "stickyPhoneDesktop");
  const waMobile = settingOn(settings, "stickyWhatsAppMobile");
  const waDesktop = settingOn(settings, "stickyWhatsAppDesktop");
  const botOnDesktop = sectionOn(settings, "mascot") && settingOn(settings, "botDesktop");
  const showMobile = phoneMobile || waMobile;
  const showDesktop = phoneDesktop || waDesktop;

  if (stickyCtaHiddenOnPath(pathname)) return null;
  if (!showMobile && !showDesktop) return null;

  const copy = stickyRouteCopy(pathname);
  const telHref = toTelHref(settings.phone);
  const waHref = toWhatsAppHref(settings.phone, copy.message);

  return (
    <>
      {showMobile ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ecebf5] bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md print:hidden md:hidden">
          <div className="mx-auto flex max-w-lg gap-2">
            {phoneMobile ? (
              <a
                href={telHref}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#ecebf5] text-[#00a8c4]"
                aria-label="Ara"
              >
                <Phone className="h-5 w-5" />
              </a>
            ) : null}
            {waMobile ? (
              <a
                href={waHref}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#00a8c4] text-[15px] font-semibold text-white"
                aria-label={copy.label}
              >
                <MessageCircle className="h-4 w-4" /> {copy.short}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {showDesktop ? (
        <div
          className={`fixed z-40 hidden flex-col gap-2 print:hidden md:flex ${
            botOnDesktop ? "bottom-28 right-6" : "bottom-6 right-6"
          }`}
        >
          {phoneDesktop ? (
            <a
              href={telHref}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ecebf5] bg-white text-[#00a8c4] shadow-[0_10px_28px_rgba(15,23,42,0.16)]"
              aria-label="Ara"
            >
              <Phone className="h-5 w-5" />
            </a>
          ) : null}
          {waDesktop ? (
            <a
              href={waHref}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00a8c4] text-white shadow-[0_10px_28px_rgba(0,168,196,0.35)]"
              aria-label={copy.label}
              title={copy.label}
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
