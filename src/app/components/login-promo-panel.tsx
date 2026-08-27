import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { attentionEffectClass } from "../lib/attention-effects";
import { useSiteReducedMotion } from "../lib/site-motion";
import {
  bannerMediaUrl,
  type LoginPromoBanner,
  type LoginPromoStat,
} from "../lib/login-promo";

function useCountUp(target: number, reducedMotion: boolean, durationMs = 1400) {
  const [value, setValue] = useState(reducedMotion ? target : 0);
  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reducedMotion, durationMs]);
  return value;
}

export function LoginPromoBannerSlider({
  banners,
  accentDot,
  borderClass = "border-white/12",
}: {
  banners: LoginPromoBanner[];
  accentDot: string;
  borderClass?: string;
}) {
  const reducedMotion = useSiteReducedMotion();
  const list = banners.length ? banners : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [list.length]);

  useEffect(() => {
    if (reducedMotion || list.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % list.length), 4500);
    return () => window.clearInterval(id);
  }, [list.length, reducedMotion]);

  if (!list.length) return null;
  const slide = list[index] || list[0];
  const media = bannerMediaUrl(slide);
  const mediaType = slide.mediaType || (media ? "image" : "none");
  const isVideo = mediaType === "video";
  const hasVisual = Boolean(media);
  const mediaFx = attentionEffectClass(slide.effectId, reducedMotion);
  const overlayFx = attentionEffectClass(slide.overlayEffect, reducedMotion);

  return (
    <div className={`relative mt-8 overflow-hidden rounded-2xl border ${borderClass} shadow-[0_20px_50px_rgba(0,0,0,0.28)]`}>
      <div className="relative aspect-[16/7] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className={`absolute inset-0 flex flex-col justify-end p-5 ${mediaFx}`}
            style={
              hasVisual && !isVideo
                ? {
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.72) 100%), url(${media})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : !hasVisual
                  ? { backgroundImage: slide.gradient }
                  : { background: "#0b1220" }
            }
            initial={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : -20 }}
            transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {isVideo && media ? (
              <video
                key={media}
                src={media}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : null}
            {isVideo ? <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" /> : null}
            <div className="relative z-[1]">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/75">{slide.label}</p>
              <p className="mt-1.5 max-w-sm text-[18px] font-black leading-snug text-white">{slide.title}</p>
            </div>
            {slide.overlayUrl ? (
              <img
                src={slide.overlayUrl}
                alt={slide.overlayName || "Dikkat"}
                className={`absolute bottom-3 right-3 z-[2] h-14 w-14 rounded-xl border-2 border-white/80 object-cover shadow-lg ${overlayFx}`}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute bottom-3 left-3 z-[3] flex gap-1.5">
        {list.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Banner ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? `w-5 ${accentDot}` : "w-1.5 bg-white/35"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function LoginPromoStats({
  stats,
  tone,
  cardClass = "rounded-2xl border border-white/10 bg-white/5 px-3 py-3",
}: {
  stats: LoginPromoStat[];
  tone: string;
  cardClass?: string;
}) {
  const reducedMotion = useSiteReducedMotion();
  return (
    <div className="mt-5 grid grid-cols-3 gap-2.5">
      {stats.map((stat) => (
        <LoginPromoStatCard key={stat.label} {...stat} reducedMotion={reducedMotion} tone={tone} cardClass={cardClass} />
      ))}
    </div>
  );
}

function LoginPromoStatCard({
  label,
  value,
  suffix = "",
  reducedMotion,
  tone,
  cardClass,
}: LoginPromoStat & { reducedMotion: boolean; tone: string; cardClass: string }) {
  const shown = useCountUp(value, reducedMotion);
  return (
    <div className={cardClass}>
      <p className={`text-[22px] font-black tabular-nums tracking-tight ${tone}`}>
        {shown}
        {suffix}
      </p>
      <p className="mt-1 text-[10px] font-bold leading-snug text-white/50">{label}</p>
    </div>
  );
}

export function LoginPromoLineChart({
  points,
  stroke,
  fill,
  title,
  borderClass = "border-white/10",
}: {
  points: number[];
  stroke: string;
  fill: string;
  title: string;
  borderClass?: string;
}) {
  const reducedMotion = useSiteReducedMotion();
  const w = 280;
  const h = 88;
  const pad = 8;
  const safe = points.length ? points : [0, 0];
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const span = Math.max(1, max - min);
  const coords = safe.map((p, i) => {
    const x = pad + (i / Math.max(1, safe.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const areaD = `M${pad} ${h - pad} ${coords.map(([x, y]) => `L${x} ${y}`).join(" ")} L${w - pad} ${h - pad} Z`;

  return (
    <div className={`mt-5 rounded-2xl border ${borderClass} bg-white/[0.04] p-4`}>
      <div className="flex items-end justify-between gap-2">
        <p className="text-[11px] font-black text-white/70">{title}</p>
        <p className="text-[10px] font-bold text-white/40">Örnek seri</p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-20 w-full" aria-hidden="true">
        <motion.path
          d={areaD}
          fill={fill}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.35 }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: reducedMotion ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reducedMotion ? 0 : 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="mt-1 flex justify-between text-[9px] font-bold text-white/35">
        {["Oca", "Şub", "Mar", "Nis", "May", "Haz"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}
