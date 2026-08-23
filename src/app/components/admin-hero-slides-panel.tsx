import { useState, type CSSProperties } from "react";
import { History, Image as ImageIcon, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import {
  type HeroDesignSnapshot,
  type Slide,
} from "../context/content-context";
import {
  attentionEffectClass,
  attentionEffectName,
  type AttentionEffectId,
} from "../lib/attention-effects";
import { AttentionEffectPicker, MediaFileField } from "./attention-effect-picker";

type Props = {
  slides: Slide[];
  history: HeroDesignSnapshot[];
  onChange: (slides: Slide[]) => void;
  onHistoryChange: (history: HeroDesignSnapshot[]) => void;
};

function thumbStyle(slide: Slide): CSSProperties {
  if (slide.mediaUrl && slide.mediaType !== "video") {
    return { backgroundImage: `url(${slide.mediaUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  return {
    backgroundImage: "linear-gradient(135deg, #0f172a 0%, #00a8c4 55%, #7ee0ec 100%)",
  };
}

export function AdminHeroSlidesPanel({ slides, history, onChange, onHistoryChange }: Props) {
  const [previewIdx, setPreviewIdx] = useState(0);
  const [historyName, setHistoryName] = useState("");

  const update = (index: number, patch: Partial<Slide>) => {
    const next = slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide));
    onChange(next);
  };

  const saveToHistory = () => {
    const name = historyName.trim() || `Tasarım ${new Date().toLocaleString("tr-TR")}`;
    const snapshot: HeroDesignSnapshot = {
      id: `h-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      slides: slides.map((s) => ({ ...s })),
    };
    onHistoryChange([snapshot, ...history].slice(0, 24));
    setHistoryName("");
  };

  const restoreHistory = (item: HeroDesignSnapshot) => {
    if (!confirm(`“${item.name}” geçmiş tasarımı aktif slaytlara yüklensin mi?`)) return;
    onChange(item.slides.map((s) => ({ ...s })));
    setPreviewIdx(0);
  };

  const removeHistory = (id: string) => {
    onHistoryChange(history.filter((h) => h.id !== id));
  };

  const preview = slides[previewIdx] || slides[0];
  const mediaFx = attentionEffectClass(preview?.effectPreset);
  const overlayFx = attentionEffectClass(preview?.overlayEffect);

  return (
    <div className="mt-8 space-y-8">
      <div>
        <h2 className="text-[24px] font-black text-white">Hero Slayt Yönetimi</h2>
        <p className="text-[13px] text-white/60">
          Aktif tasarımları görün, medya (resim / GIF / video) ve dikkat efektleri ekleyin. Geçmişe kaydedip geri yükleyin.
        </p>
      </div>

      {/* Aktif tasarımlar */}
      <div className="rounded-3xl border border-white/10 bg-[#12141c] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#7ee0ec]" />
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Şu an aktif tasarımlar</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setPreviewIdx(idx)}
              className={`overflow-hidden rounded-2xl border text-left transition ${
                previewIdx === idx ? "border-[#00a8c4] ring-1 ring-[#00a8c4]/40" : "border-white/10 hover:border-white/25"
              }`}
            >
              <div className="relative aspect-[16/9] bg-[#0b0d12]" style={thumbStyle(slide)}>
                {slide.mediaType === "video" && slide.mediaUrl ? (
                  <video src={slide.mediaUrl} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
                ) : null}
                {slide.overlayUrl ? (
                  <img
                    src={slide.overlayUrl}
                    alt=""
                    className={`absolute bottom-2 right-2 h-12 w-12 rounded-xl object-cover shadow-lg ${attentionEffectClass(slide.overlayEffect)}`}
                  />
                ) : null}
                <span className="absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-black text-white">
                  #{idx + 1}
                </span>
              </div>
              <div className="space-y-1 p-3">
                <p className="line-clamp-1 text-[12px] font-black text-white">{slide.title || slide.badge}</p>
                <p className="text-[10px] font-bold text-white/45">
                  {slide.mediaType !== "none" && slide.mediaUrl ? (slide.mediaType || "image").toUpperCase() : "Varsayılan"} ·{" "}
                  {attentionEffectName(slide.effectPreset)}
                  {slide.overlayUrl
                    ? ` · ${slide.overlayName || attentionEffectName(slide.overlayEffect)}`
                    : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
        <div className="space-y-5">
          {slides.map((slide, slideIdx) => (
            <div
              key={slide.id}
              className={`rounded-3xl border p-5 space-y-3 ${
                previewIdx === slideIdx ? "border-[#00a8c4]/50 bg-[#18181f]" : "border-white/15 bg-[#18181f]"
              }`}
              onFocusCapture={() => setPreviewIdx(slideIdx)}
              onClick={() => setPreviewIdx(slideIdx)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-extrabold text-[#00a8c4]">Slayt #{slideIdx + 1}</span>
                <button
                  type="button"
                  onClick={() => setPreviewIdx(slideIdx)}
                  className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-black text-white/60 hover:bg-white/5"
                >
                  Önizle
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70">Rozet</label>
                <input
                  type="text"
                  value={slide.badge}
                  onChange={(e) => update(slideIdx, { badge: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-white/70">Başlık</label>
                <textarea
                  rows={2}
                  value={slide.title}
                  onChange={(e) => update(slideIdx, { title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-[12px] font-extrabold text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-white/70">Açıklama</label>
                <textarea
                  rows={3}
                  value={slide.desc}
                  onChange={(e) => update(slideIdx, { desc: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-[12px] font-medium text-white/80"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-white/70">1. Buton</label>
                  <input
                    type="text"
                    value={slide.primaryCtaText}
                    onChange={(e) => update(slideIdx, { primaryCtaText: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-2.5 py-1.5 text-[12px] font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/70">2. Buton</label>
                  <input
                    type="text"
                    value={slide.secondaryCtaText}
                    onChange={(e) => update(slideIdx, { secondaryCtaText: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-2.5 py-1.5 text-[12px] font-bold text-white"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#7ee0ec]" />
                  <p className="text-[11px] font-black uppercase tracking-wide text-[#70dce9]">Medya (resim / GIF / video)</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/70">Medya türü</label>
                  <select
                    value={slide.mediaType || "none"}
                    onChange={(e) =>
                      update(slideIdx, { mediaType: e.target.value as Slide["mediaType"] })
                    }
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-2.5 py-1.5 text-[12px] font-bold text-white"
                  >
                    <option value="none">Yok (varsayılan görsel)</option>
                    <option value="image">Resim</option>
                    <option value="gif">GIF</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                {(slide.mediaType === "image" || slide.mediaType === "gif" || slide.mediaType === "video") ? (
                  <MediaFileField
                    label="Medya URL / dosya"
                    accept={
                      slide.mediaType === "video"
                        ? "video/mp4,video/webm"
                        : slide.mediaType === "gif"
                          ? "image/gif"
                          : "image/png,image/jpeg,image/webp,image/gif"
                    }
                    url={slide.mediaUrl || ""}
                    onUrlChange={(mediaUrl) => update(slideIdx, { mediaUrl })}
                    onClear={() => update(slideIdx, { mediaUrl: "" })}
                    hint="En fazla 12 MB · video için URL önerilir"
                  />
                ) : null}
                <AttentionEffectPicker
                  label="Ana medya dikkat efekti"
                  value={slide.effectPreset}
                  onChange={(effectPreset) => update(slideIdx, { effectPreset })}
                />
              </div>

              <div className="rounded-2xl border border-[#00a8c4]/25 bg-[#00a8c4]/5 p-3 space-y-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-[#7ee0ec]">
                  Dikkat katmanı (hero üstü sticker)
                </p>
                <p className="text-[10px] text-white/45">
                  Resim/GIF ekleyin; seçtiğiniz animasyonlu efektle hero üzerinde öne çıkar. Admin’de özel isim verin.
                </p>
                <label className="block text-[11px] font-bold text-white/70">
                  Efekt adı (panelde görünür)
                  <input
                    type="text"
                    value={slide.overlayName || ""}
                    placeholder={attentionEffectName(slide.overlayEffect)}
                    onChange={(e) => update(slideIdx, { overlayName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                  />
                </label>
                <MediaFileField
                  label="Katman görseli (PNG / GIF)"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  url={slide.overlayUrl || ""}
                  onUrlChange={(overlayUrl) => update(slideIdx, { overlayUrl })}
                  onClear={() => update(slideIdx, { overlayUrl: "" })}
                />
                <AttentionEffectPicker
                  label="Katman animasyonu"
                  value={slide.overlayEffect}
                  onChange={(overlayEffect: AttentionEffectId) => update(slideIdx, { overlayEffect })}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70">Özel CSS (isteğe bağlı)</label>
                <textarea
                  rows={2}
                  value={slide.effectCss || ""}
                  onChange={(e) => update(slideIdx, { effectCss: e.target.value })}
                  placeholder={".hero-slide-media { filter: saturate(1.2); }"}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 font-mono text-[11px] text-white/80"
                />
              </div>
            </div>
          ))}
        </div>

        <aside className="xl:sticky xl:top-24 h-fit space-y-4">
          <div className="rounded-3xl border border-white/15 bg-[#0f1117] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-wide text-[#3ec8dc]">Canlı önizleme</p>
              <span className="text-[10px] font-bold text-white/40">Slayt {(previewIdx || 0) + 1}</span>
            </div>
            {preview ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#f2f4f7] text-[#0f172a]">
                {preview.effectCss ? <style>{preview.effectCss}</style> : null}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#e8eef3]">
                  {preview.mediaType === "video" && preview.mediaUrl ? (
                    <video
                      key={preview.mediaUrl}
                      src={preview.mediaUrl}
                      className={`hero-slide-media h-full w-full object-cover ${mediaFx}`}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : preview.mediaUrl && preview.mediaType !== "none" ? (
                    <img
                      key={preview.mediaUrl}
                      src={preview.mediaUrl}
                      alt=""
                      className={`hero-slide-media h-full w-full object-cover ${mediaFx}`}
                    />
                  ) : (
                    <div className={`flex h-full items-center justify-center bg-gradient-to-br from-[#dbeafe] via-[#f8fafc] to-[#e0f2fe] ${mediaFx}`}>
                      <span className="text-[11px] font-bold text-[#64748b]">Varsayılan görsel</span>
                    </div>
                  )}
                  {preview.overlayUrl ? (
                    <div className="absolute bottom-3 right-3">
                      <img
                        src={preview.overlayUrl}
                        alt={preview.overlayName || "Dikkat"}
                        className={`h-16 w-16 rounded-2xl border-2 border-white object-cover shadow-xl ${overlayFx}`}
                      />
                      <p className="mt-1 rounded-md bg-black/70 px-1.5 py-0.5 text-center text-[9px] font-black text-white">
                        {preview.overlayName || attentionEffectName(preview.overlayEffect)}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wide text-[#00a8c4]">{preview.badge}</p>
                  <p className="text-[15px] font-black leading-snug">{preview.title}</p>
                  <p className="text-[11px] leading-relaxed text-[#475569]">{preview.desc}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-white/15 bg-[#0f1117] p-4">
            <div className="mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-[#a5b4fc]" />
              <p className="text-[11px] font-black uppercase tracking-wide text-[#a5b4fc]">Tasarım geçmişi</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={historyName}
                onChange={(e) => setHistoryName(e.target.value)}
                placeholder="Geçmiş adı (ör. Yaz kampanyası)"
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
              />
              <button
                type="button"
                onClick={saveToHistory}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#00a8c4] px-3 py-2 text-[11px] font-bold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Kaydet
              </button>
            </div>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-[11px] font-semibold text-white/40">Henüz geçmiş yok. Aktif tasarımı arşivleyin.</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[12px] font-black text-white">{item.name}</p>
                        <p className="text-[10px] font-bold text-white/40">
                          {new Date(item.savedAt).toLocaleString("tr-TR")} · {item.slides.length} slayt
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHistory(item.id)}
                        className="rounded-lg border border-red-400/20 p-1.5 text-red-200 hover:bg-red-500/10"
                        aria-label="Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 flex gap-1.5 overflow-x-auto">
                      {item.slides.slice(0, 4).map((s) => (
                        <div key={s.id} className="h-10 w-14 shrink-0 rounded-md border border-white/10" style={thumbStyle(s)} />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => restoreHistory(item)}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[10px] font-bold text-white/80 hover:bg-white/10"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Aktif yap
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
