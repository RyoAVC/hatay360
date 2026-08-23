import { useAuth } from "../context/auth-context";
import { useCustomerAuth } from "../context/customer-auth-context";
import { usePartnerAuth } from "../context/partner-auth-context";

export type AccountEntry = {
  to: string;
  label: string;
  checking: boolean;
};

/** Public "Hesabım / Giriş" hedefi: misafir → üç kapı hub; oturum varsa kendi portalı. */
export function useAccountEntry(): AccountEntry {
  const { customer, isChecking: customerChecking } = useCustomerAuth();
  const { partner, isChecking: partnerChecking } = usePartnerAuth();
  const { isLoggedIn, isChecking: adminChecking } = useAuth();
  const checking = customerChecking || partnerChecking || adminChecking;
  if (customer) return { to: "/musteri", label: "Hesabım", checking };
  if (partner) return { to: "/firma", label: "Hesabım", checking };
  if (isLoggedIn) return { to: "/panel", label: "Hesabım", checking };
  return { to: "/hesap", label: "Hesabım / Giriş", checking };
}
