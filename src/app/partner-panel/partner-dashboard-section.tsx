import { Crown, Sparkles, TrendingUp, Users, Wallet } from "lucide-react";
import type { PartnerHubData } from "./partner-panel-types";
import { formatTry } from "./partner-panel-format";

const TIER_STYLES = {
  bronze: "from-amber-600/30 to-amber-900/20 text-amber-100 border-amber-400/30",
  silver: "from-slate-400/25 to-slate-700/20 text-slate-100 border-slate-300/30",
  gold: "from-violet-400/30 to-indigo-600/25 text-violet-50 border-violet-300/35",
} as const;

export function PartnerDashboardSection({ hub }: { hub: PartnerHubData }) {
  const { summary } = hub;
  const tierStyle = TIER_STYLES[summary.tier.level];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Performans özeti</p>
        <h1 className="mt-2 text-[32px] font-black tracking-[-0.04em] sm:text-[40px]">Bayilik dashboard</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-indigo-100/55">
          Komisyon kazançlarınız, aktif müşterileriniz ve seviye ilerlemeniz burada.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-5">
          <div className="flex items-center gap-2 text-indigo-200/70">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase tracking-wider">Bu ay kazanç</span>
          </div>
          <p className="mt-3 text-[34px] font-black tracking-tight text-white">{formatTry(summary.monthEarnings)}</p>
        </article>
        <article className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-5">
          <div className="flex items-center gap-2 text-violet-200/70">
            <Users className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase tracking-wider">Aktif referans</span>
          </div>
          <p className="mt-3 text-[34px] font-black tracking-tight text-white">{summary.activeReferrals}</p>
        </article>
        <article className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-5">
          <div className="flex items-center gap-2 text-fuchsia-200/70">
            <Wallet className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase tracking-wider">Bekleyen ödeme</span>
          </div>
          <p className="mt-3 text-[34px] font-black tracking-tight text-white">{formatTry(summary.pendingBalance)}</p>
        </article>
        <article className={`rounded-2xl border bg-gradient-to-br p-5 ${tierStyle}`}>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase tracking-wider">Bayi seviyesi</span>
          </div>
          <p className="mt-3 text-[28px] font-black">{summary.tier.label}</p>
        </article>
      </div>

      <article className="rounded-3xl border border-indigo-400/20 bg-[#15122f]/80 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-300/70">Seviye ilerlemesi</p>
            <h2 className="mt-2 text-[22px] font-black">
              {summary.tier.nextLabel
                ? `${summary.tier.nextLabel} seviyesine ${Math.max(0, summary.tier.target - summary.tier.current)} aktif müşteri`
                : "En üst seviyede"}
            </h2>
            <p className="mt-1 text-[13px] text-indigo-100/50">
              Aktif müşteri sayısı: {summary.tier.current}
              {summary.tier.nextLabel ? ` / ${summary.tier.target}` : ""}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/25 bg-indigo-500/15 px-3 py-1 text-[11px] font-black text-indigo-100">
            <Sparkles className="h-3.5 w-3.5" /> Komisyon %{summary.commissionRate}
          </span>
        </div>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-indigo-950/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 transition-all duration-700"
            style={{ width: `${summary.tier.progress}%` }}
          />
        </div>
        <p className="mt-2 text-[12px] font-semibold text-indigo-200/55">{summary.tier.progress}% tamamlandı</p>
      </article>
    </div>
  );
}
