import { useMemo, useState } from "react";
import { CheckCircle2, MessageCircle, Smartphone, Star } from "lucide-react";
import { DemoFooter, HeroSlider, PhotoGallery, StickyCall } from "./ads-site-demos";
import type { ExtraDemo } from "../lib/extra-demos";
import { toTelHref, toWhatsAppHref } from "../lib/contact";

export function CatalogDemo({ demo, phone }: { demo: ExtraDemo; phone: string }) {
  const [pick, setPick] = useState(demo.choices[0]);
  const msg = useMemo(() => `${demo.brand}: ${pick}`, [demo.brand, pick]);
  const light = demo.kind !== "pro" || demo.slug === "emlak" || demo.slug === "restoran";

  return (
    <div className={`min-h-screen pb-24 sm:pb-0 ${light ? "bg-[#f7f8fa] text-[#0f172a]" : "bg-[#070b12] text-white"}`}>
      <header className="text-white" style={{ background: demo.bg }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <p className="text-[17px] font-black">{demo.brand}</p>
          <nav className="hidden gap-5 text-[13px] font-bold text-white/75 md:flex">
            <a href="#ozel">Özel alan</a>
            <a href="#hizmet">Hizmet</a>
            <a href="#galeri">Galeri</a>
          </nav>
          <a href={toTelHref(phone)} className="rounded-full px-4 py-2 text-[13px] font-black text-black" style={{ background: demo.accent }}>
            {phone}
          </a>
        </div>
      </header>

      <HeroSlider
        className="h-[380px] sm:h-[460px]"
        overlayClass="bg-black/50"
        accent={demo.accent}
        slides={demo.slides}
      >
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-14 text-white">
          <p className="text-[12px] font-black uppercase tracking-[0.18em]" style={{ color: demo.accent }}>{demo.subtitle}</p>
          <h1 className="mt-3 max-w-2xl text-[36px] font-black leading-tight sm:text-[48px]">{demo.hook}</h1>
          <p className="mt-3 max-w-xl text-[15px] text-white/75">{demo.lead}</p>
        </div>
      </HeroSlider>

      <section id="ozel" className="mx-auto max-w-6xl px-5 py-10">
        <div className={`rounded-[28px] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8 ${light ? "bg-white" : "bg-white/5 ring-1 ring-white/10"}`}>
          <p className="text-[12px] font-black uppercase tracking-wider" style={{ color: demo.accent }}>Bu demoya özel</p>
          <h2 className="mt-2 text-[24px] font-black">{demo.title}</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {demo.choices.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setPick(c)}
                className="rounded-full px-4 py-2 text-[13px] font-black"
                style={pick === c ? { background: demo.accent, color: "#0f172a" } : { background: light ? "#f1f5f9" : "rgba(255,255,255,0.08)" }}
              >
                {c}
              </button>
            ))}
          </div>
          <a href={toWhatsAppHref(phone, msg)} className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-black text-black" style={{ background: demo.accent }}>
            <MessageCircle className="h-4 w-4" /> {pick} — WhatsApp
          </a>
        </div>
      </section>

      {demo.products && (
        <section className="mx-auto max-w-6xl px-5 pb-6">
          <h2 className="text-[26px] font-black">Vitrin / ürünler</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {demo.products.map((p) => (
              <article key={p.name} className={`overflow-hidden rounded-[24px] ${light ? "bg-white shadow-sm" : "bg-white/5 ring-1 ring-white/10"}`}>
                <div className="relative h-40">
                  <img src={p.img} alt={p.name} className="h-full w-full object-cover" />
                  {p.tag && <span className="absolute left-3 top-3 rounded-full px-2 py-1 text-[10px] font-black text-black" style={{ background: demo.accent }}>{p.tag}</span>}
                </div>
                <div className="p-4">
                  <p className="font-black">{p.name}</p>
                  <p className="mt-1 text-[13px] font-bold" style={{ color: demo.accent }}>{p.price}</p>
                  <a href={toWhatsAppHref(phone, `${demo.brand} ürün: ${p.name}`)} className="mt-3 block rounded-xl py-2 text-center text-[12px] font-black text-black" style={{ background: demo.accent }}>Sor / sipariş</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {demo.listings && (
        <section className="mx-auto max-w-6xl px-5 pb-6">
          <h2 className="text-[26px] font-black">Portföy</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {demo.listings.map((l) => (
              <article key={l.name} className="overflow-hidden rounded-[24px] bg-white text-[#0f172a] shadow-sm">
                <img src={l.img} alt={l.name} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <p className="text-[18px] font-black">{l.name}</p>
                  <p className="mt-1 text-[13px] text-[#64748b]">{l.meta}</p>
                  <p className="mt-2 text-[16px] font-black" style={{ color: demo.accent }}>{l.price}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {demo.menu && (
        <section className="mx-auto max-w-6xl px-5 pb-6">
          <h2 className="text-[26px] font-black">Menü</h2>
          <div className="mt-6 overflow-hidden rounded-[24px] bg-white text-[#0f172a]">
            {demo.menu.map((m) => (
              <div key={m.name} className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-3 last:border-0">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#94a3b8]">{m.cat}</p>
                  <p className="font-black">{m.name}</p>
                </div>
                <p className="font-black">{m.price}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {demo.widget === "software" && (
        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-6 sm:grid-cols-2">
          {["Sipariş / stok", "Randevu takvimi", "Saha ekibi", "Rapor"].map((m) => (
            <div key={m} className="rounded-[24px] bg-white/5 p-5 ring-1 ring-white/10">
              <CheckCircle2 className="h-5 w-5" style={{ color: demo.accent }} />
              <p className="mt-3 text-[18px] font-black">{m}</p>
              <p className="mt-1 text-[13px] text-white/55">Keşifte hangisi lazımsa o yazılır. Hazır lisans paketi değildir.</p>
            </div>
          ))}
        </section>
      )}

      {demo.widget === "app" && (
        <section className="mx-auto max-w-6xl px-5 pb-6">
          <div className="grid items-center gap-8 rounded-[28px] bg-white/5 p-8 ring-1 ring-white/10 lg:grid-cols-2">
            <div>
              <Smartphone className="h-8 w-8" style={{ color: demo.accent }} />
              <h2 className="mt-4 text-[26px] font-black">Android ve iOS. Store’a giden yol ayrı konuşulur.</h2>
              <p className="mt-3 text-[14px] text-white/65">Push bildirim, üye girişi, sipariş veya randevu. Web sitesi yerine cep uygulaması.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-xl bg-white px-4 py-2 text-[12px] font-black text-black">Google Play</span>
                <span className="rounded-xl bg-white px-4 py-2 text-[12px] font-black text-black">App Store</span>
              </div>
            </div>
            <img src={demo.slides[0].src} alt="Uygulama" className="h-72 w-full rounded-[24px] object-cover" />
          </div>
        </section>
      )}

      <section id="hizmet" className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="text-[26px] font-black">Hizmetler</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {demo.services.map((s) => (
            <div key={s.t} className={`rounded-[24px] p-5 ${light ? "bg-white shadow-sm" : "bg-white/5 ring-1 ring-white/10"}`}>
              <p className="text-[17px] font-black">{s.t}</p>
              <p className={`mt-2 text-[14px] ${light ? "text-[#64748b]" : "text-white/60"}`}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-6 md:grid-cols-2">
        {demo.reviews.map((r) => (
          <article key={r.n} className={`rounded-[24px] p-5 ${light ? "bg-white shadow-sm" : "bg-white/5 ring-1 ring-white/10"}`}>
            <p style={{ color: demo.accent }}><span className="inline-flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</span></p>
            <p className="mt-3 text-[15px]">“{r.t}”</p>
            <p className="mt-3 text-[13px] font-black">{r.n}</p>
          </article>
        ))}
      </section>

      <div id="galeri">
        <PhotoGallery title="Görseller" intro="Slayt kendiliğinden geçer." accent={demo.accent} dark={!light} slides={demo.slides} />
      </div>

      <DemoFooter
        phone={phone}
        brand={demo.brand}
        tagline={demo.lead}
        bg={demo.bg}
        accent={demo.accent}
        message={msg}
        links={[
          { href: "#ozel", label: "Özel alan" },
          { href: "#hizmet", label: "Hizmetler" },
          { href: "#galeri", label: "Galeri" },
        ]}
        districts={demo.districts}
      />
      <StickyCall phone={phone} message={msg} color={demo.bg} />
    </div>
  );
}
