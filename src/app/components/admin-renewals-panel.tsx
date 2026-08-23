import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarClock, Plus, RefreshCw, Trash2 } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";
import { formatTry } from "../lib/payment-balance";
import type { OpsAlertTarget } from "./admin-ops-alerts";
import {
  RENEWAL_KINDS,
  RENEWAL_KIND_LABELS,
  RENEWAL_STATUS_LABELS,
  renewalCountdownLabel,
  formatRenewDate,
  type Renewal,
  type RenewalBucket,
  type RenewalKind,
  type RenewalStatus,
} from "../lib/renewals";

type BucketFilter = "all" | "overdue" | "due" | "upcoming";
type CustomerOption = { id: number; company_name: string };

const BUCKET_TONE: Record<RenewalBucket, string> = {
  overdue: "bg-rose-500/15 text-rose-200 border-rose-400/30",
  due: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  upcoming: "bg-cyan-500/15 text-cyan-100 border-cyan-400/30",
  later: "bg-white/5 text-white/60 border-white/10",
};

const STATUS_TONE: Record<RenewalStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  cancelled: "bg-white/5 text-white/50 border-white/10",
  done: "bg-cyan-500/15 text-cyan-100 border-cyan-400/30",
};

const fieldClass = "mt-1 w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-[12px] font-bold text-white outline-none focus:border-[#00a8c4]";
const labelClass = "text-[10px] font-black uppercase tracking-wide text-white/50";

export function AdminRenewalsPanel({ opsJump = null }: { opsJump?: { target: OpsAlertTarget; token: number } | null }) {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [filter, setFilter] = useState<BucketFilter>("all");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [cronMeta, setCronMeta] = useState<{ lastRunAt?: string; inserted?: number; scanned?: number; configured?: boolean } | null>(null);
  const [form, setForm] = useState({
    customerId: "",
    kind: "domain" as RenewalKind,
    label: "",
    renewDate: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
    amount: "",
    note: "",
  });

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const result = await apiRequest<{ renewals: Renewal[] }>("/api/admin/renewals");
      setRenewals(result.renewals || []);
      setNotice("");
      try {
        const cron = await apiRequest<{ lastRunAt?: string; inserted?: number; scanned?: number; configured?: boolean }>(
          "/api/admin/cron/renewals",
        );
        setCronMeta(cron);
      } catch {
        setCronMeta(null);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Yenilemeler yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const result = await apiRequest<{ customers: CustomerOption[] }>("/api/admin/customers");
      const list = (result.customers || []).map((item) => ({ id: item.id, company_name: item.company_name }));
      setCustomers(list);
      setForm((current) => (current.customerId ? current : { ...current, customerId: list[0] ? String(list[0].id) : "" }));
    } catch {
      // müşteri listesi opsiyonel; hata sessiz geçilir
    }
  }, []);

  useEffect(() => {
    void load();
    void loadCustomers();
  }, [load, loadCustomers]);

  useEffect(() => {
    if (opsJump?.target === "renewals") {
      setFilter((current) => (current === "all" ? "overdue" : current));
    }
  }, [opsJump]);

  const counts = useMemo(
    () => ({
      all: renewals.length,
      overdue: renewals.filter((item) => item.status === "active" && item.bucket === "overdue").length,
      due: renewals.filter((item) => item.status === "active" && item.bucket === "due").length,
      upcoming: renewals.filter((item) => item.status === "active" && item.bucket === "upcoming").length,
    }),
    [renewals],
  );

  const visible = useMemo(() => {
    if (filter === "all") return renewals;
    return renewals.filter((item) => item.status === "active" && item.bucket === filter);
  }, [renewals, filter]);

  const addRenewal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.customerId) {
      setNotice("Önce bir müşteri seçin.");
      return;
    }
    setBusy(true);
    try {
      const result = await apiRequest<{ renewals: Renewal[] }>(`/api/admin/customers/${form.customerId}/renewals`, {
        method: "POST",
        body: JSON.stringify({
          kind: form.kind,
          label: form.label,
          renew_date: form.renewDate,
          amount: Number(form.amount || 0),
          note: form.note,
        }),
      });
      setNotice(`${result.renewals.length ? "Yenileme kaydı eklendi." : "Kaydedildi."}`);
      setForm({ ...form, label: "", amount: "", note: "" });
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Yenileme eklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const updateRow = async (event: FormEvent<HTMLFormElement>, item: Renewal) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await apiRequest(`/api/admin/renewals/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          kind: String(data.get("kind") || item.kind),
          label: String(data.get("label") || ""),
          renew_date: String(data.get("renewDate") || item.renewDate),
          amount: Number(data.get("amount") || 0),
          note: String(data.get("note") || ""),
          status: String(data.get("status") || item.status),
        }),
      });
      setNotice("Yenileme güncellendi.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (item: Renewal, status: RenewalStatus) => {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/renewals/${item.id}`, { method: "PUT", body: JSON.stringify({ status }) });
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Durum güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const removeRow = async (item: Renewal) => {
    if (!window.confirm(`${item.companyName} için "${item.label || RENEWAL_KIND_LABELS[item.kind]}" yenileme kaydını silmek istiyor musunuz?`)) return;
    setBusy(true);
    try {
      await apiRequest(`/api/admin/renewals/${item.id}`, { method: "DELETE" });
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  const filters: { id: BucketFilter; label: string; count: number; activeTone: string }[] = [
    { id: "overdue", label: "Süresi geçmiş", count: counts.overdue, activeTone: "bg-rose-500 text-white" },
    { id: "due", label: "14 gün içinde", count: counts.due, activeTone: "bg-amber-500 text-[#071b22]" },
    { id: "upcoming", label: "Yaklaşan", count: counts.upcoming, activeTone: "bg-cyan-500 text-white" },
    { id: "all", label: "Tümü", count: counts.all, activeTone: "bg-[#00a8c4] text-white" },
  ];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3ec8dc]">Yenileme Modülü</p>
          <h2 className="mt-2 text-[26px] font-black">Yenilemeler</h2>
          <p className="mt-2 max-w-2xl text-[12px] text-white/55">Alan adı, hosting, bakım paketi ve SSL gibi yenilenebilir hizmetlerin bitiş tarihlerini takip edin. Süresi geçmiş ve yaklaşan kayıtlar burada ve üst uyarı çubuğunda görünür. E-posta/SMS bildirimi bu aşamada gönderilmez.</p>
          <p className="mt-2 text-[11px] font-bold text-white/45">
            Son cron:{" "}
            {cronMeta?.lastRunAt
              ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(cronMeta.lastRunAt))
              : "henüz çalışmadı"}
            {typeof cronMeta?.inserted === "number" ? ` · son eklenen ${cronMeta.inserted}` : ""}
            {cronMeta?.configured === false ? " · cron kapalı" : ""}
          </p>
        </div>
        <button onClick={() => void load()} className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[11px] font-black text-white/70"><RefreshCw className="h-4 w-4" /> Yenile</button>
      </div>

      {notice ? <p className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-[11px] font-bold text-cyan-100">{notice}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filters.map((item) => (
          <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-2xl border px-4 py-3 text-left ${filter === item.id ? "border-[#00a8c4]/50 bg-[#00a8c4]/10" : "border-white/10 bg-[#18181f]"}`}>
            <p className="text-[10px] font-black uppercase tracking-wide text-white/50">{item.label}</p>
            <p className="mt-1 text-[28px] font-black text-white">{item.count}</p>
          </button>
        ))}
      </div>

      <form onSubmit={addRenewal} className="rounded-2xl border border-white/10 bg-[#18181f] p-4">
        <h3 className="flex items-center gap-2 text-[14px] font-black"><Plus className="h-4 w-4 text-[#00a8c4]" /> Yenileme ekle</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className={`md:col-span-1 ${labelClass}`}>Müşteri
            <select value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} className={fieldClass}>
              {customers.length ? null : <option value="">Müşteri yok</option>}
              {customers.map((item) => <option key={item.id} value={item.id}>{item.company_name}</option>)}
            </select>
          </label>
          <label className={labelClass}>Tür
            <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as RenewalKind })} className={fieldClass}>
              {RENEWAL_KINDS.map((kind) => <option key={kind} value={kind}>{RENEWAL_KIND_LABELS[kind]}</option>)}
            </select>
          </label>
          <label className={labelClass}>Etiket<input value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} placeholder="örn. site alan adı" className={fieldClass} /></label>
          <label className={labelClass}>Yenileme tarihi<input required type="date" value={form.renewDate} onChange={(event) => setForm({ ...form, renewDate: event.target.value })} className={fieldClass} /></label>
          <label className={labelClass}>Tutar (₺)<input type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className={fieldClass} /></label>
          <label className={labelClass}>Not<input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className={fieldClass} /></label>
        </div>
        <button disabled={busy || !form.customerId} className="mt-3 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black disabled:opacity-45">Kaydet</button>
      </form>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Yenileme filtreleri">
        {filters.map((item) => (
          <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={`rounded-full px-3 py-1.5 text-[11px] font-black ${filter === item.id ? item.activeTone : "bg-white/5 text-white/60"}`}>
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length ? (
          visible.map((item) => (
            <form key={`${item.id}-${item.updatedAt}`} onSubmit={(event) => void updateRow(event, item)} className={`rounded-2xl border p-4 ${item.status === "active" && item.bucket === "overdue" ? "border-rose-300/30 bg-rose-950/20" : item.status === "active" && item.bucket === "due" ? "border-amber-300/25 bg-amber-950/15" : "border-white/10 bg-[#18181f]"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[#70dce9]">
                    <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                    <p className="text-[9px] font-black uppercase tracking-wide">{item.companyName}</p>
                  </div>
                  <h3 className="mt-1 text-[14px] font-black text-white">{item.label || RENEWAL_KIND_LABELS[item.kind]}</h3>
                  <p className="mt-1 text-[10px] font-bold text-white/45">{RENEWAL_KIND_LABELS[item.kind]} · {formatRenewDate(item.renewDate)}{item.amount ? ` · ${formatTry(item.amount)}` : ""}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${STATUS_TONE[item.status]}`}>{RENEWAL_STATUS_LABELS[item.status]}</span>
                  {item.status === "active" ? (
                    <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${BUCKET_TONE[item.bucket]}`}>{renewalCountdownLabel(item.daysLeft)}</span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <label className={labelClass}>Tür
                  <select name="kind" defaultValue={item.kind} className={fieldClass}>
                    {RENEWAL_KINDS.map((kind) => <option key={kind} value={kind}>{RENEWAL_KIND_LABELS[kind]}</option>)}
                  </select>
                </label>
                <label className={labelClass}>Etiket<input name="label" defaultValue={item.label} className={fieldClass} /></label>
                <label className={labelClass}>Yenileme tarihi<input name="renewDate" required type="date" defaultValue={item.renewDate} className={fieldClass} /></label>
                <label className={labelClass}>Tutar (₺)<input name="amount" type="number" min="0" step="0.01" defaultValue={item.amount} className={fieldClass} /></label>
                <label className={labelClass}>Durum
                  <select name="status" defaultValue={item.status} className={fieldClass}>
                    {(Object.keys(RENEWAL_STATUS_LABELS) as RenewalStatus[]).map((status) => <option key={status} value={status}>{RENEWAL_STATUS_LABELS[status]}</option>)}
                  </select>
                </label>
                <label className={labelClass}>Not<input name="note" defaultValue={item.note} className={fieldClass} /></label>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <button disabled={busy} className="rounded-full bg-[#00a8c4] px-3 py-1.5 text-[9px] font-black">Kaydet</button>
                {item.status !== "done" ? <button type="button" disabled={busy} onClick={() => void setStatus(item, "done")} className="rounded-full bg-cyan-400/10 px-3 py-1.5 text-[9px] font-black text-cyan-200">Yenilendi</button> : null}
                {item.status !== "active" ? <button type="button" disabled={busy} onClick={() => void setStatus(item, "active")} className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-[9px] font-black text-emerald-200">Aktif</button> : null}
                {item.status !== "cancelled" ? <button type="button" disabled={busy} onClick={() => void setStatus(item, "cancelled")} className="rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-black text-white/60">İptal</button> : null}
                <button type="button" disabled={busy} onClick={() => void removeRow(item)} className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 px-3 py-1.5 text-[9px] font-black text-rose-200"><Trash2 className="h-3 w-3" /> Sil</button>
              </div>
            </form>
          ))
        ) : (
          <EmptyRow dark icon={CalendarClock} title={filter === "overdue" ? "Süresi geçmiş yenileme yok" : filter === "due" ? "14 gün içinde yenileme yok" : filter === "upcoming" ? "Yaklaşan yenileme yok" : "Yenileme kaydı yok"} hint="Yukarıdaki formdan veya müşteri profilinden yenileme ekleyin." />
        )}
      </div>
    </div>
  );
}
