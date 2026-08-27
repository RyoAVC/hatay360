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
  BrainCircuit,
  LayoutDashboard,
  Link2,
  LogOut,
  Megaphone,
  ScrollText,
  Users,
  Wallet,
  Bell,
  ChevronRight,
  CircleCheck,
  Sparkles,
  Target,
  LifeBuoy,
} from "lucide-react";
import { Link } from "react-router";
import { SiteLogo } from "../components/site-logo";
import type { PartnerPanelTab } from "./partner-panel-types";

const NAV: { title: string; items: { id: PartnerPanelTab; label: string; icon: typeof LayoutDashboard; accent?: boolean }[] }[] = [
  { title: "Genel", items: [
    { id: "dashboard", label: "Yönetim özeti", icon: LayoutDashboard },
    { id: "crm", label: "CRM satış pipeline", icon: Target, accent: true },
    { id: "support", label: "Destek merkezi", icon: LifeBuoy },
    { id: "referrals", label: "Müşterilerim", icon: Users },
    { id: "quotes", label: "Teklif oluştur", icon: FileText },
  ] },
  { title: "Büyüme merkezi", items: [
    { id: "calculator", label: "Kazanç simülatörü", icon: Calculator },
    { id: "growthTools", label: "Satış araçları", icon: Rocket },
    { id: "operations", label: "Operasyon merkezi", icon: BriefcaseBusiness },
    { id: "successTools", label: "Müşteri başarı", icon: BadgeCheck },
  ] },
  { title: "360° araç seti", items: [
    { id: "premiumTools", label: "Premium araçlar", icon: Crown },
    { id: "corporateTools", label: "Kurumsal araçlar", icon: Building2 },
    { id: "smartTools", label: "Akıllı araçlar", icon: BrainCircuit },
  ] },
  { title: "Finans ve üyelik", items: [
    { id: "commissions", label: "Komisyon geçmişi", icon: Banknote },
    { id: "payment", label: "Ödeme talebi", icon: Wallet },
    { id: "terms", label: "Bayilik şartları", icon: ScrollText },
    { id: "contract", label: "Sözleşmem", icon: FileSignature },
    { id: "marketing", label: "Pazarlama kiti", icon: Megaphone },
  ] },
];

const TAB_LABELS = Object.fromEntries(NAV.flatMap((group) => group.items.map((item) => [item.id, item.label]))) as Record<PartnerPanelTab, string>;

type Props = {
  activeTab: PartnerPanelTab;
  onTabChange: (tab: PartnerPanelTab) => void;
  companyName: string;
  contactName: string;
  onLogout: () => void;
  supportUnread?: number;
  children: ReactNode;
};

export function PartnerPanelShell({
  activeTab,
  onTabChange,
  companyName,
  contactName,
  onLogout,
  supportUnread = 0,
  children,
}: Props) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070a12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_8%_2%,rgba(45,212,191,0.11),transparent_27%),radial-gradient(circle_at_88%_4%,rgba(99,102,241,0.16),transparent_28%),linear-gradient(180deg,#070a12_0%,#0a0b18_52%,#070a12_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-white/[0.07] bg-[#0b0d18]/92 px-4 py-5 backdrop-blur-2xl lg:sticky lg:top-0 lg:h-screen lg:w-[292px] lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-3 lg:block">
            <SiteLogo variant="onDark" />
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-[11px] font-bold text-slate-300 transition hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-100 lg:mt-5 lg:w-full lg:justify-center"
            >
              <LogOut className="h-3.5 w-3.5" /> Çıkış
            </button>
          </div>
          <div className="relative mt-5 overflow-hidden rounded-2xl border border-teal-300/15 bg-gradient-to-br from-teal-400/10 via-indigo-500/10 to-transparent p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-teal-300/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal-300 to-indigo-500 text-sm font-black text-slate-950 shadow-lg shadow-teal-950/40">{companyName.slice(0, 1).toLocaleUpperCase("tr-TR")}</span>
              <div className="min-w-0"><p className="truncate text-[14px] font-black leading-tight">{companyName}</p><p className="mt-1 truncate text-[11px] text-slate-400">{contactName}</p></div>
            </div>
            <div className="relative mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3"><span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300"><CircleCheck className="h-3.5 w-3.5" /> Yetkili bayi</span><Crown className="h-4 w-4 text-amber-300" /></div>
          </div>
          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-5 lg:overflow-visible" aria-label="Bayilik menüsü">
            {NAV.map((group) => <div key={group.title} className="shrink-0"><p className="mb-1.5 hidden px-3 text-[9px] font-black uppercase tracking-[0.22em] text-slate-600 lg:block">{group.title}</p><div className="flex gap-1.5 lg:block lg:space-y-1">{group.items.map((item) => {
              const Icon = item.icon; const active = activeTab === item.id;
              const badge = item.id === "support" ? supportUnread : 0;
              return <button key={item.id} type="button" onClick={() => onTabChange(item.id)} className={`group relative inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[12px] font-bold transition lg:w-full ${active ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_10px_28px_rgba(79,70,229,.28)]" : item.accent ? "border border-teal-300/15 bg-teal-400/[0.07] text-teal-100 hover:bg-teal-400/10" : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100"}`}><span className={`grid h-7 w-7 place-items-center rounded-lg ${active ? "bg-white/15" : "bg-white/[0.04] group-hover:bg-white/[0.07]"}`}><Icon className="h-3.5 w-3.5" /></span><span>{item.label}</span>{badge > 0 ? <span className="ml-auto grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-[0_0_14px_rgba(244,63,94,.55)]">{badge}</span> : active ? <ChevronRight className="ml-auto hidden h-3.5 w-3.5 opacity-65 lg:block" /> : null}</button>;
            })}</div></div>)}
          </nav>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 px-3 text-[11px] font-bold text-slate-600 hover:text-slate-300"
          >
            <Link2 className="h-3.5 w-3.5" /> hatay360.com
          </Link>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="sticky top-0 z-20 hidden h-[74px] items-center justify-between border-b border-white/[0.06] bg-[#090b14]/75 px-8 backdrop-blur-2xl lg:flex xl:px-10">
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Hatay360 bayi yönetimi</p><p className="mt-1 text-sm font-black text-slate-100">{TAB_LABELS[activeTab]}</p></div>
            <div className="flex items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/[0.07] px-3 py-2 text-[10px] font-black text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" /> Sistem aktif</span><button type="button" className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-slate-400 transition hover:text-white"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-teal-300" /></button></div>
          </div>
          <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-7 sm:py-8 lg:px-8 lg:py-9 xl:px-10">
            <div className="mb-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-r from-indigo-500/[0.11] via-violet-500/[0.07] to-teal-400/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] sm:flex sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-teal-200"><Sparkles className="h-4 w-4" /></span><div><p className="text-xs font-black text-slate-100">Büyüme komuta merkezi</p><p className="mt-1 text-[11px] text-slate-500">Satış, operasyon ve müşteri araçlarınız tek panelde.</p></div></div>
              <span className="mt-3 inline-flex rounded-full bg-white/[0.05] px-3 py-1.5 text-[10px] font-bold text-slate-400 sm:mt-0">360° Partner Suite</span>
            </div>
            <div className="[&_header>h1]:bg-gradient-to-r [&_header>h1]:from-white [&_header>h1]:via-slate-100 [&_header>h1]:to-slate-400 [&_header>h1]:bg-clip-text [&_header>h1]:text-transparent [&_section]:shadow-[0_20px_70px_rgba(0,0,0,.18),inset_0_1px_0_rgba(255,255,255,.035)]">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
