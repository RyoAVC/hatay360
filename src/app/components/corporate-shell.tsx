import { Link } from "react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { PageCrumbs } from "./page-crumbs";
import { Reveal, staggerItem } from "./motion-primitives";
import type { LegalDoc } from "../lib/corporate-content";

const CYAN = "#00a8c4";

export function CorporateCrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
      <PageCrumbs items={items} />
    </div>
  );
}

/** Premium kurumsal hero — logo cyan atmosfer */
export function CorporateHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#b3e5ee]/60">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% -10%, rgba(0,168,196,0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 20%, rgba(112,220,233,0.22), transparent 50%), linear-gradient(180deg, #f3fcfd 0%, #ffffff 70%)",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#00a8c4]/15 blur-3xl"
        animate={{ y: [0, 24, 0], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#70dce9]/25 blur-3xl"
        animate={{ x: [0, -18, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] font-black uppercase tracking-[0.22em]"
          style={{ color: CYAN }}
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-4 max-w-3xl text-[34px] font-bold leading-[1.08] tracking-tight text-[#0c2a32] sm:text-[48px]"
        >
          {title}
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 h-1 w-24 origin-left rounded-full"
          style={{ background: `linear-gradient(90deg, ${CYAN}, #70dce9)` }}
        />
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[#3d5a63]"
        >
          {lead}
        </motion.p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

export function StatementPanel({
  title,
  body,
  accent = "mission",
}: {
  title: string;
  body: string;
  accent?: "mission" | "vision";
}) {
  const gradient =
    accent === "mission"
      ? "from-[#00a8c4] to-[#008da8]"
      : "from-[#0c2a32] to-[#00a8c4]";
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] border border-[#b3e5ee]/80 bg-white shadow-[0_24px_60px_rgba(0,168,196,0.08)]">
          <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${gradient}`} />
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-40 blur-3xl"
            style={{ background: CYAN }}
          />
          <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.15fr] lg:gap-14 lg:p-14">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#00a8c4]">
                {accent === "mission" ? "Misyon" : "Vizyon"}
              </p>
              <h2 className="mt-3 text-[28px] font-bold tracking-tight text-[#0c2a32] sm:text-[36px]">{title}</h2>
            </div>
            <p className="text-[17px] leading-[1.75] text-[#3d5a63] sm:text-[18px]">{body}</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function ChecklistBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <Reveal>
      <div className="rounded-[28px] border border-[#d7f0f5] bg-[linear-gradient(165deg,#ffffff_0%,#f3fcfd_100%)] p-7 sm:p-9">
        <h3 className="text-[22px] font-bold tracking-tight text-[#0c2a32]">{title}</h3>
        <ul className="mt-6 space-y-3.5">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-[#3d5a63]">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00a8c4] text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export function ValuesGrid({
  title,
  values,
}: {
  title: string;
  values: { id: string; title: string; text: string }[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <Reveal className="max-w-xl">
        <h2 className="text-[28px] font-bold tracking-tight text-[#0c2a32] sm:text-[34px]">{title}</h2>
        <p className="mt-3 text-[15px] text-[#5a737b]">Hatay360’ı ayakta tutan ilkeler — her projede aynı standart.</p>
      </Reveal>
      <motion.div
        className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {values.map((v, i) => (
          <motion.div
            key={v.id}
            variants={staggerItem}
            className="group relative overflow-hidden rounded-[22px] border border-[#d7f0f5] bg-white p-6 transition hover:border-[#00a8c4]/50 hover:shadow-[0_16px_40px_rgba(0,168,196,0.1)]"
          >
            <span className="text-[11px] font-black text-[#00a8c4]/70">0{i + 1}</span>
            <h3 className="mt-2 text-[17px] font-bold text-[#0c2a32]">{v.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#5a737b]">{v.text}</p>
            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#00a8c4] transition-all duration-500 group-hover:w-full" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export function LegalDocView({
  doc,
  crumbLabel,
  children,
}: {
  doc: LegalDoc;
  crumbLabel?: string;
  children?: ReactNode;
}) {
  return (
    <>
      <CorporateCrumbs
        items={[
          { label: "Ana sayfa", to: "/" },
          { label: "Kurumsal", to: "/kurumsal" },
          { label: crumbLabel || doc.title },
        ]}
      />
      <CorporateHero eyebrow={doc.eyebrow} title={doc.title} lead={doc.summary} />
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="space-y-8">
          {doc.sections.map((section, index) => (
            <Reveal key={section.id} delay={index * 0.03}>
              <article className="relative border-l-2 border-[#00a8c4]/35 pl-6">
                <h2 className="text-[18px] font-bold text-[#0c2a32] sm:text-[20px]">{section.heading}</h2>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.75] text-[#3d5a63] sm:text-[16px]">
                  {section.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
        {children}
        <div className="mt-14 flex flex-wrap gap-3 border-t border-[#d7f0f5] pt-8">
          <Link
            to="/kurumsal"
            className="inline-flex items-center gap-2 rounded-xl border border-[#b3e5ee] bg-white px-4 py-2.5 text-[13px] font-bold text-[#008da8] transition hover:border-[#00a8c4]"
          >
            Kurumsal hub
          </Link>
          <Link
            to="/iletisim"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_10px_28px_rgba(0,168,196,0.28)]"
          >
            İletişim
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

export function CorporateHubLinks() {
  const links = [
    { to: "/hakkimizda", label: "Biz kimiz?", hint: "Hakkımızda" },
    { to: "/misyon", label: "Misyon", hint: "Ne için varız" },
    { to: "/vizyon", label: "Vizyon", hint: "Nereye gidiyoruz" },
    { to: "/kvkk", label: "KVKK", hint: "Aydınlatma metni" },
    { to: "/gizlilik", label: "Gizlilik", hint: "Politika" },
    { to: "/mesafeli-satis", label: "Mesafeli satış", hint: "Sözleşme" },
    { to: "/kosullar", label: "Kullanım koşulları", hint: "Hizmet çerçevesi" },
  ];
  return (
    <motion.div
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {links.map((link) => (
        <motion.div key={link.to} variants={staggerItem}>
          <Link
            to={link.to}
            className="group flex items-center justify-between rounded-2xl border border-[#d7f0f5] bg-white px-5 py-4 transition hover:border-[#00a8c4] hover:bg-[#f3fcfd]"
          >
            <div>
              <p className="text-[15px] font-bold text-[#0c2a32]">{link.label}</p>
              <p className="text-[12px] font-medium text-[#5a737b]">{link.hint}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#00a8c4] transition group-hover:translate-x-1" />
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
