import { Navigate } from "react-router";
import { usePartnerAuth } from "../context/partner-auth-context";
import { PartnerHubPage } from "../partner-panel/partner-hub-page";

export function RequirePartner() {
  const { partner, isChecking } = usePartnerAuth();
  if (isChecking) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0c0a18] text-sm font-bold text-indigo-100/70">Firma hesabı kontrol ediliyor…</div>;
  }
  if (!partner) return <Navigate to="/firma/giris" replace />;
  return <PartnerHubPage />;
}
