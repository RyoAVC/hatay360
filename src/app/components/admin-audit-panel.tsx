import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, RefreshCw, Search } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";
import {
  AUDIT_ACTIONS,
  AUDIT_ACTOR_TYPES,
  auditActionLabel,
  auditActionTone,
  auditActorLabel,
  formatAuditTime,
  type AuditLog,
  type AuditMeta,
  type AuditResponse,
} from "../lib/audit";

type CustomerOption = { id: number; company_name: string };

const fieldClass =
  "mt-1 w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-[12px] font-bold text-white outline-none focus:border-[#00a8c4]";
const labelClass = "text-[10px] font-black uppercase tracking-wide text-white/50";

const DAY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Son 24 saat" },
  { value: 7, label: "Son 7 gün" },
  { value: 30, label: "Son 30 gün" },
  { value: 90, label: "Son 90 gün" },
  { value: 180, label: "Son 180 gün" },
];

const PER_PAGE = 50;

export function AdminAuditPanel() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<AuditMeta>({ page: 1, perPage: PER_PAGE, total: 0 });
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [action, setAction] = useState("");
  const [actorType, setActorType] = useState("");
  const [days, setDays] = useState(30);
  const [q, setQ] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const params = new URLSearchParams();
      if (customerId) params.set("customerId", customerId);
      if (action) params.set("action", action);
      if (actorType) params.set("actorType", actorType);
      if (searchTerm) params.set("q", searchTerm);
      params.set("days", String(days));
      params.set("page", String(page));
      params.set("perPage", String(PER_PAGE));
      const result = await apiRequest<AuditResponse>(`/api/admin/audit?${params.toString()}`);
      setRows(result.rows || []);
      setMeta(result.meta || { page: 1, perPage: PER_PAGE, total: 0 });
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Aktivite kaydı yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }, [customerId, action, actorType, searchTerm, days, page]);

  const loadCustomers = useCallback(async () => {
    try {
      const result = await apiRequest<{ customers: CustomerOption[] }>("/api/admin/customers");
      setCustomers((result.customers || []).map((item) => ({ id: item.id, company_name: item.company_name })));
    } catch {
      // müşteri listesi opsiyonel; hata sessiz geçilir
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  // Filtre değişince ilk sayfaya dön.
  useEffect(() => {
    setPage(1);
  }, [customerId, action, actorType, searchTerm, days]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(meta.total / (meta.perPage || PER_PAGE))), [meta]);
  const companyName = useCallback(
    (id: number | null) => (id ? customers.find((item) => item.id === id)?.company_name || `#${id}` : "—"),
    [customers],
  );

  const applySearch = () => setSearchTerm(q.trim());

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3ec8dc]">Denetim / İzleme</p>
          <h2 className="mt-2 flex items-center gap-2 text-[26px] font-black">
            <ClipboardList className="h-6 w-6 text-[#00a8c4]" /> Aktivite Kaydı
          </h2>
          <p className="mt-2 max-w-2xl text-[12px] text-white/55">
            Giriş, fatura görüntüleme, dosya indirme, onay yanıtları, destek talepleri, kullanıcı ekleme, aşama ve yenileme
            gibi kritik işlemlerin kaydı. Kayıtlar ayrı tabloda tutulur ve 180 gün sonra otomatik temizlenir.
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[11px] font-black text-white/70"
        >
          <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Yenile
        </button>
      </div>

      {notice ? (
        <p className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-[11px] font-bold text-cyan-100">{notice}</p>
      ) : null}

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-[#18181f] p-4 md:grid-cols-2 xl:grid-cols-5">
        <label className={labelClass}>
          Müşteri
          <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className={fieldClass}>
            <option value="">Tümü</option>
            {customers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.company_name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          İşlem türü
          <select value={action} onChange={(event) => setAction(event.target.value)} className={fieldClass}>
            <option value="">Tümü</option>
            {AUDIT_ACTIONS.map((item) => (
              <option key={item} value={item}>
                {auditActionLabel(item)}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Aktör türü
          <select value={actorType} onChange={(event) => setActorType(event.target.value)} className={fieldClass}>
            <option value="">Tümü</option>
            {AUDIT_ACTOR_TYPES.map((item) => (
              <option key={item} value={item}>
                {auditActorLabel(item)}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Gün aralığı
          <select value={days} onChange={(event) => setDays(Number(event.target.value))} className={fieldClass}>
            {DAY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Serbest arama (aktör / hedef)
          <div className="mt-1 flex gap-2">
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applySearch();
                }
              }}
              placeholder="e-posta, hedef…"
              className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-[12px] font-bold text-white outline-none focus:border-[#00a8c4]"
            />
            <button
              type="button"
              onClick={applySearch}
              className="shrink-0 rounded-xl bg-[#00a8c4] px-3 py-2.5 text-[11px] font-black text-white"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#18181f]">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 text-[9px] font-black uppercase tracking-wide text-white/45">
              <th className="px-4 py-3">Tarih / saat</th>
              <th className="px-4 py-3">Aktör</th>
              <th className="px-4 py-3">İşlem</th>
              <th className="px-4 py-3">Hedef</th>
              <th className="px-4 py-3">Müşteri</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 text-[11px] text-white/80 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-bold tabular-nums text-white/60">{formatAuditTime(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-black text-white">{row.actorLabel || "—"}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[#7ee0ec]">{auditActorLabel(row.actorType)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full border px-2.5 py-1 text-[9px] font-black ${auditActionTone(row.action)}`}>
                      {auditActionLabel(row.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-white/70">{row.target || "—"}</td>
                  <td className="px-4 py-3 font-bold text-white/70">{companyName(row.customerId)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[10px] text-white/45">{row.ip || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-0 py-0">
                  <EmptyRow dark icon={ClipboardList} title="Kayıt bulunamadı" hint="Filtreleri genişletin veya gün aralığını artırın." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-bold text-white/50">
          Toplam {meta.total} kayıt · Sayfa {meta.page} / {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy || page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-xl border border-white/15 px-3 py-2 text-[11px] font-black text-white/70 disabled:opacity-40"
          >
            ← Önceki
          </button>
          <button
            type="button"
            disabled={busy || page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-xl border border-white/15 px-3 py-2 text-[11px] font-black text-white/70 disabled:opacity-40"
          >
            Sonraki →
          </button>
        </div>
      </div>
    </div>
  );
}
