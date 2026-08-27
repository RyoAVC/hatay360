import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { usePartnerAuth } from "../context/partner-auth-context";
import { apiRequest } from "../lib/api";
import { PartnerPanelShell } from "./partner-panel-shell";
import { PartnerDashboardSection } from "./partner-dashboard-section";
import { PartnerReferralsSection } from "./partner-referrals-section";
import { PartnerCommissionsSection } from "./partner-commissions-section";
import { PartnerPaymentSection } from "./partner-payment-section";
import { PartnerMarketingSection } from "./partner-marketing-section";
import { PartnerTermsSection } from "./partner-terms-section";
import { PartnerContractSection } from "./partner-contract-section";
import { PartnerEarningsCalculator } from "./partner-earnings-calculator";
import { PartnerQuotesSection } from "./partner-quotes-section";
import { PartnerGrowthToolsSection } from "./partner-growth-tools-section";
import { PartnerOperationsToolsSection } from "./partner-operations-tools-section";
import { PartnerCustomerSuccessTools } from "./partner-customer-success-tools";
import { PartnerPremiumToolsSection } from "./partner-premium-tools-section";
import { PartnerCorporateToolsSection } from "./partner-corporate-tools-section";
import { PartnerSmartToolsSection } from "./partner-smart-tools-section";
import { PartnerCrmSection } from "./partner-crm-section";
import { PartnerSupportCenter } from "./partner-support-center";
import type { PartnerHubData, PartnerPanelTab } from "./partner-panel-types";
import { playNotificationSound } from "../lib/notification-sound";

const PARTNER_TABS: PartnerPanelTab[] = ["dashboard", "crm", "support", "referrals", "quotes", "calculator", "growthTools", "operations", "successTools", "premiumTools", "corporateTools", "smartTools", "commissions", "payment", "terms", "contract", "marketing"];

function readPartnerTab(value: string | null): PartnerPanelTab {
  return PARTNER_TABS.includes(value as PartnerPanelTab) ? (value as PartnerPanelTab) : "dashboard";
}

export function PartnerHubPage() {
  const { partner, logout } = usePartnerAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<PartnerPanelTab>(() => readPartnerTab(new URLSearchParams(window.location.search).get("tab")));
  const [hub, setHub] = useState<PartnerHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [supportUnread, setSupportUnread] = useState(0);
  const previousSupportUnread = useRef<number | null>(null);

  useEffect(() => {
    const nextTab = readPartnerTab(searchParams.get("tab"));
    setTab((current) => (current === nextTab ? current : nextTab));
  }, [searchParams]);

  const handleTabChange = (nextTab: PartnerPanelTab) => {
    setTab(nextTab);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextTab === "dashboard") next.delete("tab");
      else next.set("tab", nextTab);
      return next;
    });
  };

  const loadHub = useCallback(async () => {
    setError("");
    try {
      const data = await apiRequest<PartnerHubData>("/api/partners/hub");
      setHub(data);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Panel verisi yüklenemedi.");
      setHub(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHub();
  }, [loadHub]);

  useEffect(() => {
    const check = async () => {
      try {
        const data = await apiRequest<{ unread: number }>("/api/partners/support/unread");
        if (previousSupportUnread.current !== null && data.unread > previousSupportUnread.current) playNotificationSound("partner");
        previousSupportUnread.current = data.unread;
        setSupportUnread(data.unread);
      } catch { /* Oturum yenilenirken sessizce tekrar dene. */ }
    };
    void check(); const timer = window.setInterval(() => void check(), 10000); return () => window.clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/firma/giris", { replace: true });
  };

  if (!partner) return null;

  return (
    <PartnerPanelShell
      activeTab={tab}
      onTabChange={handleTabChange}
      companyName={partner.company_name}
      contactName={partner.contact_name}
      onLogout={() => void handleLogout()}
      supportUnread={supportUnread}
    >
      {loading ? (
        <p className="text-[14px] font-semibold text-indigo-100/60">Panel yükleniyor…</p>
      ) : error ? (
        <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-[13px] font-semibold text-rose-100">
          {error}
        </p>
      ) : hub ? (
        <>
          {tab === "dashboard" ? <PartnerDashboardSection hub={hub} /> : null}
          {tab === "crm" ? <PartnerCrmSection /> : null}
          {tab === "support" ? <PartnerSupportCenter /> : null}
          {tab === "referrals" ? <PartnerReferralsSection referrals={hub.referrals} onRefresh={loadHub} /> : null}
          {tab === "quotes" ? <PartnerQuotesSection /> : null}
          {tab === "calculator" ? <PartnerEarningsCalculator /> : null}
          {tab === "growthTools" ? <PartnerGrowthToolsSection /> : null}
          {tab === "operations" ? <PartnerOperationsToolsSection /> : null}
          {tab === "successTools" ? <PartnerCustomerSuccessTools /> : null}
          {tab === "premiumTools" ? <PartnerPremiumToolsSection /> : null}
          {tab === "corporateTools" ? <PartnerCorporateToolsSection /> : null}
          {tab === "smartTools" ? <PartnerSmartToolsSection /> : null}
          {tab === "commissions" ? <PartnerCommissionsSection commissions={hub.commissions} /> : null}
          {tab === "payment" ? <PartnerPaymentSection hub={hub} onRefresh={loadHub} /> : null}
          {tab === "terms" ? <PartnerTermsSection /> : null}
          {tab === "contract" ? <PartnerContractSection contactName={partner.contact_name} /> : null}
          {tab === "marketing" ? <PartnerMarketingSection hub={hub} /> : null}
        </>
      ) : null}
    </PartnerPanelShell>
  );
}
