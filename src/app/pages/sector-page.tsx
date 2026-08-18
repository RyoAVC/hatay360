import { Link, Navigate, useParams } from "react-router";
import { ArrowRight, BadgeCheck, Clock3, Megaphone, MessageSquareText, Stethoscope, Target, Truck, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { PageHero } from "../components/page-hero";
import { CallbackForm } from "../components/callback-form";
import { AvclabsShowcase } from "../components/avclabs-showcase";
import { useContent, type SectorItem } from "../context/content-context";
import { ADS_SITE_DEMOS } from "../lib/avclabs";
import { toTelHref } from "../lib/contact";

const iconMap = {
  target: Target,
  message: MessageSquareText,
  clock: Clock3,
  badge: BadgeCheck,
  truck: Truck,
  stethoscope: Stethoscope,
  wrench: Wrench,
  megaphone: Megaphone,
} as const;

const DEFAULT_DEMO_IMAGE = "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=82";

export function DemoOverviewPage() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(0,168,196,0.10),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef5f8_100%)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dbeaf2] bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0ea5c9]">
            Demo vitrin · AVC ailesi
          </span>
          <h1 className="mt-5 text-[34px] font-black text-[#0f172a] sm:text-[46px]">
            Hatay360 demoları ve AvcNova lisanslı yazılımlar
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#4b5c71]">
            Hatay360 web tasarım, reklam ve görünürlük işini yapar. Araç kiralama, bungalov, yat gibi operasyon yazılımlarını ise AVC ailesinin AvcNova markası üretir: BUNG lisanslı sistemler, kurumsal ve büyük projeler içindir.
          </p>
        </div>

        <h2 className="mt-14 text-[22px] font-black text-[#0f172a]">Hatay360 — web tasarım ve reklam örnekleri</h2>
        <p className="mt-2 text-[14px] text-[#64748b]">Siteniz, reklamınız ve çağrı akışınız. Teknik servis, klinik, taksi, nakliyat vitrinleri.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {ADS_SITE_DEMOS.map((item) => (
            <Link
              key={item.slug}
              to={`/demo/${item.slug}`}
              className="group overflow-hidden rounded-[28px] border border-[#e7edf3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            >
              <div className="relative h-48">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-[20px] font-black">{item.title}</h3>
                  <p className="text-[13px] text-white/80">{item.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-5 py-4 text-[13px] font-black text-[#0ea5c9]">
                Hatay360 site örneği <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        <AvclabsShowcase />
      </div>
    </section>
  );
}

function SectorDemoPreview({ sector }: { sector: SectorItem }) {
  const { settings } = useContent();
  const { primary, soft, dark } = sector.theme;

  const featureRows = [
    "Google arama görünürlüğü",
    "Telefon / WhatsApp dönüşümü",
    "İlçe bazlı hedefleme",
    "A/B başlık ve CTA optimizasyonu",
  ];

  const sectorHighlights = sector.highlights.slice(0, 3);

  const visuals: Record<string, {
    accent: string;
    image: string;
    badge: string;
    headline: string;
    sub: string;
    points: string[];
    stats: { label: string; value: string }[];
    formLabels: [string, string];
    cta: string;
  }> = {
    taxi: {
      accent: "#facc15",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=82",
      badge: "Hatay 7/24",
      headline: "Hatay’da güvenli, hızlı ve uygun fiyatlı taksi",
      sub: "Antakya, Defne, İskenderun ve tüm ilçelerde anlık çağrı ve güvenli transfer.",
      points: ["7/24 çağrı merkezi", "Hızlı yanıt", "İlçe bazlı rota"],
      stats: [{ label: "Yaklaşma", value: "7 dk" }, { label: "Hizmet", value: "7/24" }, { label: "Bölge", value: "15 ilçe" }],
      formLabels: ["Alınacak konum", "Gidilecek konum"],
      cta: "Taksi çağır",
    },
    nakliyat: {
      accent: "#38bdf8",
      image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1400&q=82",
      badge: "Nakliyat & Taşıma",
      headline: "Fiyat, güven ve hız bir arada",
      sub: "Evden eve, ofis taşıma ve şehir içi nakliyatta doğru teklif sistemi kuruyoruz.",
      points: ["Fiyat netliği", "Güvenli ekip", "WhatsApp teklif"],
      stats: [{ label: "Ekspertiz", value: "Ücretsiz" }, { label: "Sigorta", value: "%100" }, { label: "Teklif", value: "15 dk" }],
      formLabels: ["Taşınacak ilçe", "Taşıma türü"],
      cta: "Ücretsiz fiyat al",
    },
    klinik: {
      accent: "#2dd4bf",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80",
      badge: "Sağlık & Randevu",
      headline: "Randevu ve güveni birlikte artırın",
      sub: "Doktor, diş kliniği, estetik ve sağlık hizmetlerinde doğru arama görünürlüğü.",
      points: ["Randevu takvimi", "Güvenli içerik", "Yerel görünürlük"],
      stats: [{ label: "Randevu", value: "Online" }, { label: "Yanıt", value: "Hızlı" }, { label: "Güven", value: "Uzman" }],
      formLabels: ["Hizmet / Branş", "Randevu günü"],
      cta: "Randevu oluştur",
    },
    servis: {
      accent: "#fb923c",
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1400&q=82",
      badge: "Servis & Tamirat",
      headline: "Hızlı çözüm, doğru çağrı ve net iletişim",
      sub: "Klima, tamirat, elektronik ve bakım işlerinde doğrudan talep yakalıyoruz.",
      points: ["Acil çağrı", "Hızlı dönüşüm", "WhatsApp talep"],
      stats: [{ label: "Servis", value: "Aynı gün" }, { label: "Garanti", value: "6 ay" }, { label: "Yanıt", value: "10 dk" }],
      formLabels: ["Cihaz / Arıza", "Hizmet ilçesi"],
      cta: "Servis talebi aç",
    },
  };

  const visual = {
    accent: sector.demoAccent || visuals[sector.slug]?.accent || primary,
    image: sector.demoImage || visuals[sector.slug]?.image || DEFAULT_DEMO_IMAGE,
    badge: sector.demoBadge || visuals[sector.slug]?.badge || "Dijital görünüm",
    headline: sector.headline || sector.title,
    sub: sector.description,
    points: visuals[sector.slug]?.points || featureRows,
    stats: visuals[sector.slug]?.stats || [
      { label: "Google Ads", value: "+184%" },
      { label: "Çağrı", value: "7/24" },
      { label: "ROI", value: "5.8x" },
    ],
    formLabels: visuals[sector.slug]?.formLabels || ["Hizmet alanı", "Hizmet türü"],
    cta: visuals[sector.slug]?.cta || "Hemen başvur",
  };

  return (
    <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
      <div className="overflow-hidden rounded-[34px] border border-[#e8e1d7] bg-[linear-gradient(135deg,#f9f6f3_0%,#efe8e0_100%)] p-3 shadow-[0_40px_100px_rgba(23,30,46,0.15)] md:p-4">
        <div className="rounded-[28px] border border-white/15 bg-[#101828] p-3 md:p-5" style={{ backgroundImage: `radial-gradient(circle at top left, ${visual.accent}33, transparent 28%), linear-gradient(135deg, ${dark}, #101828 45%)` }}>
          <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full" style={{ background: visual.accent }} />
              <span>Hizmetler</span>
              <span>Fiyatlar</span>
              <span>İletişim</span>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/90">Hatay360</span>
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
            <div className="overflow-hidden rounded-[28px] border border-white/5 bg-white/95 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.12)] md:p-7">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#475467]">
                <span className="rounded-full px-2.5 py-1" style={{ background: `${visual.accent}22`, color: visual.accent }}>{visual.badge}</span>
                <span className="rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[#475467]">Dönüşüm odaklı</span>
                <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[#c2410c]">Premium</span>
              </div>

              <h2 className="mt-5 max-w-xl text-[30px] font-black leading-[1.02] tracking-[-0.06em] text-[#111827] md:text-[46px]">
                {visual.headline}
              </h2>

              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#4b5563] md:text-[17px]">
                {visual.sub}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {visual.stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[#e6edf3] bg-[#f8fafc] p-3.5">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#64748b]">{stat.label}</div>
                    <div className="mt-2 text-[22px] font-black text-[#0f172a]">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <motion.span
                  initial={{ opacity: 0.8, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror" }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#1a73e8]/20 bg-gradient-to-r from-[#e8f0fe] via-[#dbeafe] to-[#eef6ff] px-3 py-2 shadow-[0_8px_20px_rgba(26,115,232,0.15)]"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff] text-[10px] font-black text-[#1a73e8] shadow-sm">G</span>
                  <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#1a73e8]">Google Ads</span>
                </motion.span>

                <span className="rounded-full border border-[#10b981]/20 bg-[#ecfdf5] px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#047857] shadow-[0_8px_18px_rgba(16,185,129,0.08)]">+184% arama artışı</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {visual.points.map((item) => (
                  <span key={item} className="rounded-full border border-[#dfeaf0] bg-[#f8fafc] px-3 py-2 text-[12px] font-bold text-[#344054]">
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/iletisim" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-black text-white shadow-[0_12px_25px_rgba(0,168,196,0.35)]" style={{ background: visual.accent }}>
                  Hızlı teklif al <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={toTelHref(settings.phone)} className="inline-flex items-center gap-2 rounded-xl border border-[#d8dfe8] bg-white px-5 py-3 text-[14px] font-black text-[#111827]">
                  {settings.phone}
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] bg-[#111827] ring-1 ring-white/10">
              <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-video xl:aspect-[4/3]">
                <img src={visual.image} alt={`${sector.title} sektör görseli`} width="1400" height="1050" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/15 to-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-[#111827]/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                  <span className="h-2 w-2 rounded-full" style={{ background: visual.accent }} />
                  {sector.slug === "taxi" ? "Hatay Taksici" : sector.title}
                </div>
                <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/10 bg-[#111827]/80 p-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-[11px] font-bold text-white/70">
                    <span>{sector.slug === "taxi" ? "Nereden" : "Hizmet alanı"}</span>
                    <span>{sector.slug === "taxi" ? "Antakya" : "Hatay Merkez"}</span>
                  </div>
                  <div className="mt-2 h-px bg-white/10" />
                  <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-white/70">
                    <span>{sector.slug === "taxi" ? "Nereye" : "Dönüşüm"}</span>
                    <span>{sector.slug === "taxi" ? "İskenderun" : "Çağrı + WhatsApp"}</span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0.8, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror" }}
                    className="mt-3 flex items-center justify-between rounded-xl border border-[#1a73e8]/20 bg-gradient-to-r from-[#1a73e8]/18 via-[#1a73e8]/10 to-[#1677ff]/15 px-2.5 py-2 shadow-[0_10px_25px_rgba(26,115,232,0.14)]"
                  >
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#d7e3fc]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] font-black text-[#1a73e8]">G</span>
                      Google Ads
                    </span>
                    <span className="text-[12px] font-black text-[#d7e3fc]">+184%</span>
                  </motion.div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: visual.accent }}>Öncelik</span>
                  <span className="rounded-full px-2 py-1 text-[10px] font-black text-[#111827]" style={{ background: visual.accent }}>Online</span>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{visual.formLabels[0]}</label>
                    <input className="mt-2 w-full border-0 bg-transparent text-[14px] font-bold text-white placeholder:text-slate-500 focus:outline-none" placeholder={sector.slug === "taxi" ? "Antakya / Defne" : "Hatay / İlçe seçimi"} />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{visual.formLabels[1]}</label>
                    <input className="mt-2 w-full border-0 bg-transparent text-[14px] font-bold text-white placeholder:text-slate-500 focus:outline-none" placeholder={sector.slug === "taxi" ? "İskenderun / Havalimanı" : "Hizmet türü"} />
                  </div>
                </div>

                <button className="mt-5 w-full rounded-xl px-4 py-3 text-[14px] font-black text-[#111827]" style={{ background: visual.accent }}>
                  {visual.cta}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {sectorHighlights.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap] ?? Target;
              return (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -4 }}
                  className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-white backdrop-blur-sm"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${visual.accent}22`, color: visual.accent }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-[18px] font-black">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/70">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectorPage() {
  const { slug } = useParams();
  const { sectors } = useContent();
  const activeSlug = slug === "taksi" ? "taxi" : slug;
  const sector = sectors.find((item) => item.slug === activeSlug) ?? null;

  if (!sector) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageHero eyebrow={sector.eyebrow} title={sector.title} desc={sector.description} compact>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/iletisim" className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3.5 text-[15px] font-bold text-white shadow-[0px_12px_30px_rgba(0,168,196,0.35)]">
            Teklif alın <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/demolar" className="inline-flex items-center gap-2 rounded-xl border border-[#d9dbe9] bg-white px-6 py-3.5 text-[15px] font-bold text-[#1a1a1a] hover:border-[#00a8c4] hover:text-[#00a8c4]">
            Demo listesi
          </Link>
        </div>
      </PageHero>

      <SectorDemoPreview sector={sector} />

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-[#ecebf5] bg-white p-8 shadow-[0px_18px_40px_rgba(25,33,61,0.06)]">
            <span className="text-[12px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Neden bu yaklaşım?</span>
            <h2 className="mt-4 text-[28px] font-black text-[#1a1a1a] sm:text-[34px]">
              Daha çok arama, daha çok çağrı, daha çok dönüşüm.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#514f6e]">{sector.pain}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {sector.heroPoints.map((point) => (
                <span key={point} className="rounded-full bg-[#e8f8fb] px-3 py-1.5 text-[12px] font-bold text-[#00a8c4]">
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-[#00a8c4] to-[#3ec8dc] p-[1px] shadow-[0px_18px_45px_rgba(0,168,196,0.18)]">
            <div className="h-full rounded-[27px] bg-white p-8">
              <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Önerimiz</p>
              <p className="mt-4 text-[22px] font-black text-[#1a1a1a]">{sector.offer}</p>
              <ul className="mt-6 space-y-3 text-[15px] text-[#514f6e]">
                {sector.plan.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f8fb] text-[#00a8c4]">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {sector.metrics.map((metric) => (
            <div key={metric.label} className="rounded-[24px] border border-[#ecebf5] bg-white p-6 shadow-sm">
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#6f6c8f]">{metric.label}</p>
              <p className="mt-3 text-[26px] font-black text-[#1a1a1a]">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {sector.highlights.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] ?? Target;
            return (
              <motion.div key={item.title} whileHover={{ y: -6 }} className="rounded-[28px] border border-[#ecebf5] bg-white p-6 shadow-[0px_18px_40px_rgba(25,33,61,0.05)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f8fb] text-[#00a8c4]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-[20px] font-black text-[#1a1a1a]">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#6f6c8f]">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="rounded-[30px] border border-[#ecebf5] bg-white p-8 shadow-[0px_16px_40px_rgba(25,33,61,0.06)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Anahtar kelimeler</p>
              <h3 className="mt-3 text-[28px] font-black text-[#1a1a1a]">Örnek arama ifadeleri</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {sector.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-[#dfeaf0] bg-[#f8fafc] px-3 py-2 text-[13px] font-bold text-[#3c3a5c]">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-12 sm:px-8">
        <div className="rounded-[30px] border border-[#ecebf5] bg-white/90 p-8 shadow-[0px_16px_40px_rgba(25,33,61,0.06)] backdrop-blur-sm">
          <CallbackForm />
        </div>
      </section>
    </>
  );
}
