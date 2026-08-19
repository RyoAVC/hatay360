import { Navigate } from "react-router";
import { usePartnerAuth } from "../context/partner-auth-context";
import { PartnerPortalPage } from "../pages/partner-portal-page";

export function RequirePartner() {
  const { partner, isChecking } = usePartnerAuth();
  if (isChecking) {
    return <div className="flex min-h-screen items-center justify-center bg-[#061a20] text-sm font-bold text-white/70">Firma hesabı kontrol ediliyor…</div>;
  }
  if (!partner) return <Navigate to="/firma/giris" replace />;
  return <PartnerPortalPage />;
}
