import { lazy, Suspense } from "react";
import { micrositeSlugFromHostname } from "../lib/microsites/domain-site";

const HomePage = lazy(() => import("./home").then((m) => ({ default: m.HomePage })));
const MicrositePage = lazy(() => import("./microsite-page").then((m) => ({ default: m.MicrositePage })));

/** Özel alan adı (taxireyhanli.com) ana sayfada microsite; diğer domainlerde Hatay360 home. */
export function DomainGatewayPage() {
  const domainSlug = typeof window !== "undefined" ? micrositeSlugFromHostname(window.location.hostname) : null;
  if (domainSlug) {
    return (
      <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#0b1220] text-white/70">Yükleniyor…</div>}>
        <MicrositePage />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
