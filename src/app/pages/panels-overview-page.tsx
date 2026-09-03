import { useState } from "react";
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
} from "lucide-react";
import { SiteLogo } from "../components/site-logo";
import { PageCrumbs } from "../components/page-crumbs";
import { PageHero } from "../components/page-hero";

export function PanelsOverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "bayi" ? "bayi" : "musteri";
  const [activeTab, setActiveTab] = useState<"musteri" | "bayi">(initialTab);

  const handleTabChange = (tab: "musteri" | "bayi") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-[#07131a] text-white">
      {/* ─── ARKA PLAN IŞIKLARI & IZGARA ───────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#00a8c4]/20 via-[#0891b2]/10 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 -left-40 h-[500px] w-[500px] rounded-full bg-[#00a8c4]/10 blur-[120px]" />
        <div className="absolute bottom-10 -right-40 h-[600px] w-[600px] rounded-full bg-[#0891b2]/15 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* ─── HERO BÖLÜMÜ ────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00a8c4]/40 bg-[#00a8c4]/10 px-4 py-1.5 text-[12px] font-bold tracking-wider text-[#38bdf8] backdrop-blur-xl shadow-[0_0_30px_rgba(0,168,196,0.3)]">
            <Sparkles className="h-3.5 w-3.5 text-[#00a8c4]" />
            <span className="uppercase tracking-[0.16em]">Hatay360 Akıllı Yönetim & Büyüme Ekosistemi</span>
          </div>

          <h1 className="mt-5 text-[34px] font-black tracking-tight text-white sm:text-[48px] lg:text-[56px] leading-[1.15]">
            İşletmeniz ve Ajansınız İçin{" "}
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#00a8c4] to-[#2dd4bf] bg-clip-text text-transparent">
              Kusursuz Dijital Kontrol
            </span>{" "}
            Merkezleri
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-[16px] font-medium leading-relaxed text-slate-300 sm:text-[18px]">
            Hatay'daki yerel işletmeler için şeffaf <strong>Müşteri Yönetim Portalı</strong> ve bölgedeki dijital ajanslar ile saha temsilcileri için yüksek kazançlı <strong>Bayi & Partner Hub</strong>.
          </p>

          {/* ─── SEGMENTED SWITCHER (MÜŞTERİ vs BAYİ) ─────────── */}
          <div className="mx-auto mt-10 flex max-w-md rounded-2xl border border-white/15 bg-white/[0.05] p-1.5 backdrop-blur-2xl shadow-2xl shadow-black/50">
            <button
              onClick={() => handleTabChange("musteri")}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-black transition-all duration-300 ${
                activeTab === "musteri"
                  ? "bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#2dd4bf] text-white shadow-lg shadow-[#00a8c4]/35"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Müşteri Paneli</span>
            </button>
            <button
              onClick={() => handleTabChange("bayi")}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-black transition-all duration-300 ${
                activeTab === "bayi"
                  ? "bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#2dd4bf] text-white shadow-lg shadow-[#00a8c4]/35"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Bayi & Partner Paneli</span>
            </button>
          </div>

          {/* Hızlı Eylemler */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            {activeTab === "musteri" ? (
              <>
                <Link
                  to="/musteri/giris"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3.5 text-[14px] font-extrabold text-white shadow-xl shadow-[#00a8c4]/30 transition hover:scale-105 hover:bg-[#0891b2]"
                >
                  <Store className="h-4 w-4" />
                  <span>Müşteri Paneline Giriş Yap</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/musteri/kayit"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-[14px] font-bold text-white backdrop-blur-xl transition hover:bg-white/20"
                >
                  <span>Ücretsiz Hesap Aç</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/firma/giris"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3.5 text-[14px] font-extrabold text-white shadow-xl shadow-[#00a8c4]/30 transition hover:scale-105 hover:bg-[#0891b2]"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Bayi Portalına Giriş Yap</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/firma/kayit"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-[14px] font-bold text-white backdrop-blur-xl transition hover:bg-white/20"
                >
                  <span>Bayilik Başvurusu Yap (%30 Komisyon)</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── CANLI MOCKUP & EKRAN ÖNİZLEMESİ (BENTO SHOWCASE) ── */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <AnimatePresence mode="wait">
          {activeTab === "musteri" ? (
            <motion.div
              key="musteri-mockup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-[#0d222e] p-6 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.6)] lg:p-8"
            >
              {/* Pencere Başlığı */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-semibold text-slate-400">
                    hatay360.com/musteri • İşletme Yönetim Portalı
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Canlı & Senkronize</span>
                </div>
              </div>

              {/* Panel İçi Düzen Mockup */}
              <div className="mt-6 grid gap-6 lg:grid-cols-12">
                {/* Sol Menü Temsili */}
                <div className="space-y-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Müşteri Menüsü
                  </p>
                  {[
                    { label: "Genel Bakış", icon: BarChart3, active: true },
                    { label: "Web & Google Harita", icon: Globe },
                    { label: "Reklam Raporları", icon: TrendingUp },
                    { label: "Sözleşmeler (E-İmza)", icon: FileText },
                    { label: "Ödemeler & Faturalar", icon: CreditCard },
                    { label: "SEO Sıralama Takibi", icon: Search },
                    { label: "Canlı Destek & Bilet", icon: MessageSquare },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-bold transition ${
                        m.active
                          ? "bg-[#00a8c4] text-white shadow-md shadow-[#00a8c4]/30"
                          : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <m.icon className="h-4 w-4" />
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>

                {/* Sağ İstatistik & Kartlar Mockup */}
                <div className="space-y-5 lg:col-span-9">
                  {/* Üst Metrikler */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Harita & Web Ziyareti</span>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                      <p className="mt-2 text-2xl font-black text-white">4.820 <span className="text-xs text-emerald-400 font-bold">+%240</span></p>
                      <p className="mt-0.5 text-[11px] text-slate-400">Son 30 günde aramalardan gelen</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Telefon & Randevu</span>
                        <Smartphone className="h-4 w-4 text-[#38bdf8]" />
                      </div>
                      <p className="mt-2 text-2xl font-black text-white">194 Adet</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">Doğrudan arama ve WhatsApp formu</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Google Ads ROAS</span>
                        <Zap className="h-4 w-4 text-amber-400" />
                      </div>
                      <p className="mt-2 text-2xl font-black text-white">4.6x Getiri</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">Şeffaf reklam bütçe verimliliği</p>
                    </div>
                  </div>

                  {/* Proje Canlı Durum & Sözleşme Çubuğu */}
                  <div className="rounded-2xl border border-[#00a8c4]/30 bg-[#00a8c4]/10 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00a8c4] text-white">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">Projeniz 5. Aşamada: Google Haritalar Onaylandı</h4>
                          <p className="text-xs text-cyan-200">Alan adı, hosting, mobil tasarım ve harita senkronizasyonu tamamlandı.</p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-white/15 px-3 py-1 text-xs font-extrabold text-white">
                        %100 Tamamlandı
                      </span>
                    </div>
                  </div>

                  {/* Alt 2 Kolon: Sözleşme & Reklam Grafiği */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-[#38bdf8]" />
                          <h5 className="text-xs font-bold text-white">Dijital Onaylı Sözleşme</h5>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400">E-İmzalı</span>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-slate-300">
                        Hatay360 Hizmet ve Kurumsal Bakım Sözleşmesi canvas tabanlı e-imza ile dijital olarak onaylanmıştır.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          <h5 className="text-xs font-bold text-white">SSL & Güvenlik Koruması</h5>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">Aktif</span>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-slate-300">
                        256-Bit SSL sertifikası, günlük bulut yedekleme ve 2FA iki adımlı oturum güvenliği devrededir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="bayi-mockup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-[#0d222e] p-6 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.6)] lg:p-8"
            >
              {/* Pencere Başlığı */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-semibold text-slate-400">
                    hatay360.com/firma • Yetkili Bayi & Partner Hub
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-400 border border-cyan-500/20">
                  <Award className="h-3.5 w-3.5" />
                  <span>Yetkili Bölge Temsilcisi</span>
                </div>
              </div>

              {/* Bayi Panel İçi Düzen Mockup */}
              <div className="mt-6 grid gap-6 lg:grid-cols-12">
                {/* Sol Menü Temsili */}
                <div className="space-y-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Bayi İşlemleri
                  </p>
                  {[
                    { label: "Bayi Dashboard", icon: BarChart3, active: true },
                    { label: "Müşteri Ekle & Pipeline", icon: Users },
                    { label: "Komisyon & Hakedişler", icon: Wallet },
                    { label: "Satış Paketleri & Fiyat", icon: Layers },
                    { label: "White-Label Markalama", icon: Building2 },
                    { label: "Hazır Satış Kitleri", icon: FileText },
                    { label: "VIP Bayi Desteği", icon: MessageSquare },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-bold transition ${
                        m.active
                          ? "bg-gradient-to-r from-[#0891b2] to-[#00a8c4] text-white shadow-md shadow-[#00a8c4]/30"
                          : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <m.icon className="h-4 w-4" />
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>

                {/* Sağ İstatistik & Bayi Kartları Mockup */}
                <div className="space-y-5 lg:col-span-9">
                  {/* Üst Metrikler */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Toplam Hakediş Kazancı</span>
                        <Wallet className="h-4 w-4 text-emerald-400" />
                      </div>
                      <p className="mt-2 text-2xl font-black text-white">₺58.400</p>
                      <p className="mt-0.5 text-[11px] text-emerald-400 font-bold">Düzenli aylık komisyon aktarımı</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Kayıtlı İşletmeler</span>
                        <Building2 className="h-4 w-4 text-[#38bdf8]" />
                      </div>
                      <p className="mt-2 text-2xl font-black text-white">38 Firma</p>
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
                  </div>

                  {/* Aday Müşteri Pipeline Listesi */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="text-sm font-bold text-white">Son Müşteri Kurulum Talepleri</h4>
                      <span className="text-xs font-bold text-[#38bdf8]">+ Yeni İşletme Ekle</span>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      {[
                        { name: "Körfez Lojistik Ltd.", service: "Web + Google Ads", district: "İskenderun", status: "Yayında", tone: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                        { name: "Antakya Şah Kebap", service: "Harita + Yerel SEO", district: "Antakya", status: "Kuruluyor", tone: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                        { name: "Defne Zeytinyağı Butik", service: "E-Ticaret Paketi", district: "Defne", status: "Sözleşme İmzalandı", tone: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/[0.02] p-3 text-xs hover:bg-white/[0.05]"
                        >
                          <div>
                            <p className="font-bold text-white">{item.name}</p>
                            <p className="text-[11px] text-slate-400">{item.service} • {item.district}</p>
                          </div>
                          <span className={`rounded-lg px-2.5 py-1 font-extrabold border ${item.tone}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ─── DERİNLEMESİNE MODÜL VE ÖZELLİK LİSTESİ ───────────── */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#00a8c4]">
            {activeTab === "musteri" ? "MÜŞTERİ PANELİ ÖZELLİKLERİ" : "BAYİ & PARTNER PANELİ ÖZELLİKLERİ"}
          </p>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl lg:text-4xl">
            {activeTab === "musteri"
              ? "İşletmenizi Büyüten 8 Akıllı Modül"
              : "Ajansınızı ve Kazancınızı Büyüten 8 Bayilik Modülü"}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {activeTab === "musteri"
              ? "Web siteniz, harita kaydınız, reklam bütçeleriniz ve faturalandırmanız tek ekranda."
              : "White-label altyapı, düzenli komisyonlar, otomatik kurulum ve müşteri yönetim sistemi."}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(activeTab === "musteri"
            ? [
                {
                  icon: Globe,
                  title: "Web & Domain Takibi",
                  desc: "Alan adı süreniz, 256-bit SSL sertifikanız ve bulut sunucu durumunuz anlık izlenir.",
                },
                {
                  icon: MapPin,
                  title: "Google Haritalar Yönetimi",
                  desc: "Yol tarifi istekleri, gelen telefon aramaları ve işletme fotoğrafları senkronize edilir.",
                },
                {
                  icon: TrendingUp,
                  title: "Şeffaf Reklam Raporu",
                  desc: "Google Ads ve Meta bütçeniz, tıklama maliyeti ve dönüşüm adetleri kuruşu kuruşuna listelenir.",
                },
                {
                  icon: FileCheck,
                  title: "Dijital E-İmza Sözleşme",
                  desc: "Sözleşmelerinizi cep telefonunuzdan ekrana imza atarak anında onaylayabilir, PDF indirebilirsiniz.",
                },
                {
                  icon: CreditCard,
                  title: "Online Ödeme & Fatura",
                  desc: "Kredi kartı ile taksitli veya tek çekim ödeme, bakiye takibi ve resmi e-fatura arşivi.",
                },
                {
                  icon: Search,
                  title: "SEO Kelime Sıralaması",
                  desc: "Hatay'da sektörünüze ait hedef arama kelimelerinizin Google sıralama geçmişi raporlanır.",
                },
                {
                  icon: MessageSquare,
                  title: "Bilet Destek & WhatsApp",
                  desc: "Panelden tek tıkla canlı destek bileti açabilir veya doğrudan Hatay360 ekibine WhatsApp'tan yazabilirsiniz.",
                },
                {
                  icon: ShieldCheck,
                  title: "2FA İki Adımlı Güvenlik",
                  desc: "SMS ve e-posta doğrulama ile hesabınız yetkisiz erişimlere karşı üst düzey korunur.",
                },
              ]
            : [
                {
                  icon: Wallet,
                  title: "Düzenli Hakediş Geliri",
                  desc: "Her satıştan ve yıllık yenilemelerden %20 ile %40 arasında düzenli komisyon kazanın.",
                },
                {
                  icon: Building2,
                  title: "White-Label Altyapı",
                  desc: "Müşterilerinize kendi ajansınızın logosu ve unvanıyla kurumsal web ve reklam çözümleri sunun.",
                },
                {
                  icon: Zap,
                  title: "5 Dakikada Hızlı Kurulum",
                  desc: "Panel üzerinden işletme bilgilerini girerek alan adı, hosting ve harita kaydını hemen başlatın.",
                },
                {
                  icon: Users,
                  title: "Müşteri Pipeline (Mini CRM)",
                  desc: "Aday müşterilerinizi arandı, teklif verildi ve sözleşme imzalandı aşamalarıyla takip edin.",
                },
                {
                  icon: FileText,
                  title: "Hazır Satış Materyalleri",
                  desc: "Esnafa gösterebileceğiniz hazır sektörel broşürler, PDF teklif taslakları ve sözleşmeler.",
                },
                {
                  icon: Award,
                  title: "İlçe Yetkili Temsilciliği",
                  desc: "Kendi ilçenizde (Antakya, İskenderun, Dörtyol vb.) Hatay360 resmi yetkili bayisi olma ayrıcalığı.",
                },
                {
                  icon: MessageSquare,
                  title: "Öncelikli Bayi Destek Hattı",
                  desc: "Teknik veya ticari konularda doğrudan uzman mühendis ekibimize ulaşabileceğiniz VIP kanal.",
                },
                {
                  icon: Clock,
                  title: "Yıllık Yenileme Komisyonu",
                  desc: "Müşteriniz her yıl hosting ve reklam yenilemesi yaptıkça komisyon kazanmaya devam edersiniz.",
                },
              ]
          ).map((feat, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#00a8c4]/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-[#00a8c4]/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00a8c4]/15 text-[#38bdf8] border border-[#00a8c4]/20 group-hover:scale-110 transition">
                <feat.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-white">{feat.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── KARŞILAŞTIRMA VE SSS TABLOSU ────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] p-8 backdrop-blur-2xl">
          <h3 className="text-xl font-bold text-white text-center sm:text-2xl">
            Müşteri Paneli ve Bayi Paneli Karşılaştırması
          </h3>
          <p className="mt-1 text-center text-xs text-slate-400">
            İhtiyacınıza en uygun paneli seçerek hemen kullanmaya başlayabilirsiniz.
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Özellik / Yetenek</th>
                  <th className="py-3 px-4 text-[#38bdf8]">Müşteri Paneli</th>
                  <th className="py-3 px-4 text-[#2dd4bf]">Bayi Paneli</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200 text-xs sm:text-sm">
                {[
                  { title: "Kullanıcı Kitlesi", c: "Yerel Esnaf & Şirketler", b: "Dijital Ajanslar & Satış Temsilcileri" },
                  { title: "Web & Harita Yönetimi", c: "Kendi işletmesi için", b: "Portföyündeki tüm müşteriler için" },
                  { title: "Google Ads & Meta Raporu", c: "Kendi harcamaları", b: "Tüm müşterilerin toplam özeti" },
                  { title: "Komisyon & Hakediş Kazancı", c: "—", b: "%20 - %40 Nakit Komisyon" },
                  { title: "White-Label Kendi Logosuyla", c: "—", b: "Tam White-Label Panel" },
                  { title: "Dijital E-İmza & Sözleşme", c: "Onaylama Yetkisi", b: "Gönderme & Takip Yetkisi" },
                  { title: "Yeni Müşteri Ekleme", c: "—", b: "Sınırsız İşletme Kurulumu" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-bold text-white">{row.title}</td>
                    <td className="py-3.5 px-4 text-slate-300">{row.c}</td>
                    <td className="py-3.5 px-4 text-cyan-200 font-semibold">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── ALT ÇAĞRI (CTA) ────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#0f766e] p-8 text-center sm:p-12 shadow-2xl">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

          <h2 className="text-[28px] font-black text-white sm:text-[38px]">
            {activeTab === "musteri"
              ? "İşletmenizi Hatay360 Paneli ile Dijitale Taşıyın"
              : "Hatay360 Yetkili Bayisi Olarak Düzenli Kazanç Sağlayın"}
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-[15px] text-cyan-100 sm:text-[17px]">
            {activeTab === "musteri"
              ? "Domain, hosting, Google Haritalar, kurumsal web ve reklam yönetimi tek bir modern panelde."
              : "Bölgenizdeki yüzlerce esnafa kurumsal çözümler sunun, yüksek komisyon ve yıllık yenileme geliri elde edin."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {activeTab === "musteri" ? (
              <>
                <Link
                  to="/musteri/giris"
                  className="rounded-xl bg-white px-8 py-3.5 text-sm font-black text-[#0891b2] shadow-xl hover:bg-cyan-50 transition"
                >
                  Müşteri Girişi Yap
                </Link>
                <Link
                  to="/iletisim"
                  className="rounded-xl border border-white/40 bg-black/20 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-md hover:bg-black/30 transition"
                >
                  Bizi Arayın / Keşif İste
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/firma/kayit"
                  className="rounded-xl bg-white px-8 py-3.5 text-sm font-black text-[#0891b2] shadow-xl hover:bg-cyan-50 transition"
                >
                  Hemen Bayilik Başvurusu Yap
                </Link>
                <Link
                  to="/firma/giris"
                  className="rounded-xl border border-white/40 bg-black/20 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-md hover:bg-black/30 transition"
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
