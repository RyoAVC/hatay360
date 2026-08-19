import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Eye, Globe2, RefreshCw, TrendingUp, UserRoundCheck, Users } from "lucide-react";
import { apiRequest } from "../lib/api";
import { FormError } from "../components/form-error";

type Summary = {
  totals: { totalViews: number; todayViews: number; uniqueToday: number; unique30d: number };
  topPages: Array<{ path: string; views: number }>;
  districts: Array<{ district: string; views: number }>;
  referrers: Array<{ referrer: string; views: number }>;
  daily: Array<{ day: string; views: number; visitors: number }>;
  leadStats: { total: number; newCount: number; last7d: number };
  loginStats: { attempts: number; successes: number };
};

type LeadStatus = "new" | "contacted" | "won" | "closed";
type Lead = {
  id: number;
  name: string;
  phone: string;
  service: string;
  source_path: string;
  status: LeadStatus;
  created_at: string;
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Yeni",
  contacted: "Arandı",
  won: "Müşteri oldu",
  closed: "Kapatıldı",
};

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("tr-TR").format(Number(value || 0));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function AdminInsightsPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryResult, leadsResult] = await Promise.all([
        apiRequest<Summary>("/api/analytics/summary"),
        apiRequest<{ leads: Lead[] }>("/api/leads"),
      ]);
      setSummary(summaryResult);
      setLeads(leadsResult.leads);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Metrikler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const maxDaily = useMemo(() => Math.max(1, ...(summary?.daily.map((item) => item.views) || [1])), [summary]);

  const updateLead = async (id: number, status: LeadStatus) => {
    const previous = leads;
    setLeads((items) => items.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    try {
      await apiRequest<{ ok: boolean }>(`/api/leads/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (updateError) {
      setLeads(previous);
      setError(updateError instanceof Error ? updateError.message : "Başvuru durumu güncellenemedi.");
    }
  };

  if (loading && !summary) {
    return <div className="mt-8 rounded-3xl border border-white/10 bg-[#18181f] p-8 text-center text-sm font-bold text-white/60">Metrikler hazırlanıyor…</div>;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#3ec8dc]">Hatay360 gerçek verileri</p>
          <h2 className="mt-1 text-[26px] font-black text-white">Ziyaret, ilçe ilgisi ve müşteri başvuruları</h2>
          <p className="mt-1 max-w-3xl text-[13px] text-white/55">Kişisel IP adresi saklanmaz. Günlük anonim ziyaretçi özeti, sayfalar, Hatay ilçeleri ve form başvuruları ölçülür.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-white/10">
          <RefreshCw className="h-4 w-4" /> Yenile
        </button>
      </div>

      {error && <FormError tone="dark">{error}</FormError>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {[
          { label: "Bugünkü hit", value: summary?.totals.todayViews, icon: Eye, tone: "text-cyan-300" },
          { label: "Bugün tekil", value: summary?.totals.uniqueToday, icon: Users, tone: "text-emerald-300" },
          { label: "30 gün tekil", value: summary?.totals.unique30d, icon: TrendingUp, tone: "text-violet-300" },
          { label: "Toplam hit", value: summary?.totals.totalViews, icon: BarChart3, tone: "text-blue-300" },
          { label: "Yeni başvuru", value: summary?.leadStats.newCount, icon: UserRoundCheck, tone: "text-amber-300" },
          { label: "7 gün giriş", value: summary?.loginStats.successes, icon: Globe2, tone: "text-pink-300" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-[#18181f] p-4 shadow-lg">
            <item.icon className={`h-5 w-5 ${item.tone}`} />
            <p className="mt-4 text-[28px] font-black text-white">{formatNumber(item.value)}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/45">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-3xl border border-white/10 bg-[#18181f] p-5 sm:p-6">
          <h3 className="text-[17px] font-black text-white">Son 30 gün ziyaret akışı</h3>
          <div className="mt-5 flex h-52 items-end gap-1.5 overflow-x-auto border-b border-white/10 pb-2">
            {(summary?.daily || []).length ? summary?.daily.map((item) => (
              <div key={item.day} className="group flex min-w-5 flex-1 flex-col items-center justify-end gap-1" title={`${item.day}: ${item.views} hit / ${item.visitors} tekil`}>
                <span className="text-[9px] font-bold text-white/0 transition group-hover:text-white/70">{item.views}</span>
                <div className="w-full min-w-3 rounded-t bg-gradient-to-t from-[#00a8c4] to-[#7ee0ec]" style={{ height: `${Math.max(6, (item.views / maxDaily) * 165)}px` }} />
              </div>
            )) : <p className="m-auto text-sm text-white/45">Henüz ziyaret verisi yok.</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#18181f] p-5 sm:p-6">
          <h3 className="text-[17px] font-black text-white">Hatay ilçe ilgi sırası</h3>
          <p className="mt-1 text-[12px] text-white/45">İlçe sayfalarına gelen gerçek hitlere göre sıralanır.</p>
          <div className="mt-4 space-y-2">
            {(summary?.districts || []).length ? summary?.districts.map((item, index) => (
              <div key={item.district} className="flex items-center justify-between rounded-xl bg-black/25 px-3 py-2.5">
                <span className="text-[13px] font-bold text-white"><span className="mr-2 text-[#3ec8dc]">#{index + 1}</span>{item.district.replace(/-/g, " ")}</span>
                <span className="text-[12px] font-black text-white/60">{formatNumber(item.views)} hit</span>
              </div>
            )) : <p className="rounded-xl bg-black/20 p-4 text-center text-[12px] text-white/40">İlçe verisi birikmeye başladığında burada görünecek.</p>}
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[
          { title: "En çok ziyaret edilen sayfalar", items: (summary?.topPages || []).map((item) => ({ label: item.path, views: item.views })), empty: "Henüz sayfa verisi yok." },
          { title: "Ziyaret kaynakları", items: (summary?.referrers || []).map((item) => ({ label: item.referrer, views: item.views })), empty: "Henüz kaynak verisi yok." },
        ].map((group) => (
          <section key={group.title} className="rounded-3xl border border-white/10 bg-[#18181f] p-5 sm:p-6">
            <h3 className="text-[17px] font-black text-white">{group.title}</h3>
            <div className="mt-4 space-y-2">
              {group.items.length ? group.items.map((item) => {
                return <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-black/25 px-3 py-2.5"><span className="truncate text-[12px] font-bold text-white/75">{item.label === "direct" ? "Doğrudan giriş" : item.label}</span><span className="shrink-0 text-[12px] font-black text-[#7ee0ec]">{formatNumber(item.views)}</span></div>;
              }) : <p className="rounded-xl bg-black/20 p-4 text-center text-[12px] text-white/40">{group.empty}</p>}
            </div>
          </section>
        ))}
      </div>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#18181f]">
        <div className="border-b border-white/10 p-5 sm:p-6"><h3 className="text-[17px] font-black text-white">Müşteri ve teklif başvuruları</h3><p className="mt-1 text-[12px] text-white/45">İletişim formunu tamamlayan ziyaretçiler veritabanına kaydedilir.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[12px]">
            <thead className="bg-black/25 text-white/45"><tr><th className="px-5 py-3">Tarih</th><th className="px-5 py-3">Müşteri</th><th className="px-5 py-3">Telefon</th><th className="px-5 py-3">Hizmet</th><th className="px-5 py-3">Kaynak</th><th className="px-5 py-3">Durum</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => (
                <tr key={lead.id} className="text-white/75 hover:bg-white/[0.03]">
                  <td className="whitespace-nowrap px-5 py-3">{formatDate(lead.created_at)}</td><td className="px-5 py-3 font-bold text-white">{lead.name}</td><td className="px-5 py-3"><a className="text-[#7ee0ec] hover:underline" href={`tel:${lead.phone}`}>{lead.phone}</a></td><td className="px-5 py-3">{lead.service}</td><td className="px-5 py-3">{lead.source_path}</td>
                  <td className="px-5 py-3"><select value={lead.status} onChange={(event) => void updateLead(lead.id, event.target.value as LeadStatus)} className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-bold text-white">{(Object.keys(STATUS_LABELS) as LeadStatus[]).map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></td>
                </tr>
              ))}
              {!leads.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-white/40">Henüz müşteri başvurusu yok.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
