import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Globe, Plus, ExternalLink, Trash2, Rocket, Hammer, Save, Pencil } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { apiRequest } from "../lib/api";
import {
  buildDefaultConfig,
  SITE_CATEGORY_LABEL,
  SITE_STATUS_LABEL,
  type ManagedSite,
  type SiteCategory,
  type SiteConfig,
} from "../lib/site-templates";

const fieldClass =
  "mt-1 w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 text-[12px] font-bold text-white outline-none focus:border-[#00a8c4]";
const labelClass = "text-[10px] font-black uppercase tracking-wide text-white/50";

const emptyForm = {
  category: "taxi" as SiteCategory,
  slug: "",
  domain: "",
  name: "",
  ownerName: "",
  phone: "",
  city: "Hatay",
  district: "",
};

export function AdminSiteGeneratorPanel() {
  const [sites, setSites] = useState<ManagedSite[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(0);
  const [draft, setDraft] = useState<SiteConfig | null>(null);
  const [draftStatus, setDraftStatus] = useState<"construction" | "live">("construction");
  const [draftDomain, setDraftDomain] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const result = await apiRequest<{ sites: ManagedSite[] }>("/api/admin/sites");
      setSites(result.sites || []);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Siteler yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const config = buildDefaultConfig(form.category, {
        name: form.name,
        ownerName: form.ownerName,
        phone: form.phone,
        whatsapp: form.phone,
        city: form.city,
        district: form.district,
      });
      const result = await apiRequest<{ sites: ManagedSite[] }>("/api/admin/sites", {
        method: "POST",
        body: JSON.stringify({
          category: form.category,
          slug: form.slug || form.name,
          domain: form.domain,
          status: "construction",
          config,
        }),
      });
      setSites(result.sites || []);
      setNotice("Site oluşturuldu (yapım aşamasında). İçeriği düzenleyip yayına alabilirsiniz.");
      setForm(emptyForm);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  };

  const openEditor = (site: ManagedSite) => {
    setEditId(site.id);
    setDraft(JSON.parse(JSON.stringify(site.config)) as SiteConfig);
    setDraftStatus(site.status);
    setDraftDomain(site.domain);
  };

  const closeEditor = () => {
    setEditId(0);
    setDraft(null);
  };

  const saveEditor = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      const result = await apiRequest<{ sites: ManagedSite[] }>(`/api/admin/sites/${editId}`, {
        method: "PATCH",
        body: JSON.stringify({ config: draft, status: draftStatus, domain: draftDomain }),
      });
      setSites(result.sites || []);
      setNotice("Kaydedildi.");
      closeEditor();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (site: ManagedSite) => {
    setBusy(true);
    try {
      const next = site.status === "live" ? "construction" : "live";
      const result = await apiRequest<{ sites: ManagedSite[] }>(`/api/admin/sites/${site.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setSites(result.sites || []);
      setNotice(next === "live" ? "Site yayına alındı." : "Site yapım aşamasına alındı.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (site: ManagedSite) => {
    if (!window.confirm(`${site.slug} sitesi silinsin mi? Bu işlem geri alınamaz.`)) return;
    setBusy(true);
    try {
      const result = await apiRequest<{ sites: ManagedSite[] }>(`/api/admin/sites/${site.id}`, { method: "DELETE" });
      setSites(result.sites || []);
      setNotice("Site silindi.");
      if (editId === site.id) closeEditor();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  const patchDraft = (updater: (config: SiteConfig) => SiteConfig) => {
    setDraft((prev) => (prev ? updater(JSON.parse(JSON.stringify(prev)) as SiteConfig) : prev));
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Çoklu site</p>
        <h2 className="mt-1 text-[22px] font-black text-white">Site Üretici</h2>
        <p className="mt-1 max-w-2xl text-[12px] font-bold text-white/50">
          Kategori seçip müşteri sitesi üretin. Yeni site önce “yapım aşamasında” açılır; içeriği düzenleyip yayına
          alırsınız. Yayındaki site <code className="text-[#7ee0ec]">/s/&lt;slug&gt;</code> adresinden görüntülenir; alan
          adını (ör. taxireyhanli.com) Hostinger’dan bu adrese yönlendirebilirsiniz.
        </p>
      </div>

      {notice ? <p className="text-[12px] font-bold text-[#7ee0ec]">{notice}</p> : null}

      <form onSubmit={(event) => void create(event)} className="grid gap-3 rounded-3xl border border-white/10 bg-[#18181f] p-5 md:grid-cols-2">
        <label className={labelClass}>
          Kategori
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as SiteCategory })} className={fieldClass}>
            <option value="taxi">Taksi sitesi</option>
            <option value="generic">Genel kurumsal site</option>
          </select>
        </label>
        <label className={labelClass}>
          Slug (adres) <span className="normal-case text-white/35">/s/...</span>
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="taxireyhanli" className={fieldClass} />
        </label>
        <label className={labelClass}>
          İşletme adı
          <input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Reyhanlı Taksi" className={fieldClass} />
        </label>
        <label className={labelClass}>
          Sahip / sürücü adı
          <input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Mehmet Y." className={fieldClass} />
        </label>
        <label className={labelClass}>
          Telefon
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0541 882 28 02" className={fieldClass} />
        </label>
        <label className={labelClass}>
          Alan adı (opsiyonel)
          <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="taxireyhanli.com" className={fieldClass} />
        </label>
        <label className={labelClass}>
          İl
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={fieldClass} />
        </label>
        <label className={labelClass}>
          İlçe
          <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="Reyhanlı" className={fieldClass} />
        </label>
        <div className="flex justify-end md:col-span-2">
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black text-white disabled:opacity-50">
            <Plus className="h-4 w-4" /> Site üret
          </button>
        </div>
      </form>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#18181f]">
        {!sites.length ? (
          <div className="p-6">
            <EmptyRow dark icon={Globe} title="Henüz site yok" hint="Yukarıdan kategori seçip ilk müşteri sitesini üretin." />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sites.map((site) => (
              <article key={site.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[14px] font-black text-white">{site.config.business?.name || site.slug}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${site.status === "live" ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-200"}`}>
                        {SITE_STATUS_LABEL[site.status]}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-black uppercase text-white/60">
                        {SITE_CATEGORY_LABEL[site.category]}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-white/50">
                      /s/{site.slug}
                      {site.domain ? ` · ${site.domain}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/s/${site.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-[10px] font-black text-white/75"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Önizle
                    </a>
                    <button type="button" onClick={() => openEditor(site)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-[10px] font-black text-white/75">
                      <Pencil className="h-3.5 w-3.5" /> Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(site)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-black ${site.status === "live" ? "border-amber-300/20 text-amber-200" : "border-emerald-300/20 text-emerald-200"}`}
                    >
                      {site.status === "live" ? <Hammer className="h-3.5 w-3.5" /> : <Rocket className="h-3.5 w-3.5" />}
                      {site.status === "live" ? "Yapıma al" : "Yayına al"}
                    </button>
                    <button type="button" onClick={() => void remove(site)} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300/20 px-3 py-2 text-[10px] font-black text-rose-200">
                      <Trash2 className="h-3.5 w-3.5" /> Sil
                    </button>
                  </div>
                </div>

                {editId === site.id && draft ? (
                  <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 md:grid-cols-2">
                    <label className={labelClass}>
                      Durum
                      <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as "construction" | "live")} className={fieldClass}>
                        <option value="construction">Yapım aşamasında</option>
                        <option value="live">Yayında</option>
                      </select>
                    </label>
                    <label className={labelClass}>
                      Alan adı
                      <input value={draftDomain} onChange={(e) => setDraftDomain(e.target.value)} className={fieldClass} />
                    </label>
                    <label className={labelClass}>
                      İşletme adı
                      <input value={draft.business.name} onChange={(e) => patchDraft((c) => ({ ...c, business: { ...c.business, name: e.target.value } }))} className={fieldClass} />
                    </label>
                    <label className={labelClass}>
                      Telefon
                      <input value={draft.business.phone} onChange={(e) => patchDraft((c) => ({ ...c, business: { ...c.business, phone: e.target.value } }))} className={fieldClass} />
                    </label>
                    <label className={labelClass}>
                      WhatsApp
                      <input value={draft.business.whatsapp} onChange={(e) => patchDraft((c) => ({ ...c, business: { ...c.business, whatsapp: e.target.value } }))} className={fieldClass} />
                    </label>
                    <label className={labelClass}>
                      Çalışma saati
                      <input value={draft.business.hours} onChange={(e) => patchDraft((c) => ({ ...c, business: { ...c.business, hours: e.target.value } }))} className={fieldClass} />
                    </label>
                    <label className={labelClass}>
                      Adres metni
                      <input value={draft.business.addressText} onChange={(e) => patchDraft((c) => ({ ...c, business: { ...c.business, addressText: e.target.value } }))} className={fieldClass} />
                    </label>
                    <label className={labelClass}>
                      Google Maps yol tarifi linki
                      <input value={draft.business.mapsUrl} onChange={(e) => patchDraft((c) => ({ ...c, business: { ...c.business, mapsUrl: e.target.value } }))} className={fieldClass} />
                    </label>
                    <label className={`md:col-span-2 ${labelClass}`}>
                      Harita embed linki (Google Maps “paylaş → yerleştir” src)
                      <input value={draft.business.mapEmbedUrl} onChange={(e) => patchDraft((c) => ({ ...c, business: { ...c.business, mapEmbedUrl: e.target.value } }))} className={fieldClass} />
                    </label>
                    <label className={`md:col-span-2 ${labelClass}`}>
                      Hero başlık
                      <input value={draft.hero.title} onChange={(e) => patchDraft((c) => ({ ...c, hero: { ...c.hero, title: e.target.value } }))} className={fieldClass} />
                    </label>
                    <label className={`md:col-span-2 ${labelClass}`}>
                      Hero alt metin
                      <textarea rows={2} value={draft.hero.subtitle} onChange={(e) => patchDraft((c) => ({ ...c, hero: { ...c.hero, subtitle: e.target.value } }))} className={fieldClass} />
                    </label>
                    <label className={`md:col-span-2 ${labelClass}`}>
                      Hizmet bölgeleri (virgülle ayırın)
                      <textarea
                        rows={2}
                        value={draft.areas.join(", ")}
                        onChange={(e) => patchDraft((c) => ({ ...c, areas: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                        className={fieldClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Marka rengi
                      <input type="color" value={draft.brand.primary} onChange={(e) => patchDraft((c) => ({ ...c, brand: { ...c.brand, primary: e.target.value } }))} className="mt-1 h-10 w-full rounded-xl border border-white/15 bg-black/35" />
                    </label>
                    <label className={labelClass}>
                      Koyu zemin rengi
                      <input type="color" value={draft.brand.dark} onChange={(e) => patchDraft((c) => ({ ...c, brand: { ...c.brand, dark: e.target.value } }))} className="mt-1 h-10 w-full rounded-xl border border-white/15 bg-black/35" />
                    </label>
                    <label className={`md:col-span-2 ${labelClass}`}>
                      SEO başlık
                      <input value={draft.seo.title} onChange={(e) => patchDraft((c) => ({ ...c, seo: { ...c.seo, title: e.target.value } }))} className={fieldClass} />
                    </label>
                    <label className={`md:col-span-2 ${labelClass}`}>
                      SEO açıklama
                      <textarea rows={2} value={draft.seo.description} onChange={(e) => patchDraft((c) => ({ ...c, seo: { ...c.seo, description: e.target.value } }))} className={fieldClass} />
                    </label>
                    <label className={`md:col-span-2 ${labelClass}`}>
                      SEO anahtar kelimeler
                      <input value={draft.seo.keywords} onChange={(e) => patchDraft((c) => ({ ...c, seo: { ...c.seo, keywords: e.target.value } }))} className={fieldClass} />
                    </label>
                    <div className="flex justify-end gap-2 md:col-span-2">
                      <button type="button" onClick={closeEditor} className="rounded-xl border border-white/15 px-4 py-2.5 text-[11px] font-black text-white/70">
                        Vazgeç
                      </button>
                      <button type="button" disabled={busy} onClick={() => void saveEditor()} className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[11px] font-black text-white disabled:opacity-50">
                        <Save className="h-4 w-4" /> Kaydet
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
