import {
  Store,
  Boxes,
  RefreshCw,
  CreditCard,
  Search,
  Lock,
  Headphones,
  Smartphone,
} from "lucide-react";
import { motion } from "motion/react";
import { Reveal, staggerItem } from "./motion-primitives";

const FEATURES = [
  {
    icon: Store,
    title: "Anahtar teslim mağaza",
    desc: "Mağazanız aynı gün hazır. Hazır şablonlarla dakikalar içinde satışa başlayın.",
  },
  {
    icon: Boxes,
    title: "Merkezi katalog & stok",
    desc: "Tüm ürün, varyant ve stoklarınızı tek panelden yönetin, dağınıklığa son verin.",
  },
  {
    icon: RefreshCw,
    title: "Otomatik senkronizasyon",
    desc: "Fiyat ve stoklar tüm pazaryerlerinde gerçek zamanlı olarak güncellenir.",
  },
  {
    icon: CreditCard,
    title: "Sanal POS & ödeme",
    desc: "Kredi kartı, havale ve özel sanal POS oranlarıyla tahsilat tek akışta yürür.",
  },
  {
    icon: Search,
    title: "SEO uyumlu altyapı",
    desc: "Google aramalarında üst sıralarda yer alarak organik satışlarınızı artırın.",
  },
  {
    icon: Lock,
    title: "Ücretsiz SSL sertifikası",
    desc: "256 bit güvenlik ile müşterilerinize güvenli alışveriş deneyimi sunun.",
  },
  {
    icon: Smartphone,
    title: "Tümüyle mobil uyumlu",
    desc: "Tüm şablonlar ve yönetim paneli her ekranda kusursuz çalışır.",
  },
  {
    icon: Headphones,
    title: "Sınırsız teknik destek",
    desc: "Kurulum, eğitim ve satış sonrası her adımda Hatay360 ekibi yanınızda.",
  },
];

export function Features() {
  return (
    <section id="ozellikler" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-[14px] font-semibold uppercase tracking-wider text-[#00a8c4]">
          Özellikler
        </span>
        <h2 className="mt-3 text-[32px] font-bold tracking-tight text-[#1a1a1a] sm:text-[40px]">
          Satış için ihtiyacınız olan her şey
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-[#514f6e]">
          Hatay reklam, web tasarım, e-ticaret ve yazılım. Antakya merkezli tek ekip.
        </p>
      </Reveal>

      <motion.div
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={staggerItem}
            whileHover={{ y: -6 }}
            className="group rounded-2xl border border-[#ecebf5] bg-white p-6 transition-shadow hover:border-[#b3e5ee] hover:shadow-[0px_16px_40px_rgba(0,168,196,0.10)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4] transition-colors group-hover:bg-[#00a8c4] group-hover:text-white">
              <f.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-[18px] font-semibold text-[#1a1a1a]">{f.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[#6f6c8f]">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
