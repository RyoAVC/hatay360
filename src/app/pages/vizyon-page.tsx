import { Link } from "react-router";
import { useContent } from "../context/content-context";
import { normalizeCorporateContent } from "../lib/corporate-content";
import { CorporateCrumbs, CorporateHero, StatementPanel, ChecklistBlock } from "../components/corporate-shell";

export function VizyonPage() {
  const { settings } = useContent();
  const c = normalizeCorporateContent(settings.corporate);

  return (
    <>
      <CorporateCrumbs
        items={[
          { label: "Ana sayfa", to: "/" },
          { label: "Kurumsal", to: "/kurumsal" },
          { label: "Vizyon" },
        ]}
      />
      <CorporateHero
        eyebrow="Kurumsal"
        title={c.visionTitle}
        lead="Güvenilir dijital ortaklık ve sürdürülebilir büyümeyi hedefleyen uzun vadeli bakış."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            to="/misyon"
            className="rounded-xl border border-[#b3e5ee] bg-white px-4 py-2.5 text-[13px] font-bold text-[#008da8]"
          >
            Misyonumuz
          </Link>
          <Link to="/kurumsal" className="rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[13px] font-bold text-white">
            Kurumsal
          </Link>
        </div>
      </CorporateHero>
      <StatementPanel title={c.visionTitle} body={c.visionBody} accent="vision" />
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <ChecklistBlock title={c.principlesTitle} items={c.principles} />
      </section>
    </>
  );
}
