import { motion } from "motion/react";
import { MapPin, Target, Heart, Rocket, Store, Palette, Megaphone, Code2 } from "lucide-react";
import { PageCrumbs } from "../components/page-crumbs";
import { PageHero } from "../components/page-hero";
import { Reveal, staggerItem } from "../components/motion-primitives";
import { CallbackForm } from "../components/callback-form";
import { ABOUT_FAQS } from "../lib/seo";
import { ServiceAreas } from "../components/service-areas";

const VALUES = [
  { icon: Target, title: "Sonuç odaklı", desc: "İşletmenizin gerçekten satış yapmasına odaklanan çözümler üretiriz." },
  { icon: Heart, title: "Yanınızdayız", desc: "Kurulumdan büyümeye kadar her adımda gerçek insan desteği sunarız." },
  { icon: Rocket, title: "Sürekli gelişim", desc: "Altyapı, reklam ve yazılımlarımızı pazaryerleriyle uyumlu biçimde geliştiririz." },
];

const STATS = [
  { value: "1.200+", label: "Aktif mağaza" },
  { value: "8", label: "Pazaryeri entegrasyonu" },
  { value: "4", label: "Ana hizmet hattı" },
  { value: "%99,9", label: "Çalışma süresi" },
];

const LINES = [
  { icon: Store, title: "E-ticaret altyapısı", desc: "Mağaza, katalog, sipariş, SSL ve sanal POS tek panelde." },
  { icon: Palette, title: "Web tasarım", desc: "Kurumsal site ve e-ticaret arayüzleri, mobil uyumlu." },
  { icon: Megaphone, title: "Reklam", desc: "Google Ads ve Meta ile ölçülebilir büyüme." },
  { icon: Code2, title: "Yazılım & entegrasyon", desc: "Pazaryeri, otomasyon ve size özel yazılım." },
];

export function HakkimizdaPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Hakkımızda" }]} />
      </div>
      <PageHero
        eyebrow="Hakkımızda"
        title="Hatay’dan, işletmenizi dijitale taşıyan ajans ve yazılım"
        desc="Antakya merkezli Hatay360: web tasarım, reklam ajansı, e-ticaret altyapısı ve yazılım. İskenderun ve Defne dahil tüm ilçelere uzaktan da hizmet."
      />

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <motion.div
          className="grid grid-cols-2 gap-6 md:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {STATS.map((s) => (
            <motion.div key={s.label} variants={staggerItem} className="text-center">
              <p className="text-[34px] font-bold text-[#00a8c4]">{s.value}</p>
              <p className="mt-1 text-[14px] text-[#6f6c8f]">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-[#e8f8fb]/50">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-[32px] font-bold tracking-tight text-[#1a1a1a] sm:text-[40px]">
              Dört hizmet, tek ekip
            </h2>
            <p className="mt-4 text-[16px] text-[#514f6e]">
              Ayrı ajans, ayrı yazılım evi, ayrı entegratör peşinde koşmanıza gerek yok.
            </p>
          </Reveal>
          <motion.div
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          >
            {LINES.map((v) => (
              <motion.div key={v.title} variants={staggerItem} className="rounded-2xl border border-[#b3e5ee] bg-white p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00a8c4] text-white">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-[18px] font-semibold text-[#1a1a1a]">{v.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6f6c8f]">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-[28px] font-bold tracking-tight text-[#1a1a1a] sm:text-[34px]">
              Değerlerimiz
            </h2>
            <div className="mt-6 space-y-4">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-2xl border border-[#ecebf5] bg-white p-5">
                  <p className="text-[16px] font-semibold text-[#1a1a1a]">{v.title}</p>
                  <p className="mt-1 text-[15px] text-[#6f6c8f]">{v.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="text-[28px] font-bold tracking-tight text-[#1a1a1a] sm:text-[34px]">Ofisimiz</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#6f6c8f]">
              Merkezimiz Hatay’dadır. Türkiye genelindeki işletmelere uzaktan kurulum, eğitim ve destek veririz.
            </p>
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#ecebf5] bg-white p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4]">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[16px] font-semibold text-[#1a1a1a]">Hatay Ofis</p>
                <p className="text-[14px] text-[#6f6c8f]">Antakya / Hatay</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <ServiceAreas mode="chips" />

      <section className="mx-auto max-w-3xl px-5 pb-10 sm:px-8">
        <h2 className="text-[24px] font-bold text-[#1a1a1a]">Sık sorulanlar</h2>
        <p className="mt-2 text-[15px] text-[#6f6c8f]">Marka, yazılım ailesi ve hizmet bölgesi — kısa cevaplar.</p>
        <div className="mt-5 space-y-2">
          {ABOUT_FAQS.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-[#ecebf5] bg-white p-4 open:border-[#b3e5ee]">
              <summary className="cursor-pointer text-[15px] font-semibold text-[#1a1a1a]">{faq.q}</summary>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6f6c8f]">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <div className="rounded-[28px] border border-[#ecebf5] bg-white p-8 shadow-[0px_16px_40px_rgba(25,33,61,0.06)]">
          <CallbackForm />
        </div>
      </section>
    </>
  );
}
