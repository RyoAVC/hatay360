export type PartnerPanelTab = "dashboard" | "crm" | "support" | "referrals" | "quotes" | "calculator" | "growthTools" | "operations" | "successTools" | "premiumTools" | "corporateTools" | "smartTools" | "commissions" | "payment" | "terms" | "contract" | "marketing";

export type PartnerTier = {
  level: "bronze" | "silver" | "gold";
  label: string;
  nextLabel: string | null;
  current: number;
  target: number;
  progress: number;
};

export type PartnerHubSummary = {
  monthEarnings: number;
  activeReferrals: number;
  pendingBalance: number;
  totalEarned: number;
  commissionRate: number;
  tier: PartnerTier;
};

export type PartnerHubReferral = {
  id: number;
  companyName: string;
  status: "proposal" | "active" | "cancelled";
  statusLabel: string;
  broughtAt: string;
  totalCommission: number;
  service: string;
  phone: string;
  email: string;
};

export type PartnerCommissionRow = {
  id: number;
  date: string;
  customerName: string;
  dealAmount: number;
  commissionRate: number;
  earnings: number;
  paymentStatus: string;
};

export type PartnerPaymentRequest = {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type PartnerHubData = {
  summary: PartnerHubSummary;
  referrals: PartnerHubReferral[];
  commissions: PartnerCommissionRow[];
  referralLinks: { referralUrl: string; referralContactUrl: string };
  referralCode: string;
  paymentRequests: PartnerPaymentRequest[];
};
