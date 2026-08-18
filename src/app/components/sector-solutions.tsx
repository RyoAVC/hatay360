import { ArrowRight, CarFront, Truck, Stethoscope, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

const SECTORS = [
  {
    id: "taxi",
    icon: CarFront,
    title: "Taksi",
    headline: "Hatay’da taksi arayan müşteriyi doğrudan size ulaştırın.",
    description:
      "Google Ads + Meta + yerel görünürlük ile çağrı, WhatsApp ve rezervasyon başvurularını artırırız.",
    keywords: ["Hatay taksi", "İskenderun taksi", "Antakya taksi", "7/24 transfer"],
    cta: "Taksi paketi",
  },
  {
    id: "nakliyat",
    icon: Truck,
    title: "Nakliyat",
    headline: "Taşıma ihtiyacı olan müşterilere hızlı ve güvenli teklif verin.",
    description:
      "Evden eve, ofis taşıma ve şehir içi nakliyat için reklam, yerel arama ve landing page çalışması kuruyoruz.",
    keywords: ["Hatay nakliyat", "Nakliye fiyatları", "Evden eve nakliyat", "Ofis taşıma"],
    cta: "Nakliyat paketi",
  },
  {
    id: "klinik",
    icon: Stethoscope,
    title: "Klinik & Sağlık",
    headline: "Randevu ve tedavi arayan hastaları doğru sektöre yönlendirin.",
    description:
      "Diş, estetik, doktor, psikolog ve kliniklerde Google arama ve yerel görünürlük ile daha çok başvuru ve randevu hedefliyoruz.",
    keywords: ["Hatay diş doktoru", "Antakya estetik", "Hatay doktor", "Randevu"],
    cta: "Sağlık paketi",
  },
  {
    id: "servis",
    icon: Wrench,
    title: "Servis & Tamirat",
    headline: "Telefon, klima, araba ve tamirat arayan müşteriyi anında yakalayın.",
    description:
      "Yerel hizmetlerde çağrı, WhatsApp ve anında dönüşüm odaklı reklam kampanyaları kuruyoruz.",
    keywords: ["Hatay klima servisi", "Oto tamir", "Elektronik servis", "Tamirat"],
    cta: "Servis paketi",
  },
];

export function SectorSolutions() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-[14px] font-semibold uppercase tracking-wider text-[#00a8c4]">
          Sektör çözümleri
        </span>
        <h2 className="mt-3 text-[32px] font-bold tracking-tight text-[#1a1a1a] sm:text-[40px]">
          Her sektör için doğru reklam ve doğru görünürlük
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-[#514f6e]">
          Taksi, nakliyat, klinik ve servis gibi yerel sektörlerde ana hedefimiz netlik: görünür olmak, arayan kişiyi yakalamak ve dönüşümü artırmak.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {SECTORS.map((sector) => {
          const Icon = sector.icon;

          return (
            <motion.div
              key={sector.id}
              whileHover={{ y: -6 }}
              className="group grid h-full gap-6 rounded-[30px] border border-[#dfeaf0] bg-white p-7 shadow-[0px_18px_45px_rgba(25,33,61,0.06)] transition-all hover:border-[#8fd8e4] hover:shadow-[0px_20px_55px_rgba(0,168,196,0.11)] sm:grid-cols-[1fr_180px] sm:p-8"
            >
              <div><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f8fb] text-[#00a8c4]"><Icon className="h-6 w-6" /></span><h3 className="text-[24px] font-black text-[#1a1a1a]">{sector.title}</h3></div><p className="mt-5 text-[17px] font-bold leading-snug text-[#008da8]">{sector.headline}</p><p className="mt-3 text-[15px] leading-relaxed text-[#667085]">{sector.description}</p><Link to={sector.id === "taxi" ? "/sektor/taksi" : sector.id === "nakliyat" ? "/sektor/nakliyat" : sector.id === "klinik" ? "/sektor/klinik" : "/sektor/servis"} className="mt-6 inline-flex items-center gap-2 text-[14px] font-black text-[#00a8c4] transition-colors group-hover:text-[#008aa2]">{sector.cta} <ArrowRight className="h-4 w-4" /></Link></div>
              <div className="flex flex-col justify-center rounded-2xl bg-[#f5fafb] p-4"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7b8b94]">Yerel aramalar</p><div className="mt-3 flex flex-wrap gap-2">{sector.keywords.map((keyword) => <span key={keyword} className="rounded-full border border-[#dce8eb] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#52626d]">{keyword}</span>)}</div></div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
