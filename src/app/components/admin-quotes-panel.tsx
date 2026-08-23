import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, PenLine, RefreshCw, Undo2 } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";
import { openContractFile } from "../lib/contract-upload";
import type { OpsAlertTarget } from "./admin-ops-alerts";
import { QUOTE_LEGAL_NOTE } from "./customer-quotes-panel";

export type AdminQuote = {
  id: number;
  customerId: number;
  companyName: string;
  title: string;
  status: "pending" | "accepted" | "withdrawn";
  hasFile: boolean;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  acceptName: string;
  acceptIp: string;
  acceptedAt: string;
  createdBy: string;
  createdAt: string;
  waitingDays: number;
};

type StatusFilter = "all" | "pending" | "accepted" | "withdrawn";
type CustomerOption = { id: number; company_name: string };

const STATUS_LABEL: Record<AdminQuote["status"], string> = {
  pending: "Bekliyor",
  accepted: "Kabul edildi",
  withdrawn: "Geri çekildi",
};

const STATUS_TONE: Record<AdminQuote["status"], string> = {
  pending: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  accepted: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  withdrawn: "bg-white/5 text-white/50 border-white/10",
};

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

export function AdminQuotesPanel({ opsJump = null }: { opsJump?: { target: OpsAlertTarget; token: number } | null }) {
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [customerId, setCustomerId] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const result = await apiRequest<{ quotes: AdminQuote[] }>("/api/admin/quotes");
      setQuotes(result.quotes || []);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Teklifler yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const result = await apiRequest<{ customers: CustomerOption[] }>("/api/admin/customers");
      setCustomers((result.customers || []).map((item) => ({ id: item.id, company_name: item.company_name })));
    } catch {
      /* müşteri listesi opsiyonel */
    }
  }, []);

  useEffect(() => {
    void load();
    void loadCustomers();
  }, [load, loadCustomers]);

  useEffect(() => {
    if (opsJump?.target === "quotes") setFilter("pending");
  }, [opsJump]);

  const counts = useMemo(
    () => ({
      all: quotes.length,
      pending: quotes.filter((item) => item.status === "pending").length,
      accepted: quotes.filter((item) => item.status === "accepted").length,
      withdrawn: quotes.filter((item) => item.status === "withdrawn").length,
    }),
    [quotes],
  );

  const visible = useMemo(() => {
    return quotes.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (customerId && String(item.customerId) !== customerId) return false;
      return true;
    });
  }, [quotes, filter, customerId]);

  const withdraw = async (item: AdminQuote) => {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/quotes/${item.id}/withdraw`, { method: "POST", body: JSON.stringify({}) });
      setNotice(`${item.companyName} teklifi geri çekildi.`);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Teklif geri çekilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const openFile = async (item: AdminQuote, mode: "view" | "download") => {
    try {
      const url = mode === "download" ? `${item.fileUrl}?download=1` : item.fileUrl;
      await openContractFile(url, mode === "download" ? item.fileName || `teklif-${item.id}` : undefined);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Dosya açılamadı.");
    }
  };

  const filters: { id: StatusFilter; label: string; count: number; activeTone: string }[] = [
    { id: "pending", label: "Bekleyen", count: counts.pending, activeTone: "bg-amber-500 text-[#071b22]" },
    { id: "accepted", label: "Kabul", count: counts.accepted, activeTone: "bg-emerald-500 text-white" },
    { id: "withdrawn", label: "Geri çekildi", count: counts.withdrawn, activeTone: "bg-slate-500 text-white" },
    { id: "all", label: "Tümü", count: counts.all, activeTone: "bg-[#00a8c4] text-white" },
  ];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3ec8dc]">Teklif / Kabul</p>
          <h2 className="mt-2 text-[26px] font-black">Teklifler</h2>
          <p className="mt-2 max-w-2xl text-[12px] text-white/55">
            Müşteriye gönderilen teklifleri izleyin. Kabul, kayıtlı kabul (ad, tarih, IP) üretir.
          </p>
          <p className="mt-2 text-[11px] font-bold text-amber-200/90">{QUOTE_LEGAL_NOTE}</p>
        </div>
        <button onClick={() => void load()} className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[11px] font-black text-white/70">
          <RefreshCw className="h-4 w-4" /> Yenile
        </button>
      </div>

      {notice ? <p className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-[11px] font-bold text-cyan-100">{notice}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-2xl border px-4 py-3 text-left ${filter === item.id ? "border-[#00a8c4]/50 bg-[#00a8c4]/10" : "border-white/10 bg-[#18181f]"}`}
          >
            <p className="text-[10px] font-black uppercase tracking-wide text-white/50">{item.label}</p>
            <p className="mt-1 text-[28px] font-black text-white">{item.count}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Teklif filtreleri">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={`rounded-full px-3 py-1.5 text-[11px] font-black ${filter === item.id ? item.activeTone : "bg-white/5 text-white/60"}`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>
        <label className="ml-auto text-[10px] font-black uppercase tracking-wide text-white/50">
          Müşteri
          <select
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            className="mt-1 block min-w-[220px] rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-[12px] font-bold text-white outline-none focus:border-[#00a8c4]"
          >
            <option value="">Tümü</option>
            {customers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.company_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3">
        {visible.length ? (
          visible.map((item) => (
            <article key={item.id} className={`rounded-2xl border p-4 ${item.status === "pending" ? "border-amber-300/25 bg-amber-950/15" : item.status === "accepted" ? "border-emerald-300/20 bg-emerald-950/10" : "border-white/10 bg-[#18181f]"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[#70dce9]">
                    <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                    <p className="text-[9px] font-black uppercase tracking-wide">{item.companyName}</p>
                  </div>
                  <h3 className="mt-1 text-[14px] font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-[9px] font-bold text-white/40">
                    Gönderim: {formatDate(item.createdAt)}
                    {item.acceptedAt ? ` · Kabul: ${formatDate(item.acceptedAt)}` : ""}
                  </p>
                  {item.status === "accepted" ? (
                    <p className="mt-1 text-[11px] font-bold text-emerald-200">
                      {item.acceptName || "—"}
                      {item.acceptIp ? ` · IP ${item.acceptIp}` : ""}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${STATUS_TONE[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                  {item.status === "pending" ? (
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-black text-white/60">{item.waitingDays} gündür bekliyor</span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {item.hasFile ? (
                  <>
                    <button type="button" onClick={() => void openFile(item, "view")} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black text-white/70">
                      <FileText className="h-3 w-3" /> Gör
                    </button>
                    <button type="button" onClick={() => void openFile(item, "download")} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black text-white/70">
                      <Download className="h-3 w-3" /> İndir
                    </button>
                  </>
                ) : null}
                {item.status === "pending" ? (
                  <button type="button" disabled={busy} onClick={() => void withdraw(item)} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-black text-white/70 disabled:opacity-40">
                    <Undo2 className="h-3 w-3" /> Geri çek
                  </button>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <EmptyRow dark icon={PenLine} title={filter === "pending" ? "Bekleyen teklif yok" : filter === "accepted" ? "Kabul edilen teklif yok" : filter === "withdrawn" ? "Geri çekilen teklif yok" : "Teklif kaydı yok"} hint="Müşteri profilinden ‘Teklif gönder’ ile PDF yükleyin." />
        )}
      </div>
    </div>
  );
}
