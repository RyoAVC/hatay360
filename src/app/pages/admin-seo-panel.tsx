import { useState } from "react";
import { Plus, Trash2, Sparkles, MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "../context/content-context";
import {
  DEFAULT_DISTRICTS,
  DEFAULT_SEO_PAGES,
  OFFICIAL_HATAY_DISTRICTS,
  districtBlurb,
  districtPath,
  type SeoPageId,
} from "../lib/seo";
import { buildLocalSeoPack, generateSeoPack } from "../lib/seo-ai";

type Props = {
  settings: SiteSettings;
  onChange: (next: SiteSettings) => void;
};

export function AdminSeoPanel({ settings, onChange }: Props) {
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const districts = settings.districts?.length ? settings.districts : DEFAULT_DISTRICTS;
  const existing = new Set(districts.map((d) => d.name.toLocaleLowerCase("tr-TR")));
  const missingOfficial = OFFICIAL_HATAY_DISTRICTS.filter((n) => !existing.has(n.toLocaleLowerCase("tr-TR")));

  const setDistricts = (next: typeof districts) => onChange({ ...settings, districts: next });

  const addDistrict = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (existing.has(trimmed.toLocaleLowerCase("tr-TR"))) {
      setNote(`${trimmed} zaten listede.`);
      return;
    }
    setDistricts([...districts, { name: trimmed, blurb: districtBlurb(trimmed) }]);
    setNewName("");
    setNote(`${trimmed} eklendi. Sitede görünmesi için Kaydet’e bas.`);
  };

  const applyPack = (pack: ReturnType<typeof buildLocalSeoPack>) => {
    onChange({
      ...settings,
      seoKeywords: pack.keywords,
      seoLocalLead: pack.localLead,
      seoPages: pack.pages,
      districts: pack.districts.length ? pack.districts : settings.districts,
    });
  };

  const runAi = async () => {
    setBusy(true);
    setNote("");
    try {
      const { pack, source } = await generateSeoPack({
        siteTitle: settings.siteTitle,
        districts,
        aiProvider: settings.aiProvider || "none",
        aiApiKey: settings.aiApiKey || "",
        aiModel: settings.aiModel || "gemini-2.0-flash",
      });
      applyPack(pack);
      setNote(
        source === "ai"
          ? "Yapay zeka önerileri forma dolduruldu. Beğenirsen Kaydet’e bas."
          : "API yok veya boş. İlçelerden şablon SEO üretildi. Kaydet’e bas."
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "İstek başarısız";
      applyPack(buildLocalSeoPack(districts, settings.siteTitle));
      setNote(`API çalışmadı (${msg.slice(0, 120)}). Şablon dolduruldu — Kaydet’e bas.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <div>
        <h2 className="text-[24px] font-black text-white">SEO paneli</h2>
        <p className="mt-1 text-[13px] text-white/60">
          Hatay’ın 15 ilçesi, her ilçenin kendi sayfası (`/hatay/iskenderun`) ve isteğe bağlı Gemini önerisi.
          Değişikliklerin sitede görünmesi için üstteki Kaydet şart.
        </p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-[#22c55e]/35 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.16),transparent_36%),#18181f] p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#22c55e]/15 text-[#86efac] ring-1 ring-[#22c55e]/25">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[17px] font-black text-white">Merkezi Google sıra takibi</h3>
                <span className="rounded-full bg-[#22c55e]/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#86efac]">Search Console hazır</span>
              </div>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/60">
                Hatay360, AVC Ops Hub içindeki ortak Search Console sistemine bağlıdır. Sorgu, tıklama, gösterim ve ortalama konumu tek merkezden izleyin; Google’ı izinsiz kazıyan ikinci bir sistem kurmayın.
              </p>
              <p className="mt-2 text-[11px] font-bold text-amber-300/80">Canlı şehir ve cihaz bazlı SERP kontrolü, resmi sağlayıcı bağlantısı tamamlanınca Hub’dan açılacak.</p>
            </div>
          </div>
          <a
            href="https://hub.avcieticaret.com/seo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-4 py-3 text-[13px] font-black text-[#07140b] transition-transform hover:-translate-y-0.5"
          >
            Hub SEO’yu aç <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="rounded-3xl border border-[#00a8c4]/40 bg-[#18181f] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-black text-white">Yapay zeka önerisi</h3>
            <p className="text-[12px] text-white/50">
              Anahtar Google AI Studio (Gemini) veya OpenAI'dan. Anahtar yalnızca açık oturumda kullanılır; kalıcı kayda ve yedeğe eklenmez.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={runAi}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a8c4] to-[#3ec8dc] px-4 py-2.5 text-[13px] font-extrabold text-white disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {busy ? "Üretiliyor…" : "SEO üret"}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-[12px] font-bold text-white/70">
            Sağlayıcı
            <select
              value={settings.aiProvider || "gemini"}
              onChange={(e) =>
                onChange({ ...settings, aiProvider: e.target.value as SiteSettings["aiProvider"] })
              }
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-white"
            >
              <option value="gemini">Gemini (Google)</option>
              <option value="openai">OpenAI (ChatGPT)</option>
              <option value="none">Sadece şablon (API yok)</option>
            </select>
          </label>
          <label className="text-[12px] font-bold text-white/70">
            Model
            <input
              value={settings.aiModel || ""}
              onChange={(e) => onChange({ ...settings, aiModel: e.target.value })}
              placeholder={settings.aiProvider === "openai" ? "gpt-4o-mini" : "gemini-2.0-flash"}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-white"
            />
          </label>
          <label className="text-[12px] font-bold text-white/70">
            API anahtarı
            <input
              type="password"
              autoComplete="off"
              value={settings.aiApiKey || ""}
              onChange={(e) => onChange({ ...settings, aiApiKey: e.target.value })}
              placeholder="AIza… veya sk-…"
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-white"
            />
          </label>
        </div>
        {note && <p className="rounded-xl bg-white/5 px-3 py-2 text-[13px] text-[#7ee0ec]">{note}</p>}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-black text-white">Hatay ilçeleri</h3>
            <p className="text-[12px] text-white/50">
              {districts.length} ilçe sitede görünür. Resmi 15: Antakya’dan Belen’e.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingOfficial.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setDistricts([
                    ...districts,
                    ...missingOfficial.map((name) => ({ name, blurb: districtBlurb(name) })),
                  ])
                }
                className="rounded-xl bg-[#10b981] px-4 py-2 text-[13px] font-extrabold text-white"
              >
                Eksik resmi ilçeleri ekle ({missingOfficial.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setDistricts(DEFAULT_DISTRICTS);
                setNote("Resmi 15 ilçe yüklendi. Sitede görünmesi için Kaydet’e bas.");
              }}
              className="rounded-xl border border-white/20 px-4 py-2 text-[13px] font-extrabold text-white/80 hover:bg-white/10"
            >
              15 resmi ilçeyi yükle
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {missingOfficial.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => addDistrict(name)}
              className="rounded-full border border-[#00a8c4]/40 bg-[#00a8c4]/10 px-3 py-1 text-[12px] font-bold text-[#7ee0ec] hover:bg-[#00a8c4]/20"
            >
              + {name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDistrict(newName);
              }
            }}
            placeholder="İlçe adı yaz, Enter veya Ekle"
            className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] text-white"
          />
          <button
            type="button"
            onClick={() => addDistrict(newName)}
            className="inline-flex items-center gap-1 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[13px] font-extrabold text-white"
          >
            <Plus className="h-4 w-4" /> Ekle
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {districts.map((d, i) => (
            <div key={`${d.name}-${i}`} className="flex gap-2 rounded-2xl border border-white/10 bg-black/30 p-3">
              <span className="mt-2 text-[#00a8c4]">
                <MapPin className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  value={d.name}
                  onChange={(e) => {
                    const next = [...districts];
                    next[i] = { ...d, name: e.target.value };
                    setDistricts(next);
                  }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[13px] font-bold text-white"
                />
                <input
                  value={d.blurb}
                  onChange={(e) => {
                    const next = [...districts];
                    next[i] = { ...d, blurb: e.target.value };
                    setDistricts(next);
                  }}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[12px] text-white/80"
                />
                <p className="text-[11px] text-white/40">
                  Sayfa:{" "}
                  <a href={districtPath(d.name)} target="_blank" rel="noreferrer" className="text-[#7ee0ec] hover:underline">
                    {districtPath(d.name)}
                  </a>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDistricts(districts.filter((_, idx) => idx !== i))}
                className="self-start rounded-lg p-1.5 text-red-400 hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <label className="text-[12px] font-bold text-white/70">Sitede görünen yerel metin (ilçeler geçsin)</label>
        <textarea
          rows={4}
          value={settings.seoLocalLead || ""}
          onChange={(e) => onChange({ ...settings, seoLocalLead: e.target.value })}
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[13px] text-white"
        />
      </section>

      <section>
        <label className="text-[12px] font-bold text-white/70">Anahtar kelimeler (virgülle)</label>
        <textarea
          rows={4}
          value={settings.seoKeywords || ""}
          onChange={(e) => onChange({ ...settings, seoKeywords: e.target.value })}
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[13px] text-white"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {(Object.keys(DEFAULT_SEO_PAGES) as SeoPageId[]).map((id) => {
          const page = settings.seoPages?.[id] || DEFAULT_SEO_PAGES[id];
          return (
            <div key={id} className="space-y-3 rounded-2xl border border-white/15 bg-[#18181f] p-5">
              <p className="text-[12px] font-extrabold uppercase tracking-wider text-[#3ec8dc]">{id}</p>
              <div>
                <label className="text-[11px] font-bold text-white/70">Title</label>
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      seoPages: { ...settings.seoPages, [id]: { ...page, title: e.target.value } },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] font-bold text-white"
                />
                <p className="mt-1 text-[11px] text-white/40">{page.title.length}/60</p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-white/70">Description</label>
                <textarea
                  rows={3}
                  value={page.description}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      seoPages: { ...settings.seoPages, [id]: { ...page, description: e.target.value } },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-[12px] text-white/90"
                />
                <p className="mt-1 text-[11px] text-white/40">{page.description.length}/155</p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
