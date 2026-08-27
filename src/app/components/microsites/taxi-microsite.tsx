import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, Star, Navigation, Car, UserCheck, MessageSquare } from "lucide-react";
import type { ManagedSite } from "../../lib/site-templates";
import { prettyPhone, toTelHref, waLink } from "../../lib/site-templates";
import {
  isTaxireyhanliSite,
  TAXIREYHANLI_INTRO,
  TAXIREYHANLI_WHY_CHOOSE,
} from "../../lib/microsites/taxireyhanli-content";

export function TaxiMicrosite({ site }: { site: ManagedSite }) {
  const { config } = site;
  const b = config.business;
  const primary = config.brand.primary || "#f5b301";
  const dark = config.brand.dark || "#0b1220";
  const tel = toTelHref(b.phone);
  const wa = waLink(b.whatsapp || b.phone, config.whatsappTemplate);
  const phoneText = prettyPhone(b.phone);
  const place = [b.district, b.city].filter(Boolean).join(", ");
  const taxireyhanli = isTaxireyhanliSite(site);

  return (
    <div className="min-h-screen bg-[#f7f8fa] font-[Inter,sans-serif] text-[#0b1220] antialiased">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            {config.brand.logoUrl ? (
              <img
                src={config.brand.logoUrl}
                alt={b.name}
                className="h-9 w-9 rounded-lg object-cover"
                loading="lazy"
                decoding="async"
                width={36}
                height={36}
              />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-lg text-white" style={{ background: dark }}>
                <Car className="h-5 w-5" />
              </span>
            )}
            <div className="leading-tight">
              <p className="text-[15px] font-black">{taxireyhanli ? "Reyhanlı Taksi — Mehmet Y." : b.name}</p>
              <p className="text-[11px] text-black/50">{place}</p>
            </div>
          </div>
          <a
            href={tel}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-black text-black shadow-sm"
            style={{ background: primary }}
            aria-label={`Reyhanlı taksi telefon: ${phoneText}`}
          >
            <Phone className="h-4 w-4" /> {phoneText}
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden" style={{ background: dark }}>
        <div className="mx-auto max-w-5xl px-4 py-12 text-white sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white/90">
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: primary }} /> {config.hero.badge}
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
            {taxireyhanli ? "Reyhanlı Taksi" : config.hero.title}
          </h1>
          {taxireyhanli && (
            <p className="mt-2 text-lg font-bold text-white/90 sm:text-xl">Mehmet Y. — şahıs taksi sürücüsü · Hatay</p>
          )}
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80 sm:text-[17px]">{config.hero.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={tel}
              className="flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-black text-black shadow-lg"
              style={{ background: primary }}
            >
              <Phone className="h-5 w-5" /> {config.hero.callLabel} · {phoneText}
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-[15px] font-black text-white shadow-lg"
            >
              <MessageCircle className="h-5 w-5" /> {config.hero.whatsappLabel}
            </a>
          </div>

          {config.highlights.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {config.highlights.map((h, i) => (
                <div key={i} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-xl font-black" style={{ color: primary }}>{h.value}</p>
                  <p className="text-[12px] text-white/70">{h.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {taxireyhanli && (
        <section className="border-b border-black/5 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <p className="text-[15px] leading-relaxed text-black/70 sm:text-[16px]">{TAXIREYHANLI_INTRO}</p>
            <p className="mt-4 text-[14px] text-black/55">
              Reyhanlı taksi telefon:{" "}
              <a href={tel} className="font-black text-[#0b1220] underline decoration-[#f5b301] decoration-2 underline-offset-2">
                {phoneText}
              </a>
            </p>
          </div>
        </section>
      )}

      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-4">
          {[
            { icon: Clock, t: b.hours, s: "Hat açık" },
            { icon: ShieldCheck, t: taxireyhanli ? "Mehmet Y." : "Güvenli", s: "Şahıs sürücü" },
            { icon: MapPin, t: b.district || b.city, s: "Hizmet bölgesi" },
            { icon: Star, t: "7/24", s: "Ulaşılabilir" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${primary}22`, color: dark }}>
                <item.icon className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-[14px] font-black">{item.t}</p>
                <p className="text-[11px] text-black/50">{item.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {taxireyhanli && (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-2xl font-black sm:text-3xl">Neden Bizi Seçmelisiniz?</h2>
          <p className="mt-2 max-w-2xl text-[15px] text-black/60">
            Hatay Reyhanlı taksi aramasında durak yerine doğrudan sürücüyle iletişim.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {TAXIREYHANLI_WHY_CHOOSE.map((item, i) => (
              <div key={i} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                <UserCheck className="h-5 w-5" style={{ color: dark }} />
                <p className="mt-3 text-[16px] font-black">{item.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-black/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {config.services.length > 0 && (
        <section className={`mx-auto max-w-5xl px-4 py-12 ${taxireyhanli ? "bg-white" : ""}`}>
          <h2 className="text-2xl font-black sm:text-3xl">Hizmetlerimiz</h2>
          <p className="mt-2 max-w-2xl text-[15px] text-black/60">
            {place} bölgesinde Reyhanlı taksi ihtiyacınıza hızlı yanıt veriyoruz.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.services.map((s, i) => (
              <div key={i} className="rounded-2xl border border-black/5 bg-[#f7f8fa] p-5 shadow-sm">
                <span className="grid h-10 w-10 place-items-center rounded-xl text-black" style={{ background: primary }}>
                  <Car className="h-5 w-5" />
                </span>
                <p className="mt-3 text-[16px] font-black">{s.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-black/60">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {config.areas.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <h2 className="text-2xl font-black sm:text-3xl">Hizmet Bölgeleri</h2>
            <p className="mt-2 max-w-2xl text-[15px] text-black/60">
              Reyhanlı merkez ve çevre mahallelerde Reyhanlı&apos;da taksi çağırma; Cilvegözü ve hastane hattı dahil.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {config.areas.map((area, i) => (
                <span key={i} className="rounded-full border border-black/10 bg-[#f7f8fa] px-3 py-1.5 text-[13px] font-semibold">
                  {area}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {taxireyhanli && (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-2xl font-black sm:text-3xl">Müşteri Yorumları</h2>
          <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-white p-8 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-black/25" />
            <p className="mt-3 text-[15px] font-bold text-black/50">Yorumlar yakında eklenecek</p>
            <p className="mt-1 text-[13px] text-black/40">
              Hizmet aldıktan sonra Google üzerinden gerçek yorum bırakabilirsiniz. Sahte yorum yayınlanmaz.
            </p>
          </div>
        </section>
      )}

      {(b.mapEmbedUrl || b.mapsUrl) && (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-2xl font-black sm:text-3xl">Konum ve Harita</h2>
          <p className="mt-2 text-[15px] text-black/60">{b.addressText || place}</p>
          {taxireyhanli && (
            <p className="mt-2 text-[13px] text-black/45">
              Google İşletme Profili kaydı Hatay360 üzerinden başlatıldı; haritada görünürlük süreci devam ediyor.
            </p>
          )}
          {b.mapEmbedUrl && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-black/10">
              <iframe
                title="Reyhanlı taksi hizmet bölgesi haritası"
                src={b.mapEmbedUrl}
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
          {b.mapsUrl && (
            <a
              href={b.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-black text-black"
              style={{ background: primary }}
            >
              <Navigation className="h-4 w-4" /> Google Haritada Ara
            </a>
          )}
        </section>
      )}

      {config.faqs.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <h2 className="text-2xl font-black sm:text-3xl">Sık Sorulan Sorular</h2>
            <div className="mt-6 space-y-3">
              {config.faqs.map((f, i) => (
                <details key={i} className="group rounded-2xl border border-black/10 bg-[#f7f8fa] p-4">
                  <summary className="cursor-pointer list-none text-[15px] font-black">{f.q}</summary>
                  <p className="mt-2 text-[14px] leading-relaxed text-black/60">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ background: dark }}>
        <div className="mx-auto max-w-5xl px-4 py-12 text-center text-white">
          <h2 className="text-2xl font-black sm:text-3xl">Reyhanlı taksi telefon — hemen arayın</h2>
          <p className="mx-auto mt-2 max-w-xl text-[15px] text-white/70">
            Hatay Reyhanlı taksi için Mehmet Y. şahıs taksi. Konumunuzu paylaşın, taksiniz yola çıksın.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={tel} className="flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-black text-black" style={{ background: primary }}>
              <Phone className="h-5 w-5" /> {phoneText}
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-[15px] font-black text-white">
              <MessageCircle className="h-5 w-5" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-black/90 text-white/70">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-[15px] font-black text-white">{taxireyhanli ? "Reyhanlı Taksi — Mehmet Y." : b.name}</p>
          <p className="mt-1 text-[13px]">{b.addressText || place}</p>
          <p className="mt-1 text-[13px]">
            Reyhanlı taksi telefon:{" "}
            <a href={tel} className="font-black text-white underline decoration-[#f5b301] underline-offset-2">
              {phoneText}
            </a>
          </p>
          <div className="mt-4 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-4 text-[12px] sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} {taxireyhanli ? "Mehmet Y. — Reyhanlı Taksi" : b.name}</span>
            <a href="https://hatay360.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
              Dijital altyapı: Hatay360
            </a>
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-px border-t border-black/10 bg-white sm:hidden">
        <a href={tel} className="flex items-center justify-center gap-2 py-3 text-[14px] font-black" style={{ color: dark }}>
          <Phone className="h-4 w-4" /> Ara
        </a>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 text-[14px] font-black text-[#25D366]">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
      <div className="h-14 sm:hidden" />
    </div>
  );
}
