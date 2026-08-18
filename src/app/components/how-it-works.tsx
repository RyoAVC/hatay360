import { Link } from "react-router";
import { motion } from "motion/react";
import { PhoneCall, Palette, Plug, Rocket } from "lucide-react";
import { Reveal, staggerItem } from "./motion-primitives";

const STEPS = [
  {
    n: "01",
    icon: PhoneCall,
    title: "Sizi arayalım",
    desc: "Numaranızı bırakın. Hedef, bütçe ve hangi hizmetin size uyduğunu 15 dakikada netleştiririz.",
  },
  {
    n: "02",
    icon: Palette,
    title: "Mağazayı hazırlarız",
    desc: "Tema veya özel tasarım, SSL, sanal POS ve panel eğitimi. Aynı gün yayına alınabilir.",
  },
  {
    n: "03",
    icon: Plug,
    title: "Kanalları bağlarız",
    desc: "Trendyol, Hepsiburada ve diğer pazaryerleri; Google/Meta reklam hesabı tek panelde.",
  },
  {
    n: "04",
    icon: Rocket,
    title: "Satışa başlarsınız",
    desc: "Sipariş, stok ve destek Hatay360 ile yürür. 15 gün deneme, kredi kartı gerekmez.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-[14px] font-semibold uppercase tracking-wider text-[#00a8c4]">
            Nasıl çalışır?
          </span>
          <h2 className="mt-3 text-[32px] font-bold tracking-tight text-[#1a1a1a] sm:text-[40px]">
            Dört adımda satışa açılın
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[#514f6e]">
            Paketi seçip beklemeyin: sizi ararız, mağazayı kurarız, kanalları bağlarız.
          </p>
        </Reveal>

        <motion.div
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {STEPS.map((s) => (
            <motion.div
              key={s.n}
              variants={staggerItem}
              className="relative rounded-2xl border border-[#ecebf5] bg-white p-6"
            >
              <span className="text-[13px] font-bold text-[#00a8c4]">{s.n}</span>
              <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4]">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[18px] font-semibold text-[#1a1a1a]">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6f6c8f]">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-10 text-center">
          <Link to="/iletisim" className="text-[15px] font-semibold text-[#00a8c4] hover:underline">
            İlk adım: sizi arayalım →
          </Link>
        </p>
      </div>
    </section>
  );
}
