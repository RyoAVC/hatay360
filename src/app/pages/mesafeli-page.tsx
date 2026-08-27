import { useContent } from "../context/content-context";
import { getLegalDoc, normalizeCorporateContent } from "../lib/corporate-content";
import { LegalDocView } from "../components/corporate-shell";

export function MesafeliPage() {
  const { settings } = useContent();
  const c = normalizeCorporateContent(settings.corporate);
  return <LegalDocView doc={getLegalDoc(c, "mesafeli")} crumbLabel="Mesafeli satış" />;
}
