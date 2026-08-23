import { Link } from "react-router";
import { motion } from "motion/react";
import { useContent } from "../context/content-context";
import { normalizeCorporateContent } from "../lib/corporate-content";
import {
  ChecklistBlock,
  CorporateCrumbs,
  CorporateHero,
  CorporateHubLinks,
  ValuesGrid,
} from "../components/corporate-shell";
import { Reveal, staggerItem } from "../components/motion-primitives";
import { CallbackForm } from "../components/callback-form";

export function KurumsalPage() {
  const { settings } = useContent();
  const c = normalizeCorporateContent(settings.corporate);

  return (
    <>
      <CorporateCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Kurumsal" }]} />
      <CorporateHero eyebrow={c.hubEyebrow} title={c.hubTitle} lead={c.hubLead} />

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <motion.div
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {c.stats.map((s) => (
            <motion.div
              key={s.id}
              variants={staggerItem}
              className="rounded-2xl border border-[#d7f0f5] bg-[linear-gradient(160deg,#ffffff,#f3fcfd)] px-4 py-6 text-center"
            >
              <p className="text-[28px] font-bold text-[#00a8c4] sm:text-[32px]">{s.value}</p>
              <p className="mt-1 text-[13px] font-medium text-[#5a737b]">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <Reveal>
          <h2 className="text-[22px] font-bold text-[#0c2a32]">Kurumsal sayfalar</h2>
          <p className="mt-2 text-[14px] text-[#5a737b]">Hakkımızda, misyon, vizyon ve resmi yasal belgeler.</p>
        </Reveal>
        <div className="mt-6">
          <CorporateHubLinks />
        </div>
      </section>

      <ValuesGrid title={c.valuesTitle} values={c.values} />

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <ChecklistBlock title={c.policiesTitle} items={c.policies} />
          <ChecklistBlock title={c.principlesTitle} items={c.principles} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="rounded-[28px] border border-[#d7f0f5] bg-white p-8 shadow-[0_20px_50px_rgba(0,168,196,0.08)]">
          <p className="text-[13px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">İletişim</p>
          <h2 className="mt-2 text-[24px] font-bold text-[#0c2a32]">Kurumsal teklif veya bilgi</h2>
          <p className="mt-2 text-[14px] text-[#5a737b]">
            Detaylı sorularınız için{" "}
            <Link to="/iletisim" className="font-semibold text-[#00a8c4] hover:underline">
              iletişim
            </Link>{" "}
            veya formu kullanın.
          </p>
          <div className="mt-6">
            <CallbackForm />
          </div>
        </div>
      </section>
    </>
  );
}
