import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, ExternalLink, Globe2, Search, ShieldCheck, Sparkles } from "lucide-react";
import { PageCrumbs } from "../components/page-crumbs";
import { PageHero } from "../components/page-hero";
import { INITIAL_REFERENCES, useContent } from "../context/content-context";
import kuyumcuDoganImage from "../../assets/references/kuyumcu-dogan.webp";
import ceptematbaaImage from "../../assets/references/ceptematbaa.webp";
import soyleYerindenImage from "../../assets/references/soyle-yerinden.webp";
import kamilKeskinImage from "../../assets/references/kamil-keskin.webp";
import benguenImage from "../../assets/references/benguen.webp";
import baskimoImage from "../../assets/references/baskimo.webp";
import antpisosImage from "../../assets/references/antpisos.webp";
import hatayYoremImage from "../../assets/references/hatay-yorem.webp";

const CATEGORIES = [
  { id: "all", label: "Tümü" },
  { id: "webtasarim", label: "Web & Platform" },
  { id: "eticaret", label: "E-Ticaret" },
];

const LEGACY_PLACEHOLDER_NAMES = new Set([
  "ModaVibe E-Ticaret",
  "LüxTeknoloji Store",
  "Artizan Mobilya & Mimarlık",
  "GurmeMarket Mobil App",
  "OtoYedekParca Bot & API",
  "TrendKozmetik Şirketi",
]);

const PORTFOLIO_META: Record<string, {
  website: string;
  domain: string;
  image: string;
  purpose: string;
  accent: string;
  ink: string;
  initials: string;
}> = {
  "Kuyumcu Doğan": {
    website: "https://kuyumcudogan.com",
    domain: "kuyumcudogan.com",
    image: kuyumcuDoganImage,
    purpose: "Kuyumculuk ürünlerini güven, estetik ve güçlü ürün sunumuyla dijital müşteriye ulaştırmak.",
    accent: "#d6b86b",
    ink: "#4b3810",
    initials: "KD",
  },
  Ceptematbaa: {
    website: "https://ceptematbaa.com",
    domain: "ceptematbaa.com",
    image: ceptematbaaImage,
    purpose: "Matbaa ve promosyon ürünlerini kolay keşfedilen, sipariş odaklı bir e-ticaret deneyimine taşımak.",
    accent: "#60d7d2",
    ink: "#075d5a",
    initials: "CM",
  },
  "Söyle Yerinden": {
    website: "https://soyleyerinden.com",
    domain: "soyleyerinden.com",
    image: soyleYerindenImage,
    purpose: "Yerel ve doğal ürünleri kategori, mağaza ve ürün keşfi üzerinden erişilebilir hale getirmek.",
    accent: "#8bbf54",
    ink: "#315816",
    initials: "SY",
  },
  "Kamil Keskin": {
    website: "https://kamilkeskin.com",
    domain: "kamilkeskin.com",
    image: kamilKeskinImage,
    purpose: "Moda koleksiyonlarını mobil öncelikli vitrin ve hızlı alışveriş akışıyla sunmak.",
    accent: "#d8c8a1",
    ink: "#574927",
    initials: "KK",
  },
  Benguen: {
    website: "https://benguen.com",
    domain: "benguen.com",
    image: benguenImage,
    purpose: "Tesettür moda ürünlerini kampanya, kategori ve mobil alışveriş odağında sergilemek.",
    accent: "#f0a37f",
    ink: "#7f321c",
    initials: "BG",
  },
  "Baskimo.com": {
    website: "https://baskimo.com",
    domain: "baskimo.com",
    image: baskimoImage,
    purpose: "Online baskı siparişini ürün seçimi, dosya akışı ve güvenli satın alma yapısıyla kolaylaştırmak.",
    accent: "#ff7a24",
    ink: "#7c2d12",
    initials: "BK",
  },
  Antpisos: {
    website: "https://antpisos.com",
    domain: "antpisos.com",
    image: antpisosImage,
    purpose: "Gıda ürünlerini marka hikâyesi ve e-ticaret ürün kataloğuyla doğrudan tüketiciye sunmak.",
    accent: "#9db35f",
    ink: "#3f4d16",
    initials: "AP",
  },
  "Hatay Yörem": {
    website: "https://hatayyorem.com",
    domain: "hatayyorem.com",
    image: hatayYoremImage,
    purpose: "Hatay’ın yöresel ürünlerini güçlü görsel anlatım ve kolay alışveriş deneyimiyle görünür kılmak.",
    accent: "#54a96b",
    ink: "#174d26",
    initials: "HY",
  },
};

export function ReferanslarPage() {
  const { references } = useContent();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const source = references.some((ref) => LEGACY_PLACEHOLDER_NAMES.has(ref.name)) ? INITIAL_REFERENCES : references;
  const portfolio = source.filter((ref) => {
    const matchesCategory = activeCategory === "all" || ref.category === activeCategory;
    const query = searchQuery.toLocaleLowerCase("tr-TR").trim();
    const matchesSearch = !query || `${ref.name} ${ref.sector} ${ref.desc}`.toLocaleLowerCase("tr-TR").includes(query);
    return matchesCategory && matchesSearch && PORTFOLIO_META[ref.name];
  });

  return (
    <>
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Referanslar" }]} />
      </div>
      <PageHero
        compact
        eyebrow="AVC Ekosistemi · Seçili Çalışmalar"
        title="Gerçek markalar, ortak dijital üretim gücü"
        desc="Adana360, Hatay360 ve Avcı E-Ticaret üretim ağında geliştirilen seçili web ve e-ticaret projeleri."
      >
        <Link to="/iletisim" className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3.5 text-[14px] font-black text-white shadow-[0_12px_28px_rgba(0,168,196,0.24)]">
          Projenizi konuşalım <ArrowRight className="h-4 w-4" />
        </Link>
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-[#dce9ec] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)] md:grid-cols-[5px_1fr_auto] md:items-center">
          <div className="hidden h-full bg-[linear-gradient(#00a8c4,#68d7e4)] md:block" />
          <div className="px-4 py-3.5">
            <p className="text-[11px] font-black text-[#172b39]">Tek ağ, farklı marka imzaları</p>
            <p className="mt-1 text-[10px] leading-relaxed text-[#6a7a88]">
              Kartlarda Adana360 veya Avcı E-Ticaret adını görebilirsiniz. Tümü AVC ekosisteminin ortak üretim geçmişine aittir; Avcı E-Ticaret ağın gelişmiş altyapı ve operasyon merkezidir.
            </p>
          </div>
          <div className="flex items-center gap-2 border-t border-[#edf2f3] px-4 py-3 md:border-l md:border-t-0">
            <ShieldCheck className="h-4 w-4 text-[#00a8c4]" />
            <a href="https://hub.avcieticaret.com" target="_blank" rel="noreferrer" className="text-[10px] font-black text-[#087f98]">Ekosistemi doğrula</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00a8c4]">Marka dizini</p><h2 className="mt-2 text-[24px] font-black text-[#0f172a]">Canlı projeler</h2></div>
          <a href="https://adana360.com/calismalar/" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 text-[10px] font-black text-[#087f98] sm:inline-flex">Kaynak portföy <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Object.entries(PORTFOLIO_META).map(([name, meta]) => (
            <a key={name} href={meta.website} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-2.5 rounded-full border border-[#dfe9eb] bg-white py-1.5 pl-1.5 pr-3.5 transition hover:-translate-y-0.5 hover:border-[#a8d8df]" aria-label={`${name} sitesini aç`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-black" style={{ background: meta.accent, color: meta.ink }}>{meta.initials}</span>
              <span><span className="block text-[10px] font-black text-[#1f3341]">{name}</span><span className="block text-[8px] text-[#82909b]">{meta.domain}</span></span>
            </a>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e7eff1] bg-[#f4f9fa]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div><span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#00a8c4]"><Sparkles className="h-3.5 w-3.5" /> Portföy vitrini</span><h2 className="mt-2 text-[30px] font-black tracking-[-0.04em] text-[#0f172a]">Projenin amacı, yapısı ve canlı adresi</h2></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a4af]" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Marka veya sektör ara" aria-label="Referans ara" className="w-full rounded-xl border border-[#d8e6e9] bg-white py-2.5 pl-9 pr-3 text-[12px] outline-none focus:border-[#00a8c4] sm:w-52" /></div>
              <div className="flex gap-1 rounded-xl border border-[#d8e6e9] bg-white p-1" role="group" aria-label="Referans kategorisi">{CATEGORIES.map((category) => <button key={category.id} type="button" onClick={() => setActiveCategory(category.id)} aria-pressed={activeCategory === category.id} className={`rounded-lg px-3 py-2 text-[10px] font-black transition ${activeCategory === category.id ? "bg-[#082430] text-white" : "text-[#667985] hover:bg-[#eef7f8]"}`}>{category.label}</button>)}</div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {portfolio.map((ref, index) => {
              const meta = PORTFOLIO_META[ref.name];
              return (
                <motion.article key={ref.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(index * 0.035, 0.18) }} className="group relative grid overflow-hidden rounded-[20px] border border-[#dfe9eb] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-[#b9dce2] hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)] sm:grid-cols-[155px_1fr]">
                  <span className="absolute inset-y-0 left-0 z-10 w-1" style={{ background: meta.accent }} />
                  <a href={meta.website} target="_blank" rel="noreferrer" className="relative block h-[180px] overflow-hidden border-b border-[#e2ebed] bg-[linear-gradient(145deg,#f2f7f9,#e5eff2)] p-3 sm:h-full sm:min-h-[225px] sm:border-b-0 sm:border-r">
                    <img src={meta.image} alt={`${ref.name} web tasarım projesi`} width="600" height="750" loading="lazy" className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.035]" />
                    <span className="absolute bottom-3 left-3 right-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/70 bg-white/92 px-2 py-2 text-[8px] font-black text-[#12303e] shadow-sm backdrop-blur">Projeyi aç <ExternalLink className="h-3 w-3" /></span>
                  </a>
                  <div className="flex min-w-0 flex-col p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl text-[9px] font-black" style={{ background: meta.accent, color: meta.ink }}>{meta.initials}</span><div><h3 className="text-[16px] font-black text-[#0f172a]">{ref.name}</h3><a href={meta.website} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-[#087f98]">{meta.domain}</a></div></div>
                      <span className="max-w-[92px] truncate rounded-full bg-[#f0f6f7] px-2.5 py-1 text-[7px] font-black uppercase tracking-wide text-[#607581]">{ref.sector}</span>
                    </div>
                    <p className="mt-4 text-[8px] font-black uppercase tracking-[0.17em] text-[#00a8c4]">Projenin amacı</p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-[#526477]">{meta.purpose}</p>
                    <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#edf2f3] pt-3">
                      <div><p className="text-[7px] font-black uppercase tracking-wide text-[#93a1aa]">Portföy kaydı</p><p className="mt-1 text-[9px] font-black text-[#263d4b]">Adana360</p></div>
                      <div><p className="text-[7px] font-black uppercase tracking-wide text-[#93a1aa]">Güvence</p><p className="mt-1 inline-flex items-center gap-1 text-[9px] font-black text-[#263d4b]"><ShieldCheck className="h-3 w-3 text-[#00a8c4]" /> AVC doğrulandı</p></div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {portfolio.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-[#cbdcdf] bg-white p-10 text-center text-[13px] text-[#64748b]">Bu filtrede eşleşen proje bulunamadı.</div>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-5 rounded-[28px] bg-[#082430] p-8 text-center text-white md:flex-row md:text-left">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7ee0ec]">Sıradaki çalışma</p><h2 className="mt-2 text-[28px] font-black">Markanızı portföyümüze taşıyalım.</h2><p className="mt-2 text-[13px] text-white/60">Web, e-ticaret, reklam ve yerel görünürlük tek üretim ağıyla.</p></div>
          <Link to="/iletisim" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#00a8c4] px-5 py-3 text-[13px] font-black text-white">Proje görüşmesi <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
