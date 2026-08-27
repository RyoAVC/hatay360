import { useEffect } from "react";
import { useLocation } from "react-router";

function normalizePath(pathname: string) {
  let path = String(pathname || "").split("?")[0].split("#")[0];
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

function shouldSkipAnalytics(pathname: string) {
  return (
    pathname.startsWith("/panel") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/musteri") ||
    pathname.startsWith("/bayi") ||
    pathname.startsWith("/partner")
  );
}

export function AnalyticsTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const path = normalizePath(pathname);
    if (shouldSkipAnalytics(path)) return;
    const params = new URLSearchParams(search);
    const timer = window.setTimeout(() => {
      fetch("/api/analytics/pageview", {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          referrer: document.referrer,
          utmSource: params.get("utm_source") || "",
          utmCampaign: params.get("utm_campaign") || "",
        }),
      }).catch(() => undefined);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [pathname, search]);

  return null;
}
