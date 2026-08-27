import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  CarFront,
  Truck,
  Stethoscope,
  Wrench,
  Phone,
  MapPin,
  MessageCircle,
  Star,
  Calendar,
  Clock3,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSiteReducedMotion } from "../lib/site-motion";
import { Link } from "react-router";
import { BrandLogo } from "./brand-logo";
import { BrushLead } from "./brush-lead";

/**
 * Sticky stack: https://scroll-driven-animations.style/demos/stacking-cards/css/
 * Sağ panel: gerçekçi ürün UI mockup (arama reklamı, çağrı, Maps, randevu) — cartoon SVG yok.
 */

type SectorId = "taxi" | "nakliyat" | "klinik" | "servis";

const SECTORS: {
  id: SectorId;
  icon: typeof CarFront;
  title: string;
  headline: string;
  description: string;
  metrics: { label: string; value: string }[];
  keywords: string[];
  cta: string;
  href: string;
  accent: string;
  soft: string;
}[] = [
  {
    id: "taxi",
    icon: CarFront,
    title: "Taksi & Transfer",
    headline: "“Taksi” arayan yolcuyu telefonunuza getirin.",
    description:
      "Hatay, İskenderun ve Antakya’da arama + harita görünürlüğü ile çağrı ve WhatsApp rezervasyonlarını büyütürüz. Gece ve gündüz arayanlar aynı funnel’da toplanır.",
    metrics: [
      { label: "Hedef", value: "Çağrı" },
      { label: "Kanal", value: "Ads + Maps" },
      { label: "Tempo", value: "7/24" },
    ],
    keywords: ["Hatay taksi", "İskenderun taksi", "Havaalanı transfer"],
    cta: "Taksi paketini incele",
    href: "/sektor/taksi",
    accent: "#0891b2",
    soft: "#f4fbfd",
  },
  {
    id: "nakliyat",
    icon: Truck,
    title: "Nakliyat",
    headline: "Taşıma arayan müşteriye net teklif formu.",
    description:
      "Evden eve ve ofis taşıma aramalarında landing + yerel reklam ile teklif taleplerini toplayıp WhatsApp’a yönlendiririz. Fiyat şeffaflığı dönüşümü artırır.",
    metrics: [
      { label: "Hedef", value: "Teklif" },
      { label: "Kanal", value: "Arama" },
      { label: "Alan", value: "Yerel" },
    ],
    keywords: ["Hatay nakliyat", "Evden eve", "Ofis taşıma"],
    cta: "Nakliyat paketini incele",
    href: "/sektor/nakliyat",
    accent: "#0369a1",
    soft: "#f5f9fc",
  },
  {
    id: "klinik",
    icon: Stethoscope,
    title: "Klinik & Sağlık",
    headline: "Randevu arayan hastayı doğru klinik sayfasına alın.",
    description:
      "Diş, estetik ve uzman hekimlerde Google arama + Maps ile randevu formunu dolduran başvuru hedefleriz. Güven sinyali ve net iletişim zorunlu.",
    metrics: [
      { label: "Hedef", value: "Randevu" },
      { label: "Kanal", value: "SEO + Ads" },
      { label: "Güven", value: "Yüksek" },
    ],
    keywords: ["Hatay diş", "Antakya estetik", "Doktor randevu"],
    cta: "Sağlık paketini incele",
    href: "/sektor/klinik",
    accent: "#0f766e",
    soft: "#f3faf8",
  },
  {
    id: "servis",
    icon: Wrench,
    title: "Servis & Tamirat",
    headline: "Acil arayan müşteriyi anında yakalayın.",
    description:
      "Klima, oto ve elektronik serviste ‘şimdi açık’ aramalarına hızlı dönüşüm sayfası kurarız. Telefon ve WhatsApp CTA’ları her ekranda önde.",
    metrics: [
      { label: "Hedef", value: "Acil çağrı" },
      { label: "Kanal", value: "Yerel Ads" },
      { label: "Hız", value: "Anında" },
    ],
    keywords: ["Klima servisi", "Oto tamir", "Elektronik servis"],
    cta: "Servis paketini incele",
    href: "/sektor/servis",
    accent: "#b45309",
    soft: "#fbf8f3",
  },
];

function useLiveCount(target: number, reduced: boolean) {
  const [value, setValue] = useState(reduced ? target : Math.max(0, target - 12));
  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const id = window.setInterval(() => {
      setValue((v) => (v >= target ? target - 8 : v + 1));
    }, 1800);
    return () => window.clearInterval(id);
  }, [target, reduced]);
  return value;
}

function PhoneChrome({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="rounded-[28px] border border-[#dbe4ea] bg-[#0f172a] p-2 shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="overflow-hidden rounded-[22px] bg-[#f8fafc]">
          <div className="flex items-center justify-between bg-white px-4 py-2.5">
            <span className="text-[10px] font-bold text-[#64748b]">09:41</span>
            <span className="h-1.5 w-10 rounded-full bg-[#0f172a]/80" />
            <span className="text-[10px] font-bold text-[#64748b]">5G</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function SceneArt({ id }: { id: SectorId; accent: string }) {
  const reduced = useSiteReducedMotion();
  const calls = useLiveCount(48, reduced);
  const [toast, setToast] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const idTimer = window.setInterval(() => setToast((t) => (t + 1) % 3), 3200);
    return () => window.clearInterval(idTimer);
  }, [reduced]);

  if (id === "taxi") {
    const toasts = [
      { title: "Gelen çağrı", sub: "İskenderun · 2 dk önce" },
      { title: "WhatsApp rezervasyon", sub: "Antakya merkez" },
      { title: "Maps yönlendirme", sub: "Hatay taksi araması" },
    ];
    return (
      <div className="relative flex h-full min-h-[320px] items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#e8f4f7_0%,#f7fbfd_45%,#eef6f8_100%)] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.35]" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #67e8f9 0%, transparent 40%)" }} />
        <PhoneChrome>
          <div className="space-y-3 bg-[#f1f5f9] p-3 pb-5">
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <BrandLogo id="google" size={22} />
                <span className="text-[11px] font-bold text-[#64748b]">Google · Sponsorlu</span>
              </div>
              <p className="mt-2 text-[13px] font-extrabold text-[#1a0dab]">Hatay Taksi | 7/24 Transfer</p>
              <p className="mt-0.5 text-[11px] text-[#4d5156]">Hemen ara · Antakya & İskenderun · WhatsApp rezervasyon</p>
              <div className="mt-2 flex gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#ecfdf5] px-2 py-1 text-[10px] font-bold text-[#059669]">
                  <Phone className="h-3 w-3" /> Ara
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#eff6ff] px-2 py-1 text-[10px] font-bold text-[#2563eb]">
                  <MapPin className="h-3 w-3" /> Yol tarifi
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">Bugün</p>
              <p className="mt-1 text-[28px] font-black tabular-nums text-[#0f172a]">{calls}</p>
              <p className="text-[11px] font-semibold text-[#64748b]">gelen çağrı / rezervasyon</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e2e8f0]">
                <motion.div
                  className="h-full rounded-full bg-[#0891b2]"
                  animate={reduced ? { width: "72%" } : { width: ["55%", "78%", "68%"] }}
                  transition={reduced ? undefined : { duration: 5, repeat: Infinity }}
                />
              </div>
            </div>
          </div>
        </PhoneChrome>
        <AnimatePresence mode="wait">
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 12, x: 8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute bottom-5 right-4 max-w-[200px] rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur"
          >
            <p className="text-[12px] font-black text-[#0f172a]">{toasts[toast].title}</p>
            <p className="mt-0.5 text-[11px] text-[#64748b]">{toasts[toast].sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (id === "nakliyat") {
    return (
      <div className="relative flex h-full min-h-[320px] items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#e8f1f8_0%,#f7fafc_50%,#eef4f9_100%)] p-6 sm:p-8">
        <div className="w-full max-w-[340px] space-y-3">
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-black text-[#0f172a]">Teklif formu · canlı</p>
              <span className="rounded-full bg-[#dbeafe] px-2 py-0.5 text-[10px] font-bold text-[#1d4ed8]">Yeni</span>
            </div>
            <div className="mt-3 space-y-2">
              {["Evden eve · Antakya → İskenderun", "2+1 daire · asansör var", "Tercih: hafta sonu"].map((row) => (
                <div key={row} className="rounded-xl bg-[#f8fafc] px-3 py-2 text-[12px] font-semibold text-[#334155]">
                  {row}
                </div>
              ))}
            </div>
            <motion.button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0369a1] py-2.5 text-[13px] font-black text-white"
              animate={reduced ? undefined : { scale: [1, 1.015, 1] }}
              transition={reduced ? undefined : { duration: 2.8, repeat: Infinity }}
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp’tan teklif al
            </motion.button>
          </div>
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <BrandLogo id="google" size={20} />
              <p className="text-[12px] font-bold text-[#1a0dab]">Hatay Evden Eve Nakliyat</p>
            </div>
            <p className="mt-1 text-[11px] text-[#4d5156]">Ücretsiz keşif · aynı gün fiyat · sigortalı taşıma</p>
          </div>
        </div>
      </div>
    );
  }

  if (id === "klinik") {
    const slots = ["09:30", "11:00", "14:15", "16:45"];
    return (
      <div className="relative flex h-full min-h-[320px] items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#e6f5f2_0%,#f7fbfa_50%,#eef7f5_100%)] p-6 sm:p-8">
        <div className="w-full max-w-[340px] rounded-2xl border border-[#d1e7e2] bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-start gap-3 border-b border-[#eef2f0] pb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f766e] text-white">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[14px] font-black text-[#0f172a]">Klinik randevu ekranı</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#b45309]">
                <Star className="h-3.5 w-3.5 fill-current" /> 4.9 · Maps yorumları
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">Bugün müsait</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {slots.map((slot, i) => (
              <motion.div
                key={slot}
                className={`rounded-xl border px-3 py-2.5 text-center text-[13px] font-bold ${
                  i === 1 ? "border-[#0f766e] bg-[#ecfdf8] text-[#0f766e]" : "border-[#e2e8f0] bg-[#f8fafc] text-[#334155]"
                }`}
                animate={reduced || i !== 1 ? undefined : { boxShadow: ["0 0 0 0 rgba(15,118,110,0)", "0 0 0 6px rgba(15,118,110,0.12)", "0 0 0 0 rgba(15,118,110,0)"] }}
                transition={reduced ? undefined : { duration: 2.4, repeat: Infinity }}
              >
                <Calendar className="mx-auto mb-1 h-3.5 w-3.5 opacity-70" />
                {slot}
              </motion.div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f0fdfa] px-3 py-2">
            <span className="text-[12px] font-semibold text-[#0f766e]">Online başvuru</span>
            <span className="text-[12px] font-black text-[#0f172a]">+12 bu hafta</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[320px] items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#f3ebe0_0%,#fbf8f3_50%,#f1e8dc_100%)] p-6 sm:p-8">
      <PhoneChrome>
        <div className="space-y-3 bg-[#fff7ed] p-3 pb-5">
          <div className="rounded-xl border border-[#fed7aa] bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ea580c] text-white">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[12px] font-black text-[#0f172a]">Acil çağrı</p>
                <p className="text-[10px] font-semibold text-[#9a3412]">Klima servisi · şimdi açık</p>
              </div>
            </div>
            <motion.div
              className="mt-3 flex items-center justify-center gap-6 py-2"
              animate={reduced ? undefined : { opacity: [1, 0.85, 1] }}
              transition={reduced ? undefined : { duration: 1.6, repeat: Infinity }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ef4444] text-white shadow-md">
                <Phone className="h-5 w-5 rotate-[135deg]" />
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#22c55e] text-white shadow-md">
                <Phone className="h-5 w-5" />
              </span>
            </motion.div>
          </div>
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#64748b]">
              <Clock3 className="h-3.5 w-3.5" /> Ortalama yanıt
            </div>
            <p className="mt-1 text-[22px] font-black text-[#0f172a]">&lt; 45 sn</p>
            <p className="text-[11px] text-[#78716c]">Yerel Ads + WhatsApp CTA</p>
          </div>
        </div>
      </PhoneChrome>
    </div>
  );
}

export function SectorSolutions() {
  const n = SECTORS.length;

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-[14px] font-semibold uppercase tracking-wider text-[#00a8c4]">Sektör çözümleri</span>
        <h2 className="mt-3 text-[32px] font-bold tracking-tight text-[#1a1a1a] sm:text-[40px]">
          Sektöre özel satış ekranı
        </h2>
        <BrushLead>
          Kaydırınca kartlar üst üste biner; sağda gerçekçi arama, çağrı ve randevu önizlemeleri görürsünüz.
        </BrushLead>
      </div>

      <div className="sector-stack mt-14" style={{ ["--numcards" as string]: n }}>
        {SECTORS.map((sector, index) => {
          const Icon = sector.icon;
          const i = index + 1;
          return (
            <article
              key={sector.id}
              className="sector-stack__card"
              style={{
                ["--index" as string]: i,
                zIndex: i,
              }}
            >
              <div
                className="sector-stack__inner grid overflow-hidden rounded-[28px] border border-[#d8e6eb] bg-white shadow-[0_24px_60px_rgba(15,40,50,0.12)] lg:grid-cols-[1.05fr_0.95fr]"
                style={{ background: `linear-gradient(180deg, #fff 0%, ${sector.soft} 100%)` }}
              >
                <div className="flex flex-col justify-center p-7 sm:p-9">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
                      style={{ background: sector.accent }}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7b8b94]">
                        {String(i).padStart(2, "0")} / {String(n).padStart(2, "0")}
                      </p>
                      <h3 className="text-[26px] font-black tracking-tight text-[#102a33] sm:text-[30px]">{sector.title}</h3>
                    </div>
                  </div>
                  <p className="mt-5 text-[18px] font-bold leading-snug" style={{ color: sector.accent }}>
                    {sector.headline}
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#5b6b75]">{sector.description}</p>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {sector.metrics.map((m) => (
                      <div key={m.label} className="rounded-xl border border-black/5 bg-white/80 px-2.5 py-2 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">{m.label}</p>
                        <p className="mt-0.5 text-[13px] font-black text-[#1e293b]">{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {sector.keywords.map((k) => (
                      <span key={k} className="rounded-full border border-black/5 bg-white px-3 py-1 text-[11px] font-bold text-[#52626d]">
                        {k}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={sector.href}
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-black text-white shadow-md"
                    style={{ background: sector.accent }}
                  >
                    {sector.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <SceneArt id={sector.id} accent={sector.accent} />
              </div>
            </article>
          );
        })}
      </div>

      <style>{`
        .sector-stack {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .sector-stack__card {
          position: sticky;
          top: calc(5.25rem + (var(--index) - 1) * 0.75rem);
          padding-bottom: 0.35rem;
        }
        .sector-stack__inner {
          transform-origin: center top;
          will-change: transform;
          min-height: 420px;
        }
        @supports (animation-timeline: view()) {
          .sector-stack__inner {
            animation: sectorStackRecede linear both;
            animation-timeline: view();
            animation-range: exit 0% exit 100%;
          }
          @keyframes sectorStackRecede {
            to {
              transform: scale(0.94);
              filter: brightness(0.94);
            }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sector-stack__inner { animation: none !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}
