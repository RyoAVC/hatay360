import { lazy, Suspense } from "react";
import { Navigate } from "react-router";
import { usePartnerAuth } from "../context/partner-auth-context";

const PartnerHubPage = lazy(() => import("../partner-panel/partner-hub-page").then((module) => ({ default: module.PartnerHubPage })));

export function RequirePartner() {
  const { partner, isChecking } = usePartnerAuth();
  if (isChecking) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0c0a18] text-sm font-bold text-indigo-100/70">Firma hesabı kontrol ediliyor…</div>;
  }
  if (!partner) return <Navigate to="/firma/giris" replace />;
  return (
    <Suspense fallback={<div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center bg-[#0c0a18] text-sm font-bold text-indigo-100/70">Bayi paneli yükleniyor…</div>}>
      <PartnerHubPage />
    </Suspense>
  );
}
