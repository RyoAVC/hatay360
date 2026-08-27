import { useContent } from "../context/content-context";
import { getLegalDoc, normalizeCorporateContent } from "../lib/corporate-content";
import { LegalDocView } from "../components/corporate-shell";
import { TERMS_FAQS } from "../lib/seo";

export function KosullarPage() {
  const { settings } = useContent();
  const c = normalizeCorporateContent(settings.corporate);
  const doc = getLegalDoc(c, "kosullar");

  return (
    <LegalDocView doc={doc}>
      <div className="mt-12">
        <h2 className="text-[20px] font-bold text-[#0c2a32]">Sık sorulanlar</h2>
        <div className="mt-4 space-y-2">
          {TERMS_FAQS.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-[#d7f0f5] bg-white p-4 open:border-[#00a8c4]/40">
              <summary className="cursor-pointer text-[15px] font-semibold text-[#0c2a32]">{faq.q}</summary>
              <p className="mt-2 text-[14px] leading-relaxed text-[#5a737b]">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </LegalDocView>
  );
}
