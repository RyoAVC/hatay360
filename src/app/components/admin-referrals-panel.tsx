import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Gift, RefreshCw, Search } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";

type ReferralRow = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  kind?: string;
  status?: string;
  service?: string;
  referral_code?: string;
  referred_by_customer_id?: number | null;
  referral_rewarded?: number;
  created_at: string;
  referrer_company_name?: string | null;
  referrer_contact_name?: string | null;
};

const KIND_LABELS: Record<string, string> = {
  callback: "Sizi arayalım",
  maps: "Harita kaydı",
  new_customer: "Yeni müşteri",
  partner: "Bayi",
  partner_referral: "Bayi yönlendirme",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  contacted: "Arandı",
  won: "Müşteri oldu",
  closed: "Kapatıldı",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function AdminReferralsPanel() {
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [q, setQ] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(0);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      const result = await apiRequest<{ referrals: ReferralRow[] }>(
        `/api/admin/referrals${params.toString() ? `?${params.toString()}` : ""}`,
      );
      setRows(result.referrals || []);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Tavsiyeler yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    void load();
  }, [load]);

  const markReward = async (id: number) => {
    setBusyId(id);
    try {
      await apiRequest(`/api/admin/leads/${id}/referral-reward`, { method: "POST", body: "{}" });
      setRows((current) => current.map((row) => (row.id === id ? { ...row, referral_rewarded: 1 } : row)));
      setNotice("Ödül işaretlendi. Fatura indirimi otomatik uygulanmaz.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ödül işaretlenemedi.");
    } finally {
      setBusyId(0);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Müşteri tavsiyesi</p>
          <h2 className="mt-1 text-[22px] font-black text-white">Tavsiyeler</h2>
          <p className="mt-1 max-w-xl text-[12px] font-bold text-white/50">
            Müşteri linkiyle gelen kayıtlar. Bayi yönlendirmesi (/firma) ayrıdır. Ödül/indirim yalnızca manuel işaretlenir.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black text-white hover:bg-white/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} /> Yenile
        </button>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSearchTerm(q.trim());
        }}
      >
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="İsim, telefon, kod, tavsiye eden…"
            className="w-full rounded-xl border border-white/15 bg-black/35 py-2.5 pl-9 pr-3 text-[12px] font-bold text-white outline-none focus:border-[#00a8c4]"
          />
        </label>
        <button type="submit" className="rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black text-white">
          Ara
        </button>
      </form>

      {notice ? <p className="text-[12px] font-bold text-[#7ee0ec]">{notice}</p> : null}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#18181f]">
        {!rows.length ? (
          <div className="p-6">
            <EmptyRow dark icon={Gift} title="Tavsiye kaydı yok" hint="Müşteri portalındaki tavsiye linkiyle gelen başvurular burada görünür." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-[12px]">
              <thead className="bg-black/25 text-white/45">
                <tr>
                  <th className="px-5 py-3">Tarih</th>
                  <th className="px-5 py-3">Kim getirdi</th>
                  <th className="px-5 py-3">Lead / müşteri</th>
                  <th className="px-5 py-3">Kod</th>
                  <th className="px-5 py-3">Ödül</th>
                  <th className="px-5 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row) => {
                  const rewarded = Number(row.referral_rewarded) === 1;
                  return (
                    <tr key={row.id} className="align-top text-white/75 hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-5 py-3">{formatDate(row.created_at)}</td>
                      <td className="px-5 py-3">
                        <p className="font-black text-white">{row.referrer_company_name || "—"}</p>
                        {row.referrer_contact_name ? (
                          <p className="text-[10px] text-white/40">{row.referrer_contact_name}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-white">{row.name}</p>
                        <p className="text-[10px] text-white/40">{row.phone}</p>
                        <p className="mt-1 text-[10px] font-black text-[#7ee0ec]">
                          {KIND_LABELS[row.kind || ""] || row.kind || "Lead"} · {STATUS_LABELS[row.status || ""] || row.status}
                        </p>
                      </td>
                      <td className="px-5 py-3 font-black tracking-wide text-[#70dce9]">{row.referral_code || "—"}</td>
                      <td className="px-5 py-3">
                        {rewarded ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-950/40 px-2 py-1 text-[10px] font-black text-emerald-100">
                            <CheckCircle2 className="h-3 w-3" /> İşaretli
                          </span>
                        ) : (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black text-white/45">
                            Bekliyor
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          disabled={rewarded || busyId === row.id}
                          onClick={() => void markReward(row.id)}
                          className="rounded-xl border border-amber-300/30 bg-amber-950/40 px-3 py-1.5 text-[10px] font-black text-amber-100 disabled:opacity-40"
                        >
                          {rewarded ? "Ödül uygulandı" : busyId === row.id ? "İşaretleniyor…" : "Ödülü işaretle"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
