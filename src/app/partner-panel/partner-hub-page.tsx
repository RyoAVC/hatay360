import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
import type { PartnerHubData, PartnerPanelTab } from "./partner-panel-types";

export function PartnerHubPage() {
  const { partner, logout } = usePartnerAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<PartnerPanelTab>("dashboard");
  const [hub, setHub] = useState<PartnerHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleLogout = async () => {
    await logout();
    navigate("/firma/giris", { replace: true });
  };

  if (!partner) return null;

  return (
    <PartnerPanelShell
      activeTab={tab}
      onTabChange={setTab}
      companyName={partner.company_name}
      contactName={partner.contact_name}
      onLogout={() => void handleLogout()}
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
          {tab === "referrals" ? <PartnerReferralsSection referrals={hub.referrals} /> : null}
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
