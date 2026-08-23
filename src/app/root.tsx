import { useEffect, type MouseEvent } from "react";
import { Outlet, useLocation } from "react-router";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { MascotBot } from "./components/mascot-bot";
import { StickyCta, stickyCtaHiddenOnPath } from "./components/sticky-cta";
import { SiteGlow } from "./components/site-glow";
import { SeoHead } from "./components/seo-head";
import { AnalyticsTracker } from "./components/analytics-tracker";
import { AvcFloatingLock } from "./components/avc-floating-lock";
import { SiteProtect } from "./components/site-protect";
import { sectionOn, settingOn, useContent } from "./context/content-context";
import { isManagedDomainHost } from "./lib/microsites/domain-site";

export default function Root() {
  const { pathname } = useLocation();
  const { settings } = useContent();
  const isPanel = pathname.startsWith("/panel") || pathname.startsWith("/musteri") || pathname.startsWith("/firma");
  const isLiveDemo = pathname.startsWith("/demo/");
  const isMicrosite = pathname.startsWith("/s/") || (typeof window !== "undefined" && isManagedDomainHost(window.location.hostname));
  const stickyAllowed = !stickyCtaHiddenOnPath(pathname);
  const showBot =
    sectionOn(settings, "mascot") && (settingOn(settings, "botMobile") || settingOn(settings, "botDesktop"));
  const showSticky =
    stickyAllowed &&
    sectionOn(settings, "stickyCta") &&
    (settingOn(settings, "stickyPhoneMobile") ||
      settingOn(settings, "stickyPhoneDesktop") ||
      settingOn(settings, "stickyWhatsAppMobile") ||
      settingOn(settings, "stickyWhatsAppDesktop"));
  const mobileStickyPad =
    stickyAllowed &&
    sectionOn(settings, "stickyCta") &&
    (settingOn(settings, "stickyPhoneMobile") || settingOn(settings, "stickyWhatsAppMobile"));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  if (isMicrosite) {
    // Müşteri microsite'ları Hatay360 chrome'u olmadan, kendi SEO head'ini yöneterek render edilir.
    return <Outlet />;
  }

  if (isLiveDemo) {
    return (
      <>
        <SeoHead />
        <SiteProtect />
        <Outlet />
      </>
    );
  }

  if (isPanel) {
    return (
      <>
        <SeoHead />
        <Outlet />
      </>
    );
  }

  const focusMain = (event?: MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault();
    const main = document.getElementById("icerik");
    if (!main) return;
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: "smooth", block: "start" });
    if (typeof window !== "undefined" && window.location.hash !== "#icerik") {
      window.history.replaceState(null, "", `${pathname}#icerik`);
    }
  };

  return (
    <div className={`relative min-h-screen bg-[#f7fbfd] font-[Inter,sans-serif] antialiased ${mobileStickyPad ? "pb-20 md:pb-0" : ""}`}>
      <a
        href="#icerik"
        onClick={focusMain}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-xl focus:bg-[#00a8c4] focus:px-4 focus:py-2 focus:text-[13px] focus:font-black focus:text-white focus:outline-none focus:ring-2 focus:ring-white/80 print:hidden"
      >
        İçeriğe geç
      </a>
      <SiteGlow />
      <SeoHead />
      <AnalyticsTracker />
      <SiteHeader />
      <main id="icerik" tabIndex={-1} className="scroll-mt-4 outline-none focus-visible:ring-2 focus-visible:ring-[#00a8c4]/45 focus-visible:ring-offset-2">
        <Outlet />
      </main>
      <SiteFooter />
      {showBot && <MascotBot />}
      {sectionOn(settings, "floatingLock") && <AvcFloatingLock />}
      {showSticky && <StickyCta />}
      <SiteProtect />
    </div>
  );
}
