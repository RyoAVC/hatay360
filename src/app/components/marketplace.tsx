import { useState } from "react";
import { useContent } from "../context/content-context";
import {
  Check,
  ArrowRight,
  Layers,
  Globe,
  Target,
  Smartphone,
  Code2,
  Sparkles,
  ExternalLink,
  Zap,
  Lock,
  Cpu,
  Monitor,
  Tablet,
  Search,
  Terminal,
  Key,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal } from "./motion-primitives";
import { BrandLogo, MARKETPLACE_BRANDS } from "./brand-logo";

const ECOSYSTEM_SERVICES = [
  {
    id: "pazarla",
    icon: Layers,
    title: "Pazarla · Pazaryeri Entegrasyonu",
    subtitle: "Trendyol, Hepsiburada, N11, Amazon, PttAVM Entegrasyonu",
    desc: "Tüm pazaryeri satışlarınızı, siparişlerinizi, stoklarınızı ve fiyatlarınızı tek merkezden otomatik senkronize edin.",
    highlights: [
      "Saniyeler içinde stok ve fiyat senkronizasyonu",
      "Otomatik e-fatura & kargo barkod entegrasyonu",
      "Entegratörsüz doğrudan pazaryeri API bağlantısı",
    ],
    badge: "Pazaryeri Entegratörü",
  },
  {
    id: "webtasarim",
    icon: Globe,
    title: "Özel Web Tasarım & UI/UX",
    subtitle: "%100 Özgün, Mobil Uyumlu & SEO Dostu Arayüzler",
    desc: "Markanıza özel tasarlanmış ultra hızlı e-ticaret siteleri, kurumsal web siteleri ve React/Next.js özel web projeleri.",
    highlights: [
      "Google PageSpeed 99+ yeşil performans skoru",
      "Işık hızında sepet, sipariş & ödeme altyapısı",
      "Masaüstü, tablet ve mobil cihazlara %100 tam uyum",
    ],
    badge: "Özel Web Arayüzü",
  },
  {
    id: "googleads",
    icon: Target,
    title: "Google Ads (AdWords) & SEO Ajansı",
    subtitle: "Arama, Alışveriş, Performance Max & Organik Büyüme",
    desc: "Google Ads reklam bütçenizi maksimum ROAS ile yönetiyoruz. Arama motoru optimizasyonu (SEO) ile Google'da 1. sayfaya çıkın.",
    highlights: [
      "Google Arama & Performance Max Alışveriş Reklamları",
      "Detaylı Dönüşüm & GA4 Etkinlik Kurulumu",
      "Google 1. Sayfa Garantili Organik SEO Stratejisi",
    ],
    badge: "Google Partner Ajans",
  },
  {
    id: "mobilapp",
    icon: Smartphone,
    title: "iOS & Android Mobil Uygulama",
    subtitle: "App Store & Play Store Yayınlı Mobil E-Ticaret",
    desc: "Müşterilerinizin telefonuna özel uygulamanızla girin. Sınırsız push bildirim, biometrik giriş ve anlık indirim kampanyaları.",
    highlights: [
      "App Store & Play Store Yayını ve Onay Süreçleri",
      "Sınırsız Anlık Push Bildirimi & Flaş Kampanyalar",
      "Yüksek Performanslı Native Mobil Uygulama Deneyimi",
    ],
    badge: "App Store & Play Store",
  },
  {
    id: "yazilim",
    icon: Code2,
    title: "Özel Yazılım & Otomasyon",
    subtitle: "API, Bot ve İş Süreçleri Otomasyonu",
    desc: "Stok botları, e-fatura, özel API ve otomasyon araçlarıyla operasyonunuzu Hatay360 yazılım ekibi kurar.",
    highlights: [
      "Özel API entegrasyonları ve otomasyon botları",
      "E-fatura ve stok senkronu lisansları",
      "7/24 kesintisiz yazılım desteği ve güncellemeler",
    ],
    badge: "Hatay360 Yazılım",
  },
];

// Orijinal Marka Logoları
const MARKETPLACE_LOGOS = MARKETPLACE_BRANDS.map((id) => ({
  id,
  name:
    id === "hepsiburada"
      ? "Hepsiburada"
      : id === "ciceksepeti"
        ? "Çiçeksepeti"
        : id === "pttavm"
          ? "PttAVM"
          : id === "n11"
            ? "N11"
            : id.charAt(0).toUpperCase() + id.slice(1),
}));

export function Marketplace({ hideIntro = false }: { hideIntro?: boolean }) {
  const { services } = useContent();
  const [activeTab, setActiveTab] = useState("reklam");
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile">("desktop");
  const selectedService = services.find((s) => s.id === activeTab) || services[0];

  return (
    <section id="pazarla" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {!hideIntro && (
        <Reveal y={30} className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b3e5ee] bg-white px-4 py-1.5 text-[13px] font-bold text-[#00a8c4] shadow-sm">
            <Sparkles className="h-4 w-4" /> Hatay360 Hizmetleri
          </span>
          <h2 className="mt-4 text-[32px] font-black tracking-tight text-[#1a1a1a] sm:text-[44px]">
            E-Ticaret, Web Tasarım, Ads, App ve Yazılım
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[#514f6e]">
            İhtiyacınız olan e-ticaret altyapısı, özel web tasarımı, Google Ads reklam yönetimi, mobil uygulama ve{" "}
            <strong className="font-bold text-[#00a8c4]">Hatay360 yazılım</strong> çözümleri tek çatı altında.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {MARKETPLACE_BRANDS.map((id) => (
              <BrandLogo key={id} id={id} size={40} />
            ))}
          </div>
        </Reveal>
        )}

        {/* Canlı & Renkli Hizmet Seçim Sekmeleri */}
        <div className={`${hideIntro ? "mt-0" : "mt-12"} flex flex-wrap items-center justify-center gap-2.5 rounded-3xl border-2 border-[#b3e5ee] bg-white p-3 shadow-md`}>
          {services.map((serv) => {
            const isActive = activeTab === serv.id;
            return (
              <button
                key={serv.id}
                onClick={() => setActiveTab(serv.id)}
                className={`flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-[14px] font-extrabold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#00a8c4] to-[#3ec8dc] text-white shadow-lg shadow-[#00a8c4]/30 scale-105"
                    : "bg-transparent text-[#514f6e] hover:bg-[#e8f8fb] hover:text-[#00a8c4]"
                }`}
              >
                <span>
                  {
                    (
                      {
                        reklam: "Google & Meta",
                        webtasarim: "Web Tasarım",
                        googleads: "Yerel SEO",
                        mobilapp: "Mobil App",
                        yazilim: "Yazılım",
                        pazarla: "Pazarla",
                      } as Record<string, string>
                    )[serv.id] || serv.title.split("·")[0].split("&")[0]
                  }
                </span>
              </button>
            );
          })}
        </div>

        {/* SEÇİLEN HİZMET İÇİN CANLI KART VE ÖNİZLEME */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="mt-8 rounded-3xl border-2 border-[#b3e5ee] bg-white p-8 shadow-[0px_24px_60px_rgba(0,168,196,0.12)] sm:p-10"
          >
            <div className="grid items-center gap-10 lg:grid-cols-2">
              {/* Sol Taraf: Detaylar */}
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00a8c4]/10 px-4 py-1 text-[12px] font-extrabold text-[#00a8c4]">
                  {selectedService.badge}
                </span>
                <h3 className="mt-4 text-[28px] font-black text-[#1a1a1a] sm:text-[36px]">
                  {selectedService.title}
                </h3>
                <p className="mt-2 text-[16px] font-extrabold text-[#00a8c4]">
                  {selectedService.subtitle}
                </p>
                <p className="mt-4 text-[16px] leading-relaxed text-[#514f6e]">
                  {selectedService.desc}
                </p>

                <ul className="mt-6 space-y-3">
                  {selectedService.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00a8c4] text-white shadow-sm">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[15px] font-bold text-[#1a1a1a]">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="/paketler"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-7 py-3.5 text-[15px] font-extrabold text-white shadow-[0px_10px_28px_rgba(0,168,196,0.35)] transition-all hover:bg-[#0088a0] hover:shadow-[0px_14px_34px_rgba(0,168,196,0.5)]"
                  >
                    Hemen Teklif Alın <ArrowRight className="h-4 w-4" />
                  </a>

                  {selectedService.externalUrl && (
                    <a
                      href={selectedService.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1a1a1a] bg-[#1a1a1a] px-6 py-3.5 text-[15px] font-extrabold text-white shadow-md hover:bg-[#2d2d3a] hover:border-[#00a8c4]"
                    >
                      Hatay360 Yazılım Detayı <ExternalLink className="h-4 w-4 text-[#00a8c4]" />
                    </a>
                  )}
                </div>
              </div>

              {/* Sağ Taraf: ULTRA GELİŞMİŞ CANLI GÖRSEL MOKAPLARI */}
              <div className="relative">
                {/* --- TAB 1: PAZARLA PAZARYERİ PANATİ VE MARKALAR --- */}
                {activeTab === "pazarla" && (
                  <div className="overflow-hidden rounded-3xl border-2 border-[#ffb3bc] bg-gradient-to-br from-[#1a1a1a] via-[#0d2428] to-[#120a10] p-6 text-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00a8c4] text-white shadow-md">
                          <Layers className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-[15px] font-extrabold text-white">Pazarla Pazaryeri Paneli</p>
                          <p className="text-[11px] text-white/70">Tüm Pazaryerleri Canlı Entegre</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#10b981]/20 px-3 py-1 text-[11px] font-extrabold text-[#10b981]">
                        <span className="h-2 w-2 rounded-full bg-[#10b981] animate-ping" />
                        API Bağlı
                      </span>
                    </div>

                    {/* Pazaryeri Marka Rozetleri ve Logoları */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {MARKETPLACE_LOGOS.map((m) => (
                        <div
                          key={m.id}
                          className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-3"
                        >
                          <BrandLogo id={m.id} size={32} />
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-extrabold leading-tight text-white" title={m.name}>
                              {m.name}
                            </p>
                            <p className="text-[10px] font-bold text-[#10b981]">Entegre</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#00a8c4] to-[#3ec8dc] p-4 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white/80">Aylık Otomatik Senkronizasyon</span>
                        <Zap className="h-4 w-4 text-[#ffd700]" />
                      </div>
                      <p className="mt-1 text-[32px] font-black tracking-tight">250.000+ Kalem</p>
                      <p className="mt-0.5 text-[12px] text-white/90">Sıfır stok çakışması, tam otomasyon.</p>
                    </div>
                  </div>
                )}

                {/* --- TAB 2: ÖZEL WEB TASARIM & UI/UX --- */}
                {activeTab === "webtasarim" && (
                  <div className="overflow-hidden rounded-3xl border-2 border-[#10b981]/30 bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#022c22] p-6 text-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                        <span className="h-3 w-3 rounded-full bg-[#eab308]" />
                        <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                        <span className="ml-2 flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-0.5 text-[11px] text-white/80 font-mono">
                          <Lock className="h-3 w-3 text-[#10b981]" /> https://markaniz.com
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg">
                        <button
                          onClick={() => setDevicePreview("desktop")}
                          className={`p-1 rounded cursor-pointer ${devicePreview === "desktop" ? "bg-[#10b981] text-white" : "text-white/60"}`}
                        >
                          <Monitor className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDevicePreview("mobile")}
                          className={`p-1 rounded cursor-pointer ${devicePreview === "mobile" ? "bg-[#10b981] text-white" : "text-white/60"}`}
                        >
                          <Tablet className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-[#10b981] px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                          Google PageSpeed Skor
                        </span>
                        <span className="text-[11px] font-extrabold text-[#10b981]">Mükemmel Performans</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-[34px] font-black text-[#10b981] leading-none">99 / 100</p>
                          <p className="text-[12px] text-white/80 mt-1">Lüks & Modern E-Ticaret Arayüzü</p>
                        </div>
                        <div className="h-14 w-14 rounded-full border-4 border-[#10b981] flex items-center justify-center font-black text-[13px]">
                          99%
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2.5 text-center text-[11px]">
                      <div className="rounded-xl bg-white/10 p-2.5 border border-white/10">
                        <p className="font-extrabold text-[#10b981]">0.4 Saniye</p>
                        <p className="text-white/70">Açılış Hızı</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-2.5 border border-white/10">
                        <p className="font-extrabold text-[#38bdf8]">0.00 CLS</p>
                        <p className="text-white/70">Sıfır Kayma</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-2.5 border border-white/10">
                        <p className="font-extrabold text-[#f43f5e]">%100 SEO</p>
                        <p className="text-white/70">Google Dostu</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 3: GOOGLE ADS (ADWORDS) & SEO GELİŞMİŞ TASARIM --- */}
                {activeTab === "reklam" && (
                  <div className="overflow-hidden rounded-3xl border-2 border-[#3b82f6]/40 bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0f172a] p-6 text-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        {/* Authentic 4-Color Google 'G' Logo SVG */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white p-1.5 shadow-md">
                          <svg className="h-full w-full" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.13C3.26 21.3 7.37 24 12 24z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.28 14.22c-.25-.72-.38-1.49-.38-2.22s.13-1.5.38-2.22V6.65H1.29C.47 8.2.01 10.05.01 12s.46 3.8 1.28 5.35l3.99-3.13z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.65l3.99 3.13c.95-2.85 3.6-4.96 6.72-4.96z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[15px] font-extrabold text-white">Google Ads (AdWords)</p>
                          <p className="text-[11px] text-[#38bdf8] font-bold">Google Partner Sertifikalı Ajans</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#3b82f6] px-3 py-1 text-[11px] font-black text-white shadow-sm">
                        5.8x ROAS
                      </span>
                    </div>

                    {/* Google Search Bar Mockup */}
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 border border-white/20 text-[12px] font-mono">
                      <Search className="h-4 w-4 text-[#38bdf8]" />
                      <span className="text-white">E-Ticaret Altyapısı & Dijital Reklam Ajansı</span>
                    </div>

                    {/* Google Search Live Ad Mockup */}
                    <div className="mt-3 rounded-2xl bg-white p-4 text-[#1a1a1a] shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-[#4285f4]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#1a0dab]">
                          Sponsorlu Reklam • Google #1 Sıra
                        </span>
                        <span className="text-[11px] font-extrabold text-[#10b981]">CTR %6.15</span>
                      </div>
                      <p className="mt-2 text-[14px] font-black text-[#1a0dab] hover:underline cursor-pointer">
                        Sizin Markanız | Resmi E-Ticaret Satış Mağazası
                      </p>
                      <p className="mt-1 text-[11px] text-[#4d5156] leading-tight">
                        Özel fırsatlarla alışverişe hemen başlayın. Aynı gün ücretsiz kargo ve kapıda ödeme seçeneği.
                      </p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] p-3 text-white shadow-md">
                        <p className="text-[10px] text-white/80 font-bold">Google Ads Ciro</p>
                        <p className="text-[20px] font-black">₺327.000+</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/10">
                        <p className="text-[10px] text-white/80 font-bold">Organik SEO</p>
                        <p className="text-[18px] font-black text-[#10b981]">1. Sayfa #1</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 4: YEREL SEO & GÖRÜNÜRLÜK --- */}
                {(activeTab === "googleads") && (
                  <div className="overflow-hidden rounded-3xl border-2 border-[#14b8a6]/35 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.28),transparent_34%),linear-gradient(145deg,#052e2b,#0f172a_65%)] p-6 text-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#14b8a6] text-white shadow-[0_10px_28px_rgba(20,184,166,0.35)]">
                          <Search className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-[15px] font-black">Hatay Yerel SEO Görünümü</p>
                          <p className="text-[11px] font-bold text-[#5eead4]">İlçe + hizmet + arama niyeti</p>
                        </div>
                      </div>
                      <span className="rounded-full border border-[#5eead4]/25 bg-[#14b8a6]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#99f6e4]">15 ilçe</span>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/95 p-4 text-[#0f172a] shadow-xl">
                      <div className="flex items-center gap-2 rounded-xl border border-[#dbe7eb] bg-[#f8fafc] px-3 py-2.5">
                        <Search className="h-4 w-4 text-[#0f766e]" />
                        <span className="text-[12px] font-semibold">hatay web tasarım firması</span>
                      </div>
                      <p className="mt-3 text-[11px] font-semibold text-[#047857]">https://hatay360.com/hatay/antakya</p>
                      <p className="mt-1 text-[15px] font-black text-[#1d4ed8]">Antakya Web Tasarım ve Reklam | Hatay360</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#475569]">Antakya’da kurumsal web tasarım, Google Ads ve yerel görünürlük çözümleri.</p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2.5">
                      {[
                        { label: "İlçe sayfası", value: "15", color: "#5eead4" },
                        { label: "Arama niyeti", value: "42", color: "#7dd3fc" },
                        { label: "Teknik SEO", value: "96", color: "#86efac" },
                      ].map((metric) => (
                        <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
                          <p className="text-[20px] font-black" style={{ color: metric.color }}>{metric.value}</p>
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-white/55">{metric.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Antakya", "İskenderun", "Defne", "Dörtyol", "Samandağ"].map((district) => (
                        <span key={district} className="rounded-full border border-[#5eead4]/20 bg-[#14b8a6]/10 px-3 py-1.5 text-[10px] font-black text-[#99f6e4]">{district}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- TAB 5: İOS & ANDROİD MOBİL APP --- */}
                {activeTab === "mobilapp" && (
                  <div className="overflow-hidden rounded-3xl border-2 border-[#a855f7]/40 bg-gradient-to-br from-[#2e1065] via-[#581c87] to-[#2e1065] p-6 text-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a855f7] text-white">
                          <Smartphone className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-[15px] font-extrabold text-white">iOS & Android Mobil App</p>
                          <p className="text-[11px] text-white/70">App Store & Play Store Yayını</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#ec4899] px-3 py-1 text-[11px] font-black text-white">
                        Yayında
                      </span>
                    </div>

                    {/* App Push Notification Preview */}
                    <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#ec4899] p-4 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white/90">🔔 Anlık Push Bildirimi</span>
                        <span className="text-[10px] text-white/70">Şimdi</span>
                      </div>
                      <p className="mt-1.5 text-[14px] font-extrabold">🔥 Flaş Kampanya Başladı!</p>
                      <p className="text-[11px] text-white/90">Sepetinizdeki ürünlerde %30 sürpriz indirim tanımlandı.</p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
                        <p className="text-[22px] font-black text-[#38bdf8]">100K+</p>
                        <p className="text-[11px] text-white/70">Aktif İndirme</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
                        <p className="text-[22px] font-black text-[#ffd700]">★ 4.9 / 5</p>
                        <p className="text-[11px] text-white/70">Store Memnuniyeti</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 6: ÖZEL YAZILIM --- */}
                {activeTab === "yazilim" && (
                  <div className="overflow-hidden rounded-3xl border-2 border-[#00a8c4] bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#000000] p-6 text-white shadow-2xl font-mono">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00a8c4] to-[#3ec8dc] text-white shadow-md">
                          <Terminal className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-[15px] font-extrabold text-white">Hatay360 Yazılım Paneli</p>
                          <p className="text-[11px] text-[#00a8c4] font-extrabold">API & otomasyon</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#10b981]/20 px-3 py-1 text-[11px] font-bold text-[#10b981]">
                        <span className="h-2 w-2 rounded-full bg-[#10b981] animate-ping" />
                        API ACTIVE
                      </span>
                    </div>

                    <div className="mt-4 rounded-2xl bg-black/80 p-4 border border-white/15 text-[11px] space-y-2 text-white/90 shadow-inner">
                      <div className="flex items-center justify-between text-[#38bdf8]">
                        <span>$ hatay360_sync --channel=trendyol</span>
                        <Key className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-[#10b981] font-bold">[RESPONSE]: SYNC_OK 2026 (Active)</p>
                      <p className="text-[#f43f5e]">[API_ENDPOINT]: https://api.hatay360.com/v1/sync</p>
                      <p className="text-[#ffd700]">[WEBHOOK]: Stok & Fatura Otomasyonu Çalışıyor (200 OK)</p>
                    </div>

                    <a
                      href="/iletisim"
                      className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#00a8c4] to-[#3ec8dc] p-4 text-white font-sans shadow-lg hover:brightness-110 transition-all cursor-pointer"
                    >
                      <div>
                        <p className="text-[14px] font-extrabold">Özel yazılım teklifi alın</p>
                        <p className="text-[11px] text-white/90">Bot, API ve otomasyon ihtiyaçlarınızı konuşalım</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-white" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
