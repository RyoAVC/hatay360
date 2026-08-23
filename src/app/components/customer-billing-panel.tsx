import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CreditCard, Download, FileText, Receipt, RotateCcw, ShieldCheck, Upload, Wallet } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";
import { contractFilePayload, openContractFile } from "../lib/contract-upload";
import { CATALOG_KIND_LABELS, PAYMENT_STATUS_LABELS, formatTry, paymentInvoiceFileName, type CatalogKind, type PaymentStatus } from "../lib/payment-balance";
import { GATEWAY_CARD_NOTE_TR, GATEWAY_NOT_CONNECTED_TR } from "../lib/iyzico-checkout";
import { SignaturePad } from "./signature-pad";
import { StatusDot } from "./status-dot";
import { contractSignDotKind, paymentDotKind } from "../lib/ops-status";

export type PortalCatalogItem = { id: number; kind: CatalogKind; title: string; details: string; amount: number; quantity: number };
export type PortalPayment = { id: number; period: string; amount: number; paidAmount: number; remaining: number; unpaidBase?: number; penalty?: number; overdue?: boolean; daysLeft?: number | null; daysOverdue?: number; startDate?: string; endDate?: string; status: PaymentStatus; note: string; gatewayRef?: string; gatewayProvider?: string };
export type PortalContract = { id: number; familyId: number; version: number; title: string; fileName: string; uploadedBy: string; current: boolean; createdAt: string; bodyHtml?: string; signStatus?: string; signReason?: string; signedAt?: string; hasSignature?: boolean; sigX?: number; sigY?: number; sigW?: number; sigH?: number };
export type PortalPaymentSummary = { total: number; paid: number; unpaid: number; remaining: number; penalty?: number; overdueCount?: number };

export function PaymentDueCard({
  payments,
  paymentSummary,
  onOpen,
}: {
  payments: PortalPayment[];
  paymentSummary: PortalPaymentSummary;
  onOpen: () => void;
}) {
  const overdue = payments.filter((item) => item.overdue && item.remaining > 0);
  const open = payments.find((item) => item.status !== "paid" && !item.overdue);
  const focus = overdue[0] || open || payments.find((item) => item.remaining > 0) || payments[0];
  const remaining = Number(paymentSummary.remaining || 0);

  if (!payments.length) {
    return (
      <div className="mt-5 w-full rounded-[22px] border border-dashed border-[#cbdadd] bg-white p-4 text-left">
        <button type="button" onClick={onOpen} className="w-full text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Bu ayın ödemesi</p>
              <p className="mt-1 text-[18px] font-black text-[#102b35]">Henüz ödeme dönemi yok</p>
            </div>
            <Wallet className="h-5 w-5 shrink-0 text-[#94a8b0]" aria-hidden />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#64767e]">
            Admin dönem ekleyince bakiye ve PDF özet burada görünür.
          </p>
          <span className="mt-3 inline-flex items-center rounded-full border border-[#bfe1e6] bg-[#edf9fa] px-3 py-1.5 text-[10px] font-black text-[#007f98]">
            Ödemeler sekmesine git
          </span>
        </button>
      </div>
    );
  }

  const downloadFocus = async () => {
    if (!focus) return;
    try {
      await openContractFile(
        `/api/customer/payments/${focus.id}/invoice.pdf?download=1`,
        paymentInvoiceFileName(focus.period, Boolean(focus.overdue && focus.remaining > 0), focus.id),
      );
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "PDF indirilemedi.");
    }
  };
  const viewFocus = async () => {
    if (!focus) return;
    try {
      await openContractFile(`/api/customer/payments/${focus.id}/invoice.pdf?download=0`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "PDF açılamadı.");
    }
  };

  return (
    <div className={`mt-5 w-full rounded-[22px] border p-4 text-left ${overdue.length ? "border-rose-200 bg-rose-50" : "border-[#dce7e9] bg-white"}`}>
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Bu ayın ödemesi</p>
            <p className="mt-1 text-[20px] font-black text-[#102b35]">{formatTry(remaining)}</p>
          </div>
          {overdue.length ? (
            <StatusDot kind={paymentDotKind("unpaid", true)} label="Gecikmiş" />
          ) : remaining > 0 ? (
            <StatusDot kind={paymentDotKind("unpaid", false)} label="Bakiye" />
          ) : (
            <StatusDot kind={paymentDotKind("paid", false)} label="Temiz" />
          )}
        </div>
        {overdue.length ? (
          <p className="mt-2 text-[11px] font-black text-rose-700">CEZA %15: {overdue.length} satır vadesi geçti. Ödenecek tutar gecikme dahil.</p>
        ) : open?.daysLeft != null ? (
          <p className="mt-2 text-[11px] font-bold text-[#49616b]">{open.startDate} → {open.endDate} · {open.daysLeft} gün kaldı</p>
        ) : (
          <p className="mt-2 text-[11px] text-[#64767e]">Açık bakiye yok veya vade tarihi yok.</p>
        )}
      </button>
      {focus ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void viewFocus()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#bfe1e6] bg-[#edf9fa] px-3 py-1.5 text-[10px] font-black text-[#007f98]"
          >
            <FileText className="h-3.5 w-3.5" /> PDF gör
          </button>
          <button
            type="button"
            onClick={() => void downloadFocus()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#bfe1e6] bg-white px-3 py-1.5 text-[10px] font-black text-[#007f98]"
          >
            <Download className="h-3.5 w-3.5" /> PDF indir{focus.overdue && focus.remaining > 0 ? " · CEZA" : ""}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(Number(value || 0));

type PaymentFilter = "all" | "overdue" | "open";

export function CustomerBillingPanel({
  invoices,
  products,
  services,
  extras,
  payments,
  paymentSummary,
  paymentGateway,
  busy,
  onError,
  onRefresh,
}: {
  invoices: PortalCatalogItem[];
  products: PortalCatalogItem[];
  services: PortalCatalogItem[];
  extras?: PortalCatalogItem[];
  payments: PortalPayment[];
  paymentSummary: PortalPaymentSummary;
  paymentGateway?: { available?: boolean; provider?: string; message?: string };
  busy: boolean;
  onError: (message: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payErrors, setPayErrors] = useState<Record<number, string>>({});
  const summary = paymentSummary || { total: 0, paid: 0, unpaid: 0, remaining: 0 };
  const gatewayMessage = paymentGateway?.message || GATEWAY_NOT_CONNECTED_TR;
  const lines = [...invoices, ...products, ...services, ...(extras || [])];
  const overdueCount = payments.filter((item) => item.overdue && item.remaining > 0).length;
  const openCount = payments.filter((item) => item.status !== "paid" && !item.overdue && item.remaining > 0).length;
  const visiblePayments = paymentFilter === "overdue"
    ? payments.filter((item) => item.overdue && item.remaining > 0)
    : paymentFilter === "open"
      ? payments.filter((item) => item.status !== "paid" && !item.overdue && item.remaining > 0)
      : payments;
  const hasOverdue = overdueCount > 0;
  const hasBalance = Number(summary.remaining || 0) > 0;

  const payNow = async (item: PortalPayment) => {
    if (Number(item.remaining || 0) <= 0) return;
    setPayingId(item.id);
    setPayErrors((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    try {
      await apiRequest(`/api/customer/payments/${item.id}/pay`, { method: "POST", body: "{}" });
    } catch (error) {
      const message = error instanceof Error ? error.message : gatewayMessage;
      setPayErrors((prev) => ({ ...prev, [item.id]: message }));
    } finally {
      setPayingId(null);
    }
  };

  return (
    <section className="mt-7 space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#dce7e9] bg-white p-4 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-wide text-[#84939a]">Ödendi</p>
          <p className="mt-1 text-[22px] font-black">{formatTry(summary.paid)}</p>
        </article>
        <article className="rounded-2xl border border-[#dce7e9] bg-white p-4 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-wide text-[#84939a]">Ödenmedi</p>
          <p className="mt-1 text-[22px] font-black">{formatTry(summary.unpaid)}</p>
        </article>
        <article className={`rounded-2xl border p-4 shadow-sm ${hasOverdue ? "border-rose-200 bg-rose-50" : "border-[#dce7e9] bg-white"}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-black uppercase tracking-wide text-[#84939a]">Kalan</p>
            {hasOverdue ? <StatusDot kind={paymentDotKind("unpaid", true)} label="Gecikmiş" /> : hasBalance ? <StatusDot kind={paymentDotKind("unpaid", false)} label="Bakiye" /> : <StatusDot kind={paymentDotKind("paid", false)} label="Temiz" />}
          </div>
          <p className={`mt-1 text-[22px] font-black ${hasOverdue ? "text-rose-700" : ""}`}>{formatTry(summary.remaining)}</p>
          {hasOverdue && Number(summary.penalty || 0) > 0 ? (
            <p className="mt-1 text-[10px] font-black text-rose-700">CEZA %15 dahil · {overdueCount} satır</p>
          ) : null}
        </article>
        <button
          type="button"
          onClick={() => setPaymentFilter(hasOverdue ? "overdue" : "open")}
          className={`rounded-2xl border p-4 text-left shadow-sm ${hasOverdue ? "border-rose-200 bg-rose-50" : "border-[#dce7e9] bg-white"}`}
        >
          <p className="text-[9px] font-black uppercase tracking-wide text-[#84939a]">Takip</p>
          <p className="mt-1 text-[22px] font-black">{overdueCount}<span className="text-[12px] font-bold text-[#87969c]"> / {openCount}</span></p>
          <p className="mt-1 text-[10px] font-bold text-[#64767e]">Gecikmiş / açık dönem</p>
        </button>
      </div>
      <p className="text-[10px] font-bold text-[#87969c]">Kalan = ödenmeyen tutar. Vade geçtiyse aynı satıra CEZA %15 eklenir; reklam tıklaması para değildir.</p>
      <p className="text-[10px] font-bold text-[#49616b]">{GATEWAY_CARD_NOTE_TR}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setPaymentFilter("all")} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${paymentFilter === "all" ? "bg-[#00a8c4] text-white" : "bg-[#eef4f6] text-[#49616b]"}`}>
          Tümü ({payments.length})
        </button>
        <button type="button" onClick={() => setPaymentFilter("overdue")} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${paymentFilter === "overdue" ? "bg-rose-500 text-white" : "bg-[#eef4f6] text-[#49616b]"}`}>
          Gecikmiş ({overdueCount})
        </button>
        <button type="button" onClick={() => setPaymentFilter("open")} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${paymentFilter === "open" ? "bg-amber-500 text-[#071b22]" : "bg-[#eef4f6] text-[#49616b]"}`}>
          Açık dönem ({openCount})
        </button>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[22px] border border-[#dce7e9] bg-white p-5">
          <h2 className="text-[18px] font-black">Aylık ödemeler</h2>
          <div className="mt-4 space-y-2">
            {visiblePayments.length ? visiblePayments.map((item) => (
              <article key={item.id} className={`rounded-xl p-3 ${item.overdue ? "border border-rose-200 bg-rose-50" : "bg-[#f6f9fa]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-black">{item.period}</p>
                  <StatusDot kind={paymentDotKind(item.status, item.overdue)} label={item.overdue ? "Gecikmiş" : PAYMENT_STATUS_LABELS[item.status]} />
                </div>
                <p className="mt-1 text-[11px] text-[#64767e]">{formatTry(item.amount)} · ödenen {formatTry(item.paidAmount)} · kalan {formatTry(item.remaining)}</p>
                {item.startDate && item.endDate ? (
                  <p className="mt-1 text-[10px] font-bold text-[#49616b]">
                    {item.startDate} → {item.endDate}
                    {item.overdue ? ` · ${item.daysOverdue} gün geçti` : item.daysLeft != null ? ` · ${item.daysLeft} gün kaldı` : ""}
                  </p>
                ) : null}
                {item.overdue && item.penalty ? <p className="mt-1 text-[11px] font-black text-rose-700">CEZA %15: vade geçti. Ödenmeyen {formatTry(item.unpaidBase || 0)} × 1,15 = {formatTry(item.remaining)}.</p> : null}
                {item.note ? <p className="mt-1 text-[10px] text-[#87969c]">{item.note}</p> : null}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      void openContractFile(`/api/customer/payments/${item.id}/invoice.pdf?download=0`)
                        .catch((error) => onError(error instanceof Error ? error.message : "PDF açılamadı."));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f7fa] px-3 py-1.5 text-[10px] font-black text-[#008fac]"
                  >
                    <FileText className="h-3.5 w-3.5" /> Gör
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      void openContractFile(
                        `/api/customer/payments/${item.id}/invoice.pdf?download=1`,
                        paymentInvoiceFileName(item.period, Boolean(item.overdue && item.remaining > 0), item.id),
                      ).catch((error) => onError(error instanceof Error ? error.message : "PDF indirilemedi."));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#dbe5e8] px-3 py-1.5 text-[10px] font-black text-[#49616b]"
                  >
                    <Download className="h-3.5 w-3.5" /> İndir{item.overdue && item.remaining > 0 ? " · CEZA" : ""}
                  </button>
                  <button
                    type="button"
                    disabled={busy || payingId === item.id || Number(item.remaining || 0) <= 0}
                    onClick={() => void payNow(item)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#00a8c4] px-3 py-1.5 text-[10px] font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <CreditCard className="h-3.5 w-3.5" /> Şimdi Öde
                  </button>
                </div>
                {payErrors[item.id] ? (
                  <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2">
                    <p className="text-[11px] font-bold text-rose-800">{payErrors[item.id]}</p>
                    <button
                      type="button"
                      disabled={busy || payingId === item.id || Number(item.remaining || 0) <= 0}
                      onClick={() => void payNow(item)}
                      className="mt-1.5 text-[10px] font-black text-[#008fac]"
                    >
                      Tekrar dene
                    </button>
                  </div>
                ) : null}
              </article>
            )) : (
              <EmptyRow
                icon={Wallet}
                title={paymentFilter === "overdue" ? "Gecikmiş ödeme yok" : paymentFilter === "open" ? "Açık dönem yok" : "Aylık ödeme satırı yok"}
                hint={paymentFilter === "all" ? "Admin dönem ekleyince burada görünür." : "Filtreyi Tümü yaparak tüm dönemleri görün."}
              />
            )}
          </div>
        </div>
        <div className="rounded-[22px] border border-[#dce7e9] bg-white p-5">
          <h2 className="text-[18px] font-black">Ürün, hizmet, fatura</h2>
          <div className="mt-4 space-y-2">
            {lines.length ? lines.map((item) => (
              <article key={item.id} className="rounded-xl bg-[#f6f9fa] p-3">
                <p className="text-[8px] font-black uppercase text-[#00a8c4]">{CATALOG_KIND_LABELS[item.kind]}</p>
                <p className="mt-1 text-[13px] font-black">{item.title}</p>
                <p className="mt-1 text-[11px] text-[#64767e]">{item.quantity} adet · {money(item.amount)}</p>
              </article>
            )) : <EmptyRow icon={Receipt} title="Ürün veya fatura yok" hint="Satır eklenince tutar burada durur." />}
          </div>
        </div>
      </div>
      <button disabled={busy} onClick={() => void onRefresh().catch((error) => onError(error instanceof Error ? error.message : "Yenilenemedi."))} className="text-[10px] font-black text-[#008fac]">Listeyi yenile</button>
    </section>
  );
}

function contractSignLabel(status?: string) {
  if (status === "approved") return "Onaylandı";
  if (status === "rejected") return "Reddedildi · yeniden imzala";
  if (status === "signed") return "İncelemede";
  return "İmza bekleniyor";
}

function needsCustomerSign(item: PortalContract) {
  if (!item.current) return false;
  const status = item.signStatus || "pending";
  return status === "pending" || status === "rejected" || status === "";
}

function signRank(status?: string) {
  if (status === "rejected" || !status || status === "pending") return 0;
  if (status === "signed") return 1;
  if (status === "approved") return 2;
  return 3;
}

export function ContractActionCard({
  contracts,
  onOpen,
}: {
  contracts: PortalContract[];
  onOpen: () => void;
}) {
  const current = (contracts || []).filter((item) => item.current);
  if (!current.length) return null;
  const needSign = current.filter(needsCustomerSign);
  const inReview = current.filter((item) => item.signStatus === "signed");
  const rejected = current.filter((item) => item.signStatus === "rejected");
  if (!needSign.length && !inReview.length) return null;
  const urgent = needSign.length > 0;
  const focus = rejected[0] || needSign[0] || inReview[0];
  const title = rejected.length
    ? "Sözleşme reddedildi"
    : urgent
      ? "İmza bekleyen sözleşme"
      : "İmza incelemede";
  const detail = rejected.length
    ? `${rejected.length} sözleşme yeniden imza istiyor. Red gerekçesini okuyup imzalayın.`
    : urgent
      ? `${needSign.length} güncel sözleşme imzanızı bekliyor. Metni okuyup imza alanına çizin.`
      : `${inReview.length} imza Hatay360 incelemesinde. Onaylanınca PDF'de onay damgası görünür.`;
  const downloadFocus = async () => {
    if (!focus) return;
    try {
      await openContractFile(`/api/customer/contracts/${focus.id}/file?download=1`, focus.fileName || `hatay360-sozlesme-${focus.id}.pdf`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Sözleşme indirilemedi.");
    }
  };
  return (
    <div className={`mt-5 w-full rounded-[22px] border p-4 text-left ${urgent ? "border-violet-200 bg-violet-50" : "border-sky-200 bg-sky-50"}`}>
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${urgent ? "text-violet-700" : "text-sky-700"}`}>Sözleşme</p>
            <p className="mt-1 text-[18px] font-black text-[#102b35]">{title}</p>
          </div>
          <StatusDot
            kind={contractSignDotKind(urgent ? (rejected.length ? "rejected" : "pending") : "signed")}
            label={urgent ? (rejected.length ? "Yeniden imzala" : "İmza at") : "İncelemede"}
          />
        </div>
        <p className="mt-2 text-[11px] font-bold text-[#49616b]">{detail}</p>
        {focus ? <p className="mt-1 text-[10px] font-bold text-[#64767e]">{focus.title || focus.fileName}</p> : null}
        <p className="mt-2 text-[10px] font-black text-[#008fac]">{urgent ? "İmzaya git →" : "Sözleşmeleri gör →"}</p>
      </button>
      {focus ? (
        <button
          type="button"
          onClick={() => void downloadFocus()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#c9dde3] bg-white/80 px-3 py-1.5 text-[10px] font-black text-[#007f98]"
        >
          <Download className="h-3.5 w-3.5" /> PDF indir
        </button>
      ) : null}
    </div>
  );
}

export function CustomerContractsPanel({
  contracts,
  busy,
  onError,
  onRefresh,
}: {
  contracts: PortalContract[];
  busy: boolean;
  onError: (message: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [signature, setSignature] = useState("");
  const [signingId, setSigningId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "need_sign" | "review" | "done">("all");
  const [autoOpened, setAutoOpened] = useState(false);

  const currentList = useMemo(() => (contracts || []).filter((item) => item.current), [contracts]);
  const needSignCount = currentList.filter(needsCustomerSign).length;
  const reviewCount = currentList.filter((item) => item.signStatus === "signed").length;
  const doneCount = currentList.filter((item) => item.signStatus === "approved").length;

  const grouped = useMemo(() => {
    const map = new Map<number, PortalContract[]>();
    for (const item of contracts || []) {
      const list = map.get(item.familyId) || [];
      list.push(item);
      map.set(item.familyId, list);
    }
    const groups = [...map.values()].map((group) => [...group].sort((a, b) => Number(b.version) - Number(a.version) || Number(b.id) - Number(a.id)));
    groups.sort((a, b) => {
      const ca = a.find((item) => item.current) || a[0];
      const cb = b.find((item) => item.current) || b[0];
      return signRank(ca?.signStatus) - signRank(cb?.signStatus) || Number(cb?.id || 0) - Number(ca?.id || 0);
    });
    return groups;
  }, [contracts]);

  const visibleGroups = useMemo(() => {
    if (filter === "all") return grouped;
    return grouped.filter((group) => {
      const current = group.find((item) => item.current);
      if (!current) return false;
      if (filter === "need_sign") return needsCustomerSign(current);
      if (filter === "review") return current.signStatus === "signed";
      return current.signStatus === "approved";
    });
  }, [filter, grouped]);

  useEffect(() => {
    if (autoOpened) return;
    const preferred = currentList.find(needsCustomerSign)?.id || null;
    if (preferred) {
      setSigningId(preferred);
      setFilter("need_sign");
    }
    setAutoOpened(true);
  }, [autoOpened, currentList]);

  const openSign = (id: number) => {
    setSignature("");
    setSigningId(id);
  };

  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("signed") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      onError("İmzalı PDF veya JPG seçin.");
      return;
    }
    try {
      const payload = await contractFilePayload(file);
      await apiRequest("/api/customer/contracts", { method: "POST", body: JSON.stringify({ title, ...payload }) });
      setTitle("");
      if (input) input.value = "";
      await onRefresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Sözleşme gönderilemedi.");
    }
  };

  const restore = async (item: PortalContract) => {
    try {
      await apiRequest(`/api/customer/contracts/${item.id}/restore`, { method: "POST", body: JSON.stringify({}) });
      await onRefresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Önceki kopya gönderilemedi.");
    }
  };

  const signContract = async (item: PortalContract) => {
    if (!signature) {
      onError("İmza alanına fare veya parmakla çizin.");
      return;
    }
    try {
      await apiRequest(`/api/customer/contracts/${item.id}/sign`, { method: "POST", body: JSON.stringify({ signature }) });
      setSignature("");
      setSigningId(null);
      await onRefresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "İmza kaydedilemedi.");
    }
  };

  return (
    <section className="mt-7 space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => setFilter("need_sign")} className={`rounded-2xl border p-4 text-left ${filter === "need_sign" ? "border-violet-300 bg-violet-50" : "border-[#dce7e9] bg-white"}`}>
          <p className="text-[9px] font-black uppercase tracking-wide text-[#84939a]">İmza bekliyor</p>
          <p className="mt-1 text-[22px] font-black">{needSignCount}</p>
        </button>
        <button type="button" onClick={() => setFilter("review")} className={`rounded-2xl border p-4 text-left ${filter === "review" ? "border-sky-300 bg-sky-50" : "border-[#dce7e9] bg-white"}`}>
          <p className="text-[9px] font-black uppercase tracking-wide text-[#84939a]">İncelemede</p>
          <p className="mt-1 text-[22px] font-black">{reviewCount}</p>
        </button>
        <button type="button" onClick={() => setFilter("done")} className={`rounded-2xl border p-4 text-left ${filter === "done" ? "border-emerald-300 bg-emerald-50" : "border-[#dce7e9] bg-white"}`}>
          <p className="text-[9px] font-black uppercase tracking-wide text-[#84939a]">Onaylı</p>
          <p className="mt-1 text-[22px] font-black">{doneCount}</p>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setFilter("all")} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${filter === "all" ? "bg-[#00a8c4] text-white" : "bg-[#eef4f6] text-[#49616b]"}`}>
          Tümü ({currentList.length})
        </button>
        <button type="button" onClick={() => setFilter("need_sign")} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${filter === "need_sign" ? "bg-violet-600 text-white" : "bg-[#eef4f6] text-[#49616b]"}`}>
          İmza bekliyor ({needSignCount})
        </button>
        <button type="button" onClick={() => setFilter("review")} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${filter === "review" ? "bg-sky-600 text-white" : "bg-[#eef4f6] text-[#49616b]"}`}>
          İncelemede ({reviewCount})
        </button>
        <button type="button" onClick={() => setFilter("done")} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${filter === "done" ? "bg-emerald-600 text-white" : "bg-[#eef4f6] text-[#49616b]"}`}>
          Onaylı ({doneCount})
        </button>
      </div>

      {needSignCount > 0 ? (
        <div className="rounded-[22px] border border-violet-200 bg-violet-50 p-4">
          <p className="text-[13px] font-black text-[#102b35]">Önce imzanızı tamamlayın</p>
          <p className="mt-1 text-[11px] font-bold text-[#49616b]">Güncel sözleşmeyi okuyun, imza alanına çizin ve kaydedin. Hatay360 onayından sonra durum Onaylı olur.</p>
        </div>
      ) : null}

      <form onSubmit={upload} className="rounded-[22px] border border-[#dce7e9] bg-white p-5">
        <h2 className="text-[18px] font-black">İmzalı PDF / JPG gönderin</h2>
        <p className="mt-2 text-[11px] leading-relaxed text-[#64767e]">Elle imzaladıysanız dosyayı buradan yükleyin (en fazla 8 MB). Dijital imza için aşağıdaki listeden «İmzala» kullanın.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Sözleşme adı" className="rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] outline-none focus:border-[#00a8c4]" />
          <input name="signed" type="file" accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg" className="rounded-xl border border-[#dbe5e8] px-3 py-2 text-[12px]" />
          <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#008fac] px-4 py-3 text-[11px] font-black text-white"><Upload className="h-4 w-4" /> Gönder</button>
        </div>
      </form>
      <div className="space-y-3">
        {visibleGroups.length ? visibleGroups.map((group) => {
          const current = group.find((item) => item.current);
          const highlight = current && needsCustomerSign(current);
          return (
          <article key={group[0].familyId} className={`rounded-[22px] border bg-white p-4 ${highlight ? "border-violet-300 ring-1 ring-violet-200" : "border-[#dce7e9]"}`}>
            {group.map((item) => {
              const canSign = item.current && item.signStatus !== "approved";
              const primarySign = needsCustomerSign(item);
              return (
              <div key={item.id} className="border-t border-[#edf2f3] py-3 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-black">{item.title || item.fileName} · v{item.version}</p>
                      <StatusDot kind={contractSignDotKind(item.signStatus)} label={contractSignLabel(item.signStatus)} />
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200"><ShieldCheck className="h-3 w-3" /> AvcKayıtlı</span>
                    </div>
                    <p className="mt-1 text-[10px] text-[#87969c]">
                      {item.current ? "Güncel kopya" : "Önceki kopya"}
                      {item.signedAt ? ` · imza ${new Date(item.signedAt).toLocaleString("tr-TR")}` : ""}
                    </p>
                    {item.signStatus === "rejected" && item.signReason ? <p className="mt-1 text-[11px] font-bold text-rose-700">Red: {item.signReason}</p> : null}
                    {item.signStatus === "signed" ? <p className="mt-1 text-[11px] font-bold text-sky-700">İmzanız alındı; Hatay360 onayı bekleniyor.</p> : null}
                    {item.signStatus === "approved" ? <p className="mt-1 text-[11px] font-bold text-emerald-700">Onaylandı{item.signReason ? ` · ${item.signReason}` : ""}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => void openContractFile(`/api/customer/contracts/${item.id}/file`).catch((error) => onError(error instanceof Error ? error.message : "Açılamadı."))} className="inline-flex items-center gap-1 rounded-full bg-[#e7f7fa] px-3 py-1.5 text-[9px] font-black text-[#007f98]"><FileText className="h-3 w-3" /> Gör</button>
                    <button type="button" onClick={() => void openContractFile(`/api/customer/contracts/${item.id}/file?download=1`, item.fileName).catch((error) => onError(error instanceof Error ? error.message : "İndirilemedi."))} className="inline-flex items-center gap-1 rounded-full border border-[#dbe5e8] px-3 py-1.5 text-[9px] font-black text-[#49616b]"><Download className="h-3 w-3" /> İndir</button>
                    {!item.current && <button type="button" onClick={() => void restore(item)} className="inline-flex items-center gap-1 rounded-full bg-[#00a8c4] px-3 py-1.5 text-[9px] font-black text-white"><RotateCcw className="h-3 w-3" /> Bize geri yükle</button>}
                    {primarySign ? (
                      <button type="button" onClick={() => openSign(item.id)} className="rounded-full bg-violet-700 px-3 py-1.5 text-[9px] font-black text-white">
                        {item.signStatus === "rejected" ? "Yeniden imzala" : "İmzala"}
                      </button>
                    ) : null}
                    {canSign && item.signStatus === "signed" ? (
                      <button type="button" onClick={() => openSign(item.id)} className="rounded-full border border-[#dbe5e8] px-3 py-1.5 text-[9px] font-black text-[#49616b]">
                        İmzayı değiştir
                      </button>
                    ) : null}
                  </div>
                </div>
                {item.current && item.bodyHtml ? <div className="mt-3 max-h-48 overflow-auto rounded-xl bg-[#f7fbfc] p-3 text-[12px] leading-relaxed text-[#405963]" dangerouslySetInnerHTML={{ __html: item.bodyHtml.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "") }} /> : null}
                {signingId === item.id && canSign ? (
                  <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/40 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-violet-800">İmza alanı</p>
                    <p className="mt-1 text-[10px] font-bold text-[#49616b]">Fare veya parmakla imzanızı çizin, sonra kaydedin.</p>
                    <SignaturePad value={signature} onChange={setSignature} />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" disabled={busy} onClick={() => void signContract(item)} className="rounded-xl bg-[#00a8c4] px-3 py-2 text-[10px] font-black text-white">İmzayı kaydet</button>
                      <button type="button" onClick={() => { setSigningId(null); setSignature(""); }} className="rounded-xl border border-[#dbe5e8] px-3 py-2 text-[10px] font-black text-[#49616b]">Vazgeç</button>
                    </div>
                  </div>
                ) : null}
              </div>
              );
            })}
          </article>
          );
        }) : (
          <EmptyRow
            icon={FileText}
            title={filter === "need_sign" ? "İmza bekleyen yok" : filter === "review" ? "İncelemede sözleşme yok" : filter === "done" ? "Onaylı sözleşme yok" : "Sözleşme yok"}
            hint={filter === "all" ? "Admin sözleşme atayınca burada imzalanır." : "Filtreyi Tümü yaparak tüm kopyaları görün."}
          />
        )}
      </div>
    </section>
  );
}
