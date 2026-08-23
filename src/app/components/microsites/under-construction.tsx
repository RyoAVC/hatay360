import { Phone, MessageCircle, Hammer, ShieldCheck } from "lucide-react";
import type { ManagedSite } from "../../lib/site-templates";
import { prettyPhone, toTelHref, waLink } from "../../lib/site-templates";

export function UnderConstruction({ site }: { site: ManagedSite }) {
  const b = site.config.business;
  const primary = site.config.brand.primary || "#00a8c4";
  const dark = site.config.brand.dark || "#0b1220";
  const tel = toTelHref(b.phone);
  const wa = waLink(b.whatsapp || b.phone, "Merhaba, sitenizle ilgili bilgi almak istiyorum.");
  const hasPhone = Boolean(b.phone);
  const place = [b.district, b.city].filter(Boolean).join(", ");

  return (
    <div className="grid min-h-screen place-items-center px-4 font-[Inter,sans-serif] text-white" style={{ background: dark }}>
      <div className="w-full max-w-lg text-center">
        {site.config.brand.logoUrl ? (
          <img src={site.config.brand.logoUrl} alt={b.name} className="mx-auto h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl" style={{ background: `${primary}22`, color: primary }}>
            <Hammer className="h-8 w-8" />
          </span>
        )}
        <span
          className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-bold"
          style={{ background: `${primary}22`, color: primary }}
        >
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: primary }} /> Yapım Aşamasında
        </span>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">{b.name || "Yeni Sitemiz"}</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/70">
          Web sitemiz kısa süre içinde yayında olacak. {place ? `${place} bölgesinde ` : ""}hizmet vermeye devam ediyoruz —
          bu sırada bize telefon veya WhatsApp'tan ulaşabilirsiniz.
        </p>

        {hasPhone && (
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={tel} className="flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-black text-black" style={{ background: primary }}>
              <Phone className="h-5 w-5" /> {prettyPhone(b.phone)}
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-[15px] font-black text-white">
              <MessageCircle className="h-5 w-5" /> WhatsApp
            </a>
          </div>
        )}

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[12px] text-white/60">
          <ShieldCheck className="h-4 w-4" style={{ color: primary }} /> Dijital altyapı: Hatay360
        </div>
      </div>
    </div>
  );
}
