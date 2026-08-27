import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";
import { formatTry } from "../lib/payment-balance";

type ExtraRow = {
  id: number;
  name: string;
  description: string;
  price: number;
  active?: boolean;
};

const EXTRA_TEMPLATES = [
  { name: "SSL sertifikası", description: "HTTPS ve tarayıcı kilit ikonu. Yıllık yenileme." },
  { name: "Logo / kimlik", description: "Logo, renk ve marka kimliği çalışması." },
  { name: "Ek sayfa", description: "Mevcut siteye ek içerik sayfası." },
  { name: "Google Ads kurulumu", description: "Hesap, dönüşüm ve ilk kampanya kurulumu. Medya bütçesi ayrıdır." },
  { name: "Google Maps kaydı", description: "İşletme profili, kategori, NAP ve doğrulama. Sıra garantisi yok." },
  { name: "Site bakım", description: "Aylık güncelleme, yedek ve güvenlik kontrolü." },
] as const;

const fieldClass = "mt-1 w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-[12px] font-bold text-white outline-none focus:border-[#00a8c4]";
const labelClass = "text-[10px] font-black uppercase tracking-wide text-white/50";

export function AdminExtrasPanel() {
  const [rows, setRows] = useState<ExtraRow[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", active: true });
  const [editingId, setEditingId] = useState(0);
  const priceRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const result = await apiRequest<{ extras: ExtraRow[] }>("/api/admin/extra-services");
      setRows(result.extras || []);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ek hizmetler yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setEditingId(0);
    setForm({ name: "", description: "", price: "", active: true });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const body = JSON.stringify({
        name: form.name,
        description: form.description,
        price: Number(form.price || 0),
        active: form.active,
      });
      const result = editingId
        ? await apiRequest<{ extras: ExtraRow[] }>(`/api/admin/extra-services/${editingId}`, { method: "PUT", body })
        : await apiRequest<{ extras: ExtraRow[] }>("/api/admin/extra-services", { method: "POST", body });
      setRows(result.extras || []);
      setNotice(editingId ? "Hizmet güncellendi." : "Hizmet eklendi.");
      resetForm();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const applyTemplate = (tpl: (typeof EXTRA_TEMPLATES)[number]) => {
    setEditingId(0);
    setForm({ name: tpl.name, description: tpl.description, price: "", active: true });
    requestAnimationFrame(() => priceRef.current?.focus());
  };

  const deactivate = async (item: ExtraRow) => {
    setBusy(true);
    try {
      const result = await apiRequest<{ extras: ExtraRow[] }>(`/api/admin/extra-services/${item.id}`, { method: "DELETE" });
      setRows(result.extras || []);
      setNotice("Hizmet mağazadan gizlendi.");
      if (editingId === item.id) resetForm();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gizlenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const activate = async (item: ExtraRow) => {
    setBusy(true);
    try {
      const result = await apiRequest<{ extras: ExtraRow[] }>(`/api/admin/extra-services/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...item, active: true }),
      });
      setRows(result.extras || []);
      setNotice("Hizmet mağazada görünür.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gösterilemedi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Upsell mağazası</p>
        <h2 className="mt-1 text-[22px] font-black text-white">Ek Hizmetler</h2>
        <p className="mt-1 max-w-xl text-[12px] font-bold text-white/50">
          Müşteri talep edince taslak katalog satırı oluşur. Onaylayınca faturaya yansır; ödeme dönemi otomatik açılmaz.
        </p>
      </div>

      {notice ? <p className="text-[12px] font-bold text-[#7ee0ec]">{notice}</p> : null}

      <div>
        <p className="text-[10px] font-black uppercase tracking-wide text-white/45">Taslak — kaydetmeden fiyat yazın</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Ek hizmet taslakları">
          {EXTRA_TEMPLATES.map((tpl) => (
            <button
              key={tpl.name}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-black text-white/80 transition hover:border-[#00a8c4] hover:text-white"
            >
              {tpl.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={(event) => void save(event)} className="grid gap-3 rounded-3xl border border-white/10 bg-[#18181f] p-5 md:grid-cols-2">
        <label className={labelClass}>Ad<input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={fieldClass} /></label>
        <label className={labelClass}>Fiyat (₺)<input ref={priceRef} type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className={fieldClass} /><span className="mt-1 block font-bold normal-case tracking-normal text-white/35">0 = müşteride Teklifte</span></label>
        <label className={`md:col-span-2 ${labelClass}`}>Açıklama<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={fieldClass} /></label>
        <label className="flex items-center gap-2 text-[11px] font-black text-white/70">
          <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
          Mağazada görünür
        </label>
        <div className="flex justify-end gap-2 md:col-span-2">
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-xl border border-white/15 px-4 py-2.5 text-[11px] font-black text-white/70">
              Vazgeç
            </button>
          ) : null}
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black text-white disabled:opacity-50">
            <Plus className="h-4 w-4" /> {editingId ? "Güncelle" : "Hizmet ekle"}
          </button>
        </div>
      </form>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#18181f]">
        {!rows.length ? (
          <div className="p-6">
            <EmptyRow dark icon={ShoppingBag} title="Mağaza boş" hint="Yukarıdan SSL, logo, ek sayfa gibi ürünler ekleyin." />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {rows.map((item) => (
              <article key={item.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[14px] font-black text-white">{item.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${item.active ? "bg-emerald-500/15 text-emerald-200" : "bg-white/10 text-white/45"}`}>
                      {item.active ? "Aktif" : "Gizli"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/50">{item.description || "Açıklama yok."}</p>
                  <p className="mt-2 text-[13px] font-black text-[#7ee0ec]">{formatTry(item.price)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setForm({ name: item.name, description: item.description || "", price: String(item.price ?? ""), active: item.active !== false });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-[10px] font-black text-white/75"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Düzenle
                  </button>
                  {item.active ? (
                    <button type="button" onClick={() => void deactivate(item)} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300/20 px-3 py-2 text-[10px] font-black text-rose-200">
                      <Trash2 className="h-3.5 w-3.5" /> Gizle
                    </button>
                  ) : (
                    <button type="button" onClick={() => void activate(item)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/20 px-3 py-2 text-[10px] font-black text-emerald-200">
                      <Eye className="h-3.5 w-3.5" /> Göster
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
