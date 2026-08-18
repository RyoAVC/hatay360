import { Link } from "react-router";
import { motion } from "motion/react";
import { Store, Palette, Megaphone, Code2, ArrowRight } from "lucide-react";
import { Reveal, staggerItem } from "./motion-primitives";

const PILLARS = [
  {
    icon: Megaphone,
    title: "Google Ads & Meta",
    desc: "İşletmenizin Google aramalarında ve sosyal medyada görünür olmasını sağlayan reklam yönetimi.",
    href: "/pazarla",
    cta: "Reklam teklifi",
  },
  {
    icon: Palette,
    title: "Landing Page & Web Tasarım",
    desc: "Telefon, WhatsApp ve form dönüşümüne odaklı hızlı ve güçlü sayfalar. Hazır tema değil, net mesaj ve satış hedefli tasarım.",
    href: "/pazarla",
    cta: "Tasarımı gör",
  },
  {
    icon: Store,
    title: "E-Ticaret & Görünürlük",
    desc: "Mağaza ve reklam birlikte yürür; satış hedefi olan işletmeler için kurumsal görünürlük ve satış akışı oluşturur.",
    href: "/paketler",
    cta: "Paketleri incele",
  },
  {
    icon: Code2,
    title: "Yazılım & Entegrasyon",
    desc: "Landing page, WhatsApp, form ve kampanya verilerini tek ekiple yönetir; otomasyon ve raporlama kolaylaşır.",
    href: "/pazarla",
    cta: "Hizmetleri gör",
  },
];

export function ServicePillars() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <span className="text-[14px] font-black uppercase tracking-[0.2em] text-[#00a8c4]">
          Hatay360 ne yapar?
        </span>
        <h2 className="mt-3 text-[32px] font-black tracking-[-0.05em] text-[#111827] sm:text-[40px]">
          Reklam, web ve satış akışı tek bir kurumsal stratejiyle büyür.
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-[#514f6e]">
          Antakya merkezli dijital ajans olarak çalışıyoruz; hedefimiz daha çok arama, daha çok çağrı ve daha çok dönüşüm. Google Ads, yerel SEO ve kurumsal web tasarım bir arada çalışır.
        </p>
      </Reveal>

      <motion.div
        className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {PILLARS.map((p) => (
          <motion.div key={p.title} variants={staggerItem} whileHover={{ y: -6 }}>
            <Link
              to={p.href}
              className="flex h-full flex-col rounded-2xl border border-[#ecebf5] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition-all hover:border-[#b3e5ee] hover:shadow-[0px_16px_40px_rgba(0,168,196,0.10)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4] ring-1 ring-[#d1f1f7]">
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-[18px] font-black text-[#1a1a1a]">{p.title}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#6f6c8f]">{p.desc}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-bold text-[#00a8c4]">
                {p.cta} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}