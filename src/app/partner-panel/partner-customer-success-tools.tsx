import { useMemo, useState } from "react";
import { Calculator, CheckCircle2, ClipboardCheck, Copy, Globe2, Handshake, MapPinned, MessageCircleMore, PieChart } from "lucide-react";

type Tool = "web" | "maps" | "budget" | "followup" | "handover";
const TOOLS = [
  { id: "web" as const, label: "Web analizi", icon: Globe2 },
  { id: "maps" as const, label: "Maps analizi", icon: MapPinned },
  { id: "budget" as const, label: "Bütçe dağılımı", icon: PieChart },
  { id: "followup" as const, label: "Teklif takibi", icon: MessageCircleMore },
  { id: "handover" as const, label: "Müşteri teslimi", icon: Handshake },
];
const WEB_CHECKS = ["Mobilde hızlı açılıyor", "Telefon ve WhatsApp kolay bulunuyor", "SSL / HTTPS aktif", "Hizmetler net anlatılıyor", "İletişim formu çalışıyor", "Google Analytics bağlı"];
const MAPS_CHECKS = ["Firma adı doğru", "Adres ve telefon güncel", "Doğru ana kategori seçili", "Çalışma saatleri güncel", "Web sitesi bağlantısı var", "Son 30 günde yorum alınmış"];
const HANDOVER = ["Müşteri iletişim bilgileri doğrulandı", "İhtiyaç ve kapsam yazılı aktarıldı", "Teklif müşteriye gönderildi", "Ödeme ve teslim koşulları açıklandı", "Sonraki görüşme tarihi belirlendi"];

function Checklist({ items, checked, setChecked }: { items: string[]; checked: boolean[]; setChecked: (value: boolean[]) => void }) {
  return <div className="space-y-2">{items.map((item,index) => <label key={item} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${checked[index] ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : "border-indigo-400/15 bg-black/15 text-indigo-100/70"}`}><input type="checkbox" checked={checked[index]} onChange={(e) => setChecked(checked.map((value,i) => i === index ? e.target.checked : value))} /><CheckCircle2 className="h-4 w-4" />{item}</label>)}</div>;
}

export function PartnerCustomerSuccessTools() {
  const [tool, setTool] = useState<Tool>("web");
  const [web, setWeb] = useState(WEB_CHECKS.map(() => false));
  const [maps, setMaps] = useState(MAPS_CHECKS.map(() => false));
  const [handover, setHandover] = useState(HANDOVER.map(() => false));
  const [budget, setBudget] = useState(30000);
  const [ratios, setRatios] = useState({ google: 55, meta: 25, content: 20 });
  const [customer, setCustomer] = useState("");
  const [days, setDays] = useState(2);
  const [copied, setCopied] = useState(false);
  const followup = `Merhaba ${customer || "[Müşteri adı]"}, size ilettiğimiz dijital çözüm teklifini inceleme fırsatınız oldu mu? Sorularınızı yanıtlayabilir ve kapsamı hedefinize göre netleştirebiliriz. Uygunsanız ${days} gün içinde kısa bir görüşme planlayalım.`;
  const amounts = useMemo(() => ({ google: budget * ratios.google / 100, meta: budget * ratios.meta / 100, content: budget * ratios.content / 100 }), [budget, ratios]);
  const normalizeRatio = (key: keyof typeof ratios, value: number) => { const bounded = Math.max(0, Math.min(100, value)); const others = (100 - bounded) / 2; const keys = (Object.keys(ratios) as (keyof typeof ratios)[]).filter((item) => item !== key); setRatios({ ...ratios, [key]: bounded, [keys[0]]: others, [keys[1]]: others }); };
  const copy = async () => { await navigator.clipboard.writeText(followup); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };

  return <div className="space-y-6">
    <header><p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Satış sonrası kalite</p><h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Müşteri başarı araçları</h1><p className="mt-2 text-sm text-indigo-100/55">Analizden teslim sürecine kadar müşteriye daha profesyonel hizmet verin.</p></header>
    <div className="flex gap-2 overflow-x-auto pb-1">{TOOLS.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setTool(item.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black ${tool === item.id ? "bg-emerald-500 text-white" : "border border-indigo-400/15 bg-indigo-500/5 text-indigo-100/60"}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</div>

    {tool === "web" ? <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-black">Web sitesi hızlı analiz</h2><b className="text-cyan-200">{web.filter(Boolean).length}/{WEB_CHECKS.length}</b></div><Checklist items={WEB_CHECKS} checked={web} setChecked={setWeb} /><p className="mt-4 rounded-xl bg-black/20 p-3 text-xs text-cyan-100/65">Skor: %{Math.round(web.filter(Boolean).length / WEB_CHECKS.length * 100)} · Eksik maddeleri teklif kapsamına ekleyin.</p></section> : null}
    {tool === "maps" ? <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-black">Google Maps uygunluk analizi</h2><b className="text-emerald-200">{maps.filter(Boolean).length}/{MAPS_CHECKS.length}</b></div><Checklist items={MAPS_CHECKS} checked={maps} setChecked={setMaps} /><p className="mt-4 rounded-xl bg-black/20 p-3 text-xs text-emerald-100/65">Eksik sayısı: {MAPS_CHECKS.length - maps.filter(Boolean).length}. Müşteriye somut iyileştirme listesi olarak sunabilirsiniz.</p></section> : null}
    {tool === "budget" ? <section className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-6"><div className="flex items-center gap-2"><Calculator className="h-5 w-5 text-violet-300" /><h2 className="font-black">Reklam bütçesi dağılımı</h2></div><label className="mt-4 block text-xs text-indigo-100/60">Toplam aylık bütçe<input type="number" min="0" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm" /></label><div className="mt-4 grid gap-3 sm:grid-cols-3">{([['google','Google Ads'],['meta','Meta'],['content','İçerik']] as const).map(([key,label]) => <article key={key} className="rounded-xl bg-black/20 p-4"><p className="text-xs font-black">{label}</p><input type="range" min="0" max="100" value={ratios[key]} onChange={(e) => normalizeRatio(key, Number(e.target.value))} className="mt-3 w-full accent-violet-500" /><p className="mt-2 text-xl font-black text-violet-100">₺{Math.round(amounts[key]).toLocaleString('tr-TR')}</p><p className="text-[10px] text-indigo-100/45">%{Math.round(ratios[key])}</p></article>)}</div><p className="mt-3 text-[11px] text-amber-100/60">Bu araç planlama örneğidir; kesin medya bütçesi kampanya verisine göre belirlenir.</p></section> : null}
    {tool === "followup" ? <section className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6"><h2 className="font-black">Teklif takip mesajı</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Müşteri adı" className="rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm" /><label className="flex items-center gap-3 rounded-xl border border-indigo-400/20 bg-black/25 px-3 text-xs">Takip günü<input type="number" min="1" max="30" value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full bg-transparent py-2.5 text-sm outline-none" /></label></div><p className="mt-4 rounded-xl bg-black/20 p-4 text-sm leading-relaxed text-indigo-50/75">{followup}</p><button onClick={copy} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-400/25 px-3 py-2 text-xs font-black text-amber-100"><Copy className="h-3.5 w-3.5" />{copied ? "Kopyalandı" : "Mesajı kopyala"}</button></section> : null}
    {tool === "handover" ? <section className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/5 p-6"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-fuchsia-300" /><h2 className="font-black">Müşteri teslim kontrolü</h2></div><b className="text-fuchsia-200">{handover.filter(Boolean).length}/{HANDOVER.length}</b></div><Checklist items={HANDOVER} checked={handover} setChecked={setHandover} />{handover.every(Boolean) ? <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-400/10 p-3 text-sm font-black text-emerald-100"><CheckCircle2 className="h-4 w-4" />Müşteri yönetime eksiksiz aktarılmaya hazır.</p> : null}</section> : null}
  </div>;
}
