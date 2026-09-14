import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { PageCrumbs } from "../components/page-crumbs";
import { PageHero } from "../components/page-hero";
import { Reveal, staggerItem } from "../components/motion-primitives";
import { useContent } from "../context/content-context";
import { districtPath, resolveDistricts } from "../lib/seo";
import { LOCAL_SERVICE_PAGES } from "../lib/local-service-pages";

export function HatayHubPage() {
  const { settings } = useContent();
  const districts = resolveDistricts(settings.districts);

  return (
    <>
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Hatay ilçeleri" }]} />
      </div>
      <PageHero
        eyebrow="Hizmet bölgeleri"
        title="Hatay ilçelerinde web tasarım, reklam ve harita"
        desc="Antakya ofisinden tüm ilçelere: site, reklam ve Google Maps. E-ticaret isteğe bağlıdır. İlçenizi seçin; o sayfada kısa teklif ve iletişim var."
      />

      <section className="mx-auto max-w-6xl px-5 pt-14 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-[28px] font-bold text-[#1a1a1a]">Hatay dijital hizmetleri</h2>
          <p className="mt-3 text-[16px] text-[#6f6c8f]">İhtiyacınıza uygun hizmeti seçin; kapsamı ve çalışma biçimini açıkça inceleyin.</p>
        </Reveal>
        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {Object.entries(LOCAL_SERVICE_PAGES).map(([path, service]) => (
            <Link key={path} to={path} className="group rounded-2xl border border-[#d7f0f5] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#00a8c4] hover:shadow-lg">
              <p className="text-[12px] font-black uppercase tracking-[.14em] text-[#008da8]">{service.eyebrow}</p>
              <h3 className="mt-3 text-[20px] font-black text-[#17343c]">{service.serviceName}</h3>
              <p className="mt-3 text-[14px] leading-7 text-[#60777e]">{service.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-bold text-[#0097b3]">Hizmeti incele <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-[28px] font-bold text-[#1a1a1a]">İlçenizi seçin</h2>
          <p className="mt-3 text-[16px] text-[#6f6c8f]">
            Panelden eklenen her ilçenin kendi sayfası oluşur. Google’da “İskenderun web tasarım” gibi aramalara
            ayrı kapı açılır.
          </p>
        </Reveal>

        <motion.div
          className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        >
          {districts.map((d) => (
            <motion.div key={d.name} variants={staggerItem}>
              <Link
                to={districtPath(d.name)}
                className="flex items-start gap-3 rounded-2xl border border-[#ecebf5] bg-white/90 p-4 transition hover:-translate-y-0.5 hover:border-[#b3e5ee] hover:shadow-md"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4]">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[#1a1a1a]">{d.name} web tasarım</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-[#6f6c8f]">{d.blurb}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#00a8c4]">
                    Sayfayı aç <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}
