import {
  LayoutTemplate,
  Megaphone,
  MapPin,
  Search,
  ShieldCheck,
  Headphones,
  Smartphone,
  ShoppingBag,
} from "lucide-react";
import { motion } from "motion/react";
import { Reveal, staggerItem } from "./motion-primitives";
import { BrushLead } from "./brush-lead";

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: "Web ve landing tasarım",
    desc: "Kurumsal site, çağrı sayfası veya kampanya landing’i. Sektöre göre net mesaj, net iletişim.",
    tone: "from-[#ecfeff] to-[#cffafe]",
    iconTone: "bg-[#00a8c4] text-white",
  },
  {
    icon: Megaphone,
    title: "Google Ads ve Meta",
    desc: "Arama, görüntülü ve sosyal reklam. Hedef kitle, bütçe ve dönüşüm takibi tek ekiple.",
    tone: "from-[#eff6ff] to-[#dbeafe]",
    iconTone: "bg-[#2563eb] text-white",
  },
  {
    icon: MapPin,
    title: "Google Maps ve yerel",
    desc: "İşletme kaydı, NAP tutarlılığı ve Haritalar’da doğru görünüm. Yerel aramada bulunurluk.",
    tone: "from-[#ecfdf5] to-[#d1fae5]",
    iconTone: "bg-[#059669] text-white",
  },
  {
    icon: ShieldCheck,
    title: "SSL ve güvenlik",
    desc: "Siteniz HTTPS ile açılır. Ziyaretçi ve form verisi şifreli gider.",
    tone: "from-[#f0fdf4] to-[#dcfce7]",
    iconTone: "bg-[#16a34a] text-white",
  },
  {
    icon: Smartphone,
    title: "Mobil uyumlu siteler",
    desc: "Telefon, tablet ve masaüstünde okunur, tıklanır. Hızlı yükleme, net arama butonu.",
    tone: "from-[#faf5ff] to-[#f3e8ff]",
    iconTone: "bg-[#7c3aed] text-white",
  },
  {
    icon: Search,
    title: "SEO uyumlu altyapı",
    desc: "Doğru başlık, hız, sitemap ve yapılandırılmış veri. Organik görünürlük için teknik temel.",
    tone: "from-[#fff7ed] to-[#ffedd5]",
    iconTone: "bg-[#ea580c] text-white",
  },
  {
    icon: Headphones,
    title: "Yerel destek",
    desc: "Antakya ekibi kurulum, revizyon ve reklamda yanınızda. Numaranızı bırakın, sizi arayalım.",
    tone: "from-[#fdf2f8] to-[#fce7f3]",
    iconTone: "bg-[#db2777] text-white",
  },
  {
    icon: ShoppingBag,
    title: "E-ticaret isteğe bağlı",
    desc: "Katalog ve POS ihtiyacı olan işletmeye açılır. Pazaryeri senkronu çekirdek özellik değildir.",
    tone: "from-[#f8fafc] to-[#e2e8f0]",
    iconTone: "bg-[#334155] text-white",
  },
];

export function Features() {
  return (
    <section id="ozellikler" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-[14px] font-semibold uppercase tracking-wider text-[#00a8c4]">Özellikler</span>
        <h2 className="mt-3 text-[32px] font-bold tracking-tight text-[#1a1a1a] sm:text-[40px]">
          Görünürlük, çağrı ve web
        </h2>
        <BrushLead>Hatay reklam, web tasarım, e-ticaret ve yazılım. Antakya merkezli tek ekip.</BrushLead>
      </Reveal>

      <motion.div
        className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={staggerItem}
            whileHover={{ y: -8 }}
            className={`group relative overflow-hidden rounded-[22px] border border-white/80 bg-gradient-to-br ${f.tone} p-6 shadow-[0_12px_36px_rgba(15,40,50,0.06)]`}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/40 blur-2xl transition group-hover:bg-white/70" />
            <span className={`relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-md ${f.iconTone}`}>
              <f.icon className="h-6 w-6" strokeWidth={2.25} />
            </span>
            <h3 className="relative mt-5 text-[17px] font-black tracking-tight text-[#102a33]">{f.title}</h3>
            <p className="relative mt-2 text-[14px] leading-relaxed text-[#4b6270]">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
