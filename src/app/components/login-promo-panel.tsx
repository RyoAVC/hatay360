import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  TrendingUp,
  MapPin,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  Wallet,
  Building2,
  Users,
  Sparkles,
  ArrowUpRight,
  FileCheck,
  Activity,
  Layers,
  Smartphone,
} from "lucide-react";
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

/** Her slayta özel dinamik, animasyonlu canlı UI grafik bileşeni */
function AnimatedBannerGraphic({ slideId }: { slideId: string }) {
  const reducedMotion = useSiteReducedMotion();

  // MÜŞTERİ PORTALI SLAYTLARI
  if (slideId === "c1") {
    // Web + Reklam: Canlı Grafik ve Google Ads Dönüşüm Kartı
    return (
      <div className="relative h-full w-full overflow-hidden p-5 flex flex-col justify-between">
        {/* Arka plan ışığı */}
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#00a8c4]/30 blur-2xl" />
        
        {/* Üst Kısım: Browser Mockup Çubuğu */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-rose-400" />
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="ml-2 flex items-center gap-1 text-[10px] font-mono text-cyan-200">
              <Lock className="h-2.5 w-2.5 text-emerald-400" />
              antakyakunefecisi.hatay360.com
            </span>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[9.5px] font-extrabold text-emerald-400 border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            Yayında & Canlı
          </span>
        </div>

        {/* Orta Kısım: Yüzen 3D Reklam & Ziyaretçi İstatistikleri */}
        <div className="relative z-10 my-auto grid grid-cols-2 gap-3 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-xl border border-white/15 bg-black/40 p-3 backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-300 font-semibold">Google Ads</span>
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">4.8x ROAS</span>
            </div>
            <p className="text-base font-black text-white mt-1">194 Form / Arama</p>
            <p className="text-[9px] text-cyan-300 font-bold">+%240 Ciro Büyümesi</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-xl border border-white/15 bg-black/40 p-3 backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-300 font-semibold">Web Trafiği</span>
              <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-base font-black text-white mt-1">4.820 Ziyaretçi</p>
            <p className="text-[9px] text-slate-400">Son 30 günde aramalardan</p>
          </motion.div>
        </div>

        {/* Alt Bilgi */}
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7ee0ec]">Web + Reklam</p>
          <p className="text-[15px] font-black text-white leading-tight mt-0.5">Tek panelde site ve kampanya</p>
        </div>
      </div>
    );
  }

  if (slideId === "c2") {
    // Harita Kaydı: Radar Tarama & Google Maps Konum Kartı
    return (
      <div className="relative h-full w-full overflow-hidden p-5 flex flex-col justify-between">
        {/* Radar Arka Plan Animasyonu */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="h-40 w-40 rounded-full border border-cyan-400/20 animate-ping opacity-30" />
          <div className="absolute h-28 w-28 rounded-full border border-cyan-400/30" />
          <div className="absolute h-16 w-16 rounded-full border border-cyan-400/40 bg-cyan-500/10" />
        </div>

        <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-rose-400" />
            <span className="text-[11px] font-black text-white">Google Haritalar Canlı Radar</span>
          </div>
          <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[9.5px] font-black text-amber-300 border border-amber-500/30">
            4.9 ★ (1.420 Yorum)
          </span>
        </div>

        {/* Orta Harita Kartı */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 my-auto rounded-xl border border-[#00a8c4]/40 bg-black/50 p-3.5 backdrop-blur-xl max-w-sm"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-black text-white">Tarihi Antakya Künefecisi</p>
              <p className="text-[10px] text-cyan-200">Uzun Çarşı No:44 • 1. Sırada (#1)</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
            <span className="font-bold text-white">🚗 412 Yol Tarifi / Hafta</span>
            <span className="font-bold text-emerald-400">📞 89 Doğrudan Arama</span>
          </div>
        </motion.div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7ee0ec]">Harita Kaydı</p>
          <p className="text-[15px] font-black text-white leading-tight mt-0.5">Google Maps görünürlüğü & Yerel SEO</p>
        </div>
      </div>
    );
  }

  if (slideId === "c3") {
    // Canlı Destek: WhatsApp & Sıra Numaralı Ticket
    return (
      <div className="relative h-full w-full overflow-hidden p-5 flex flex-col justify-between">
        <div className="absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-emerald-500/25 blur-2xl" />

        <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-black text-white">Öncelikli Destek Merkezi</span>
          </div>
          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[9.5px] font-black text-emerald-400 border border-emerald-500/30">
            Sıra No: #1 (Canlı)
          </span>
        </div>

        {/* Mesaj Baloncuğu Simülasyonu */}
        <div className="relative z-10 my-auto space-y-2 max-w-sm">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl bg-white/10 border border-white/15 p-2.5 text-xs text-white"
          >
            <p className="text-[10px] text-cyan-300 font-bold">Talep #401: Yeni tatlı çeşitleri menüye eklensin</p>
            <p className="text-[11px] text-slate-200 mt-0.5">Talebiniz uzman mühendis ekibimize ulaştı.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-2.5 text-xs text-emerald-200 ml-auto max-w-[85%]"
          >
            <p className="text-[11px] font-bold text-emerald-300">✓ Güncelleme tamamlandı ve yayına alındı!</p>
            <p className="text-[9px] text-emerald-400/80 mt-0.5">Yanıt Süresi: 12 Dakika</p>
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7ee0ec]">Canlı Destek</p>
          <p className="text-[15px] font-black text-white leading-tight mt-0.5">Ticket ve WhatsApp aynı yerde</p>
        </div>
      </div>
    );
  }

  if (slideId === "c4") {
    // AVC Güvencesi: 256-Bit SSL, E-İmza & Kesintisiz Bulut
    return (
      <div className="relative h-full w-full overflow-hidden p-5 flex flex-col justify-between">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-500/20 blur-2xl" />

        <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-black text-white">Hatay360 Kurumsal Güvence</span>
          </div>
          <span className="rounded-md bg-white/15 px-2 py-0.5 text-[9.5px] font-black text-cyan-200">
            256-Bit SSL & 2FA
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 my-auto rounded-xl border border-white/15 bg-black/40 p-3.5 backdrop-blur-md space-y-2"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
              Dijital E-İmza Sözleşme
            </span>
            <span className="text-emerald-400 font-bold text-[10px]">Onaylı & Mühürlü</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/10">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              Bulut Sunucu Uptime
            </span>
            <span className="text-cyan-300 font-bold text-[10px]">%99.98 Kesintisiz</span>
          </div>
        </motion.div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7ee0ec]">AVC Güvencesi</p>
          <p className="text-[15px] font-black text-white leading-tight mt-0.5">Ölçülen sonuç, şeffaf rapor</p>
        </div>
      </div>
    );
  }

  // BAYİ PORTALI SLAYTLARI (p1, p2, p3, p4)
  if (slideId === "p1") {
    return (
      <div className="relative h-full w-full overflow-hidden p-5 flex flex-col justify-between">
        <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-black text-white">Bölgesel Bayilik Ağı</span>
          </div>
          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[9.5px] font-black text-emerald-400">
            İskenderun & Antakya
          </span>
        </div>

        <div className="relative z-10 my-auto grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/15 bg-black/40 p-3">
            <span className="text-[10px] text-slate-300">Kayıtlı İşletmeler</span>
            <p className="text-lg font-black text-white mt-0.5">38 Firma</p>
            <p className="text-[9px] text-emerald-400 font-bold">Aktif Yayında</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-black/40 p-3">
            <span className="text-[10px] text-slate-300">Komisyon Oranı</span>
            <p className="text-lg font-black text-amber-300 mt-0.5">%30 Sabit</p>
            <p className="text-[9px] text-slate-400">Satış ve yenilemede</p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Bayilik Ağı</p>
          <p className="text-[15px] font-black text-white leading-tight mt-0.5">Firmanızla birlikte büyüyen satış</p>
        </div>
      </div>
    );
  }

  if (slideId === "p2") {
    return (
      <div className="relative h-full w-full overflow-hidden p-5 flex flex-col justify-between">
        <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-black text-white">Komisyon & Düzenli Hakediş</span>
          </div>
          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[9.5px] font-black text-emerald-400">
            IBAN Transferi Hazır
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 my-auto rounded-xl border border-emerald-500/30 bg-black/50 p-4 text-left"
        >
          <span className="text-[10px] text-slate-300">Bu Ayki Net Bayi Kazancı</span>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">₺58.400</p>
          <p className="text-[10px] text-cyan-200 mt-1">Her ayın 1'inde doğrudan banka hesabınıza aktarılır.</p>
        </motion.div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Komisyon</p>
          <p className="text-[15px] font-black text-white leading-tight mt-0.5">Getirdiğiniz müşteriden yüksek kazanç</p>
        </div>
      </div>
    );
  }

  // Varsayılan / Diğer slaytlar için şık jenerik hareketli kart
  return (
    <div className="relative h-full w-full overflow-hidden p-5 flex flex-col justify-between">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0b2430] via-[#071922] to-[#041016]" />
      <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2.5">
        <span className="text-[11px] font-black text-white">Hatay360 Canlı Kontrol</span>
        <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-[9.5px] font-black text-cyan-300">Aktif</span>
      </div>
      <div className="relative z-10 my-auto rounded-xl border border-white/10 bg-black/40 p-3 text-left">
        <p className="text-xs font-bold text-white">Şeffaf Raporlar & Otomatik Altyapı</p>
        <p className="text-[10px] text-slate-300 mt-1">İşletmenizin ve müşterilerinizin tüm dijital süreçleri tek ekranda.</p>
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7ee0ec]">Hatay360</p>
        <p className="text-[15px] font-black text-white leading-tight mt-0.5">Yeni Nesil Dijital Ekosistem</p>
      </div>
    </div>
  );
}

export function LoginPromoBannerSlider({
  banners,
  accentDot,
  borderClass = "border-white/15",
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
    const id = window.setInterval(() => setIndex((i) => (i + 1) % list.length), 5500);
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
    <div className={`relative mt-8 overflow-hidden rounded-3xl border ${borderClass} bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-[#0a1b24] shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl`}>
      <div className="relative aspect-[16/8.5] w-full min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className={`absolute inset-0 ${mediaFx}`}
            initial={{ opacity: reducedMotion ? 1 : 0, scale: reducedMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: reducedMotion ? 1 : 0, scale: reducedMotion ? 1 : 1.02 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eğer yüklenmiş video/görsel varsa onu göster, yoksa tam oturan zengin animasyonlu UI grafiği render et */}
            {hasVisual ? (
              <div
                className="h-full w-full flex flex-col justify-end p-5"
                style={
                  !isVideo
                    ? {
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%), url(${media})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : { background: "#0b1220" }
                }
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
                {isVideo ? <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" /> : null}
                <div className="relative z-[1]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/75">{slide.label}</p>
                  <p className="mt-1 text-[16px] font-black leading-snug text-white">{slide.title}</p>
                </div>
              </div>
            ) : (
              <AnimatedBannerGraphic slideId={slide.id} />
            )}

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

      {/* Slayt Noktaları (Pagination) */}
      <div className="absolute bottom-3.5 right-4 z-[3] flex gap-1.5">
        {list.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Banner ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === index ? `w-6 ${accentDot} shadow-sm shadow-cyan-400` : "w-2 bg-white/30 hover:bg-white/50"
            }`}
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
