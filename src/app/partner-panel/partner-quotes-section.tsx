import { FormEvent, useCallback, useEffect, useState } from "react";
import { Download, FilePlus2, FileText } from "lucide-react";
import { apiRequest } from "../lib/api";
import { formatPartnerDate, formatTry } from "./partner-panel-format";

type Quote = { id: number; customer_name: string; service: string; amount: number; notes: string; status: string; created_at: string };
const SERVICES = ["Kurumsal web sitesi", "E-ticaret kurulumu", "Google Ads yönetimi", "Meta reklam yönetimi", "Google Maps kaydı", "SEO / bakım paketi"];

export function PartnerQuotesSection() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [form, setForm] = useState({ customerName: "", service: SERVICES[0], amount: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try { setQuotes((await apiRequest<{ quotes: Quote[] }>("/api/partners/quotes")).quotes); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Teklifler yüklenemedi."); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      await apiRequest("/api/partners/quotes", { method: "POST", body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
      setForm({ customerName: "", service: SERVICES[0], amount: "", notes: "" });
      setNotice("Teklif oluşturuldu. PDF artık indirilebilir.");
      await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Teklif oluşturulamadı."); }
    finally { setBusy(false); }
  };

  return <div className="space-y-6">
    <header><p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Satış aracı</p><h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Akıllı teklif oluşturucu</h1><p className="mt-2 text-sm text-indigo-100/55">Müşteriniz için kurumsal, indirilebilir teklif hazırlayın.</p></header>
    <form onSubmit={submit} className="rounded-2xl border border-indigo-400/20 bg-[#15122f]/80 p-5">
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-indigo-100/60">Müşteri / firma<input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white" /></label><label className="text-xs font-bold text-indigo-100/60">Hizmet<select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-[#12102a] px-3 py-2.5 text-sm text-white">{SERVICES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-bold text-indigo-100/60">Teklif tutarı (TL)<input required type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white" /></label><label className="text-xs font-bold text-indigo-100/60">Kapsam notu<input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Teslim kapsamı, süre, özel not…" className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white" /></label></div>
      <div className="mt-4 flex flex-wrap items-center gap-3"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50"><FilePlus2 className="h-4 w-4" />{busy ? "Hazırlanıyor…" : "Teklif oluştur"}</button>{notice ? <p className="text-xs font-bold text-indigo-100/70">{notice}</p> : null}</div>
    </form>
    <section><h2 className="mb-3 text-sm font-black">Teklif geçmişi</h2>{quotes.length ? <div className="space-y-2">{quotes.map((quote) => <article key={quote.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-400/15 bg-[#12102a]/60 p-4"><div className="flex items-center gap-3"><span className="rounded-lg bg-indigo-500/15 p-2 text-indigo-300"><FileText className="h-4 w-4" /></span><div><p className="text-sm font-black">{quote.customer_name}</p><p className="mt-0.5 text-[11px] text-indigo-100/45">{quote.service} · {formatPartnerDate(quote.created_at)}</p></div></div><div className="flex items-center gap-3"><b className="text-sm text-violet-100">{formatTry(quote.amount)}</b><a href={`/api/partners/quotes/${quote.id}.pdf`} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300/25 px-3 py-2 text-[11px] font-black text-indigo-100"><Download className="h-3.5 w-3.5" /> PDF</a></div></article>)}</div> : <p className="rounded-xl border border-dashed border-indigo-400/20 p-5 text-sm text-indigo-100/45">Henüz teklif oluşturulmadı.</p>}</section>
  </div>;
}
