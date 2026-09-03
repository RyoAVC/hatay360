import { useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Store,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Layers,
  BarChart3,
  Users,
  Smartphone,
  Lock,
  ChevronRight,
  Laptop,
  Check,
  Zap,
  Award,
  Wallet,
  Building2,
  FileCheck,
  Clock,
  Eye,
  Settings,
  HelpCircle,
  Search,
  Activity,
  Sliders,
  Calculator,
  Compass,
  QrCode,
  PieChart,
  BadgePercent,
  Cpu,
  RefreshCw,
  Bell,
  ArrowUpRight,
  Database,
  Terminal,
  Fingerprint,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Radio,
  FileCode2,
} from "lucide-react";
import { apiRequest } from "../lib/api";

export function PanelsOverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get("tab") === "bayi" ? "bayi" : "musteri";
  const [activeTab, setActiveTab] = useState<"musteri" | "bayi">(initialTab);

  // İnteraktif Laboratuvar / Canlı Widget Sekmesi
  const [activeSandboxTab, setActiveSandboxTab] = useState<number>(0);

  // Demo Giriş Yükleniyor Durumları
  const [isCustomerDemoLoading, setIsCustomerDemoLoading] = useState(false);
  const [isPartnerDemoLoading, setIsPartnerDemoLoading] = useState(false);

  // 3D Hesaplayıcı Slider State'leri
  const [clientCountSlider, setClientCountSlider] = useState<number>(8);
  const [budgetSlider, setBudgetSlider] = useState<number>(15000);

  // E-İmza Simülasyon State'i
  const [signedSimulated, setSignedSimulated] = useState<boolean>(false);

  // SSS Accordion State'i
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleTabChange = (tab: "musteri" | "bayi") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Demo Müşteri Girişi Tetikleme
  const handleCustomerDemoLogin = async () => {
    setIsCustomerDemoLoading(true);
    try {
      await apiRequest("/api/customer/demo-login", { method: "POST" });
      window.location.href = "/musteri";
    } catch {
      window.location.href = "/musteri/giris";
    } finally {
      setIsCustomerDemoLoading(false);
    }
  };

  // Demo Bayi Girişi Tetikleme
  const handlePartnerDemoLogin = async () => {
    setIsPartnerDemoLoading(true);
    try {
      await apiRequest("/api/partners/demo-login", { method: "POST" });
      window.location.href = "/firma";
    } catch {
      window.location.href = "/firma/giris";
    } finally {
      setIsPartnerDemoLoading(false);
    }
  };

  // Bayi Kazanç Hesaplama Mantığı (%30 komisyon + aylık düzenli getiri)
  const estimatedPartnerEarning = useMemo(() => {
    const avgSetupFee = 12500;
    const commissionRate = 0.3;
    const monthlyRenewal = 1200;
    const setupEarnings = clientCountSlider * avgSetupFee * commissionRate;
    const recurringMonthly = clientCountSlider * monthlyRenewal * 0.25;
    return Math.round(setupEarnings + recurringMonthly);
  }, [clientCountSlider]);

  // Müşteri Trafik ve Ciro Tahmini
  const estimatedCustomerGrowth = useMemo(() => {
    const trafficMultiplier = Math.round((budgetSlider / 5000) * 120 + 350);
    const estimatedCalls = Math.round(trafficMultiplier * 0.14);
    const estimatedRoas = (4.2 + (budgetSlider / 25000) * 0.8).toFixed(1);
    return { trafficMultiplier, estimatedCalls, estimatedRoas };
  }, [budgetSlider]);

  return (
    <div className="min-h-screen bg-[#061017] text-white selection:bg-[#00a8c4] selection:text-white">
      {/* ─── 3D PERSPEKTİF & GLOW STİLLERİ ──────────────────── */}
      <style>{`
        .perspective-1200 { perspective: 1200px; }
        .perspective-1600 { perspective: 1600px; }
        .preserve-3d { transform-style: preserve-3d; }
        .tilt-card-3d {
          transform: rotateX(7deg) rotateY(-8deg) rotateZ(1deg);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease;
        }
        .tilt-card-3d:hover {
          transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(-6px);
        }
        .floating-badge-3d { transform: translateZ(45px); }
        .floating-badge-3d-deep { transform: translateZ(65px); }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) translateZ(40px); }
          50% { transform: translateY(-10px) translateZ(40px); }
        }
        .animate-float-3d { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-3d-delayed { animation: floatSlow 7s ease-in-out 2.5s infinite; }
      `}</style>

      {/* ─── ARKA PLAN DOKUSU & IŞIKLAR ─────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[750px] w-[1400px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#00a8c4]/25 via-[#0891b2]/12 to-transparent blur-[150px]" />
        <div className="absolute top-1/3 -left-48 h-[650px] w-[650px] rounded-full bg-[#00a8c4]/15 blur-[140px]" />
        <div className="absolute bottom-20 -right-48 h-[750px] w-[750px] rounded-full bg-[#0891b2]/18 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* ─── HERO & 3D SWITCHER ─────────────────────────────── */}
      <section className="relative pt-12 pb-14 sm:pt-20 sm:pb-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#00a8c4]/40 bg-[#00a8c4]/10 px-5 py-2 text-[12px] font-bold tracking-wider text-[#38bdf8] backdrop-blur-2xl shadow-[0_0_35px_rgba(0,168,196,0.35)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38bdf8] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00a8c4]" />
            </span>
            <span className="uppercase tracking-[0.18em]">3D Yeni Nesil Canlı Yönetim Ekosistemi</span>
          </div>

          <h1 className="mt-6 text-[36px] font-black tracking-tight text-white sm:text-[54px] lg:text-[66px] leading-[1.08]">
            İşletmeniz ve Ajansınız İçin{" "}
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#00a8c4] to-[#2dd4bf] bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,168,196,0.3)]">
              3D Akıllı Kontrol
            </span>{" "}
            Merkezleri
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-[16px] font-medium leading-relaxed text-slate-300 sm:text-[19px]">
            Hatay'daki yerel esnafa şeffaf reklam, harita ve e-imza denetimi sağlayan <strong>Müşteri Yönetim Portalı</strong>; bölgedeki dijital ajanslara %30 komisyon ve white-label güç sunan <strong>Bayi & Partner Hub</strong>.
          </p>

          {/* 3D Segmented Switcher */}
          <div className="mx-auto mt-9 flex max-w-md rounded-2xl border border-white/20 bg-white/[0.06] p-1.5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
            <button
              onClick={() => handleTabChange("musteri")}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-black transition-all duration-300 ${
                activeTab === "musteri"
                  ? "bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#2dd4bf] text-white shadow-[0_8px_25px_rgba(0,168,196,0.45)] scale-[1.02]"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>🏬 Müşteri Portalı</span>
            </button>
            <button
              onClick={() => handleTabChange("bayi")}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-black transition-all duration-300 ${
                activeTab === "bayi"
                  ? "bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#2dd4bf] text-white shadow-[0_8px_25px_rgba(0,168,196,0.45)] scale-[1.02]"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>💼 Bayi & Partner Hub</span>
            </button>
          </div>

          {/* ⚡ CANLI DEMO GİRİŞİ VURGULU AKSİYONLARI ─── */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {activeTab === "musteri" ? (
              <>
                <button
                  onClick={handleCustomerDemoLogin}
                  disabled={isCustomerDemoLoading}
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-[#00a8c4] to-[#38bdf8] px-8 py-4 text-[15px] font-black text-white shadow-[0_15px_40px_rgba(0,168,196,0.45)] transition hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-4.5 w-4.5 text-yellow-300" />
                  <span>{isCustomerDemoLoading ? "Demo Giriş Yapılıyor..." : "⚡ Canlı Müşteri Panelini Demo Olarak Aç"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to="/musteri/giris"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/[0.08] px-7 py-4 text-[14.5px] font-bold text-white backdrop-blur-2xl transition hover:bg-white/15"
                >
                  <span>Gerçek Müşteri Girişi</span>
                </Link>
                <Link
                  to="/musteri/kayit"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#00a8c4]/40 bg-[#00a8c4]/15 px-7 py-4 text-[14.5px] font-bold text-cyan-200 backdrop-blur-2xl transition hover:bg-[#00a8c4]/25"
                >
                  <span>Ücretsiz İşletme Hesabı Aç</span>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handlePartnerDemoLogin}
                  disabled={isPartnerDemoLoading}
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-[#00a8c4] to-[#38bdf8] px-8 py-4 text-[15px] font-black text-white shadow-[0_15px_40px_rgba(0,168,196,0.45)] transition hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-4.5 w-4.5 text-yellow-300" />
                  <span>{isPartnerDemoLoading ? "Bayi Girişi Yapılıyor..." : "⚡ Canlı Bayi Panelini Demo Olarak Aç"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to="/firma/giris"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/[0.08] px-7 py-4 text-[14.5px] font-bold text-white backdrop-blur-2xl transition hover:bg-white/15"
                >
                  <span>Gerçek Bayi Girişi</span>
                </Link>
                <Link
                  to="/firma/kayit"
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-7 py-4 text-[14.5px] font-bold text-emerald-300 backdrop-blur-2xl transition hover:bg-emerald-500/25"
                >
                  <span>Bayilik Başvurusu Yap (%30 Komisyon)</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── 3D PERSPEKTİF ISOMETRIC SAHNE (3D DEVICE SHOWCASE) ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 perspective-1600">
        <div className="relative preserve-3d">
          {/* 3D Floating Badges */}
          <div className="hidden lg:block">
            {activeTab === "musteri" ? (
              <>
                {/* 3D Sol Rozet: Harita Sinyali */}
                <div className="absolute -left-12 top-16 z-30 flex items-center gap-3 rounded-2xl border border-[#00a8c4]/40 bg-[#0d2633]/90 p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-float-3d">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a8c4]/20 text-[#38bdf8]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">Google Haritalar Canlı</p>
                    <p className="text-[14px] font-black text-white">412 Yol Tarifi / Hafta</p>
                    <p className="text-[10px] text-slate-400">Antakya Tarihi Çarşı Lokasyonu</p>
                  </div>
                </div>

                {/* 3D Sağ Rozet: E-İmza & Sözleşme Onayı */}
                <div className="absolute -right-10 top-28 z-30 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-[#0c2826]/90 p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-float-3d-delayed">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Dijital E-İmza</p>
                    <p className="text-[14px] font-black text-white">Sözleşme Onaylandı</p>
                    <p className="text-[10px] text-slate-400">256-Bit Resmi Arşiv Kaydı</p>
                  </div>
                </div>

                {/* 3D Alt Sol Rozet: Canlı Reklam ROAS */}
                <div className="absolute -left-8 bottom-12 z-30 flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-[#251f12]/90 p-3.5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-float-3d-delayed">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black text-white">4.8x Reklam ROAS</p>
                    <p className="text-[10px] text-amber-200/80">Kuruşu kuruşuna şeffaf bütçe</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 3D Sol Rozet (Bayi): Komisyon Hakediş */}
                <div className="absolute -left-12 top-16 z-30 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-[#0c2826]/90 p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-float-3d">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Aylık Hakediş</p>
                    <p className="text-[15px] font-black text-white">₺58.400 Aktarıldı</p>
                    <p className="text-[10px] text-slate-400">İskenderun & Antakya Bayisi</p>
                  </div>
                </div>

                {/* 3D Sağ Rozet (Bayi): White-Label Ajans */}
                <div className="absolute -right-10 top-28 z-30 flex items-center gap-3 rounded-2xl border border-[#00a8c4]/40 bg-[#0d2633]/90 p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-float-3d-delayed">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a8c4]/20 text-[#38bdf8]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">White-Label Ajans</p>
                    <p className="text-[14px] font-black text-white">38 Aktif Esnaf Paneli</p>
                    <p className="text-[10px] text-slate-400">Kendi Logonuz & Markanızla</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ─── 3D TILT EDİLMİŞ ANA MOCKUP KARTI ─────────────── */}
          <div className="tilt-card-3d relative overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-b from-white/[0.09] via-white/[0.03] to-[#0a1b24] p-6 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] lg:p-9">
            {/* Üst Bar: macOS Window Frame */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-2.5">
                <div className="h-3.5 w-3.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/40" />
                <div className="h-3.5 w-3.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/40" />
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/40" />
                <div className="ml-3 hidden sm:flex items-center gap-2 rounded-xl bg-black/40 px-3.5 py-1 text-xs font-semibold text-slate-300 border border-white/10">
                  <Lock className="h-3 w-3 text-emerald-400" />
                  <span>https://hatay360.com/{activeTab === "musteri" ? "musteri" : "firma"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={activeTab === "musteri" ? handleCustomerDemoLogin : handlePartnerDemoLogin}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-3.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-400/30 hover:scale-105 transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                  <span>Canlı Panele Git</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* İçerik Düzeni */}
            <div className="mt-7 grid gap-6 lg:grid-cols-12">
              {/* Sol Sidebar Mockup */}
              <div className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4 lg:col-span-3 text-left">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#0891b2] to-[#00a8c4] flex items-center justify-center text-white font-black text-xs">
                    H360
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Hatay360 {activeTab === "musteri" ? "Müşteri" : "Bayi"}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold">● Canlı Demo Aktif</p>
                  </div>
                </div>

                {(activeTab === "musteri"
                  ? [
                      { label: "Dashboard Genel Bakış", icon: BarChart3, active: true },
                      { label: "Google Haritalar & SEO", icon: MapPin },
                      { label: "Google & Meta Ads", icon: TrendingUp },
                      { label: "E-İmza & Sözleşmeler", icon: FileCheck },
                      { label: "Ödeme & Faturalar", icon: CreditCard },
                      { label: "Sıra Numaralı Destek", icon: MessageSquare },
                      { label: "Güvenlik & 2FA Ayarı", icon: ShieldCheck },
                    ]
                  : [
                      { label: "Bayi Kazanç Dashboard", icon: BarChart3, active: true },
                      { label: "Müşteri Ekle & Pipeline", icon: Users },
                      { label: "Komisyon & IBAN Transfer", icon: Wallet },
                      { label: "Satış Paketleri & Fiyat", icon: Layers },
                      { label: "White-Label Markalama", icon: Building2 },
                      { label: "Hazır Teklif Taslakları", icon: FileText },
                      { label: "Öncelikli Bayi Desteği", icon: Zap },
                    ]
                ).map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12.5px] font-bold transition ${
                      item.active
                        ? "bg-gradient-to-r from-[#0891b2] to-[#00a8c4] text-white shadow-lg shadow-[#00a8c4]/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Sağ Dashboard Ana Sahne Mockup */}
              <div className="space-y-6 lg:col-span-9 text-left">
                {/* 3'lü Bento Metrik Kartları */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {activeTab === "musteri" ? (
                    <>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Harita & Web Ziyareti</span>
                          <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">+%240</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-white">4.820 Kişi</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Google Haritalar ve Aramalardan</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Telefon & Randevu</span>
                          <Smartphone className="h-4 w-4 text-[#38bdf8]" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-white">194 Talep</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Doğrudan arama ve WhatsApp formu</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Google Ads ROAS</span>
                          <Zap className="h-4 w-4 text-amber-400" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-white">4.8x Getiri</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Kuruşu kuruşuna şeffaf bütçe</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Toplam Hakediş Kazancı</span>
                          <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">Onaylandı</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-white">₺58.400</p>
                        <p className="mt-0.5 text-[11px] text-emerald-300 font-semibold">Bu ayki net bayi komisyonu</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Kayıtlı İşletmeler</span>
                          <Building2 className="h-4 w-4 text-[#38bdf8]" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-white">38 İşletme</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">İskenderun & Antakya Bölgesi</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Komisyon Oranınız</span>
                          <Award className="h-4 w-4 text-amber-400" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-white">%30 Sabit</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Satış ve yıllık yenilemelerde</p>
                      </div>
                    </>
                  )}
                </div>

                {/* İnteraktif Proje Takip & Durum Çubuğu */}
                <div className="rounded-2xl border border-[#00a8c4]/30 bg-gradient-to-r from-[#00a8c4]/15 to-[#0891b2]/10 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a8c4] text-white shadow-lg shadow-[#00a8c4]/40">
                        <Check className="h-5 w-5 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-white">
                          {activeTab === "musteri"
                            ? "Projeniz 5. Aşamada: Google Haritalar & Reklamlar Yayında"
                            : "Bayi Temsilciliği: İskenderun & Antakya Bölge Yetkisi Aktif"}
                        </h4>
                        <p className="text-xs text-cyan-200">
                          {activeTab === "musteri"
                            ? "Alan adı, 256-bit SSL, mobil responsive arayüz ve harita pini onaylandı."
                            : "White-label lisans anahtarınız ve müşteri ekleme yetkiniz devrededir."}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-xl bg-white/20 px-3.5 py-1.5 text-xs font-black text-white">
                      %100 Tamamlandı
                    </span>
                  </div>
                </div>

                {/* Alt 2 Kolon: Detaylı Analitik & E-İmza Önizlemesi */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4.5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-[#38bdf8]" />
                        <h5 className="text-xs font-bold text-white">Dijital E-İmza & Resmi Sözleşme</h5>
                      </div>
                      <span className="text-[10.5px] font-black text-emerald-400">Onaylı</span>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-300">
                      Hatay360 Kurumsal Hizmet ve Google Haritalar Sözleşmesi mobil ekranda dijital imza ile onaylanmış ve PDF olarak arşivlenmiştir.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4.5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <h5 className="text-xs font-bold text-white">256-Bit SSL & 2FA Güvenlik</h5>
                      </div>
                      <span className="text-[10.5px] font-black text-slate-400">Koruma Aktif</span>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-300">
                      Oturumlarınız iki adımlı SMS/e-posta doğrulamasıyla korunur. Yetkisiz giriş denemeleri anında engellenir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CANLI İNTERAKTİF LABORATUVAR & WIDGET DENEYİMİ ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 mb-3">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>Canlı Panel Özelliklerini Şimdi Test Edin</span>
          </div>
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            İnteraktif Modül Laboratuvarı
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Aşağıdaki sekmelere tıklayarak sistemin gerçek çalışma mekaniklerini ve canlı ekranlarını anında deneyimleyin.
          </p>
        </div>

        {/* Laboratuvar Sekmeleri */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 border-b border-white/10 pb-4">
          {[
            { id: 0, title: "Google Haritalar Radarı", icon: MapPin },
            { id: 1, title: "Reklam Bütçe & ROAS", icon: TrendingUp },
            { id: 2, title: "Dijital E-İmza Pad", icon: FileCheck },
            { id: 3, title: "Kredi Kartı & E-Fatura", icon: CreditCard },
            { id: 4, title: "Bayi Aday CRM (Kanban)", icon: Users },
            { id: 5, title: "5 Dk Hızlı Kurulum Sihirbazı", icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSandboxTab(tab.id)}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition duration-200 cursor-pointer ${
                activeSandboxTab === tab.id
                  ? "bg-[#00a8c4] text-white shadow-lg shadow-[#00a8c4]/30 scale-105"
                  : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.title}</span>
            </button>
          ))}
        </div>

        {/* Laboratuvar İçerik Vitrini */}
        <div className="mt-8 rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 sm:p-10 backdrop-blur-2xl">
          {activeSandboxTab === 0 && (
            <div className="grid gap-8 lg:grid-cols-12 items-center text-left">
              <div className="lg:col-span-6 space-y-4">
                <span className="rounded-lg bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300">
                  Yerel Harita & Arama Trafiği
                </span>
                <h3 className="text-2xl font-black text-white">Google Haritalar Canlı Takip Paneli</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  İşletmenizin Google Haritalar profili Hatay360 paneline bağlanır. Yol tarifi isteyenler, tek tıkla arayanlar ve arama kelimeleriniz anlık olarak grafiklere dökülür.
                </p>
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>Yol tarifi istekleri: <strong>412 adet / hafta</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>Telefon arama butonu tıklaması: <strong>89 arama</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>Google 1. Sayfa yerel sıralama: <strong>1. Sıra (#1)</strong></span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-black/40 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-white">📍 Tarihi Antakya Künefecisi (Canlı Profil)</span>
                  <span className="text-xs font-bold text-emerald-400">4.9 ★★★★★ (1.420 Yorum)</span>
                </div>
                <div className="h-28 w-full rounded-xl bg-gradient-to-r from-[#00a8c4]/20 via-[#0891b2]/10 to-transparent p-4 flex flex-col justify-end">
                  <p className="text-xs text-slate-400">Haftalık Arama Trafik Dağılımı</p>
                  <p className="text-2xl font-black text-white">+%310 Ziyaretçi Artışı</p>
                </div>
                <p className="text-[11px] text-slate-400 italic">Google Business Profile API v4 üzerinden 15 dakikada bir otomatik yenilenir.</p>
              </div>
            </div>
          )}

          {activeSandboxTab === 1 && (
            <div className="grid gap-8 lg:grid-cols-12 items-center text-left">
              <div className="lg:col-span-6 space-y-4">
                <span className="rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                  Google Ads & Meta Şeffaf Bütçe
                </span>
                <h3 className="text-2xl font-black text-white">Kuruşu Kuruşuna Reklam Raporu</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Reklam bütçeniz nereye gitti, kaç kişi tıkladı, kaç kişi telefon açtı? Gizli komisyonlar yok; doğrudan Google faturanız ve paneliniz eşzamanlı çalışır.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-[11px] text-slate-400">Aylık Harcanan</span>
                    <p className="text-lg font-black text-white">₺14.200</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <span className="text-[11px] text-slate-400">Gelen Form & Telefon</span>
                    <p className="text-lg font-black text-emerald-400">194 Talep</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-black/40 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-white">Google Arama Kampanyası</span>
                  <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">Aktif Yayın</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Tıklama Başına Maliyet (TBM):</span>
                    <span className="font-bold text-white">₺2.94</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Dönüşüm Oranı:</span>
                    <span className="font-bold text-emerald-400">%4.02</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">ROAS (Ciro Getiri Oranı):</span>
                    <span className="font-bold text-amber-400">4.8x</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSandboxTab === 2 && (
            <div className="grid gap-8 lg:grid-cols-12 items-center text-left">
              <div className="lg:col-span-6 space-y-4">
                <span className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                  Yasal & Resmi E-İmza
                </span>
                <h3 className="text-2xl font-black text-white">Telefondan Islak İmzasız Sözleşme Onayı</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Müşterileriniz kargo veya ıslak imza beklemeden, cep telefonu ekranından parmağıyla imzasını atar. Sistem anında 256-Bit mühürlü PDF üretir.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSignedSimulated(true)}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-[#00a8c4] px-6 py-3 text-xs font-black text-white shadow-lg cursor-pointer"
                  >
                    {signedSimulated ? "✓ E-İmza Başarıyla Kaydedildi" : "Ekrana Dokunarak İmzala (Simülasyon)"}
                  </button>
                </div>
              </div>
              <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-black/40 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-white">Hatay360 Hizmet ve Bakım Sözleşmesi v2.4</span>
                  <span className={`text-xs font-bold ${signedSimulated ? "text-emerald-400" : "text-amber-400"}`}>
                    {signedSimulated ? "✓ Onaylandı" : "İmza Bekleniyor"}
                  </span>
                </div>
                <div className="h-32 rounded-xl border border-dashed border-white/20 bg-white/[0.02] flex items-center justify-center p-4">
                  {signedSimulated ? (
                    <div className="text-center">
                      <p className="font-serif text-2xl italic text-emerald-400 tracking-wider">Mehmet Usta</p>
                      <p className="text-[10px] text-slate-400 mt-1">Dijital İmza Zaman Damgası: {new Date().toLocaleDateString("tr-TR")}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">İmza atmak için sol taraftaki butona basın</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSandboxTab === 3 && (
            <div className="grid gap-8 lg:grid-cols-12 items-center text-left">
              <div className="lg:col-span-6 space-y-4">
                <span className="rounded-lg bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300">
                  Online Ödeme & Mali Onay
                </span>
                <h3 className="text-2xl font-black text-white">Kredi Kartı, Taksit & E-Fatura</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  3D Secure korumalı kredi kartı çekimi, taksit imkanı veya havale bildirimi. Ödeme yapıldığı an resmi e-fatura PDF olarak arşivinize düşer.
                </p>
                <div className="flex gap-3 pt-2 text-xs">
                  <span className="rounded-lg bg-white/10 px-3 py-1.5 font-bold">💳 Tüm Banka Kartları</span>
                  <span className="rounded-lg bg-white/10 px-3 py-1.5 font-bold">🔒 256-Bit SSL 3D Secure</span>
                </div>
              </div>
              <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-black/40 p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-white">Son Faturalar</span>
                  <span className="text-xs font-bold text-cyan-300">PDF İndir</span>
                </div>
                {[
                  { no: "FAT-2026-084", desc: "Web Tasarım & Harita Kurulum Paketi", amount: "₺12.500", status: "Ödendi" },
                  { no: "FAT-2026-099", desc: "Aylık Google Ads Yönetim Bedeli", amount: "₺2.500", status: "Ödendi" },
                ].map((inv, idx) => (
                  <div key={idx} className="flex justify-between items-center rounded-xl bg-white/[0.03] p-3 text-xs">
                    <div>
                      <p className="font-bold text-white">{inv.no}</p>
                      <p className="text-[11px] text-slate-400">{inv.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{inv.amount}</p>
                      <span className="text-[10px] text-emerald-400 font-bold">{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSandboxTab === 4 && (
            <div className="grid gap-8 lg:grid-cols-12 items-center text-left">
              <div className="lg:col-span-6 space-y-4">
                <span className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                  Bayi Satış CRM Panosu
                </span>
                <h3 className="text-2xl font-black text-white">Aday Müşteri Kanban Pipeline</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Sahada görüştüğünüz esnafları aşama aşama takip edin: Aday Eklendi &rarr; Teklif Verildi &rarr; Sözleşme İmzalandı &rarr; Müşteri Yayında & Komisyon Hesaba Yattı!
                </p>
                <Link
                  to="/firma/kayit"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black text-black hover:bg-emerald-400 transition"
                >
                  <span>Bayilik Başvurusu Yap</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-black/40 p-6 space-y-3">
                <p className="text-xs font-bold text-white border-b border-white/10 pb-3">Canlı Aday Takip Panosu</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-2.5">
                    <p className="font-bold text-sky-300 text-[11px]">Teklif Aşaması</p>
                    <p className="text-lg font-black text-white mt-1">4 Firma</p>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5">
                    <p className="font-bold text-amber-300 text-[11px]">İmzada</p>
                    <p className="text-lg font-black text-white mt-1">2 Firma</p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                    <p className="font-bold text-emerald-300 text-[11px]">Yayında (Won)</p>
                    <p className="text-lg font-black text-emerald-400 mt-1">38 Firma</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSandboxTab === 5 && (
            <div className="grid gap-8 lg:grid-cols-12 items-center text-left">
              <div className="lg:col-span-6 space-y-4">
                <span className="rounded-lg bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300">
                  Otomatik Provisioning
                </span>
                <h3 className="text-2xl font-black text-white">5 Dakikada Yeni Müşteri Kurulumu</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Bayi paneli üzerinden işletme adı, telefon ve sektör seçildiğinde sistem alan adını bağlar, hazır sektörel temayı derler ve Google Harita başvurusunu otomatik iletir.
                </p>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p>✓ 1. Adım: Sektörel Demo Şablon Seçimi</p>
                  <p>✓ 2. Adım: Alan Adı ve SSL Sertifika Aktivasyonu</p>
                  <p>✓ 3. Adım: Google Maps Pin ve Reklam Entegrasyonu</p>
                </div>
              </div>
              <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-black/40 p-6 space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-white">Hızlı Müşteri Oluşturucu</span>
                  <span className="text-xs text-emerald-400 font-bold">Hazır</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    disabled
                    value="Defne Doğal Zeytinyağı Ltd."
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    disabled
                    value="Gastronomi & E-Ticaret Paketi"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-300"
                  />
                  <div className="rounded-xl bg-[#00a8c4]/20 border border-[#00a8c4]/40 p-3 text-center">
                    <p className="text-xs font-black text-cyan-200">Tek Tıkla Kurulumu Tamamla & Komisyonunu Al</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── İNTERAKTİF 3D KAZANÇ / GETİRİ HESAPLAYICI ─────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#00a8c4]/30 bg-gradient-to-br from-[#0c2430] via-[#091b24] to-[#07131a] p-8 sm:p-12 shadow-[0_25px_80px_rgba(0,0,0,0.8)]">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#00a8c4]/20 blur-3xl" />

          {activeTab === "musteri" ? (
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6 text-left">
                <div className="inline-flex items-center gap-2 rounded-lg bg-[#00a8c4]/20 px-3 py-1 text-xs font-bold text-[#38bdf8] mb-3">
                  <Calculator className="h-3.5 w-3.5" />
                  <span>İşletme Büyüme Simülatörü</span>
                </div>
                <h3 className="text-2xl font-black text-white sm:text-3xl">
                  Aylık Reklam Bütçenizle Ne Kadar Büyürsünüz?
                </h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Kaydıracı hareket ettirerek Google Ads, Haritalar ve Meta reklamlarıyla Hatay'da elde edebileceğiniz tahmini arama ve telefon trafiğini hesaplayın.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-300">Aylık Reklam Bütçesi:</span>
                    <span className="text-[#38bdf8] text-lg font-black">₺{budgetSlider.toLocaleString("tr-TR")}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="60000"
                    step="2500"
                    value={budgetSlider}
                    onChange={(e) => setBudgetSlider(Number(e.target.value))}
                    className="w-full h-2.5 rounded-lg bg-slate-700 appearance-none cursor-pointer accent-[#00a8c4]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>₺5.000 / Ay</span>
                    <span>₺30.000 / Ay</span>
                    <span>₺60.000 / Ay</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 grid gap-4 sm:grid-cols-2 text-left">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <span className="text-xs font-bold text-slate-400">Tahmini Ziyaretçi & Yol Tarifi</span>
                  <p className="mt-2 text-3xl font-black text-white">~{estimatedCustomerGrowth.trafficMultiplier.toLocaleString("tr-TR")}</p>
                  <p className="mt-1 text-[11px] text-cyan-300">Harita pini ve arama tıklaması</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <span className="text-xs font-bold text-slate-400">Tahmini Yeni Müşteri Çağrısı</span>
                  <p className="mt-2 text-3xl font-black text-emerald-400">~{estimatedCustomerGrowth.estimatedCalls} Adet</p>
                  <p className="mt-1 text-[11px] text-emerald-300">Doğrudan telefon & WhatsApp formu</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Tahmini Yatırım Getirisi (ROAS)</span>
                      <p className="text-2xl font-black text-amber-400">{estimatedCustomerGrowth.estimatedRoas}x Kat Ciro Artışı</p>
                    </div>
                    <button
                      onClick={handleCustomerDemoLogin}
                      className="rounded-xl bg-[#00a8c4] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#0891b2] transition cursor-pointer"
                    >
                      Demo İle İncele
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-6 text-left">
                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 mb-3">
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Bayi Kazanç Simülatörü</span>
                </div>
                <h3 className="text-2xl font-black text-white sm:text-3xl">
                  Aylık Bayilik Gelirinizi Hesaplayın
                </h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Bölgenizde kaç esnafa web sitesi ve Google Haritalar paketi satabileceğinizi seçin; hakediş ve yenileme komisyonunuzu canlı görün.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-300">Aylık Bağlanan Yeni Esnaf / İşletme:</span>
                    <span className="text-emerald-400 text-lg font-black">{clientCountSlider} Firma</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    step="1"
                    value={clientCountSlider}
                    onChange={(e) => setClientCountSlider(Number(e.target.value))}
                    className="w-full h-2.5 rounded-lg bg-slate-700 appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>2 Firma</span>
                    <span>15 Firma</span>
                    <span>30 Firma</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 grid gap-4 sm:grid-cols-2 text-left">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <span className="text-xs font-bold text-slate-400">Aylık Net Komisyon Hakedişiniz</span>
                  <p className="mt-2 text-3xl font-black text-emerald-400">₺{estimatedPartnerEarning.toLocaleString("tr-TR")}</p>
                  <p className="mt-1 text-[11px] text-emerald-300 font-semibold">%30 Kurulum + Yıllık Yenileme Payı</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <span className="text-xs font-bold text-slate-400">Yıllık Kümülatif Kazanç</span>
                  <p className="mt-2 text-3xl font-black text-white">₺{(estimatedPartnerEarning * 12).toLocaleString("tr-TR")}</p>
                  <p className="mt-1 text-[11px] text-slate-400">Sürekli büyüyen müşteri portföyüyle</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Yetkili Bölge Temsilciliği</span>
                      <p className="text-sm font-bold text-white">Hemen başvurun, ilçenizde bayiliği kilitleyin.</p>
                    </div>
                    <button
                      onClick={handlePartnerDemoLogin}
                      className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-black hover:bg-emerald-400 transition cursor-pointer"
                    >
                      Demo Bayi Paneline Git
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── SIK SORULAN SORULAR (FAQ ACCORDION) ─────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-black text-white sm:text-3xl">Sıkça Sorulan Sorular</h3>
          <p className="mt-2 text-xs text-slate-400">Müşteri ve bayi panelleri hakkında merak edilen tüm detaylar.</p>
        </div>

        <div className="space-y-3 text-left">
          {[
            {
              q: "Müşteri paneline girmek için kurulum şart mı?",
              a: "Hayır. Yukarıdaki 'Canlı Müşteri Panelini Demo Olarak Aç' butonuna basarak örnek künefe & restoran işletmesi verileriyle paneli anında şifresiz test edebilirsiniz. Gerçek işletmeniz için kayıt olduğunuzda ise tüm alanlar sizin adınıza canlıya alınır.",
            },
            {
              q: "Bayi paneli ile müşterilerime kendi markamla hizmet verebilir miyim?",
              a: "Evet! Hatay360 Bayi altyapısı %100 White-Label desteklidir. Müşterileriniz sizin logonuzu ve ajans unvanınızı görür; teknik altyapı Hatay360 mühendisleri tarafından sıfır kesintiyle yürütülür.",
            },
            {
              q: "Komisyon ödemeleri ne zaman ve nasıl yapılır?",
              a: "Bayi panelinizde onaylanan tüm satış hakedişleri ve yıllık yenileme komisyonları her ayın 1'i ile 5'i arasında doğrudan belirttiğiniz banka IBAN hesabınıza nakit olarak transfer edilir.",
            },
            {
              q: "E-İmza sözleşmeler hukuken geçerli midir?",
              a: "Evet. 5070 Sayılı Elektronik İmza Kanunu ve Borçlar Kanunu standartlarına uygun olarak IP, zaman damgası ve ekran dokunmatik biyometrik koordinatlarıyla arşivlenmektedir.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-white transition hover:bg-white/[0.04] cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-cyan-300 transition-transform duration-300 ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="border-t border-white/5 p-5 pt-0 text-xs text-slate-300 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── ALT ÇAĞRI (CTA) ────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#0f766e] p-8 text-center sm:p-14 shadow-2xl shadow-[#00a8c4]/25">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />

          <h2 className="text-[30px] font-black text-white sm:text-[42px] leading-tight">
            {activeTab === "musteri"
              ? "İşletmenizi Hatay360 Paneli ile Zirveye Taşıyın"
              : "Hatay360 Yetkili Bayisi Olarak Düzenli Gelir Elde Edin"}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[16px] text-cyan-100 sm:text-[18px]">
            {activeTab === "musteri"
              ? "Alan adı, hosting, Google Haritalar, kurumsal web ve reklam yönetimi tek bir modern 3D panelde."
              : "Bölgenizdeki esnafa hazır çözümler sunun, yüksek komisyon ve yıllık yenileme kazancı elde edin."}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            {activeTab === "musteri" ? (
              <>
                <button
                  onClick={handleCustomerDemoLogin}
                  className="rounded-2xl bg-white px-8 py-4 text-sm font-black text-[#0891b2] shadow-2xl hover:bg-cyan-50 transition hover:scale-105 cursor-pointer"
                >
                  ⚡ Demo Müşteri Paneline Git
                </button>
                <Link
                  to="/musteri/giris"
                  className="rounded-2xl border border-white/40 bg-black/20 px-8 py-4 text-sm font-bold text-white backdrop-blur-md hover:bg-black/30 transition"
                >
                  Gerçek Giriş Yap
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handlePartnerDemoLogin}
                  className="rounded-2xl bg-white px-8 py-4 text-sm font-black text-[#0891b2] shadow-2xl hover:bg-cyan-50 transition hover:scale-105 cursor-pointer"
                >
                  ⚡ Demo Bayi Paneline Git
                </button>
                <Link
                  to="/firma/kayit"
                  className="rounded-2xl border border-white/40 bg-black/20 px-8 py-4 text-sm font-bold text-white backdrop-blur-md hover:bg-black/30 transition"
                >
                  Bayilik Başvurusu Yap
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
