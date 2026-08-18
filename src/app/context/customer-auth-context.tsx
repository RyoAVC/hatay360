import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerIdentity | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    apiRequest<{ authenticated: boolean; customer: CustomerIdentity | null }>("/api/customer/session")
      .then((result) => setCustomer(result.authenticated ? result.customer : null))
      .catch(() => setCustomer(null))
      .finally(() => setIsChecking(false));
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiRequest<{ customer: CustomerIdentity }>("/api/customer/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setCustomer(result.customer);
  };

  const logout = async () => {
    await apiRequest("/api/customer/logout", { method: "POST" }).catch(() => undefined);
    setCustomer(null);
  };

  return <CustomerAuthContext.Provider value={{ customer, isChecking, login, logout }}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error("useCustomerAuth CustomerAuthProvider içinde kullanılmalıdır.");
  return context;
}
