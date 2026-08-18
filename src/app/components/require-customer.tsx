import { Navigate } from "react-router";
import { useCustomerAuth } from "../context/customer-auth-context";
import { CustomerPortalPage } from "../pages/customer-portal-page";

export function RequireCustomer() {
  const { customer, isChecking } = useCustomerAuth();
  if (isChecking) return <div className="flex min-h-screen items-center justify-center bg-[#061a20] text-sm font-bold text-white/70">Müşteri hesabı kontrol ediliyor…</div>;
  if (!customer) return <Navigate to="/musteri/giris" replace />;
  return <CustomerPortalPage />;
}
