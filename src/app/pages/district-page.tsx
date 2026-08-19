import { Link, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Globe, Megaphone, Palette, Store } from "lucide-react";
import { PageHero } from "../components/page-hero";
import { Reveal, staggerItem } from "../components/motion-primitives";
import { CallbackForm } from "../components/callback-form";
import { NotFoundPage } from "./not-found";
import { useContent } from "../context/content-context";
import { districtAngle } from "../lib/district-copy";
import { districtPath, districtFaqs, findDistrictBySlug, resolveDistricts } from "../lib/seo";

export function DistrictPage() {
  const { slug = "" } = useParams();
  const { settings } = useContent();
  const districts = resolveDistricts(settings.districts);
  const district = findDistrictBySlug(districts, slug);

  if (!district) return <NotFoundPage />;

  const { name, blurb } = district;
  const angle = districtAngle(name);
  const others = districts.filter((d) => d.name !== name).slice(0, 8);

  const services = [
    {
      icon: Palette,
      title: `${name} web tasarım`,
      desc: `Mobil uyumlu kurumsal site. ${angle.fit}`,
      href: "/pazarla",
    },
    {
      icon: Megaphone,
      title: `${name} reklam`,
      desc: "Google Ads ve Meta. Bütçeyi gösterime değil, arama ve mesajlaşmaya yönlendiririz.",
      href: "/pazarla",
    },
    {
      icon: Store,
      title: `${name} e-ticaret`,
      desc: "Sanal POS, SSL, stok ve sipariş. 15 gün deneme ile mağazayı ayağa kaldırırız.",
      href: "/paketler",
    },
    {
      icon: Globe,
      title: "Yazılım ve entegrasyon",
      desc: "Pazaryeri, e-fatura ve size özel yazılım. Tek ekip, tek muhatap.",
      href: "/pazarla",
    },
  ];

  const faqs = districtFaqs(name, angle.hook);

  return (
    <>
      <PageHero
        eyebrow={`${name} / Hatay`}
        title={`${name} web tasarım, reklam ve e-ticaret`}
        desc={`${blurb} ${angle.hook}`}
      >
        <Link to="/iletisim">
          <motion.span
            whileHover={{ y: -3 }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3.5 text-[16px] font-bold text-white shadow-[0px_10px_28px_rgba(0,168,196,0.35)]"
          >
            {name} için sizi arayalım <ArrowRight className="h-[18px] w-[18px]" />
          </motion.span>
        </Link>
        <Link
          to="/paketler"
          className="inline-flex items-center gap-2 rounded-xl border border-[#d9dbe9] bg-white/90 px-6 py-3.5 text-[16px] font-bold text-[#1a1a1a] hover:border-[#00a8c4] hover:text-[#00a8c4]"
        >
          Paketleri incele
        </Link>
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <p className="text-[13px] text-[#8a87a8]">
          <Link to="/" className="hover:text-[#00a8c4]">
            Ana sayfa
          </Link>
          <span className="px-2">/</span>
          <Link to="/hatay" className="hover:text-[#00a8c4]">
            Hatay ilçeleri
          </Link>
          <span className="px-2">/</span>
          <span className="text-[#1a1a1a]">{name}</span>
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <h2 className="text-[28px] font-bold tracking-tight text-[#1a1a1a]">
              {name} işletmesi için ne yapıyoruz?
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#514f6e]">{angle.fit}</p>
            <p className="mt-3 text-[16px] leading-relaxed text-[#6f6c8f]">
              Hatay360 Antakya merkezli. {name} içindeki işiniz için ayrı ajans + ayrı yazılımcı şart değil.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-[28px] border border-[#ecebf5] bg-white p-6 shadow-[0px_16px_40px_rgba(0,168,196,0.08)] sm:p-8">
              <CallbackForm compact />
              <p className="mt-3 text-[12px] text-[#a0a3bd]">{name} — ücretsiz keşif görüşmesi</p>
            </div>
          </Reveal>
        </div>

        <motion.div
          className="mt-12 grid gap-5 sm:grid-cols-2"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {services.map((s) => (
            <motion.div key={s.title} variants={staggerItem}>
              <Link
                to={s.href}
                className="block h-full rounded-2xl border border-[#ecebf5] bg-white/90 p-6 transition hover:-translate-y-1 hover:border-[#b3e5ee]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4]">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[18px] font-bold text-[#1a1a1a]">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6f6c8f]">{s.desc}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-8 sm:px-8">
        <h2 className="text-[24px] font-bold text-[#1a1a1a]">{name} sık sorulanlar</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-2xl border border-[#ecebf5] bg-white/90 p-5 open:border-[#b3e5ee]">
              <summary className="cursor-pointer text-[16px] font-semibold text-[#1a1a1a]">{f.q}</summary>
              <p className="mt-3 text-[15px] leading-relaxed text-[#6f6c8f]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {others.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <h2 className="text-[22px] font-bold text-[#1a1a1a]">Diğer Hatay ilçeleri</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {others.map((d) => (
              <Link
                key={d.name}
                to={districtPath(d.name)}
                className="rounded-full border border-[#ecebf5] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#514f6e] hover:border-[#00a8c4] hover:text-[#00a8c4]"
              >
                {d.name}
              </Link>
            ))}
            <Link
              to="/hatay"
              className="rounded-full bg-[#e8f8fb] px-3.5 py-1.5 text-[13px] font-semibold text-[#00a8c4]"
            >
              Tümü
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
