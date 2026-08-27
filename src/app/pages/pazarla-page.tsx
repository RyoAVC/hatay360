import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Layers, Globe, Target, Smartphone, Code2, MapPinned, Store } from "lucide-react";
import { PageCrumbs } from "../components/page-crumbs";
import { PageHero } from "../components/page-hero";
import { Marketplace } from "../components/marketplace";
import { Reveal, staggerItem } from "../components/motion-primitives";
import { ExtraModules } from "../components/extra-modules";
import { ServiceAreas } from "../components/service-areas";
import { GoogleMapsPromo } from "../components/google-maps-promo";
import { SERVICE_FAQS } from "../lib/seo";

const BENEFITS = [
  { icon: Target, title: "Hatay reklam ajansı", desc: "Google Ads ve Meta reklam. Hatay’da reklam bütçesini satışa çeviren ajans yönetimi." },
  { icon: Globe, title: "Hatay web tasarım", desc: "Telefon, WhatsApp ve form dönüşümüne odaklı kurumsal site ve landing page. Antakya ve İskenderun işletmelerine özel." },
  { icon: MapPinned, title: "Google Maps & harita SEO", desc: "Harita kaydı, yerel sıralama, profil optimizasyonu ve gerçek müşteri yorum yönetimi." },
  { icon: Store, title: "E-ticaret & görünürlük", desc: "Satış sitesi ve reklam birlikte yürür; mağazanızın kurumsal görünürlüğü ve sipariş akışı aynı ekiple kurulur." },
  { icon: Code2, title: "Özel yazılım", desc: "Form, WhatsApp ve kampanya verilerini tek ekiple yönetir; işletmenize özel otomasyon." },
  { icon: Smartphone, title: "Mobil uygulama", desc: "iOS ve Android mağaza yayını. Hatay markanızın cebindeki uygulaması." },
  { icon: Layers, title: "Pazarla (ayrı ürün)", desc: "Trendyol ve Hepsiburada senkronu yukarıdaki Pazarla vitrininde. Kardeş ürün; Hatay360 çekirdek hizmeti değildir." },
];

export function PazarlaPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Pazarla" }]} />
      </div>
      <PageHero
        eyebrow="Hatay reklam ajansı"
        title="Google Ads, sosyal medya ve yerel görünürlük"
        desc="İskenderun’dan Dörtyol’a: Google reklamları, Meta kampanyaları, yerel SEO ve satış odaklı web sayfaları. Hatay360 — Antakya merkezli tek ekip."
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/paketler">
            <motion.span
              whileHover={{ y: -3 }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3.5 text-[16px] font-bold text-white shadow-[0px_10px_28px_rgba(0,168,196,0.35)]"
            >
              Paketleri İnceleyin <ArrowRight className="h-[18px] w-[18px]" />
            </motion.span>
          </Link>
          <Link
            to="/iletisim"
            className="inline-flex items-center gap-2 rounded-xl border border-[#d9dbe9] bg-white/90 px-6 py-3.5 text-[16px] font-bold text-[#1a1a1a] hover:border-[#00a8c4] hover:text-[#00a8c4]"
          >
            Sizi arayalım
          </Link>
        </div>
      </PageHero>

      <Marketplace hideIntro />

      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8"><GoogleMapsPromo compact /></div>

      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-[14px] font-semibold uppercase tracking-wider text-[#00a8c4]">
            Neden Hatay360?
          </span>
          <h2 className="mt-3 text-[32px] font-bold tracking-tight text-[#1a1a1a] sm:text-[40px]">
            Hatay reklam ajansı ve görünürlük ekibi, tek çatıda
          </h2>
          <p className="mt-3 text-[16px] text-[#514f6e]">
            Ayrı ajans, ayrı içerik, ayrı kampanya yönetimi yok. Google reklamları, Meta, yerel SEO ve satış sayfaları aynı ekiple yürür.
          </p>
        </Reveal>

        <motion.div
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {BENEFITS.map((b) => (
            <motion.div
              key={b.title}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-[#ecebf5] bg-white/85 p-6 shadow-sm backdrop-blur-sm hover:border-[#b3e5ee] hover:shadow-md transition-all"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4]">
                <b.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-[18px] font-bold text-[#1a1a1a]">{b.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#6f6c8f]">{b.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        <h2 className="text-[24px] font-bold text-[#1a1a1a]">Sık sorulanlar</h2>
        <div className="mt-5 space-y-3">
          {SERVICE_FAQS.map((item) => (
            <details key={item.q} className="rounded-2xl border border-[#ecebf5] bg-white/90 p-5 open:border-[#b3e5ee]">
              <summary className="cursor-pointer text-[16px] font-semibold text-[#1a1a1a]">{item.q}</summary>
              <p className="mt-3 text-[15px] leading-relaxed text-[#6f6c8f]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <ExtraModules />
      <ServiceAreas mode="chips" />
    </>
  );
}
