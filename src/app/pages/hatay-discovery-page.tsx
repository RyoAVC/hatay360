import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Coffee, ExternalLink, MapPinned, Search, Sparkles, Sun, Users } from "lucide-react";
import { PageCrumbs } from "../components/page-crumbs";

const DISTRICTS = [
  { name: "Antakya", breakfast: "Yerel lezzet ve çarşı rotasına yakın kahvaltı", nature: "Şehir kültürü ve gastronomi günü", family: "Merkezde kısa yürüyüşlü aile planı", search: "Antakya kahvaltı mekanları" },
  { name: "Defne", breakfast: "Harbiye çevresinde bahçeli ve sakin kahvaltı", nature: "Doğa, yeşil alan ve dinlenme rotası", family: "Bahçeli mekân ve kısa gezi planı", search: "Defne Harbiye kahvaltı mekanları" },
  { name: "Arsuz", breakfast: "Sahil havası ve uzun hafta sonu kahvaltısı", nature: "Deniz kenarı yürüyüş ve gün batımı", family: "Sahil çevresinde rahat aile günü", search: "Arsuz sahil kahvaltı mekanları" },
  { name: "İskenderun", breakfast: "Sahil hattına yakın şehir kahvaltısı", nature: "Sahil yürüyüşü ve şehir keşfi", family: "Ulaşımı kolay merkez ve sahil planı", search: "İskenderun kahvaltı mekanları" },
  { name: "Samandağ", breakfast: "Sahil rotasıyla birleşen sakin kahvaltı", nature: "Sahil ve tarih odaklı tam gün rota", family: "Geniş zamanlı kıyı ve gezi planı", search: "Samandağ kahvaltı mekanları" },
  { name: "Dörtyol", breakfast: "Aileyle rahat ulaşılabilen yerel kahvaltı", nature: "Açık alan ve ilçe çevresi rotası", family: "Çocuklu aileye uygun sakin plan", search: "Dörtyol Hatay kahvaltı mekanları" },
];

const MOODS = [
  { id: "breakfast", label: "Kahvaltı", icon: Coffee },
  { id: "nature", label: "Doğa & gezi", icon: Sun },
  { id: "family", label: "Ailece", icon: Users },
] as const;

export function HatayDiscoveryPage() {
  const [district, setDistrict] = useState("Antakya");
  const [mood, setMood] = useState<(typeof MOODS)[number]["id"]>("breakfast");
  const selected = useMemo(() => DISTRICTS.find((item) => item.name === district) || DISTRICTS[0], [district]);
  const recommendation = selected[mood];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.search)}`;

  return (
    <>
      <section className="border-b border-[#dbecef] bg-[radial-gradient(circle_at_top_right,rgba(250,190,70,0.18),transparent_32%),linear-gradient(180deg,#f9fdfe,#eef8fa)]">
        <div className="mx-auto max-w-5xl px-5 pt-6 sm:px-8">
          <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Hatay keşif" }]} />
        </div>
        <div className="mx-auto max-w-5xl px-5 py-14 text-center sm:px-8 sm:py-18"><span className="inline-flex items-center gap-2 rounded-full border border-[#d8e8eb] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#087f98]"><Sparkles className="h-3.5 w-3.5" /> Hatay360 yerel rehber</span><h1 className="mt-5 text-[38px] font-black tracking-[-0.05em] text-[#0f2532] sm:text-[54px]">Hatay’da bugün ne yapmalı?</h1><p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#5c6f7b]">İlçeyi ve planınızı seçin; size uygun Hatay keşif fikrini ve güncel harita aramasını hazırlayalım.</p></div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[26px] border border-[#dce9ec] bg-white p-6 shadow-sm"><label className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6a7d88]">İlçe<select value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-2 block w-full rounded-xl border border-[#d8e6e9] bg-[#f8fbfc] px-4 py-3 text-[13px] font-bold text-[#233d4a] outline-none focus:border-[#00a8c4]">{DISTRICTS.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#6a7d88]">Nasıl bir gün?</p><div className="mt-2 grid gap-2">{MOODS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setMood(id)} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[12px] font-black transition ${mood === id ? "border-[#8fd8e4] bg-[#eaf9fb] text-[#087f98]" : "border-[#e0eaec] text-[#536974] hover:bg-[#f6fafb]"}`}><Icon className="h-4 w-4" />{label}</button>)}</div></div>
          <div className="relative overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_top_right,rgba(250,190,70,0.22),transparent_35%),linear-gradient(145deg,#082430,#113c4a)] p-7 text-white shadow-[0_20px_50px_rgba(8,36,48,0.16)]"><MapPinned className="h-7 w-7 text-[#7ee0ec]" /><p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#7ee0ec]">{selected.name} planı</p><h2 className="mt-3 text-[30px] font-black leading-tight">{recommendation}</h2><div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[11px] leading-relaxed text-white/65">Mekânların çalışma saatleri ve güncel puanları değişebilir. Canlı sonuçları açarak son yorumları, fotoğrafları ve yol tarifini kontrol edin.</p></div><a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-3 text-[12px] font-black text-white">Güncel harita sonuçlarını aç <ExternalLink className="h-4 w-4" /></a></div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2"><Link to="/hatayda-nerede-kahvalti-yapilir" className="rounded-2xl border border-[#dce9ec] bg-white p-5 transition hover:-translate-y-1 hover:border-[#8fd8e4]"><Coffee className="h-5 w-5 text-[#c88016]" /><h2 className="mt-3 text-[18px] font-black text-[#0f2532]">Hatay’da nerede kahvaltı yapılır?</h2><p className="mt-2 text-[12px] text-[#687b85]">İlçeye ve kahvaltı tarzına göre karar rehberi.</p><span className="mt-4 inline-flex items-center gap-1 text-[10px] font-black text-[#087f98]">Rehberi aç <ArrowRight className="h-3.5 w-3.5" /></span></Link><Link to="/hatay" className="rounded-2xl border border-[#dce9ec] bg-white p-5 transition hover:-translate-y-1 hover:border-[#8fd8e4]"><Search className="h-5 w-5 text-[#00a8c4]" /><h2 className="mt-3 text-[18px] font-black text-[#0f2532]">Hatay ilçe rehberi</h2><p className="mt-2 text-[12px] text-[#687b85]">15 ilçenin hizmet ve yerel görünürlük sayfaları.</p><span className="mt-4 inline-flex items-center gap-1 text-[10px] font-black text-[#087f98]">İlçeleri gör <ArrowRight className="h-3.5 w-3.5" /></span></Link></div>
      </section>
    </>
  );
}

export function HatayBreakfastGuidePage() {
  return (
    <>
      <section className="border-b border-[#e8ecef] bg-[#fffaf1]">
        <div className="mx-auto max-w-4xl px-5 pt-6 sm:px-8">
          <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Hatay keşif", to: "/hatay-kesfet" }, { label: "Kahvaltı rehberi" }]} />
        </div>
        <div className="mx-auto max-w-4xl px-5 py-14 text-center sm:px-8"><span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#b16b08]"><Coffee className="h-4 w-4" /> Hatay kahvaltı rehberi</span><h1 className="mt-4 text-[38px] font-black tracking-[-0.05em] text-[#302314] sm:text-[52px]">Hatay’da nerede kahvaltı yapılır?</h1><p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#74614a]">Sahil, bahçe, şehir merkezi veya aile planı… İlçeye göre doğru bölgeyi seçin, güncel mekânları haritada karşılaştırın.</p></div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8"><div className="grid gap-4 md:grid-cols-2">{DISTRICTS.map((item) => { const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.search)}`; return <article key={item.name} className="rounded-[22px] border border-[#eadfce] bg-white p-5 shadow-[0_10px_28px_rgba(76,50,20,0.04)]"><div className="flex items-center justify-between"><h2 className="text-[20px] font-black text-[#392919]">{item.name}</h2><span className="rounded-full bg-[#fff4df] px-2.5 py-1 text-[9px] font-black text-[#a96308]">Hatay</span></div><p className="mt-3 text-[13px] leading-relaxed text-[#756550]">{item.breakfast}</p><a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-black text-[#a96308]">Güncel kahvaltı mekânlarını aç <ExternalLink className="h-3.5 w-3.5" /></a></article>; })}</div><div className="mt-10 rounded-[22px] border border-[#e8dcc9] bg-[#fffaf1] p-6"><h2 className="text-[20px] font-black text-[#392919]">Mekân seçerken neye bakmalı?</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{["Son 3 aydaki yorumların güncelliği", "Menü, fiyat ve çalışma saati fotoğrafları", "Otopark, çocuk alanı ve rezervasyon bilgisi"].map((item) => <div key={item} className="rounded-xl bg-white p-3 text-[11px] font-bold leading-relaxed text-[#6f604c] ring-1 ring-[#ede2d2]">{item}</div>)}</div></div><Link to="/hatay-kesfet" className="mt-8 inline-flex items-center gap-2 text-[12px] font-black text-[#087f98]">Hatay keşif planlayıcıya dön <ArrowRight className="h-4 w-4" /></Link></section>
    </>
  );
}
