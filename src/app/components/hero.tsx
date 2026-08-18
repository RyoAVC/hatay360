import { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { LiveDashboard } from "./live-dashboard";
import { BrandLogo } from "./brand-logo";

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

// --- SLIDE 3 VISUAL: Web Design & Mobile App Simulation ---
function WebAndAppSimulation() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#ecebf5] bg-white p-5 shadow-[0px_20px_50px_rgba(25,33,61,0.08)] sm:p-6">
      <div className="flex items-center justify-between border-b border-[#f1f2f9] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#10b981] to-[#3b82f6] text-white shadow-md">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-[#1a1a1a]">Web Tasarım & Mobil App</h4>
            <p className="text-[12px] text-[#514f6e]">Modern UI/UX & Responsive Yazılım</p>
          </div>
        </div>
        <span className="rounded-full bg-[#10b981]/10 px-3 py-1 text-[11px] font-bold text-[#10b981]">
          %100 Özel Tasarım
        </span>
      </div>

      {/* Live Web Design Showcase Card */}
      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-[#e2e8f0] bg-gradient-to-br from-[#1a1a1a] to-[#2d2d3a] p-4 text-white shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
              <span className="ml-2 text-[10px] text-white/60 font-mono">https://sizinmarkaniz.com</span>
            </div>
            <span className="flex items-center gap-1 rounded-md bg-[#10b981]/20 px-2 py-0.5 text-[10px] font-bold text-[#10b981]">
              <Gauge className="h-3 w-3" /> PageSpeed: 99/100
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/70">Ultra Hızlı & SEO Uyumlu</p>
              <p className="text-[14px] font-extrabold text-white mt-0.5">Lüks & Modern Web Arayüzü</p>
            </div>
            <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90">
              Responsive / Mobil
            </span>
          </div>
        </div>

        {/* Mobile App & Push Banner */}
        <div className="flex items-center justify-between rounded-2xl border border-[#ecebf5] bg-[#f8fafc] p-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a855f7] text-white">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[13px] font-bold text-[#1a1a1a]">iOS & Android Mobil Uygulama</p>
              <p className="text-[11px] text-[#64748b]">Sınırsız Push bildirim & hızlı sepet</p>
            </div>
          </div>
          <span className="rounded-lg bg-[#a855f7]/10 px-2.5 py-1 text-[10px] font-bold text-[#a855f7]">
            App Store
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-around text-center text-[12px] font-semibold text-[#514f6e]">
        <span>✨ Özgün UI/UX</span>
        <span>•</span>
        <span>⚡ 0.6s Açılış Hızı</span>
        <span>•</span>
        <span>📱 Mobil İlk Tasarım</span>
      </div>
    </div>
  );
}

// --- SLIDE DEFINITIONS ---
const SLIDES = [
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
    secondaryCta: { text: "Ajans hizmetleri", href: "/pazarla" },
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

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto slide effect
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const slide = SLIDES[activeSlide];

  return (
    <section className="relative overflow-hidden bg-[#f5f9fb]">
      {/* Dynamic Background Glows */}
      <motion.div
        className="pointer-events-none absolute -left-20 top-8 h-[28rem] w-[28rem] rounded-full bg-[#00a8c4]/8 blur-3xl"
        animate={{ scale: [1, 1.18, 1], x: [0, 32, 0], y: [0, 24, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-20 top-24 h-[24rem] w-[24rem] rounded-full bg-[#dbeafe]/10 blur-3xl"
        animate={{ scale: [1, 1.12, 1], x: [0, -28, 0], y: [0, -18, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-20">
        {/* Slider Tab Navigation / Controls */}
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[22px] border border-[#e8edf3] bg-white/90 p-2 shadow-[0_10px_25px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:mb-10 sm:gap-3">
          <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max min-w-full items-center gap-1 sm:gap-2">
            {SLIDES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveSlide(idx);
                  setIsAutoPlay(false);
                }}
                aria-label={s.badge}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-black tracking-[0.05em] uppercase transition-all sm:flex-1 sm:justify-center sm:px-4 sm:text-[12px] ${
                  activeSlide === idx
                    ? "bg-[#edf9fb] text-[#0b9cb9] shadow-sm ring-1 ring-[#d7f4f8]"
                    : "bg-transparent text-[#5f6b7a] hover:bg-[#f5fbfd] hover:text-[#0fa9c3]"
                }`}
              >
                {idx === 0 && <Store className="h-4 w-4" />}
                {idx === 1 && <Target className="h-4 w-4" />}
                {idx === 2 && <Globe className="h-4 w-4" />}
                <span>{s.navLabel}</span>
              </button>
            ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 border-l border-[#edf2f7] pl-2 sm:gap-2 sm:pl-3">
            <span className="hidden text-[12px] font-black tracking-[0.14em] text-[#94a3b8] sm:inline">
              {activeSlide + 1} / {SLIDES.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
                  setIsAutoPlay(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8edf3] bg-white text-[#0f172a] hover:border-[#d2ebf3] hover:text-[#0fa9c3]"
                aria-label="Önceki Slayt"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setActiveSlide((prev) => (prev + 1) % SLIDES.length);
                  setIsAutoPlay(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8edf3] bg-white text-[#0f172a] hover:border-[#d2ebf3] hover:text-[#0fa9c3]"
                aria-label="Sonraki Slayt"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid items-center gap-12 lg:grid-cols-2"
          >
            {/* Left Text Column */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d8ecf1] bg-[#edfafd] px-3.5 py-1.5 text-[12px] font-black uppercase tracking-[0.18em] text-[#0a7d96] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#00a8c4] animate-ping" />
                {slide.badge}
              </span>

              <h1 className="mt-5 max-w-xl text-[38px] font-black leading-[0.96] tracking-[-0.06em] text-[#0f172a] sm:text-[58px]">
                {slide.title}
              </h1>

              <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[#475569] sm:text-[17px]">
                {slide.desc}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={slide.primaryCta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3.5 text-[15px] font-bold text-white shadow-[0px_10px_24px_rgba(15,169,195,0.20)] transition-all hover:-translate-y-0.5 hover:bg-[#0fa9c3]"
                >
                  {slide.primaryCta.text} <ArrowRight className="h-[18px] w-[18px]" />
                </Link>
                <Link
                  to={slide.secondaryCta.href}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfeaf1] bg-white px-6 py-3.5 text-[15px] font-bold text-[#0f172a] transition-all hover:border-[#c7ebf4] hover:text-[#0fa9c3]"
                >
                  {slide.secondaryCta.text}
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {slide.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-[14px] font-semibold text-[#334155]">
                    <Check className="h-4 w-4 text-[#00a8c4]" /> {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Interactive Visual Simulation */}
            <div className="relative">{slide.visual}</div>
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Modern Glass Stats */}
        <motion.div
          key={`stats-${activeSlide}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
        >
          {slide.stats.map((s) => {
            const StatIcon = s.icon;
            return (
              <motion.div
                key={s.label}
                whileHover={{ y: -6, boxShadow: "0px 16px 36px rgba(15,169,195,0.10)" }}
                className="relative overflow-hidden rounded-2xl border border-[#eaf1f6] bg-white p-5 shadow-[0px_8px_24px_rgba(15,23,42,0.05)] transition-all hover:border-[#cfeef5]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eefbff] text-[#0fa9c3] ring-1 ring-[#d5f7fb]">
                    <StatIcon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-[#ebfbff] px-2.5 py-1 text-[11px] font-bold text-[#0a7d96]">
                    {s.tag}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-[32px] font-extrabold tracking-tight text-[#0f172a] sm:text-[38px]">{s.value}</p>
                  <p className="mt-1 text-[14px] font-bold text-[#475569]">{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
