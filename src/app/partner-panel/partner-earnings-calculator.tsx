import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { createExampleBayilikSartlari, getBayilikSartlari, TEKRAR_TIPI_LABEL, type BayilikSartlari } from "../lib/bayilik-sartlari";
import { DEFAULT_BRAND_ID } from "../lib/brand-config";
import { formatTry } from "./partner-panel-format";

export function PartnerEarningsCalculator() {
  const [terms, setTerms] = useState<BayilikSartlari>(() => createExampleBayilikSartlari(DEFAULT_BRAND_ID));
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getBayilikSartlari(DEFAULT_BRAND_ID, "partners")
      .then(setTerms)
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => terms.kategoriler.map((item) => {
    const price = Math.max(0, Number(prices[item.id] || 0));
    const count = Math.max(0, Math.floor(Number(counts[item.id] || 0)));
    return { ...item, price, count, sales: price * count, earnings: price * count * item.komisyonOrani / 100 };
  }), [terms, prices, counts]);
  const totalSales = rows.reduce((sum, row) => sum + row.sales, 0);
  const totalEarnings = rows.reduce((sum, row) => sum + row.earnings, 0);
  const monthlyEarnings = rows.filter((row) => row.tekrarTipi === "aylik_tekrarlayan").reduce((sum, row) => sum + row.earnings, 0);

  return (
    <div className="space-y-6">
      <header><p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Satış planlama</p><h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Kazanç simülatörü</h1><p className="mt-2 text-sm text-indigo-100/55">Satış hedefinizi girin; güncel bayi oranlarıyla tahmini kazancınızı görün.</p></header>
      {terms.ornekPlaceholder ? <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs font-bold text-amber-100">Oranlar henüz örnek değerlerdir; resmi kazanç taahhüdü değildir.</p> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-5"><p className="text-[10px] font-black uppercase tracking-wider text-indigo-200/60">Toplam satış</p><p className="mt-2 text-2xl font-black">{formatTry(totalSales)}</p></article>
        <article className="rounded-2xl border border-violet-400/25 bg-violet-500/10 p-5"><p className="text-[10px] font-black uppercase tracking-wider text-violet-200/60">Tahmini kazanç</p><p className="mt-2 text-2xl font-black text-violet-100">{formatTry(totalEarnings)}</p></article>
        <article className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-5"><p className="text-[10px] font-black uppercase tracking-wider text-fuchsia-200/60">Aylık tekrarlayan</p><p className="mt-2 text-2xl font-black text-fuchsia-100">{formatTry(monthlyEarnings)}</p></article>
      </div>
      <section className="space-y-3">
        {rows.map((row) => <article key={row.id} className="rounded-2xl border border-indigo-400/15 bg-[#12102a]/60 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-sm font-black">{row.ad}</h2><p className="mt-1 text-[11px] text-indigo-100/45">{TEKRAR_TIPI_LABEL[row.tekrarTipi]} · Komisyon %{row.komisyonOrani}</p></div><p className="text-sm font-black text-violet-200">+{formatTry(row.earnings)}</p></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-[11px] font-bold text-indigo-100/60">Satış bedeli (TL)<input type="number" min="0" value={prices[row.id] || ""} onChange={(e) => setPrices((old) => ({ ...old, [row.id]: Number(e.target.value) }))} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white" placeholder="0" /></label><label className="text-[11px] font-bold text-indigo-100/60">Satış adedi<input type="number" min="0" step="1" value={counts[row.id] || ""} onChange={(e) => setCounts((old) => ({ ...old, [row.id]: Number(e.target.value) }))} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white" placeholder="0" /></label></div>
        </article>)}
      </section>
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4"><Sparkles className="h-5 w-5 shrink-0 text-indigo-300" /><p className="text-xs leading-relaxed text-indigo-100/65">{loading ? "Güncel oranlar yükleniyor…" : "Bu hesap bilgilendirme amaçlıdır. Kesin kazanç, onaylanan satış ve ödeme kayıtlarına göre oluşur."}</p></div>
    </div>
  );
}
