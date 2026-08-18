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
  const isPanel = pathname.startsWith("/panel") || pathname.startsWith("/musteri");
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
      <SiteGlow />
      <SeoHead />
      <AnalyticsTracker />
      <SiteHeader />
      <main>
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
