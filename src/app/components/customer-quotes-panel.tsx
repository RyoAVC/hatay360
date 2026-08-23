import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, FileText, PenLine } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";
import { openContractFile } from "../lib/contract-upload";

export type QuoteStatus = "pending" | "accepted" | "withdrawn";
export type PortalQuote = {
  id: number;
  title: string;
  status: QuoteStatus;
  hasFile: boolean;
  acceptedAt: string;
  acceptName: string;
  createdAt?: string;
};

const STATUS_LABEL: Record<QuoteStatus, string> = {
  pending: "Bekliyor",
  accepted: "Kabul edildi",
  withdrawn: "Geri çekildi",
};

const STATUS_TONE: Record<QuoteStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-800",
  withdrawn: "border-slate-200 bg-slate-50 text-slate-600",
};

export const QUOTE_LEGAL_NOTE = "Bu işlem kayıtlı kabul (ad, tarih, IP) üretir; nitelikli e-imza değildir.";

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

export function CustomerQuotesPanel({
  quotes,
  busy,
  canAccept = true,
  onError,
  onRefresh,
}: {
  quotes: PortalQuote[];
  busy: boolean;
  canAccept?: boolean;
  onError: (message: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<"all" | QuoteStatus>("pending");
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [names, setNames] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const list = quotes || [];
  const pendingCount = list.filter((item) => item.status === "pending").length;
  const acceptedCount = list.filter((item) => item.status === "accepted").length;
  const withdrawnCount = list.filter((item) => item.status === "withdrawn").length;

  useEffect(() => {
    if (filter === "pending" && pendingCount === 0 && list.length > 0) setFilter("all");
  }, [filter, pendingCount, list.length]);

  const visible = useMemo(() => {
    if (filter === "all") return list;
    return list.filter((item) => item.status === filter);
  }, [filter, list]);

  const accept = async (item: PortalQuote) => {
    if (submitting || !canAccept) return;
    const name = (names[item.id] || "").trim();
    if (!checked[item.id]) {
      onError("Kabul için onay kutusunu işaretleyin.");
      return;
    }
    if (name.length < 3) {
      onError("Ad soyad en az 3 karakter olmalıdır.");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest(`/api/customer/quotes/${item.id}/accept`, {
        method: "POST",
        body: JSON.stringify({ name, accepted: true }),
      });
      setChecked((prev) => ({ ...prev, [item.id]: false }));
      setNames((prev) => ({ ...prev, [item.id]: "" }));
      await onRefresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Teklif kabul edilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const openFile = async (item: PortalQuote, mode: "view" | "download") => {
    try {
      const base = `/api/customer/quotes/${item.id}/file`;
      const url = mode === "download" ? `${base}?download=1` : base;
      await openContractFile(url, mode === "download" ? `${item.title || "teklif"}-${item.id}` : undefined);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Dosya açılamadı.");
    }
  };

  const filters: { id: typeof filter; label: string; count: number; activeTone: string }[] = [
    { id: "pending", label: "Bekleyen", count: pendingCount, activeTone: "bg-amber-500 text-white" },
    { id: "accepted", label: "Kabul", count: acceptedCount, activeTone: "bg-emerald-500 text-white" },
    { id: "withdrawn", label: "Geri çekildi", count: withdrawnCount, activeTone: "bg-slate-500 text-white" },
    { id: "all", label: "Tümü", count: list.length, activeTone: "bg-[#00a8c4] text-white" },
  ];

  return (
    <section className="mt-7 space-y-5">
      <div className="rounded-[22px] border border-[#d5e6ea] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center gap-2">
          <PenLine className="h-4 w-4 text-[#00a8c4]" aria-hidden="true" />
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Teklifler</p>
          {pendingCount > 0 ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-black text-amber-800">{pendingCount} bekliyor</span>
          ) : (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">Bekleyen teklif yok</span>
          )}
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-[#6c7c84]">
          Hatay360 ekibinin gönderdiği teklif ve belgeleri buradan indirip kabul edebilirsiniz.
        </p>
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-900">
          {QUOTE_LEGAL_NOTE}
        </p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Teklif filtreleri">
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
            const name = names[item.id] || "";
            const canSubmit = Boolean(checked[item.id]) && name.trim().length >= 3;
            return (
              <article key={item.id} className="rounded-[22px] border border-[#dce7e9] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[#00a8c4]">
                      <FileText className="h-4 w-4" />
                      <p className="text-[9px] font-black uppercase tracking-wide">Teklif / belge</p>
                    </div>
                    <h3 className="mt-1 text-[16px] font-black text-[#102b35]">{item.title}</h3>
                    {item.createdAt ? <p className="mt-1 text-[9px] font-bold text-[#93a0a6]">Gönderim: {formatDate(item.createdAt)}</p> : null}
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black ${STATUS_TONE[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                </div>

                {item.hasFile ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => void openFile(item, "view")} className="inline-flex items-center gap-1.5 rounded-xl border border-[#bfe1e6] bg-[#edf9fa] px-3 py-2 text-[10px] font-black text-[#007f98]">
                      <FileText className="h-3.5 w-3.5" /> PDF / görsel
                    </button>
                    <button type="button" onClick={() => void openFile(item, "download")} className="inline-flex items-center gap-1.5 rounded-xl border border-[#d7e4e7] bg-white px-3 py-2 text-[10px] font-black text-[#49616b]">
                      <Download className="h-3.5 w-3.5" /> İndir
                    </button>
                  </div>
                ) : null}

                {item.status === "accepted" ? (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wide text-emerald-800">Kayıtlı kabul</p>
                    <p className="mt-1 text-[12px] font-bold text-emerald-950">
                      {item.acceptName || "—"}
                      {item.acceptedAt ? ` · ${formatDate(item.acceptedAt)}` : ""}
                    </p>
                  </div>
                ) : null}

                {item.status === "pending" && canAccept ? (
                  <div className="mt-4 space-y-3 rounded-2xl border border-[#dce7e9] bg-[#f7fbfc] p-3">
                    <label className="flex items-start gap-2 text-[12px] font-bold text-[#334b53]">
                      <input
                        type="checkbox"
                        checked={Boolean(checked[item.id])}
                        onChange={(event) => setChecked((prev) => ({ ...prev, [item.id]: event.target.checked }))}
                        className="mt-0.5 h-4 w-4 accent-[#00a8c4]"
                      />
                      Bu teklifi / belgeyi okudum, kabul ediyorum
                    </label>
                    <label className="block text-[10px] font-black uppercase tracking-wide text-[#6c7c84]">
                      Ad soyad
                      <input
                        value={name}
                        onChange={(event) => setNames((prev) => ({ ...prev, [item.id]: event.target.value }))}
                        placeholder="Adınız ve soyadınız"
                        className="mt-1 w-full rounded-xl border border-[#d5e6ea] bg-white px-3 py-2.5 text-[12px] font-bold text-[#102b35] outline-none focus:border-[#00a8c4]"
                      />
                    </label>
                    <p className="text-[10px] font-bold leading-relaxed text-[#6c7c84]">{QUOTE_LEGAL_NOTE}</p>
                    <button
                      type="button"
                      disabled={!canSubmit || submitting || busy}
                      onClick={() => void accept(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-[11px] font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Kabul Ediyorum
                    </button>
                  </div>
                ) : null}

                {item.status === "pending" && !canAccept ? (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-900">
                    Kabul işlemi yalnızca tam yetkili kullanıcılar tarafından yapılabilir.
                  </p>
                ) : null}
              </article>
            );
          })
        ) : (
          <EmptyRow
            icon={PenLine}
            title={filter === "pending" ? "Bekleyen teklif yok" : filter === "accepted" ? "Kabul edilen teklif yok" : filter === "withdrawn" ? "Geri çekilen teklif yok" : "Henüz teklif yok"}
            hint="Hatay360 ekibi teklif gönderdiğinde burada görünür."
          />
        )}
      </div>
    </section>
  );
}
