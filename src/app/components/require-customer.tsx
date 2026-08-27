import { lazy, Suspense } from "react";
import { Navigate } from "react-router";
import { useCustomerAuth } from "../context/customer-auth-context";

const CustomerPortalPage = lazy(() => import("../pages/customer-portal-page").then((module) => ({ default: module.CustomerPortalPage })));

export function RequireCustomer() {
  const { customer, isChecking } = useCustomerAuth();
  if (isChecking) return <div className="flex min-h-screen items-center justify-center bg-[#061a20] text-sm font-bold text-white/70">Müşteri hesabı kontrol ediliyor…</div>;
  if (!customer) return <Navigate to="/musteri/giris" replace />;
  return (
    <Suspense fallback={<div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center bg-[#061a20] text-sm font-bold text-white/70">Müşteri paneli yükleniyor…</div>}>
      <CustomerPortalPage />
    </Suspense>
  );
}
