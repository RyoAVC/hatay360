import { PageHero } from "../components/page-hero";
import { Pricing } from "../components/pricing";
import { CallbackForm } from "../components/callback-form";
import { SupportCta } from "../components/support-cta";

export function PaketlerPage() {
  return (
    <>
      <PageHero
        eyebrow="Reklam, mağaza ve web paketleri"
        title="Önce reklam; yanında e-ticaret ve web"
        desc="Google Ads ve Meta yönetimi ayrı, mağaza ve pazaryeri altyapısı ayrı durur. Paket tutarı yönetim ücretidir; reklam bütçesi Google ve Meta'da sizin kalır. Hazır paket veya özel teklif."
      />

      <Pricing hideHeader />

      <section className="mx-auto max-w-3xl px-5 pb-8 sm:px-8">
        <div className="rounded-[28px] border border-[#ecebf5] bg-white/90 p-8 shadow-[0px_16px_40px_rgba(25,33,61,0.06)] backdrop-blur-sm">
          <CallbackForm />
        </div>
      </section>

      <SupportCta />
    </>
  );
}
