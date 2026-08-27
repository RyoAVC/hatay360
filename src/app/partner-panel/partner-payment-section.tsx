import { FormEvent, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { FormError } from "../components/form-error";
import { apiRequest } from "../lib/api";
import type { PartnerHubData } from "./partner-panel-types";
import { formatPartnerDate, formatTry } from "./partner-panel-format";

type Props = {
  hub: PartnerHubData;
  onRefresh: () => Promise<void>;
};

export function PartnerPaymentSection({ hub, onRefresh }: Props) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const pendingRequest = hub.paymentRequests.find((row) => String(row.status).toLowerCase() === "pending");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const value = Number(amount.replace(/\./g, "").replace(",", "."));
      await apiRequest("/api/partners/payment-requests", {
        method: "POST",
        body: JSON.stringify({ amount: value }),
      });
      setNotice("Ödeme talebiniz oluşturuldu. Hatay360 onayından sonra işleme alınır.");
      setAmount("");
      await onRefresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Talep oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Ödeme</p>
        <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Ödeme talebi</h1>
        <p className="mt-2 text-[14px] text-indigo-100/55">Bekleyen komisyon bakiyenizi talep edin.</p>
      </header>

      <article className="rounded-3xl border border-violet-400/25 bg-gradient-to-br from-indigo-600/20 to-violet-700/15 p-6 sm:p-8">
        <p className="text-[11px] font-black uppercase tracking-wider text-indigo-200/70">Çekilebilir bakiye</p>
        <p className="mt-2 text-[42px] font-black tracking-tight">{formatTry(hub.summary.pendingBalance)}</p>
        <p className="mt-2 text-[13px] text-indigo-100/50">Toplam kazanç: {formatTry(hub.summary.totalEarned)}</p>
      </article>

      {pendingRequest ? (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-[13px] font-semibold text-amber-100">
          <Clock className="mr-1 inline h-4 w-4" />
          Bekleyen talep: {formatTry(pendingRequest.amount)} — {formatPartnerDate(pendingRequest.created_at)}
        </div>
      ) : null}

      <form onSubmit={submit} className="rounded-2xl border border-indigo-400/20 bg-[#12102a]/80 p-6">
        <label className="block text-[11px] font-black uppercase tracking-wider text-indigo-200/70">
          Talep tutarı (TL)
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={String(Math.max(0, hub.summary.pendingBalance))}
            className="mt-2 w-full rounded-xl border border-indigo-400/25 bg-[#0c0a18] px-4 py-3 text-[15px] font-bold outline-none focus:border-indigo-400"
          />
        </label>
        {error ? (
          <div className="mt-3">
            <FormError>{error}</FormError>
          </div>
        ) : null}
        {notice ? <p className="mt-3 text-[13px] font-semibold text-emerald-300">{notice}</p> : null}
        <button
          type="submit"
          disabled={busy || hub.summary.pendingBalance < 100 || Boolean(pendingRequest)}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-[13px] font-black text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {busy ? "Gönderiliyor…" : "Ödeme talep et"} <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-3 text-[11px] text-indigo-100/45">Minimum talep 100 TL. Gerçek ödeme admin onayı sonrası yapılır.</p>
      </form>

      {hub.paymentRequests.length ? (
        <div className="rounded-2xl border border-indigo-400/15 overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-indigo-500/10 text-[11px] font-black uppercase tracking-wider text-indigo-200/60">
              <tr>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-400/10">
              {hub.paymentRequests.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-indigo-100/65">{formatPartnerDate(row.created_at)}</td>
                  <td className="px-4 py-3 font-bold">{formatTry(row.amount)}</td>
                  <td className="px-4 py-3 capitalize">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
