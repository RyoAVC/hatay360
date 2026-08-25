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
  settingOn,
  turkishContentError,
  type VisibilityFlag,
} from "../context/content-context";
import { isAutoFeatureIcon, suggestFeatureIcon } from "../lib/feature-icon-suggest";
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
  LayoutGrid,
  LogOut,
  Search,
  BarChart3,
  Download,
  Upload,
  ShieldAlert,
  ClipboardList,
  Users,
  MessageSquareText,
  Smartphone,
  Monitor,
  Building2,
  ShieldCheck,
  ClipboardCheck,
  CalendarClock,
  History,
  PenLine,
  Gift,
  ShoppingBag,
  TrendingUp,
  Plug,
  Inbox,
  Wand2,
  Sparkles,
  Menu,
  X,
  Globe,
  SlidersHorizontal,
  Scale,
  Handshake,
  Headphones,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import { SiteLogo } from "../components/site-logo";
import { AdminSeoPanel } from "./admin-seo-panel";
import { AdminInsightsPanel } from "./admin-insights-panel";
import { AdminCustomerPanel } from "./admin-customer-panel";
import { AdminSignupsPanel } from "./admin-signups-panel";
import { AdminSecurityPanel } from "./admin-security-panel";
import { AdminApprovalsPanel } from "../components/admin-approvals-panel";
import { AdminQuotesPanel } from "../components/admin-quotes-panel";
import { AdminRenewalsPanel } from "../components/admin-renewals-panel";
import { AdminAuditPanel } from "../components/admin-audit-panel";
import { AdminReferralsPanel } from "../components/admin-referrals-panel";
import { AdminExtrasPanel } from "../components/admin-extras-panel";
import { AdminSeoTrackPanel } from "../components/admin-seo-track-panel";
import { AdminConnectionsPanel } from "../components/admin-connections-panel";
import { AdminSiteGeneratorPanel } from "../components/admin-site-generator";
import { AdminOpsAlertsBar, opsNavBadge, opsTargetTab, useAdminOpsAlerts, type OpsAlertTarget } from "../components/admin-ops-alerts";
import { AdminInboxPanel, useAdminInbox } from "../components/admin-inbox-panel";
import { AdminCorporatePanel } from "../components/admin-corporate-panel";
import { AdminBayilikSartlariPanel } from "../components/admin-bayilik-sartlari-panel";
import { MAX_LOGO_FILE_BYTES, processLogoFile } from "../lib/logo-image";
import { sanitizePhoneInput, normalizeSupportHours, DEFAULT_SUPPORT_WEEKDAY_HOURS } from "../lib/contact";
import { emptyLoginBanner, bannerMediaUrl, type LoginPromoBanner } from "../lib/login-promo";
import { AdminHeroSlidesPanel } from "../components/admin-hero-slides-panel";
import { AdminPartnerSupportPanel } from "../components/admin-partner-support-panel";
import { AttentionEffectPicker, MediaFileField } from "../components/attention-effect-picker";
import type { AttentionEffectId } from "../lib/attention-effects";
import { playNotificationSound } from "../lib/notification-sound";
import { apiRequest } from "../lib/api";

type AdminHeaderChrome = {
  showReset: boolean;
  showLogout: boolean;
  showLive: boolean;
  showSaveStatus: boolean;
  showDbStatus: boolean;
  showSubtitle: boolean;
};

const ADMIN_HEADER_PREF_KEY = "hatay360_admin_header_v1";
const DEFAULT_ADMIN_HEADER_CHROME: AdminHeaderChrome = {
  showReset: false,
  showLogout: true,
  showLive: true,
  showSaveStatus: true,
  showDbStatus: false,
  showSubtitle: false,
};

function readAdminHeaderChrome(): AdminHeaderChrome {
  try {
    const raw = localStorage.getItem(ADMIN_HEADER_PREF_KEY);
    if (!raw) return { ...DEFAULT_ADMIN_HEADER_CHROME };
    const parsed = JSON.parse(raw) as Partial<AdminHeaderChrome>;
    return { ...DEFAULT_ADMIN_HEADER_CHROME, ...parsed };
  } catch {
    return { ...DEFAULT_ADMIN_HEADER_CHROME };
  }
}

type AdminTab =
  | "inbox"
  | "insights"
  | "signups"
  | "customers"
  | "tickets"
  | "partnerSupport"
  | "approvals"
  | "quotes"
  | "renewals"
  | "extras"
  | "referrals"
  | "seoTrack"
  | "audit"
  | "security"
  | "connections"
  | "sites"
  | "plans"
  | "slides"
  | "services"
  | "sectors"
  | "references"
  | "settings"
  | "corporate"
  | "bayilikSartlari"
  | "seo";

const ADMIN_NAV: { group: string; items: { id: AdminTab; label: string; icon: typeof Settings }[] }[] = [
  {
    group: "Operasyon",
    items: [
      { id: "inbox", label: "Bekleyen işler", icon: Inbox },
      { id: "insights", label: "Metrikler", icon: BarChart3 },
      { id: "customers", label: "Müşteriler", icon: Users },
      { id: "tickets", label: "Ticket / sıra", icon: MessageSquareText },
      { id: "partnerSupport", label: "Bayi destek", icon: Headphones },
      { id: "approvals", label: "Onay Takibi", icon: ClipboardCheck },
      { id: "quotes", label: "Teklifler", icon: PenLine },
      { id: "renewals", label: "Yenilemeler", icon: CalendarClock },
      { id: "extras", label: "Ek Hizmetler", icon: ShoppingBag },
      { id: "seoTrack", label: "SEO Takip", icon: TrendingUp },
      { id: "referrals", label: "Tavsiyeler", icon: Gift },
      { id: "signups", label: "Kayıtlar & SMS", icon: ClipboardList },
      { id: "audit", label: "Aktivite Kaydı", icon: History },
      { id: "security", label: "Güvenlik", icon: ShieldCheck },
      { id: "connections", label: "Bağlantılar", icon: Plug },
    ],
  },
  {
    group: "Müşteri siteleri",
    items: [{ id: "sites", label: "Site Üretici", icon: Globe }],
  },
  {
    group: "Site içeriği",
    items: [
      { id: "plans", label: "Paketler", icon: Package },
      { id: "slides", label: "Hero Slider", icon: LayoutGrid },
      { id: "services", label: "Hizmetler", icon: Layers },
      { id: "sectors", label: "Sektör sayfaları", icon: Building2 },
      { id: "references", label: "Referanslar", icon: Star },
    ],
  },
  {
    group: "Yayın",
    items: [
      { id: "settings", label: "Site ayarları", icon: Settings },
      { id: "corporate", label: "Kurumsal / Yasal", icon: Scale },
      { id: "bayilikSartlari", label: "Bayilik şartları", icon: Handshake },
      { id: "seo", label: "SEO", icon: Search },
    ],
  },
];

const VISIBILITY_COLUMNS: { title: string; hint: string; flags: { key: VisibilityFlag; label: string }[] }[] = [
  {
    title: "Mobil",
    hint: "Telefon ekranı",
    flags: [
      { key: "stickyWhatsAppMobile", label: "WhatsApp" },
      { key: "stickyPhoneMobile", label: "Telefon" },
      { key: "botMobile", label: "Bot" },
    ],
  },
  {
    title: "Bilgisayar (PC)",
    hint: "Masaüstü ve tablet",
    flags: [
      { key: "stickyWhatsAppDesktop", label: "WhatsApp" },
      { key: "stickyPhoneDesktop", label: "Telefon" },
      { key: "botDesktop", label: "Bot" },
    ],
  },
];

type WizardTier = "ucuz" | "orta" | "pahali";
type WizardKind = "ads" | "store";

const WIZARD_TIER_LABEL: Record<WizardTier, string> = {
  ucuz: "Ucuz (Başlangıç)",
  orta: "Orta (Profesyonel)",
  pahali: "Pahalı (VIP)",
};

/** Admin paket sihirbazı: ucuz/orta/pahalı ve reklam/web için tutarlı, düzenlenebilir taslak paket üretir.
 *  Üretilen fiyatlar örnek/taslaktır; admin kaydetmeden yayına çıkmaz. Reklam paketlerinde medya bütçesi ayrıdır. */
function buildWizardPlan(kind: WizardKind, tier: WizardTier): Plan {
  const id = `${kind}_${tier}_${Date.now()}`;
  const money = (n: number) => "₺" + n.toLocaleString("tr-TR");
  const perMonth = (n: number) => "₺" + Math.round(n / 12).toLocaleString("tr-TR") + " / ay";

  if (kind === "ads") {
    const presets: Record<WizardTier, Plan> = {
      ucuz: {
        id,
        name: "Başlangıç Reklam",
        badge: "Yeni işletmeler için",
        oldPrice: money(12900),
        price: money(8900),
        monthlyPrice: perMonth(8900),
        installments: "12 Taksit İmkânı",
        desc: "Tek platformda Google Ads ile ilk çağrıları ve talepleri toplamak isteyen küçük işletmeler için.",
        cta: "Reklama Başla",
        kind: "ads",
        effectStyle: "none",
        effectText: "",
        features: [
          { text: "Google Ads kurulumu ve 1 kampanya (medya bütçesi ayrı)" },
          { text: "Anahtar kelime ve hedef bölge kurulumu" },
          { text: "Aylık performans raporu" },
          { text: "WhatsApp destek" },
        ],
        pills: [
          { text: "Google Ads", color: "#0ea5e9" },
          { text: "Yerel", color: "#22c55e" },
        ],
      },
      orta: {
        id,
        name: "Profesyonel Reklam",
        badge: "En çok tercih edilen",
        oldPrice: money(24900),
        price: money(16900),
        monthlyPrice: perMonth(16900),
        installments: "12 Taksit İmkânı",
        desc: "Google + Meta reklamları, landing page ve düzenli optimizasyon ile büyümek isteyen işletmeler için.",
        cta: "Teklif Al",
        kind: "ads",
        featured: true,
        effectStyle: "neon",
        effectText: "En çok tercih",
        features: [
          { text: "Google Ads + Meta yönetimi (medya bütçesi ayrı)" },
          { text: "Landing page kurulumu ve dönüşüm takibi" },
          { text: "2 haftada bir optimizasyon" },
          { text: "Aylık detaylı rapor ve strateji" },
          { text: "Öncelikli WhatsApp destek" },
        ],
        pills: [
          { text: "Google + Meta", color: "#6366f1" },
          { text: "Landing", color: "#8b5cf6" },
          { text: "Optimizasyon", color: "#f59e0b" },
        ],
      },
      pahali: {
        id,
        name: "VIP Büyüme Reklamı",
        badge: "Maksimum görünürlük",
        oldPrice: money(49900),
        price: money(34900),
        monthlyPrice: perMonth(34900),
        installments: "12 Taksit İmkânı",
        desc: "Google, Meta ve SEO'yu birlikte yöneten, haftalık optimizasyon ve özel danışmanlık isteyen markalar için.",
        cta: "VIP Görüşme Planla",
        kind: "ads",
        effectStyle: "gold",
        effectText: "VIP fırsat",
        features: [
          { text: "Google Ads + Meta + SEO birlikte planlama (medya bütçesi ayrı)" },
          { text: "Özel landing page + A/B testleri" },
          { text: "Haftalık optimizasyon ve strateji toplantısı" },
          { text: "İlçe bazlı hedefleme ve segmentasyon" },
          { text: "Özel hesap yöneticisi ve öncelikli destek" },
        ],
        pills: [
          { text: "Full Funnel", color: "#eab308" },
          { text: "Haftalık", color: "#14b8a6" },
          { text: "Danışmanlık", color: "#8b5cf6" },
        ],
      },
    };
    return presets[tier];
  }

  const presets: Record<WizardTier, Plan> = {
    ucuz: {
      id,
      name: "Web Başlangıç",
      badge: "Kurumsal web",
      oldPrice: money(14900),
      price: money(9900),
      monthlyPrice: perMonth(9900),
      installments: "12 Taksit İmkânı",
      desc: "Mobil uyumlu kurumsal web sitesi, SSL ve iletişim formu ile profesyonel dijital vitrin.",
      cta: "Web Sitesi Aç",
      kind: "store",
      effectStyle: "none",
      effectText: "",
      features: [
        { text: "Mobil uyumlu kurumsal web tasarımı" },
        { text: "5 sayfaya kadar içerik" },
        { text: "Ücretsiz SSL sertifikası" },
        { text: "İletişim formu ve harita" },
        { text: "Panel eğitimi" },
      ],
      pills: [{ text: "SSL", color: "#22c55e" }],
    },
    orta: {
      id,
      name: "Web + E-ticaret",
      badge: "Web + mağaza",
      oldPrice: money(34900),
      price: money(24900),
      monthlyPrice: perMonth(24900),
      installments: "12 Taksit İmkânı",
      desc: "Özel vitrin, katalog, sanal POS ve SSL. Kendi sitenizden satış; reklam paketi ayrıdır.",
      cta: "Mağaza Aç",
      kind: "store",
      featured: true,
      effectStyle: "ice",
      effectText: "Web + satış",
      features: [
        { text: "Mobil uyumlu web tasarım ve vitrin" },
        { text: "Anahtar teslim e-ticaret altyapısı" },
        { text: "Sanal POS & ödeme altyapısı (iyzico)" },
        { text: "1.000 ürüne kadar performans" },
        { text: "Ücretsiz panel eğitimi" },
      ],
      pills: [
        { text: "iyzico", color: "#1e3a8a" },
        { text: "Katalog", color: "#0ea5e9" },
      ],
    },
    pahali: {
      id,
      name: "VIP Kurumsal Mağaza",
      badge: "Web + mağaza + entegrasyon",
      oldPrice: money(69900),
      price: money(49900),
      monthlyPrice: perMonth(49900),
      installments: "12 Taksit İmkânı",
      desc: "Yüksek performanslı kurumsal mağaza, gelişmiş entegrasyonlar ve öncelikli destek. Pazarla pazaryeri entegrasyonu ayrı üründür.",
      cta: "VIP Mağaza Kur",
      kind: "store",
      effectStyle: "cosmic",
      effectText: "VIP mağaza",
      features: [
        { text: "Özel tasarım kurumsal mağaza" },
        { text: "Sınırsız ürün ve gelişmiş katalog" },
        { text: "Sanal POS + kargo entegrasyonu" },
        { text: "Pazarla pazaryeri entegrasyonu (ayrı ürün)" },
        { text: "Öncelikli bakım ve destek" },
      ],
      pills: [
        { text: "Entegrasyon", color: "#8b5cf6" },
        { text: "Öncelikli", color: "#eab308" },
      ],
    },
  };
  return presets[tier];
}

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

  const [activeTab, setActiveTab] = useState<AdminTab>("insights");
  const [partnerSupportUnread, setPartnerSupportUnread] = useState(0);
  const previousPartnerSupportUnread = useRef<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [headerChrome, setHeaderChrome] = useState<AdminHeaderChrome>(() => readAdminHeaderChrome());
  const [headerChromeOpen, setHeaderChromeOpen] = useState(false);
  const activeNavItem = ADMIN_NAV.flatMap((section) => section.items).find((item) => item.id === activeTab);
  const selectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  useEffect(() => {
    const checkPartnerSupport = async () => {
      try {
        const data = await apiRequest<{ unread: number }>("/api/admin/partner-support/unread");
        if (previousPartnerSupportUnread.current !== null && data.unread > previousPartnerSupportUnread.current) playNotificationSound("admin");
        previousPartnerSupportUnread.current = data.unread;
        setPartnerSupportUnread(data.unread);
      } catch { /* Admin oturumu hazır olunca yeniden denenir. */ }
    };
    void checkPartnerSupport(); const timer = window.setInterval(() => void checkPartnerSupport(), 10000); return () => window.clearInterval(timer);
  }, []);

  const [plansState, setPlansState] = useState<Plan[]>(plans);
  const [slidesState, setSlidesState] = useState<Slide[]>(slides);
  const [servicesState, setServicesState] = useState<EcosystemService[]>(services);
  const [sectorsState, setSectorsState] = useState<SectorItem[]>(sectors);
  const [refsState, setRefsState] = useState<ReferenceItem[]>(references);
  const [settingsState, setSettingsState] = useState<SiteSettings>(settings);

  const [saveToast, setSaveToast] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { alerts: opsAlerts, loading: opsLoading, error: opsError, reload: reloadOps } = useAdminOpsAlerts();
  const { items: inboxItems, loading: inboxLoading, error: inboxError, reload: reloadInbox } = useAdminInbox();
  const [opsJump, setOpsJump] = useState<{ target: OpsAlertTarget; token: number } | null>(null);
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
    const current = newFeatures[featureIndex];
    if (field === "text") {
      const suggested = suggestFeatureIcon(value);
      const keepManual = Boolean(current.iconPng) && !isAutoFeatureIcon(current.iconPng);
      newFeatures[featureIndex] = {
        ...current,
        text: value,
        iconPng: keepManual ? current.iconPng : suggested || "",
      };
    } else {
      newFeatures[featureIndex] = { ...current, iconPng: value };
    }
    newPlans[planIndex].features = newFeatures;
    setPlansState(newPlans);
  };

  const applyFeatureIconSuggest = (planIndex: number, featureIndex: number) => {
    const newPlans = [...plansState];
    const newFeatures = [...newPlans[planIndex].features];
    const current = newFeatures[featureIndex];
    const suggested = suggestFeatureIcon(current.text);
    if (!suggested) return;
    newFeatures[featureIndex] = { ...current, iconPng: suggested };
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
      features: [{ text: "Google Ads / Meta yönetim (medya bütçesi ayrı)", iconPng: "" }],
    };
    setPlansState([...plansState, newPlan]);
  };

  const addWizardPlan = (kind: WizardKind, tier: WizardTier) => {
    setPlansState((current) => [...current, buildWizardPlan(kind, tier)]);
  };

  const removePlan = (index: number) => {
    const newPlans = [...plansState];
    newPlans.splice(index, 1);
    setPlansState(newPlans);
  };

  // --- SLAYT DÜZENLEME ---

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
      category: "webtasarim",
      categoryLabel: "Kurumsal web / reklam",
      sector: "Hatay",
      desc: "Web, reklam veya Google Maps çalışması. Rakamları siz yazın.",
      result: "Sonuç yazılı örnek değil",
      subResult: "Keşif sonrası netleşir",
      beforeAfter: "Önce / sonra notunu siz doldurun",
      rating: 5,
      quote: "Kısa müşteri cümlesini buraya yazın.",
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
    const normalizedSettings = {
      ...settingsState,
      supportWeekdayHours: normalizeSupportHours(settingsState.supportWeekdayHours, DEFAULT_SUPPORT_WEEKDAY_HOURS),
      supportSaturdayHours: normalizeSupportHours(settingsState.supportSaturdayHours, "", true),
    };
    setSettingsState(normalizedSettings);
    try {
      await saveAllContent({
        plans: plansState,
        slides: slidesState,
        services: servicesState,
        sectors: normalizedSectors,
        references: refsState,
        settings: normalizedSettings,
      });
      setSectorsState(normalizedSectors);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (error) {
      setSaveError(turkishContentError(error));
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
      setBackupNotice(turkishContentError(error));
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_HEADER_PREF_KEY, JSON.stringify(headerChrome));
    } catch {
      /* ignore */
    }
  }, [headerChrome]);

  const toggleHeaderChrome = (key: keyof AdminHeaderChrome) => {
    setHeaderChrome((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-white font-sans [background-image:radial-gradient(circle_at_75%_-10%,rgba(6,182,212,.13),transparent_30%),radial-gradient(circle_at_10%_30%,rgba(79,70,229,.08),transparent_26%)]">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090c13]/90 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,.22)] backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 shrink-0 items-center rounded-xl border border-white/[.07] bg-white/[.035] px-3">
              <SiteLogo variant="onDark" preview={{ logoDarkHeight: 28 }} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2"><h1 className="truncate text-[15px] font-black tracking-[-.02em] text-white sm:text-[17px]">Yönetim Konsolu</h1><span className="hidden rounded-md border border-cyan-300/15 bg-cyan-300/[.07] px-2 py-1 text-[8px] font-black uppercase tracking-[.16em] text-cyan-200 md:inline">Hatay360 OS</span></div>
              {headerChrome.showSubtitle ? (
                <p className="hidden truncate text-[11px] text-white/55 sm:block">Sayfalar, paketler ve site ayarları</p>
              ) : null}
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {headerChrome.showSaveStatus ? (
                  <p className={`text-[10px] font-bold ${hasUnsavedChanges ? "text-amber-300" : "text-emerald-300"}`}>
                    {hasUnsavedChanges ? "Kaydedilmemiş değişiklik" : "Kayıtlı"}
                  </p>
                ) : null}
                {headerChrome.showDbStatus ? (
                  <p className={`text-[10px] font-bold ${databaseStatus === "connected" ? "text-cyan-300" : databaseStatus === "loading" ? "text-white/45" : "text-red-300"}`}>
                    {databaseStatus === "connected" ? "DB bağlı" : databaseStatus === "loading" ? "DB…" : "DB yok"}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges || isSaving || databaseStatus !== "connected"}
              className="order-first flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00a8c4] to-[#3ec8dc] px-3 py-2 text-[12px] font-extrabold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 sm:px-4 sm:text-[13px]"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{isSaving ? "Kaydediliyor…" : "Kaydet"}</span>
              <span className="sm:hidden">{isSaving ? "…" : "Kaydet"}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileActionsOpen((open) => !open)}
              aria-expanded={mobileActionsOpen}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 py-2 text-[11px] font-black text-white lg:hidden"
            >
              {mobileActionsOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div className={`${mobileActionsOpen ? "absolute right-0 top-[calc(100%+8px)] z-50 flex w-[min(100vw-2rem,280px)] flex-col gap-2 rounded-2xl border border-white/15 bg-[#18181f] p-3 shadow-2xl" : "hidden"} lg:relative lg:top-auto lg:right-auto lg:z-auto lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-2 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
              {headerChrome.showLive ? (
                <Link
                  to="/"
                  onClick={(event) => {
                    if (hasUnsavedChanges && !window.confirm("Kaydedilmemiş değişiklikler var. Yine de canlı siteye geçmek istiyor musunuz?")) {
                      event.preventDefault();
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#00a8c4]/50 px-3 py-2 text-[12px] font-bold text-[#3ec8dc] transition hover:bg-[#00a8c4] hover:text-white"
                >
                  Canlı <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : null}

              {headerChrome.showReset ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm("Bu tarayıcıdaki tüm Hatay360 içeriklerini varsayılan değerlere döndürmek istiyor musunuz? Önce yedek almanız önerilir.")) {
                      try {
                        await resetAll();
                        window.location.reload();
                      } catch (error) {
                        setSaveError(turkishContentError(error));
                      }
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[12px] font-bold text-white/70 hover:bg-white/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Sıfırla
                </button>
              ) : null}

              {headerChrome.showLogout ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (hasUnsavedChanges && !window.confirm("Kaydedilmemiş değişiklikler var. Yine de çıkış yapmak istiyor musunuz?")) return;
                    await logout();
                    navigate("/panel/giris", { replace: true });
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[12px] font-bold text-white/70 hover:bg-white/10"
                >
                  <LogOut className="h-3.5 w-3.5" /> Çıkış
                </button>
              ) : null}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setHeaderChromeOpen((open) => !open)}
                  aria-expanded={headerChromeOpen}
                  title="Üst şerit öğelerini göster/gizle"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 py-2 text-[12px] font-bold text-white/60 hover:bg-white/10"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span className="lg:hidden">Üst şerit</span>
                </button>
                {headerChromeOpen ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-[60] w-56 rounded-2xl border border-white/15 bg-[#12121a] p-3 shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-wide text-white/40">Üst şeritte göster</p>
                    <p className="mt-1 text-[10px] text-white/35">Kaydet her zaman görünür kalır.</p>
                    <div className="mt-2 space-y-1.5">
                      {(
                        [
                          ["showLive", "Canlı site"],
                          ["showLogout", "Çıkış"],
                          ["showReset", "Sıfırla"],
                          ["showSaveStatus", "Kayıt durumu"],
                          ["showDbStatus", "Veritabanı durumu"],
                          ["showSubtitle", "Alt açıklama"],
                        ] as const
                      ).map(([key, label]) => (
                        <label key={key} className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[12px] font-bold text-white/80 hover:bg-white/5">
                          <span>{label}</span>
                          <input
                            type="checkbox"
                            checked={headerChrome[key]}
                            onChange={() => toggleHeaderChrome(key)}
                            className="h-3.5 w-3.5 accent-[#00a8c4]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      {contentError && (
        <div className="border-b border-red-400/20 bg-red-950/70 px-6 py-2 text-center text-[12px] font-bold text-red-100">
          {contentError}
        </div>
      )}

      <section className="border-b border-slate-800/70 bg-[#0c1018] px-6 py-2.5">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="flex max-w-2xl items-start gap-2 text-[11px] leading-relaxed text-slate-400">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
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

      <AdminOpsAlertsBar
        alerts={opsAlerts}
        loading={opsLoading}
        error={opsError}
        onNavigate={(target) => {
          setOpsJump({ target, token: Date.now() });
          setActiveTab(opsTargetTab(target));
        }}
        onRefresh={reloadOps}
      />

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

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start xl:gap-8">
        <button
          type="button"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-expanded={mobileNavOpen}
          className="sticky top-[68px] z-40 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#18181f] px-4 py-3 text-left text-[13px] font-black text-white shadow-lg lg:hidden"
        >
          <span className="flex items-center gap-2 truncate">
            {activeNavItem ? <activeNavItem.icon className="h-4 w-4 text-[#3ec8dc]" /> : <Menu className="h-4 w-4 text-[#3ec8dc]" />}
            <span className="truncate">{activeNavItem?.label || "Menü"}</span>
          </span>
          {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <nav className={`${mobileNavOpen ? "block" : "hidden"} admin-scrollbar overflow-hidden rounded-[22px] border border-slate-800/80 bg-[#0d111a]/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,.28)] backdrop-blur-xl lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto`}>
          <div className="mb-4 rounded-2xl border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(6,182,212,.14),rgba(99,102,241,.08))] p-3.5">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-[#071116] shadow-[0_8px_24px_rgba(34,211,238,.22)]"><ShieldCheck className="h-4 w-4"/></span><div><p className="text-[11px] font-black text-white">Kontrol Merkezi</p><p className="mt-0.5 text-[9px] text-slate-400">Operasyonlar çevrimiçi</p></div><span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"/></div>
          </div>
          {ADMIN_NAV.map((section) => (
            <div key={section.group} className="mb-3 last:mb-0">
              <p className="px-2 pb-1.5 pt-2 text-[9px] font-black uppercase tracking-[0.20em] text-white/35">{section.group}</p>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  const badge =
                    item.id === "inbox"
                      ? inboxItems.length
                      : item.id === "partnerSupport"
                        ? partnerSupportUnread
                      : item.id === "tickets" || item.id === "customers" || item.id === "signups" || item.id === "approvals" || item.id === "quotes" || item.id === "renewals" || item.id === "extras"
                        ? opsNavBadge(opsAlerts, item.id)
                        : 0;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTab(item.id)}
                      className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12px] font-bold transition-all cursor-pointer ${
                        active ? "bg-cyan-400/[.11] text-cyan-100 ring-1 ring-inset ring-cyan-300/15" : "text-slate-400 hover:bg-white/[.045] hover:text-slate-100"
                      }`}
                    >
                      {active?<span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-cyan-300"/>:null}<span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${active?"bg-cyan-300/15 text-cyan-300":"bg-white/[.035] text-slate-500 group-hover:text-slate-200"}`}><Icon className="h-3.5 w-3.5" /></span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {badge > 0 ? (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-black tabular-nums ${
                            active ? "bg-white/20 text-white" : "bg-rose-500/90 text-white"
                          }`}
                        >
                          {badge > 99 ? "99+" : badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="min-w-0 rounded-[24px] border border-slate-800/70 bg-[#0b0f17]/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,.20)] sm:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            {activeNavItem ? <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-700/80 bg-slate-800/50 text-cyan-300"><activeNavItem.icon className="h-5 w-5"/></span> : null}
            <div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.18em] text-slate-500">Workspace / Yönetim</p><p className="truncate text-[16px] font-black tracking-[-.025em] text-white">{activeNavItem?.label || "Dashboard"}</p></div>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-white/35"><span className={`h-2 w-2 rounded-full ${databaseStatus === "connected" ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" : "bg-rose-400"}`}/>{databaseStatus === "connected" ? "Sistemler çalışıyor" : "Bağlantı kontrol ediliyor"}</div>
        </div>
        {activeTab === "inbox" && (
          <AdminInboxPanel
            items={inboxItems}
            loading={inboxLoading}
            error={inboxError}
            onRefresh={reloadInbox}
            onOpen={(target) => {
              setOpsJump({ target, token: Date.now() });
              setActiveTab(opsTargetTab(target));
            }}
          />
        )}
        {activeTab === "insights" && <AdminInsightsPanel />}
        {activeTab === "signups" && <AdminSignupsPanel opsJump={opsJump} onOpenCustomerForm={() => setActiveTab("customers")} />}
        {activeTab === "customers" && <AdminCustomerPanel focus="customers" opsJump={opsJump} />}
        {activeTab === "tickets" && <AdminCustomerPanel focus="tickets" opsJump={opsJump} />}
        {activeTab === "partnerSupport" && <AdminPartnerSupportPanel />}
        {activeTab === "approvals" && <AdminApprovalsPanel opsJump={opsJump} />}
        {activeTab === "quotes" && <AdminQuotesPanel opsJump={opsJump} />}
        {activeTab === "renewals" && <AdminRenewalsPanel opsJump={opsJump} />}
        {activeTab === "extras" && <AdminExtrasPanel />}
        {activeTab === "seoTrack" && <AdminSeoTrackPanel />}
        {activeTab === "referrals" && <AdminReferralsPanel />}
        {activeTab === "audit" && <AdminAuditPanel />}
        {activeTab === "security" && <AdminSecurityPanel />}
        {activeTab === "connections" && <AdminConnectionsPanel />}
        {activeTab === "sites" && <AdminSiteGeneratorPanel />}

        {/* --- TAB 1: PAKETLER VE FİYATLAR --- */}
        {activeTab === "plans" && (
          <div className="mt-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-black text-white">Reklam, web ve Maps paket yönetimi</h2>
                <p className="text-[13px] text-white/60">
                  Yönetim ücreti ile reklam bütçesi ayrıdır. E-ticaret isteğe bağlıdır; Pazarla ayrı bir üründür. Paket adlarını, fiyatları ve maddeleri buradan düzenleyin.
                </p>
              </div>

              <button
                onClick={addNewPlan}
                className="flex items-center gap-2 rounded-xl bg-[#10b981] px-5 py-2.5 text-[14px] font-extrabold text-white shadow-md hover:bg-[#059669] cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Boş Paket Ekle
              </button>
            </div>

            <div className="mb-8 rounded-3xl border border-[#38bdf8]/25 bg-gradient-to-br from-[#0b1f2a] to-[#12121a] p-5 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00a8c4]/15 text-[#3ec8dc]"><Wand2 className="h-5 w-5" /></span>
                <div>
                  <h3 className="text-[16px] font-black text-white">Paket Sihirbazı</h3>
                  <p className="text-[11px] text-white/55">Ucuz / orta / pahalı mantığıyla tutarlı, düzenlenebilir taslak paket oluşturur. Efekt, rozet ve fiyat hazır gelir; kaydetmeden yayına çıkmaz.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {([
                  { kind: "ads" as WizardKind, title: "Reklam paketi", icon: TrendingUp, tone: "#6366f1" },
                  { kind: "store" as WizardKind, title: "Web / E-ticaret paketi", icon: ShoppingBag, tone: "#0ea5e9" },
                ]).map(({ kind, title, icon: Icon, tone }) => (
                  <div key={kind} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="flex items-center gap-2 text-[12px] font-black text-white/85"><Icon className="h-4 w-4" style={{ color: tone }} /> {title}</div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {(["ucuz", "orta", "pahali"] as WizardTier[]).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => addWizardPlan(kind, tier)}
                          className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-[#18181f] px-2 py-3 text-center text-white transition hover:border-[#00a8c4] hover:bg-[#00a8c4]/10 cursor-pointer"
                        >
                          <Sparkles className="h-4 w-4 text-[#3ec8dc]" />
                          <span className="text-[11px] font-black">{WIZARD_TIER_LABEL[tier].split(" ")[0]}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wide text-white/40">{WIZARD_TIER_LABEL[tier].match(/\((.+)\)/)?.[1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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

                  {/* ÖZELLİKLER VE İKON (otomatik öneri + manuel URL) */}
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[12px] font-extrabold text-[#38bdf8]">
                          Paket Maddeleri & İkonlar
                        </span>
                        <p className="mt-0.5 text-[10px] text-white/40">Madde adından renkli ikon önerilir; isterseniz URL ile değiştirin.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addFeature(planIdx)}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Madde Ekle
                      </button>
                    </div>

                    {plan.features.map((feat, featIdx) => (
                      <div key={featIdx} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/30 p-2 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/50">
                            {feat.iconPng ? (
                              <img src={feat.iconPng} alt="" className="h-5 w-5 object-contain" />
                            ) : (
                              <ImageIcon className="h-3.5 w-3.5 text-white/30" />
                            )}
                          </span>
                          <input
                            type="text"
                            value={feat.text}
                            onChange={(e) => handleFeatureChange(planIdx, featIdx, "text", e.target.value)}
                            placeholder="Madde adı (örn. Google Ads, araba…)"
                            className="min-w-0 flex-1 bg-transparent text-[12px] font-bold text-white outline-none"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <div className="flex min-w-0 flex-1 items-center gap-1 rounded border border-white/10 bg-black/60 px-2 py-1 sm:flex-none">
                            <ImageIcon className="h-3.5 w-3.5 shrink-0 text-[#a855f7]" />
                            <input
                              type="text"
                              value={feat.iconPng || ""}
                              onChange={(e) => handleFeatureChange(planIdx, featIdx, "iconPng", e.target.value)}
                              placeholder="Manuel ikon URL (yedek)"
                              className="w-full min-w-[8rem] bg-transparent text-[10px] text-white/80 outline-none sm:w-36"
                            />
                          </div>
                          <button
                            type="button"
                            title="Metinden otomatik ikon öner"
                            onClick={() => applyFeatureIconSuggest(planIdx, featIdx)}
                            className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-black text-cyan-100 hover:bg-cyan-500/20"
                          >
                            Öner
                          </button>
                          <button type="button" onClick={() => removeFeature(planIdx, featIdx)} className="p-1 text-red-400">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "slides" && (
          <AdminHeroSlidesPanel
            slides={slidesState}
            history={settingsState.heroDesignHistory || []}
            onChange={setSlidesState}
            onHistoryChange={(heroDesignHistory) =>
              setSettingsState((prev) => ({ ...prev, heroDesignHistory }))
            }
          />
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
                  type="tel"
                  inputMode="numeric"
                  maxLength={14}
                  value={settingsState.phone}
                  onChange={(e) => setSettingsState({ ...settingsState, phone: sanitizePhoneInput(e.target.value) })}
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

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Destek / ofis saatleri</p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/50">
                İletişim sayfası, destek CTA ve şema openingHours bu alanlardan okunur. Biçim: 09:00–18:00. Cumartesi boş bırakılırsa Cumartesi kapalı sayılır; Pazar her zaman kapalı.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[12px] font-bold text-white/70">Hafta içi (Pzt–Cuma)</label>
                  <input
                    type="text"
                    value={settingsState.supportWeekdayHours}
                    onChange={(e) => setSettingsState({ ...settingsState, supportWeekdayHours: e.target.value })}
                    placeholder="09:00–18:00"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-white/70">Cumartesi (boş = kapalı)</label>
                  <input
                    type="text"
                    value={settingsState.supportSaturdayHours}
                    onChange={(e) => setSettingsState({ ...settingsState, supportSaturdayHours: e.target.value })}
                    placeholder="10:00–14:00"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] font-bold text-white"
                  />
                </div>
              </div>
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

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Giriş / kayıt bannerları</p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/50">
                Sol panel slider’ları (resim / GIF / video + dikkat efektleri). Müşteri: /musteri/giris · Bayi: /firma/giris ve /firma/kayit. Kaydet ile yayınlanır.
              </p>
              {(
                [
                  { key: "customerLoginBanners" as const, title: "Müşteri girişi", theme: "customer" as const },
                  { key: "partnerLoginBanners" as const, title: "Bayi giriş & kayıt", theme: "partner" as const },
                ] as const
              ).map((group) => {
                const banners = settingsState[group.key] || [];
                const updateBanner = (id: string, patch: Partial<LoginPromoBanner>) => {
                  setSettingsState((prev) => ({
                    ...prev,
                    [group.key]: (prev[group.key] || []).map((row) => (row.id === id ? { ...row, ...patch } : row)),
                  }));
                };
                return (
                  <div key={group.key} className="mt-5 rounded-2xl border border-white/10 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-black text-white">{group.title}</p>
                      <button
                        type="button"
                        onClick={() =>
                          setSettingsState((prev) => ({
                            ...prev,
                            [group.key]: [...(prev[group.key] || []), emptyLoginBanner(group.theme)],
                          }))
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a8c4] px-3 py-2 text-[11px] font-bold text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Banner ekle
                      </button>
                    </div>
                    <div className="mt-3 space-y-3">
                      {banners.length === 0 ? (
                        <p className="text-[12px] font-semibold text-white/45">Banner yok — ekleyin veya varsayılanlar kayıttan gelir.</p>
                      ) : null}
                      {banners.map((banner, index) => (
                        <div key={banner.id} className="rounded-xl border border-white/10 bg-black/35 p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-black text-white/55">#{index + 1}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setSettingsState((prev) => ({
                                  ...prev,
                                  [group.key]: (prev[group.key] || []).filter((row) => row.id !== banner.id),
                                }))
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 px-2.5 py-1.5 text-[11px] font-bold text-red-200 hover:bg-red-500/15"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Kaldır
                            </button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <label className="text-[11px] font-bold text-white/65">
                              Etiket
                              <input
                                type="text"
                                value={banner.label}
                                maxLength={60}
                                onChange={(e) => updateBanner(banner.id, { label: e.target.value })}
                                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] font-bold text-white"
                              />
                            </label>
                            <label className="text-[11px] font-bold text-white/65">
                              Başlık
                              <input
                                type="text"
                                value={banner.title}
                                maxLength={120}
                                onChange={(e) => updateBanner(banner.id, { title: e.target.value })}
                                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] font-bold text-white"
                              />
                            </label>
                          </div>
                          <label className="mt-2 block text-[11px] font-bold text-white/65">
                            Gradient (medya yoksa)
                            <input
                              type="text"
                              value={banner.gradient}
                              maxLength={400}
                              onChange={(e) => updateBanner(banner.id, { gradient: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 font-mono text-[11px] text-white/90"
                            />
                          </label>
                          <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-black/25 p-3">
                            <p className="text-[10px] font-black uppercase tracking-wide text-[#70dce9]">Medya · resim / GIF / video</p>
                            <select
                              value={banner.mediaType || (bannerMediaUrl(banner) ? "image" : "none")}
                              onChange={(e) =>
                                updateBanner(banner.id, {
                                  mediaType: e.target.value as LoginPromoBanner["mediaType"],
                                })
                              }
                              className="w-full rounded-xl border border-white/15 bg-black/40 px-2.5 py-1.5 text-[12px] font-bold text-white"
                            >
                              <option value="none">Yok (gradient)</option>
                              <option value="image">Resim</option>
                              <option value="gif">GIF</option>
                              <option value="video">Video</option>
                            </select>
                            {(banner.mediaType || "none") !== "none" || bannerMediaUrl(banner) ? (
                              <MediaFileField
                                label="Medya URL / dosya"
                                accept={
                                  banner.mediaType === "video"
                                    ? "video/mp4,video/webm"
                                    : banner.mediaType === "gif"
                                      ? "image/gif"
                                      : "image/png,image/jpeg,image/webp,image/gif"
                                }
                                url={bannerMediaUrl(banner)}
                                onUrlChange={(mediaUrl) =>
                                  updateBanner(banner.id, { mediaUrl, imageUrl: mediaUrl, mediaType: banner.mediaType || "image" })
                                }
                                onClear={() => updateBanner(banner.id, { mediaUrl: "", imageUrl: "", mediaType: "none" })}
                                hint="Firma kayıt & üye giriş sol banner"
                              />
                            ) : null}
                            <AttentionEffectPicker
                              label="Banner dikkat efekti"
                              value={banner.effectId}
                              onChange={(effectId: AttentionEffectId) => updateBanner(banner.id, { effectId })}
                            />
                          </div>
                          <div className="mt-3 space-y-3 rounded-xl border border-[#00a8c4]/25 bg-[#00a8c4]/5 p-3">
                            <p className="text-[10px] font-black uppercase tracking-wide text-[#7ee0ec]">Dikkat katmanı</p>
                            <label className="block text-[11px] font-bold text-white/65">
                              Efekt adı
                              <input
                                type="text"
                                value={banner.overlayName || ""}
                                placeholder="Örn. Kampanya rozeti"
                                onChange={(e) => updateBanner(banner.id, { overlayName: e.target.value })}
                                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[12px] font-bold text-white"
                              />
                            </label>
                            <MediaFileField
                              label="Katman PNG / GIF"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              url={banner.overlayUrl || ""}
                              onUrlChange={(overlayUrl) => updateBanner(banner.id, { overlayUrl })}
                              onClear={() => updateBanner(banner.id, { overlayUrl: "" })}
                            />
                            <AttentionEffectPicker
                              label="Katman animasyonu"
                              value={banner.overlayEffect}
                              onChange={(overlayEffect: AttentionEffectId) => updateBanner(banner.id, { overlayEffect })}
                            />
                          </div>
                          <div
                            className="mt-2 h-14 w-full rounded-lg border border-white/15 bg-cover bg-center"
                            style={{
                              backgroundImage: bannerMediaUrl(banner)
                                ? `url(${bannerMediaUrl(banner)})`
                                : banner.gradient,
                            }}
                            title="Önizleme"
                          />

                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Yapışkan iletişim ve bot</p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/50">
                Genel sitedeki WhatsApp, telefon ve asistan botunu Mobil / Bilgisayar için ayrı gizleyin. Müşteri paneli alt çubuğu değişmez. Bot için yukarıdaki “Sitede botu göster” açık olmalı.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {VISIBILITY_COLUMNS.map((column) => (
                  <div key={column.title} className="rounded-2xl border border-white/10 bg-white/4 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      {column.title === "Mobil" ? <Smartphone className="h-4 w-4 text-[#3ec8dc]" /> : <Monitor className="h-4 w-4 text-[#3ec8dc]" />}
                      <div>
                        <p className="text-[13px] font-black text-white">{column.title}</p>
                        <p className="text-[10px] font-bold text-white/40">{column.hint}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {column.flags.map((flag) => (
                        <label key={flag.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                          <span className="text-[13px] font-bold text-white">{flag.label}</span>
                          <input
                            type="checkbox"
                            role="switch"
                            checked={settingOn(settingsState, flag.key)}
                            onChange={(e) =>
                              setSettingsState({
                                ...settingsState,
                                [flag.key]: e.target.checked,
                                mascotActive: flag.key.startsWith("bot")
                                  ? e.target.checked ||
                                    settingOn(settingsState, flag.key === "botMobile" ? "botDesktop" : "botMobile")
                                  : settingsState.mascotActive,
                                homeSections: flag.key.startsWith("bot")
                                  ? {
                                      ...DEFAULT_HOME_SECTIONS,
                                      ...settingsState.homeSections,
                                      mascot:
                                        e.target.checked ||
                                        settingOn(settingsState, flag.key === "botMobile" ? "botDesktop" : "botMobile"),
                                    }
                                  : settingsState.homeSections,
                              })
                            }
                            className="h-4 w-4 accent-[#00a8c4]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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

        {activeTab === "corporate" && (
          <AdminCorporatePanel settings={settingsState} onChange={setSettingsState} />
        )}

        {activeTab === "bayilikSartlari" && <AdminBayilikSartlariPanel />}

        {activeTab === "seo" && (
          <AdminSeoPanel settings={settingsState} onChange={setSettingsState} />
        )}
        </div>
        </div>
      </div>
    </div>
  );
}
