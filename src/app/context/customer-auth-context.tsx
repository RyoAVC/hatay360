import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { apiRequest } from "../lib/api";

export type CustomerIdentity = {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
};

type CustomerAuthContextType = {
  customer: CustomerIdentity | null;
  isChecking: boolean;
  login: (email: string, password: string) => Promise<{ needsOtp: boolean }>;
  completeLoginOtp: (code: string) => Promise<void>;
  logout: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerIdentity | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const checkingRef = useRef(false);

  const revalidate = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    try {
      const result = await apiRequest<{ authenticated: boolean; customer: CustomerIdentity | null }>("/api/customer/session");
      setCustomer(result.authenticated ? result.customer : null);
    } catch {
      setCustomer(null);
    } finally {
      checkingRef.current = false;
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void revalidate();
  }, [revalidate]);

  // Sekme/geri-ileri (bfcache) durumunda eski oturum görüntüsünü engelle:
  // sayfa bfcache'ten dönerse veya sekme tekrar görünür olursa oturumu sunucudan yeniden doğrula.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void revalidate();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void revalidate();
    };
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [revalidate]);

  const login = async (email: string, password: string) => {
    const result = await apiRequest<{ customer?: CustomerIdentity; needsOtp?: boolean }>("/api/customer/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (result.needsOtp) return { needsOtp: true };
    if (result.customer) setCustomer(result.customer);
    return { needsOtp: false };
  };

  const completeLoginOtp = async (code: string) => {
    const result = await apiRequest<{ customer: CustomerIdentity }>("/api/customer/login/otp", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    setCustomer(result.customer);
  };

  const logout = async () => {
    await apiRequest("/api/customer/logout", { method: "POST" }).catch(() => undefined);
    setCustomer(null);
  };

  return <CustomerAuthContext.Provider value={{ customer, isChecking, login, completeLoginOtp, logout }}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error("useCustomerAuth CustomerAuthProvider içinde kullanılmalıdır.");
  return context;
}
