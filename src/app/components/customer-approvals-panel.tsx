import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Clock, Download, FileText, Image as ImageIcon, MessageSquareText, PencilLine } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";
import { openContractFile } from "../lib/contract-upload";

export type ApprovalKind = "file" | "image" | "text";
export type ApprovalStatus = "pending" | "approved" | "revision";
export type ApprovalEvent = { actor: string; action: string; note: string; createdAt: string };
export type PortalApproval = {
  id: number;
  title: string;
  description: string;
  kind: ApprovalKind;
  bodyText: string;
  status: ApprovalStatus;
  feedbackText: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  hasFile: boolean;
  fileUrl: string;
  createdBy: string;
  createdAt: string;
  respondedAt: string;
  updatedAt: string;
  events?: ApprovalEvent[];
};

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Bekliyor",
  approved: "Onaylandı",
  revision: "Revize İstendi",
};

const STATUS_TONE: Record<ApprovalStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  revision: "border-rose-200 bg-rose-50 text-rose-800",
};

const ACTION_LABEL: Record<string, string> = {
  created: "Onaya gönderildi",
  approved: "Onaylandı",
  revision: "Revize istendi",
  viewed: "Görüntülendi",
  reminder: "Hatırlatma",
};

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

function KindIcon({ kind }: { kind: ApprovalKind }) {
  if (kind === "image") return <ImageIcon className="h-4 w-4" aria-hidden="true" />;
  if (kind === "text") return <MessageSquareText className="h-4 w-4" aria-hidden="true" />;
  return <FileText className="h-4 w-4" aria-hidden="true" />;
}

export function CustomerApprovalsPanel({
  approvals,
  busy,
  onError,
  onRefresh,
}: {
  approvals: PortalApproval[];
  busy: boolean;
  onError: (message: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "revision">("pending");
  const [revisionFor, setRevisionFor] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const list = approvals || [];
  const pendingCount = list.filter((item) => item.status === "pending").length;
  const approvedCount = list.filter((item) => item.status === "approved").length;
  const revisionCount = list.filter((item) => item.status === "revision").length;

  useEffect(() => {
    if (filter === "pending" && pendingCount === 0 && list.length > 0) setFilter("all");
  }, [filter, pendingCount, list.length]);

  const visible = useMemo(() => {
    if (filter === "all") return list;
    return list.filter((item) => item.status === filter);
  }, [filter, list]);

  const decide = async (item: PortalApproval, decision: ApprovalStatus, note?: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await apiRequest(`/api/customer/approvals/${item.id}/respond`, {
        method: "POST",
        body: JSON.stringify({ decision, feedback: note || "" }),
      });
      setRevisionFor(null);
      setFeedback("");
      await onRefresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Onay kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const openFile = async (item: PortalApproval, mode: "view" | "download") => {
    try {
      const url = mode === "download" ? `${item.fileUrl}?download=1` : item.fileUrl;
      await openContractFile(url, mode === "download" ? item.fileName || `onay-${item.id}` : undefined);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Dosya açılamadı.");
    }
  };

  const filters: { id: typeof filter; label: string; count: number; activeTone: string }[] = [
    { id: "pending", label: "Bekleyen", count: pendingCount, activeTone: "bg-amber-500 text-white" },
    { id: "approved", label: "Onaylı", count: approvedCount, activeTone: "bg-emerald-500 text-white" },
    { id: "revision", label: "Revize", count: revisionCount, activeTone: "bg-rose-500 text-white" },
    { id: "all", label: "Tümü", count: list.length, activeTone: "bg-[#00a8c4] text-white" },
  ];

  return (
    <section className="mt-7 space-y-5">
      <div className="rounded-[22px] border border-[#d5e6ea] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-[#00a8c4]" aria-hidden="true" />
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Onay Bekleyenler</p>
          {pendingCount > 0 ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-black text-amber-800">{pendingCount} bekliyor</span>
          ) : (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">Bekleyen onay yok</span>
          )}
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-[#6c7c84]">
          Hatay360 ekibinin gönderdiği görsel, dosya ve tasarım notlarını burada onaylayın. Değişiklik gerekiyorsa “Revize İstiyorum” ile açıklama yazın.
        </p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Onay filtreleri">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={`rounded-full px-3 py-1.5 text-[10px] font-black ${filter === item.id ? item.activeTone : "bg-[#eef4f6] text-[#49616b]"}`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {visible.length ? (
          visible.map((item) => {
            const isRevising = revisionFor === item.id;
            const canSubmitRevision = feedback.trim().length >= 3;
            return (
              <article key={item.id} className="rounded-[22px] border border-[#dce7e9] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[#00a8c4]">
                      <KindIcon kind={item.kind} />
                      <p className="text-[9px] font-black uppercase tracking-wide">
                        {item.kind === "image" ? "Görsel" : item.kind === "text" ? "Metin / not" : "Dosya"}
                      </p>
                    </div>
                    <h3 className="mt-1 text-[16px] font-black text-[#102b35]">{item.title}</h3>
                    {item.description ? <p className="mt-1 text-[12px] leading-relaxed text-[#64767e]">{item.description}</p> : null}
                    <p className="mt-1 text-[9px] font-bold text-[#93a0a6]">Gönderim: {formatDate(item.createdAt)}{item.respondedAt ? ` · Yanıt: ${formatDate(item.respondedAt)}` : ""}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black ${STATUS_TONE[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                </div>

                {item.kind === "image" && item.hasFile ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-[#e4ecee] bg-[#f7fafb]">
                    <img src={item.fileUrl} alt={`${item.title} önizleme`} className="max-h-72 w-full object-contain" loading="lazy" />
                  </div>
                ) : null}

                {item.kind === "text" && item.bodyText ? (
                  <div className="mt-4 rounded-2xl border border-[#e4ecee] bg-[#f7fafb] px-4 py-3">
                    <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-[#334b53]">{item.bodyText}</p>
                  </div>
                ) : null}

                {item.hasFile ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => void openFile(item, "view")} className="inline-flex items-center gap-1.5 rounded-xl border border-[#bfe1e6] bg-[#edf9fa] px-3 py-2 text-[10px] font-black text-[#007f98]">
                      <FileText className="h-3.5 w-3.5" /> {item.kind === "image" ? "Büyüt / aç" : "Dosyayı gör"}
                    </button>
                    <button type="button" onClick={() => void openFile(item, "download")} className="inline-flex items-center gap-1.5 rounded-xl border border-[#d7e4e7] bg-white px-3 py-2 text-[10px] font-black text-[#49616b]">
                      <Download className="h-3.5 w-3.5" /> İndir
                    </button>
                  </div>
                ) : null}

                {item.status === "revision" && item.feedbackText ? (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wide text-rose-700">Gönderdiğiniz revize notu</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-rose-900">{item.feedbackText}</p>
                  </div>
                ) : null}

                {item.status === "pending" ? (
                  <div className="mt-4 space-y-3">
                    {isRevising ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3">
                        <label htmlFor={`approval-feedback-${item.id}`} className="text-[10px] font-black uppercase tracking-wide text-rose-700">
                          Revize açıklaması (zorunlu)
                        </label>
                        <textarea
                          id={`approval-feedback-${item.id}`}
                          rows={3}
                          autoFocus
                          value={feedback}
                          onChange={(event) => setFeedback(event.target.value)}
                          placeholder="Neyin değişmesini istiyorsunuz? En az 3 karakter."
                          className="mt-2 w-full rounded-xl border border-rose-200 bg-white p-3 text-[12px] text-[#102b35] outline-none focus:border-rose-400"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={!canSubmitRevision || submitting || busy}
                            onClick={() => void decide(item, "revision", feedback)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-[11px] font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            <PencilLine className="h-4 w-4" /> Revize talebini gönder
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRevisionFor(null);
                              setFeedback("");
                            }}
                            className="rounded-xl border border-[#d7e4e7] bg-white px-4 py-2.5 text-[11px] font-black text-[#49616b]"
                          >
                            Vazgeç
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={submitting || busy}
                          onClick={() => void decide(item, "approved")}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-[11px] font-black text-white disabled:opacity-45"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Onaylıyorum
                        </button>
                        <button
                          type="button"
                          disabled={submitting || busy}
                          onClick={() => {
                            setRevisionFor(item.id);
                            setFeedback("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-[11px] font-black text-rose-700 disabled:opacity-45"
                        >
                          <PencilLine className="h-4 w-4" /> Revize İstiyorum
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}

                {item.events && item.events.length ? (
                  <details className="mt-3 rounded-xl border border-[#e4ecee] bg-[#f7fafb] px-3 py-2">
                    <summary className="cursor-pointer text-[10px] font-black uppercase tracking-wide text-[#6c7c84]">İşlem geçmişi ({item.events.length})</summary>
                    <ul className="mt-2 space-y-1.5">
                      {item.events.map((event, index) => (
                        <li key={index} className="flex items-center gap-2 text-[10px] text-[#64767e]">
                          <Clock className="h-3 w-3 shrink-0 text-[#93a0a6]" aria-hidden="true" />
                          <span className="font-black text-[#334b53]">{ACTION_LABEL[event.action] || event.action}</span>
                          <span className="text-[#93a0a6]">· {event.actor === "customer" ? "Müşteri" : "Hatay360"} · {formatDate(event.createdAt)}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </article>
            );
          })
        ) : (
          <EmptyRow
            icon={ClipboardCheck}
            title={filter === "pending" ? "Bekleyen onay yok" : filter === "approved" ? "Onaylı kayıt yok" : filter === "revision" ? "Revize istenen yok" : "Henüz onay isteği yok"}
            hint="Hatay360 ekibi görsel veya tasarım gönderdiğinde burada görünür."
          />
        )}
      </div>
    </section>
  );
}
