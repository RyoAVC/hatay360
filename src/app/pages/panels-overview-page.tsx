import { useState, useMemo } from "react";
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
  ExternalLink,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Radio,
  FileCode2,
  CheckSquare,
  AlertTriangle,
  Receipt,
  Download,
  Copy,
  PenTool,
  Send,
  HelpCircle as QuestionIcon,
} from "lucide-react";
import { apiRequest } from "../lib/api";

export function PanelsOverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "bayi" ? "bayi" : "musteri";
  const [activeTab, setActiveTab] = useState<"musteri" | "bayi">(initialTab);

  // Müşteri Paneli İncelenen Sekme
  const [customerActiveTab, setCustomerActiveTab] = useState<
    "overview" | "website" | "campaigns" | "contracts" | "payments" | "approvals" | "seo" | "support" | "security"
  >("overview");

  // Bayi Paneli İncelenen Sekme
  const [partnerActiveTab, setPartnerActiveTab] = useState<
    "dashboard" | "pipeline" | "setup" | "certificate" | "whitelabel" | "kits"
  >("dashboard");

  // Demo Giriş Yükleniyor Durumları
  const [isCustomerDemoLoading, setIsCustomerDemoLoading] = useState(false);
  const [isPartnerDemoLoading, setIsPartnerDemoLoading] = useState(false);

  // 3D Hesaplayıcı Slider State'leri
  const [clientCountSlider, setClientCountSlider] = useState<number>(8);
  const [budgetSlider, setBudgetSlider] = useState<number>(15000);

  // E-İmza Simülasyon State'i
  const [signedSimulated, setSignedSimulated] = useState<boolean>(false);
  const [copiedNap, setCopiedNap] = useState<boolean>(false);

  // SSS Accordion State'i
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleTabChange = (tab: "musteri" | "bayi") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Demo Müşteri Girişi
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

  // Demo Bayi Girişi
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

  // Bayi Kazanç Hesaplama Mantığı
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

  const copyNapText = () => {
    navigator.clipboard?.writeText(
      "Tarihi Antakya Künefecisi & Medeniyetler Sofrası\nTelefon: 0326 214 36 00\nAdres: Tarihi Uzun Çarşı İçi No:44 Antakya / Hatay\nÇalışma Saatleri: 09:00 - 23:30"
    );
    setCopiedNap(true);
    setTimeout(() => setCopiedNap(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#061017] text-white selection:bg-[#00a8c4] selection:text-white pb-16">
      {/* ─── 3D PERSPEKTİF & GLOW STİLLERİ ──────────────────── */}
      <style>{`
        .perspective-1200 { perspective: 1200px; }
        .perspective-1600 { perspective: 1600px; }
        .preserve-3d { transform-style: preserve-3d; }
        .tilt-card-3d {
          transform: rotateX(6deg) rotateY(-7deg) rotateZ(1deg);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease;
        }
        .tilt-card-3d:hover {
          transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(-6px);
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) translateZ(40px); }
          50% { transform: translateY(-10px) translateZ(40px); }
        }
        .animate-float-3d { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-3d-delayed { animation: floatSlow 7s ease-in-out 2.5s infinite; }
      `}</style>

      {/* ─── ARKA PLAN IŞIKLARI & IZGARA ───────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[750px] w-[1400px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#00a8c4]/25 via-[#0891b2]/12 to-transparent blur-[150px]" />
        <div className="absolute top-1/3 -left-48 h-[650px] w-[650px] rounded-full bg-[#00a8c4]/15 blur-[140px]" />
        <div className="absolute bottom-20 -right-48 h-[750px] w-[750px] rounded-full bg-[#0891b2]/18 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* ─── HERO & 3D SWITCHER ─────────────────────────────── */}
      <section className="relative pt-12 pb-12 sm:pt-20 sm:pb-16 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#00a8c4]/40 bg-[#00a8c4]/10 px-5 py-2 text-[12px] font-bold tracking-wider text-[#38bdf8] backdrop-blur-2xl shadow-[0_0_35px_rgba(0,168,196,0.35)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38bdf8] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00a8c4]" />
            </span>
            <span className="uppercase tracking-[0.18em]">Hatay360 Canlı Panel Denetim & İnceleme Merkezi</span>
          </div>

          <h1 className="mt-6 text-[34px] font-black tracking-tight text-white sm:text-[52px] lg:text-[64px] leading-[1.08]">
            İşletmeniz ve Ajansınız İçin{" "}
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#00a8c4] to-[#2dd4bf] bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,168,196,0.3)]">
              Kusursuz Dijital Kontrol
            </span>{" "}
            Merkezleri
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-[16px] font-medium leading-relaxed text-slate-300 sm:text-[18px]">
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

          {/* ⚡ 2 BÜYÜK CANLI DEMO GİRİŞ KARTI (TEK TIKLA ÇALIŞAN GERÇEK PORTAL) ─── */}
          <div className="mt-10 grid gap-5 max-w-4xl mx-auto sm:grid-cols-2 text-left">
            {/* Demo Müşteri Giriş Kartı */}
            <div className="relative overflow-hidden rounded-3xl border border-[#00a8c4]/40 bg-gradient-to-b from-[#0e2936] to-[#081720] p-6 shadow-2xl backdrop-blur-xl hover:border-[#00a8c4] transition duration-300">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-[#00a8c4]/20 px-3 py-1 text-xs font-extrabold text-cyan-300 border border-[#00a8c4]/30">
                  🏬 Örnek Müşteri Portalı
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="mt-4 text-lg font-black text-white">Tarihi Antakya Künefecisi</h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Mehmet Usta adına hazırlanmış canlı reklam bütçeleri, Google Maps pini, onaylı e-imzalı sözleşmeler ve SEO sıralama panelini hemen test edin.
              </p>
              <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  onClick={handleCustomerDemoLogin}
                  disabled={isCustomerDemoLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0891b2] to-[#00a8c4] px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[#00a8c4]/30 hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                  <span>{isCustomerDemoLoading ? "Giriş Yapılıyor..." : "Demo Müşteri Olarak Gir"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <Link to="/musteri/giris" className="text-xs font-bold text-slate-400 hover:text-white">
                  Gerçek Giriş &rarr;
                </Link>
              </div>
            </div>

            {/* Demo Bayi Giriş Kartı */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#0d2a23] to-[#071914] p-6 shadow-2xl backdrop-blur-xl hover:border-emerald-400 transition duration-300">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-300 border border-emerald-500/30">
                  💼 Yetkili Bayi & Partner Hub
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="mt-4 text-lg font-black text-white">İskenderun Medya & Ajans</h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Kaan Yıldız adına tanımlı 38 aktif esnaf, ₺58.400 onaylanmış hakediş kazancı, CRM müşteri pipeline panosu ve white-label ajans arayüzünü inceleyin.
              </p>
              <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  onClick={handlePartnerDemoLogin}
                  disabled={isPartnerDemoLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                  <span>{isPartnerDemoLoading ? "Giriş Yapılıyor..." : "Demo Bayi Olarak Gir"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <Link to="/firma/giris" className="text-xs font-bold text-slate-400 hover:text-white">
                  Gerçek Bayi Girişi &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GERÇEK PANEL MODÜLLERİNİ BİREBİR İNCELEME MERKEZİ ─ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-[36px] border border-white/15 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-[#091b24] p-6 sm:p-10 backdrop-blur-3xl shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
          {/* Üst Başlık & Modül Seçici */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-400" />
                <h2 className="text-xl font-black text-white sm:text-2xl">
                  {activeTab === "musteri"
                    ? "🏬 Müşteri Paneli Gerçek Ekranları ve Modülleri"
                    : "💼 Bayi & Partner Paneli Gerçek Ekranları ve Modülleri"}
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {activeTab === "musteri"
                  ? "Sistemdeki 9 ana modülün işleyişini, canlı verilerini ve fonksiyonlarını buradan tek tek inceleyin."
                  : "Bayilerimize sağlanan satış, müşteri ekleme, hakediş ve white-label araçlarını adım adım keşfedin."}
              </p>
            </div>

            <button
              onClick={activeTab === "musteri" ? handleCustomerDemoLogin : handlePartnerDemoLogin}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-black text-white transition cursor-pointer self-start md:self-auto"
            >
              <span>Gerçek Panele Geç</span>
              <ExternalLink className="h-3.5 w-3.5 text-cyan-300" />
            </button>
          </div>

          {/* ─── İKİ PANELİN MODÜL SEÇİCİ MENÜSÜ ─────────────── */}
          {activeTab === "musteri" ? (
            <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-5">
              {[
                { id: "overview", label: "1. Genel Bakış & Proje", icon: BarChart3 },
                { id: "website", label: "2. Web & Google Harita", icon: MapPin },
                { id: "campaigns", label: "3. Reklam & Kampanya", icon: TrendingUp },
                { id: "contracts", label: "4. E-İmza & Sözleşme", icon: FileCheck },
                { id: "payments", label: "5. Ödeme & E-Fatura", icon: CreditCard },
                { id: "approvals", label: "6. Tasarım Onayları", icon: CheckSquare },
                { id: "seo", label: "7. SEO Kelime Radarı", icon: Search },
                { id: "support", label: "8. Destek & Sıra No", icon: MessageSquare },
                { id: "security", label: "9. Güvenlik & 2FA", icon: ShieldCheck },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCustomerActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition duration-200 cursor-pointer ${
                    customerActiveTab === tab.id
                      ? "bg-[#00a8c4] text-white shadow-lg shadow-[#00a8c4]/35 scale-105"
                      : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-5">
              {[
                { id: "dashboard", label: "1. Bayi Hakediş Dashboard", icon: Wallet },
                { id: "pipeline", label: "2. Aday Müşteri CRM (Kanban)", icon: Users },
                { id: "setup", label: "3. 5 Dk Hızlı Müşteri Kurulumu", icon: Zap },
                { id: "certificate", label: "4. Resmi Yetki Sertifikası", icon: Award },
                { id: "whitelabel", label: "5. Tam White-Label Markalama", icon: Building2 },
                { id: "kits", label: "6. Hazır Satış Kitleri & Fiyat", icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPartnerActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition duration-200 cursor-pointer ${
                    partnerActiveTab === tab.id
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/35 scale-105"
                      : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* ─── MODÜL DETAY SAHNESİ (MÜŞTERİ PANELİ) ─────────── */}
          {activeTab === "musteri" && (
            <div className="mt-8 text-left">
              {customerActiveTab === "overview" && (
                <div className="space-y-6">
                  {/* Proje Aşamaları Çubuğu */}
                  <div className="rounded-2xl border border-[#00a8c4]/30 bg-[#00a8c4]/10 p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
                        Canlı Proje Durumu: 7. Aşama (Yayında & Aktif)
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400">● Tamamlandı</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold">
                      {["Başlangıç", "Tasarım", "Onay", "Geliştirme", "Test", "Yayınlama", "Yayında"].map((stg, i) => (
                        <div key={i} className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 py-1.5 text-emerald-300">
                          ✓ {stg}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4 Ana Özet Kartı */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4.5">
                      <span className="text-xs text-slate-400">Web Sitesi Durumu</span>
                      <p className="mt-2 text-xl font-black text-white">Yayında & SSL Aktif</p>
                      <p className="text-[11px] text-emerald-400 mt-1">256-Bit Güvenlik Korumalı</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4.5">
                      <span className="text-xs text-slate-400">Google Haritalar</span>
                      <p className="mt-2 text-xl font-black text-white">4.9 ★ (1.420 Yorum)</p>
                      <p className="text-[11px] text-cyan-300 mt-1">Antakya Çarşı Lokasyonu</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4.5">
                      <span className="text-xs text-slate-400">Bu Ayki Reklam Harcaması</span>
                      <p className="mt-2 text-xl font-black text-white">₺14.200 / ₺15.000</p>
                      <p className="text-[11px] text-amber-300 mt-1">4.8x Ciro Getirisi (ROAS)</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4.5">
                      <span className="text-xs text-slate-400">Bekleyen Onay / Sözleşme</span>
                      <p className="mt-2 text-xl font-black text-emerald-400">0 Bekleyen İşlem</p>
                      <p className="text-[11px] text-slate-400 mt-1">Tüm sözleşmeler e-imzalı</p>
                    </div>
                  </div>
                </div>
              )}

              {customerActiveTab === "website" && (
                <div className="grid gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">Web Sitesi ve İletişim Bilgileri Düzenleme</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      İşletme telefonunuzu, logonuzu, adresinizi ve çalışma saatlerinizi panelden tek tıkla değiştirebilirsiniz. Değişiklikler anında sitenize ve harita profilinize yansır.
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400">İşletme Telefonu:</span>
                        <p className="font-bold text-white">0326 214 36 00 (Doğrudan Aranabilir)</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Fiziki Adres:</span>
                        <p className="font-bold text-white">Tarihi Uzun Çarşı No:44 Antakya / Hatay</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Çalışma Saatleri:</span>
                        <p className="font-bold text-white">Haftanın 7 Günü 09:00 - 23:30</p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">Google Haritalar & NAP Tutarlılık Kartı</h3>
                    <p className="text-xs text-slate-300">
                      SEO'da 1. sıraya çıkmak için gereken Name, Address, Phone (NAP) bilgilerini tek tıkla kopyalayın.
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-cyan-200">
                      Tarihi Antakya Künefecisi & Medeniyetler Sofrası<br />
                      Telefon: 0326 214 36 00<br />
                      Adres: Tarihi Uzun Çarşı No:44 Antakya / Hatay<br />
                      Saat: 09:00 - 23:30
                    </div>
                    <button
                      onClick={copyNapText}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2 text-xs font-bold text-white cursor-pointer hover:bg-[#0891b2]"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedNap ? "✓ Kopyalandı!" : "NAP Bilgilerini Kopyala"}</span>
                    </button>
                  </div>
                </div>
              )}

              {customerActiveTab === "campaigns" && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Canlı Reklam Kampanyaları ve Şeffaf Raporlama</h3>
                    <span className="text-xs text-cyan-300 font-bold">Google Ads API Senkronize</span>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
                    <table className="w-full text-xs text-left">
                      <thead className="border-b border-white/10 text-slate-400 font-bold">
                        <tr>
                          <th className="p-3.5">Kampanya Adı</th>
                          <th className="p-3.5">Platform</th>
                          <th className="p-3.5">Aylık Bütçe</th>
                          <th className="p-3.5">Harcama</th>
                          <th className="p-3.5">Tıklama</th>
                          <th className="p-3.5">Form / Arama</th>
                          <th className="p-3.5">ROAS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        <tr>
                          <td className="p-3.5 font-bold text-white">Antakya Künefe & Tatlı Arama</td>
                          <td className="p-3.5 text-cyan-300">Google Ads</td>
                          <td className="p-3.5">₺15.000</td>
                          <td className="p-3.5 font-bold text-white">₺14.200</td>
                          <td className="p-3.5">4.820</td>
                          <td className="p-3.5 font-bold text-emerald-400">194 Talep</td>
                          <td className="p-3.5 font-bold text-amber-400">4.8x</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-bold text-white">Hatay Gastronomi Instagram Tanıtımı</td>
                          <td className="p-3.5 text-pink-300">Meta Ads</td>
                          <td className="p-3.5">₺8.000</td>
                          <td className="p-3.5 font-bold text-white">₺7.450</td>
                          <td className="p-3.5">8.920</td>
                          <td className="p-3.5 font-bold text-emerald-400">142 Talep</td>
                          <td className="p-3.5 font-bold text-amber-400">3.9x</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {customerActiveTab === "contracts" && (
                <div className="grid gap-6 lg:grid-cols-12 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">Dijital E-İmza ve Arşivlenmiş Sözleşmeler</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Sözleşmelerinizi cep telefonunuzdan ekrana parmağınızla imza atarak saniyeler içinde onaylayabilirsiniz. İmzalanan her sözleşme 5070 Sayılı Kanuna uygun olarak IP ve zaman damgasıyla PDF formatında saklanır.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setSignedSimulated(!signedSimulated)}
                        className="rounded-xl bg-gradient-to-r from-emerald-500 to-[#00a8c4] px-5 py-2.5 text-xs font-black text-white shadow-lg cursor-pointer"
                      >
                        {signedSimulated ? "✓ E-İmza Onaylandı" : "E-İmza At (Canlı Simülatör)"}
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-xs font-bold text-white">Hatay360 Kurumsal Hizmet Sözleşmesi v2.4</span>
                      <span className={`text-xs font-bold ${signedSimulated ? "text-emerald-400" : "text-amber-400"}`}>
                        {signedSimulated ? "✓ E-İmzalı (Resmi)" : "İmza Bekleniyor"}
                      </span>
                    </div>
                    <div className="h-28 rounded-xl border border-dashed border-white/20 bg-white/[0.02] flex items-center justify-center">
                      {signedSimulated ? (
                        <div className="text-center">
                          <p className="font-serif text-2xl italic text-emerald-400">Mehmet Usta</p>
                          <p className="text-[10px] text-slate-400 mt-1">Zaman Damgası: {new Date().toLocaleDateString("tr-TR")}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">İmzanızı sol taraftaki butona basarak deneyin</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {customerActiveTab === "payments" && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Online 3D Secure Ödeme & E-Fatura Arşivi</h3>
                    <span className="text-xs font-bold text-emerald-400">Güvenli 256-Bit SSL</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2 text-xs">
                      <p className="font-bold text-white">Kredi Kartı / Havale Seçenekleri</p>
                      <p className="text-slate-300">Tüm banka kredi kartlarına 12 aya varan taksit veya doğrudan resmi şirket IBAN hesabımıza EFT imkanı.</p>
                      <p className="text-cyan-300 font-mono">IBAN: TR12 0006 4000 0011 2233 4455 66</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2 text-xs">
                      <p className="font-bold text-white">Son Resmi E-Faturalar</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-slate-300">
                          <span>FAT-2026-084 (Web + Harita Paketi)</span>
                          <span className="font-bold text-white">₺12.500 [PDF]</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>FAT-2026-099 (Aylık Reklam Yönetimi)</span>
                          <span className="font-bold text-white">₺2.500 [PDF]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {customerActiveTab === "approvals" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Tasarım Taslakları & Revizyon Onay Sistemi</h3>
                  <p className="text-xs text-slate-300">
                    Sitenizin ana sayfa tasarımı, logo yerleşimi veya reklam görselleri tamamlandığında onayınıza sunulur. Tek tıkla onaylayabilir veya not yazarak revizyon isteyebilirsiniz.
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Yeni Mobil Tasarım ve Menü Revizyonu</p>
                      <p className="text-slate-400 text-[11px]">Tasarım ekibimiz tarafından yüklendi (v3.1)</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="rounded-lg bg-emerald-500/20 text-emerald-400 px-3 py-1.5 font-bold">✓ Onaylandı</span>
                    </div>
                  </div>
                </div>
              )}

              {customerActiveTab === "seo" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Yerel SEO Sıralama Takip Radarı</h3>
                  <p className="text-xs text-slate-300">
                    Hatay ve ilçelerindeki Google arama sıralamalarınız her gece otomatik taranarak raporlanır.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3 text-xs">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <span className="text-slate-400">"Antakya en iyi künefeci"</span>
                      <p className="text-xl font-black text-emerald-400 mt-1">1. Sıra (#1)</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <span className="text-slate-400">"Hatay künefe siparişi"</span>
                      <p className="text-xl font-black text-emerald-400 mt-1">2. Sıra (#2)</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <span className="text-slate-400">"İskenderun tatlıcı"</span>
                      <p className="text-xl font-black text-cyan-300 mt-1">3. Sıra (#3)</p>
                    </div>
                  </div>
                </div>
              )}

              {customerActiveTab === "support" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Sıra Numaralı Destek Merkezi & WhatsApp</h3>
                  <p className="text-xs text-slate-300">
                    Destek biletiniz açıldığında kuyruk sıranız canlı gösterilir. Acil durumlarda WhatsApp hattımız önceliklidir.
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Talep #401: Yeni Tatlı Çeşitleri Menüye Eklensin</p>
                      <p className="text-slate-400 text-[11px]">Durum: Çözüldü • Yanıt Süresi: 12 Dakika</p>
                    </div>
                    <span className="rounded-lg bg-emerald-500/20 text-emerald-400 px-3 py-1 font-bold">Tamamlandı</span>
                  </div>
                </div>
              )}

              {customerActiveTab === "security" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">2FA İki Adımlı Güvenlik ve Oturum Denetimi</h3>
                  <p className="text-xs text-slate-300">
                    Oturumlarınız SMS ve e-posta OTP kodlarıyla korunur. Muhasebeciniz için ayrı kısıtlı kullanıcı yetkisi açabilirsiniz.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="font-bold text-white">2FA İki Adımlı Doğrulama</p>
                      <p className="text-emerald-400 text-[11px] mt-1">● Aktif (SMS & E-posta Korumalı)</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="font-bold text-white">Aktif Oturumlar</p>
                      <p className="text-slate-300 text-[11px] mt-1">1 Cihaz (Chrome / Windows - Antakya IP)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── MODÜL DETAY SAHNESİ (BAYİ PANELİ) ─────────────── */}
          {activeTab === "bayi" && (
            <div className="mt-8 text-left">
              {partnerActiveTab === "dashboard" && (
                <div className="space-y-6">
                  {/* 4 Ana Bayi Metriği */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4.5">
                      <span className="text-xs text-emerald-300 font-bold">Bu Ayki Net Komisyon</span>
                      <p className="mt-2 text-2xl font-black text-white">₺58.400</p>
                      <p className="text-[11px] text-emerald-300 mt-1">IBAN hesabına aktarılmaya hazır</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4.5">
                      <span className="text-xs text-slate-400 font-bold">Kayıtlı Aktif Esnaf</span>
                      <p className="mt-2 text-2xl font-black text-white">38 Firma</p>
                      <p className="text-[11px] text-cyan-300 mt-1">İskenderun & Antakya Bölgesi</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4.5">
                      <span className="text-xs text-slate-400 font-bold">Sabit Komisyon Oranı</span>
                      <p className="mt-2 text-2xl font-black text-amber-400">%30</p>
                      <p className="text-[11px] text-slate-400 mt-1">Satış ve yıllık yenilemelerde</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4.5">
                      <span className="text-xs text-slate-400 font-bold">Yetki Durumu</span>
                      <p className="mt-2 text-xl font-black text-emerald-400">Resmi Bölge Bayisi</p>
                      <p className="text-[11px] text-slate-400 mt-1">Yetki Belgesi Onaylı</p>
                    </div>
                  </div>
                </div>
              )}

              {partnerActiveTab === "pipeline" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Aday Müşteri Satış CRM & Kanban Panosu</h3>
                    <span className="text-xs font-bold text-emerald-400">+ Yeni Aday Ekle</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 text-xs">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                      <div className="flex justify-between font-bold border-b border-white/10 pb-2 text-sky-300">
                        <span>Teklif Aşaması (4)</span>
                        <span>₺72.000</span>
                      </div>
                      <div className="rounded-xl bg-white/5 p-2.5">
                        <p className="font-bold text-white">Körfez Lojistik Ltd.</p>
                        <p className="text-[10px] text-slate-400">Web + Google Ads • İskenderun</p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-2.5">
                        <p className="font-bold text-white">Antakya Şah Kebap</p>
                        <p className="text-[10px] text-slate-400">Harita + Yerel SEO • Antakya</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                      <div className="flex justify-between font-bold border-b border-white/10 pb-2 text-amber-300">
                        <span>İmza Bekleyen (2)</span>
                        <span>₺38.000</span>
                      </div>
                      <div className="rounded-xl bg-white/5 p-2.5">
                        <p className="font-bold text-white">Defne Butik Otel</p>
                        <p className="text-[10px] text-slate-400">E-Ticaret + Rezervasyon • Defne</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                      <div className="flex justify-between font-bold border-b border-white/10 pb-2 text-emerald-300">
                        <span>Yayında & Kazanılan (38)</span>
                        <span>₺420.000</span>
                      </div>
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                        <p className="font-bold text-emerald-300">38 Firma Aktif Yayında</p>
                        <p className="text-[10px] text-slate-300">Aylık düzenli pasif komisyon üretir</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {partnerActiveTab === "setup" && (
                <div className="grid gap-6 lg:grid-cols-12 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">5 Dakikada Otomatik Müşteri Kurulumu</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Müşterinizle el sıkıştığınız an bayi panelinden firma bilgilerini girin. Alan adı tescili, 256-Bit SSL sertifikası, sektörel tema kurulumu ve Google Harita başvurusu saniyeler içinde otomatik olarak başlatılır.
                    </p>
                    <div className="space-y-2 text-xs text-emerald-300 font-semibold">
                      <p>✓ Sıfır teknik kodlama zahmeti</p>
                      <p>✓ Hatay360 mühendisleri arka planda yönetir</p>
                      <p>✓ Komisyonunuz anında bakiyenize yansır</p>
                    </div>
                  </div>

                  <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3 text-xs">
                    <p className="font-bold text-white border-b border-white/10 pb-2">Hızlı Müşteri Başlatıcı</p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400">İşletme Adı:</span>
                        <input disabled value="Defne Doğal Zeytinyağı Ltd." className="w-full mt-1 rounded-xl bg-white/5 border border-white/10 p-2.5 text-white" />
                      </div>
                      <div>
                        <span className="text-slate-400">Paket:</span>
                        <input disabled value="E-Ticaret + Google Ads Yönetim Paketi (₺24.500)" className="w-full mt-1 rounded-xl bg-white/5 border border-white/10 p-2.5 text-cyan-300 font-bold" />
                      </div>
                      <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-2.5 text-center text-emerald-300 font-bold">
                        Bu Satıştan Hak Edilen Komisyon: ₺7.350
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {partnerActiveTab === "certificate" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Resmi Hatay360 Yetkili Bayi Belgesi</h3>
                  <p className="text-xs text-slate-300">
                    Esnafla yapacağınız görüşmelerde güven sağlamanız için adınıza tescilli resmi yetki sertifikanızı PDF olarak indirebilir veya ofisinizde sergileyebilirsiniz.
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-6 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white text-sm">İskenderun & Antakya Resmi Bölge Temsilcisi</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Sertifika No: H360-BAYI-2026-08 • Lisans Süresi: 2026/2027</p>
                    </div>
                    <span className="rounded-xl bg-emerald-500 px-4 py-2 font-black text-black">✓ PDF Sertifika İndir</span>
                  </div>
                </div>
              )}

              {partnerActiveTab === "whitelabel" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Tam White-Label Ajans Altyapısı</h3>
                  <p className="text-xs text-slate-300">
                    Müşterilerinize kendi şirket logonuz, kendi favicon'unuz ve kendi alan adınız üzerinden panel erişimi sağlayabilirsiniz. Arka plandaki sunucular ve yazılım motoru Hatay360 güvencesindedir.
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 grid gap-3 sm:grid-cols-2 text-xs">
                    <div>
                      <span className="text-slate-400">Ajans Adınız:</span>
                      <p className="font-bold text-white">İskenderun Dijital Medya Ajansı</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Görünen Panel Girişi:</span>
                      <p className="font-bold text-cyan-300">panel.iskenderunmedya.com</p>
                    </div>
                  </div>
                </div>
              )}

              {partnerActiveTab === "kits" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Hazır Satış Kitleri ve Fiyat Paketleri</h3>
                  <p className="text-xs text-slate-300">
                    Esnafa tek sayfa broşürler, hazır demo linkleri ve sözleşme taslakları vererek satışı ilk görüşmede kapatın.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3 text-xs">
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="font-bold text-white">Yerel Esnaf Web Paketi</p>
                      <p className="text-lg font-black text-white mt-1">₺12.500</p>
                      <p className="text-emerald-400 font-bold mt-1">Komisyonunuz: ₺3.750</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="font-bold text-white">Google Harita & Yerel SEO</p>
                      <p className="text-lg font-black text-white mt-1">₺4.500</p>
                      <p className="text-emerald-400 font-bold mt-1">Komisyonunuz: ₺1.350</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="font-bold text-white">E-Ticaret & Reklam Paketi</p>
                      <p className="text-lg font-black text-white mt-1">₺24.500</p>
                      <p className="text-emerald-400 font-bold mt-1">Komisyonunuz: ₺7.350</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── İNTERAKTİF BÜYÜME VE KAZANÇ HESAPLAYICILARI ─────── */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
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

      {/* ─── SSS ACCORDION REHBERİ ─────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-white sm:text-3xl">Sıkça Sorulan Sorular</h3>
          <p className="mt-2 text-xs text-slate-400">Müşteri ve bayi panelleri hakkında merak edilen tüm detaylar.</p>
        </div>

        <div className="space-y-3 text-left">
          {[
            {
              q: "Müşteri paneline girmek için kurulum şart mı?",
              a: "Hayır. Sayfadaki 'Demo Müşteri Olarak Gir' butonuna basarak örnek künefe & restoran işletmesi verileriyle paneli anında şifresiz test edebilirsiniz. Gerçek işletmeniz için kayıt olduğunuzda ise tüm alanlar sizin adınıza canlıya alınır.",
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
              a: "Evet. 5070 Sayılı Elektronik İmza Kanunu ve Borçlar Kanunu standartlarına uygun olarak IP, zaman damgası ve dokunmatik biyometrik koordinatlarıyla resmi PDF olarak arşivlenmektedir.",
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
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#0f766e] p-8 text-center sm:p-14 shadow-2xl shadow-[#00a8c4]/25">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />

          <h2 className="text-[28px] font-black text-white sm:text-[40px] leading-tight">
            {activeTab === "musteri"
              ? "İşletmenizi Hatay360 Paneli ile Zirveye Taşıyın"
              : "Hatay360 Yetkili Bayisi Olarak Düzenli Gelir Elde Edin"}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] text-cyan-100 sm:text-[17px]">
            {activeTab === "musteri"
              ? "Alan adı, hosting, Google Haritalar, kurumsal web ve reklam yönetimi tek bir modern 3D panelde."
              : "Bölgenizdeki esnafa hazır çözümler sunun, yüksek komisyon ve yıllık yenileme kazancı elde edin."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
