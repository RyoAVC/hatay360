import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, BarChart3, Copy, ExternalLink, MapPin, Search, Sparkles, Tags } from "lucide-react";

const TOOL_LINKS = [
  { to: "/araclar/google-sira-bulucu", title: "Google Sıra Bulucu", desc: "Anahtar kelimenizi güvenli ve manuel kontrol edin.", icon: BarChart3 },
  { to: "/araclar/meta-etiket-olusturucu", title: "Meta Etiket Oluşturucu", desc: "Başlık, açıklama ve Google önizlemesi hazırlayın.", icon: Tags },
  { to: "/araclar/yerel-anahtar-kelime-olusturucu", title: "Yerel Kelime Üretici", desc: "Sektör ve ilçeye göre arama fikirleri üretin.", icon: MapPin },
] as const;

function ToolHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <section className="border-b border-[#dceef2] bg-[radial-gradient(circle_at_top_right,rgba(0,168,196,0.13),transparent_30%),linear-gradient(180deg,#f7fcfd,#eef8fa)]">
      <div className="mx-auto max-w-5xl px-5 py-14 text-center sm:px-8 sm:py-18">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#b9e5ec] bg-white px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#078ca5]"><Sparkles className="h-3.5 w-3.5" /> {eyebrow}</span>
        <h1 className="mx-auto mt-5 max-w-3xl text-[36px] font-black leading-[1.03] tracking-[-0.045em] text-[#0f172a] sm:text-[52px]">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-[#526477]">{desc}</p>
      </div>
    </section>
  );
}

function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      {children}
      <section className="mt-12">
        <h2 className="text-[22px] font-black text-[#0f172a]">Diğer ücretsiz araçlar</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {TOOL_LINKS.map(({ to, title, desc, icon: Icon }) => (
            <Link key={to} to={to} className="group rounded-2xl border border-[#dcecf0] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#8fd8e4]">
              <Icon className="h-5 w-5 text-[#00a8c4]" />
              <h3 className="mt-4 text-[16px] font-black text-[#0f172a]">{title}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-[#64748b]">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-black text-[#078ca5]">Aracı aç <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }} className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfe7ec] bg-white px-3 py-2 text-[11px] font-black text-[#087f98] hover:bg-[#f0fafc]">
      <Copy className="h-3.5 w-3.5" /> {copied ? "Kopyalandı" : "Kopyala"}
    </button>
  );
}

export function SeoToolsOverviewPage() {
  return (
    <>
      <ToolHeader eyebrow="Ücretsiz SEO araçları" title="İşletmeniz için hızlı ve gerçek SEO araçları" desc="Google’ı izinsiz kazımadan; meta etiket, yerel anahtar kelime ve güvenli sıra kontrol akışları oluşturun." />
      <ToolLayout>
        <div className="grid gap-5 md:grid-cols-3">
          {TOOL_LINKS.map(({ to, title, desc, icon: Icon }) => (
            <Link key={to} to={to} className="rounded-[26px] border border-[#cfe7ec] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1.5 hover:shadow-[0_22px_55px_rgba(0,168,196,0.12)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f9fb] text-[#00a8c4]"><Icon className="h-6 w-6" /></span>
              <h2 className="mt-5 text-[20px] font-black text-[#0f172a]">{title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#64748b]">{desc}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-[12px] font-black text-[#078ca5]">Ücretsiz kullan <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
      </ToolLayout>
    </>
  );
}

export function MetaTagGeneratorPage() {
  const [brand, setBrand] = useState("Hatay360");
  const [service, setService] = useState("Web Tasarım");
  const [city, setCity] = useState("Hatay");
  const title = `${city} ${service} | ${brand}`.trim();
  const description = `${city} bölgesinde profesyonel ${service.toLocaleLowerCase("tr-TR")} hizmeti. ${brand} ile hızlı teklif alın, markanızı dijitalde büyütün.`;
  const keywords = `${city.toLocaleLowerCase("tr-TR")} ${service.toLocaleLowerCase("tr-TR")}, ${service.toLocaleLowerCase("tr-TR")} firması, ${brand.toLocaleLowerCase("tr-TR")}`;

  return (
    <>
      <ToolHeader eyebrow="Ücretsiz meta aracı" title="Meta Etiket Oluşturucu" desc="SEO başlığınızı, açıklamanızı ve Google sonuç önizlemenizi saniyeler içinde hazırlayın." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            {[{ label: "Marka adı", value: brand, set: setBrand }, { label: "Hizmet / ürün", value: service, set: setService }, { label: "Şehir / ilçe", value: city, set: setCity }].map((field) => (
              <label key={field.label} className="block text-[12px] font-black text-[#334155]">{field.label}<input value={field.value} onChange={(e) => field.set(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            ))}
          </div>
          <div className="rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Google önizlemesi</p>
            <p className="mt-4 text-[13px] text-[#047857]">https://ornek-site.com/hizmet</p>
            <p className="mt-1 text-[20px] font-medium text-[#1a0dab]">{title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#4d5156]">{description}</p>
            <div className="mt-6 space-y-3">
              {[{ label: `SEO başlığı · ${title.length}/60`, value: title }, { label: `Meta açıklaması · ${description.length}/155`, value: description }, { label: "Anahtar kelimeler", value: keywords }].map((item) => (
                <div key={item.label} className="rounded-xl bg-[#f5fafb] p-3 ring-1 ring-[#e2eef1]"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-wide text-[#64748b]">{item.label}</p><CopyButton value={item.value} /></div><p className="mt-2 break-words text-[12px] leading-relaxed text-[#1e293b]">{item.value}</p></div>
              ))}
            </div>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function LocalKeywordGeneratorPage() {
  const [sector, setSector] = useState("web tasarım");
  const [location, setLocation] = useState("Hatay");
  const keywords = useMemo(() => [
    `${location} ${sector}`, `${location} ${sector} firması`, `${location} en iyi ${sector}`,
    `${sector} fiyatları ${location}`, `${location} uygun fiyatlı ${sector}`, `${location} ${sector} iletişim`,
    `${location} profesyonel ${sector}`, `${sector} hizmeti ${location}`, `${location} yakın ${sector}`,
  ].map((value) => value.trim()), [sector, location]);

  return (
    <>
      <ToolHeader eyebrow="Yerel SEO aracı" title="Yerel Anahtar Kelime Oluşturucu" desc="Sektörünüzü ve hedeflediğiniz ilçeyi yazın; satın alma niyetli yerel arama fikirleri oluşturun." />
      <ToolLayout>
        <div className="rounded-[28px] border border-[#cfe7ec] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[12px] font-black text-[#334155]">Sektör / hizmet<input value={sector} onChange={(e) => setSector(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="text-[12px] font-black text-[#334155]">Şehir / ilçe<input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
          </div>
          <div className="mt-6 flex items-center justify-between"><p className="text-[12px] font-black text-[#0f172a]">{keywords.length} anahtar kelime fikri</p><CopyButton value={keywords.join("\n")} /></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{keywords.map((keyword, index) => <div key={keyword} className="flex items-center gap-2 rounded-xl border border-[#e0edf0] bg-[#f8fbfc] px-3 py-3 text-[12px] font-bold text-[#334155]"><span className="text-[10px] font-black text-[#00a8c4]">{String(index + 1).padStart(2, "0")}</span>{keyword}</div>)}</div>
        </div>
      </ToolLayout>
    </>
  );
}

export function GoogleRankFinderPage() {
  const [domain, setDomain] = useState("hatay360.com");
  const [keyword, setKeyword] = useState("hatay web tasarım");
  const [city, setCity] = useState("Hatay");
  const query = `${keyword} ${city}`.trim();
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  const siteUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:${domain} ${keyword}`)}`;

  return (
    <>
      <ToolHeader eyebrow="Güvenli sıra kontrolü" title="Google Sıra Bulucu" desc="Google’ı otomatik kazımadan anahtar kelimenizi kontrol edin; Search Console bağlantılı profesyonel takip için AVC Hub altyapısını kullanın." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-[26px] border border-[#d7eaee] bg-white p-6">
            {[{ label: "Web sitesi", value: domain, set: setDomain }, { label: "Anahtar kelime", value: keyword, set: setKeyword }, { label: "Şehir", value: city, set: setCity }].map((field) => <label key={field.label} className="block text-[12px] font-black text-[#334155]">{field.label}<input value={field.value} onChange={(e) => field.set(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>)}
          </div>
          <div className="rounded-[26px] bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.25),transparent_35%),linear-gradient(145deg,#0f172a,#112f47)] p-6 text-white shadow-xl">
            <Search className="h-7 w-7 text-[#67e8f9]" />
            <h2 className="mt-5 text-[24px] font-black">Kontrol sorgunuz hazır</h2>
            <p className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-[13px] text-white/75">{query}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a href={googleUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-3 text-[12px] font-black text-white">Google’da kontrol et <ExternalLink className="h-4 w-4" /></a>
              <a href={siteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[12px] font-black text-white">Site sonucunu bul <ExternalLink className="h-4 w-4" /></a>
            </div>
            <p className="mt-5 text-[11px] leading-relaxed text-white/55">Bu ücretsiz araç otomatik SERP kazıması yapmaz ve sahte sıra göstermez. Kişiselleştirilmiş Google sonuçları değişebilir. Kesin sorgu, tıklama, gösterim ve ortalama konum verisi Google Search Console’dan alınır.</p>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}
