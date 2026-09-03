import { useState, useMemo, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router";
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
} from "lucide-react";
import { SiteLogo } from "../components/site-logo";

export function PanelsOverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "bayi" ? "bayi" : "musteri";
  const [activeTab, setActiveTab] = useState<"musteri" | "bayi">(initialTab);

  // 3D İnteraktif Simülatör State'leri
  const [activeModulePreview, setActiveModulePreview] = useState<number>(0);
  const [clientCountSlider, setClientCountSlider] = useState<number>(8);
  const [budgetSlider, setBudgetSlider] = useState<number>(15000);

  const handleTabChange = (tab: "musteri" | "bayi") => {
    setActiveTab(tab);
    setSearchParams({ tab });
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
        .perspective-1200 {
          perspective: 1200px;
        }
        .perspective-1600 {
          perspective: 1600px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .tilt-card-3d {
          transform: rotateX(8deg) rotateY(-10deg) rotateZ(1.5deg);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease;
        }
        .tilt-card-3d:hover {
          transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(-8px);
        }
        .floating-badge-3d {
          transform: translateZ(45px);
        }
        .floating-badge-3d-deep {
          transform: translateZ(65px);
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) translateZ(40px); }
          50% { transform: translateY(-10px) translateZ(40px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-float-3d {
          animation: floatSlow 6s ease-in-out infinite;
        }
        .animate-float-3d-delayed {
          animation: floatSlow 7s ease-in-out 2.5s infinite;
        }
      `}</style>

      {/* ─── ARKA PLAN DOKUSU ───────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[700px] w-[1300px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#00a8c4]/25 via-[#0891b2]/12 to-transparent blur-[150px]" />
        <div className="absolute top-1/3 -left-48 h-[600px] w-[600px] rounded-full bg-[#00a8c4]/15 blur-[140px]" />
        <div className="absolute bottom-20 -right-48 h-[700px] w-[700px] rounded-full bg-[#0891b2]/18 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* ─── HERO & 3D SWITCHER ─────────────────────────────── */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#00a8c4]/40 bg-[#00a8c4]/10 px-5 py-2 text-[12px] font-bold tracking-wider text-[#38bdf8] backdrop-blur-2xl shadow-[0_0_35px_rgba(0,168,196,0.35)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38bdf8] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00a8c4]" />
            </span>
            <span className="uppercase tracking-[0.18em]">3D Yeni Nesil Kontrol & Büyüme Ekosistemi</span>
          </div>

          <h1 className="mt-6 text-[36px] font-black tracking-tight text-white sm:text-[54px] lg:text-[66px] leading-[1.1]">
            İşletmeniz ve Ajansınız İçin{" "}
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#00a8c4] to-[#2dd4bf] bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,168,196,0.3)]">
              3D Akıllı Panel
            </span>{" "}
            Teknolojisi
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-[16px] font-medium leading-relaxed text-slate-300 sm:text-[19px]">
            Hatay'daki yerel işletmelere şeffaf reklam, harita ve e-imza denetimi sağlayan <strong>Müşteri Yönetim Portalı</strong>; dijital ajanslara yüksek komisyon ve white-label güç sunan <strong>Bayi & Partner Hub</strong>.
          </p>

          {/* 3D Segmented Switcher */}
          <div className="mx-auto mt-10 flex max-w-md rounded-2xl border border-white/20 bg-white/[0.06] p-1.5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
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

          {/* Aksiyon Butonları */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {activeTab === "musteri" ? (
              <>
                <Link
                  to="/musteri/giris"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#2dd4bf] px-7 py-4 text-[14.5px] font-extrabold text-white shadow-[0_15px_35px_rgba(0,168,196,0.4)] transition hover:scale-105"
                >
                  <Store className="h-4 w-4" />
                  <span>Müşteri Paneline Giriş Yap</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/musteri/kayit"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/[0.08] px-7 py-4 text-[14.5px] font-bold text-white backdrop-blur-2xl transition hover:bg-white/15"
                >
                  <span>Ücretsiz İşletme Hesabı Aç</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/firma/giris"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#2dd4bf] px-7 py-4 text-[14.5px] font-extrabold text-white shadow-[0_15px_35px_rgba(0,168,196,0.4)] transition hover:scale-105"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Bayi Portalına Giriş Yap</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/firma/kayit"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/[0.08] px-7 py-4 text-[14.5px] font-bold text-white backdrop-blur-2xl transition hover:bg-white/15"
                >
                  <span>Bayilik Başvurusu Yap (%30 Komisyon)</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── 3D PERSPEKTİF ISOMETRIC SAHNE (3D DEVICE SHOWCASE) ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 perspective-1600">
        <div className="relative preserve-3d">
          {/* 3D Floating Badges (Arka Plana / Yanlara Yansıtılan Katmanlar) */}
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
                <span className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1 text-xs font-bold text-white border border-white/15">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  <span>3D Ultra Live v4.8</span>
                </span>
              </div>
            </div>

            {/* İçerik Düzeni */}
            <div className="mt-7 grid gap-6 lg:grid-cols-12">
              {/* Sol Sidebar Mockup */}
              <div className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4 lg:col-span-3">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#0891b2] to-[#00a8c4] flex items-center justify-center text-white font-black text-xs">
                    H360
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Hatay360 {activeTab === "musteri" ? "Müşteri" : "Bayi"}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold">● Aktif Oturum</p>
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
              <div className="space-y-6 lg:col-span-9">
                {/* 3'lü Bento Metrik Kartları */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {activeTab === "musteri" ? (
                    <>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Harita & Web Ziyareti</span>
                          <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">+%240</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-white">4.820 Kişi</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Google Haritalar ve Aramalardan</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Telefon & Randevu</span>
                          <Smartphone className="h-4 w-4 text-[#38bdf8]" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-white">194 Talep</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Doğrudan arama ve WhatsApp formu</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5 text-left">
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
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Toplam Hakediş Kazancı</span>
                          <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">Onaylandı</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-white">₺58.400</p>
                        <p className="mt-0.5 text-[11px] text-emerald-300 font-semibold">Bu ayki net bayi komisyonu</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Kayıtlı İşletmeler</span>
                          <Building2 className="h-4 w-4 text-[#38bdf8]" />
                        </div>
                        <p className="mt-2 text-2xl font-black text-white">38 İşletme</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">İskenderun & Antakya Bölgesi</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5 text-left">
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
                <div className="rounded-2xl border border-[#00a8c4]/30 bg-gradient-to-r from-[#00a8c4]/15 to-[#0891b2]/10 p-5 text-left">
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
                <div className="grid gap-4 sm:grid-cols-2 text-left">
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

              <div className="lg:col-span-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
                  <span className="text-xs font-bold text-slate-400">Tahmini Ziyaretçi & Yol Tarifi</span>
                  <p className="mt-2 text-3xl font-black text-white">~{estimatedCustomerGrowth.trafficMultiplier.toLocaleString("tr-TR")}</p>
                  <p className="mt-1 text-[11px] text-cyan-300">Harita pini ve arama tıklaması</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
                  <span className="text-xs font-bold text-slate-400">Tahmini Yeni Müşteri Çağrısı</span>
                  <p className="mt-2 text-3xl font-black text-emerald-400">~{estimatedCustomerGrowth.estimatedCalls} Adet</p>
                  <p className="mt-1 text-[11px] text-emerald-300">Doğrudan telefon & WhatsApp formu</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Tahmini Yatırım Getirisi (ROAS)</span>
                      <p className="text-2xl font-black text-amber-400">{estimatedCustomerGrowth.estimatedRoas}x Kat Ciro Artışı</p>
                    </div>
                    <Link
                      to="/iletisim"
                      className="rounded-xl bg-[#00a8c4] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#0891b2] transition"
                    >
                      Planı Başlat
                    </Link>
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

              <div className="lg:col-span-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
                  <span className="text-xs font-bold text-slate-400">Aylık Net Komisyon Hakedişiniz</span>
                  <p className="mt-2 text-3xl font-black text-emerald-400">₺{estimatedPartnerEarning.toLocaleString("tr-TR")}</p>
                  <p className="mt-1 text-[11px] text-emerald-300 font-semibold">%30 Kurulum + Yıllık Yenileme Payı</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
                  <span className="text-xs font-bold text-slate-400">Yıllık Kümülatif Kazanç</span>
                  <p className="mt-2 text-3xl font-black text-white">₺{(estimatedPartnerEarning * 12).toLocaleString("tr-TR")}</p>
                  <p className="mt-1 text-[11px] text-slate-400">Sürekli büyüyen müşteri portföyüyle</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Yetkili Bölge Temsilciliği</span>
                      <p className="text-sm font-bold text-white">Hemen başvurun, ilçenizde bayiliği kilitleyin.</p>
                    </div>
                    <Link
                      to="/firma/kayit"
                      className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-black hover:bg-emerald-400 transition"
                    >
                      Bayilik Başvurusu Yap
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── 8 MODÜL BENTO GRID (HER İKİ PANEL İÇİN ZENGİN DETAY) ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#00a8c4]">
            {activeTab === "musteri" ? "MÜŞTERİ PANELİ DERİNLEMESİNE MODÜLLERİ" : "BAYİ PANELİ DERİNLEMESİNE MODÜLLERİ"}
          </p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            {activeTab === "musteri"
              ? "İşletmenizi Kontrol Altına Alan 8 Güçlü Merkez"
              : "Ajansınızı Otomatikleştiren 8 Bayilik Modülü"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
            {activeTab === "musteri"
              ? "Her modül, Hatay'daki esnaf ve şirketlerin dijital büyümesini şeffaf, hızlı ve güvenli kılmak için özel olarak kodlandı."
              : "White-label mimari, otomatik altyapı provisioning ve düzenli hakediş sistemiyle ajans operasyonunuzu sıfır zahmetle yönetin."}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {(activeTab === "musteri"
            ? [
                {
                  icon: Globe,
                  title: "1. Web & Domain Monitörü",
                  desc: "Alan adı yenileme tarihiniz, 256-Bit SSL güvenlik sertifikanız ve bulut hosting çalışma süreniz 7/24 otomatik izlenir.",
                  tag: "Bulut & SSL",
                },
                {
                  icon: MapPin,
                  title: "2. Google Haritalar & SEO",
                  desc: "Yol tarifi istekleri, doğrudan arama buton tıklamaları ve müşteri fotoğrafları Google Maps ile tam senkronize edilir.",
                  tag: "Yerel SEO",
                },
                {
                  icon: TrendingUp,
                  title: "3. Şeffaf Reklam Raporu",
                  desc: "Google Ads ve Meta reklam bütçenizin nereye harcandığı, tıklama maliyeti ve kaç form geldiği kuruşu kuruşuna listelenir.",
                  tag: "Google & Meta",
                },
                {
                  icon: FileCheck,
                  title: "4. Dijital E-İmza Sözleşme",
                  desc: "Islak imza beklemeye son. Sözleşmelerinizi cep telefonunuzdan ekrana imza atarak onaylayabilir ve PDF olarak indirebilirsiniz.",
                  tag: "E-İmza Arşivi",
                },
                {
                  icon: CreditCard,
                  title: "5. Online Ödeme & E-Fatura",
                  desc: "Kredi kartı ile taksitli veya tek çekim güvenli ödeme, bakiye takibi ve mali onaylı resmi e-fatura arşivi.",
                  tag: "Taksit & Havale",
                },
                {
                  icon: Search,
                  title: "6. SEO Sıralama Takip Radarı",
                  desc: "Hatay'da sektörünüze ait anahtar kelimelerinizin (örn: 'Antakya künefe') Google'daki 1. sayfa sıralama geçmişi raporlanır.",
                  tag: "Sıralama Radarı",
                },
                {
                  icon: MessageSquare,
                  title: "7. Sıra Numaralı Destek & Bilet",
                  desc: "Panelden tek tıkla destek bileti açabilir, kuyruk sıranızı canlı izleyebilir ve doğrudan WhatsApp hızlı hattımıza bağlanabilirsiniz.",
                  tag: "15 Dk Yanıt",
                },
                {
                  icon: ShieldCheck,
                  title: "8. 2FA Biyometrik & SMS Güvenliği",
                  desc: "Hesabınıza yapılan tüm girişler SMS ve e-posta onayıyla denetlenir. Muhasebe ve yöneticiniz için ayrı alt kullanıcı rolleri açabilirsiniz.",
                  tag: "2FA Koruması",
                },
              ]
            : [
                {
                  icon: Wallet,
                  title: "1. Düzenli Hakediş & Komisyon",
                  desc: "Her yeni satıştan %30 peşin, her yıllık domain/hosting/reklam yenilemesinden %20 sürekli nakit komisyon kazanın.",
                  tag: "Nakit Hakediş",
                },
                {
                  icon: Building2,
                  title: "2. Tam White-Label Mimari",
                  desc: "Müşterilerinize kendi ajansınızın logosu, favicon'u ve şirket unvanıyla kurumsal bir panel sunun.",
                  tag: "Kendi Markanızla",
                },
                {
                  icon: Zap,
                  title: "3. 5 Dakikada Hızlı Kurulum",
                  desc: "Müşteriniz için alan adı, hosting, demo tasarım ve Google Harita başvurusunu panelden tek tıkla otomatik başlatın.",
                  tag: "Otomatik Provisioning",
                },
                {
                  icon: Users,
                  title: "4. Aday Müşteri Pipeline (CRM)",
                  desc: "Sahada görüştüğünüz esnafları; Arandı, Teklif Verildi, E-İmzalandı ve Yayında aşamalarıyla Kanban panosunda yönetin.",
                  tag: "Mini CRM Panosu",
                },
                {
                  icon: FileText,
                  title: "5. Hazır Satış Kitleri & Sunumlar",
                  desc: "Esnafa gösterebileceğiniz sektörel broşürler, PDF teklif şablonları, demo siteler ve hazır sözleşme metinleri elinizin altında.",
                  tag: "Satış Materyalleri",
                },
                {
                  icon: Award,
                  title: "6. İlçe Yetkili Temsilciliği",
                  desc: "Kendi ilçenizde (Antakya, İskenderun, Samandağ, Dörtyol vb.) resmi Hatay360 bayisi olma ve bölgeyi kapatma imkanı.",
                  tag: "Bölge Tekeli",
                },
                {
                  icon: MessageSquare,
                  title: "7. VIP Mühendis Destek Kanalı",
                  desc: "Teknik sorunlarda beklemeden doğrudan kıdemli yazılım ve reklam mühendislerimize bağlanabileceğiniz özel hat.",
                  tag: "Öncelikli VIP",
                },
                {
                  icon: Clock,
                  title: "8. Yıllık Yenileme Pasif Geliri",
                  desc: "Bağladığınız esnaf sistemde kaldığı sürece her yıl yenileme bedellerinden düzenli pasif gelir elde etmeye devam edersiniz.",
                  tag: "Pasif Gelir Modeli",
                },
              ]
          ).map((item, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-[#00a8c4]/50 hover:bg-white/[0.09] hover:shadow-[0_20px_45px_rgba(0,168,196,0.15)]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00a8c4]/15 text-[#38bdf8] border border-[#00a8c4]/25 group-hover:scale-110 transition">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                    {item.tag}
                  </span>
                </div>

                <h3 className="mt-5 text-[16px] font-bold text-white group-hover:text-cyan-200 transition">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#00a8c4] group-hover:text-[#38bdf8]">
                <span>Detayları İncele</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3 ADIMDA ÇALIŞMA SÜRECİ (3D STEP JOURNEY) ───────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="rounded-[32px] border border-white/15 bg-white/[0.02] p-8 sm:p-12 backdrop-blur-2xl">
          <div className="text-center">
            <h3 className="text-2xl font-black text-white sm:text-3xl">
              3 Adımda Sisteme Dahil Olun
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Dakikalar içinde hesabınızı açın ve dijital kontrolünüzü elinize alın.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3 text-left">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a8c4]/20 text-[#38bdf8] font-black text-base mb-4">
                01
              </span>
              <h4 className="text-base font-bold text-white">Hesap Oluşturun & Giriş Yapın</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {activeTab === "musteri"
                  ? "İşletme adı, telefon ve yetkili bilgilerinizle saniyeler içinde panelinize giriş yapın."
                  : "Bayilik formunu doldurun, bölge yetkilinizle anında iletişime geçip yetki panelinizi açın."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a8c4]/20 text-[#38bdf8] font-black text-base mb-4">
                02
              </span>
              <h4 className="text-base font-bold text-white">Canlı Kurulum & Harita Bağlantısı</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {activeTab === "musteri"
                  ? "Web siteniz, Google Maps pini ve reklam kampanyalarınız uzman ekibimizce panele bağlanır."
                  : "Müşterilerinizi ekleyin, white-label panelinizden tek tıkla kurulumları tamamlayın."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a8c4]/20 text-[#38bdf8] font-black text-base mb-4">
                03
              </span>
              <h4 className="text-base font-bold text-white">Şeffaf Takip & Düzenli Kazanç</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {activeTab === "musteri"
                  ? "Tüm aramaları, formları ve ciro artışını 3D canlı panellerden 7/24 izleyin."
                  : "Her satış ve yenilemeden komisyonunuzu doğrudan banka hesabınıza aktarın."}
              </p>
            </div>
          </div>
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
                <Link
                  to="/musteri/giris"
                  className="rounded-2xl bg-white px-8 py-4 text-sm font-black text-[#0891b2] shadow-2xl hover:bg-cyan-50 transition hover:scale-105"
                >
                  Müşteri Girişi Yap
                </Link>
                <Link
                  to="/iletisim"
                  className="rounded-2xl border border-white/40 bg-black/20 px-8 py-4 text-sm font-bold text-white backdrop-blur-md hover:bg-black/30 transition"
                >
                  Bizi Arayın / Keşif İste
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/firma/kayit"
                  className="rounded-2xl bg-white px-8 py-4 text-sm font-black text-[#0891b2] shadow-2xl hover:bg-cyan-50 transition hover:scale-105"
                >
                  Hemen Bayilik Başvurusu Yap
                </Link>
                <Link
                  to="/firma/giris"
                  className="rounded-2xl border border-white/40 bg-black/20 px-8 py-4 text-sm font-bold text-white backdrop-blur-md hover:bg-black/30 transition"
                >
                  Bayi Girişi Yap
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
