import { useMemo, useState } from "react";
import {
  BadgePercent,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Copy,
  Goal,
  MessageSquareReply,
  RefreshCcw,
  ShieldQuestion,
  Sparkles,
  UserRoundSearch,
} from "lucide-react";

type Tool = "roi" | "package" | "objection" | "meeting" | "brief" | "persona" | "calendar" | "review" | "risk" | "upsell";

const TOOLS = [
  { id: "roi" as const, label: "ROI hesabı", icon: CircleDollarSign },
  { id: "package" as const, label: "Paket öner", icon: BadgePercent },
  { id: "objection" as const, label: "İtiraz yanıtı", icon: ShieldQuestion },
  { id: "meeting" as const, label: "Görüşme planı", icon: CalendarDays },
  { id: "brief" as const, label: "Kampanya özeti", icon: ClipboardList },
  { id: "persona" as const, label: "Müşteri profili", icon: UserRoundSearch },
  { id: "calendar" as const, label: "İçerik planı", icon: Goal },
  { id: "review" as const, label: "Yorum yanıtı", icon: MessageSquareReply },
  { id: "risk" as const, label: "Risk analizi", icon: RefreshCcw },
  { id: "upsell" as const, label: "Ek satış", icon: Sparkles },
];

const PACKAGES = {
  visibility: { name: "Dijital Görünürlük", detail: "Kurumsal web sitesi + Google Maps optimizasyonu", fit: "Yerelde bulunmak ve güven vermek isteyen firmalar" },
  leads: { name: "Müşteri Kazanımı", detail: "Landing page + Google Ads + dönüşüm takibi", fit: "Hızlı talep ve telefon almak isteyen firmalar" },
  growth: { name: "Kurumsal Büyüme", detail: "Premium web + reklam yönetimi + içerik planı", fit: "Markasını büyütmek ve düzenli satış isteyen firmalar" },
};

const OBJECTIONS: Record<string, string> = {
  expensive: "Bütçenizi anlıyorum. Teklifimizi yalnızca bir web sitesi maliyeti olarak değil, düzenli müşteri talebi üreten ölçülebilir bir yatırım olarak planladık. İsterseniz öncelikli kalemlerden başlayıp kapsamı aşamalı büyütebiliriz.",
  think: "Elbette, sağlıklı bir karar için değerlendirmeniz önemli. Kararı kolaylaştırmak adına hedefinizi, beklenen çıktıyı ve ilk 30 günlük adımları tek sayfada netleştirip paylaşayım.",
  agency: "Mevcut çalışmanızın üzerine değer katabileceğimiz alanları birlikte inceleyebiliriz. Ücretsiz ön analizle eksik kalan fırsatları gösterelim; sonuç görürseniz ilerleyelim.",
};

const REVIEW_REPLIES: Record<string, string> = {
  positive: "Değerli yorumunuz için çok teşekkür ederiz. Memnuniyetiniz bizim için büyük motivasyon. Size yeniden yardımcı olmaktan mutluluk duyarız.",
  neutral: "Geri bildiriminiz için teşekkür ederiz. Deneyiminizi daha iyi hale getirmek için belirttiğiniz noktayı ekibimizle değerlendireceğiz.",
  negative: "Yaşadığınız deneyim için üzgünüz. Konuyu hızlıca inceleyip çözmek isteriz. İletişim bilgilerinizi özel mesajla paylaşırsanız sizinle doğrudan ilgileneceğiz.",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-indigo-100/60">{label}{children}</label>;
}

const inputClass = "mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-300/50";

export function PartnerPremiumToolsSection() {
  const [tool, setTool] = useState<Tool>("roi");
  const [copied, setCopied] = useState("");
  const [roi, setRoi] = useState({ budget: 20000, lead: 40, close: 20, sale: 7500 });
  const [goal, setGoal] = useState<keyof typeof PACKAGES>("leads");
  const [objection, setObjection] = useState("expensive");
  const [meeting, setMeeting] = useState({ company: "", goal: "Yeni müşteri kazanmak", minutes: 30 });
  const [brief, setBrief] = useState({ brand: "", audience: "Hatay'daki potansiyel müşteriler", offer: "Ücretsiz ön görüşme", budget: 15000 });
  const [persona, setPersona] = useState({ sector: "Hizmet", age: "25-44", priority: "Güven ve hızlı iletişim" });
  const [review, setReview] = useState("positive");
  const [risk, setRisk] = useState({ contact: 2, results: 2, payment: 1, satisfaction: 2 });
  const [currentService, setCurrentService] = useState("Web sitesi");

  const roiResult = useMemo(() => {
    const customers = roi.lead * roi.close / 100;
    const revenue = customers * roi.sale;
    return { customers, revenue, ratio: roi.budget > 0 ? ((revenue - roi.budget) / roi.budget) * 100 : 0 };
  }, [roi]);
  const riskScore = Object.values(risk).reduce((sum, value) => sum + value, 0);
  const riskLabel = riskScore <= 5 ? "Yüksek risk" : riskScore <= 8 ? "Orta risk" : "Düşük risk";
  const upsells: Record<string, string[]> = {
    "Web sitesi": ["Google Maps optimizasyonu", "Google Ads yönetimi", "Aylık bakım paketi"],
    "Google Maps": ["Kurumsal web sitesi", "Yorum kazanım planı", "Yerel reklam kampanyası"],
    "Google Ads": ["Dönüşüm odaklı landing page", "Çağrı takibi", "Meta yeniden hedefleme"],
  };
  const copyText = async (key: string, value: string) => { await navigator.clipboard.writeText(value); setCopied(key); window.setTimeout(() => setCopied(""), 1500); };

  const meetingText = `${meeting.company || "[Firma]"} görüşme planı (${meeting.minutes} dk)\n1. Tanışma ve mevcut durum (5 dk)\n2. Ana hedef: ${meeting.goal} (8 dk)\n3. Fırsatlar ve önerilen çözüm (10 dk)\n4. Bütçe, zamanlama ve sonraki adım (7 dk)`;
  const briefText = `${brief.brand || "[Marka]"} kampanya özeti\nHedef kitle: ${brief.audience}\nTeklif/çağrı: ${brief.offer}\nAylık bütçe: ₺${brief.budget.toLocaleString("tr-TR")}\nAna hedef: Ölçülebilir talep ve nitelikli müşteri görüşmesi`;
  const personaText = `${persona.sector} sektörü için hedef profil: ${persona.age} yaş aralığında, karar verirken “${persona.priority}” arayan kişiler. Mesajlarda somut fayda, yerel güven ve kolay iletişim öne çıkarılmalı.`;
  const calendarItems = ["Pazartesi · Müşteri sorununa çözüm", "Salı · Öncesi/sonrası başarı örneği", "Çarşamba · Sık sorulan soru", "Perşembe · Ekip veya iş süreci", "Cuma · Kampanya ve güçlü çağrı", "Cumartesi · Müşteri yorumu", "Pazar · Haftalık kısa ipucu"];

  return <div className="space-y-6">
    <header><p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-300/80">Bayi büyüme merkezi</p><h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Premium satış araçları</h1><p className="mt-2 text-sm text-indigo-100/55">Satış görüşmesinden müşteri sadakatine kadar 10 pratik iş aracı.</p></header>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">{TOOLS.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setTool(item.id)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-black ${tool === item.id ? "bg-violet-500 text-white shadow-lg shadow-violet-950/30" : "border border-indigo-400/15 bg-indigo-500/5 text-indigo-100/60"}`}><Icon className="h-4 w-4 shrink-0" />{item.label}</button>; })}</div>

    {tool === "roi" ? <ToolCard title="1. Kampanya ROI hesaplayıcı"><div className="grid gap-3 sm:grid-cols-4"><NumberField label="Aylık bütçe" value={roi.budget} onChange={(budget) => setRoi({ ...roi, budget })} /><NumberField label="Beklenen talep" value={roi.lead} onChange={(lead) => setRoi({ ...roi, lead })} /><NumberField label="Satış oranı %" value={roi.close} onChange={(close) => setRoi({ ...roi, close })} /><NumberField label="Ort. satış tutarı" value={roi.sale} onChange={(sale) => setRoi({ ...roi, sale })} /></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Result label="Tahmini müşteri" value={roiResult.customers.toFixed(1)} /><Result label="Tahmini ciro" value={`₺${Math.round(roiResult.revenue).toLocaleString("tr-TR")}`} /><Result label="Tahmini ROI" value={`%${Math.round(roiResult.ratio)}`} /></div></ToolCard> : null}
    {tool === "package" ? <ToolCard title="2. Akıllı hizmet paketi önerisi"><div className="flex flex-wrap gap-2">{Object.entries(PACKAGES).map(([key, item]) => <button key={key} onClick={() => setGoal(key as keyof typeof PACKAGES)} className={`rounded-xl px-4 py-2 text-xs font-black ${goal === key ? "bg-emerald-500 text-white" : "bg-black/25 text-indigo-100/60"}`}>{item.name}</button>)}</div><div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5"><h3 className="text-xl font-black text-emerald-100">{PACKAGES[goal].name}</h3><p className="mt-2 text-sm text-indigo-50/75">{PACKAGES[goal].detail}</p><p className="mt-3 text-xs text-emerald-100/60">En uygun: {PACKAGES[goal].fit}</p></div></ToolCard> : null}
    {tool === "objection" ? <ToolCard title="3. Satış itirazı yanıtlama"><select value={objection} onChange={(e) => setObjection(e.target.value)} className={inputClass}><option value="expensive">“Fiyat pahalı”</option><option value="think">“Biraz düşüneyim”</option><option value="agency">“Başka firmayla çalışıyoruz”</option></select><CopyBox id="objection" value={OBJECTIONS[objection]} copied={copied} onCopy={copyText} /></ToolCard> : null}
    {tool === "meeting" ? <ToolCard title="4. Satış görüşmesi gündemi"><div className="grid gap-3 sm:grid-cols-3"><TextField label="Firma" value={meeting.company} onChange={(company) => setMeeting({ ...meeting, company })} /><TextField label="Ana hedef" value={meeting.goal} onChange={(goalValue) => setMeeting({ ...meeting, goal: goalValue })} /><NumberField label="Süre (dakika)" value={meeting.minutes} onChange={(minutes) => setMeeting({ ...meeting, minutes })} /></div><CopyBox id="meeting" value={meetingText} copied={copied} onCopy={copyText} /></ToolCard> : null}
    {tool === "brief" ? <ToolCard title="5. Kampanya brief oluşturucu"><div className="grid gap-3 sm:grid-cols-2"><TextField label="Marka" value={brief.brand} onChange={(brand) => setBrief({ ...brief, brand })} /><TextField label="Hedef kitle" value={brief.audience} onChange={(audience) => setBrief({ ...brief, audience })} /><TextField label="Teklif / çağrı" value={brief.offer} onChange={(offer) => setBrief({ ...brief, offer })} /><NumberField label="Aylık bütçe" value={brief.budget} onChange={(budget) => setBrief({ ...brief, budget })} /></div><CopyBox id="brief" value={briefText} copied={copied} onCopy={copyText} /></ToolCard> : null}
    {tool === "persona" ? <ToolCard title="6. Hedef müşteri profili"><div className="grid gap-3 sm:grid-cols-3"><TextField label="Sektör" value={persona.sector} onChange={(sector) => setPersona({ ...persona, sector })} /><TextField label="Yaş aralığı" value={persona.age} onChange={(age) => setPersona({ ...persona, age })} /><TextField label="Karar önceliği" value={persona.priority} onChange={(priority) => setPersona({ ...persona, priority })} /></div><CopyBox id="persona" value={personaText} copied={copied} onCopy={copyText} /></ToolCard> : null}
    {tool === "calendar" ? <ToolCard title="7. Haftalık sosyal medya planı"><div className="grid gap-2 sm:grid-cols-2">{calendarItems.map((item) => <div key={item} className="rounded-xl border border-indigo-400/15 bg-black/20 p-3 text-sm text-indigo-50/75">{item}</div>)}</div><button onClick={() => void copyText("calendar", calendarItems.join("\n"))} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-violet-400/25 px-3 py-2 text-xs font-black text-violet-100"><Copy className="h-3.5 w-3.5" />{copied === "calendar" ? "Kopyalandı" : "Planı kopyala"}</button></ToolCard> : null}
    {tool === "review" ? <ToolCard title="8. Google yorum yanıtı"><select value={review} onChange={(e) => setReview(e.target.value)} className={inputClass}><option value="positive">Olumlu yorum</option><option value="neutral">Orta / öneri içeren yorum</option><option value="negative">Olumsuz yorum</option></select><CopyBox id="review" value={REVIEW_REPLIES[review]} copied={copied} onCopy={copyText} /></ToolCard> : null}
    {tool === "risk" ? <ToolCard title="9. Müşteri kayıp riski"><div className="grid gap-3 sm:grid-cols-2">{([['contact','İletişim düzeni'],['results','Sonuç memnuniyeti'],['payment','Ödeme düzeni'],['satisfaction','Genel memnuniyet']] as const).map(([key, label]) => <Field key={key} label={`${label} · ${risk[key]}/3`}><input type="range" min="1" max="3" value={risk[key]} onChange={(e) => setRisk({ ...risk, [key]: Number(e.target.value) })} className="mt-3 w-full accent-violet-500" /></Field>)}</div><div className={`mt-5 rounded-xl p-4 text-lg font-black ${riskScore <= 5 ? "bg-rose-400/15 text-rose-100" : riskScore <= 8 ? "bg-amber-400/15 text-amber-100" : "bg-emerald-400/15 text-emerald-100"}`}>{riskLabel} · {riskScore}/12<p className="mt-1 text-xs font-normal opacity-70">Düşük puanlı müşterilerle 48 saat içinde sonuç odaklı görüşme planlayın.</p></div></ToolCard> : null}
    {tool === "upsell" ? <ToolCard title="10. Ek hizmet fırsatı"><select value={currentService} onChange={(e) => setCurrentService(e.target.value)} className={inputClass}>{Object.keys(upsells).map((service) => <option key={service}>{service}</option>)}</select><div className="mt-5 grid gap-3 sm:grid-cols-3">{upsells[currentService].map((item, index) => <article key={item} className="rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-4"><p className="text-[10px] font-black uppercase text-fuchsia-200/60">Fırsat {index + 1}</p><p className="mt-2 text-sm font-black text-fuchsia-50">{item}</p></article>)}</div></ToolCard> : null}
  </div>;
}

function ToolCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-5 sm:p-6"><h2 className="mb-5 text-lg font-black">{title}</h2>{children}</section>; }
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <Field label={label}><input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} /></Field>; }
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <Field label={label}><input type="number" min="0" value={value} onChange={(e) => onChange(Number(e.target.value))} className={inputClass} /></Field>; }
function Result({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-black/25 p-4"><p className="text-[10px] font-black uppercase text-violet-200/55">{label}</p><p className="mt-2 text-2xl font-black text-violet-100">{value}</p></div>; }
function CopyBox({ id, value, copied, onCopy }: { id: string; value: string; copied: string; onCopy: (id: string, value: string) => Promise<void> }) { return <div className="mt-5 rounded-xl bg-black/20 p-4"><p className="whitespace-pre-line text-sm leading-relaxed text-indigo-50/75">{value}</p><button onClick={() => void onCopy(id, value)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-violet-400/25 px-3 py-2 text-xs font-black text-violet-100"><Copy className="h-3.5 w-3.5" />{copied === id ? "Kopyalandı" : "Metni kopyala"}</button></div>; }
