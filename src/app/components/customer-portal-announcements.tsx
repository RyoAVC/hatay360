import { useEffect, useState } from "react";
import { Megaphone, Sparkles, AlertTriangle, ChevronRight } from "lucide-react";

export type PortalAnnouncement = {
  id: number;
  title: string;
  body: string;
  linkUrl?: string;
  tone: "info" | "promo" | "campaign" | "alert";
};

const toneStyles: Record<PortalAnnouncement["tone"], { bar: string; icon: typeof Megaphone }> = {
  info: { bar: "border-[#bfe1e6] bg-[#edf9fa] text-[#007f98]", icon: Megaphone },
  promo: { bar: "border-violet-200 bg-violet-50 text-violet-800", icon: Sparkles },
  campaign: { bar: "border-amber-200 bg-amber-50 text-amber-900", icon: Megaphone },
  alert: { bar: "border-rose-200 bg-rose-50 text-rose-800", icon: AlertTriangle },
};

/** Header altında kayan / dikkat çeken duyuru şeridi. */
export function CustomerPortalAnnouncements({ items }: { items: PortalAnnouncement[] }) {
  const [index, setIndex] = useState(0);
  const list = items.filter((item) => item.title?.trim());

  useEffect(() => {
    if (list.length <= 1) return;
    const id = window.setInterval(() => setIndex((prev) => (prev + 1) % list.length), 6000);
    return () => window.clearInterval(id);
  }, [list.length]);

  if (!list.length) return null;

  const current = list[index % list.length];
  const tone = toneStyles[current.tone] || toneStyles.info;
  const Icon = tone.icon;

  return (
    <div className={`mt-4 overflow-hidden rounded-2xl border px-4 py-3 shadow-sm transition-all duration-500 sm:px-5 sm:py-3.5 ${tone.bar}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] opacity-70">Duyuru</p>
          <p className="mt-0.5 text-[13px] font-black leading-snug">{current.title}</p>
          {current.body ? <p className="mt-1 text-[11px] font-bold leading-relaxed opacity-85">{current.body}</p> : null}
          {current.linkUrl ? (
            <a href={current.linkUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-black underline-offset-2 hover:underline">
              Detay <ChevronRight className="h-3 w-3" />
            </a>
          ) : null}
        </div>
        {list.length > 1 ? (
          <div className="flex shrink-0 gap-1 pt-1">
            {list.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Duyuru ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-1.5 rounded-full transition ${i === index % list.length ? "bg-current opacity-100" : "bg-current opacity-30"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
