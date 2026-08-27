import { Link } from "react-router";
import { useContent } from "../context/content-context";
import { normalizeCorporateContent } from "../lib/corporate-content";
import { CorporateCrumbs, CorporateHero, StatementPanel, ChecklistBlock } from "../components/corporate-shell";

export function MisyonPage() {
  const { settings } = useContent();
  const c = normalizeCorporateContent(settings.corporate);

  return (
    <>
      <CorporateCrumbs
        items={[
          { label: "Ana sayfa", to: "/" },
          { label: "Kurumsal", to: "/kurumsal" },
          { label: "Misyon" },
        ]}
      />
      <CorporateHero
        eyebrow="Kurumsal"
        title={c.missionTitle}
        lead="Hatay işletmelerinin dijital görünürlük ve dönüşüm hedeflerine odaklanan net bir amaç."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            to="/vizyon"
            className="rounded-xl border border-[#b3e5ee] bg-white px-4 py-2.5 text-[13px] font-bold text-[#008da8]"
          >
            Vizyonumuz
          </Link>
          <Link to="/hakkimizda" className="rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[13px] font-bold text-white">
            Biz kimiz?
          </Link>
        </div>
      </CorporateHero>
      <StatementPanel title={c.missionTitle} body={c.missionBody} accent="mission" />
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <ChecklistBlock title={c.policiesTitle} items={c.policies} />
      </section>
    </>
  );
}
