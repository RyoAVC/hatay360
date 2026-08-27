import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";
import { SEO_RANK_WAIT_MESSAGE, hasSeoSnapshot, type SeoKeywordRow } from "../lib/seo-rank";

export function AdminSeoTrackPanel() {
  const [rows, setRows] = useState<SeoKeywordRow[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const result = await apiRequest<{ keywords: SeoKeywordRow[]; connected?: boolean; message?: string }>(
        "/api/admin/seo-keywords",
      );
      setRows(result.keywords || []);
      setConnected(Boolean(result.connected));
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "SEO kelimeleri yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Sıralama iskeleti</p>
        <h2 className="mt-1 text-[22px] font-black text-white">SEO Takip</h2>
        <p className="mt-1 max-w-xl text-[12px] font-bold text-white/50">
          Kelimeler kaydedilir; konumlar API anahtarı bağlanınca haftalık dolar. SerpApi çağrısı yok, uydurma sıra yok.
        </p>
        <p className="mt-2 text-[11px] font-bold text-white/40">
          Google API: {connected ? "bağlı" : "bekleniyor"} · {SEO_RANK_WAIT_MESSAGE}
        </p>
      </div>
      {notice ? <p className="text-[12px] font-bold text-rose-200">{notice}</p> : null}
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#18181f]">
        {!rows.length ? (
          <div className="p-6">
            <EmptyRow dark icon={Search} title="Kelime yok" hint="Müşteri profilinden örn. “hatay web tasarım” ekleyin." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-wide text-white/40">
                  <th className="px-5 py-3">Müşteri</th>
                  <th className="px-3 py-3">Kelime</th>
                  <th className="px-3 py-3">Konum</th>
                  <th className="px-3 py-3">Önceki</th>
                  <th className="px-5 py-3">Kontrol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row) => (
                  <tr key={row.id} className="text-[12px] font-bold text-white">
                    <td className="px-5 py-3 text-white/70">{row.companyName || "—"}</td>
                    <td className="px-3 py-3">{row.keyword}</td>
                    <td className="px-3 py-3 tabular-nums text-white/55">
                      {hasSeoSnapshot(row) && row.position != null ? row.position : "—"}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-white/40">{row.previousPosition ?? "—"}</td>
                    <td className="px-5 py-3 text-[11px] text-white/40">{row.lastChecked ? new Date(row.lastChecked).toLocaleDateString("tr-TR") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {busy ? <p className="text-[11px] font-bold text-white/40">Yükleniyor…</p> : null}
    </div>
  );
}
