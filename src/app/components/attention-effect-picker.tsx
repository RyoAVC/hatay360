import { ATTENTION_EFFECTS, attentionEffectClass, type AttentionEffectId } from "../lib/attention-effects";

export function AttentionEffectPicker({
  value,
  onChange,
  label = "Dikkat çekme efekti",
}: {
  value: AttentionEffectId | string | undefined;
  onChange: (id: AttentionEffectId) => void;
  label?: string;
}) {
  const current = (value || "none") as AttentionEffectId;

  return (
    <div>
      <p className="text-[11px] font-bold text-white/70">{label}</p>
      <p className="mt-0.5 text-[10px] text-white/40">
        Animate.css (GitHub) + Hatay360 özel efektler · seçince canlı önizlenir
      </p>
      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
        {ATTENTION_EFFECTS.map((effect) => {
          const selected = current === effect.id;
          return (
            <button
              key={effect.id}
              type="button"
              onClick={() => onChange(effect.id)}
              className={`rounded-xl border px-2 py-2 text-left transition ${
                selected
                  ? "border-[#00a8c4] bg-[#00a8c4]/15 ring-1 ring-[#00a8c4]/40"
                  : "border-white/10 bg-black/30 hover:border-white/25"
              }`}
            >
              <span className="block text-[11px] font-black text-white">{effect.name}</span>
              <span className="mt-0.5 block text-[9px] font-semibold text-white/40">{effect.source}</span>
              {effect.id !== "none" ? (
                <span
                  className={`mt-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#00a8c4]/30 text-[9px] font-black text-[#7ee0ec] ${attentionEffectClass(effect.id)}`}
                >
                  ●
                </span>
              ) : (
                <span className="mt-1.5 block text-[9px] text-white/30">—</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MediaFileField({
  label,
  accept,
  url,
  onUrlChange,
  onClear,
  hint,
}: {
  label: string;
  accept: string;
  url: string;
  onUrlChange: (url: string) => void;
  onClear: () => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-bold text-white/70">{label}</label>
      <input
        type="url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://… veya dosya yükle"
        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[11px] font-bold text-white/85 hover:bg-white/10">
          Dosya yükle
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (file.size > 2 * 1024 * 1024) {
                alert(
                  "Dosya 2 MB’den büyük. Tarayıcı kotasını doldurmamak için daha küçük bir görsel kullanın veya doğrudan bir URL yapıştırın (özellikle video için).",
                );
                return;
              }
              const reader = new FileReader();
              reader.onload = () => onUrlChange(String(reader.result || ""));
              reader.onerror = () => alert("Dosya okunamadı.");
              reader.readAsDataURL(file);
            }}
          />
        </label>
        {url ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-white/15 px-3 py-2 text-[11px] font-bold text-white/70 hover:bg-white/10"
          >
            Temizle
          </button>
        ) : null}
      <span className="text-[10px] font-semibold text-white/40">
        {hint || "Küçük dosya veya URL · büyük videolar için URL kullanın"}
      </span>
      </div>
    </div>
  );
}
