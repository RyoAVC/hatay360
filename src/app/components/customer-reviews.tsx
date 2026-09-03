import { useState, useMemo, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Star,
  X,
  CheckCircle2,
  MessageSquarePlus,
  Heart,
  MapPin,
  Sparkles,
  Send,
  Briefcase,
  Store,
  SlidersHorizontal,
  Layers,
  Quote,
  TrendingUp,
  ShieldCheck,
  Building2,
  ChevronRight,
} from "lucide-react";

export type ReviewType = "customer" | "bayi";

export interface ReviewItem {
  id: string;
  type: ReviewType;
  name: string;
  role: string;
  district: string;
  sectorLabel: string;
  stars: number;
  date: string;
  isoDate: string;
  text: string;
  avatar: string;
  verifiedBadge: string;
  metric?: string;
  likes: number;
}

const SPOTLIGHT_STORIES = [
  {
    id: "v1",
    name: "Mehmet Şahinoğlu",
    business: "Tarihi Antakya Künefecisi & Gastronomi",
    location: "Antakya Çarşı",
    metric: "+%240 Ciro & Ziyaretçi Artışı",
    metricLabel: "Google Harita & Arama Trafiği",
    quote:
      "Harita kaydımız ve yerel arama reklamları sayesinde Hatay'a gelen yerli ve yabancı misafirlerin ilk durağı olduk. Öğle ve akşam saatlerinde yol tarifi talepleri 3 katına çıktı.",
    poster: "/avatars/video-1.jpg",
    stars: 5,
    tag: "Gastronomi & Tatlı",
    accent: "from-[#0891b2] to-[#00a8c4]",
  },
  {
    id: "v2",
    name: "Dr. Canan Alkan",
    business: "Hatay Yaşam Ağız ve Diş Sağlığı Polikliniği",
    location: "İskenderun Sahil",
    metric: "190+ Randevu / Ay",
    metricLabel: "Doğrudan WhatsApp & Form Talebi",
    quote:
      "Google Haritalar ve modern web sayfamız birlikte optimize edilince WhatsApp randevu formlarımız dolmaya başladı. Hatay'da dijital reklamın en güvenilir ve hızlı ekibi.",
    poster: "/avatars/video-2.jpg",
    stars: 5,
    tag: "Sağlık & Klinik",
    accent: "from-[#0f766e] to-[#00a8c4]",
  },
  {
    id: "v3",
    name: "Av. Kemal Güler",
    business: "Güler Hukuk & Arabuluculuk Bürosu",
    location: "Antakya Adliye",
    metric: "1. Sayfa Sıralaması",
    metricLabel: "Bölgesel Kurumsal Aramalar",
    quote:
      "Hatay adliyesi çevresinde ve kurumsal danışmanlık aramalarında ilk sıradayız. Sayfa hızımız ve mobil görünürlüğümüz sayesinde müvekkillerimiz tek tıkla konumumuza ulaşıyor.",
    poster: "/avatars/video-3.jpg",
    stars: 5,
    tag: "Hukuk & Danışmanlık",
    accent: "from-[#0369a1] to-[#38bdf8]",
  },
] as const;

// 8 Müşteri & Yerel İşletme Yorumu (Track 1)
const CUSTOMER_REVIEWS_DATA: ReviewItem[] = [
  {
    id: "cust-1",
    type: "customer",
    name: "Hasan Usta",
    role: "Tarihi Antakya Künefecisi & Tatlı Salonu",
    district: "Antakya",
    sectorLabel: "Gastronomi & Tatlı",
    stars: 5,
    date: "18 Ocak 2024",
    isoDate: "2024-01-18",
    avatar: "/avatars/cust-1.jpg",
    verifiedBadge: "Doğrulanmış İşletme",
    metric: "+%210 Ziyaret",
    likes: 34,
    text: "Antakya'da tatlı salonumuz için Google Haritalar optimizasyonu ve yerel reklam kurduk. 'Antakya en iyi künefeci' aramalarında ilk 3 sıraya oturduk. Şehir dışından gelen misafirler direkt navigasyonla dükkana geliyor.",
  },
  {
    id: "cust-2",
    type: "customer",
    name: "Dr. Canan Alkan",
    role: "Hatay Yaşam Diş Polikliniği",
    district: "İskenderun",
    sectorLabel: "Sağlık & Klinik",
    stars: 5,
    date: "14 Mayıs 2024",
    isoDate: "2024-05-14",
    avatar: "/avatars/cust-2.jpg",
    verifiedBadge: "Doğrulanmış Klinik",
    metric: "190+ Hasta",
    likes: 27,
    text: "İskenderun sahilindeki kliniğimiz için randevu landing page ve Google Ads kurguladılar. Boşa giden tıklamalar bitti, WhatsApp üzerinden gelen randevu talepleri düzenli bir sisteme oturdu.",
  },
  {
    id: "cust-3",
    type: "customer",
    name: "Av. Kemal Güler",
    role: "Güler Hukuk & Arabuluculuk",
    district: "Antakya",
    sectorLabel: "Hukuk & Danışmanlık",
    stars: 5,
    date: "28 Ekim 2024",
    isoDate: "2024-10-28",
    avatar: "/avatars/cust-3.jpg",
    verifiedBadge: "Doğrulanmış Hukuk Bürosu",
    metric: "1. Sıra SEO",
    likes: 23,
    text: "Adliye yakınındaki ofisimiz için kurumsal web sitesi ve harita doğrulama hizmeti aldık. Sayfa açılış hızları çok iyi ve mobil uyumu kusursuz. 2 yıldır düzenli teknik destek alıyoruz.",
  },
  {
    id: "cust-4",
    type: "customer",
    name: "Zekiye Doğan",
    role: "Defne Doğal Zeytinyağı & Defne Sabunu",
    district: "Defne",
    sectorLabel: "E-Ticaret & Yöresel",
    stars: 5,
    date: "12 Şubat 2025",
    isoDate: "2025-02-12",
    avatar: "/avatars/cust-4.jpg",
    verifiedBadge: "Doğrulanmış E-Ticaret",
    metric: "Tüm Türkiye Kargo",
    likes: 31,
    text: "Defne'deki butik imalathanemizin e-ticaret altyapısını ve Instagram reklam dönüşümlerini kurguladılar. Satışlarımız sadece Hatay ile sınırlı kalmadı, tüm Türkiye'ye günlük kargo gönderiyoruz.",
  },
  {
    id: "cust-5",
    type: "customer",
    name: "Serkan Demir",
    role: "Körfez Ağır Vasıta & Oto Ekspertiz",
    district: "Dörtyol",
    sectorLabel: "Oto Servis & Sanayi",
    stars: 5,
    date: "19 Temmuz 2025",
    isoDate: "2025-07-19",
    avatar: "/avatars/cust-5.jpg",
    verifiedBadge: "Doğrulanmış Servis",
    metric: "+%180 Yol Tarifi",
    likes: 19,
    text: "D-400 karayolu üzerindeki noktamız için harita kaydı ve yol tarifi butonlu mobil sayfa hazırladılar. Bölgeden geçen araçlar arıza veya ekspertiz için tek tıkla konumumuza ulaşıyor.",
  },
  {
    id: "cust-6",
    type: "customer",
    name: "Mehmet Ali Özdemir",
    role: "Özdemir Lojistik & Gümrükleme",
    district: "Reyhanlı",
    sectorLabel: "Lojistik & Nakliyat",
    stars: 5,
    date: "09 Kasım 2025",
    isoDate: "2025-11-09",
    avatar: "/avatars/cust-6.jpg",
    verifiedBadge: "Doğrulanmış Lojistik",
    metric: "Çok Dilli Web",
    likes: 22,
    text: "Sınır ve liman hattında kurumsal taşımacılık hizmeti veriyoruz. Kurumsal web sitemiz ve çok dilli iletişim formları sayesinde yeni ihracatçı firmalardan düzenli teklif talepleri alıyoruz.",
  },
  {
    id: "cust-7",
    type: "customer",
    name: "Murat Yıldız",
    role: "Çevlik Sahil Butik Otel",
    district: "Samandağ",
    sectorLabel: "Turizm & Otel",
    stars: 5,
    date: "14 Ocak 2026",
    isoDate: "2026-01-14",
    avatar: "/avatars/cust-7.jpg",
    verifiedBadge: "Doğrulanmış Otel",
    metric: "%100 Doluluk",
    likes: 29,
    text: "Google İşletme profilimiz profesyonel fotoğraflar ve oda rezervasyon menüsüyle yenilendi. Sezon öncesi Meta reklamlarıyla hafta sonu doluluk oranımız %100'e ulaştı.",
  },
  {
    id: "cust-8",
    type: "customer",
    name: "Ali Rıza Çelik",
    role: "Çelik Ziraat & Traktör Parça",
    district: "Kırıkhan",
    sectorLabel: "Tarım & Sanayi",
    stars: 5,
    date: "16 Şubat 2026",
    isoDate: "2026-02-16",
    avatar: "/avatars/cust-8.jpg",
    verifiedBadge: "Doğrulanmış Esnaf",
    metric: "3x Çağrı",
    likes: 26,
    text: "Amik Ovası çiftçilerine yedek parça satıyoruz. Haritadan ve Google reklamlarından numaramızı bulan onlarca yeni çiftçi dükkanımıza geliyor. İşlerimiz çok hareketlendi.",
  },
];

// 8 Bayi & Bölge Partneri Yorumu (Track 2)
const BAYI_REVIEWS_DATA: ReviewItem[] = [
  {
    id: "bayi-1",
    type: "bayi",
    name: "Bülent Yılmaz",
    role: "İskenderun & Arsuz Yetkili Bayisi",
    district: "İskenderun",
    sectorLabel: "Bölge Temsilcisi",
    stars: 5,
    date: "12 Şubat 2024",
    isoDate: "2024-02-12",
    avatar: "/avatars/bayi-1.jpg",
    verifiedBadge: "Yetkili Bölge Bayisi",
    metric: "40+ Aktif Müşteri",
    likes: 42,
    text: "Hatay360 İskenderun yetkili bayisi olarak 14 aydır sahadayız. 40'tan fazla esnafa panel açtık. Bayi komisyon ödemeleri ve teknik altyapı desteği kusursuz işliyor.",
  },
  {
    id: "bayi-2",
    type: "bayi",
    name: "Elif Çetin",
    role: "Antakya & Defne Ajans Partneri",
    district: "Antakya",
    sectorLabel: "Ajans Partneri",
    stars: 5,
    date: "08 Nisan 2024",
    isoDate: "2024-04-08",
    avatar: "/avatars/bayi-2.jpg",
    verifiedBadge: "Yetkili Ajans Partneri",
    metric: "White-Label Panel",
    likes: 38,
    text: "Hatay'ın yeniden ayağa kalkış sürecinde yerel işletmelere Hatay360 altyapısıyla hazır paketler kuruyoruz. White-label bayi paneli sayesinde müşteriye kendi markamızla sunum yapıyoruz.",
  },
  {
    id: "bayi-3",
    type: "bayi",
    name: "Cemil Karadağ",
    role: "Dörtyol & Payas Saha Bayisi",
    district: "Dörtyol",
    sectorLabel: "Saha Bayisi",
    stars: 5,
    date: "25 Ağustos 2024",
    isoDate: "2024-08-25",
    avatar: "/avatars/bayi-3.jpg",
    verifiedBadge: "Dörtyol Yetkili Bayi",
    metric: "Düzenli Bayi Geliri",
    likes: 31,
    text: "Sanayi ve atölye esnafına harita kaydı ve web paketi satıyoruz. Aylık düzenli bayi gelirimiz oluştu, Hatay360 merkez ekibinin teknik çözüm hızı mükemmel.",
  },
  {
    id: "bayi-4",
    type: "bayi",
    name: "Sami Bozkurt",
    role: "Reyhanlı Yetkili Satış Noktası",
    district: "Reyhanlı",
    sectorLabel: "Satış Noktası",
    stars: 5,
    date: "15 Kasım 2024",
    isoDate: "2024-11-15",
    avatar: "/avatars/bayi-4.jpg",
    verifiedBadge: "Reyhanlı Yetkili Bayi",
    metric: "25+ Kurulum",
    likes: 36,
    text: "Reyhanlı'da 25'in üzerinde işletmeye kurulum yaptık. Esnaf memnun kalınca çevresine de öneriyor. Hatay genelinde en kazançlı dijital bayilik modeli.",
  },
  {
    id: "bayi-5",
    type: "bayi",
    name: "Merve Aksoy",
    role: "Samandağ & Yayladağı Bayisi",
    district: "Samandağ",
    sectorLabel: "Bölge Temsilcisi",
    stars: 5,
    date: "20 Mart 2025",
    isoDate: "2025-03-20",
    avatar: "/avatars/bayi-5.jpg",
    verifiedBadge: "Yetkili Ajans Partneri",
    metric: "5 Dk Hızlı Kurulum",
    likes: 33,
    text: "Turizm işletmelerine ve yöresel üreticilere harita ve web paketleri satıyorum. Bayi paneli üzerinden 5 dakikada domain, hosting ve harita başvurusu açılıyor.",
  },
  {
    id: "bayi-6",
    type: "bayi",
    name: "Hakan Şahin",
    role: "Kırıkhan & Hassa Temsilcisi",
    district: "Kırıkhan",
    sectorLabel: "Saha Temsilcisi",
    stars: 5,
    date: "11 Haziran 2025",
    isoDate: "2025-06-11",
    avatar: "/avatars/bayi-6.jpg",
    verifiedBadge: "Yetkili Saha Bayisi",
    metric: "Yerinde Kurulum",
    likes: 28,
    text: "Tarım makineleri, oto galeri ve teknik servislere yerinde gidip Hatay360 paketlerini kuruyoruz. Müşteri memnun kalınca reklam bütçesini bizimle büyütüyor.",
  },
  {
    id: "bayi-7",
    type: "bayi",
    name: "Burak Aslan",
    role: "İskenderun Dijital Medya Partneri",
    district: "İskenderun",
    sectorLabel: "Medya Partneri",
    stars: 5,
    date: "04 Ekim 2025",
    isoDate: "2025-10-04",
    avatar: "/avatars/bayi-7.jpg",
    verifiedBadge: "Yetkili Satış Noktası",
    metric: "Şeffaf Rapor",
    likes: 34,
    text: "Müşteri desteği ve altyapı güvenliği üst seviye. Reklam bütçeleri şeffaf raporlandığı için işletmelerle aramızda güven sorunu kalmıyor.",
  },
  {
    id: "bayi-8",
    type: "bayi",
    name: "Volkan Ergün",
    role: "Antakya Kurumsal Çözüm Ortağı",
    district: "Antakya",
    sectorLabel: "Bölge Temsilcisi",
    stars: 5,
    date: "20 Ocak 2026",
    isoDate: "2026-01-20",
    avatar: "/avatars/bayi-8.jpg",
    verifiedBadge: "Yetkili Bölge Bayisi",
    metric: "Anahtar Teslim",
    likes: 45,
    text: "Sözleşme hazır, panel hazır, faturalama ve raporlama hazır. Bize sadece esnafla el sıkışmak kalıyor. Bayilik düşünen dijital ajanslara kesinlikle öneririm.",
  },
];

const DISTRICT_FILTERS = [
  "Tümü",
  "Antakya",
  "İskenderun",
  "Defne",
  "Samandağ",
  "Dörtyol",
  "Reyhanlı",
  "Kırıkhan",
] as const;

export function CustomerReviews() {
  const [activeTab, setActiveTab] = useState<"all" | "customer" | "bayi">("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Tümü");
  const [activeStory, setActiveStory] = useState<(typeof SPOTLIGHT_STORIES)[number] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [userLikedMap, setUserLikedMap] = useState<Record<string, boolean>>({});

  // Form State
  const [newReview, setNewReview] = useState({
    name: "",
    business: "",
    district: "Antakya",
    stars: 5,
    text: "",
    type: "customer" as ReviewType,
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleLike = (id: string, initialLikes: number) => {
    if (userLikedMap[id]) return;
    setUserLikedMap((prev) => ({ ...prev, [id]: true }));
    setLikesMap((prev) => ({ ...prev, [id]: (prev[id] ?? initialLikes) + 1 }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setFormSubmitted(false);
      setNewReview({
        name: "",
        business: "",
        district: "Antakya",
        stars: 5,
        text: "",
        type: "customer",
      });
    }, 2200);
  };

  const filteredCustomerReviews = useMemo(() => {
    if (selectedDistrict === "Tümü") return CUSTOMER_REVIEWS_DATA;
    return CUSTOMER_REVIEWS_DATA.filter((r) => r.district === selectedDistrict);
  }, [selectedDistrict]);

  const filteredBayiReviews = useMemo(() => {
    if (selectedDistrict === "Tümü") return BAYI_REVIEWS_DATA;
    return BAYI_REVIEWS_DATA.filter((r) => r.district === selectedDistrict);
  }, [selectedDistrict]);

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-[#0a1922] text-white">
      {/* ─── ENTEGRE MARQUEE ANİMASYON STİLİ (CSS TRANSFORM) ─── */}
      <style>{`
        @keyframes hatayMarqueeFlow {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(calc(-50% - 10px), 0, 0);
          }
        }

        .hatay-marquee {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .hatay-marquee__track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: hatayMarqueeFlow var(--marquee-speed, 42s) linear infinite;
        }

        .hatay-marquee--reverse .hatay-marquee__track {
          animation-direction: reverse;
        }

        .hatay-marquee:hover .hatay-marquee__track {
          animation-play-state: paused;
        }
      `}</style>

      {/* ─── RADYAL ARKA PLAN VE IŞIK HALKALARI ──────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[550px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#00a8c4]/20 via-[#0891b2]/10 to-transparent blur-[120px]" />
        <div className="absolute top-1/2 left-0 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#00a8c4]/10 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[450px] w-[500px] rounded-full bg-[#0891b2]/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─── HEADER ALANI ───────────────────────────────────── */}
        <div className="text-center">
          {/* Canlı Yayın & Doğrulama Rozeti */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#00a8c4]/40 bg-[#00a8c4]/10 px-4 py-1.5 text-[12px] font-bold tracking-wider text-[#38bdf8] backdrop-blur-xl shadow-[0_0_25px_rgba(0,168,196,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="uppercase tracking-[0.16em]">Hatay Genelinde Doğrulanmış Müşteri & Bayi Deneyimleri</span>
          </div>

          <h2 className="mt-5 text-[32px] font-black tracking-tight text-white sm:text-[44px] lg:text-[52px]">
            Hatay'ın Güçlü Markaları{" "}
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#00a8c4] to-[#2dd4bf] bg-clip-text text-transparent drop-shadow-sm">
              Hatay360
            </span>{" "}
            ile Zirvede
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] font-normal leading-relaxed text-slate-300 sm:text-[17px]">
            Antakya, İskenderun, Defne, Dörtyol, Reyhanlı ve Samandağ'da yüzlerce işletmenin ve yetkili ajans bayilerimizin doğrulanmış gerçek başarı öyküleri.
          </p>

          {/* ─── CANLI DEĞERLENDİRME & STATS DOCK ─────────────── */}
          <div className="mx-auto mt-9 flex max-w-4xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:p-5">
            {/* Google Rating Pill */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-md">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[18px] font-black text-white">4.9</span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-slate-400">Google Haritalar Puanı</p>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-white/10 md:block" />

            {/* Doğrulanmış İşletmeler */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-bold text-white">140+ Doğrulanmış</p>
                <p className="text-[11px] font-medium text-slate-400">Hatay Yerel İşletmesi</p>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-white/10 md:block" />

            {/* Bölge Bayi Ağı */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00a8c4]/10 text-[#38bdf8] border border-[#00a8c4]/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[14px] font-bold text-white">15 İlçe Bayilik</p>
                <p className="text-[11px] font-medium text-slate-400">Aktif Saha & Ajans Ağı</p>
              </div>
            </div>

            {/* Yorum Ekle CTA Butonu */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#2dd4bf] px-4 py-2.5 text-[13px] font-extrabold text-white shadow-lg shadow-[#00a8c4]/30 transition hover:scale-105 active:scale-95"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>Yorum Bırak</span>
            </button>
          </div>
        </div>

        {/* ─── 3 ÖNE ÇIKAN BENTO SPOTLIGHT KARTI ────────────────── */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {SPOTLIGHT_STORIES.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-7 backdrop-blur-xl shadow-2xl shadow-black/40 transition-all hover:border-[#00a8c4]/50 hover:shadow-[0_20px_50px_rgba(0,168,196,0.15)]"
            >
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-[#00a8c4]/20 to-transparent blur-3xl transition duration-500 group-hover:scale-150" />
              
              <Quote className="absolute right-6 top-6 h-12 w-12 text-white/[0.03] transition duration-300 group-hover:text-[#00a8c4]/10" />

              <div>
                {/* Sektör ve Metrik */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#00a8c4]/30 bg-[#00a8c4]/10 px-3 py-1 text-[11px] font-bold text-[#38bdf8]">
                    <Sparkles className="h-3 w-3 text-[#38bdf8]" />
                    <span>{story.tag}</span>
                  </span>

                  <span className="flex items-center gap-1 text-[11.5px] font-medium text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-[#00a8c4]" />
                    <span>{story.location}</span>
                  </span>
                </div>

                {/* Büyüme Metriği Rozeti */}
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-[15px] font-black text-emerald-400">{story.metric}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400">{story.metricLabel}</p>
                </div>

                {/* Alıntı Metni */}
                <p className="mt-4 text-[14px] leading-relaxed text-slate-200">
                  "{story.quote}"
                </p>
              </div>

              {/* Kullanıcı Alt Çubuğu */}
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={story.poster}
                      alt={story.name}
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-[#00a8c4]/40"
                    />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#0a1922]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-white">{story.name}</h3>
                    <p className="text-[11px] font-medium text-slate-400 line-clamp-1">{story.business}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStory(story)}
                  title="Hikayeyi İncele"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition duration-300 group-hover:bg-[#00a8c4] group-hover:shadow-lg group-hover:shadow-[#00a8c4]/30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── KONTROLLER (SEKME & İLÇE FİLTRESİ) ──────────────── */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row">
          {/* Sekmeler: Tümü / Müşteriler / Bayiler */}
          <div className="flex rounded-2xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition ${
                activeTab === "all"
                  ? "bg-[#00a8c4] text-white shadow-md shadow-[#00a8c4]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Tüm Değerlendirmeler ({CUSTOMER_REVIEWS_DATA.length + BAYI_REVIEWS_DATA.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("customer")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition ${
                activeTab === "customer"
                  ? "bg-[#00a8c4] text-white shadow-md shadow-[#00a8c4]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Müşteri Yorumları ({CUSTOMER_REVIEWS_DATA.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("bayi")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition ${
                activeTab === "bayi"
                  ? "bg-[#00a8c4] text-white shadow-md shadow-[#00a8c4]/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Bayi & Partnerler ({BAYI_REVIEWS_DATA.length})</span>
            </button>
          </div>

          {/* İlçe Çipleri */}
          <div className="flex flex-wrap items-center gap-1.5">
            <SlidersHorizontal className="mr-1 h-4 w-4 text-slate-400" />
            {DISTRICT_FILTERS.map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistrict(dist)}
                className={`rounded-xl px-3 py-1.5 text-[12px] font-bold transition ${
                  selectedDistrict === dist
                    ? "bg-white text-[#0a1922] shadow-md"
                    : "bg-white/[0.05] text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        {/* ─── KESİNTİSİZ AKAN ÇİFT HATLI MARQUEE ───────────────── */}
        <div className="mt-8 space-y-6">
          {/* TRACK 1: MÜŞTERİLER */}
          {(activeTab === "all" || activeTab === "customer") && (
            <ReviewMarqueeRow
              reviews={filteredCustomerReviews}
              reverse={false}
              duration={40}
              likesMap={likesMap}
              userLikedMap={userLikedMap}
              onLike={handleLike}
            />
          )}

          {/* TRACK 2: BAYİLER & PARTNERLER */}
          {(activeTab === "all" || activeTab === "bayi") && (
            <ReviewMarqueeRow
              reviews={filteredBayiReviews}
              reverse={true}
              duration={46}
              likesMap={likesMap}
              userLikedMap={userLikedMap}
              onLike={handleLike}
            />
          )}
        </div>
      </div>

      {/* ─── DETAY / HİKAYE MODAL ──────────────────────────── */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d222e] p-8 text-white shadow-2xl"
            >
              <button
                onClick={() => setActiveStory(null)}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={activeStory.poster}
                  alt={activeStory.name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-[#00a8c4]"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{activeStory.name}</h3>
                  <p className="text-sm text-cyan-300">{activeStory.business}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-[#00a8c4]" />
                    <span>{activeStory.location}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#00a8c4]/30 bg-[#00a8c4]/10 p-4">
                <p className="text-xs font-bold text-[#38bdf8] uppercase tracking-wide">Elde Edilen Sonuç</p>
                <p className="text-lg font-black text-white mt-1">{activeStory.metric}</p>
                <p className="text-xs text-slate-300 mt-0.5">{activeStory.metricLabel}</p>
              </div>

              <p className="mt-6 text-base italic leading-relaxed text-slate-200">
                "{activeStory.quote}"
              </p>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setActiveStory(null)}
                  className="rounded-xl bg-[#00a8c4] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0891b2]"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── YENİ YORUM EKLEME MODAL ───────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#0f2430] p-6 text-white shadow-2xl sm:p-8"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a8c4]/20 text-[#38bdf8]">
                  <MessageSquarePlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Hatay360 Deneyiminizi Paylaşın</h3>
                  <p className="text-xs text-slate-400">Yorumunuz doğrulanarak ana sayfada ve haritada yayınlanacaktır.</p>
                </div>
              </div>

              {formSubmitted ? (
                <div className="my-8 flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="mt-4 text-base font-bold text-white">Değerlendirmeniz Alındı!</h4>
                  <p className="mt-1 text-xs text-slate-400 max-w-xs">
                    Katkınız için teşekkür ederiz. Ekibimiz doğrulama kontrolünü tamamladıktan sonra yorumunuz yayına alınacaktır.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Adınız ve Soyadınız</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Mehmet Şahin"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#00a8c4] focus:ring-2 focus:ring-[#00a8c4]/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300">İşletme / Ajans Adı</label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Antakya Tatlıcısı"
                        value={newReview.business}
                        onChange={(e) => setNewReview({ ...newReview, business: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#00a8c4] focus:ring-2 focus:ring-[#00a8c4]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300">Bulunduğunuz İlçe</label>
                      <select
                        value={newReview.district}
                        onChange={(e) => setNewReview({ ...newReview, district: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-white/15 bg-[#162e3c] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#00a8c4] focus:ring-2 focus:ring-[#00a8c4]/20"
                      >
                        {DISTRICT_FILTERS.filter((d) => d !== "Tümü").map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300">Puanınız</label>
                    <div className="mt-1.5 flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, stars: s })}
                          className="p-1 text-amber-400 hover:scale-110 transition"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              s <= newReview.stars ? "fill-amber-400 text-amber-400" : "text-white/20"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300">Görüş ve Deneyiminiz</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Hatay360 ile aldığınız sonuçları, Google Harita veya reklam deneyiminizi kısaca yazın..."
                      value={newReview.text}
                      onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-white outline-none focus:border-[#00a8c4] focus:ring-2 focus:ring-[#00a8c4]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#2dd4bf] py-3 text-sm font-bold text-white shadow-lg shadow-[#00a8c4]/30 transition hover:opacity-95"
                  >
                    <Send className="h-4 w-4" />
                    <span>Değerlendirmeyi Gönder</span>
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── MARQUEE SIRASI (KESİNTİSİZ 60FPS AKIŞ) ──────────────────
function ReviewMarqueeRow({
  reviews,
  reverse = false,
  duration = 42,
  likesMap,
  userLikedMap,
  onLike,
}: {
  reviews: ReviewItem[];
  reverse?: boolean;
  duration?: number;
  likesMap: Record<string, number>;
  userLikedMap: Record<string, boolean>;
  onLike: (id: string, initialLikes: number) => void;
}) {
  return (
    <div
      className={`hatay-marquee relative overflow-hidden py-2 ${
        reverse ? "hatay-marquee--reverse" : ""
      }`}
    >
      {/* Yan Geçiş Gradyanları */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#0a1922] to-transparent sm:w-36" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#0a1922] to-transparent sm:w-36" />

      <div
        className="hatay-marquee__track flex w-max items-stretch gap-5"
        style={{ "--marquee-speed": `${duration}s` } as CSSProperties}
      >
        {[0, 1].map((copyIdx) => (
          <div
            key={copyIdx}
            className="flex shrink-0 items-stretch gap-5"
            aria-hidden={copyIdx === 1}
          >
            {reviews.map((item) => (
              <ModernReviewCard
                key={`${item.id}-copy${copyIdx}`}
                item={item}
                userLiked={!!userLikedMap[item.id]}
                likesCount={likesMap[item.id] ?? item.likes}
                onLike={() => onLike(item.id, item.likes)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ULTRA-MODERN TEKİL YORUM KARTI ───────────────────────────
function ModernReviewCard({
  item,
  userLiked,
  likesCount,
  onLike,
}: {
  item: ReviewItem;
  userLiked: boolean;
  likesCount: number;
  onLike: () => void;
}) {
  const isBayi = item.type === "bayi";

  return (
    <div className="relative flex w-[330px] shrink-0 flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#00a8c4]/40 hover:shadow-xl hover:shadow-[#00a8c4]/15 sm:w-[370px]">
      <div>
        {/* Üst Çubuk: Rozet ve İlçe */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
              isBayi
                ? "border border-[#0891b2]/40 bg-[#0891b2]/15 text-[#38bdf8]"
                : "border border-[#00a8c4]/40 bg-[#00a8c4]/15 text-[#2dd4bf]"
            }`}
          >
            {isBayi ? <Briefcase className="h-3 w-3" /> : <Store className="h-3 w-3" />}
            <span>{item.verifiedBadge}</span>
          </span>

          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <MapPin className="h-3 w-3 text-[#00a8c4]" />
            <span>{item.district}</span>
          </span>
        </div>

        {/* Yıldızlar, Metrik Rozeti ve Tarih */}
        <div className="mt-3.5 flex items-center justify-between">
          <div className="flex text-amber-400">
            {[...Array(item.stars)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>

          {item.metric && (
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-extrabold text-emerald-400 border border-emerald-500/20">
              {item.metric}
            </span>
          )}

          <span className="text-[10.5px] font-medium text-slate-500">{item.date}</span>
        </div>

        {/* Yorum Metni */}
        <p className="mt-3 line-clamp-4 text-[13.5px] leading-relaxed text-slate-200">
          "{item.text}"
        </p>
      </div>

      {/* Alt Profil & Beğeni */}
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={item.avatar}
              alt={item.name}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/15"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-1 ring-[#0a1922]" />
          </div>
          <div className="max-w-[170px] truncate">
            <h4 className="text-[13px] font-bold text-white truncate">{item.name}</h4>
            <p className="text-[11px] text-slate-400 truncate">{item.role}</p>
          </div>
        </div>

        <button
          onClick={onLike}
          disabled={userLiked}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
            userLiked
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10"
          }`}
        >
          <Heart className={`h-3 w-3 ${userLiked ? "fill-rose-400 text-rose-400" : ""}`} />
          <span>{likesCount}</span>
        </button>
      </div>
    </div>
  );
}
