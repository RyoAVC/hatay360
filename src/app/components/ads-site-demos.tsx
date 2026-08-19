import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  BadgeCheck,
  Box,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Home,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Plane,
  Shield,
  Snowflake,
  Star,
  Stethoscope,
  Truck,
  WashingMachine,
  Wrench,
} from "lucide-react";
import { DEMO_PHOTOS } from "../lib/avclabs";
import { toTelHref, toWhatsAppHref } from "../lib/contact";

export type Slide = { src: string; alt: string; caption?: string };

export function HeroSlider({
  slides,
  overlayClass = "bg-black/45",
  className = "h-[420px]",
  accent = "#facc15",
  children,
}: {
  slides: Slide[];
  overlayClass?: string;
  className?: string;
  accent?: string;
  children?: ReactNode;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 4800);
    return () => clearInterval(t);
  }, [slides.length]);
  const go = (dir: number) => setI((n) => (n + dir + slides.length) % slides.length);
  return (
    <div className={`relative overflow-hidden touch-pan-y ${className}`}>
      {slides.map((s, idx) => (
        <img
          key={`${s.src}-${idx}`}
          src={s.src}
          alt={s.alt}
          loading={idx === 0 ? "eager" : "lazy"}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className={`absolute inset-0 ${overlayClass}`} />
      {slides[i]?.caption && (
        <span className="absolute left-5 top-5 z-10 rounded-full bg-black/55 px-3 py-1 text-[11px] font-black text-white">
          {slides[i].caption}
        </span>
      )}
      <div className="relative z-10 h-full">{children}</div>
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button type="button" aria-label="Önceki" onClick={() => go(-1)} className="rounded-full bg-black/45 p-2 text-white backdrop-blur hover:bg-black/65">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Slayt ${idx + 1}`}
              aria-current={idx === i ? "true" : undefined}
              onClick={() => setI(idx)}
              className="h-1.5 rounded-full transition-all"
              style={{ width: idx === i ? 22 : 8, background: idx === i ? accent : "rgba(255,255,255,0.45)" }}
            />
          ))}
        </div>
        <button type="button" aria-label="Sonraki" onClick={() => go(1)} className="rounded-full bg-black/45 p-2 text-white backdrop-blur hover:bg-black/65">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function PhotoGallery({ title, intro, slides, accent, dark }: { title: string; intro: string; slides: Slide[]; accent: string; dark?: boolean }) {
  return (
    <section className={`px-5 py-14 ${dark ? "bg-black text-white" : ""}`}>
      <div className="mx-auto max-w-6xl">
        <h2 className="text-[28px] font-black">{title}</h2>
        <p className={`mt-2 text-[14px] ${dark ? "text-white/55" : "text-[#64748b]"}`}>{intro}</p>
        <div className="mt-6 overflow-hidden rounded-[28px] shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <HeroSlider slides={slides} className="h-[260px] sm:h-[380px]" overlayClass="bg-black/20" accent={accent} />
        </div>
      </div>
    </section>
  );
}

export function DemoFooter({
  phone,
  brand,
  tagline,
  bg,
  accent,
  accentText = "#0f172a",
  links,
  districts,
  message,
}: {
  phone: string;
  brand: string;
  tagline: string;
  bg: string;
  accent: string;
  accentText?: string;
  links: { href: string; label: string }[];
  districts: string[];
  message: string;
}) {
  return (
    <footer className="text-white" style={{ background: bg }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="text-[20px] font-black">{brand}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-white/65">{tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={toTelHref(phone)} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-black" style={{ background: accent, color: accentText }}>
              <Phone className="h-4 w-4" /> {phone}
            </a>
            <a href={toWhatsAppHref(phone, message)} className="inline-flex items-center gap-2 rounded-xl bg-[#16a34a] px-4 py-2.5 text-[13px] font-black">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
        <div>
          <p className="text-[12px] font-black uppercase tracking-wider text-white/45">Sayfalar</p>
          <div className="mt-3 grid gap-2 text-[14px] font-bold text-white/80">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-white">{l.label}</a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[12px] font-black uppercase tracking-wider text-white/45">Hizmet bölgesi</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {districts.map((d) => (
              <span key={d} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80">{d}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-[12px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>Örnek web sitesi · Hatay360 tasarımı</p>
          <Link to="/demolar" className="font-bold text-white/70 hover:text-white">Tüm demolar →</Link>
        </div>
      </div>
    </footer>
  );
}

function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-current" />
      ))}
    </span>
  );
}

export function StickyCall({ phone, message, color }: { phone: string; message: string; color: string }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-lg gap-2 sm:hidden">
      <a href={toTelHref(phone)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-black text-white shadow-lg" style={{ background: color }}>
        <Phone className="h-4 w-4" /> Ara
      </a>
      <a href={toWhatsAppHref(phone, message)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#16a34a] py-3.5 text-[14px] font-black text-white shadow-lg">
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
    </div>
  );
}

const field = "w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#0284c7]";

export function TaxiDemo({ phone }: { phone: string }) {
  const [from, setFrom] = useState("Antakya merkez");
  const [when, setWhen] = useState("şimdi");
  const routes = [
    { from: "Antakya merkez", to: "Hatay Havalimanı", min: "45 dk", price: "₺950", note: "Tabela + bagaj" },
    { from: "Defne", to: "Antakya", min: "18 dk", price: "₺280", note: "Şehir içi" },
    { from: "İskenderun", to: "Antakya", min: "55 dk", price: "₺1.150", note: "Transfer" },
    { from: "Samandağ", to: "Antakya", min: "40 dk", price: "₺720", note: "Sahil hattı" },
  ];
  const fleet = [
    { name: "Sedan", d: "1–4 kişi · günlük şehir", img: DEMO_PHOTOS.taxiCar, tag: "En çok" },
    { name: "VIP", d: "Deri koltuk · havalimanı", img: DEMO_PHOTOS.taxiVip, tag: "Transfer" },
    { name: "Gece", d: "7/24 · kayıtlı plaka", img: DEMO_PHOTOS.taxiNight, tag: "24 saat" },
  ];
  return (
    <div className="min-h-screen bg-[#09090b] pb-24 text-white sm:pb-0">
      <header className="border-b border-[#facc15]/20 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <p className="text-[18px] font-black tracking-tight">
            <span className="text-[#facc15]">HATAY</span> TAKSİ 24
          </p>
          <nav className="hidden items-center gap-6 text-[13px] font-bold text-white/70 md:flex">
            <a href="#cagir">Çağır</a>
            <a href="#tarife">Tarife</a>
            <a href="#filo">Filo</a>
          </nav>
          <a href={toTelHref(phone)} className="rounded-full bg-[#facc15] px-4 py-2 text-[13px] font-black text-black">
            {phone}
          </a>
        </div>
      </header>

      <section className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <HeroSlider
          className="min-h-[420px] lg:min-h-full"
          overlayClass="bg-gradient-to-t from-black via-black/45 to-black/10"
          accent="#facc15"
          slides={[
            { src: DEMO_PHOTOS.taxi, alt: "Hatay taksi", caption: "Şehir içi çağrı" },
            { src: DEMO_PHOTOS.taxiNight, alt: "Gece taksi", caption: "Gece 7/24" },
            { src: DEMO_PHOTOS.taxiAirport, alt: "Havalimanı", caption: "Havalimanı transfer" },
            { src: DEMO_PHOTOS.taxiVip, alt: "VIP araç", caption: "VIP" },
          ]}
        >
          <div className="flex h-full min-h-[420px] flex-col justify-end p-8 sm:p-12">
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#facc15]">Santral · konum at · 7/24</p>
            <h1 className="mt-3 max-w-lg text-[40px] font-black leading-[1.05] sm:text-[50px]">Taksi çağırın. 8–12 dakikada kapıda.</h1>
            <p className="mt-4 max-w-md text-[15px] text-white/75">Uygulama değil; Hatay santrali. Ücret yola çıkmadan söylenir.</p>
          </div>
        </HeroSlider>
        <div id="cagir" className="bg-[#facc15] p-7 text-black sm:p-9">
          <p className="text-[12px] font-black uppercase tracking-[0.16em]">Çağrı kutusu</p>
          <h2 className="mt-2 text-[26px] font-black">Nereden alalım?</h2>
          <label className="mt-6 block text-[12px] font-black">
            Alış noktası
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-2 w-full rounded-xl border-0 bg-black px-4 py-3 text-[14px] font-bold text-white">
              {["Antakya merkez", "Defne", "İskenderun", "Samandağ", "Hatay Havalimanı"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <p className="mt-4 text-[12px] font-black">Ne zaman?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["şimdi", "15 dk", "30 dk", "uçuş saati"].map((w) => (
              <button key={w} type="button" onClick={() => setWhen(w)} className={`rounded-full px-3 py-2 text-[12px] font-black ${when === w ? "bg-black text-[#facc15]" : "bg-black/10"}`}>
                {w}
              </button>
            ))}
          </div>
          <a
            href={toWhatsAppHref(phone, `Taksi: ${from}, ${when}`)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-[15px] font-black text-[#facc15]"
          >
            <Phone className="h-4 w-4" /> Santrali çağır
          </a>
          <p className="mt-3 text-[12px] font-bold text-black/60">Şu an Antakya’da 6 araç müsait. {from} · {when}.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-14 sm:grid-cols-3">
        {[
          { icon: Plane, t: "Havalimanı karşılama", d: "Tabela, sabit tarife, bagaj. Uçuş saatine göre çıkış." },
          { icon: MapPin, t: "İlçe transferi", d: "Defne, İskenderun, Samandağ. Kısa mesafe ayrı tarife." },
          { icon: Shield, t: "Kayıtlı plaka", d: "Gece çağrıda sürücü ve plaka söylenir." },
        ].map((x) => (
          <div key={x.t} className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <x.icon className="h-6 w-6 text-[#facc15]" />
            <p className="mt-4 text-[18px] font-black">{x.t}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-white/60">{x.d}</p>
          </div>
        ))}
      </section>

      <section id="filo" className="border-y border-white/10 bg-black py-14">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-[28px] font-black">Filo</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {fleet.map((car) => (
              <article key={car.name} className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111]">
                <div className="relative h-44">
                  <img src={car.img} alt={car.name} className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-[#facc15] px-2.5 py-1 text-[10px] font-black text-black">{car.tag}</span>
                </div>
                <div className="p-5">
                  <p className="text-[18px] font-black">{car.name}</p>
                  <p className="mt-1 text-[13px] text-white/55">{car.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tarife" className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-[28px] font-black">Hatay içi örnek tarife</h2>
        <p className="mt-2 text-[14px] text-white/55">Gündüz örnekleri. Gece ve trafik aramada netleşir.</p>
        <div className="mt-8 overflow-hidden rounded-[24px] border border-white/10">
          {routes.map((r, i) => (
            <div key={r.from} className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${i % 2 ? "bg-white/5" : ""}`}>
              <div>
                <p className="font-black">{r.from} → {r.to}</p>
                <p className="text-[12px] text-white/45">{r.min} · {r.note}</p>
              </div>
              <p className="text-[18px] font-black text-[#facc15]">{r.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="yorum" className="mx-auto grid max-w-6xl gap-4 px-5 py-14 md:grid-cols-3">
        {[
          { n: "Mehmet K.", t: "Havalimanı 05:40 uçuş. Araç 05:05 kapıdaydı.", s: "Antakya" },
          { n: "Selin A.", t: "Defne’den merkeze gece. Ücret başta söylendi.", s: "Defne" },
          { n: "Hakan Y.", t: "İskenderun transferi. Çocuk koltuğu hazırdı.", s: "İskenderun" },
        ].map((r) => (
          <article key={r.n} className="rounded-[24px] border border-white/10 p-5">
            <p className="text-[#facc15]"><Stars /></p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/80">“{r.t}”</p>
            <p className="mt-4 text-[13px] font-black">{r.n} · {r.s}</p>
          </article>
        ))}
      </section>
      <PhotoGallery
        dark
        title="Araç ve hat görselleri"
        intro="Şehir, gece, havalimanı — slayt kendiliğinden geçer."
        accent="#facc15"
        slides={[
          { src: DEMO_PHOTOS.taxiCar, alt: "Sedan", caption: "Sedan" },
          { src: DEMO_PHOTOS.taxiNight, alt: "Gece", caption: "Gece çağrı" },
          { src: DEMO_PHOTOS.taxiAirport, alt: "Uçak", caption: "Havalimanı" },
          { src: DEMO_PHOTOS.taxiVip, alt: "VIP", caption: "VIP" },
        ]}
      />
      <DemoFooter
        phone={phone}
        brand="HATAY TAKSİ 24"
        tagline="7/24 santral, havalimanı karşılama ve ilçe transferi. Ücret yola çıkmadan söylenir."
        bg="#050505"
        accent="#facc15"
        message={`Taksi: ${from}, ${when}`}
        links={[
          { href: "#cagir", label: "Taksi çağır" },
          { href: "#tarife", label: "Tarife" },
          { href: "#filo", label: "Filo" },
        ]}
        districts={["Antakya", "Defne", "İskenderun", "Samandağ", "Dörtyol", "Havalimanı"]}
      />
      <StickyCall phone={phone} message={`Taksi: ${from}, ${when}`} color="#ca8a04" />
    </div>
  );
}

const TRUCKS: Record<string, { m3: string; truck: string; note: string }> = {
  "1+1": { m3: "8 m³", truck: "Kamyonet", note: "Stüdyo / 1+1, az eşya" },
  "2+1": { m3: "14 m³", truck: "Kapalı kamyon", note: "Tipik Hatay evi" },
  "3+1": { m3: "22 m³", truck: "Büyük kamyon", note: "Koli + koltuk takımı" },
  Ofis: { m3: "18 m³", truck: "Kapalı kamyon", note: "Masa / dolap / arşiv" },
};

export function NakliyatDemo({ phone }: { phone: string }) {
  const [home, setHome] = useState("2+1");
  const [lift, setLift] = useState("var");
  const [floor, setFloor] = useState("3");
  const [items, setItems] = useState<string[]>(["Koltuk takımı", "Buzdolabı"]);
  const estimate = TRUCKS[home];
  const toggle = (name: string) => {
    setItems((cur) => (cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name]));
  };
  const jobs = [
    { img: DEMO_PHOTOS.nakliyatBoxes, t: "Evden eve", d: "Koli evi boşaltırken bizde. Asansör yoksa merdiven ekibi yazılı eklenir." },
    { img: DEMO_PHOTOS.nakliyatOffice, t: "Ofis taşıma", d: "Cuma akşam söküm, pazartesi açık. Dosya ve masa koruma." },
    { img: DEMO_PHOTOS.nakliyat, t: "Şehirler arası", d: "Hatay → Adana / Mersin. Sigorta + teslim tutanağı." },
  ];
  return (
    <div className="min-h-screen bg-[#eef3f8] pb-24 text-[#0f172a] sm:pb-0">
      <header className="bg-[#0b3a5b] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <p className="flex items-center gap-2 text-[17px] font-black">
            <Truck className="h-5 w-5 text-[#38bdf8]" /> Hatay Nakliyat
          </p>
          <nav className="hidden gap-6 text-[13px] font-bold text-white/70 md:flex">
            <a href="#kesif">Keşif</a>
            <a href="#arac">Araç</a>
            <a href="#hizmetler">Hizmetler</a>
          </nav>
          <a href={toTelHref(phone)} className="rounded-full bg-[#38bdf8] px-4 py-2 text-[13px] font-black text-[#0b3a5b]">
            {phone}
          </a>
        </div>
      </header>

      <HeroSlider
        className="h-[360px] sm:h-[440px]"
        overlayClass="bg-[#0b3a5b]/72"
        accent="#38bdf8"
        slides={[
          { src: DEMO_PHOTOS.nakliyat, alt: "Kamyon", caption: "Şehirler arası kamyon" },
          { src: DEMO_PHOTOS.nakliyatBoxes, alt: "Koli", caption: "Koli ve ambalaj" },
          { src: DEMO_PHOTOS.nakliyatOffice, alt: "Ofis", caption: "Ofis taşıma" },
          { src: DEMO_PHOTOS.nakliyatTeam, alt: "Ekip", caption: "Yerel ekip" },
        ]}
      >
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-5 text-white">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#7dd3fc]">Koli · asansör · sigorta · tutanak</p>
          <h1 className="mt-3 max-w-2xl text-[36px] font-black leading-tight sm:text-[48px]">Evi taşıyoruz. Fiyatı kamyon ve kata göre yazarız.</h1>
        </div>
      </HeroSlider>

      <section id="kesif" className="relative z-10 mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-6 rounded-[28px] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#0284c7]">Ücretsiz keşif paneli</p>
            <h2 className="mt-2 text-[24px] font-black">Nereden nereye, kaç odalı, asansör var mı?</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <input className={field} placeholder="Nereden: Defne / Güzelburç" />
              <input className={field} placeholder="Nereye: İskenderun / Adana" />
            </div>
            <p className="mt-5 text-[12px] font-black text-[#64748b]">Ev tipi</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["1+1", "2+1", "3+1", "Ofis"].map((h) => (
                <button key={h} type="button" onClick={() => setHome(h)} className={`rounded-full px-4 py-2 text-[13px] font-black ${home === h ? "bg-[#0b3a5b] text-white" : "bg-[#eef3f8] text-[#0b3a5b]"}`}>
                  {h}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-[12px] font-black text-[#64748b]">
                Asansör
                <select value={lift} onChange={(e) => setLift(e.target.value)} className={`${field} mt-2`}>
                  <option value="var">Var</option>
                  <option value="yok">Yok · merdiven ekibi</option>
                </select>
              </label>
              <label className="text-[12px] font-black text-[#64748b]">
                Kat
                <select value={floor} onChange={(e) => setFloor(e.target.value)} className={`${field} mt-2`}>
                  {["1", "2", "3", "4", "5+"].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-5 text-[12px] font-black text-[#64748b]">Büyük eşya (işçilik değişir)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Koltuk takımı", "Buzdolabı", "Çamaşır makinesi", "Piyano", "Cam vitrin", "Yatak odası"].map((name) => (
                <button key={name} type="button" onClick={() => toggle(name)} className={`rounded-full px-3 py-1.5 text-[12px] font-black ${items.includes(name) ? "bg-[#0284c7] text-white" : "bg-[#eef3f8]"}`}>
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] bg-[#0b3a5b] p-6 text-white">
            <Truck className="h-8 w-8 text-[#38bdf8]" />
            <p className="mt-4 text-[13px] font-bold text-[#7dd3fc]">Önerilen araç</p>
            <p className="mt-1 text-[32px] font-black">{estimate.truck}</p>
            <p className="text-[18px] font-black text-[#38bdf8]">{estimate.m3}</p>
            <p className="mt-3 text-[14px] text-white/70">{estimate.note}. Asansör {lift === "var" ? "var" : "yok"} · {floor}. kat.</p>
            <ul className="mt-5 space-y-2 text-[13px] font-bold text-white/85">
              <li className="flex gap-2"><Package className="h-4 w-4 text-[#38bdf8]" /> Koli ve ambalaj keşifte sayılır</li>
              <li className="flex gap-2"><Box className="h-4 w-4 text-[#38bdf8]" /> {items.length} büyük eşya seçili</li>
              <li className="flex gap-2"><Shield className="h-4 w-4 text-[#38bdf8]" /> Sigorta + teslim tutanağı</li>
            </ul>
            <a
              href={toWhatsAppHref(phone, `Keşif: ${home}, asansör ${lift}, kat ${floor}, ${items.join(", ")}`)}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#38bdf8] py-3.5 text-[14px] font-black text-[#0b3a5b]"
            >
              Bu keşfi WhatsApp’tan gönder
            </a>
          </div>
        </div>
      </section>

      <section id="arac" className="mx-auto max-w-6xl px-5 pb-6">
        <h2 className="text-[24px] font-black">Araç parkı. Eşyaya göre kamyon.</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Home, t: "Kamyonet 8 m³", d: "1+1, parça eşya, öğrenci evi." },
            { icon: Truck, t: "Kapalı kamyon 14–18 m³", d: "2+1 / küçük ofis. En çok kullanılan." },
            { icon: Building2, t: "Büyük kamyon 22 m³", d: "3+1, piyano, cam vitrin, şehirler arası." },
          ].map((x) => (
            <div key={x.t} className="rounded-[24px] bg-white p-5 shadow-sm">
              <x.icon className="h-6 w-6 text-[#0284c7]" />
              <p className="mt-3 text-[16px] font-black">{x.t}</p>
              <p className="mt-1 text-[13px] text-[#64748b]">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="hizmetler" className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-[28px] font-black">Ne taşıyoruz</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {jobs.map((j) => (
            <article key={j.t} className="overflow-hidden rounded-[28px] bg-white shadow-sm">
              <img src={j.img} alt={j.t} className="h-48 w-full object-cover" />
              <div className="p-5">
                <p className="text-[18px] font-black">{j.t}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[#64748b]">{j.d}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-[28px] font-black">Taşıma günü. Karışıklık yok.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Keşif", "Fotoğraf veya yerinde. Oda, asansör, kat."],
              ["02", "Yazılı fiyat", "Koli, işçilik, sigorta kalem kalem."],
              ["03", "Sök-tak", "Mobilya, beyaz eşya. Piyano ayrı ekipman."],
              ["04", "Teslim tutanağı", "Hasar varsa aynı gün not düşülür."],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-[24px] border border-[#e2e8f0] p-5">
                <p className="text-[13px] font-black text-[#0284c7]">{n}</p>
                <p className="mt-2 text-[17px] font-black">{t}</p>
                <p className="mt-2 text-[13px] text-[#64748b]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2">
        <img src={DEMO_PHOTOS.nakliyatTeam} alt="Nakliyat ekibi" className="h-80 w-full rounded-[32px] object-cover" />
        <div>
          <h2 className="text-[28px] font-black">Antakya çıkışlı. Adana–Mersin hattı düzenli.</h2>
          <ul className="mt-6 space-y-2 text-[14px] font-bold">
            {["Kısa süreli depolama mümkün", "Kadın müşteri için kadın personel talebi", "Cam / piyano ayrı paketlenir"].map((x) => (
              <li key={x} className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-[#0284c7]" /> {x}</li>
            ))}
          </ul>
        </div>
      </section>
      <PhotoGallery
        title="Taşıma görselleri"
        intro="Kamyon, koli, ofis, ekip — slayt kendiliğinden geçer."
        accent="#0284c7"
        slides={[
          { src: DEMO_PHOTOS.nakliyat, alt: "Kamyon", caption: "Kamyon" },
          { src: DEMO_PHOTOS.nakliyatBoxes, alt: "Koli", caption: "Koli" },
          { src: DEMO_PHOTOS.nakliyatOffice, alt: "Ofis", caption: "Ofis" },
          { src: DEMO_PHOTOS.nakliyatTeam, alt: "Ekip", caption: "Ekip" },
        ]}
      />
      <DemoFooter
        phone={phone}
        brand="Hatay Nakliyat"
        tagline="Evden eve, ofis ve şehirler arası. Keşif ücretsiz, fiyat yazılı, teslim tutanaklı."
        bg="#0b3a5b"
        accent="#38bdf8"
        message="Nakliyat keşif istiyorum"
        links={[
          { href: "#kesif", label: "Keşif paneli" },
          { href: "#arac", label: "Araç parkı" },
          { href: "#hizmetler", label: "Hizmetler" },
        ]}
        districts={["Antakya", "Defne", "İskenderun", "Samandağ", "Adana hattı", "Mersin hattı"]}
      />
      <StickyCall phone={phone} message="Nakliyat keşif istiyorum" color="#0369a1" />
    </div>
  );
}

export function KlinikDemo({ phone }: { phone: string }) {
  const [slot, setSlot] = useState("Bugün 16:30");
  const docs = [
    { img: DEMO_PHOTOS.doctor, n: "Dt. Elif A.", r: "İmplant ve protez", y: "12 yıl" },
    { img: DEMO_PHOTOS.doctor2, n: "Dt. Mert K.", r: "Ortodonti", y: "9 yıl" },
    { img: DEMO_PHOTOS.doctor3, n: "Dt. Zeynep S.", r: "Çocuk diş ve hijyen", y: "7 yıl" },
  ];
  const treatments = [
    { img: DEMO_PHOTOS.klinikDental, t: "İmplant", d: "Plan, süre ve maliyet ilk görüşmede netleşir." },
    { img: DEMO_PHOTOS.klinikRoom, t: "Beyazlatma", d: "Tek seans. Hassasiyet konuşulur." },
    { img: DEMO_PHOTOS.klinik, t: "Çocuk diş", d: "Ayrı oda. Ebeveyn içeride kalabilir." },
  ];
  const slots = ["Bugün 14:00", "Bugün 16:30", "Yarın 10:00", "Yarın 11:30", "Cuma 09:30"];
  return (
    <div className="min-h-screen bg-[#f3fbfa] pb-24 text-[#134e4a] sm:pb-0">
      <header className="border-b border-[#ccfbf1] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <p className="flex items-center gap-2 text-[17px] font-black text-[#0f766e]">
            <Stethoscope className="h-5 w-5" /> Antakya Klinik
          </p>
          <nav className="hidden gap-6 text-[13px] font-bold text-[#547878] md:flex">
            <a href="#saat">Saat al</a>
            <a href="#tedavi">Tedavi</a>
            <a href="#hekim">Hekim</a>
          </nav>
          <a href={toTelHref(phone)} className="rounded-full bg-[#0d9488] px-4 py-2 text-[13px] font-bold text-white">Randevu al</a>
        </div>
      </header>

      <section className="grid lg:grid-cols-2">
        <HeroSlider
          className="h-72 lg:h-full lg:min-h-[520px]"
          overlayClass="bg-black/15"
          accent="#2dd4bf"
          slides={[
            { src: DEMO_PHOTOS.klinik, alt: "Klinik", caption: "Klinik" },
            { src: DEMO_PHOTOS.klinikRoom, alt: "Muayene", caption: "Muayene" },
            { src: DEMO_PHOTOS.klinikDental, alt: "Tedavi", caption: "Tedavi" },
            { src: DEMO_PHOTOS.doctor, alt: "Hekim", caption: "Hekim" },
          ]}
        />
        <div id="saat" className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12">
          <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#0d9488]">Açık randevu saatleri</p>
          <h1 className="mt-3 text-[36px] font-black leading-tight sm:text-[44px]">Aynı hafta randevu. Hekim ve süre görünür.</h1>
          <p className="mt-4 text-[15px] text-[#547878]">Diş kliniği sitesi fiyat ezberletmez; boş saati gösterir. İmplant için ayrı görüşme.</p>
          <p className="mt-6 text-[12px] font-black">Bu hafta boşluk</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {slots.map((s) => (
              <button key={s} type="button" onClick={() => setSlot(s)} className={`rounded-full px-3 py-2 text-[12px] font-black ${slot === s ? "bg-[#0d9488] text-white" : "bg-[#f3fbfa] ring-1 ring-[#99f6e4]"}`}>
                {s}
              </button>
            ))}
          </div>
          <a href={toWhatsAppHref(phone, `Randevu: ${slot}`)} className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-[#0d9488] px-5 py-3 text-[14px] font-black text-white">
            <Clock className="h-4 w-4" /> {slot} için yaz
          </a>
        </div>
      </section>

      <section id="tedavi" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-[28px] font-black">Tedaviler</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {treatments.map((t) => (
            <article key={t.t} className="overflow-hidden rounded-[28px] bg-white shadow-sm">
              <img src={t.img} alt={t.t} className="h-48 w-full object-cover" />
              <div className="p-5">
                <p className="text-[18px] font-black">{t.t}</p>
                <p className="mt-2 text-[14px] text-[#547878]">{t.d}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="hekim" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-[28px] font-black">Hekimler</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {docs.map((d) => (
              <article key={d.n} className="rounded-[28px] border border-[#ccfbf1] bg-[#f3fbfa] p-5">
                <img src={d.img} alt={d.n} className="h-56 w-full rounded-2xl object-cover object-top" />
                <p className="mt-4 text-[18px] font-black">{d.n}</p>
                <p className="text-[14px] text-[#547878]">{d.r}</p>
                <p className="mt-1 text-[12px] font-bold text-[#0d9488]">{d.y} klinik deneyim</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-14 md:grid-cols-3">
        {[
          { n: "Derya M.", t: "İmplant öncesi süre ve ücret yazıldı." },
          { n: "Can B.", t: "Çocuğum için ayrı oda. Saat gerçekten açıktı." },
          { n: "Leyla H.", t: "Beyazlatma sonrası hassasiyet abartısız anlatıldı." },
        ].map((r) => (
          <article key={r.n} className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-[#0d9488]"><Stars /></p>
            <p className="mt-3 text-[15px] leading-relaxed">“{r.t}”</p>
            <p className="mt-4 text-[13px] font-black">{r.n}</p>
          </article>
        ))}
      </section>
      <PhotoGallery
        title="Klinik görselleri"
        intro="Muayene, tedavi, hekim — slayt kendiliğinden geçer."
        accent="#0d9488"
        slides={[
          { src: DEMO_PHOTOS.klinikRoom, alt: "Oda", caption: "Muayene" },
          { src: DEMO_PHOTOS.klinikDental, alt: "Diş", caption: "Tedavi" },
          { src: DEMO_PHOTOS.doctor2, alt: "Hekim", caption: "Hekim" },
          { src: DEMO_PHOTOS.doctor3, alt: "Çocuk diş", caption: "Çocuk diş" },
        ]}
      />
      <DemoFooter
        phone={phone}
        brand="Antakya Klinik"
        tagline="Aynı hafta randevu. İmplant, beyazlatma ve çocuk diş. Hekim ve süre görünür."
        bg="#0f766e"
        accent="#5eead4"
        message={`Diş randevusu: ${slot}`}
        links={[
          { href: "#saat", label: "Saat al" },
          { href: "#tedavi", label: "Tedaviler" },
          { href: "#hekim", label: "Hekimler" },
        ]}
        districts={["Antakya", "Defne", "Güzelburç"]}
      />
      <StickyCall phone={phone} message={`Diş randevusu: ${slot}`} color="#0f766e" />
    </div>
  );
}

export function ServisDemo({ phone }: { phone: string }) {
  const [device, setDevice] = useState("Klima");
  const [fault, setFault] = useState("Soğutmuyor");
  const jobs = [
    { img: DEMO_PHOTOS.servisKlima, icon: Snowflake, t: "Klima", d: "Gaz, bakım, montaj. Yazın aynı gün bakış." },
    { img: DEMO_PHOTOS.servisKombi, icon: Flame, t: "Kombi", d: "Ateşleme, petek, kış bakımı." },
    { img: DEMO_PHOTOS.servisMakine, icon: WashingMachine, t: "Beyaz eşya", d: "Çamaşır, bulaşık, buzdolabı. Parça onaylı." },
  ];
  const faults: Record<string, string[]> = {
    Klima: ["Soğutmuyor", "Su akıtıyor", "Koku", "Montaj"],
    Kombi: ["Ateşlemiyor", "Petek ısınmıyor", "Basınç düşüyor", "Ses"],
    "Beyaz eşya": ["Su almıyor", "Sıkmıyor", "Soğutmuyor", "Kapak hatası"],
  };
  return (
    <div className="min-h-screen bg-[#fff7ed] pb-24 text-[#7c2d12] sm:pb-0">
      <header className="bg-[#9a3412] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <p className="flex items-center gap-2 text-[17px] font-black">
            <Wrench className="h-5 w-5 text-[#fdba74]" /> Hatay Teknik Servis
          </p>
          <nav className="hidden gap-6 text-[13px] font-bold text-white/75 md:flex">
            <a href="#ariza">Arıza bildir</a>
            <a href="#cihaz">Cihazlar</a>
            <a href="#fiyat">Bakış ücreti</a>
          </nav>
          <a href={toWhatsAppHref(phone, "Servis istiyorum")} className="rounded-full bg-[#fdba74] px-4 py-2 text-[13px] font-black text-[#9a3412]">WhatsApp</a>
        </div>
      </header>

      <HeroSlider
        className="h-[340px] sm:h-[420px]"
        overlayClass="bg-gradient-to-r from-[#7c2d12] via-[#7c2d12]/75 to-black/20"
        accent="#fdba74"
        slides={[
          { src: DEMO_PHOTOS.servis, alt: "Usta", caption: "Yerinde servis" },
          { src: DEMO_PHOTOS.servisKlima, alt: "Klima", caption: "Klima" },
          { src: DEMO_PHOTOS.servisKombi, alt: "Kombi", caption: "Kombi" },
          { src: DEMO_PHOTOS.servisMakine, alt: "Beyaz eşya", caption: "Beyaz eşya" },
        ]}
      >
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-5 text-white">
          <p className="text-[12px] font-black uppercase tracking-wider text-[#fdba74]">Aynı gün bakış · parça onaysız takılmaz</p>
          <h1 className="mt-3 max-w-2xl text-[36px] font-black leading-tight sm:text-[48px]">Klima, kombi, beyaz eşya — usta kapıda.</h1>
        </div>
      </HeroSlider>

      <section id="ariza" className="relative z-10 mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_50px_rgba(154,52,18,0.1)] sm:p-8">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#c2410c]">Arıza bildir</p>
          <h2 className="mt-2 text-[24px] font-black">Cihazı ve belirtisini seç. Fotoğraf WhatsApp’tan.</h2>
          <p className="mt-5 text-[12px] font-black">Cihaz</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Klima", "Kombi", "Beyaz eşya"].map((d) => (
              <button key={d} type="button" onClick={() => { setDevice(d); setFault(faults[d][0]); }} className={`rounded-full px-4 py-2 text-[13px] font-black ${device === d ? "bg-[#c2410c] text-white" : "bg-[#fff7ed]"}`}>
                {d}
              </button>
            ))}
          </div>
          <p className="mt-5 text-[12px] font-black">Belirti</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {faults[device].map((f) => (
              <button key={f} type="button" onClick={() => setFault(f)} className={`rounded-full px-3 py-1.5 text-[12px] font-black ${fault === f ? "bg-[#9a3412] text-white" : "ring-1 ring-[#fed7aa]"}`}>
                {f}
              </button>
            ))}
          </div>
          <a
            href={toWhatsAppHref(phone, `Servis: ${device} — ${fault}`)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c2410c] px-5 py-3 text-[14px] font-black text-white"
          >
            <Wrench className="h-4 w-4" /> {device} / {fault} — usta çağır
          </a>
        </div>
      </section>

      <section id="cihaz" className="mx-auto max-w-6xl px-5 pb-6">
        <h2 className="text-[28px] font-black text-[#9a3412]">Hangi cihaz?</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {jobs.map((j) => (
            <article key={j.t} className="overflow-hidden rounded-[28px] bg-white shadow-sm">
              <div className="relative h-48">
                <img src={j.img} alt={j.t} className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 p-2 text-[#c2410c]"><j.icon className="h-4 w-4" /></span>
              </div>
              <div className="p-5">
                <p className="text-[18px] font-black">{j.t}</p>
                <p className="mt-2 text-[14px] text-[#9a3412]/70">{j.d}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="fiyat" className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-[28px] font-black text-[#9a3412]">Bakış net. Parça ayrı.</h2>
          <div className="mt-8 overflow-hidden rounded-[28px] border border-[#fed7aa]">
            {[
              ["Klima bakış / gaz kontrol", "₺450’den"],
              ["Kombi ateşleme bakış", "₺500’den"],
              ["Çamaşır makinesi bakış", "₺400’den"],
              ["Mesai dışı / gece", "ek ücret aramada"],
            ].map(([a, b], i) => (
              <div key={a} className={`flex items-center justify-between px-5 py-4 ${i % 2 ? "bg-[#fff7ed]" : "bg-white"}`}>
                <p className="font-black">{a}</p>
                <p className="text-[15px] font-black text-[#c2410c]">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2">
        <img src={DEMO_PHOTOS.servisTech} alt="Teknisyen" className="h-80 w-full rounded-[32px] object-cover" />
        <div>
          <h2 className="text-[28px] font-black text-[#9a3412]">Marka ezberi yok, arıza var.</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Arçelik", "Bosch", "Vestel", "Siemens", "Baymak", "Vaillant"].map((b) => (
              <span key={b} className="rounded-full bg-white px-3 py-1.5 text-[12px] font-black shadow-sm">{b}</span>
            ))}
          </div>
        </div>
      </section>
      <PhotoGallery
        title="Saha görselleri"
        intro="Klima, kombi, beyaz eşya — slayt kendiliğinden geçer."
        accent="#ea580c"
        slides={[
          { src: DEMO_PHOTOS.servisKlima, alt: "Klima", caption: "Klima" },
          { src: DEMO_PHOTOS.servisKombi, alt: "Kombi", caption: "Kombi" },
          { src: DEMO_PHOTOS.servisMakine, alt: "Makine", caption: "Beyaz eşya" },
          { src: DEMO_PHOTOS.servisTech, alt: "Usta", caption: "Usta" },
        ]}
      />
      <DemoFooter
        phone={phone}
        brand="Hatay Teknik Servis"
        tagline="Klima, kombi ve beyaz eşya. Bakış ücreti başta. Parça onaysız takılmaz."
        bg="#9a3412"
        accent="#fdba74"
        message={`Servis: ${device} — ${fault}`}
        links={[
          { href: "#ariza", label: "Arıza bildir" },
          { href: "#cihaz", label: "Cihazlar" },
          { href: "#fiyat", label: "Bakış ücreti" },
        ]}
        districts={["Antakya", "Defne", "İskenderun", "Samandağ"]}
      />
      <StickyCall phone={phone} message={`Servis: ${device} — ${fault}`} color="#c2410c" />
    </div>
  );
}
