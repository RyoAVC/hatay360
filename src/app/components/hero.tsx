import { useState, useEffect, useMemo, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Store,
  Target,
  Smartphone,
  Globe,
  Bell,
  Sparkles,
  Monitor,
  Layout,
  Gauge,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Award,
  Zap,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { LiveDashboard } from "./live-dashboard";
import { BrandLogo } from "./brand-logo";
import { useContent } from "../context/content-context";
import { attentionEffectClass } from "../lib/attention-effects";

// --- SLIDE 2 VISUAL: Google Ads & Meta Ads Simulation ---
function AdsDashboardSimulation() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#ecebf5] bg-white p-5 shadow-[0px_20px_50px_rgba(25,33,61,0.08)] sm:p-6">
      <div className="flex items-center justify-between border-b border-[#f1f2f9] pb-4">
        <div className="flex items-center gap-3">
          <BrandLogo id="google" size={40} />
          <BrandLogo id="meta" size={40} />
          <div>
            <h4 className="text-[15px] font-extrabold text-[#1a1a1a]">Google Ads & Meta yönetim ekranı</h4>
            <p className="text-[12px] text-[#514f6e]">Temsili kampanya çalışma alanı</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-[#10b981]/10 px-3 py-1 text-[11px] font-extrabold text-[#10b981]">
          <span className="h-2 w-2 rounded-full bg-[#10b981] animate-ping" />
          Örnek panel
        </span>
      </div>

      {/* Google Search Live Ad Mockup */}
      <div className="mt-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="rounded bg-[#4285f4]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#1a0dab]">
            Google arama reklamı önizlemesi
          </span>
          <span className="text-[11px] font-bold text-[#10b981]">Yayın öncesi kontrol</span>
        </div>
        <p className="mt-1.5 text-[13px] font-extrabold text-[#1a0dab]">
          Sizin Markanız | Kurumsal Hizmet Sayfası
        </p>
        <p className="mt-0.5 text-[11px] text-[#4d5156] leading-tight">
          Net başlık, doğru hedefleme ve ölçülebilir iletişim adımları aynı kampanyada buluşur.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
        <div className="rounded-xl bg-[#e8f8fb] p-2.5 border border-[#b3e5ee]">
          <p className="text-[10px] font-bold text-[#64748b]">Kampanya</p>
          <p className="text-[18px] font-black text-[#00a8c4]">Arama</p>
          <span className="text-[9px] font-bold text-[#10b981]">Anahtar kelime</span>
        </div>
        <div className="rounded-xl bg-[#eff6ff] p-2.5 border border-[#bfdbfe]">
          <p className="text-[10px] font-bold text-[#64748b]">Google</p>
          <p className="text-[18px] font-black text-[#1d4ed8]">Reklam</p>
          <span className="text-[9px] font-bold text-[#10b981]">Yerel hedef</span>
        </div>
        <div className="rounded-xl bg-[#fae8ff] p-2.5 border border-[#f5d0fe]">
          <p className="text-[10px] font-bold text-[#64748b]">Meta</p>
          <p className="text-[18px] font-black text-[#7e22ce]">İçerik</p>
          <span className="text-[9px] font-bold text-[#10b981]">Kreatif plan</span>
        </div>
      </div>

      {/* Decorative Badge */}
      <motion.div
        className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-[#00a8c4]/10 to-[#3ec8dc]/10 p-3 text-[12px] font-semibold text-[#00a8c4]"
        animate={{ scale: [1, 1.01, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" /> Bütçeniz AI destekli optimizasyonla yönetilir
        </span>
        <span className="rounded-md bg-[#00a8c4] px-2 py-0.5 text-[10px] font-bold text-white">Raporlama</span>
      </motion.div>
    </div>
  );
}

// --- SLIDE 3 VISUAL: Desktop + phone studio preview ---
function WebAndAppSimulation() {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#d7e8ee] bg-[#eef7f9] p-4 sm:p-5">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 15% 10%, rgba(0,168,196,0.22), transparent 55%), radial-gradient(ellipse 50% 45% at 90% 80%, rgba(112,220,233,0.28), transparent 50%)",
        }}
      />

      <div className="relative flex items-center justify-between gap-3 pb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00a8c4]">Studio önizleme</p>
          <p className="mt-0.5 text-[14px] font-bold text-[#0c2a32]">Marka sitesi · canlı iskelet</p>
        </div>
        <div className="flex items-center gap-1.5">
          {["Web", "Mobil"].map((label, i) => (
            <span
              key={label}
              className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                i === 0 ? "bg-[#00a8c4] text-white" : "bg-white/80 text-[#3d5a63] ring-1 ring-[#b3e5ee]"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative min-h-[220px] sm:min-h-[248px]">
        {/* Desktop browser */}
        <div className="relative z-[1] w-[88%] overflow-hidden rounded-2xl border border-[#c5dce4] bg-white shadow-[0_18px_40px_rgba(12,42,50,0.12)]">
          <div className="flex items-center gap-2 border-b border-[#e8f0f3] bg-[#f7fbfc] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#f87171]" />
            <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
            <span className="h-2 w-2 rounded-full bg-[#34d399]" />
            <div className="ml-2 flex flex-1 items-center gap-1.5 rounded-md bg-white px-2 py-1 ring-1 ring-[#e2eef2]">
              <Globe className="h-3 w-3 text-[#00a8c4]" />
              <span className="truncate font-mono text-[10px] text-[#64748b]">hatay360.com/proje</span>
            </div>
          </div>

          <div className="grid grid-cols-[1.15fr_0.85fr] gap-0">
            <div className="space-y-2.5 p-3.5 sm:p-4">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-md bg-[#00a8c4]" />
                <span className="h-1.5 w-14 rounded-full bg-[#d7e8ee]" />
                <span className="ml-auto hidden h-1.5 w-8 rounded-full bg-[#e8f0f3] sm:block" />
                <span className="hidden h-1.5 w-8 rounded-full bg-[#e8f0f3] sm:block" />
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 w-[92%] rounded-full bg-[#0c2a32]/90" />
                <div className="h-2.5 w-[70%] rounded-full bg-[#0c2a32]/55" />
                <div className="h-1.5 w-[85%] rounded-full bg-[#b3e5ee]" />
              </div>
              <div className="flex gap-2 pt-1">
                <span className="rounded-md bg-[#00a8c4] px-2.5 py-1 text-[9px] font-bold text-white">Teklif al</span>
                <span className="rounded-md bg-[#e8f8fb] px-2.5 py-1 text-[9px] font-bold text-[#008da8]">Demo</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[Layout, Gauge, ShieldCheck].map((Icon, i) => (
                  <div key={i} className="rounded-lg bg-[#f3fcfd] p-1.5 ring-1 ring-[#d7f0f5]">
                    <Icon className="h-3 w-3 text-[#00a8c4]" />
                    <div className="mt-1 h-1 w-full rounded-full bg-[#d7e8ee]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden border-l border-[#e8f0f3] bg-[linear-gradient(160deg,#0c2a32_0%,#00a8c4_100%)] p-3">
              <motion.div
                className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-xl"
                animate={reducedMotion ? undefined : { scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={reducedMotion ? undefined : { duration: 5, repeat: Infinity }}
              />
              <p className="relative text-[9px] font-bold uppercase tracking-[0.16em] text-white/70">Hero</p>
              <p className="relative mt-2 text-[12px] font-bold leading-snug text-white">
                Premium
                <br />
                arayüz
              </p>
              <div className="relative mt-3 h-16 rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur-sm" />
              <motion.div
                className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-[#7ee0ec]"
                animate={reducedMotion ? undefined : { opacity: [1, 0.3, 1] }}
                transition={reducedMotion ? undefined : { duration: 1.8, repeat: Infinity }}
              />
            </div>
          </div>
        </div>

        {/* Phone overlay */}
        <motion.div
          className="absolute -bottom-1 right-0 z-[2] w-[112px] sm:w-[124px]"
          animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
          transition={reducedMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="overflow-hidden rounded-[22px] border-[3px] border-[#0c2a32] bg-[#0c2a32] shadow-[0_20px_40px_rgba(12,42,50,0.35)]">
            <div className="mx-auto mt-1.5 h-1 w-10 rounded-full bg-white/25" />
            <div className="m-1.5 overflow-hidden rounded-[14px] bg-white">
              <div className="bg-[linear-gradient(145deg,#00a8c4,#0c2a32)] px-2.5 pb-3 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="h-3.5 w-3.5 rounded bg-white/90" />
                  <Bell className="h-3 w-3 text-white/80" />
                </div>
                <p className="mt-2 text-[9px] font-bold leading-tight text-white">Markanız cebinde</p>
                <div className="mt-2 h-1.5 w-14 rounded-full bg-white/30" />
              </div>
              <div className="space-y-1.5 p-2">
                <div className="flex items-center gap-1.5 rounded-md bg-[#f3fcfd] p-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[#00a8c4]/15">
                    <Smartphone className="h-2.5 w-2.5 text-[#00a8c4]" />
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="h-1 w-10 rounded-full bg-[#c5dce4]" />
                    <div className="h-1 w-7 rounded-full bg-[#e8f0f3]" />
                  </div>
                </div>
                <div className="h-8 rounded-md bg-[#eef7f9] ring-1 ring-[#d7f0f5]" />
                <div className="rounded-md bg-[#00a8c4] py-1 text-center text-[8px] font-bold text-white">Ara</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance strip */}
        <motion.div
          className="absolute bottom-2 left-2 z-[3] flex gap-1.5 sm:left-3"
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
        >
          {[
            { label: "LCP", value: "0.6s" },
            { label: "SEO", value: "A+" },
            { label: "CWV", value: "Pass" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/80 bg-white/90 px-2 py-1 shadow-[0_6px_16px_rgba(12,42,50,0.08)] backdrop-blur-sm"
            >
              <p className="text-[8px] font-bold uppercase tracking-wide text-[#94a3b8]">{item.label}</p>
              <p className="text-[11px] font-black text-[#00a8c4]">{item.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// --- SLIDE DEFINITIONS ---
const BASE_SLIDES = [
  {
    navLabel: "Büyüme",
    badge: "Kurumsal büyüme danışmanlığı",
    title: (
      <>
        Hatay’da <span className="text-[#00a8c4]">marka görünürlüğü</span> ve satış akışını aynı anda büyütürüz.
      </>
    ),
    desc: "Google Ads, Meta, yerel SEO ve kurumsal web stratejisi bir arada çalışır. Hedefi net olan markalar için artan arama, çağrı ve dönüşüm planı kuruyoruz.",
    primaryCta: { text: "Strateji görüşmesi", href: "/iletisim" },
    secondaryCta: { text: "Paketleri incele", href: "/paketler" },
    highlights: ["Kurumsal marka dili", "Reklam + web + içerik uyumu", "Net dönüşüm planı"],
    stats: [
      { value: "Keşif", label: "Hedef ve ihtiyaç analizi", icon: TrendingUp, tag: "Strateji" },
      { value: "Kurulum", label: "Reklam, web ve ölçümleme", icon: BarChart3, tag: "Uygulama" },
      { value: "Takip", label: "Düzenli rapor ve iyileştirme", icon: ShieldCheck, tag: "Yönetim" },
    ],
    visual: <LiveDashboard />,
  },
  {
    navLabel: "Reklam",
    badge: "360° dijital performans ajansı",
    title: (
      <> 
        Google Ads ve Meta ile <span className="text-[#00a8c4]">daha güçlü gelir</span> üretiriz.
      </>
    ),
    desc: "Arama, sosyal medya ve içerik kampanyalarını tek bir stratejiye bağlayarak hedef kitlenin dikkatini çekiyor, doğru başvuruyu ve çağrıyı kolaylaştırıyoruz.",
    primaryCta: { text: "Reklam teklifi al", href: "/iletisim" },
    secondaryCta: { text: "Paketleri incele", href: "/paketler" },
    highlights: ["Search + Performance Max", "Meta kararı ve kreatif optimizasyon", "Şeffaf aylık raporlama"],
    stats: [
      { value: "Google", label: "Arama ve harita görünürlüğü", icon: BarChart3, tag: "Reklam" },
      { value: "Meta", label: "Instagram ve Facebook yönetimi", icon: Zap, tag: "İçerik" },
      { value: "Rapor", label: "Harcama ve dönüşüm takibi", icon: TrendingUp, tag: "Şeffaflık" },
    ],
    visual: <AdsDashboardSimulation />,
  },
  {
    navLabel: "Web & App",
    badge: "Premium web tasarım & yatırım döndürme",
    title: (
      <>
        Marka değerini yükselten <span className="text-[#00a8c4]">premium web</span> ve satış sayfası.
      </>
    ),
    desc: "Yalnızca güzel görünmek değil; güven, net mesaj ve dönüşüm odaklı tasarım. Hatay360 ile web siteniz satış ekibinizin en güçlü çağrı aracına dönüşür.",
    primaryCta: { text: "Tasarım projesi başlat", href: "/iletisim" },
    secondaryCta: { text: "Özellikleri keşfet", href: "/ozellikler" },
    highlights: ["Premium tasarım dili", "Mobil öncelikli deneyim", "Seo uyumlu yapı"],
    stats: [
      { value: "Özgün", label: "Markaya göre arayüz", icon: Award, tag: "Tasarım" },
      { value: "Hızlı", label: "Performans odaklı geliştirme", icon: Gauge, tag: "Teknik" },
      { value: "Mobil", label: "Her ekrana uygun deneyim", icon: CheckCircle2, tag: "Uyum" },
    ],
    visual: <WebAndAppSimulation />,
  },
];

const HERO_DISPLAY_FONT = "'Space Grotesk', system-ui, sans-serif";
const HERO_FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap";

function HeroAmbientBackground({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.38]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(#e2e8ee 1px, transparent 1px), linear-gradient(90deg, #e2e8ee 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -left-[12%] top-[8%] h-[420px] w-[420px] rounded-full bg-[#00a8c4]/[0.07] blur-[90px]"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, 36, 12, 0], y: [0, -28, 10, 0] }}
        transition={reducedMotion ? undefined : { duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-[8%] top-[22%] h-[360px] w-[360px] rounded-full bg-[#64748b]/[0.06] blur-[80px]"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, -32, -8, 0], y: [0, 24, -12, 0] }}
        transition={reducedMotion ? undefined : { duration: 32, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[6%] left-[28%] h-[300px] w-[300px] rounded-full bg-[#0f172a]/[0.04] blur-[70px]"
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: [0, 22, -14, 0], y: [0, -18, 8, 0] }}
        transition={reducedMotion ? undefined : { duration: 36, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00a8c4]/40 to-transparent"
        aria-hidden="true"
      />
    </>
  );
}

/** Ana sayfada hero hemen altındaki ilk bölüm — scroll ile belirir. */
export function BelowHeroReveal({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function VisualFrame({ children, index }: { children: ReactNode; index: number }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute -left-1 top-4 h-6 w-6 border-l border-t border-[#00a8c4]/60" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-1 bottom-6 h-6 w-6 border-b border-r border-[#0f172a]/25" aria-hidden="true" />
      <div className="rounded-[20px] border border-[#d5dde5] bg-[#fafbfc] p-1.5 shadow-[12px_24px_48px_rgba(15,23,42,0.07)]">
        {children}
      </div>
      <p className="mt-2.5 font-mono text-[10px] tracking-[0.2em] text-[#94a3b8]">
        önizleme · mod_{index + 1}
      </p>
    </div>
  );
}

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const reducedMotion = useReducedMotion() ?? false;
  const { slides: contentSlides } = useContent();

  const slides = useMemo(() => {
    return BASE_SLIDES.map((base, index) => {
      const content = contentSlides[index];
      if (!content) return base;
      const mediaUrl = String(content.mediaUrl || "").trim();
      const mediaType =
        content.mediaType === "image" || content.mediaType === "video" || content.mediaType === "gif"
          ? content.mediaType
          : "none";
      const mediaAnim = attentionEffectClass(content.effectPreset, reducedMotion);
      const overlayAnim = attentionEffectClass(content.overlayEffect, reducedMotion);
      const hasMedia = Boolean(mediaUrl) && mediaType !== "none";
      // İlk slayt, diğer iki slayt gibi ürün/panel simülasyonu olarak kalır.
      // Admin'e yüklenen geniş medya bu slaytta paneli tamamen ezmez.
      const visual = hasMedia && index !== 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#0f172a]">
          {content.effectCss ? <style>{content.effectCss}</style> : null}
          {mediaType === "video" ? (
            <video
              key={mediaUrl}
              src={mediaUrl}
              className={`hero-slide-media aspect-[16/10] w-full object-cover ${mediaAnim}`}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              key={mediaUrl}
              src={mediaUrl}
              alt=""
              className={`hero-slide-media aspect-[16/10] w-full object-cover ${mediaAnim}`}
            />
          )}
          {content.overlayUrl ? (
            <div className="pointer-events-none absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
              <img
                src={content.overlayUrl}
                alt={content.overlayName || "Kampanya"}
                className={`h-16 w-16 rounded-2xl border-2 border-white object-cover shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:h-20 sm:w-20 ${overlayAnim}`}
              />
            </div>
          ) : null}
        </div>
      ) : content.overlayUrl ? (
        <div className="relative">
          {base.visual}
          <div className="pointer-events-none absolute bottom-3 right-3 sm:bottom-5 sm:right-5">
            <img
              src={content.overlayUrl}
              alt={content.overlayName || "Kampanya"}
              className={`h-16 w-16 rounded-2xl border-2 border-white object-cover shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:h-20 sm:w-20 ${overlayAnim}`}
            />
          </div>
        </div>
      ) : (
        base.visual
      );
      return {
        ...base,
        badge: content.badge || base.badge,
        title: content.title ? <>{content.title}</> : base.title,
        desc: content.desc || base.desc,
        primaryCta: {
          text: content.primaryCtaText || base.primaryCta.text,
          href: content.primaryCtaHref || base.primaryCta.href,
        },
        secondaryCta: {
          text: content.secondaryCtaText || base.secondaryCta.text,
          href: content.secondaryCtaHref || base.secondaryCta.href,
        },
        visual,
      };
    });
  }, [contentSlides, reducedMotion]);

  useEffect(() => {
    const id = "hero-space-grotesk";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = HERO_FONT_HREF;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (document.getElementById("hero-slide-keyframes")) return;
    const style = document.createElement("style");
    style.id = "hero-slide-keyframes";
    style.textContent =
      "@keyframes heroDrift{0%,100%{transform:scale(1) translate(0,0)}50%{transform:scale(1.04) translate(-1%,1%)}}@keyframes heroShimmer{0%{filter:brightness(1)}50%{filter:brightness(1.15)}100%{filter:brightness(1)}}";
    document.head.appendChild(style);
  }, []);

  const heroIntro = useMemo(
    () => ({
      container: {
        hidden: {},
        show: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.11,
            delayChildren: reducedMotion ? 0 : 0.06,
          },
        },
      },
      item: {
        hidden: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 22 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reducedMotion ? 0 : 0.58,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        },
      },
      ctaGroup: {
        hidden: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reducedMotion ? 0 : 0.5,
            ease: [0.22, 1, 0.36, 1] as const,
            delay: reducedMotion ? 0 : 0.08,
          },
        },
      },
    }),
    [reducedMotion],
  );

  // Auto slide effect
  useEffect(() => {
    if (!isAutoPlay || slides.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isAutoPlay, slides.length]);

  const slide = slides[activeSlide] || slides[0];
  if (!slide) return null;

  return (
    <section className="relative overflow-hidden bg-[#f2f4f7]">
      <HeroAmbientBackground reducedMotion={reducedMotion} />

      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-16">
        {/* Sekme — underline, pill kutusu yok */}
        <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-6 border-b border-[#cfd6de]">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveSlide(idx);
                    setIsAutoPlay(false);
                  }}
                  aria-label={s.badge}
                  aria-current={activeSlide === idx ? "true" : undefined}
                  className={`relative shrink-0 pb-3 text-[13px] transition-colors sm:text-[14px] ${
                    activeSlide === idx ? "font-semibold text-[#0f172a]" : "font-medium text-[#64748b] hover:text-[#0f172a]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {idx === 0 && <Store className="h-3.5 w-3.5 opacity-60" />}
                    {idx === 1 && <Target className="h-3.5 w-3.5 opacity-60" />}
                    {idx === 2 && <Globe className="h-3.5 w-3.5 opacity-60" />}
                    {s.navLabel}
                  </span>
                  {activeSlide === idx ? (
                    <motion.span
                      layoutId="hero-tab-line"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00a8c4]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-end">
            <span className="font-mono text-[11px] tracking-widest text-[#94a3b8]">
              {String(activeSlide + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
            </span>
            <div className="flex items-center overflow-hidden rounded-full border border-[#c5d8df] bg-white p-0.5 shadow-[0_8px_20px_rgba(15,40,50,0.06)]">
              <button
                type="button"
                onClick={() => {
                  setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
                  setIsAutoPlay(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#334155] transition hover:bg-[#e8f8fb] hover:text-[#008fac] active:scale-95"
                aria-label="Önceki slayt"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
              </button>
              <span className="h-4 w-px bg-[#d7e5ea]" aria-hidden />
              <button
                type="button"
                onClick={() => {
                  setActiveSlide((prev) => (prev + 1) % slides.length);
                  setIsAutoPlay(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00a8c4] text-white shadow-[0_6px_14px_rgba(0,168,196,0.35)] transition hover:bg-[#008fac] active:scale-95"
                aria-label="Sonraki slayt"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -8 }}
            transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14"
          >
            <motion.div initial="hidden" animate="show" variants={heroIntro.container}>
              <motion.p
                variants={heroIntro.item}
                className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#008fac]"
              >
                {slide.badge}
              </motion.p>

              <motion.h1
                variants={heroIntro.item}
                className="mt-4 max-w-xl text-[36px] font-bold leading-[1.06] tracking-[-0.035em] text-[#0f172a] sm:text-[54px]"
                style={{ fontFamily: HERO_DISPLAY_FONT }}
              >
                {slide.title}
              </motion.h1>

              <motion.p
                variants={heroIntro.item}
                className="mt-5 max-w-lg text-[15px] font-normal leading-[1.7] text-[#5c6570] sm:text-[17px]"
              >
                {slide.desc}
              </motion.p>

              <motion.div
                variants={heroIntro.ctaGroup}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <Link
                  to={slide.primaryCta.href}
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-[#1e293b]"
                >
                  {slide.primaryCta.text}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to={slide.secondaryCta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#b8c4ce] bg-white/60 px-6 py-3.5 text-[14px] font-medium text-[#334155] transition hover:border-[#00a8c4] hover:text-[#008fac]"
                >
                  {slide.secondaryCta.text}
                </Link>
              </motion.div>

              <motion.ul
                variants={heroIntro.item}
                className="mt-8 space-y-2 border-t border-[#d8dee6] pt-6"
              >
                {slide.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-[13px] text-[#475569]">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#008fac]" strokeWidth={2.5} />
                    <span>{h}</span>
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            <VisualFrame index={activeSlide}>{slide.visual}</VisualFrame>
          </motion.div>
        </AnimatePresence>

        <motion.div
          key={`stats-row-${activeSlide}`}
          className="mt-14 border-t border-[#d8dee6] pt-8 sm:mt-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8%" }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: reducedMotion ? 0 : 0.12,
                delayChildren: reducedMotion ? 0 : 0.05,
              },
            },
          }}
        >
          <div className="grid grid-cols-1 gap-0 divide-y divide-[#e2e8ee] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {slide.stats.map((s) => {
              const StatIcon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  variants={{
                    hidden: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 28 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: reducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="flex items-start gap-4 px-0 py-5 sm:px-6 sm:py-4 first:sm:pl-0 last:sm:pr-0"
                >
                  <StatIcon className="mt-1 h-4 w-4 shrink-0 text-[#008fac]" strokeWidth={2} />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#94a3b8]">{s.tag}</p>
                    <p
                      className="mt-1 text-[22px] font-semibold tracking-tight text-[#0f172a] sm:text-[24px]"
                      style={{ fontFamily: HERO_DISPLAY_FONT }}
                    >
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug text-[#64748b]">{s.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
