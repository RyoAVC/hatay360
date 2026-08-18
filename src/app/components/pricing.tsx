import { useState } from "react";
import { useContent, planKind, sectionOn, type Plan } from "../context/content-context";
import {
  Check,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Layers,
  Target,
  Smartphone,
  Code2,
  Sliders,
  Calculator,
  Flame,
  Wind,
  CarFront,
  Snowflake,
  CloudFog,
  Zap,
  Crown,
  Orbit,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal } from "./motion-primitives";
import { StorePackages } from "./store-packages";
import { BrandChip, BrandLogo, BrandLogoRow, MARKETPLACE_BRANDS, ADS_BRANDS, APP_BRANDS, resolveBrandId } from "./brand-logo";

const VIEW_MODES = [
  { id: "hazir", label: "Hazır Paketler", icon: Sparkles },
  { id: "yapilandirici", label: "Akıllı Paket Yapılandırıcı", icon: Sliders },
];

const FAQS = [
  {
    q: "Paket fiyatına Google ve Meta reklam bütçesi dahil mi?",
    a: "Hayır. Paket tutarı Hatay360 yönetim ücretidir. Google ve Meta'ya giden reklam bütçesi ayrıca, sizin hesabınıza ve sizinindir. İsterseniz bütçeyi birlikte planlarız; para ajansa kalmaz.",
  },
  {
    q: "Paketlere kurulum ve eğitim dahil mi?",
    a: "Evet. Reklam landing page veya mağaza kurulumu anahtar teslim yapılır, panel eğitimi ücretsizdir. Satışa başladığınız andan itibaren destek hattımız yanınızdadır.",
  },
  {
    q: "Pazarla pazaryeri entegrasyonu için ekstra komisyon öder miyim?",
    a: "Hayır! Pazarla pazaryeri entegrasyonu paketlerimize dahildir. Komisyon veya ek aracı entegratör ücreti alınmaz.",
  },
  {
    q: "Google Ads ve Meta reklam yönetimi nasıl yapılıyor?",
    a: "Google Certified & Meta reklam uzman kadromuz reklam bütçenizi analiz eder, Performance Max ve dönüşüm reklamlarını maksimum ROAS getirisi elde edecek şekilde kurar.",
  },
  {
    q: "Özel yazılım ve otomasyon neleri kapsar?",
    a: "Stok botları, e-fatura entegratörleri ve işletmenize özel API otomasyon modüllerini Hatay360 yazılım ekibi kurar ve destekler.",
  },
];

type EffectStyle = "none" | "fire" | "ice" | "speed" | "neon" | "electric" | "gold" | "cosmic";

function PackageEffectBadge({ style, text }: { style: EffectStyle; text: string }) {
  if (style === "none" || !text.trim()) return null;

  const themes = {
    fire: "border-orange-200 bg-[linear-gradient(105deg,#7c2d12,#dc2626_42%,#f97316)] text-white shadow-[0_9px_30px_rgba(249,115,22,.55)]",
    ice: "border-cyan-100 bg-[linear-gradient(105deg,#083344,#0369a1_45%,#67e8f9)] text-white shadow-[0_9px_32px_rgba(34,211,238,.5)]",
    speed: "border-sky-100 bg-[linear-gradient(105deg,#082f49,#0369a1,#06b6d4)] text-white shadow-[0_9px_30px_rgba(14,165,233,.42)]",
    neon: "border-fuchsia-200 bg-[linear-gradient(105deg,#3b0764,#7e22ce,#06b6d4)] text-white shadow-[0_9px_32px_rgba(168,85,247,.52)]",
    electric: "border-cyan-100 bg-[linear-gradient(105deg,#172554,#1d4ed8,#06b6d4)] text-white shadow-[0_9px_34px_rgba(37,99,235,.62)]",
    gold: "border-yellow-100 bg-[linear-gradient(105deg,#713f12,#d97706,#facc15)] text-white shadow-[0_9px_34px_rgba(245,158,11,.58)]",
    cosmic: "border-violet-100 bg-[linear-gradient(105deg,#1e1b4b,#6d28d9,#db2777)] text-white shadow-[0_9px_34px_rgba(124,58,237,.58)]",
  } as const;

  const Icon = style === "fire" ? Flame : style === "ice" ? Snowflake : style === "speed" ? CarFront : style === "gold" ? Crown : style === "cosmic" ? Orbit : Zap;

  return (
    <motion.div
      animate={style === "speed" ? { x: [-3, 3, -3] } : style === "fire" ? { y: [0, -6, 0], scale: [1, 1.045, 1] } : { y: [0, -4, 0], scale: [1, 1.025, 1] }}
      transition={{ duration: style === "fire" ? 0.95 : 1.65, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute left-1/2 z-20 flex -translate-x-1/2 items-center justify-center rounded-full border-2 font-black uppercase motion-reduce:transform-none motion-reduce:animate-none ${
        style === "fire"
          ? "-top-6 min-h-12 w-[calc(100%-1rem)] gap-2.5 border-[3px] px-3 py-2.5 text-center text-[10px] leading-tight tracking-[0.1em] sm:px-4 sm:text-[11px] lg:text-[10px] xl:text-[11px]"
          : "-top-5 min-h-9 max-w-[calc(100%-1rem)] gap-2 whitespace-nowrap px-4 py-2 text-[10px] tracking-[0.12em]"
      } ${themes[style]}`}
    >
      {style === "fire" && (
        <>
          <motion.span aria-hidden="true" animate={{ boxShadow: ["0 0 18px 5px rgba(249,115,22,.38)", "0 0 38px 12px rgba(239,68,68,.62)", "0 0 18px 5px rgba(249,115,22,.38)"] }} transition={{ duration: 1.05, repeat: Infinity }} className="pointer-events-none absolute inset-0 rounded-full" />
          <span className="pointer-events-none absolute -top-8 left-3 right-3 flex items-end justify-around" aria-hidden="true">
            {[18, 27, 21, 33, 24, 29, 17].map((height, index) => <motion.i key={index} animate={{ y: [7, -9, 7], x: [0, index % 2 ? 3 : -3, 0], scale: [0.48, 1.08, 0.48], opacity: [0.35, 1, 0.35] }} transition={{ duration: 0.62 + index * 0.08, repeat: Infinity, delay: index * 0.06 }} className="w-2.5 origin-bottom rounded-[80%_20%_55%_45%] bg-gradient-to-t from-red-600 via-orange-400 to-yellow-100 shadow-[0_0_9px_rgba(253,224,71,.8)] blur-[.15px]" style={{ height }} />)}
          </span>
        </>
      )}
      {style === "ice" && (
        <span className="pointer-events-none absolute -top-5 left-2 right-2 flex justify-between" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => <motion.i key={index} animate={{ y: [3, -9, 3], x: [0, index % 2 ? 5 : -5, 0], rotate: [0, 90, 180], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5 + index * 0.15, repeat: Infinity, delay: index * 0.12 }} className="h-3 w-3 bg-cyan-100 shadow-[0_0_10px_white] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />)}
        </span>
      )}
      {style === "electric" && (
        <span className="pointer-events-none absolute -inset-x-2 -top-3 flex justify-around" aria-hidden="true">
          {[0, 1, 2, 3].map((bolt) => <motion.i key={bolt} animate={{ opacity: [0, 1, 0.15, 1, 0], scaleY: [0.6, 1.25, 0.8] }} transition={{ duration: 0.55 + bolt * 0.08, repeat: Infinity, delay: bolt * 0.11 }} className="h-5 w-1 rotate-[24deg] bg-cyan-100 shadow-[0_0_12px_#67e8f9] [clip-path:polygon(50%_0,100%_0,64%_42%,100%_42%,20%_100%,42%_55%,0_55%)]" />)}
        </span>
      )}
      {style === "gold" && (
        <motion.span aria-hidden="true" animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="pointer-events-none absolute -inset-4 -z-10 rounded-full opacity-70 [background:repeating-conic-gradient(from_0deg,rgba(254,240,138,.85)_0deg,transparent_8deg,transparent_22deg)]" />
      )}
      {style === "cosmic" && (
        <span aria-hidden="true" className="pointer-events-none absolute -inset-3">
          {[0, 1, 2, 3, 4].map((star) => <motion.i key={star} animate={{ rotate: [0, 360], scale: [0.6, 1.3, 0.6], opacity: [0.25, 1, 0.25] }} transition={{ duration: 2.2 + star * 0.25, repeat: Infinity, delay: star * 0.16 }} className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_9px_white]" style={{ left: `${8 + star * 21}%`, top: star % 2 ? 0 : "78%" }} />)}
        </span>
      )}
      <span className={`relative flex shrink-0 items-center justify-center rounded-full bg-white/18 ${style === "fire" ? "h-7 w-7 shadow-[0_0_16px_rgba(254,240,138,.75)]" : "h-5 w-5"}`}>
        <Icon className={`${style === "fire" ? "h-5 w-5 fill-yellow-300 text-yellow-100" : "h-4 w-4 text-white"}`} />
        <i className="absolute -inset-1 animate-ping rounded-full border border-white/40 motion-reduce:hidden" />
      </span>
      <span className="relative">{text}</span>
      {style === "ice" && <CloudFog className="h-4 w-4 animate-pulse text-cyan-50 motion-reduce:animate-none" />}
      {style === "speed" && <Wind className="h-4 w-4 animate-pulse text-cyan-100 motion-reduce:animate-none" />}
    </motion.div>
  );
}

function FloatingAdLogos() {
  const logos = [
    { id: "google", left: "3%", size: 44, duration: 10.2, delay: 0, drift: 16, hideMobile: false, label: "Ads" },
    { id: "meta", left: "16%", size: 34, duration: 12.4, delay: 1.6, drift: -14, hideMobile: false, label: "" },
    { id: "google", left: "28%", size: 38, duration: 9.6, delay: 3.1, drift: 12, hideMobile: true, label: "AdWords" },
    { id: "instagram", left: "41%", size: 32, duration: 11.8, delay: 0.8, drift: -18, hideMobile: true, label: "" },
    { id: "google", left: "54%", size: 48, duration: 10.8, delay: 2.4, drift: 10, hideMobile: false, label: "Ads" },
    { id: "facebook", left: "67%", size: 30, duration: 13.2, delay: 4.2, drift: -12, hideMobile: true, label: "" },
    { id: "google", left: "78%", size: 36, duration: 9.4, delay: 1.2, drift: 14, hideMobile: false, label: "" },
    { id: "meta", left: "90%", size: 40, duration: 12.1, delay: 2.9, drift: -10, hideMobile: false, label: "Ads" },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute -inset-x-4 -bottom-8 -top-10 z-0 overflow-hidden rounded-[42px]">
      {logos.map((logo, index) => (
        <motion.div
          key={`${logo.id}-${index}`}
          initial={{ y: 160, opacity: 0 }}
          animate={{ y: [160, -90], x: [0, logo.drift, 0], opacity: [0, 0.85, 0.55, 0] }}
          transition={{ duration: logo.duration, delay: logo.delay, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute bottom-0 ${logo.hideMobile ? "hidden sm:block" : "block"}`}
          style={{ left: logo.left }}
        >
          <motion.div
            animate={{ y: [0, -10, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 2.6 + index * 0.12, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex flex-col items-center"
          >
            <span className="flex items-center justify-center rounded-full border border-white/80 bg-white p-2.5 shadow-[0_12px_28px_rgba(66,133,244,0.22)]">
              <i className="absolute inset-1 -z-10 rounded-full bg-[#4285f4]/18 blur-md" />
              <BrandLogo id={logo.id} size={logo.size} className="rounded-full" />
            </span>
            {logo.label ? (
              <span className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-[#1a73e8] shadow-sm">
                {logo.label}
              </span>
            ) : null}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const rawStyle = (plan.effectStyle || (plan.id === "enterprise" ? "ice" : "none")) as EffectStyle;
  const effectStyle = rawStyle === "fire" ? "none" : rawStyle;
  const effectText = plan.effectText || (effectStyle === "ice" ? "Özel teklif fırsatı" : plan.badge);

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0px 20px 45px rgba(0,168,196,0.15)" }}
      className={`relative z-10 flex flex-col justify-between rounded-3xl p-7 transition-all ${
        plan.featured
          ? "bg-gradient-to-b from-[#18181f] via-[#0f2428] to-[#0f0f12] text-white shadow-2xl border-2 border-[#00a8c4] ring-4 ring-[#b3e5ee]"
          : "border-2 border-[#ecebf5] bg-white text-[#1a1a1a] shadow-sm hover:border-[#b3e5ee]"
      }`}
    >
      {plan.featured && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: [0, -4, 0], scale: [1, 1.02, 1] }}
          transition={{
            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.4 },
          }}
          className="absolute -top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#ffd700] bg-gradient-to-r from-[#1a1a1a] via-[#002a32] to-[#1a1a1a] px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-[0px_8px_28px_rgba(0,168,196,0.55)] ring-2 ring-[#00a8c4]/60"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ffd700] text-[10px] font-black text-[#1a1a1a] shadow-sm animate-pulse">★</span>
          <span className="bg-gradient-to-r from-white via-[#ffe5e8] to-[#ffd700] bg-clip-text text-transparent">
            EN ÇOK TERCİH EDİLEN PAKET
          </span>
        </motion.div>
      )}

      {!plan.featured && <PackageEffectBadge style={effectStyle} text={effectText} />}

      <div>
        <div className="flex flex-col items-start gap-3">
          <h3 className={`text-[24px] font-black ${plan.featured ? "text-white" : "text-[#1a1a1a]"}`}>{plan.name}</h3>
          {!plan.featured && (
            <span className="inline-flex min-h-9 w-full items-center rounded-xl border border-[#a7dfe8] bg-[#e9f8fb] px-3 py-2 text-left text-[11px] font-black leading-snug text-[#075164] shadow-[0_5px_14px_rgba(0,126,151,0.1)]">
              {plan.badge}
            </span>
          )}
        </div>
        <p className={`mt-2 text-[13px] font-medium leading-relaxed ${plan.featured ? "text-white/80" : "text-[#514f6e]"}`}>{plan.desc}</p>
        <div className={`mt-6 rounded-2xl border p-4 ${plan.featured ? "border-white/20 bg-white/10" : "border-[#b3e5ee] bg-[#f4fbfd]"}`}>
          <p className={`text-[12px] font-bold line-through ${plan.featured ? "text-white/60" : "text-[#94a3b8]"}`}>{plan.oldPrice}</p>
          <p className={`mt-1 text-[34px] font-black leading-none ${plan.featured ? "text-white" : "text-[#1a1a1a]"}`}>{plan.price}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
            <span className="text-[#00a8c4]">{plan.installments}</span>
            <span className={plan.featured ? "text-white/80" : "text-[#64748b]"}>{plan.monthlyPrice}</span>
          </div>
        </div>
        <a
          href="/iletisim"
          className={`mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-black transition-all hover:scale-105 ${
            plan.featured
              ? "bg-gradient-to-r from-[#00a8c4] to-[#3ec8dc] text-white shadow-lg"
              : "border-2 border-[#1a1a1a] bg-[#1a1a1a] text-white hover:border-[#00a8c4] hover:bg-[#00a8c4]"
          }`}
        >
          {plan.cta} <ArrowRight className="h-4 w-4" />
        </a>
        {plan.pills && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {plan.pills.map((p) => (
              <BrandChip key={p.text} name={p.text} dark={!!plan.featured} />
            ))}
          </div>
        )}
        <div className={`my-5 h-px w-full ${plan.featured ? "bg-white/20" : "bg-[#eceaf7]"}`} />
        <ul className="space-y-2.5 text-[13px]">
          {plan.features.map((f, fIdx) => (
            <li key={fIdx} className="flex items-start gap-2.5">
              {f.iconPng ? (
                <img src={f.iconPng} alt="" className="mt-0.5 h-5 w-5 object-contain" />
              ) : resolveBrandId(f.text) ? (
                <BrandLogo name={f.text} size={18} className="mt-0.5" />
              ) : (
                <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-[#3ec8dc]" : "text-[#00a8c4]"}`} />
              )}
              <span className={`font-semibold ${plan.featured ? "text-white/90" : "text-[#334155]"}`}>{f.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export function Pricing({ hideHeader = false }: { hideHeader?: boolean }) {
  const { plans, settings } = useContent();
  const showBuilder = sectionOn(settings, "packageBuilder");
  const [viewMode, setViewMode] = useState<"hazir" | "yapilandirici">("hazir");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // AKILLI PAKET YAPILANDIRICI STATE'LERİ
  const [productCount, setProductCount] = useState(5000);
  const [includeMarketplaces, setIncludeMarketplaces] = useState(true);
  const [includeAds, setIncludeAds] = useState(true);
  const [includeApp, setIncludeApp] = useState(false);
  const [includeLabs, setIncludeLabs] = useState(false);

  // Hesaplanan tahmini fiyat
  const calculatedMonthly = Math.round(
    1490 +
      (productCount > 1000 ? 500 : 0) +
      (includeMarketplaces ? 990 : 0) +
      (includeAds ? 1490 : 0) +
      (includeApp ? 1990 : 0) +
      (includeLabs ? 1290 : 0)
  );

  const adsPlans = plans.filter((p) => planKind(p) === "ads");
  const storePlans = plans.filter((p) => planKind(p) === "store");

  return (
    <section id="paketler" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">

      {!hideHeader && (
      <Reveal className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#b3e5ee] bg-[#e8f8fb] px-4 py-1.5 text-[13px] font-extrabold text-[#00a8c4]">
          <Sparkles className="h-4 w-4" /> Hatay360 Reklam & Görünürlük Paketi
        </span>
        <h2 className="mt-4 text-[34px] font-black tracking-tight text-[#1a1a1a] sm:text-[46px]">
          Reklam bütçenizi satışa çeviren paketleri seçin
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-[#514f6e]">
          Google Ads, Meta reklamları, yerel SEO ve satış odaklı landing page çözümleri için hazır paketleri inceleyin veya özel hedefinize göre paket oluşturun.
        </p>
      </Reveal>
      )}

      {showBuilder && (
      <div className="mt-10 flex justify-center">
        <div className="inline-flex items-center rounded-2xl border-2 border-[#b3e5ee] bg-white p-2 shadow-lg">
          {VIEW_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as "hazir" | "yapilandirici")}
                className={`flex items-center gap-2.5 rounded-xl px-6 py-3 text-[14px] font-extrabold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#00a8c4] to-[#3ec8dc] text-white shadow-md shadow-[#00a8c4]/30 scale-105"
                    : "text-[#514f6e] hover:text-[#00a8c4]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      )}

      <AnimatePresence mode="wait">
        {(showBuilder ? viewMode : "hazir") === "hazir" ? (
          /* --- MOD 1: AVCI HAZIR PAKETLER GRID --- */
          <motion.div
            key="hazir-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-14 space-y-16"
          >
            <div>
              <div className="mx-auto max-w-2xl text-center">
                <h3 className="text-[22px] font-black text-[#1a1a1a]">Reklam paketleri</h3>
                <p className="mt-2 text-[14px] text-[#6f6c8f]">
                  Burada gördüğünüz tutar yönetim ücretidir. Google ve Meta'ya giden reklam bütçesi ayrıca, müşterinindir.
                </p>
              </div>
              <div className="relative isolate mt-10 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-6">
            <FloatingAdLogos />
            {adsPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
              </div>
            </div>
            {storePlans.length > 0 && <StorePackages plans={storePlans} />}
          </motion.div>
        ) : (
          /* --- MOD 2: AKILLI PAKET YAPILANDIRICI (DİNAMİK HESAPLAYICI) --- */
          <motion.div
            key="yapilandirici-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-14 rounded-3xl border-2 border-[#b3e5ee] bg-white p-8 shadow-2xl sm:p-12"
          >
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00a8c4]/10 px-3.5 py-1 text-[12px] font-black text-[#00a8c4]">
                  <Calculator className="h-4 w-4" /> Özel İhtiyaç Hesaplayıcı
                </span>
                <h3 className="mt-4 text-[28px] font-black text-[#1a1a1a]">
                  Paketinizi İhtiyacınıza Göre Özelleştirin
                </h3>
                <p className="mt-2 text-[15px] font-medium text-[#514f6e]">
                  Satış hacminize ve kullanmak istediğiniz dijital ajans modüllerine göre paketinizi şekillendirin.
                </p>

                {/* SLIDER 1: ÜRÜN SAYISI */}
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between text-[14px] font-black">
                    <span>Yüklenecek Ürün Hacmi</span>
                    <span className="text-[#00a8c4]">{productCount.toLocaleString()} Ürün</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={productCount}
                    onChange={(e) => setProductCount(Number(e.target.value))}
                    className="w-full accent-[#00a8c4] cursor-pointer"
                  />
                </div>

                {/* MODÜL TOGGLE SEÇENEKLERİ */}
                <div className="mt-8 space-y-3">
                  <p className="text-[14px] font-black text-[#1a1a1a]">Eklenecek Hizmet Modülleri:</p>

                  <label className="flex items-center justify-between rounded-2xl border border-[#ecebf5] p-3.5 cursor-pointer hover:bg-[#e8f8fb]">
                    <div className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-[#00a8c4]" />
                      <div>
                        <p className="text-[14px] font-extrabold text-[#1a1a1a]">Pazarla Entegrasyonu</p>
                        <p className="text-[11px] text-[#64748b]">Trendyol, Hepsiburada, N11 stok senkronu</p>
                        <BrandLogoRow ids={MARKETPLACE_BRANDS} size={22} className="mt-2" />
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeMarketplaces}
                      onChange={(e) => setIncludeMarketplaces(e.target.checked)}
                      className="h-5 w-5 accent-[#00a8c4] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-2xl border border-[#ecebf5] p-3.5 cursor-pointer hover:bg-[#eff6ff]">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-[#3b82f6]" />
                      <div>
                        <p className="text-[14px] font-extrabold text-[#1a1a1a]">Google Ads & Meta Ajans Desteği</p>
                        <p className="text-[11px] text-[#64748b]">Arama, PMax & Instagram dönüşüm reklamları</p>
                        <BrandLogoRow ids={ADS_BRANDS} size={22} className="mt-2" />
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeAds}
                      onChange={(e) => setIncludeAds(e.target.checked)}
                      className="h-5 w-5 accent-[#3b82f6] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-2xl border border-[#ecebf5] p-3.5 cursor-pointer hover:bg-[#fae8ff]">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-[#a855f7]" />
                      <div>
                        <p className="text-[14px] font-extrabold text-[#1a1a1a]">iOS & Android Mobil App</p>
                        <p className="text-[11px] text-[#64748b]">App Store & Play Store yayınlı özel uygulama</p>
                        <BrandLogoRow ids={APP_BRANDS} size={22} className="mt-2" />
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeApp}
                      onChange={(e) => setIncludeApp(e.target.checked)}
                      className="h-5 w-5 accent-[#a855f7] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-2xl border border-[#ecebf5] p-3.5 cursor-pointer hover:bg-[#f1f5f9]">
                    <div className="flex items-center gap-3">
                      <Code2 className="h-5 w-5 text-[#00a8c4]" />
                      <div>
                        <p className="text-[14px] font-extrabold text-[#1a1a1a]">Özel yazılım & otomasyon</p>
                        <p className="text-[11px] text-[#64748b]">Stok botları, API ve e-fatura modülleri</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeLabs}
                      onChange={(e) => setIncludeLabs(e.target.checked)}
                      className="h-5 w-5 accent-[#00a8c4] cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* DİNAMİK HESAPLANAN ÖZEL PAKET KARTI */}
              <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#18181f] via-[#0d2428] to-[#0d0d0d] p-8 text-white shadow-2xl border-2 border-[#00a8c4]">
                <div>
                  <span className="rounded-full bg-[#00a8c4] px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">
                    Özel Yapılandırılmış Paket
                  </span>
                  <p className="mt-4 text-[14px] text-white/80">Tahmini Aylık Yatırım Tutarı:</p>
                  <p className="mt-1 text-[44px] font-black text-white leading-none">
                    ₺{calculatedMonthly.toLocaleString()} <span className="text-[16px] text-white/70 font-normal">/ay</span>
                  </p>

                  <div className="mt-6 space-y-2.5 text-[13px]">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#10b981]" />
                      <span className="font-bold">12 Taksit İmkânı & Sözleşmesiz Esneklik</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#10b981]" />
                      <span className="font-bold">Google PageSpeed 99+ Hız Garantisi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#10b981]" />
                      <span className="font-bold">7/24 Kesintisiz Canlı Destek</span>
                    </div>
                  </div>
                </div>

                <a
                  href="/iletisim"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00a8c4] to-[#3ec8dc] py-4 text-[16px] font-black text-white shadow-lg transition-all hover:scale-105 cursor-pointer"
                >
                  Bu Yapılandırmayla Teklif Alın <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SSS ACCORDION */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h3 className="text-[26px] font-black text-[#1a1a1a] text-center">Sıkça Sorulan Sorular</h3>
        <div className="mt-8 space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border-2 border-[#ecebf5] bg-white overflow-hidden shadow-xs">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between p-5 text-left font-black text-[16px] text-[#1a1a1a] cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-[#00a8c4] transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
              </button>
              {openFaq === idx && (
                <div className="border-t border-[#ecebf5] p-5 text-[14px] text-[#475569] leading-relaxed bg-[#f4fbfd]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
