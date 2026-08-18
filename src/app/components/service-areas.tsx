import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { Reveal, staggerItem } from "./motion-primitives";
import { useContent } from "../context/content-context";
import { districtPath, FEATURED_DISTRICT_NAMES, resolveDistricts } from "../lib/seo";

type ServiceAreasProps = {
  mode?: "featured" | "all" | "chips";
};

export function ServiceAreas({ mode = "all" }: ServiceAreasProps) {
  const { settings } = useContent();
  const all = resolveDistricts(settings.districts);
  const featuredSet = new Set(FEATURED_DISTRICT_NAMES.map((n) => n.toLocaleLowerCase("tr-TR")));
  const featured = all.filter((d) => featuredSet.has(d.name.toLocaleLowerCase("tr-TR")));
  const districts = mode === "featured" ? (featured.length ? featured : all.slice(0, 5)) : all;
  const lead =
    mode === "featured"
      ? "Önce Antakya, Defne ve İskenderun. Diğer ilçelerin kendi sayfası var."
      : settings.seoLocalLead ||
        "Antakya merkezli ajansız. Hatay ilçelerindeki işletmelere web tasarım, reklam ve e-ticaret.";

  if (mode === "chips") {
    return (
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-center text-[13px] font-semibold uppercase tracking-wider text-[#00a8c4]">
          Hizmet bölgeleri
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {all.map((d) => (
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
            Tüm ilçeler
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-[14px] font-semibold uppercase tracking-wider text-[#00a8c4]">
          Hatay ve ilçeleri
        </span>
        <h2 className="mt-3 text-[32px] font-bold tracking-tight text-[#1a1a1a] sm:text-[40px]">
          {mode === "featured" ? "Öne çıkan ilçeler" : "Hatay’da web tasarım ve reklam"}
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-[#514f6e]">{lead}</p>
      </Reveal>

      <motion.div
        className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      >
        {districts.map((d) => (
          <motion.div key={d.name} variants={staggerItem}>
            <Link
              to={districtPath(d.name)}
              className="flex h-full items-start gap-3 rounded-2xl border border-[#ecebf5] bg-white/80 p-4 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#b3e5ee]"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4]">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-[#1a1a1a]">{d.name}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-[#6f6c8f]">{d.blurb}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <p className="mt-8 text-center text-[14px] text-[#6f6c8f]">
        {mode === "featured" ? (
          <Link to="/hatay" className="inline-flex items-center gap-1 font-semibold text-[#00a8c4] hover:underline">
            Tüm Hatay ilçeleri <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <>
            Hatay web siteciler ve reklam ajansı arıyorsanız{" "}
            <Link to="/iletisim" className="font-semibold text-[#00a8c4] hover:underline">
              sizi arayalım
            </Link>
            .
          </>
        )}
      </p>
    </section>
  );
}
