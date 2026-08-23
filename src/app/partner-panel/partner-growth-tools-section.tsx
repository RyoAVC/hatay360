import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Copy, MapPinned, MessageSquareText, Target, Trophy } from "lucide-react";
import { OFFICIAL_HATAY_DISTRICTS } from "../lib/seo";
import { formatTry } from "./partner-panel-format";

type Tool = "script" | "objections" | "goal" | "region" | "daily";
const TOOLS: { id: Tool; label: string; icon: typeof Target }[] = [
  { id: "script", label: "Satış konuşması", icon: MessageSquareText },
  { id: "objections", label: "İtiraz merkezi", icon: ClipboardCheck },
  { id: "goal", label: "Hedef planı", icon: Target },
  { id: "region", label: "Bölge fırsatı", icon: MapPinned },
  { id: "daily", label: "Günlük görevler", icon: Trophy },
];
const SERVICES = ["Kurumsal web sitesi", "Google Ads", "Google Maps", "E-ticaret", "Meta reklam", "SEO ve bakım"];
const SECTORS = ["Klinik", "Taksi / transfer", "Nakliyat", "Restoran", "Emlak", "Servis / tamirat", "Perakende"];
const OBJECTIONS = [
  { q: "Fiyat yüksek", a: "Haklısınız; yalnızca bir sayfa değil, müşteriyi aramaya ve başvuruya götüren ölçülebilir bir satış altyapısı kuruyoruz. Kapsamı bütçenize göre aşamalara ayırabiliriz." },
  { q: "Şu an ihtiyacım yok", a: "Anlıyorum. En azından mevcut görünürlüğünüzü ücretsiz kontrol edip kaçırılan çağrı ve harita fırsatlarını kısa bir raporla gösterebilirim." },
  { q: "Başka ajansla çalışıyorum", a: "Mevcut iş ortağınızı değiştirmenizi istemiyorum. Reklam, site ve Maps tarafında ölçülemeyen bir boşluk varsa tamamlayıcı bir çözüm önerebiliriz." },
  { q: "Düşüneyim", a: "Elbette. Karar vermenizi kolaylaştırmak için kapsamı, toplam maliyeti ve beklenen teslimleri tek sayfalık teklif olarak göndereyim." },
];
const DAILY = ["10 yeni işletme araştır", "5 işletmeyle ilk temas kur", "2 ihtiyaç görüşmesi yap", "1 kurumsal teklif gönder", "Eski fırsatları tekrar ara"];

export function PartnerGrowthToolsSection() {
  const [tool, setTool] = useState<Tool>("script");
  const [business, setBusiness] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [sector, setSector] = useState(SECTORS[0]);
  const [district, setDistrict] = useState<string>(OFFICIAL_HATAY_DISTRICTS[0]);
  const [target, setTarget] = useState(50000);
  const [average, setAverage] = useState(7500);
  const [checked, setChecked] = useState<boolean[]>(DAILY.map(() => false));
  const [copied, setCopied] = useState("");

  const script = `Merhaba ${business || "[Firma adı]"}, ${district} bölgesinde ${sector.toLocaleLowerCase("tr-TR")} işletmelerinin dijital görünürlüğünü inceliyoruz. ${service} tarafında daha fazla arama, çağrı ve müşteri talebi oluşturabilecek birkaç fırsat gördük. Size kısa ve ücretsiz bir ön analiz sunmamı ister misiniz?`;
  const salesNeeded = Math.ceil(Math.max(0, target) / Math.max(1, average));
  const opportunity = useMemo(() => {
    const channel = service.includes("Maps") ? "harita görünürlüğü ve yorum akışı" : service.includes("Ads") || service.includes("reklam") ? "yerel arama reklamları ve dönüşüm takibi" : "mobil satış sayfası ve hızlı iletişim";
    return `${district} bölgesindeki ${sector} işletmeleri için ${channel} öne çıkar. İlk hedef: 25 işletme listele, 10 tanesini analiz et, en güçlü 5 fırsata kişisel teklif gönder.`;
  }, [district, sector, service]);
  const copy = async (key: string, text: string) => { await navigator.clipboard.writeText(text); setCopied(key); window.setTimeout(() => setCopied(""), 1600); };

  return <div className="space-y-6">
    <header><p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Bayi büyüme merkezi</p><h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Satış araçları</h1><p className="mt-2 text-sm text-indigo-100/55">Müşteri bulma, görüşme ve hedef takibi için beş pratik modül.</p></header>
    <div className="flex gap-2 overflow-x-auto pb-1">{TOOLS.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setTool(item.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black ${tool === item.id ? "bg-indigo-500 text-white" : "border border-indigo-400/15 bg-indigo-500/5 text-indigo-100/60"}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</div>

    {tool === "script" ? <section className="rounded-2xl border border-indigo-400/20 bg-[#15122f]/80 p-5"><h2 className="font-black">Kişisel satış konuşması üretici</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Firma adı" className="rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm" /><select value={service} onChange={(e) => setService(e.target.value)} className="rounded-xl border border-indigo-400/20 bg-[#12102a] px-3 py-2.5 text-sm">{SERVICES.map((x) => <option key={x}>{x}</option>)}</select><select value={sector} onChange={(e) => setSector(e.target.value)} className="rounded-xl border border-indigo-400/20 bg-[#12102a] px-3 py-2.5 text-sm">{SECTORS.map((x) => <option key={x}>{x}</option>)}</select><select value={district} onChange={(e) => setDistrict(e.target.value)} className="rounded-xl border border-indigo-400/20 bg-[#12102a] px-3 py-2.5 text-sm">{OFFICIAL_HATAY_DISTRICTS.map((x) => <option key={x}>{x}</option>)}</select></div><p className="mt-4 rounded-xl bg-black/20 p-4 text-sm leading-relaxed text-indigo-50/80">{script}</p><button onClick={() => copy("script", script)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-indigo-400/25 px-3 py-2 text-xs font-black"><Copy className="h-3.5 w-3.5" />{copied === "script" ? "Kopyalandı" : "Metni kopyala"}</button></section> : null}

    {tool === "objections" ? <section className="grid gap-3 sm:grid-cols-2">{OBJECTIONS.map((item) => <article key={item.q} className="rounded-2xl border border-indigo-400/15 bg-[#15122f]/70 p-5"><p className="text-xs font-black uppercase tracking-wider text-amber-200">“{item.q}”</p><p className="mt-3 text-sm leading-relaxed text-indigo-100/70">{item.a}</p><button onClick={() => copy(item.q, item.a)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-indigo-300"><Copy className="h-3.5 w-3.5" />{copied === item.q ? "Kopyalandı" : "Cevabı kopyala"}</button></article>)}</section> : null}

    {tool === "goal" ? <section className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-6"><h2 className="font-black">Aylık kazanç hedefi</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs text-indigo-100/60">Hedef kazanç (TL)<input type="number" min="0" value={target} onChange={(e) => setTarget(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm" /></label><label className="text-xs text-indigo-100/60">Satış başına ortalama komisyon<input type="number" min="1" value={average} onChange={(e) => setAverage(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm" /></label></div><div className="mt-5 rounded-2xl bg-black/20 p-5"><p className="text-xs text-violet-200/60">Hedef için gereken satış</p><p className="mt-1 text-4xl font-black">{salesNeeded}</p><p className="mt-2 text-sm text-indigo-100/60">{formatTry(target)} hedefe, satış başına yaklaşık {formatTry(average)} komisyonla ulaşılır.</p></div></section> : null}

    {tool === "region" ? <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6"><h2 className="font-black">Bölgesel fırsat bulucu</h2><div className="mt-4 grid gap-3 sm:grid-cols-3"><select value={district} onChange={(e) => setDistrict(e.target.value)} className="rounded-xl border border-indigo-400/20 bg-[#12102a] px-3 py-2.5 text-sm">{OFFICIAL_HATAY_DISTRICTS.map((x) => <option key={x}>{x}</option>)}</select><select value={sector} onChange={(e) => setSector(e.target.value)} className="rounded-xl border border-indigo-400/20 bg-[#12102a] px-3 py-2.5 text-sm">{SECTORS.map((x) => <option key={x}>{x}</option>)}</select><select value={service} onChange={(e) => setService(e.target.value)} className="rounded-xl border border-indigo-400/20 bg-[#12102a] px-3 py-2.5 text-sm">{SERVICES.map((x) => <option key={x}>{x}</option>)}</select></div><p className="mt-5 rounded-xl bg-black/20 p-4 text-sm leading-relaxed text-emerald-50/75">{opportunity}</p></section> : null}

    {tool === "daily" ? <section className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/5 p-6"><div className="flex items-center justify-between"><h2 className="font-black">Günlük satış görevleri</h2><span className="text-xs font-black text-fuchsia-200">{checked.filter(Boolean).length}/{DAILY.length}</span></div><div className="mt-4 space-y-2">{DAILY.map((item, index) => <label key={item} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${checked[index] ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : "border-indigo-400/15 bg-black/15 text-indigo-100/70"}`}><input type="checkbox" checked={checked[index]} onChange={(e) => setChecked((old) => old.map((value, i) => i === index ? e.target.checked : value))} /><CheckCircle2 className="h-4 w-4" />{item}</label>)}</div><button onClick={() => setChecked(DAILY.map(() => false))} className="mt-4 text-xs font-black text-indigo-300">Yeni güne sıfırla</button></section> : null}
  </div>;
}
