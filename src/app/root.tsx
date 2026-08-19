import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { MascotBot } from "./components/mascot-bot";
import { StickyCta } from "./components/sticky-cta";
import { SiteGlow } from "./components/site-glow";
import { SeoHead } from "./components/seo-head";
import { AnalyticsTracker } from "./components/analytics-tracker";
import { AvcFloatingLock } from "./components/avc-floating-lock";
import { SiteProtect } from "./components/site-protect";
import { sectionOn, useContent } from "./context/content-context";

export default function Root() {
  const { pathname } = useLocation();
  const { settings } = useContent();
  const isPanel = pathname.startsWith("/panel") || pathname.startsWith("/musteri") || pathname.startsWith("/firma");
  const isLiveDemo = pathname.startsWith("/demo/");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

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

  return (
    <div className="relative min-h-screen bg-[#f7fbfd] pb-20 font-[Inter,sans-serif] antialiased md:pb-0">
      <a href="#icerik" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-xl focus:bg-[#00a8c4] focus:px-4 focus:py-2 focus:text-[13px] focus:font-black focus:text-white print:hidden">
        İçeriğe geç
      </a>
      <SiteGlow />
      <SeoHead />
      <AnalyticsTracker />
      <SiteHeader />
      <main id="icerik">
        <Outlet />
      </main>
      <SiteFooter />
      {sectionOn(settings, "mascot") && <MascotBot />}
      {sectionOn(settings, "floatingLock") && <AvcFloatingLock />}
      {sectionOn(settings, "stickyCta") && <StickyCta />}
      <SiteProtect />
    </div>
  );
}
