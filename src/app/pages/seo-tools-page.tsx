import { useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { ArrowRight, BarChart3, Calculator, CalendarDays, CalendarOff, Clock, Code2, Contact, Copy, Download, ExternalLink, Link2, MapPin, Megaphone, MessageCircle, Navigation, PenLine, QrCode, Search, Share2, Sparkles, Star, Tags } from "lucide-react";
import { napMatches, buildNapCheckReport, buildUtmUrl, buildLocalBusinessJsonLd, buildGoogleReviewUrl, buildMapsSearchUrl, buildMapsDirectionsUrl, buildReviewReplies, buildAppointmentReminder, buildClosedNotice, buildAdsRsaTexts, buildOpenGraphTags, ADS_RSA_HEADLINE_MAX, ADS_RSA_DESCRIPTION_MAX, OG_TITLE_MAX, OG_DESCRIPTION_MAX } from "../lib/seo";
import { phoneDigits, toWhatsAppHref, sanitizePhoneInput, buildVCard } from "../lib/contact";
import { filterToolsByCategory, parseToolCategory, TOOL_CATEGORIES, type ToolCategoryId } from "../lib/extra-demos";
import { estimateNeeds, NEED_DISTRICTS, NEED_OPTIONS, NEED_SECTORS, buildIletisimQuotePath, type NeedId } from "../lib/needs-calculator";
import { useContent } from "../context/content-context";
import { PageCrumbs } from "../components/page-crumbs";
import { WEEK_DAYS, defaultDayHours, formatHours, buildOpeningHoursSchema, type WeekDayId } from "../lib/maps-signup";

const TOOL_LINKS = [
  { to: "/araclar/google-sira-bulucu", title: "Google Sıra Bulucu", desc: "Anahtar kelimenizi güvenli ve manuel kontrol edin.", icon: BarChart3, category: "seo" },
  { to: "/araclar/meta-etiket-olusturucu", title: "Meta Etiket Oluşturucu", desc: "Başlık, açıklama ve Google önizlemesi hazırlayın.", icon: Tags, category: "seo" },
  { to: "/araclar/yerel-anahtar-kelime-olusturucu", title: "Yerel Kelime Üretici", desc: "Sektör ve ilçeye göre arama fikirleri üretin.", icon: MapPin, category: "seo" },
  { to: "/araclar/yorum-mesaji", title: "Yorum Davet Mesajı", desc: "Google yorumu için WhatsApp / SMS metni hazırlayın.", icon: Star, category: "metin" },
  { to: "/araclar/yorum-cevabi", title: "Yorum Cevap Şablonu", desc: "Google yorumuna dürüst, kısa işletme yanıtı yazın. Sahte puan yok.", icon: MessageCircle, category: "metin" },
  { to: "/araclar/randevu-hatirlatma", title: "Randevu Hatırlatma", desc: "Müşteriye WhatsApp / SMS randevu metni. Spam yok; iptal için yazın dendiği kadar.", icon: CalendarDays, category: "metin" },
  { to: "/araclar/kapaliyiz", title: "Kapalıyız Notu", desc: "Bayram veya izin günü için WhatsApp ve harita metni. Sahte açık yazılmaz.", icon: CalendarOff, category: "metin" },
  { to: "/araclar/qr-menu", title: "QR Menü / Sipariş", desc: "Masaya konacak WhatsApp menü karesini hazırlayın.", icon: QrCode, category: "metin" },
  { to: "/araclar/nap-kontrol", title: "NAP Tutarlılık", desc: "Google, site ve kartvizitteki ad / adres / telefon aynı mı bakın.", icon: Search, category: "harita" },
  { to: "/araclar/utm-link", title: "Reklam UTM Linki", desc: "Google Ads / Instagram tıklamasının hangi ilandan geldiğini işaretleyin.", icon: Megaphone, category: "seo" },
  { to: "/araclar/reklam-metni", title: "Google Ads Metin", desc: "Yerel arama reklamı için başlık (30) ve açıklama (90) taslağı. Sıra garantisi yok.", icon: PenLine, category: "metin" },
  { to: "/araclar/sosyal-onizleme", title: "Sosyal Paylaşım Önizleme", desc: "WhatsApp / Facebook kartı için Open Graph meta satırı. Google Ads metni değildir.", icon: Share2, category: "metin" },
  { to: "/araclar/schema", title: "Yerel İşletme Şeması", desc: "Google’ın okuyacağı LocalBusiness JSON kodunu üretin.", icon: Code2, category: "seo" },
  { to: "/araclar/musteri-linki", title: "WhatsApp ve Yorum Linki", desc: "Sipariş WhatsApp’ı ve Google yorum yazma bağlantısını üretin.", icon: Link2, category: "metin" },
  { to: "/araclar/kartvizit", title: "Dijital Kartvizit", desc: "Telefona kaydedilecek vCard dosyasını hazırlayın.", icon: Contact, category: "metin" },
  { to: "/araclar/harita-linki", title: "Harita ve Yol Tarifi", desc: "Google’da işletme araması ve yol tarifi bağlantısı üretin.", icon: Navigation, category: "harita" },
  { to: "/araclar/calisma-saati", title: "Çalışma Saati Metni", desc: "Haftalık saatleri Türkçe ve Google şema satırına çevirin.", icon: Clock, category: "harita" },
  { to: "/araclar/ozel-ihtiyac-hesaplayici", title: "Özel İhtiyaç Hesaplayıcı", desc: "Sektör ve ilçeye göre web, reklam, harita veya e-ticaret paketi önerin. Kesin fiyat yazılı teklifte.", icon: Calculator, category: "hesap" },
] as const satisfies readonly { to: string; title: string; desc: string; icon: typeof Search; category: ToolCategoryId }[];

function ToolHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  const { pathname } = useLocation();
  return (
    <section className="border-b border-[#dceef2] bg-[radial-gradient(circle_at_top_right,rgba(0,168,196,0.13),transparent_30%),linear-gradient(180deg,#f7fcfd,#eef8fa)]">
      <div className="mx-auto max-w-5xl px-5 pt-8 pb-14 text-center sm:px-8 sm:pb-18">
        <div className="text-left">
        <PageCrumbs
          items={
            pathname === "/araclar"
              ? [{ label: "Ana sayfa", to: "/" }, { label: "Araçlar" }]
              : [{ label: "Ana sayfa", to: "/" }, { label: "Araçlar", to: "/araclar" }, { label: title }]
          }
        />
        </div>
        <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#b9e5ec] bg-white px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#078ca5]"><Sparkles className="h-3.5 w-3.5" /> {eyebrow}</span>
        <h1 className="mx-auto mt-5 max-w-3xl text-[36px] font-black leading-[1.03] tracking-[-0.045em] text-[#0f172a] sm:text-[52px]">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-[#526477]">{desc}</p>
      </div>
    </section>
  );
}

function ToolLayout({ children, hideOthers = false }: { children: React.ReactNode; hideOthers?: boolean }) {
  const { pathname } = useLocation();
  const others = TOOL_LINKS.filter((tool) => tool.to !== pathname);
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      {children}
      {!hideOthers && (
      <section className="mt-12 print:hidden">
        <h2 className="text-[22px] font-black text-[#0f172a]">Diğer ücretsiz araçlar</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {others.map(({ to, title, desc, icon: Icon }) => (
            <Link key={to} to={to} className="group rounded-2xl border border-[#dcecf0] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#8fd8e4]">
              <Icon className="h-5 w-5 text-[#00a8c4]" />
              <h3 className="mt-4 text-[16px] font-black text-[#0f172a]">{title}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-[#64748b]">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-black text-[#078ca5]">Aracı aç <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>
      )}
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
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const category = parseToolCategory(searchParams.get("kat"));
  const tools = useMemo(() => filterToolsByCategory(TOOL_LINKS, query, category), [query, category]);
  const chips: { id: ToolCategoryId | "all"; label: string }[] = [
    { id: "all", label: `Tümü · ${TOOL_LINKS.length}` },
    ...TOOL_CATEGORIES.map((item) => ({
      id: item.id,
      label: `${item.label} · ${TOOL_LINKS.filter((tool) => tool.category === item.id).length}`,
    })),
  ];
  const setCategory = (id: ToolCategoryId | "all") => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id === "all") next.delete("kat");
      else next.set("kat", id);
      return next;
    }, { replace: true });
  };
  return (
    <>
      <ToolHeader eyebrow="Ücretsiz SEO araçları" title="İşletmeniz için hızlı ve gerçek SEO araçları" desc="Google’ı izinsiz kazımadan; meta etiket, yerel kelime, yorum daveti / cevap, QR menü ve güvenli sıra kontrolü." />
      <ToolLayout hideOthers>
        <label className="mb-4 flex items-center gap-3 rounded-2xl border border-[#d7eaee] bg-white px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-[#00a8c4]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Araç ara: UTM, QR, yorum, şema…" aria-label="Araç ara" className="w-full bg-transparent text-[14px] outline-none" />
        </label>
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Araç kategorileri">
          {chips.map((chip) => {
            const active = category === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(chip.id)}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] font-black transition ${
                  active
                    ? "border-[#00a8c4] bg-[#00a8c4] text-white shadow-sm"
                    : "border-[#cfe7ec] bg-white text-[#087f98] hover:bg-[#f0fafc]"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {tools.map(({ to, title, desc, icon: Icon }) => (
            <Link key={to} to={to} className="rounded-[26px] border border-[#cfe7ec] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1.5 hover:shadow-[0_22px_55px_rgba(0,168,196,0.12)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f9fb] text-[#00a8c4]"><Icon className="h-6 w-6" /></span>
              <h2 className="mt-5 text-[20px] font-black text-[#0f172a]">{title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#64748b]">{desc}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-[12px] font-black text-[#078ca5]">Ücretsiz kullan <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>
        {!tools.length && <p className="mt-4 text-[14px] text-[#64748b]" role="status">Bu filtreye uyan araç yok.</p>}
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

export function ReviewInvitePage() {
  const [brand, setBrand] = useState("Defne Eczanesi");
  const [place, setPlace] = useState("Defne");
  const [mapsUrl, setMapsUrl] = useState("https://maps.google.com/?q=Defne+Eczanesi");
  const [phone, setPhone] = useState("0555 000 00 00");
  const message = `Merhaba, ${brand} (${place}) olarak hizmetimizden memnun kaldıysanız Google’da kısa bir yorum bırakmanız bize çok yardımcı olur.${mapsUrl.trim() ? `\n\nYorum linki: ${mapsUrl.trim()}` : ""}\nTeşekkürler.`;
  const sms = `${brand}: Memnunsanız Google’da yorum bırakır mısınız? ${mapsUrl.trim()}`.trim();

  return (
    <>
      <ToolHeader eyebrow="Yerel itibar aracı" title="Google Yorum Davet Mesajı" desc="Sahte yıldız basmadan, müşteriye göndereceğiniz dürüst WhatsApp ve SMS metnini hazırlayın." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            {[
              { label: "İşletme adı", value: brand, set: setBrand },
              { label: "İlçe", value: place, set: setPlace },
              { label: "Google Maps linki", value: mapsUrl, set: setMapsUrl },
              { label: "Müşteri telefonu (WhatsApp)", value: phone, set: setPhone },
            ].map((field) => (
              <label key={field.label} className="block text-[12px] font-black text-[#334155]">
                {field.label}
                <input value={field.value} onChange={(e) => field.set(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
              </label>
            ))}
          </div>
          <div className="rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp metni
            </p>
            <p className="mt-4 whitespace-pre-wrap rounded-xl bg-[#f5fafb] p-4 text-[13px] leading-relaxed text-[#1e293b]">{message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton value={message} />
              <a href={toWhatsAppHref(phone, message)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#00a8c4] px-3 py-2 text-[11px] font-black text-white">
                WhatsApp’ta aç <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="mt-6 rounded-xl border border-[#e2eef1] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-[#64748b]">SMS (kısa)</p>
                <CopyButton value={sms} />
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-[#1e293b]">{sms}</p>
            </div>
            <p className="mt-5 text-[11px] leading-relaxed text-[#64748b]">Bu araç yorum yazmaz, puan basmaz. Metni müşteriye siz gönderirsiniz; Google kaydı işletmenin kendi profilindedir.</p>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function QrMenuPage() {
  const [brand, setBrand] = useState("Asmalı Mutfak");
  const [phone, setPhone] = useState("0555 000 00 00");
  const [items, setItems] = useState("Humus ₺120\nİçli köfte ₺160\nKünefe ₺180");
  const menuText = `${brand} menü / sipariş:\n${items.trim()}\n\nWhatsApp’tan yazın, masaya veya pakete hazırlarız.`;
  const href = toWhatsAppHref(phone, menuText);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&ecc=M&margin=8&data=${encodeURIComponent(href)}`;

  return (
    <>
      <ToolHeader eyebrow="Restoran / kafe aracı" title="QR Menü ve sipariş karesi" desc="Masaya koyacağınız kare kod, müşteriyi WhatsApp menünüze götürür. Uygulama indirtmez, sahte menü sitesi açmaz." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            <label className="block text-[12px] font-black text-[#334155]">İşletme adı<input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">WhatsApp numarası<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">Menü satırları<textarea value={items} onChange={(e) => setItems(e.target.value)} rows={6} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
          </div>
          <div className="rounded-[26px] border border-[#d7eaee] bg-white p-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Yazdırılacak kare</p>
            <img src={qrSrc} alt={`${brand} WhatsApp menü karesi`} width={280} height={280} className="mx-auto mt-5 h-52 w-52 rounded-2xl border border-[#e2eef1] bg-white p-3 sm:h-64 sm:w-64" />
            <p className="mt-4 text-[16px] font-black text-[#0f172a]">{brand}</p>
            <p className="mt-1 text-[12px] text-[#64748b]">Kamerayı kareye tutun · WhatsApp menü açılır</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <CopyButton value={href} />
              <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#00a8c4] px-3 py-2 text-[11px] font-black text-white">
                Menü linkini aç <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="mt-5 text-left text-[11px] leading-relaxed text-[#64748b]">Kare kodu tarayıcı üretir; Hatay360 sunucusuna menü kaydı yazılmaz. Kalıcı menü sitesi isterseniz demo restoran / kahve örneklerine bakın.</p>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function NapCheckPage() {
  const [googleName, setGoogleName] = useState("Defne Eczanesi");
  const [siteName, setSiteName] = useState("Defne Eczanesi");
  const [cardName, setCardName] = useState("Defne Eczane");
  const [googlePhone, setGooglePhone] = useState("0326 123 45 67");
  const [sitePhone, setSitePhone] = useState("0326 123 45 67");
  const [cardPhone, setCardPhone] = useState("03261234567");
  const [googleAddress, setGoogleAddress] = useState("Atatürk Cad. No:10 Defne");
  const [siteAddress, setSiteAddress] = useState("Ataturk Caddesi No 10 Defne");
  const [cardAddress, setCardAddress] = useState("Atatürk Cad. 10 Defne/Hatay");

  const nameOk = napMatches(googleName, siteName) && napMatches(googleName, cardName);
  const phoneOk = phoneDigits(googlePhone) === phoneDigits(sitePhone) && phoneDigits(googlePhone) === phoneDigits(cardPhone);
  const addressOk = napMatches(googleAddress, siteAddress) && napMatches(googleAddress, cardAddress);
  const allOk = nameOk && phoneOk && addressOk;
  const report = buildNapCheckReport({
    googleName,
    googlePhone,
    googleAddress,
    siteName,
    sitePhone,
    siteAddress,
    cardName,
    cardPhone,
    cardAddress,
    nameOk,
    phoneOk,
    addressOk,
  });

  const siteNeedsAlign =
    !napMatches(googleName, siteName) ||
    phoneDigits(googlePhone) !== phoneDigits(sitePhone) ||
    !napMatches(googleAddress, siteAddress);
  const cardNeedsAlign =
    !napMatches(googleName, cardName) ||
    phoneDigits(googlePhone) !== phoneDigits(cardPhone) ||
    !napMatches(googleAddress, cardAddress);

  const alignSiteToGoogle = () => {
    setSiteName(googleName);
    setSitePhone(googlePhone);
    setSiteAddress(googleAddress);
  };
  const alignCardToGoogle = () => {
    setCardName(googleName);
    setCardPhone(googlePhone);
    setCardAddress(googleAddress);
  };

  const rows = [
    { label: "İşletme adı", ok: nameOk, hint: nameOk ? "Üç yerde aynı." : "Google, site ve kartvizit adını birebir hizalayın." },
    { label: "Telefon", ok: phoneOk, hint: phoneOk ? "Rakamlar aynı." : "Boşluk fark etmez; rakamlar aynı olmalı." },
    { label: "Adres", ok: addressOk, hint: addressOk ? "Yazım farkı temizlendi, aynı." : "Cadde, no ve ilçe üç yerde de aynı dursun." },
  ];

  return (
    <>
      <ToolHeader eyebrow="Yerel SEO aracı" title="NAP tutarlılık kontrolü" desc="Google kaydı, web sitesi ve kartvizitteki ad / adres / telefon aynı değilse harita sıralaması zayıflar. Bu araç kazımaz; sizin yazdığınızı karşılaştırır." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { title: "Google kaydı", fields: [
              { label: "Ad", value: googleName, set: setGoogleName },
              { label: "Telefon", value: googlePhone, set: setGooglePhone },
              { label: "Adres", value: googleAddress, set: setGoogleAddress },
            ] },
            { title: "Web sitesi", fields: [
              { label: "Ad", value: siteName, set: setSiteName },
              { label: "Telefon", value: sitePhone, set: setSitePhone },
              { label: "Adres", value: siteAddress, set: setSiteAddress },
            ], align: siteNeedsAlign ? alignSiteToGoogle : null },
            { title: "Kartvizit / tabela", fields: [
              { label: "Ad", value: cardName, set: setCardName },
              { label: "Telefon", value: cardPhone, set: setCardPhone },
              { label: "Adres", value: cardAddress, set: setCardAddress },
            ], align: cardNeedsAlign ? alignCardToGoogle : null },
          ].map((col) => (
            <div key={col.title} className="space-y-3 rounded-[26px] border border-[#d7eaee] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">{col.title}</p>
                {"align" in col && col.align ? (
                  <button
                    type="button"
                    onClick={col.align}
                    className="rounded-lg border border-[#cfe7ec] bg-[#f0fafc] px-2.5 py-1.5 text-[10px] font-black text-[#087f98] hover:bg-[#e6f7fa]"
                  >
                    Google’a hizala
                  </button>
                ) : null}
              </div>
              {col.fields.map((field) => (
                <label key={field.label} className="block text-[12px] font-black text-[#334155]">
                  {field.label}
                  <input value={field.value} onChange={(e) => field.set(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
                </label>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label} className={`rounded-2xl border p-4 ${row.ok ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <p className="text-[13px] font-black text-[#0f172a]">{row.ok ? "Uyumlu" : "Fark var"} · {row.label}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#475569]">{row.hint}</p>
            </div>
          ))}
        </div>
        <div className={`mt-6 rounded-[26px] border p-5 shadow-sm ${allOk ? "border-emerald-200 bg-emerald-50/50" : "border-[#d7eaee] bg-white"}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">NAP özeti</p>
              <h2 className="mt-2 text-[18px] font-black text-[#0f172a]">{allOk ? "Üç kaynak uyumlu" : "Farkları kopyalayıp düzeltin"}</h2>
              <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[#526477]">
                Özeti ekibe veya matbaaya yapıştırın. Site/kartviziti Google kaydına çekmek için sütundaki “Google’a hizala”yı kullanın.
              </p>
            </div>
            <CopyButton value={report} />
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-[#0f172a] px-4 py-3 text-[11px] leading-relaxed whitespace-pre-wrap text-white/85">{report}</pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/google-maps-harita-kaydi" className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a73e8] px-3.5 py-2.5 text-[11px] font-black text-white">
              <MapPin className="h-3.5 w-3.5" /> Harita kayıt sihirbazı
            </Link>
            {!allOk && siteNeedsAlign ? (
              <button type="button" onClick={alignSiteToGoogle} className="rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]">
                Siteyi Google’a hizala
              </button>
            ) : null}
            {!allOk && cardNeedsAlign ? (
              <button type="button" onClick={alignCardToGoogle} className="rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]">
                Kartviziti Google’a hizala
              </button>
            ) : null}
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function UtmLinkPage() {
  const [base, setBase] = useState("https://hatay360.com/iletisim");
  const [source, setSource] = useState("google");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("hatay-web-tasarim");
  const [content, setContent] = useState("antakya");
  const href = buildUtmUrl(base, source, medium, campaign, content);

  return (
    <>
      <ToolHeader eyebrow="Reklam ölçüm aracı" title="UTM link oluşturucu" desc="Google Ads ve Instagram tıklamasının hangi ilandan geldiğini siteye işaretleyin. Takip kodu çalmaz; yalnızca bağlantı üretir." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            {[
              { label: "Hedef sayfa", value: base, set: setBase },
              { label: "utm_source (google / instagram / meta)", value: source, set: setSource },
              { label: "utm_medium (cpc / story / reels)", value: medium, set: setMedium },
              { label: "utm_campaign", value: campaign, set: setCampaign },
              { label: "utm_content (ilan varyantı)", value: content, set: setContent },
            ].map((field) => (
              <label key={field.label} className="block text-[12px] font-black text-[#334155]">
                {field.label}
                <input value={field.value} onChange={(e) => field.set(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
              </label>
            ))}
          </div>
          <div className="rounded-[26px] border border-[#d7eaee] bg-[#0f172a] p-6 text-white shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#67e8f9]">Hazır bağlantı</p>
            <p className="mt-4 break-all rounded-xl bg-white/5 px-4 py-3 text-[13px] leading-relaxed text-white/85">{href || "Geçerli bir sayfa adresi yazın."}</p>
            <div className="mt-5">{href ? <CopyButton value={href} /> : null}</div>
            <p className="mt-6 text-[11px] leading-relaxed text-white/55">Bu parametreler Hatay360 panelindeki ziyaret özetinde kaynak olarak görünür. Aynı kampanya adını Google Ads ile birebir yazın.</p>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function SchemaJsonLdPage() {
  const [name, setName] = useState("Defne Eczanesi");
  const [phone, setPhone] = useState("0326 123 45 67");
  const [address, setAddress] = useState("Atatürk Cad. No:10");
  const [city, setCity] = useState("Defne");
  const [url, setUrl] = useState("https://ornek-eczane.com");
  const [hours, setHours] = useState("Mo-Sa 09:00-19:00");
  const json = buildLocalBusinessJsonLd({ name, phone, address, city, url, hours });

  return (
    <>
      <ToolHeader eyebrow="Teknik SEO aracı" title="Yerel işletme şema kodu" desc="Google’ın işletmenizi anlaması için LocalBusiness JSON-LD üretir. Kodu sitenizin &lt;head&gt; bölümüne yapıştırırsınız; bu araç Google’a göndermez." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            {[
              { label: "İşletme adı", value: name, set: setName },
              { label: "Telefon", value: phone, set: setPhone },
              { label: "Adres", value: address, set: setAddress },
              { label: "İlçe", value: city, set: setCity },
              { label: "Site adresi", value: url, set: setUrl },
              { label: "Çalışma saati (schema)", value: hours, set: setHours },
            ].map((field) => (
              <label key={field.label} className="block text-[12px] font-black text-[#334155]">
                {field.label}
                <input value={field.value} onChange={(e) => field.set(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
              </label>
            ))}
          </div>
          <div className="rounded-[26px] border border-[#d7eaee] bg-[#0f172a] p-6 text-white">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#67e8f9]">JSON-LD</p>
              <CopyButton value={`<script type="application/ld+json">\n${json}\n</script>`} />
            </div>
            <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap break-all rounded-xl bg-white/5 p-4 text-left text-[12px] leading-relaxed text-white/80">{json}</pre>
            <p className="mt-5 text-[11px] leading-relaxed text-white/55">&lt; ve &gt; karakterleri temizlenir. Yanlış bilgi Google’a zarar verir; yalnızca gerçek işletme bilgisi yapıştırın.</p>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function CustomerLinksPage() {
  const [phone, setPhone] = useState("0555 000 00 00");
  const [message, setMessage] = useState("Merhaba, sipariş vermek istiyorum.");
  const [place, setPlace] = useState("");
  const wa = toWhatsAppHref(phone, message);
  const review = buildGoogleReviewUrl(place);

  return (
    <>
      <ToolHeader eyebrow="Müşteri bağlantısı" title="WhatsApp sipariş ve Google yorum linki" desc="Kartvizite, Instagram biyografisine veya sitenize yapıştırın. 05xx numara otomatik 90’a çevrilir. Yorum linki Google’daki gerçek yazma sayfasını açar; sahte puan basmaz." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">WhatsApp sipariş</p>
            <label className="block text-[12px] font-black text-[#334155]">
              Telefon
              <input value={phone} onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))} inputMode="tel" className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
            </label>
            <label className="block text-[12px] font-black text-[#334155]">
              Hazır mesaj
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
            </label>
            <p className="break-all rounded-xl bg-[#f8fbfc] px-4 py-3 text-[13px] text-[#334155]">{wa || "Geçerli telefon yazın."}</p>
            <div className="flex flex-wrap gap-2">
              {wa ? <CopyButton value={wa} /> : null}
              {wa ? <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#00a8c4] px-3 py-2 text-[11px] font-black text-white">WhatsApp’ı aç <ExternalLink className="h-3.5 w-3.5" /></a> : null}
            </div>
          </div>
          <div className="space-y-3 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Google yorum yazma</p>
            <label className="block text-[12px] font-black text-[#334155]">
              Place ID veya Google bağlantısı
              <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="ChIJ… veya writereview?placeid=…" className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
            </label>
            <p className="text-[12px] leading-relaxed text-[#64748b]">Place ID’yi Google Maps işletme bağlantısından veya Search Console’dan alın. Bu araç yorum basmaz; müşteriyi Google’ın yazma sayfasına götürür.</p>
            <p className="break-all rounded-xl bg-[#f8fbfc] px-4 py-3 text-[13px] text-[#334155]">{review || "Place ID yapıştırınca link oluşur."}</p>
            <div className="flex flex-wrap gap-2">
              {review ? <CopyButton value={review} /> : null}
              {review ? <a href={review} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfe7ec] px-3 py-2 text-[11px] font-black text-[#087f98]">Yorum sayfasını aç <ExternalLink className="h-3.5 w-3.5" /></a> : null}
            </div>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function VCardPage() {
  const [name, setName] = useState("Arsuz Sahil");
  const [phone, setPhone] = useState("0326 123 45 67");
  const [email, setEmail] = useState("rezervasyon@ornek-otel.com");
  const [street, setStreet] = useState("Sahil Cad. No:18");
  const [city, setCity] = useState("Arsuz");
  const [url, setUrl] = useState("https://ornek-otel.com");
  const vcf = buildVCard({ name, phone, email, street, city, url });

  const download = () => {
    if (!vcf) return;
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${name.trim().replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]+/g, "-") || "kartvizit"}.vcf`;
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <>
      <ToolHeader eyebrow="Kartvizit aracı" title="Dijital kartvizit (vCard)" desc="Müşteri telefona kaydetsin diye .vcf üretir. Sunucuya kartvizit yazılmaz; dosya tarayıcınızda iner." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            {[
              { label: "İşletme adı", value: name, set: setName },
              { label: "Telefon", value: phone, set: setPhone },
              { label: "E-posta", value: email, set: setEmail },
              { label: "Adres", value: street, set: setStreet },
              { label: "İlçe", value: city, set: setCity },
              { label: "Site", value: url, set: setUrl },
            ].map((field) => (
              <label key={field.label} className="block text-[12px] font-black text-[#334155]">
                {field.label}
                <input value={field.value} onChange={(e) => field.set(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
              </label>
            ))}
          </div>
          <div className="rounded-[26px] border border-[#d7eaee] bg-[#0f172a] p-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#67e8f9]">vCard</p>
            <pre className="mt-4 max-h-[320px] overflow-auto whitespace-pre-wrap break-all rounded-xl bg-white/5 p-4 text-left text-[12px] leading-relaxed text-white/80">{vcf || "İşletme adını yazın."}</pre>
            <div className="mt-5 flex flex-wrap gap-2">
              {vcf ? <CopyButton value={vcf} /> : null}
              {vcf ? (
                <button type="button" onClick={download} className="inline-flex items-center gap-1.5 rounded-lg bg-[#00a8c4] px-3 py-2 text-[11px] font-black text-white">
                  <Download className="h-3.5 w-3.5" /> .vcf indir
                </button>
              ) : null}
            </div>
            <p className="mt-5 text-[11px] leading-relaxed text-white/55">Dosyayı WhatsApp’tan gönderin; müşteri “rehbere ekle” der. Noktalı virgül kartı bozmasın diye kaçışlanır.</p>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function MapsLinksPage() {
  const [query, setQuery] = useState("Defne Eczanesi");
  const [destination, setDestination] = useState("Kıbrıs Caddesi No:13 Antakya");
  const [origin, setOrigin] = useState("");
  const search = buildMapsSearchUrl(query);
  const directions = buildMapsDirectionsUrl(destination, origin);

  return (
    <>
      <ToolHeader eyebrow="Harita aracı" title="Google arama ve yol tarifi linki" desc="Instagram, WhatsApp veya kartvizite yapıştırın. Harita Google’da açılır; bu araç konum kaydı oluşturmaz." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">İşletme araması</p>
            <label className="block text-[12px] font-black text-[#334155]">
              Ad veya adres
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
            </label>
            <p className="break-all rounded-xl bg-[#f8fbfc] px-4 py-3 text-[13px] text-[#334155]">{search || "Arama metni yazın."}</p>
            <div className="flex flex-wrap gap-2">
              {search ? <CopyButton value={search} /> : null}
              {search ? <a href={search} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#00a8c4] px-3 py-2 text-[11px] font-black text-white">Haritada aç <ExternalLink className="h-3.5 w-3.5" /></a> : null}
            </div>
          </div>
          <div className="space-y-3 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Yol tarifi</p>
            <label className="block text-[12px] font-black text-[#334155]">
              Varış (işletme adresi)
              <input value={destination} onChange={(e) => setDestination(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
            </label>
            <label className="block text-[12px] font-black text-[#334155]">
              Çıkış (isteğe bağlı)
              <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Boş bırakılırsa müşterinin konumu" className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
            </label>
            <p className="break-all rounded-xl bg-[#f8fbfc] px-4 py-3 text-[13px] text-[#334155]">{directions || "Varış adresi yazın."}</p>
            <div className="flex flex-wrap gap-2">
              {directions ? <CopyButton value={directions} /> : null}
              {directions ? <a href={directions} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfe7ec] px-3 py-2 text-[11px] font-black text-[#087f98]">Tarifi aç <ExternalLink className="h-3.5 w-3.5" /></a> : null}
            </div>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function HoursPage() {
  const [days, setDays] = useState(defaultDayHours);
  const text = formatHours(days);
  const schema = buildOpeningHoursSchema(days);

  const update = (id: WeekDayId, patch: Partial<(typeof days)[WeekDayId]>) => {
    setDays((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  return (
    <>
      <ToolHeader eyebrow="Yerel SEO aracı" title="Çalışma saati metni" desc="Google, site ve kartvizitte aynı saat cümlesini kullanın. Kapalı günler ‘Kapalı’ yazılır; şema satırına yalnızca açık günler gider." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-2 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            {WEEK_DAYS.map((day) => {
              const value = days[day.id];
              return (
                <div key={day.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded-xl border border-[#e8f1f4] px-3 py-2">
                  <p className="text-[13px] font-black text-[#0f172a]">{day.label}</p>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748b]">
                    <input type="checkbox" checked={value.closed} onChange={(e) => update(day.id, { closed: e.target.checked })} className="accent-[#00a8c4]" />
                    Kapalı
                  </label>
                  <input type="time" disabled={value.closed} value={value.open} onChange={(e) => update(day.id, { open: e.target.value })} className="rounded-lg border border-[#d8e7eb] bg-[#f8fbfc] px-2 py-1.5 text-[12px] disabled:opacity-40" />
                  <input type="time" disabled={value.closed} value={value.close} onChange={(e) => update(day.id, { close: e.target.value })} className="rounded-lg border border-[#d8e7eb] bg-[#f8fbfc] px-2 py-1.5 text-[12px] disabled:opacity-40" />
                </div>
              );
            })}
          </div>
          <div className="space-y-4">
            <div className="rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Türkçe metin</p>
              <p className="mt-3 text-[14px] leading-relaxed text-[#1e293b]">{text}</p>
              <div className="mt-4"><CopyButton value={text} /></div>
            </div>
            <div className="rounded-[26px] border border-[#d7eaee] bg-[#0f172a] p-6 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#67e8f9]">openingHours</p>
              <pre className="mt-3 overflow-auto whitespace-pre-wrap break-all text-[12px] leading-relaxed text-white/80">{JSON.stringify(schema, null, 2)}</pre>
              <div className="mt-4"><CopyButton value={JSON.stringify(schema)} /></div>
              <p className="mt-4 text-[11px] leading-relaxed text-white/55">Bu liste LocalBusiness şemasındaki openingHours alanına yapıştırılır. Google’a otomatik gönderilmez.</p>
            </div>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function ReviewReplyPage() {
  const [brand, setBrand] = useState("Defne Eczane");
  const [customer, setCustomer] = useState("Ayşe");
  const [stars, setStars] = useState(5);
  const [topic, setTopic] = useState("ilaç temini");
  const replies = useMemo(() => buildReviewReplies({ brand, customer, stars, topic }), [brand, customer, stars, topic]);

  return (
    <>
      <ToolHeader eyebrow="İtibar aracı" title="Google yorum cevap şablonu" desc="Gelen yoruma kısa, dürüst işletme yanıtı. Düşük puanda herkese açık tartışma yok; telefonla çözüm. Sahte yorum yazılmaz." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            <label className="block text-[12px] font-black text-[#334155]">
              İşletme adı
              <input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
            </label>
            <label className="block text-[12px] font-black text-[#334155]">
              Müşteri adı (isteğe bağlı)
              <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
            </label>
            <label className="block text-[12px] font-black text-[#334155]">
              Konu (isteğe bağlı)
              <input value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
            </label>
            <label className="block text-[12px] font-black text-[#334155]">
              Puan
              <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]">
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>{value} yıldız</option>
                ))}
              </select>
            </label>
            <p className="text-[12px] leading-relaxed text-[#64748b]">Metni kopyalayıp Google İşletme Profili yanıtına yapıştırın. Teşvik karşılığı puan istenmez.</p>
          </div>
          <div className="space-y-3">
            {replies.map((reply, index) => (
              <div key={index} className="rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Şablon {index + 1}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-[#1e293b]">{reply}</p>
                <div className="mt-4"><CopyButton value={reply} /></div>
              </div>
            ))}
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function AppointmentReminderPage() {
  const [brand, setBrand] = useState("Defne Dental");
  const [customer, setCustomer] = useState("Ayşe");
  const [when, setWhen] = useState("yarın 14:00");
  const [service, setService] = useState("kontrol");
  const texts = useMemo(
    () => buildAppointmentReminder({ brand, customer, when, service }),
    [brand, customer, when, service],
  );

  return (
    <>
      <ToolHeader eyebrow="Randevu aracı" title="Randevu hatırlatma metni" desc="Müşteriye göndereceğiniz kısa WhatsApp ve SMS. Toplu spam yok; gelemeyecekse yazmasını isteyin, saati başkasına açın." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            <label className="block text-[12px] font-black text-[#334155]">İşletme adı<input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">Müşteri adı (isteğe bağlı)<input value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">Ne zaman<input value={when} onChange={(e) => setWhen(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">Hizmet (isteğe bağlı)<input value={service} onChange={(e) => setService(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <p className="text-[12px] leading-relaxed text-[#64748b]">Metni kopyalayıp kendi numaranızdan gönderin. Toplu reklam listesine eklenmez.</p>
          </div>
          <div className="space-y-3">
            <div className="rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">WhatsApp</p>
              <p className="mt-3 text-[14px] leading-relaxed text-[#1e293b]">{texts.whatsapp}</p>
              <div className="mt-4"><CopyButton value={texts.whatsapp} /></div>
            </div>
            <div className="rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">SMS</p>
              <p className="mt-3 text-[14px] leading-relaxed text-[#1e293b]">{texts.sms}</p>
              <div className="mt-4"><CopyButton value={texts.sms} /></div>
            </div>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function ClosedNoticePage() {
  const [brand, setBrand] = useState("Antakya Künefe");
  const [from, setFrom] = useState("1 Eylül");
  const [to, setTo] = useState("3 Eylül");
  const [reason, setReason] = useState("bayram");
  const texts = useMemo(
    () => buildClosedNotice({ brand, from, to, reason }),
    [brand, from, to, reason],
  );

  return (
    <>
      <ToolHeader eyebrow="İşletme notu" title="Kapalıyız / tatil metni" desc="WhatsApp durumuna ve Google işletme duyurusuna yapıştırın. Açıkmış gibi yazılmaz; tarih ve dönüş net." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            <label className="block text-[12px] font-black text-[#334155]">İşletme adı<input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">Başlangıç<input value={from} onChange={(e) => setFrom(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">Bitiş<input value={to} onChange={(e) => setTo(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">Sebep (isteğe bağlı)<input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <p className="text-[12px] leading-relaxed text-[#64748b]">Metni kopyalayıp kendi kanalınızdan yayınlayın. Otomatik “açığız” yazılmaz.</p>
          </div>
          <div className="space-y-3">
            <div className="rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">WhatsApp</p>
              <p className="mt-3 text-[14px] leading-relaxed text-[#1e293b]">{texts.whatsapp}</p>
              <div className="mt-4"><CopyButton value={texts.whatsapp} /></div>
            </div>
            <div className="rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Harita / duyuru</p>
              <p className="mt-3 text-[14px] leading-relaxed text-[#1e293b]">{texts.maps}</p>
              <div className="mt-4"><CopyButton value={texts.maps} /></div>
            </div>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function AdsRsaPage() {
  const [brand, setBrand] = useState("Antakya Künefe");
  const [service, setService] = useState("künefe");
  const [district, setDistrict] = useState("Antakya");
  const [offer, setOffer] = useState("Aynı gün teslim");
  const result = useMemo(
    () => buildAdsRsaTexts({ brand, service, district, offer }),
    [brand, service, district, offer],
  );

  return (
    <>
      <ToolHeader
        eyebrow="Google Ads aracı"
        title="Google Ads metin taslağı"
        desc="Duyarlı arama reklamı (RSA) için başlık ve açıklama. Karakter limiti Google’ın resmi sınırıdır: başlık 30, açıklama 90. Sıra veya satış garantisi yoktur."
      />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            <label className="block text-[12px] font-black text-[#334155]">İşletme adı<input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">Hizmet / ürün<input value={service} onChange={(e) => setService(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">İlçe / bölge<input value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">Teklif / vurgu (isteğe bağlı)<input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="Örn. Aynı gün teslim" className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <p className="text-[12px] leading-relaxed text-[#64748b]">
              Başlık {ADS_RSA_HEADLINE_MAX} · açıklama {ADS_RSA_DESCRIPTION_MAX} karakter. Metni Ads hesabınızda yapıştırıp yayınlayın; UTM için{" "}
              <Link to="/araclar/utm-link" className="font-bold text-[#078ca5] hover:underline">UTM linki</Link> kullanın.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Başlıklar · max {ADS_RSA_HEADLINE_MAX}</p>
              <ul className="mt-4 space-y-2">
                {result.headlines.map((item) => (
                  <li key={item.text} className="flex items-start justify-between gap-3 rounded-xl bg-[#f5fafb] p-3 ring-1 ring-[#e2eef1]">
                    <div className="min-w-0">
                      <p className="break-words text-[13px] font-semibold text-[#1e293b]">{item.text}</p>
                      <p className={`mt-1 text-[10px] font-bold ${item.ok ? "text-[#047857]" : "text-[#b91c1c]"}`}>{item.length}/{item.max}</p>
                    </div>
                    <CopyButton value={item.text} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Açıklamalar · max {ADS_RSA_DESCRIPTION_MAX}</p>
              <ul className="mt-4 space-y-2">
                {result.descriptions.map((item) => (
                  <li key={item.text} className="flex items-start justify-between gap-3 rounded-xl bg-[#f5fafb] p-3 ring-1 ring-[#e2eef1]">
                    <div className="min-w-0">
                      <p className="break-words text-[13px] leading-relaxed text-[#1e293b]">{item.text}</p>
                      <p className={`mt-1 text-[10px] font-bold ${item.ok ? "text-[#047857]" : "text-[#b91c1c]"}`}>{item.length}/{item.max}</p>
                    </div>
                    <CopyButton value={item.text} />
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[12px] leading-relaxed text-[#64748b]">{result.disclaimer}</p>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function SocialOgPage() {
  const [title, setTitle] = useState("Antakya Künefe | Defne");
  const [description, setDescription] = useState("Defne’de günlük künefe. WhatsApp’tan sipariş; adres ve çalışma saati sitede.");
  const [url, setUrl] = useState("https://ornek-isletme.com");
  const [imageUrl, setImageUrl] = useState("https://ornek-isletme.com/og-kunefe.jpg");
  const [siteName, setSiteName] = useState("Antakya Künefe");
  const result = useMemo(
    () => buildOpenGraphTags({ title, description, url, imageUrl, siteName }),
    [title, description, url, imageUrl, siteName],
  );

  return (
    <>
      <ToolHeader
        eyebrow="Paylaşım aracı"
        title="Sosyal paylaşım önizlemesi"
        desc="WhatsApp ve Facebook kartında görünen başlık, açıklama ve görsel için Open Graph satırları. Google Ads metni veya SERP meta etiketi değildir; sıra garantisi yoktur."
      />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            <label className="block text-[12px] font-black text-[#334155]">
              Başlık
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={OG_TITLE_MAX} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
              <span className={`mt-1 block text-[10px] font-bold ${result.titleOk ? "text-[#047857]" : "text-[#b91c1c]"}`}>{title.length}/{OG_TITLE_MAX}</span>
            </label>
            <label className="block text-[12px] font-black text-[#334155]">
              Açıklama
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={OG_DESCRIPTION_MAX} rows={3} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" />
              <span className={`mt-1 block text-[10px] font-bold ${result.descriptionOk ? "text-[#047857]" : "text-[#b91c1c]"}`}>{description.length}/{OG_DESCRIPTION_MAX}</span>
            </label>
            <label className="block text-[12px] font-black text-[#334155]">Sayfa URL<input value={url} onChange={(e) => setUrl(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">Görsel URL (isteğe bağlı)<input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…/og.jpg" className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <label className="block text-[12px] font-black text-[#334155]">Site adı<input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]" /></label>
            <p className="text-[12px] leading-relaxed text-[#64748b]">
              Satırları sitenizin <code className="rounded bg-[#eef6f8] px-1">&lt;head&gt;</code> bölümüne koyun. Google arama önizlemesi için{" "}
              <Link to="/araclar/meta-etiket-olusturucu" className="font-bold text-[#078ca5] hover:underline">meta etiket</Link> aracını kullanın.
            </p>
          </div>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[26px] border border-[#d7eaee] bg-[#0b141a] p-4 shadow-sm">
              <p className="px-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#67e8f9]">WhatsApp tarzı kart</p>
              <div className="mt-3 overflow-hidden rounded-2xl bg-[#1f2c34]">
                {result.imageUrl ? (
                  <div className="aspect-[1.91/1] bg-[#0f172a]">
                    <img src={result.imageUrl} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  </div>
                ) : (
                  <div className="flex aspect-[1.91/1] items-center justify-center bg-[#111827] text-[11px] font-bold text-white/35">Görsel yok</div>
                )}
                <div className="space-y-1 px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#8696a0]">{result.host || "alan-adi.com"}</p>
                  <p className="text-[14px] font-semibold leading-snug text-[#e9edef]">{result.title || "Başlık girin"}</p>
                  <p className="text-[12px] leading-relaxed text-[#8696a0]">{result.description || "Açıklama girin"}</p>
                </div>
              </div>
              {!result.urlOk ? <p className="mt-3 text-[11px] font-bold text-[#fca5a5]">Geçerli bir http(s) URL girin.</p> : null}
              {!result.imageOk ? <p className="mt-2 text-[11px] font-bold text-[#fca5a5]">Görsel URL geçersiz.</p> : null}
            </div>
            <div className="rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Open Graph HTML</p>
                <CopyButton value={result.html} />
              </div>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-[#0f172a] p-4 text-[11px] leading-relaxed text-[#e2e8f0]">{result.html || "Alanları doldurun"}</pre>
              <p className="mt-4 text-[12px] leading-relaxed text-[#64748b]">{result.disclaimer}</p>
            </div>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

export function NeedsCalculatorPage() {
  const { settings } = useContent();
  const [sector, setSector] = useState<string>(NEED_SECTORS[0]);
  const [district, setDistrict] = useState<string>(NEED_DISTRICTS[0]);
  const [needs, setNeeds] = useState<NeedId[]>(["site", "maps"]);
  const result = useMemo(() => estimateNeeds({ sector, district, needs }), [sector, district, needs]);
  const wa = result.whatsapp ? toWhatsAppHref(settings.phone, result.whatsapp) : "";

  const toggle = (id: NeedId) => {
    setNeeds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <>
      <ToolHeader eyebrow="Paket önerisi" title="Özel İhtiyaç Hesaplayıcı" desc="Sektörünüzü, ilçenizi ve ne istediğinizi seçin. Web, reklam, harita veya e-ticaret modülleri önerilir. Sitedeki fiyatlar örnektir; kesin teklif yazılı gider. Sıra garantisi yok." />
      <ToolLayout>
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4 rounded-[26px] border border-[#d7eaee] bg-white p-6 shadow-sm">
            <label className="block text-[12px] font-black text-[#334155]">
              Sektör
              <select value={sector} onChange={(e) => setSector(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]">
                {NEED_SECTORS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block text-[12px] font-black text-[#334155]">
              İlçe (Hatay)
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d8e7eb] bg-[#f8fbfc] px-4 py-3 text-[14px] outline-none focus:border-[#00a8c4]">
                {NEED_DISTRICTS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <p className="text-[12px] font-black text-[#334155]">Neye ihtiyacınız var?</p>
            <div className="space-y-2">
              {NEED_OPTIONS.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-[#e8f1f4] px-4 py-3 hover:bg-[#f4fbfd]">
                  <span>
                    <span className="block text-[13px] font-black text-[#0f172a]">{option.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-[#64748b]">{option.hint}</span>
                  </span>
                  <input type="checkbox" checked={needs.includes(option.id)} onChange={() => toggle(option.id)} className="mt-1 h-4 w-4 accent-[#00a8c4]" />
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-[26px] border border-[#d7eaee] bg-[#0f172a] p-6 text-white shadow-xl">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#67e8f9]">
              <Calculator className="h-3.5 w-3.5" /> Önerilen çerçeve
            </p>
            <h2 className="mt-4 text-[24px] font-black">{result.packageName || "Seçim bekleniyor"}</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-white/75">{result.summary}</p>
            {result.modules.length ? (
              <ul className="mt-5 space-y-2">
                {result.modules.map((item) => (
                  <li key={item} className="rounded-xl bg-white/5 px-3 py-2 text-[12px] leading-relaxed text-white/85">{item}</li>
                ))}
              </ul>
            ) : null}
            <p className="mt-5 text-[12px] leading-relaxed text-white/60">{result.nextStep}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to={buildIletisimQuotePath({ sector, district, needs, packageName: result.packageName })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00a8c4] px-3 py-2 text-[11px] font-black text-white"
              >
                Yazılı teklif <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {wa ? (
                <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-black text-white">
                  WhatsApp <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
              {result.whatsapp ? <CopyButton value={result.whatsapp} /> : null}
            </div>
            <p className="mt-5 text-[11px] leading-relaxed text-white/45">{result.disclaimer}</p>
            <Link to="/paketler" className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#7dd3e8] hover:underline">
              Örnek tutar paket yapılandırıcıda <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}
