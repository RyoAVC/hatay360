import { Link } from "react-router";
import { motion } from "motion/react";
import { MapPin, Megaphone, Palette, Store, Code2 } from "lucide-react";
import { useContent } from "../context/content-context";
import { normalizeCorporateContent } from "../lib/corporate-content";
import {
  ChecklistBlock,
  CorporateCrumbs,
  CorporateHero,
  ValuesGrid,
} from "../components/corporate-shell";
import { Reveal, staggerItem } from "../components/motion-primitives";
import { CallbackForm } from "../components/callback-form";
import { ABOUT_FAQS } from "../lib/seo";
import { ServiceAreas } from "../components/service-areas";

const LINES = [
  { icon: Megaphone, title: "Google Ads & Meta", desc: "Arama ve sosyal medyada görünürlük için reklam yönetimi." },
  { icon: Palette, title: "Web tasarım", desc: "Dönüşüm odaklı kurumsal site ve landing page." },
  { icon: Store, title: "E-ticaret & görünürlük", desc: "Mağaza ve reklam birlikte; satış hedefi olan işletmeler için." },
  { icon: Code2, title: "Yazılım & form-WhatsApp", desc: "Form, WhatsApp ve kampanya verilerini tek ekiple yönetmek." },
];

export function HakkimizdaPage() {
  const { settings } = useContent();
  const c = normalizeCorporateContent(settings.corporate);

  return (
    <>
      <CorporateCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Hakkımızda" }]} />
      <CorporateHero eyebrow={c.aboutTitle} title={c.aboutLead} lead={c.aboutBody}>
        <div className="flex flex-wrap gap-3">
          <Link to="/misyon" className="rounded-xl border border-[#b3e5ee] bg-white px-4 py-2.5 text-[13px] font-bold text-[#008da8]">
            Misyon
          </Link>
          <Link to="/vizyon" className="rounded-xl border border-[#b3e5ee] bg-white px-4 py-2.5 text-[13px] font-bold text-[#008da8]">
            Vizyon
          </Link>
          <Link to="/kurumsal" className="rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[13px] font-bold text-white">
            Kurumsal hub
          </Link>
        </div>
      </CorporateHero>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <motion.div
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {c.stats.map((s) => (
            <motion.div key={s.id} variants={staggerItem} className="text-center">
              <p className="text-[32px] font-bold text-[#00a8c4]">{s.value}</p>
              <p className="mt-1 text-[14px] text-[#5a737b]">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f3fcfd_0%,#ffffff_100%)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-[30px] font-bold tracking-tight text-[#0c2a32] sm:text-[38px]">Dört hizmet, tek ekip</h2>
            <p className="mt-4 text-[16px] text-[#3d5a63]">
              Ayrı ajans, ayrı yazılım evi peşinde koşmanıza gerek yok — Hatay360 tek muhatap.
            </p>
          </Reveal>
          <motion.div
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          >
            {LINES.map((v) => (
              <motion.div
                key={v.title}
                variants={staggerItem}
                className="rounded-[22px] border border-[#d7f0f5] bg-white p-6 shadow-[0_12px_32px_rgba(0,168,196,0.06)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00a8c4] text-white">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[16px] font-bold text-[#0c2a32]">{v.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#5a737b]">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <ValuesGrid title={c.valuesTitle} values={c.values} />

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <ChecklistBlock title={c.policiesTitle} items={c.policies} />
          <div className="space-y-6">
            <ChecklistBlock title={c.principlesTitle} items={c.principles} />
            <Reveal>
              <div className="flex items-center gap-4 rounded-[22px] border border-[#d7f0f5] bg-white p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4]">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[16px] font-bold text-[#0c2a32]">Hatay ofis</p>
                  <p className="text-[14px] text-[#5a737b]">{settings.address || "Antakya / Hatay"}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <ServiceAreas mode="chips" />

      <section className="mx-auto max-w-3xl px-5 pb-10 sm:px-8">
        <h2 className="text-[24px] font-bold text-[#0c2a32]">Sık sorulanlar</h2>
        <div className="mt-5 space-y-2">
          {ABOUT_FAQS.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-[#d7f0f5] bg-white p-4 open:border-[#00a8c4]/40">
              <summary className="cursor-pointer text-[15px] font-semibold text-[#0c2a32]">{faq.q}</summary>
              <p className="mt-2 text-[14px] leading-relaxed text-[#5a737b]">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <div className="rounded-[28px] border border-[#d7f0f5] bg-white p-8 shadow-[0_16px_40px_rgba(0,168,196,0.08)]">
          <CallbackForm />
        </div>
      </section>
    </>
  );
}
