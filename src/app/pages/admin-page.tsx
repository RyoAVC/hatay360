import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  useContent,
  Plan,
  Slide,
  EcosystemService,
  ReferenceItem,
  SectorItem,
  SiteSettings,
  slugifySector,
  normalizeSector,
  HOME_SECTION_OPTIONS,
  DEFAULT_HOME_SECTIONS,
  sectionOn,
} from "../context/content-context";
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Package,
  Star,
  Settings,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Layers,
  SlidersHorizontal,
  LayoutGrid,
  LogOut,
  Search,
  BarChart3,
  Download,
  Upload,
  ShieldAlert,
  UserRoundCog,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import { SiteLogo } from "../components/site-logo";
import { AdminSeoPanel } from "./admin-seo-panel";
import { AdminInsightsPanel } from "./admin-insights-panel";
import { AdminCustomerPanel } from "./admin-customer-panel";
import { MAX_LOGO_FILE_BYTES, processLogoFile } from "../lib/logo-image";

export function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const {
    plans,
    slides,
    services,
    sectors,
    references,
    settings,
    databaseStatus,
    databaseHasContent,
    contentError,
    saveAllContent,
    resetAll,
  } = useContent();

  const [activeTab, setActiveTab] = useState<"insights" | "customers" | "plans" | "slides" | "services" | "sectors" | "references" | "settings" | "seo">("insights");

  const [plansState, setPlansState] = useState<Plan[]>(plans);
  const [slidesState, setSlidesState] = useState<Slide[]>(slides);
  const [servicesState, setServicesState] = useState<EcosystemService[]>(services);
  const [sectorsState, setSectorsState] = useState<SectorItem[]>(sectors);
  const [refsState, setRefsState] = useState<ReferenceItem[]>(references);
  const [settingsState, setSettingsState] = useState<SiteSettings>(settings);

  const [saveToast, setSaveToast] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [backupNotice, setBackupNotice] = useState("");
  const [logoUploadNotice, setLogoUploadNotice] = useState("");
  const backupInputRef = useRef<HTMLInputElement>(null);

  const hasUnsavedChanges = useMemo(
    () =>
      (!databaseHasContent && databaseStatus === "connected") ||
      JSON.stringify({ plansState, slidesState, servicesState, sectorsState, refsState, settingsState }) !==
        JSON.stringify({
          plansState: plans,
          slidesState: slides,
          servicesState: services,
          sectorsState: sectors,
          refsState: references,
          settingsState: settings,
        }),
    [plansState, slidesState, servicesState, sectorsState, refsState, settingsState, plans, slides, services, sectors, references, settings, databaseHasContent, databaseStatus],
  );

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    setPlansState(plans);
  }, [plans]);

  useEffect(() => {
    setSlidesState(slides);
  }, [slides]);

  useEffect(() => {
    setServicesState(services);
  }, [services]);

  useEffect(() => {
    setSectorsState(sectors);
  }, [sectors]);

  useEffect(() => {
    setRefsState(references);
  }, [references]);

  useEffect(() => {
    setSettingsState(settings);
  }, [settings]);

  // --- PAKET DÜZENLEME HAFİZASI ---
  const handlePlanChange = (index: number, field: keyof Plan, value: any) => {
    const newPlans = [...plansState];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setPlansState(newPlans);
  };

  const handleFeatureChange = (planIndex: number, featureIndex: number, field: "text" | "iconPng", value: string) => {
    const newPlans = [...plansState];
    const newFeatures = [...newPlans[planIndex].features];
    newFeatures[featureIndex] = { ...newFeatures[featureIndex], [field]: value };
    newPlans[planIndex].features = newFeatures;
    setPlansState(newPlans);
  };

  const addFeature = (planIndex: number) => {
    const newPlans = [...plansState];
    newPlans[planIndex].features.push({ text: "Yeni Özellik Açıklaması", iconPng: "" });
    setPlansState(newPlans);
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...plansState];
    newPlans[planIndex].features.splice(featureIndex, 1);
    setPlansState(newPlans);
  };

  const addNewPlan = () => {
    const newPlan: Plan = {
      id: "custom_" + Date.now(),
      name: "Özel VIP Paket",
      badge: "Özel Çözüm",
      oldPrice: "₺45.000",
      price: "₺32.900",
      monthlyPrice: "₺2.740 / ay",
      installments: "12 Taksit İmkânı",
      desc: "İhtiyacınıza özel yapılandırılmış yüksek performanslı paket.",
      cta: "Hemen Başla",
      kind: "ads",
      effectStyle: "none",
      effectText: "Yeni fırsat",
      features: [{ text: "Sınırsız e-ticaret altyapısı", iconPng: "" }],
    };
    setPlansState([...plansState, newPlan]);
  };

  const removePlan = (index: number) => {
    const newPlans = [...plansState];
    newPlans.splice(index, 1);
    setPlansState(newPlans);
  };

  // --- SLAYT DÜZENLEME ---
  const handleSlideChange = (index: number, field: keyof Slide, value: any) => {
    const newSlides = [...slidesState];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlidesState(newSlides);
  };

  // --- HİZMETLER DÜZENLEME ---
  const handleServiceChange = (index: number, field: keyof EcosystemService, value: any) => {
    const newServices = [...servicesState];
    newServices[index] = { ...newServices[index], [field]: value };
    setServicesState(newServices);
  };

  // --- SEKTÖR DÜZENLEME ---
  const handleSectorChange = (index: number, field: keyof SectorItem, value: any) => {
    const newSectors = [...sectorsState];
    newSectors[index] = { ...newSectors[index], [field]: value };
    setSectorsState(newSectors);
  };

  const handleSectorListChange = (index: number, field: "heroPoints" | "keywords" | "plan", itemIndex: number, value: string) => {
    const newSectors = [...sectorsState];
    const nextList = [...(newSectors[index][field] || [])];
    nextList[itemIndex] = value;
    newSectors[index] = { ...newSectors[index], [field]: nextList };
    setSectorsState(newSectors);
  };

  const addSectorItem = (field: "heroPoints" | "keywords" | "plan", index: number) => {
    const newSectors = [...sectorsState];
    const current = [...(newSectors[index][field] || [])];
    current.push(field === "keywords" ? "Yeni anahtar kelime" : "Yeni metin");
    newSectors[index] = { ...newSectors[index], [field]: current };
    setSectorsState(newSectors);
  };

  const removeSectorItem = (field: "heroPoints" | "keywords" | "plan", sectorIndex: number, itemIndex: number) => {
    const newSectors = [...sectorsState];
    const current = [...(newSectors[sectorIndex][field] || [])];
    current.splice(itemIndex, 1);
    newSectors[sectorIndex] = { ...newSectors[sectorIndex], [field]: current };
    setSectorsState(newSectors);
  };

  const addNewSector = () => {
    const nextId = "custom_" + Date.now();
    const newSector = normalizeSector({
      id: nextId,
      slug: slugifySector("Yeni sektör"),
      title: "Yeni Sektör Sayfası",
      eyebrow: "Sektör reklamı",
      headline: "Bu sektör için özel sayfa ve görünürlük oluşturun.",
      description: "Google Ads, Meta ve landing page ile daha çok çağrı ve dönüşüm elde edebilirsiniz.",
      cta: "Teklif alın",
      keywords: ["Yeni sektör", "Hatay", "Google Ads"],
      heroPoints: ["Hedefli reklam", "Sayfa netliği", "Telefon dönüşümü"],
      pain: "Bu sektöre özel mesaj ve hedefleme ile daha hızlı satış yapılabilir.",
      offer: "Google Ads + landing page + yerel görünürlük paketi.",
      metrics: [
        { label: "Arama", value: "Google" },
        { label: "Başvuru", value: "WhatsApp" },
        { label: "Odak", value: "Dönüşüm" },
      ],
      highlights: [
        { title: "Ana başlık", text: "Öne çıkan hizmet açıklaması", icon: "target" },
      ],
      plan: ["İhtiyaç analizi", "Reklam kurulumu", "Yayın sonrası optimizasyon"],
      theme: { primary: "#00a8c4", soft: "#e8f8fb", dark: "#0f172a" },
      demoBadge: "Sektör demo",
      demoAccent: "#00a8c4",
      demoImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    });
    setSectorsState([...sectorsState, newSector]);
  };

  const removeSector = (index: number) => {
    const next = [...sectorsState];
    next.splice(index, 1);
    setSectorsState(next);
  };

  // --- REFERANSLAR DÜZENLEME ---
  const handleRefChange = (index: number, field: keyof ReferenceItem, value: any) => {
    const newRefs = [...refsState];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setRefsState(newRefs);
  };

  const addNewReference = () => {
    const newRef: ReferenceItem = {
      id: Date.now(),
      name: "Yeni Müşteri Markası",
      category: "eticaret",
      categoryLabel: "E-Ticaret",
      sector: "Genel Sektör",
      desc: "Hatay360 e-ticaret altyapısıyla büyüyen mağaza.",
      result: "%250 Ciro Artışı",
      subResult: "Aylık 10.000+ Sipariş",
      beforeAfter: "Eski: 1.000 ➔ Hatay360 İle: 10.000",
      rating: 5,
      quote: "Hatay360 sistemine geçtikten sonra satışlarımız 2 katına çıktı!",
      author: "Müşteri Yetkilisi",
      role: "Kurucu",
      badgeColor: "#00a8c4",
    };
    setRefsState([...refsState, newRef]);
  };

  const removeReference = (index: number) => {
    const newRefs = [...refsState];
    newRefs.splice(index, 1);
    setRefsState(newRefs);
  };

  // --- KAYDET ---
  const handleSaveAll = async () => {
    const normalizedSectors = sectorsState.map((sector) =>
      normalizeSector({ ...sector, slug: slugifySector(sector.slug || sector.title) }),
    );
    const sectorSlugs = normalizedSectors.map((sector) => sector.slug);
    const duplicateSlug = sectorSlugs.find((slug, index) => sectorSlugs.indexOf(slug) !== index);

    if (!settingsState.siteTitle.trim() || !settingsState.phone.trim() || !settingsState.email.includes("@")) {
      setSaveError("Genel ayarlardaki site başlığı, telefon ve geçerli e-posta alanlarını kontrol edin.");
      return;
    }
    if (plansState.some((plan) => !plan.name.trim() || !plan.price.trim())) {
      setSaveError("Her paketin adı ve fiyatı dolu olmalıdır.");
      return;
    }
    if (normalizedSectors.some((sector) => !sector.title.trim()) || duplicateSlug) {
      setSaveError(
        duplicateSlug
          ? `“${duplicateSlug}” sektör adresi birden fazla kez kullanılıyor. Her sektörün adresi benzersiz olmalıdır.`
          : "Her sektörün başlığı dolu olmalıdır.",
      );
      return;
    }

    setSaveError("");
    setIsSaving(true);
    try {
      await saveAllContent({
        plans: plansState,
        slides: slidesState,
        services: servicesState,
        sectors: normalizedSectors,
        references: refsState,
        settings: settingsState,
      });
      setSectorsState(normalizedSectors);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "İçerik veritabanına kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadBackup = () => {
    const backup = {
      format: "hatay360-content-backup",
      version: 1,
      createdAt: new Date().toISOString(),
      plans: plansState,
      slides: slidesState,
      services: servicesState,
      sectors: sectorsState,
      references: refsState,
      settings: { ...settingsState, aiApiKey: "" },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hatay360-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setBackupNotice("İçerik yedeği indirildi. Yapay zekâ API anahtarı güvenlik nedeniyle yedeğe eklenmedi.");
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      if (file.size > 2_000_000) {
        throw new Error("Yedek dosyası 2 MB sınırını aşıyor.");
      }

      const data = JSON.parse(await file.text()) as Record<string, unknown>;
      const arrayKeys = ["plans", "slides", "services", "sectors", "references"] as const;
      const arraysAreValid = arrayKeys.every((key) => Array.isArray(data[key]));
      if (data.format !== "hatay360-content-backup" || data.version !== 1 || !arraysAreValid) {
        throw new Error("Bu dosya geçerli bir Hatay360 içerik yedeği değil.");
      }
      if (!data.settings || typeof data.settings !== "object" || Array.isArray(data.settings)) {
        throw new Error("Yedekte genel ayarlar bulunamadı.");
      }

      setPlansState(data.plans as Plan[]);
      setSlidesState(data.slides as Slide[]);
      setServicesState(data.services as EcosystemService[]);
      setSectorsState((data.sectors as SectorItem[]).map((sector) => normalizeSector(sector)));
      setRefsState(data.references as ReferenceItem[]);
      setSettingsState((current) => ({
        ...current,
        ...(data.settings as Partial<SiteSettings>),
        aiApiKey: "",
      }));
      setBackupNotice("Yedek kontrol edildi ve forma yüklendi. Kalıcı olması için ‘Değişiklikleri Kaydet’ düğmesine basın.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Yedek dosyası okunamadı.";
      setBackupNotice(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white font-sans">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#18181f]/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex items-center">
              <SiteLogo variant="onDark" preview={{ logoDarkHeight: 32 }} />
            </span>
            <div>
              <h1 className="text-[18px] font-black text-white">Hatay360 Yönetim Paneli</h1>
              <p className="text-[11px] text-white/60">Bu tarayıcıdaki sayfaları, paketleri, demoları ve site ayarlarını düzenleyin</p>
              <p className={`mt-1 text-[11px] font-bold ${hasUnsavedChanges ? "text-amber-300" : "text-emerald-300"}`}>
                {hasUnsavedChanges ? "Kaydedilmemiş değişiklikler var" : "Tüm değişiklikler kayıtlı"}
              </p>
              <p className={`mt-0.5 text-[10px] font-bold ${databaseStatus === "connected" ? "text-cyan-300" : databaseStatus === "loading" ? "text-white/50" : "text-red-300"}`}>
                {databaseStatus === "connected" ? "SQLite veritabanı bağlı" : databaseStatus === "loading" ? "Veritabanı kontrol ediliyor…" : "Veritabanı çevrimdışı"}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <button
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges || isSaving || databaseStatus !== "connected"}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00a8c4] to-[#3ec8dc] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-45 sm:px-5 sm:text-[14px]"
            >
              <Save className="h-4 w-4" /> {isSaving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
            </button>

            <button
              onClick={async () => {
                if (window.confirm("Bu tarayıcıdaki tüm Hatay360 içeriklerini varsayılan değerlere döndürmek istiyor musunuz? Önce yedek almanız önerilir.")) {
                  try {
                    await resetAll();
                    window.location.reload();
                  } catch (error) {
                    setSaveError(error instanceof Error ? error.message : "İçerikler sıfırlanamadı.");
                  }
                }
              }}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white/80 hover:bg-white/10 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" /> Sıfırla
            </button>

            <button
              onClick={async () => {
                if (hasUnsavedChanges && !window.confirm("Kaydedilmemiş değişiklikler var. Yine de çıkış yapmak istiyor musunuz?")) return;
                await logout();
                navigate("/panel/giris", { replace: true });
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white/80 hover:bg-white/10 cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Çıkış
            </button>

            <Link
              to="/"
              onClick={(event) => {
                if (hasUnsavedChanges && !window.confirm("Kaydedilmemiş değişiklikler var. Yine de canlı siteye geçmek istiyor musunuz?")) {
                  event.preventDefault();
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-[#00a8c4] px-4 py-2.5 text-[13px] font-bold text-[#3ec8dc] hover:bg-[#00a8c4] hover:text-white transition-all"
            >
              Canlı Siteyi Gör <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {contentError && (
        <div className="border-b border-red-400/20 bg-red-950/70 px-6 py-2 text-center text-[12px] font-bold text-red-100">
          {contentError}
        </div>
      )}

      <section className="border-b border-amber-300/15 bg-amber-300/[0.04] px-6 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex max-w-2xl items-start gap-2 text-[12px] leading-relaxed text-white/65">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <span>
              İçerikler şu an bu tarayıcıda saklanır. Cihaz değişikliği veya tarayıcı temizliği öncesinde yedek indirin.
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadBackup}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[12px] font-bold text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4" /> Yedek İndir
            </button>
            <button
              type="button"
              onClick={() => backupInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[12px] font-bold text-white hover:bg-white/10"
            >
              <Upload className="h-4 w-4" /> Yedek Yükle
            </button>
            <input
              ref={backupInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={importBackup}
            />
          </div>
          {backupNotice && <p className="w-full text-[12px] font-medium text-amber-100">{backupNotice}</p>}
        </div>
      </section>

      {/* Kaydedildi Toast */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#10b981] px-5 py-3 text-[14px] font-black text-white shadow-2xl animate-bounce">
          <CheckCircle2 className="h-5 w-5" /> Değişiklikler bu tarayıcıdaki site verilerine kaydedildi.
        </div>
      )}

      {saveError && (
        <div className="fixed right-4 top-24 z-50 max-w-sm rounded-2xl border border-red-400/30 bg-red-950 px-5 py-3 text-[13px] font-bold text-red-100 shadow-2xl sm:right-6">
          {saveError}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("insights")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold transition-all cursor-pointer ${
              activeTab === "insights" ? "bg-[#00a8c4] text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Metrikler & Müşteriler
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold transition-all cursor-pointer ${
              activeTab === "customers" ? "bg-[#00a8c4] text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <UserRoundCog className="h-4 w-4" /> Müşteri Portalı
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold transition-all cursor-pointer ${
              activeTab === "plans" ? "bg-[#00a8c4] text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Package className="h-4 w-4" /> Paketler & Fiyatlar
          </button>

          <button
            onClick={() => setActiveTab("slides")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold transition-all cursor-pointer ${
              activeTab === "slides" ? "bg-[#00a8c4] text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <LayoutGrid className="h-4 w-4" /> Hero Slider
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold transition-all cursor-pointer ${
              activeTab === "services" ? "bg-[#00a8c4] text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Layers className="h-4 w-4" /> Hizmetler
          </button>

          <button
            onClick={() => setActiveTab("sectors")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold transition-all cursor-pointer ${
              activeTab === "sectors" ? "bg-[#00a8c4] text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <LayoutGrid className="h-4 w-4" /> Sektör Sayfaları
          </button>

          <button
            onClick={() => setActiveTab("references")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold transition-all cursor-pointer ${
              activeTab === "references" ? "bg-[#00a8c4] text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Star className="h-4 w-4" /> Referanslar & Markalar
          </button>

          <button
            onClick={() => setActiveTab("seo")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold transition-all cursor-pointer ${
              activeTab === "seo" ? "bg-[#00a8c4] text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Search className="h-4 w-4" /> SEO
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold transition-all cursor-pointer ${
              activeTab === "settings" ? "bg-[#00a8c4] text-white shadow-md" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Settings className="h-4 w-4" /> Genel Site Ayarları
          </button>
        </div>

        {activeTab === "insights" && <AdminInsightsPanel />}
        {activeTab === "customers" && <AdminCustomerPanel />}

        {/* --- TAB 1: PAKETLER VE FİYATLAR --- */}
        {activeTab === "plans" && (
          <div className="mt-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-black text-white">E-Ticaret & Ajans Paket Yönetimi</h2>
                <p className="text-[13px] text-white/60">
                  Paket isimlerini, fiyatlarını, rozet metinlerini, öne çıkan seçeneği ve PNG ikonlu maddeleri düzenleyin.
                </p>
              </div>

              <button
                onClick={addNewPlan}
                className="flex items-center gap-2 rounded-xl bg-[#10b981] px-5 py-2.5 text-[14px] font-extrabold text-white shadow-md hover:bg-[#059669] cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Yeni Paket Ekle
              </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {plansState.map((plan, planIdx) => (
                <div
                  key={plan.id + planIdx}
                  className="rounded-3xl border border-white/15 bg-[#18181f] p-6 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[12px] font-black text-[#00a8c4] uppercase">Paket #{planIdx + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-[12px] font-bold text-white/90 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={plan.featured || false}
                          onChange={(e) => handlePlanChange(planIdx, "featured", e.target.checked)}
                          className="h-4 w-4 accent-[#00a8c4]"
                        />
                        ⭐ Öne Çıkar (En Çok Tercih Edilen)
                      </label>
                      <button
                        onClick={() => removePlan(planIdx)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Paket türü</label>
                      <select
                        value={plan.kind === "store" ? "store" : "ads"}
                        onChange={(e) => handlePlanChange(planIdx, "kind", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] font-bold text-white focus:border-[#00a8c4]"
                      >
                        <option value="ads">Reklam paketi</option>
                        <option value="store">E-ticaret / web paketi</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-1">
                      <p className="text-[10px] leading-relaxed text-white/45">Reklam paketleri üst sırada, mağaza paketleri alt sırada görünür.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Paket Adı</label>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) => handlePlanChange(planIdx, "name", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] font-extrabold text-white focus:border-[#00a8c4]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Rozet Metni</label>
                      <input
                        type="text"
                        value={plan.badge}
                        onChange={(e) => handlePlanChange(planIdx, "badge", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] font-bold text-white focus:border-[#00a8c4]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-2xl border border-[#38bdf8]/20 bg-[#07151c] p-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#7ddff0]">Animasyonlu Üst Rozet</label>
                      <select
                        value={plan.effectStyle || "none"}
                        onChange={(e) => handlePlanChange(planIdx, "effectStyle", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] font-bold text-white focus:border-[#00a8c4]"
                      >
                        <option value="none">Efekt yok</option>
                        <option value="fire">Alev ve kıvılcım</option>
                        <option value="ice">Buz ve soğuk duman</option>
                        <option value="speed">Hız ve rüzgâr</option>
                        <option value="neon">Neon parıltı</option>
                        <option value="electric">Elektrik ve şimşek</option>
                        <option value="gold">Altın VIP parıltısı</option>
                        <option value="cosmic">Kozmik yörünge</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#7ddff0]">Efektli Rozet Metni</label>
                      <input
                        type="text"
                        value={plan.effectText || ""}
                        onChange={(e) => handlePlanChange(planIdx, "effectText", e.target.value)}
                        placeholder="Örn. Alev alan fırsat"
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] font-bold text-white focus:border-[#00a8c4]"
                      />
                    </div>
                    <p className="text-[10px] leading-relaxed text-white/45 sm:col-span-2">Seçtiğiniz efekt ana sayfa ve Paketler sayfasında bu paketin üstünde görünür. Hareket azaltma tercihi olan ziyaretçilerde animasyon otomatik sakinleşir.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Eski Fiyat (Çizili)</label>
                      <input
                        type="text"
                        value={plan.oldPrice}
                        onChange={(e) => handlePlanChange(planIdx, "oldPrice", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] font-bold text-white/70"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Aktif Fiyat</label>
                      <input
                        type="text"
                        value={plan.price}
                        onChange={(e) => handlePlanChange(planIdx, "price", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] font-black text-[#10b981]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Aylık Tutar</label>
                      <input
                        type="text"
                        value={plan.monthlyPrice}
                        onChange={(e) => handlePlanChange(planIdx, "monthlyPrice", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] font-bold text-white/80"
                      />
                    </div>
                  </div>

                  {/* ÖZELLİKLER VE PNG İKON YÜKLEME */}
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-extrabold text-[#38bdf8]">
                        Paket Maddeleri & PNG İkonları
                      </span>
                      <button
                        onClick={() => addFeature(planIdx)}
                        className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Madde Ekle
                      </button>
                    </div>

                    {plan.features.map((feat, featIdx) => (
                      <div key={featIdx} className="flex items-center gap-2 rounded-xl bg-black/30 p-2 border border-white/10">
                        <input
                          type="text"
                          value={feat.text}
                          onChange={(e) => handleFeatureChange(planIdx, featIdx, "text", e.target.value)}
                          className="flex-1 bg-transparent text-[12px] font-bold text-white outline-none"
                        />
                        <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded border border-white/10">
                          <ImageIcon className="h-3.5 w-3.5 text-[#a855f7]" />
                          <input
                            type="text"
                            value={feat.iconPng || ""}
                            onChange={(e) => handleFeatureChange(planIdx, featIdx, "iconPng", e.target.value)}
                            placeholder="PNG İkon URL..."
                            className="w-28 bg-transparent text-[10px] text-white/80 outline-none"
                          />
                        </div>
                        <button onClick={() => removeFeature(planIdx, featIdx)} className="text-red-400 p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 2: HERO SLIDER DÜZENLEME --- */}
        {activeTab === "slides" && (
          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-[24px] font-black text-white">Hero Slayt Yönetimi</h2>
              <p className="text-[13px] text-white/60">Ana sayfadaki 3 adet slider slayt metinlerini ve butonlarını düzenleyin.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {slidesState.map((slide, slideIdx) => (
                <div key={slide.id} className="rounded-3xl border border-white/15 bg-[#18181f] p-6 space-y-3">
                  <span className="text-[12px] font-extrabold text-[#00a8c4]">Slayt #{slideIdx + 1}</span>

                  <div>
                    <label className="text-[11px] font-bold text-white/70">Rozet Metni</label>
                    <input
                      type="text"
                      value={slide.badge}
                      onChange={(e) => handleSlideChange(slideIdx, "badge", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70">Başlık</label>
                    <textarea
                      rows={2}
                      value={slide.title}
                      onChange={(e) => handleSlideChange(slideIdx, "title", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-[12px] font-extrabold text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70">Açıklama</label>
                    <textarea
                      rows={3}
                      value={slide.desc}
                      onChange={(e) => handleSlideChange(slideIdx, "desc", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-[12px] font-medium text-white/80"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-white/70">1. Buton Metni</label>
                      <input
                        type="text"
                        value={slide.primaryCtaText}
                        onChange={(e) => handleSlideChange(slideIdx, "primaryCtaText", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-2.5 py-1.5 text-[12px] font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70">2. Buton Metni</label>
                      <input
                        type="text"
                        value={slide.secondaryCtaText}
                        onChange={(e) => handleSlideChange(slideIdx, "secondaryCtaText", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-2.5 py-1.5 text-[12px] font-bold text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: HİZMETLER VE AVCI LABS --- */}
        {activeTab === "services" && (
          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-[24px] font-black text-white">Hizmet sekmeleri</h2>
              <p className="text-[13px] text-white/60">5 ana hizmet sekmesinin metinlerini ve rozetlerini düzenleyin.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {servicesState.map((serv, servIdx) => (
                <div key={serv.id} className="rounded-3xl border border-white/15 bg-[#18181f] p-6 space-y-3">
                  <span className="text-[12px] font-extrabold text-[#38bdf8]">Hizmet Sekmesi #{servIdx + 1}</span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Başlık</label>
                      <input
                        type="text"
                        value={serv.title}
                        onChange={(e) => handleServiceChange(servIdx, "title", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-extrabold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Rozet</label>
                      <input
                        type="text"
                        value={serv.badge}
                        onChange={(e) => handleServiceChange(servIdx, "badge", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70">Alt Başlık</label>
                    <input
                      type="text"
                      value={serv.subtitle}
                      onChange={(e) => handleServiceChange(servIdx, "subtitle", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-[#00a8c4]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70">Açıklama</label>
                    <textarea
                      rows={2}
                      value={serv.desc}
                      onChange={(e) => handleServiceChange(servIdx, "desc", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-[12px] font-medium text-white/80"
                    />
                  </div>

                  {serv.id === "yazilim" && (
                    <div>
                      <label className="text-[11px] font-bold text-[#3ec8dc]">Dış bağlantı URL (isteğe bağlı)</label>
                      <input
                        type="text"
                        value={serv.externalUrl || ""}
                        onChange={(e) => handleServiceChange(servIdx, "externalUrl", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#00a8c4] bg-black/40 px-3 py-2 text-[12px] font-extrabold text-[#3ec8dc]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 4: SEKTÖR SAYFALARI --- */}
        {activeTab === "sectors" && (
          <div className="mt-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-black text-white">Sektör sayfaları</h2>
                <p className="text-[13px] text-white/60">Taksi, nakliyat, klinik ve servis sayfalarını tek ekrandan düzenleyin.</p>
              </div>

              <button
                onClick={addNewSector}
                className="flex items-center gap-2 rounded-xl bg-[#10b981] px-5 py-2.5 text-[14px] font-extrabold text-white hover:bg-[#059669] cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Yeni Sektör Ekle
              </button>
            </div>

            <div className="space-y-6">
              {sectorsState.map((sector, sectorIdx) => (
                <div key={sector.id} className="rounded-3xl border border-white/15 bg-[#18181f] p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[12px] font-extrabold text-[#00a8c4] uppercase">Sektör #{sectorIdx + 1}</span>
                    <div className="flex items-center gap-2"><Link to={`/demo/${sector.slug === "taxi" ? "taksi" : sector.slug}`} target="_blank" className="inline-flex items-center gap-1 rounded-lg border border-[#00a8c4]/40 px-2.5 py-1.5 text-[9px] font-black text-[#3ec8dc]">Demo dosyasını aç <ExternalLink className="h-3 w-3" /></Link><button onClick={() => removeSector(sectorIdx)} className="text-red-400 p-1 hover:bg-white/10 rounded-lg"><Trash2 className="h-4 w-4" /></button></div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-[10px] font-bold text-white/45">Dosya/rota adresi: <span className="text-[#7ee0ec]">/demo/{sector.slug === "taxi" ? "taksi" : sector.slug}</span> · Subdomain kullanılmaz.</div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Başlık</label>
                      <input
                        type="text"
                        value={sector.title}
                        onChange={(e) => handleSectorChange(sectorIdx, "title", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-extrabold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Üst etiket</label>
                      <input
                        type="text"
                        value={sector.eyebrow}
                        onChange={(e) => handleSectorChange(sectorIdx, "eyebrow", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Slug</label>
                      <input
                        type="text"
                        value={sector.slug}
                        onChange={(e) => handleSectorChange(sectorIdx, "slug", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70">CTA metni</label>
                      <input
                        type="text"
                        value={sector.cta}
                        onChange={(e) => handleSectorChange(sectorIdx, "cta", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70">Kısa açıklama</label>
                    <textarea
                      rows={2}
                      value={sector.description}
                      onChange={(e) => handleSectorChange(sectorIdx, "description", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-[12px] font-medium text-white/80"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70">Ana başlık</label>
                    <textarea
                      rows={2}
                      value={sector.headline}
                      onChange={(e) => handleSectorChange(sectorIdx, "headline", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-[12px] font-extrabold text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Primary renk</label>
                      <input
                        type="color"
                        value={sector.theme.primary}
                        onChange={(e) => {
                          const next = { ...sector.theme, primary: e.target.value };
                          handleSectorChange(sectorIdx, "theme", next);
                        }}
                        className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-black/40 px-2"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Soft renk</label>
                      <input
                        type="color"
                        value={sector.theme.soft}
                        onChange={(e) => {
                          const next = { ...sector.theme, soft: e.target.value };
                          handleSectorChange(sectorIdx, "theme", next);
                        }}
                        className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-black/40 px-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Demo rozet metni</label>
                      <input
                        type="text"
                        value={sector.demoBadge || "Demo"}
                        onChange={(e) => handleSectorChange(sectorIdx, "demoBadge", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Demo accent</label>
                      <input
                        type="color"
                        value={sector.demoAccent || sector.theme.primary}
                        onChange={(e) => handleSectorChange(sectorIdx, "demoAccent", e.target.value)}
                        className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-black/40 px-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70">Demo görsel URL</label>
                    <input
                      type="text"
                      value={sector.demoImage || ""}
                      onChange={(e) => handleSectorChange(sectorIdx, "demoImage", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70">Pain point metni</label>
                    <textarea
                      rows={2}
                      value={sector.pain}
                      onChange={(e) => handleSectorChange(sectorIdx, "pain", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-[12px] font-medium text-white/80"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70">Öneri metni</label>
                    <textarea
                      rows={2}
                      value={sector.offer}
                      onChange={(e) => handleSectorChange(sectorIdx, "offer", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-[12px] font-medium text-white/80"
                    />
                  </div>

                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#3ec8dc]">Hero point'ler</span>
                      <button onClick={() => addSectorItem("heroPoints", sectorIdx)} className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-white">Ekle</button>
                    </div>
                    {sector.heroPoints.map((point, pointIdx) => (
                      <div key={`${sector.id}-hero-${pointIdx}`} className="flex gap-2">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => handleSectorListChange(sectorIdx, "heroPoints", pointIdx, e.target.value)}
                          className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                        />
                        <button onClick={() => removeSectorItem("heroPoints", sectorIdx, pointIdx)} className="rounded-xl border border-red-400/40 px-2 text-red-300">Sil</button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#3ec8dc]">Anahtar kelimeler</span>
                      <button onClick={() => addSectorItem("keywords", sectorIdx)} className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-white">Ekle</button>
                    </div>
                    {sector.keywords.map((keyword, keywordIdx) => (
                      <div key={`${sector.id}-keyword-${keywordIdx}`} className="flex gap-2">
                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) => handleSectorListChange(sectorIdx, "keywords", keywordIdx, e.target.value)}
                          className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                        />
                        <button onClick={() => removeSectorItem("keywords", sectorIdx, keywordIdx)} className="rounded-xl border border-red-400/40 px-2 text-red-300">Sil</button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#3ec8dc]">Plan maddeleri</span>
                      <button onClick={() => addSectorItem("plan", sectorIdx)} className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-white">Ekle</button>
                    </div>
                    {sector.plan.map((item, itemIdx) => (
                      <div key={`${sector.id}-plan-${itemIdx}`} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleSectorListChange(sectorIdx, "plan", itemIdx, e.target.value)}
                          className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                        />
                        <button onClick={() => removeSectorItem("plan", sectorIdx, itemIdx)} className="rounded-xl border border-red-400/40 px-2 text-red-300">Sil</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 5: REFERANSLAR --- */}
        {activeTab === "references" && (
          <div className="mt-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-black text-white">Referans Yönetimi</h2>
                <p className="text-[13px] text-white/60">Müşteri başarı hikayelerini ve ciro metriklerini düzenleyin.</p>
              </div>

              <button
                onClick={addNewReference}
                className="flex items-center gap-2 rounded-xl bg-[#10b981] px-5 py-2.5 text-[14px] font-extrabold text-white hover:bg-[#059669] cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Yeni Referans Ekle
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {refsState.map((ref, refIdx) => (
                <div key={ref.id + refIdx} className="rounded-3xl border border-white/15 bg-[#18181f] p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[12px] font-extrabold text-[#10b981]">Referans Marka #{refIdx + 1}</span>
                    <button onClick={() => removeReference(refIdx)} className="text-red-400 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Marka Adı</label>
                      <input
                        type="text"
                        value={ref.name}
                        onChange={(e) => handleRefChange(refIdx, "name", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-extrabold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Başarı Skoru/Ciro</label>
                      <input
                        type="text"
                        value={ref.result}
                        onChange={(e) => handleRefChange(refIdx, "result", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-black text-[#00a8c4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-white/70">Müşteri Sözü (Quote)</label>
                    <textarea
                      rows={2}
                      value={ref.quote}
                      onChange={(e) => handleRefChange(refIdx, "quote", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-[12px] font-medium text-white/80"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Müşteri Yetkilisi</label>
                      <input
                        type="text"
                        value={ref.author}
                        onChange={(e) => handleRefChange(refIdx, "author", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/70">Unvan</label>
                      <input
                        type="text"
                        value={ref.role}
                        onChange={(e) => handleRefChange(refIdx, "role", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white/80"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 5: GENEL AYARLAR --- */}
        {activeTab === "settings" && (
          <div className="mt-8 max-w-2xl mx-auto rounded-3xl border border-white/15 bg-[#18181f] p-8 shadow-xl space-y-5">
            <h2 className="text-[22px] font-black text-white">Logo, iletişim ve header ayarları</h2>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-4">
              <p className="text-[13px] font-extrabold uppercase tracking-wider text-[#3ec8dc]">Logo</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-4 flex items-center justify-center min-h-[88px]">
                  <SiteLogo variant="header" preview={settingsState} />
                </div>
                <div className="rounded-xl bg-black p-4 flex items-center justify-center min-h-[88px] border border-white/10">
                  <SiteLogo variant="onDark" preview={settingsState} />
                </div>
              </div>
              <p className="text-[11px] text-white/50">Sol: açık zemin (menü/footer) · Sağ: koyu zemin (destek alanı)</p>

              <div>
                <label className="text-[12px] font-bold text-white/70">Logo dosyası veya URL</label>
                <input
                  type="text"
                  value={settingsState.logoUrl}
                  placeholder="Boş bırakırsan varsayılan Hatay360 logosu kullanılır"
                  onChange={(e) => setSettingsState({ ...settingsState, logoUrl: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[13px] font-bold text-white"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-xl bg-[#00a8c4] px-4 py-2 text-[12px] font-bold text-white">
                    Bilgisayardan yükle
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > MAX_LOGO_FILE_BYTES) {
                          alert("Logo dosyası en fazla 10 MB olabilir.");
                          e.target.value = "";
                          return;
                        }
                        setLogoUploadNotice("Logo hazırlanıyor…");
                        try {
                          const processed = await processLogoFile(file);
                          setSettingsState((prev) => ({ ...prev, logoUrl: processed.dataUrl }));
                          setLogoUploadNotice(
                            `PNG hazır: ${processed.originalWidth}×${processed.originalHeight}px → ${processed.width}×${processed.height}px`,
                          );
                        } catch (error) {
                          const message = error instanceof Error ? error.message : "Logo işlenemedi.";
                          setLogoUploadNotice(message);
                          alert(message);
                        } finally {
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                  <span className="self-center text-[10px] font-semibold text-white/45">PNG, JPG, WebP veya SVG · en fazla 10 MB</span>
                  <button
                    type="button"
                    onClick={() => setSettingsState({ ...settingsState, logoUrl: "" })}
                    className="rounded-xl border border-white/20 px-4 py-2 text-[12px] font-bold text-white/80 hover:bg-white/10"
                  >
                    Varsayılan logoya dön
                  </button>
                </div>
                <p className="mt-2 text-[10px] font-semibold text-[#7ee0ec]">
                  {logoUploadNotice || "Yüklenen logo otomatik kırpılır, oranı korunur ve PNG formatına dönüştürülür."}
                </p>
              </div>

              <div>
                <label className="text-[12px] font-bold text-white/70">
                  Menü yüksekliği: {settingsState.logoHeight}px
                </label>
                <input
                  type="range"
                  min={24}
                  max={64}
                  value={settingsState.logoHeight ?? 36}
                  onChange={(e) => setSettingsState({ ...settingsState, logoHeight: Number(e.target.value) })}
                  className="mt-1 w-full accent-[#00a8c4]"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-white/70">
                  Footer yüksekliği: {settingsState.logoFooterHeight}px
                </label>
                <input
                  type="range"
                  min={28}
                  max={72}
                  value={settingsState.logoFooterHeight}
                  onChange={(e) => setSettingsState({ ...settingsState, logoFooterHeight: Number(e.target.value) })}
                  className="mt-1 w-full accent-[#00a8c4]"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-white/70">
                  Koyu zemin yüksekliği: {settingsState.logoDarkHeight}px
                </label>
                <input
                  type="range"
                  min={32}
                  max={80}
                  value={settingsState.logoDarkHeight}
                  onChange={(e) => setSettingsState({ ...settingsState, logoDarkHeight: Number(e.target.value) })}
                  className="mt-1 w-full accent-[#00a8c4]"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-white/70">Açık zeminde arka plan</label>
                <select
                  value={settingsState.logoBackground}
                  onChange={(e) =>
                    setSettingsState({
                      ...settingsState,
                      logoBackground: e.target.value === "none" ? "none" : "black",
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[13px] font-bold text-white"
                >
                  <option value="black">Siyah kutu (beyaz 360 yazısı için önerilir)</option>
                  <option value="none">Arka plan yok</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-bold text-white/70">
                  İç boşluk: {settingsState.logoPadding}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={settingsState.logoPadding}
                  onChange={(e) => setSettingsState({ ...settingsState, logoPadding: Number(e.target.value) })}
                  className="mt-1 w-full accent-[#00a8c4]"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-white/70">
                  Köşe yuvarlaklığı: {settingsState.logoRadius}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={settingsState.logoRadius}
                  onChange={(e) => setSettingsState({ ...settingsState, logoRadius: Number(e.target.value) })}
                  className="mt-1 w-full accent-[#00a8c4]"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-white/70">Site Başlığı</label>
              <input
                type="text"
                value={settingsState.siteTitle}
                onChange={(e) => setSettingsState({ ...settingsState, siteTitle: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] font-bold text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-white/70">Telefon Numarası</label>
                <input
                  type="text"
                  value={settingsState.phone}
                  onChange={(e) => setSettingsState({ ...settingsState, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-white/70">E-Posta Adresi</label>
                <input
                  type="text"
                  value={settingsState.email}
                  onChange={(e) => setSettingsState({ ...settingsState, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] font-bold text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-white/70">Adres</label>
              <input
                type="text"
                value={settingsState.address}
                onChange={(e) => setSettingsState({ ...settingsState, address: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] font-bold text-white"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-white/70">Özel yazılım / otomasyon bağlantısı</label>
              <input
                type="text"
                value={settingsState.avciLabsUrl}
                onChange={(e) => setSettingsState({ ...settingsState, avciLabsUrl: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#00a8c4] bg-black/40 px-3 py-2.5 text-[14px] font-extrabold text-[#3ec8dc]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-white/70">Header Buton Metni</label>
                <input
                  type="text"
                  value={settingsState.headerCtaText}
                  onChange={(e) => setSettingsState({ ...settingsState, headerCtaText: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-white/70">Header Buton Linki</label>
                <input
                  type="text"
                  value={settingsState.headerCtaHref}
                  onChange={(e) => setSettingsState({ ...settingsState, headerCtaHref: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] font-bold text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-white/70">Asistan bot adı</label>
                <input
                  type="text"
                  value={settingsState.mascotName}
                  onChange={(e) => setSettingsState({ ...settingsState, mascotName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] font-bold text-white"
                />
              </div>
              <label className="mt-6 flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[13px] font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={sectionOn(settingsState, "mascot")}
                  onChange={(e) =>
                    setSettingsState({
                      ...settingsState,
                      mascotActive: e.target.checked,
                      homeSections: { ...DEFAULT_HOME_SECTIONS, ...settingsState.homeSections, mascot: e.target.checked },
                    })
                  }
                  className="h-4 w-4 accent-[#00a8c4]"
                />
                Sitede botu göster
              </label>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Anasayfa / site blokları</p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/50">
                Fazla bloklar gizlenir, silinmez. Kapalı olanı buradan tekrar açabilirsiniz.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {HOME_SECTION_OPTIONS.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-[12px] font-bold text-white/90 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sectionOn(settingsState, item.id)}
                      onChange={(e) =>
                        setSettingsState({
                          ...settingsState,
                          mascotActive: item.id === "mascot" ? e.target.checked : settingsState.mascotActive,
                          homeSections: {
                            ...DEFAULT_HOME_SECTIONS,
                            ...settingsState.homeSections,
                            [item.id]: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 accent-[#00a8c4]"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <AdminSeoPanel settings={settingsState} onChange={setSettingsState} />
        )}
      </div>
    </div>
  );
}
