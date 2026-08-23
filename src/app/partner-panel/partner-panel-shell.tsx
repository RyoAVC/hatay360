import type { ReactNode } from "react";
import {
  Banknote,
  Calculator,
  FileSignature,
  FileText,
  Rocket,
  BriefcaseBusiness,
  BadgeCheck,
  Crown,
  Building2,
  LayoutDashboard,
  Link2,
  LogOut,
  Megaphone,
  ScrollText,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router";
import { SiteLogo } from "../components/site-logo";
import type { PartnerPanelTab } from "./partner-panel-types";

const NAV: { id: PartnerPanelTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Özet", icon: LayoutDashboard },
  { id: "referrals", label: "Müşterilerim", icon: Users },
  { id: "quotes", label: "Teklif oluştur", icon: FileText },
  { id: "calculator", label: "Kazanç simülatörü", icon: Calculator },
  { id: "growthTools", label: "Satış araçları", icon: Rocket },
  { id: "operations", label: "Operasyon merkezi", icon: BriefcaseBusiness },
  { id: "successTools", label: "Müşteri başarı", icon: BadgeCheck },
  { id: "premiumTools", label: "Premium araçlar", icon: Crown },
  { id: "corporateTools", label: "Kurumsal araçlar", icon: Building2 },
  { id: "commissions", label: "Komisyon geçmişi", icon: Banknote },
  { id: "payment", label: "Ödeme talebi", icon: Wallet },
  { id: "terms", label: "Bayilik şartları", icon: ScrollText },
  { id: "contract", label: "Sözleşmem", icon: FileSignature },
  { id: "marketing", label: "Pazarlama", icon: Megaphone },
];

type Props = {
  activeTab: PartnerPanelTab;
  onTabChange: (tab: PartnerPanelTab) => void;
  companyName: string;
  contactName: string;
  onLogout: () => void;
  children: ReactNode;
};

export function PartnerPanelShell({
  activeTab,
  onTabChange,
  companyName,
  contactName,
  onLogout,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-[#0c0a18] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(99,102,241,0.22),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(139,92,246,0.16),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(79,70,229,0.12),transparent_40%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-indigo-500/15 bg-[#12102a]/90 px-5 py-6 lg:w-72 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
          <div className="flex items-center justify-between gap-3 lg:block">
            <SiteLogo variant="onDark" />
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-400/25 px-3 py-2 text-[11px] font-bold text-indigo-100/80 transition hover:border-indigo-300/50 hover:text-white lg:mt-6 lg:w-full lg:justify-center"
            >
              <LogOut className="h-3.5 w-3.5" /> Çıkış
            </button>
          </div>
          <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/70">Bayilik paneli</p>
            <p className="mt-2 text-[15px] font-black leading-tight">{companyName}</p>
            <p className="mt-1 text-[12px] text-indigo-100/55">{contactName}</p>
          </div>
          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible" aria-label="Bayilik menüsü">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-bold transition lg:w-full ${
                    active
                      ? "bg-indigo-500 text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)]"
                      : "text-indigo-100/65 hover:bg-indigo-500/10 hover:text-indigo-50"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-200/50 hover:text-indigo-100"
          >
            <Link2 className="h-3.5 w-3.5" /> hatay360.com
          </Link>
        </aside>
        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
