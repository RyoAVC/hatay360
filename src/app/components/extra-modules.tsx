import { FileText, Truck, Globe2, Receipt } from "lucide-react";
import { motion } from "motion/react";
import { Reveal, staggerItem } from "./motion-primitives";

const MODULES = [
  {
    icon: Receipt,
    title: "E-fatura & e-arşiv",
    desc: "Siparişten faturaya otomatik akış. Entegratör bağlantısı paketlere dahildir.",
  },
  {
    icon: Truck,
    title: "Kargo barkod",
    desc: "Yurtiçi, MNG, Aras ve diğer kargo firmaları için barkod ve takip numarası.",
  },
  {
    icon: Globe2,
    title: "E-ihracat altyapısı",
    desc: "Farklı para birimi, dil ve kargo kurgusuyla yurt dışı satışı tek panelden.",
  },
  {
    icon: FileText,
    title: "Özel entegrasyon",
    desc: "ERP, muhasebe veya kendi yazılımınız varsa API ile bağlarız.",
  },
];

export function ExtraModules() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-[14px] font-semibold uppercase tracking-wider text-[#00a8c4]">
          Operasyon
        </span>
        <h2 className="mt-3 text-[32px] font-bold tracking-tight text-[#1a1a1a] sm:text-[40px]">
          Satıştan sonra da yanınızdayız
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-[#514f6e]">
          Mağaza açmak yetmez. Fatura, kargo ve ihracat süreçleri de Hatay360 panelinde yürür.
        </p>
      </Reveal>

      <motion.div
        className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {MODULES.map((m) => (
          <motion.div
            key={m.title}
            variants={staggerItem}
            className="rounded-2xl border border-[#ecebf5] bg-white p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4]">
              <m.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-[17px] font-semibold text-[#1a1a1a]">{m.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#6f6c8f]">{m.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
