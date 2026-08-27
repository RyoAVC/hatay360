import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, ClipboardCheck, FileBarChart, MessagesSquare, ShieldCheck, LockKeyhole } from "lucide-react";
import { Reveal } from "./motion-primitives";
import { useSiteReducedMotion } from "../lib/site-motion";

const DELIVERABLES = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Net iş kapsamı",
    desc: "Başlamadan önce hedefi, teslimleri, zamanlamayı ve sorumlulukları tek sayfada netleştiririz.",
  },
  {
    icon: MessagesSquare,
    step: "02",
    title: "Tek iletişim noktası",
    desc: "Tasarım, reklam ve yazılım ekipleri dağılmaz; proje sorumlunuz üzerinden düzenli bilgi alırsınız.",
  },
  {
    icon: FileBarChart,
    step: "03",
    title: "Görünür raporlama",
    desc: "Yapılan işler, reklam harcaması ve ölçülebilen sonuçlar müşteri panelinde kayıt altında kalır.",
  },
];

export function IntegrationsShowcase() {
  const reduced = useSiteReducedMotion();

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
        <Reveal>
          <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#00a8c4]">Ajans çalışma standardı</span>
          <h2 className="mt-3 text-[34px] font-black tracking-[-0.045em] text-[#111827] sm:text-[43px]">
            Sadece teslim etmiyoruz; süreci görünür yönetiyoruz.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[#5b6875]">
            Tekrarlanan hizmet listeleri yerine, bizimle çalışırken ne yaşayacağınızı açıkça gösteriyoruz.
          </p>
          <Link to="/hakkimizda" className="mt-6 inline-flex items-center gap-2 text-[14px] font-black text-[#008da8]">
            Çalışma biçimimizi incele <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {DELIVERABLES.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-[24px] border border-[#dfe9ec] bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.05)]"
              >
                <span className="absolute right-5 top-4 text-[34px] font-black text-[#e9f4f6]">{item.step}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-[18px] font-black text-[#17222a]">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#64727c]">{item.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </div>

      <Link
        to="/musteri/giris"
        className="group relative mt-8 flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-[22px] border border-[#9fd7e3]/70 bg-gradient-to-r from-[#e8f9fc] via-[#f4fcfd] to-[#eef8ff] px-5 py-4 shadow-[0_12px_36px_rgba(0,168,196,0.12)] transition hover:border-[#00a8c4]/50 hover:shadow-[0_16px_44px_rgba(0,168,196,0.18)]"
      >
        {!reduced ? (
          <span
            className="pointer-events-none absolute inset-y-0 -left-1/4 w-1/3 skew-x-[-18deg] bg-white/50"
            style={{ animation: "h360TrustShine 3.6s ease-in-out infinite" }}
            aria-hidden
          />
        ) : null}
        <span className="relative flex items-center gap-3 text-[13px] font-black text-[#17414b] sm:text-[14px]">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00a8c4] to-[#0891b2] text-white shadow-[0_8px_22px_rgba(0,168,196,0.35)]">
            <ShieldCheck className={`h-5 w-5 ${reduced ? "" : "animate__animated animate__pulse animate__infinite"}`} />
            <LockKeyhole className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white p-0.5 text-[#0891b2] shadow" />
          </span>
          <span>
            Müşteri verileri firma hesabına göre ayrılır
            <span className="mt-0.5 block text-[12px] font-semibold text-[#5b7a84]">Admin kayıtlarıyla yönetilir · güvenli oturum</span>
          </span>
        </span>
        <span className="relative inline-flex items-center gap-1.5 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[12px] font-black text-white shadow-sm transition group-hover:bg-[#0891b2]">
          Müşteri paneli girişi
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
        <style>{`
          @keyframes h360TrustShine {
            0% { transform: translateX(-30%) skewX(-18deg); opacity: 0; }
            30% { opacity: 0.7; }
            100% { transform: translateX(380%) skewX(-18deg); opacity: 0; }
          }
        `}</style>
      </Link>
    </section>
  );
}
