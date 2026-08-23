/**
 * Admin — Bayilik Şartları (marka bazlı).
 * Partner giriş / müşteri paneli / sözleşme ile bağlı değildir; yalnızca veri temeli + admin UI.
 */

import { useEffect, useState } from "react";
import { Handshake, Plus, Trash2, AlertTriangle, Save } from "lucide-react";
import { BRAND_LIST, type BrandId, DEFAULT_BRAND_ID } from "../lib/brand-config";
import {
  emptyBayilikKategori,
  formatBayilikBrandTitle,
  getBayilikSartlari,
  ODEME_PERIYODU_LABEL,
  resetBayilikSartlariToExample,
  saveBayilikSartlari,
  TEKRAR_TIPI_LABEL,
  type BayilikOdemePeriyodu,
  type BayilikSartlari,
  type BayilikTekrarTipi,
} from "../lib/bayilik-sartlari";

const EXAMPLE_NOTE =
  "Bu değerler örnektir, yayına almadan önce güncelleyin. Placeholder oranlar kesin / resmi komisyon değildir.";

export function AdminBayilikSartlariPanel() {
  const [brandId, setBrandId] = useState<BrandId>(DEFAULT_BRAND_ID);
  const [draft, setDraft] = useState<BayilikSartlari>(() => getBayilikSartlari(DEFAULT_BRAND_ID));
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft(getBayilikSartlari(brandId));
    setSavedFlash(false);
  }, [brandId]);

  const patch = (partial: Partial<BayilikSartlari>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const onSave = () => {
    const next = saveBayilikSartlari(brandId, draft);
    setDraft(next);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2200);
  };

  const onResetExample = () => {
    if (!window.confirm(`${formatBayilikBrandTitle(brandId)} örnek placeholder değerlerine sıfırlansın mı?`)) return;
    setDraft(resetBayilikSartlariToExample(brandId));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden />
          <div>
            <p className="text-[13px] font-black text-amber-100">Örnek / yer tutucu veriler</p>
            <p className="mt-1 text-[12px] leading-relaxed text-amber-100/75">{EXAMPLE_NOTE}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a8c4]/20 text-[#70dce9]">
              <Handshake className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[15px] font-black text-white">Bayilik şartları</p>
              <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-white/50">
                Marka bazlı komisyon kategorileri, katılım ücreti ve ödeme periyodu. Hatay360 ile Adana360 ayrı
                saklanır. Bayi paneli / sözleşme henüz bu veriyi okumaz — altyapı hazırlığıdır.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Marka seçimi">
          {BRAND_LIST.map((brand) => (
            <button
              key={brand.id}
              type="button"
              role="tab"
              aria-selected={brandId === brand.id}
              onClick={() => setBrandId(brand.id)}
              className={`rounded-xl px-4 py-2 text-[12px] font-black transition ${
                brandId === brand.id
                  ? "bg-[#00a8c4] text-white"
                  : "border border-white/15 text-white/65 hover:text-white"
              }`}
            >
              {brand.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">
            Hizmet kategorileri & komisyon
          </p>
          <button
            type="button"
            onClick={() => patch({ kategoriler: [...draft.kategoriler, emptyBayilikKategori()] })}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white/80"
          >
            <Plus className="h-3.5 w-3.5" /> Kategori ekle
          </button>
        </div>
        <p className="text-[11px] text-amber-200/70">Örnek: %20 / %12 / %15 — kesin oran değildir.</p>

        <div className="space-y-3">
          {draft.kategoriler.map((kat, index) => (
            <div key={kat.id} className="rounded-xl border border-white/10 bg-black/25 p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={kat.ad}
                  onChange={(e) => {
                    const kategoriler = draft.kategoriler.map((row, i) =>
                      i === index ? { ...row, ad: e.target.value } : row,
                    );
                    patch({ kategoriler });
                  }}
                  placeholder="Kategori adı"
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-[13px] font-bold text-white"
                />
                <button
                  type="button"
                  onClick={() => patch({ kategoriler: draft.kategoriler.filter((_, i) => i !== index) })}
                  className="rounded-lg border border-red-500/30 p-2 text-red-300"
                  aria-label="Kategoriyi sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-white/40">Tekrar tipi</span>
                  <select
                    value={kat.tekrarTipi}
                    onChange={(e) => {
                      const tekrarTipi = e.target.value as BayilikTekrarTipi;
                      const kategoriler = draft.kategoriler.map((row, i) =>
                        i === index ? { ...row, tekrarTipi } : row,
                      );
                      patch({ kategoriler });
                    }}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-[12px] text-white"
                  >
                    {(Object.keys(TEKRAR_TIPI_LABEL) as BayilikTekrarTipi[]).map((key) => (
                      <option key={key} value={key}>
                        {TEKRAR_TIPI_LABEL[key]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                    Komisyon oranı (%) — örnek
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={kat.komisyonOrani}
                    onChange={(e) => {
                      const komisyonOrani = Number(e.target.value);
                      const kategoriler = draft.kategoriler.map((row, i) =>
                        i === index ? { ...row, komisyonOrani } : row,
                      );
                      patch({ kategoriler });
                    }}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-2 text-[13px] font-bold text-white"
                  />
                </label>
              </div>
            </div>
          ))}
          {draft.kategoriler.length === 0 ? (
            <p className="text-[12px] text-white/45">Henüz kategori yok. “Kategori ekle” ile başlayın.</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-2">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Katılım ücreti</p>
          <p className="text-[11px] text-amber-200/70">Örnek placeholder: 5.000 TL — kesin ücret değildir.</p>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wide text-white/40">Tek seferlik (TL)</span>
            <input
              type="number"
              min={0}
              step={100}
              value={draft.katilimUcretiTl}
              onChange={(e) => patch({ katilimUcretiTl: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] font-bold text-white"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-2">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Ödeme / komisyon periyodu</p>
          <p className="text-[11px] text-white/45">Komisyonların hesaplanıp bayiye gösterilme sıklığı.</p>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wide text-white/40">Periyot</span>
            <select
              value={draft.odemePeriyodu}
              onChange={(e) => patch({ odemePeriyodu: e.target.value as BayilikOdemePeriyodu })}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[13px] font-bold text-white"
            >
              {(Object.keys(ODEME_PERIYODU_LABEL) as BayilikOdemePeriyodu[]).map((key) => (
                <option key={key} value={key}>
                  {ODEME_PERIYODU_LABEL[key]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[13px] font-black text-white hover:bg-[#008fac]"
        >
          <Save className="h-4 w-4" />
          {brandId === "hatay360" ? "Hatay360 kaydet" : "Adana360 kaydet"}
        </button>
        <button
          type="button"
          onClick={onResetExample}
          className="rounded-xl border border-white/15 px-4 py-2.5 text-[12px] font-bold text-white/70 hover:bg-white/5"
        >
          Örnek değerlere sıfırla
        </button>
        {savedFlash ? (
          <span className="text-[12px] font-bold text-emerald-300">Kaydedildi (marka config).</span>
        ) : null}
      </div>

      <p className="text-[11px] leading-relaxed text-white/35">
        API: <code className="text-white/50">getBayilikSartlari(&quot;{brandId}&quot;)</code> — ileride bayi paneli ve
        sözleşme bu fonksiyonu kullanacak. Şu an başka modül bağlamayın.
      </p>
    </div>
  );
}
