import { Link } from "react-router";
import { motion } from "motion/react";
import { Store, Palette, Megaphone, MapPinned, ArrowRight } from "lucide-react";
import { Reveal, staggerItem } from "./motion-primitives";
import { buildIletisimQuotePath } from "../lib/needs-calculator";

const PILLARS = [
  {
    icon: Megaphone,
    title: "Google Ads & Meta",
    desc: "Reklam yönetimi: bütçe sizin hesapta kalır, yönetim ücreti ayrıdır.",
    href: buildIletisimQuotePath({ needs: ["ads"] }),
    cta: "Reklam teklifi",
  },
  {
    icon: Palette,
    title: "Web tasarım",
    desc: "Landing ve kurumsal siteler; telefon, WhatsApp ve form dönüşümüne odaklı net mesaj.",
    href: buildIletisimQuotePath({ needs: ["site"] }),
    cta: "Site teklifi",
  },
  {
    icon: MapPinned,
    title: "Google Maps",
    desc: "İşletme profili, NAP tutarlılığı ve yerel aramada harita görünürlüğü.",
    href: "/google-maps-harita-kaydi",
    cta: "Harita kaydı",
  },
  {
    icon: Store,
    title: "E-ticaret (isteğe bağlı)",
    desc: "Teklifte ayrı kalem. Pazarla ayrı üründür; her pakete dahil değildir.",
    href: buildIletisimQuotePath({ needs: ["shop"] }),
    cta: "E-ticaret teklifi",
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
          Reklam, web ve Google Maps tek bir kurumsal stratejiyle büyür.
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-[#514f6e]">
          Antakya merkezli dijital ajans olarak çalışıyoruz; hedefimiz daha çok arama, daha çok çağrı ve daha çok dönüşüm. Google Ads, kurumsal web ve işletme harita kaydı bir arada çalışır.
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
