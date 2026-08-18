import { Navigate } from "react-router";
import { useAuth } from "../context/auth-context";
import { AdminPage } from "../pages/admin-page";

export function RequireAuth() {
  const { isLoggedIn, isChecking } = useAuth();

  if (isChecking) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0f0f12] text-sm font-bold text-white/70">Panel oturumu kontrol ediliyor…</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/panel/giris" replace />;
  }

  return <AdminPage />;
}
