import { useMemo, useState } from "react";
import { HelpCircle, Bot, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BrushLead } from "./brush-lead";

/** simpleicons CDN — https://github.com/simple-icons/simple-icons */
const icon = (slug: string, color: string) =>
  `https://cdn.simpleicons.org/${slug}/${color.replace("#", "")}`;

type TechSeed = {
  id: string;
  name: string;
  category: string;
  blurb: string;
  tip: string;
  color: string;
  slug: string;
};

type TechItem = TechSeed & {
  logo: string;
  x: number;
  y: number;
  delay: number;
  size: "sm" | "md";
};

/** Aktif yığın + proje dışı ama sunduğumuz / çalıştığımız teknolojiler — liste dolu görünsün */
const TECH_SEEDS: TechSeed[] = [
  {
    id: "react",
    name: "React",
    category: "Frontend",
    blurb: "Bileşen tabanlı arayüzler; panel, admin ve satış sayfaları.",
    tip: "Panel & site UI",
    color: "#61DAFB",
    slug: "react",
  },
  {
    id: "nextdotjs",
    name: "Next.js",
    category: "Frontend",
    blurb: "SSR, SSG ve API route’ları ile kurumsal web uygulamaları.",
    tip: "Full-stack React",
    color: "#000000",
    slug: "nextdotjs",
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "Dil",
    blurb: "Tip güvenli JavaScript; büyük panellerde hata azaltır.",
    tip: "Tip güvenliği",
    color: "#3178C6",
    slug: "typescript",
  },
  {
    id: "vite",
    name: "Vite",
    category: "Build",
    blurb: "Anında geliştirme sunucusu ve optimize production build.",
    tip: "Hızlı build",
    color: "#646CFF",
    slug: "vite",
  },
  {
    id: "tailwindcss",
    name: "Tailwind",
    category: "UI",
    blurb: "Tutarlı tasarım sistemi ve hızlı arayüz iterasyonu.",
    tip: "Stil sistemi",
    color: "#06B6D4",
    slug: "tailwindcss",
  },
  {
    id: "nodedotjs",
    name: "Node.js",
    category: "Backend",
    blurb: "API, oturum, ödeme ve operasyon uçları.",
    tip: "Sunucu & API",
    color: "#5FA04E",
    slug: "nodedotjs",
  },
  {
    id: "express",
    name: "Express",
    category: "Backend",
    blurb: "Hafif Node framework; REST API ve middleware katmanı.",
    tip: "API katmanı",
    color: "#000000",
    slug: "express",
  },
  {
    id: "python",
    name: "Python",
    category: "Dil",
    blurb: "Otomasyon, veri işleme ve AI destekli araçlar için.",
    tip: "Script & AI",
    color: "#3776AB",
    slug: "python",
  },
  {
    id: "django",
    name: "Django",
    category: "Backend",
    blurb: "Güvenli ve ölçeklenebilir Python web framework’ü.",
    tip: "Python web",
    color: "#092E20",
    slug: "django",
  },
  {
    id: "laravel",
    name: "Laravel",
    category: "Backend",
    blurb: "PHP ile zarif web uygulamaları, admin ve e-ticaret.",
    tip: "PHP framework",
    color: "#FF2D20",
    slug: "laravel",
  },
  {
    id: "php",
    name: "PHP",
    category: "Dil",
    blurb: "WordPress ve klasik web altyapıları için temel dil.",
    tip: "Web dili",
    color: "#777BB4",
    slug: "php",
  },
  {
    id: "wordpress",
    name: "WordPress",
    category: "CMS",
    blurb: "Kurumsal site, blog ve içerik yönetimi için CMS.",
    tip: "İçerik sitesi",
    color: "#21759B",
    slug: "wordpress",
  },
  {
    id: "flutter",
    name: "Flutter",
    category: "Mobil",
    blurb: "Tek kod tabanı ile iOS ve Android uygulamaları.",
    tip: "Mobil UI",
    color: "#02569B",
    slug: "flutter",
  },
  {
    id: "reactnative",
    name: "RN",
    category: "Mobil",
    blurb: "React Native ile native performanslı mobil uygulamalar.",
    tip: "Cross-platform",
    color: "#61DAFB",
    slug: "react",
  },
  {
    id: "dart",
    name: "Dart",
    category: "Dil",
    blurb: "Flutter uygulamalarının dili; hızlı ve modern.",
    tip: "Flutter dili",
    color: "#0175C2",
    slug: "dart",
  },
  {
    id: "postgresql",
    name: "Postgres",
    category: "Veri",
    blurb: "Güçlü ilişkisel veritabanı; karmaşık sorgular ve güven.",
    tip: "İlişkisel DB",
    color: "#4169E1",
    slug: "postgresql",
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "Veri",
    blurb: "Yaygın ilişkisel veritabanı; hosting uyumlu.",
    tip: "SQL DB",
    color: "#4479A1",
    slug: "mysql",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "Veri",
    blurb: "Esnek belge tabanlı NoSQL; hızlı prototip ve API.",
    tip: "NoSQL",
    color: "#47A248",
    slug: "mongodb",
  },
  {
    id: "sqlite",
    name: "SQLite",
    category: "Veri",
    blurb: "Tek dosyada güvenilir veri; müşteri ve içerik kayıtları.",
    tip: "Yerel DB",
    color: "#003B57",
    slug: "sqlite",
  },
  {
    id: "redis",
    name: "Redis",
    category: "Veri",
    blurb: "Önbellek ve kuyruk; oturum ve hız için.",
    tip: "Cache",
    color: "#FF4438",
    slug: "redis",
  },
  {
    id: "docker",
    name: "Docker",
    category: "DevOps",
    blurb: "Konteyner ile tutarlı ortam; geliştirme ve dağıtım.",
    tip: "Konteyner",
    color: "#2496ED",
    slug: "docker",
  },
  {
    id: "nginx",
    name: "Nginx",
    category: "DevOps",
    blurb: "Ters vekil, SSL ve yüksek trafikli site sunumu.",
    tip: "Web sunucu",
    color: "#009639",
    slug: "nginx",
  },
  {
    id: "git",
    name: "Git",
    category: "Tool",
    blurb: "Sürüm kontrolü; ekip çalışması ve güvenli yayın.",
    tip: "Versiyon",
    color: "#F05032",
    slug: "git",
  },
  {
    id: "github",
    name: "GitHub",
    category: "Tool",
    blurb: "Kod deposu, CI ve işbirliği.",
    tip: "Repo & CI",
    color: "#181717",
    slug: "github",
  },
  {
    id: "figma",
    name: "Figma",
    category: "Tasarım",
    blurb: "UI/UX tasarım ve prototip; müşteriyle ortak çalışma.",
    tip: "Tasarım",
    color: "#F24E1E",
    slug: "figma",
  },
  {
    id: "googleads",
    name: "Ads",
    category: "Reklam",
    blurb: "Google Ads arama ve performans kampanyaları.",
    tip: "Arama reklamı",
    color: "#4285F4",
    slug: "googleads",
  },
  {
    id: "meta",
    name: "Meta",
    category: "Reklam",
    blurb: "Facebook & Instagram kampanyaları.",
    tip: "Sosyal reklam",
    color: "#0082FB",
    slug: "meta",
  },
  {
    id: "googlemaps",
    name: "Maps",
    category: "Yerel",
    blurb: "İşletme kaydı ve yerel görünürlük.",
    tip: "Harita kaydı",
    color: "#4285F4",
    slug: "googlemaps",
  },
  {
    id: "googleanalytics",
    name: "Analytics",
    category: "Ölçüm",
    blurb: "Trafik ve dönüşüm ölçümü.",
    tip: "Analitik",
    color: "#E37400",
    slug: "googleanalytics",
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "AI",
    blurb: "İçerik, SEO önerisi ve asistan özelliklerinde AI.",
    tip: "Yapay zeka",
    color: "#412991",
    slug: "openai",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Ödeme",
    blurb: "Uluslararası ödeme altyapısı (proje ihtiyacına göre).",
    tip: "Ödeme",
    color: "#635BFF",
    slug: "stripe",
  },
  {
    id: "framer",
    name: "Motion",
    category: "UX",
    blurb: "Anlamlı animasyonlar; dikkat ve hiyerarşi.",
    tip: "Animasyon",
    color: "#0055FF",
    slug: "framer",
  },
];

/** İki halkada dengeli yerleştirme — alan dolu görünsün */
function buildOrbitItems(seeds: TechSeed[]): TechItem[] {
  const outer = Math.ceil(seeds.length * 0.62);
  const inner = seeds.length - outer;
  return seeds.map((seed, index) => {
    const onOuter = index < outer;
    const ringIndex = onOuter ? index : index - outer;
    const ringCount = onOuter ? outer : Math.max(inner, 1);
    const radius = onOuter ? 38 : 22;
    const angle = (ringIndex / ringCount) * Math.PI * 2 - Math.PI / 2;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * (radius * 0.92);
    return {
      ...seed,
      logo: icon(seed.slug, seed.color),
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      delay: (index % 10) * 0.22,
      size: onOuter ? "md" : "sm",
    };
  });
}

export function TechnologiesOrbit() {
  const reduced = useReducedMotion() ?? false;
  const techs = useMemo(() => buildOrbitItems(TECH_SEEDS), []);
  const [active, setActive] = useState<TechItem | null>(techs[0] ?? null);

  return (
    <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
      <div className="relative overflow-hidden rounded-[32px] border border-[#dce8ee] bg-gradient-to-br from-[#0b1520] via-[#102636] to-[#0d3a44] p-6 text-white shadow-[0_24px_70px_rgba(15,40,50,0.22)] sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 28%, rgba(0,168,196,0.4), transparent 42%), radial-gradient(circle at 82% 68%, rgba(34,211,238,0.22), transparent 48%)",
          }}
        />

        <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#7ee0ec]">Teknolojilerimiz</span>
            <h2 className="mt-3 text-[28px] font-black tracking-tight sm:text-[36px]">
              Yazılım karmaşık olabilir; doğru yolu biz buluruz.
            </h2>
            <BrushLead className="max-w-lg text-[#d8eef3]">
              {techs.length}+ teknoloji — logoya tıklayın, asistan anlatsın.
            </BrushLead>
          </div>

          <aside className="relative w-full max-w-sm shrink-0 rounded-3xl border border-cyan-300/25 bg-white/8 p-4 backdrop-blur-md lg:mt-2">
            <div className="flex items-center gap-3">
              <span className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#22d3ee] to-[#0891b2] shadow-[0_0_28px_rgba(34,211,238,0.45)]">
                <Bot className="h-7 w-7 text-white" />
                {!reduced ? <span className="absolute inset-0 animate-ping rounded-2xl bg-cyan-300/20" /> : null}
              </span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7ee0ec]">Hatay360 asistanı</p>
                <p className="text-[13px] font-semibold text-white/70">Uçan logolardan birini seçin</p>
              </div>
              <Sparkles className="ml-auto h-4 w-4 text-[#7ee0ec]" />
            </div>
            <AnimatePresence mode="wait">
              {active ? (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 rounded-2xl border border-white/10 bg-[#0b1520]/75 p-4"
                >
                  <div className="flex items-start gap-3">
                    <img src={active.logo} alt="" className="h-9 w-9 rounded-lg bg-white p-1.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">{active.category}</p>
                      <h3 className="text-[18px] font-black" style={{ color: active.color === "#000000" ? "#e2e8f0" : active.color }}>
                        {active.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActive(null)}
                      className="rounded-lg border border-white/10 p-1.5 text-white/50 hover:bg-white/10"
                      aria-label="Kapat"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/80">{active.blurb}</p>
                  <p className="mt-2 text-[12px] font-semibold text-[#7ee0ec]">İpucu: {active.tip}</p>
                </motion.div>
              ) : (
                <p className="mt-4 text-[14px] leading-relaxed text-white/55">
                  Web, mobil, backend, veri, DevOps, reklam ve AI — ihtiyaçına göre doğru yığını seçeriz.
                </p>
              )}
            </AnimatePresence>
          </aside>
        </div>

        <div className="relative z-[1] mx-auto mt-8 aspect-square w-full max-w-[640px] sm:mt-10 sm:max-w-3xl sm:aspect-[5/4]">
          <div className="absolute inset-[4%] rounded-full border border-white/10" />
          <div className="absolute inset-[16%] rounded-full border border-dashed border-cyan-400/25" />
          <div className="absolute inset-[30%] rounded-full border border-white/8" />

          {techs.map((tech) => {
            const box = tech.size === "sm" ? "h-[56px] w-[56px] sm:h-[62px] sm:w-[62px]" : "h-[64px] w-[64px] sm:h-[72px] sm:w-[72px]";
            const img = tech.size === "sm" ? "h-6 w-6 sm:h-7 sm:w-7" : "h-7 w-7 sm:h-8 sm:w-8";
            return (
              <motion.button
                key={tech.id}
                type="button"
                onClick={() => setActive(tech)}
                className="absolute z-[2] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${tech.x}%`, top: `${tech.y}%` }}
                animate={reduced ? undefined : { y: [0, -10, 0, 8, 0], x: [0, 5, 0, -5, 0] }}
                transition={
                  reduced
                    ? undefined
                    : { duration: 6.5 + tech.delay, repeat: Infinity, ease: "easeInOut", delay: tech.delay }
                }
                whileHover={{ scale: 1.12, zIndex: 5 }}
                aria-label={`${tech.name}: ${tech.tip}`}
              >
                <span
                  className={`relative flex ${box} flex-col items-center justify-center rounded-2xl border bg-white shadow-[0_12px_28px_rgba(0,0,0,0.35)] ${
                    active?.id === tech.id ? "border-[#00a8c4] ring-2 ring-[#00a8c4]/50" : "border-white/20"
                  }`}
                >
                  <img src={tech.logo} alt="" className={`${img} object-contain`} loading="lazy" />
                  <span className="mt-0.5 max-w-[58px] truncate text-[8px] font-bold text-[#334155] sm:text-[9px]">{tech.name}</span>
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0f172a] text-[#7ee0ec] ring-2 ring-white sm:h-5 sm:w-5">
                    <HelpCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        <p className="relative z-[1] mt-4 text-center text-[11px] font-semibold text-white/40">
          Liste düzenli güncellenir — web, mobil, backend, CMS, DevOps, reklam ve AI.
        </p>
      </div>
    </section>
  );
}
