import { ShieldCheck, Headphones, Gauge, Search, Smartphone, BriefcaseBusiness } from "lucide-react";
import { motion } from "motion/react";
import { staggerItem } from "./motion-primitives";

const ITEMS = [
  { icon: ShieldCheck, title: "Güvenli süreç", desc: "Şeffaf iş akışı ve kurumsal yaklaşım" },
  { icon: Headphones, title: "Yönetim desteği", desc: "Tüm iş akışında yerinizde kalıyoruz" },
  { icon: Gauge, title: "Ölçülebilir sonuç", desc: "Arama, çağrı ve dönüşüm odaklı raporlama" },
  { icon: Search, title: "Yerel görünürlük", desc: "Hatay, Antakya ve ilçelere özel hedefleme" },
  { icon: Smartphone, title: "Mobil odaklı", desc: "Telefon ve WhatsApp dönüşümü odaklı tasarım" },
  { icon: BriefcaseBusiness, title: "Kurumsal marka", desc: "Güçlü imza ve profesyonel iletişim dili" },
];

export function TrustStrip() {
  return (
    <section className="relative border-y border-[#edf3f7] bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#00a8c4]">Kurumsal güven</p>
            <h3 className="mt-2 text-[26px] font-black tracking-[-0.04em] text-[#111827]">Hatay için daha güçlü görünüm, daha net sonuç</h3>
          </div>
        </div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {ITEMS.map((item) => (
            <motion.div
              key={item.title}
              variants={staggerItem}
              className="rounded-2xl border border-[#edf3f7] bg-gradient-to-br from-white to-[#f8fbfd] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eafafc] text-[#00a8c4] shadow-sm ring-1 ring-[#cfeef4]">
                <item.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[15px] font-black text-[#111827]">{item.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#5d6576]">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
