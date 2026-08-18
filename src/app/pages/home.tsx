import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Hero } from "../components/hero";
import { ServicePillars } from "../components/service-pillars";
import { SectorSolutions } from "../components/sector-solutions";
import { HowItWorks } from "../components/how-it-works";
import { Features } from "../components/features";
import { SpecialDesign } from "../components/special-design";
import { IntegrationsShowcase } from "../components/integrations-showcase";
import { Pricing } from "../components/pricing";
import { ServiceAreas } from "../components/service-areas";
import { CallbackForm } from "../components/callback-form";
import { SupportCta } from "../components/support-cta";
import { GoogleMapsPromo } from "../components/google-maps-promo";
import { sectionOn, useContent } from "../context/content-context";

export function HomePage() {
  const { settings } = useContent();
  const on = (id: Parameters<typeof sectionOn>[1]) => sectionOn(settings, id);

  return (
    <>
      <Hero />
      {on("pillars") && <ServicePillars />}
      {on("maps") && <GoogleMapsPromo />}
      {on("sectors") && <SectorSolutions />}
      {on("howItWorks") && <HowItWorks />}
      {on("features") && <Features />}
      {on("specialDesign") && <SpecialDesign />}
      {on("integrations") && <IntegrationsShowcase />}

      {on("pricing") && <Pricing />}
      {on("districts") && <ServiceAreas mode="featured" />}

      {on("callback") && (
        <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
          <div className="grid items-center gap-10 rounded-[32px] border border-[#ecebf5] bg-white p-8 shadow-[0px_20px_50px_rgba(25,33,61,0.06)] lg:grid-cols-2 lg:p-12">
            <div>
              <h2 className="text-[28px] font-bold tracking-tight text-[#1a1a1a] sm:text-[34px]">
                Hatay’da daha çok müşteri için reklam planı hazırlayalım
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-[#6f6c8f]">
                Google Ads, Meta reklamları, yerel görünürlük ve doğru landing page ile işletmenizin dönüşümünü artırırız.
                Numaranızı bırakın; sektörünüze uygun reklam paketi ve satış sayfası planını birlikte çıkaralım.
              </p>
              <Link to="/paketler" className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-[#00a8c4]">
                Paketleri incele <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <CallbackForm compact />
          </div>
        </section>
      )}

      {on("bottomCta") && (
        <section className="mx-auto max-w-6xl px-5 pb-4 sm:px-8">
          <div className="flex flex-col items-center gap-5 rounded-[32px] bg-gradient-to-br from-[#00a8c4] to-[#3ec8dc] px-8 py-14 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl text-[30px] font-bold tracking-tight text-white sm:text-[38px]"
            >
              Hatay’da daha çok aranmak için doğru reklamı kuruyoruz
            </motion.h2>
            <p className="max-w-xl text-[17px] leading-relaxed text-[#c5f0f6]">
              Google Ads, Meta reklamları, yerel SEO ve satış odaklı web sayfaları tek ekiple. Görünürlük, telefon ve başvuru artışı hedefimiz.
            </p>
            <Link to="/iletisim">
              <motion.span
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[16px] font-semibold text-[#00a8c4] shadow-[0px_12px_30px_rgba(0,0,0,0.15)]"
              >
                Sizi arayalım <ArrowRight className="h-[18px] w-[18px]" />
              </motion.span>
            </Link>
          </div>
        </section>
      )}

      {on("supportCta") && <SupportCta />}
    </>
  );
}
