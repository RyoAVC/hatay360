import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { apiRequest } from "../lib/api";

export type PartnerIdentity = {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  website: string;
  commission_rate: number;
  status: string;
};

type PartnerAuthContextType = {
  partner: PartnerIdentity | null;
  isChecking: boolean;
  login: (email: string, password: string, options?: { trustDevice?: boolean }) => Promise<{ trustedIp?: string }>;
  logout: () => Promise<void>;
};

const PartnerAuthContext = createContext<PartnerAuthContextType | undefined>(undefined);

export function PartnerAuthProvider({ children }: { children: ReactNode }) {
  const [partner, setPartner] = useState<PartnerIdentity | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const checkingRef = useRef(false);

  const revalidate = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    try {
      const result = await apiRequest<{ authenticated: boolean; partner: PartnerIdentity | null }>("/api/partners/session");
      setPartner(result.authenticated ? result.partner : null);
    } catch {
      setPartner(null);
    } finally {
      checkingRef.current = false;
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void revalidate();
  }, [revalidate]);

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

  const login = async (email: string, password: string, options?: { trustDevice?: boolean }) => {
    const result = await apiRequest<{ partner: PartnerIdentity; trustedIp?: string }>("/api/partners/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        trustDevice: Boolean(options?.trustDevice),
      }),
    });
    setPartner(result.partner);
    return { trustedIp: result.trustedIp };
  };

  const logout = async () => {
    await apiRequest("/api/partners/logout", { method: "POST" }).catch(() => undefined);
    setPartner(null);
  };

  return <PartnerAuthContext.Provider value={{ partner, isChecking, login, logout }}>{children}</PartnerAuthContext.Provider>;
}

export function usePartnerAuth() {
  const context = useContext(PartnerAuthContext);
  if (!context) throw new Error("usePartnerAuth PartnerAuthProvider içinde kullanılmalıdır.");
  return context;
}
