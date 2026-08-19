import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { PageCrumbs } from "../components/page-crumbs";
import { PageHero } from "../components/page-hero";
import { TrustStrip } from "../components/trust-strip";
import { Features } from "../components/features";
import { ExtraModules } from "../components/extra-modules";
import { HowItWorks } from "../components/how-it-works";
import { CallbackForm } from "../components/callback-form";
import { FEATURE_FAQS } from "../lib/seo";

export function FeaturesPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Özellikler" }]} />
      </div>
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

      <section className="mx-auto max-w-3xl px-5 pb-10 sm:px-8">
        <h2 className="text-[24px] font-bold text-[#1a1a1a]">Sık sorulanlar</h2>
        <p className="mt-2 text-[15px] text-[#6f6c8f]">SSL, mağaza ve deneme — kısa cevaplar.</p>
        <div className="mt-5 space-y-2">
          {FEATURE_FAQS.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-[#ecebf5] bg-white p-4 open:border-[#b3e5ee]">
              <summary className="cursor-pointer text-[15px] font-semibold text-[#1a1a1a]">{faq.q}</summary>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6f6c8f]">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <div className="rounded-[28px] border border-[#ecebf5] bg-white p-8 shadow-[0px_16px_40px_rgba(25,33,61,0.06)]">
          <CallbackForm />
        </div>
      </section>
    </>
  );
}
