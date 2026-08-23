import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, ClipboardCheck, Download, FileText, Image as ImageIcon, MessageSquareText, RefreshCw } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";
import { openContractFile } from "../lib/contract-upload";
import type { OpsAlertTarget } from "./admin-ops-alerts";

export type AdminApproval = {
  id: number;
  customerId: number;
  companyName: string;
  title: string;
  description: string;
  kind: "file" | "image" | "text";
  bodyText: string;
  status: "pending" | "approved" | "revision";
  feedbackText: string;
  hasFile: boolean;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  createdBy: string;
  createdAt: string;
  respondedAt: string;
  waitingDays: number;
};

type StatusFilter = "all" | "pending" | "approved" | "revision";

const STATUS_LABEL: Record<AdminApproval["status"], string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  revision: "Revize İstendi",
};

const STATUS_TONE: Record<AdminApproval["status"], string> = {
  pending: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  approved: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  revision: "bg-rose-500/15 text-rose-200 border-rose-400/30",
};

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

function KindIcon({ kind }: { kind: AdminApproval["kind"] }) {
  if (kind === "image") return <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />;
  if (kind === "text") return <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />;
  return <FileText className="h-3.5 w-3.5" aria-hidden="true" />;
}

export function AdminApprovalsPanel({ opsJump = null }: { opsJump?: { target: OpsAlertTarget; token: number } | null }) {
  const [approvals, setApprovals] = useState<AdminApproval[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const result = await apiRequest<{ approvals: AdminApproval[] }>("/api/admin/approvals");
      setApprovals(result.approvals || []);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Onaylar yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (opsJump?.target === "approvals") setFilter("pending");
  }, [opsJump]);

  const counts = useMemo(() => {
    return {
      all: approvals.length,
      pending: approvals.filter((item) => item.status === "pending").length,
      approved: approvals.filter((item) => item.status === "approved").length,
      revision: approvals.filter((item) => item.status === "revision").length,
    };
  }, [approvals]);

  const visible = useMemo(() => {
    if (filter === "all") return approvals;
    return approvals.filter((item) => item.status === filter);
  }, [approvals, filter]);

  const remind = async (item: AdminApproval) => {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/approvals/${item.id}/remind`, { method: "POST", body: JSON.stringify({}) });
      setNotice(`${item.companyName} için panel içi hatırlatma işlendi.`);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Hatırlatma işlenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const openFile = async (item: AdminApproval, mode: "view" | "download") => {
    try {
      const url = mode === "download" ? `${item.fileUrl}?download=1` : item.fileUrl;
      await openContractFile(url, mode === "download" ? item.fileName || `onay-${item.id}` : undefined);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Dosya açılamadı.");
    }
  };

  const filters: { id: StatusFilter; label: string; count: number; activeTone: string }[] = [
    { id: "pending", label: "Bekleyen", count: counts.pending, activeTone: "bg-amber-500 text-[#071b22]" },
    { id: "revision", label: "Revize", count: counts.revision, activeTone: "bg-rose-500 text-white" },
    { id: "approved", label: "Onaylı", count: counts.approved, activeTone: "bg-emerald-500 text-white" },
    { id: "all", label: "Tümü", count: counts.all, activeTone: "bg-[#00a8c4] text-white" },
  ];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3ec8dc]">Onay Modülü</p>
          <h2 className="mt-2 text-[26px] font-black">Onay Takibi</h2>
          <p className="mt-2 text-[12px] text-white/55">Müşterilere gönderilen görsel, dosya ve tasarım onaylarını izleyin. Kaç gündür beklediğini ve gelen revize notlarını görün.</p>
        </div>
        <button onClick={() => void load()} className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[11px] font-black text-white/70"><RefreshCw className="h-4 w-4" /> Yenile</button>
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

      <div className="flex flex-wrap gap-2" role="group" aria-label="Onay filtreleri">
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

      <div className="space-y-3">
        {visible.length ? (
          visible.map((item) => (
            <article key={item.id} className={`rounded-2xl border p-4 ${item.status === "pending" ? "border-amber-300/25 bg-amber-950/15" : item.status === "revision" ? "border-rose-300/25 bg-rose-950/15" : "border-white/10 bg-[#18181f]"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[#70dce9]">
                    <KindIcon kind={item.kind} />
                    <p className="text-[9px] font-black uppercase tracking-wide">{item.companyName}</p>
                  </div>
                  <h3 className="mt-1 text-[14px] font-black text-white">{item.title}</h3>
                  {item.description ? <p className="mt-1 text-[11px] leading-relaxed text-white/55">{item.description}</p> : null}
                  {item.kind === "text" && item.bodyText ? (
                    <p className="mt-2 max-w-2xl whitespace-pre-wrap rounded-xl bg-black/25 px-3 py-2 text-[11px] leading-relaxed text-white/70">{item.bodyText}</p>
                  ) : null}
                  <p className="mt-2 text-[9px] font-bold text-white/40">Gönderim: {formatDate(item.createdAt)}{item.respondedAt ? ` · Yanıt: ${formatDate(item.respondedAt)}` : ""}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${STATUS_TONE[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                  {item.status === "pending" ? (
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-black text-white/60">{item.waitingDays} gündür bekliyor</span>
                  ) : null}
                </div>
              </div>

              {item.status === "revision" && item.feedbackText ? (
                <div className="mt-3 rounded-xl border border-rose-300/25 bg-rose-950/25 px-3 py-2">
                  <p className="text-[9px] font-black uppercase tracking-wide text-rose-200">Müşteri revize notu</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-rose-50/90">{item.feedbackText}</p>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                {item.hasFile ? (
                  <>
                    <button type="button" onClick={() => void openFile(item, "view")} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black text-white/70"><FileText className="h-3 w-3" /> Gör</button>
                    <button type="button" onClick={() => void openFile(item, "download")} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-black text-white/70"><Download className="h-3 w-3" /> İndir</button>
                  </>
                ) : null}
                {item.status === "pending" ? (
                  <button type="button" disabled={busy} onClick={() => void remind(item)} className="inline-flex items-center gap-1.5 rounded-full bg-[#00a8c4]/20 px-3 py-1.5 text-[9px] font-black text-[#7ee7f3] disabled:opacity-40"><Bell className="h-3 w-3" /> Hatırlat</button>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <EmptyRow dark icon={ClipboardCheck} title={filter === "pending" ? "Bekleyen onay yok" : filter === "revision" ? "Revize istenen yok" : filter === "approved" ? "Onaylı kayıt yok" : "Onay kaydı yok"} hint="Müşteri profilinden ‘Onaya Gönder’ ile görsel/dosya gönderin." />
        )}
      </div>
    </div>
  );
}
