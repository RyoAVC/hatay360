import { PageCrumbs } from "../components/page-crumbs";
import { PageHero } from "../components/page-hero";
import { Pricing } from "../components/pricing";
import { CallbackForm } from "../components/callback-form";
import { SupportCta } from "../components/support-cta";
import { PACKAGE_FAQS } from "../lib/seo";

export function PaketlerPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Paketler" }]} />
      </div>
      <PageHero
        eyebrow="Reklam, mağaza ve web paketleri"
        title="Önce reklam; yanında e-ticaret ve web"
        desc="Google Ads ve Meta yönetimi ayrı, mağaza ve pazaryeri altyapısı ayrı durur. Paket tutarı yönetim ücretidir; reklam bütçesi Google ve Meta'da sizin kalır. Hazır paket veya özel teklif."
      />

      <Pricing hideHeader />

      <section className="mx-auto max-w-3xl px-5 pb-8 sm:px-8">
        <h2 className="text-[24px] font-bold text-[#1a1a1a]">Paketler hakkında</h2>
        <div className="mt-5 space-y-3">
          {PACKAGE_FAQS.map((item) => (
            <details key={item.q} className="rounded-2xl border border-[#ecebf5] bg-white/90 p-5 open:border-[#b3e5ee]">
              <summary className="cursor-pointer text-[16px] font-semibold text-[#1a1a1a]">{item.q}</summary>
              <p className="mt-3 text-[15px] leading-relaxed text-[#6f6c8f]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-8 sm:px-8">
        <div className="rounded-[28px] border border-[#ecebf5] bg-white/90 p-8 shadow-[0px_16px_40px_rgba(25,33,61,0.06)] backdrop-blur-sm">
          <CallbackForm />
        </div>
      </section>

      <SupportCta />
    </>
  );
}
