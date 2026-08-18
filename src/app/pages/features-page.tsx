import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { PageHero } from "../components/page-hero";
import { TrustStrip } from "../components/trust-strip";
import { Features } from "../components/features";
import { ExtraModules } from "../components/extra-modules";
import { HowItWorks } from "../components/how-it-works";
import { CallbackForm } from "../components/callback-form";

export function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Özellikler"
        title="Hatay e-ticaret ve web sitesi altyapısı"
        desc="SSL, sanal POS, pazaryeri, sınırsız ürün. Hatay’da web sitesi ve mağaza kurmak isteyen işletmeler için bütünsel altyapı."
      >
        <Link to="/iletisim">
          <motion.span
            whileHover={{ y: -3 }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3 text-[16px] font-semibold text-white shadow-[0px_10px_28px_rgba(0,168,196,0.35)]"
          >
            15 gün ücretsiz dene <ArrowRight className="h-[18px] w-[18px]" />
          </motion.span>
        </Link>
      </PageHero>

      <TrustStrip />
      <Features />
      <ExtraModules />
      <HowItWorks />

      <section className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <div className="rounded-[28px] border border-[#ecebf5] bg-white p-8 shadow-[0px_16px_40px_rgba(25,33,61,0.06)]">
          <CallbackForm />
        </div>
      </section>
    </>
  );
}
