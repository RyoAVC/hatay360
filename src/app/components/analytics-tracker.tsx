import { useEffect } from "react";
import { useLocation } from "react-router";

export function AnalyticsTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/panel") || pathname === "/admin") return;
    const params = new URLSearchParams(search);
    const timer = window.setTimeout(() => {
      fetch("/api/analytics/pageview", {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
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

