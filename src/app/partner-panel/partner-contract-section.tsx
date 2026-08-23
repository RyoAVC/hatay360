import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSignature } from "lucide-react";
import { apiRequest } from "../lib/api";
import type { BayilikSartlari } from "../lib/bayilik-sartlari";
import { formatTry } from "./partner-panel-format";

type ContractData = {
  title: string;
  legalTextReady: boolean;
  legalNotice: string;
  terms: BayilikSartlari;
  acceptance: { id: number; full_name: string; accepted_at: string; terms_updated_at: string } | null;
};

export function PartnerContractSection({ contactName }: { contactName: string }) {
  const [data, setData] = useState<ContractData | null>(null);
  const [fullName, setFullName] = useState(contactName);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await apiRequest<ContractData>("/api/partners/contract"));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Sözleşme yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const result = await apiRequest<ContractData>("/api/partners/contract/accept", {
        method: "POST",
        body: JSON.stringify({ fullName, accepted }),
      });
      setData(result);
      setNotice("Dijital onayınız tarih ve IP kaydıyla saklandı.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Onay kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  if (busy && !data) return <p className="text-sm font-semibold text-indigo-100/60">Sözleşme yükleniyor…</p>;
  if (!data) return <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{notice}</p>;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Dijital sözleşme</p>
        <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">{data.title}</h1>
        <p className="mt-2 text-sm text-indigo-100/55">Şartları inceleyin, PDF önizlemesini indirin ve hazır olduğunda panelden onaylayın.</p>
      </header>

      {!data.legalTextReady ? (
        <div className="flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div><p className="text-sm font-black">Hukuki metin bekleniyor</p><p className="mt-1 text-xs leading-relaxed text-amber-100/70">{data.legalNotice}</p></div>
        </div>
      ) : null}

      <section className="rounded-2xl border border-indigo-400/15 bg-[#12102a]/60 p-5">
        <div className="flex items-center gap-2"><FileSignature className="h-5 w-5 text-indigo-300" /><h2 className="font-black">Ticari şart özeti</h2></div>
        <p className="mt-4 text-sm text-indigo-100/70">Katılım: <b className="text-white">{formatTry(data.terms.katilimUcretiTl)}</b> · Ödeme: <b className="text-white">{data.terms.odemePeriyodu}</b></p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {data.terms.kategoriler.map((item) => <div key={item.id} className="rounded-xl border border-indigo-400/10 bg-indigo-500/5 p-3 text-xs"><b>{item.ad}</b><span className="float-right font-black text-violet-200">%{item.komisyonOrani}</span></div>)}
        </div>
        <a href="/api/partners/contract.pdf" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-indigo-300/25 px-4 py-2.5 text-xs font-black text-indigo-100 hover:bg-indigo-500/10"><Download className="h-4 w-4" /> PDF önizlemesini indir</a>
      </section>

      {data.acceptance ? (
        <div className="flex gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-100"><CheckCircle2 className="h-5 w-5" /><div><p className="font-black">Sözleşme onaylandı</p><p className="mt-1 text-xs text-emerald-100/70">{data.acceptance.full_name} · {new Date(data.acceptance.accepted_at).toLocaleString("tr-TR")}</p></div></div>
      ) : (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-indigo-400/15 bg-[#12102a]/60 p-5">
          <label className="block text-xs font-bold text-indigo-100/70">Onaylayan ad soyad<input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!data.legalTextReady} className="mt-2 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white disabled:opacity-50" /></label>
          <label className="flex items-start gap-3 text-xs leading-relaxed text-indigo-100/70"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} disabled={!data.legalTextReady} className="mt-0.5" /><span>Sözleşme metnini ve ticari şartları okudum, kabul ediyorum. Onayın tarih, IP ve oturum bilgisiyle kaydedileceğini biliyorum.</span></label>
          <button disabled={busy || !data.legalTextReady || !accepted || fullName.trim().length < 3} className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{busy ? "Kaydediliyor…" : "Dijital olarak onayla"}</button>
          {notice ? <p className="text-xs font-bold text-amber-200">{notice}</p> : null}
        </form>
      )}
    </div>
  );
}
