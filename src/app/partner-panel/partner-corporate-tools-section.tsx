import { useMemo, useState, type ReactNode } from "react";
import { BarChart3, CalendarCheck, ClipboardPen, Copy, FileBarChart, GitBranch, HandCoins, Mail, Megaphone, Repeat2, Target, UsersRound } from "lucide-react";

type Tool = "email" | "whatsapp" | "funnel" | "breakEven" | "competitor" | "report" | "onboarding" | "renewal" | "referral" | "kpi";
const TOOLS = [
  { id: "email" as const, label: "Teklif e-postası", icon: Mail },
  { id: "whatsapp" as const, label: "WhatsApp kampanya", icon: Megaphone },
  { id: "funnel" as const, label: "Satış hunisi", icon: GitBranch },
  { id: "breakEven" as const, label: "Başabaş hesabı", icon: HandCoins },
  { id: "competitor" as const, label: "Rakip analizi", icon: UsersRound },
  { id: "report" as const, label: "Aylık rapor", icon: FileBarChart },
  { id: "onboarding" as const, label: "Müşteri başlangıcı", icon: CalendarCheck },
  { id: "renewal" as const, label: "Yenileme planı", icon: Repeat2 },
  { id: "referral" as const, label: "Referans kampanyası", icon: ClipboardPen },
  { id: "kpi" as const, label: "Hedef panosu", icon: Target },
];
const inputClass = "mt-1.5 w-full rounded-xl border border-sky-400/20 bg-black/25 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-300/50";

export function PartnerCorporateToolsSection() {
  const [tool, setTool] = useState<Tool>("email");
  const [copied, setCopied] = useState("");
  const [email, setEmail] = useState({ customer: "", service: "Kurumsal web sitesi", date: "" });
  const [campaign, setCampaign] = useState({ business: "", offer: "%10 tanışma avantajı", deadline: "bu hafta" });
  const [funnel, setFunnel] = useState({ leads: 100, meetings: 35, offers: 20, sales: 8 });
  const [economy, setEconomy] = useState({ fixed: 30000, unitCost: 1500, price: 6000 });
  const [competitor, setCompetitor] = useState({ name: "", web: 2, maps: 2, ads: 1, social: 2 });
  const [report, setReport] = useState({ customer: "", visits: 1200, leads: 45, sales: 8 });
  const [onboarding, setOnboarding] = useState([false, false, false, false, false, false]);
  const [renewal, setRenewal] = useState({ customer: "", days: 30, service: "Yıllık web bakım" });
  const [referral, setReferral] = useState({ reward: "₺1.000 hizmet kredisi", customer: "" });
  const [kpi, setKpi] = useState({ leadTarget: 60, leadNow: 24, salesTarget: 12, salesNow: 5, revenueTarget: 120000, revenueNow: 48000 });

  const emailText = `Konu: ${email.service} teklifiniz\n\nMerhaba ${email.customer || "[Müşteri adı]"},\nGörüşmemiz doğrultusunda hazırladığımız ${email.service} teklifini bilgilerinize sunuyoruz. Kapsam, teslim adımları ve yatırım planı teklif içinde açıkça belirtilmiştir.${email.date ? ` ${email.date} tarihinde kısa bir değerlendirme görüşmesi yapabiliriz.` : ""}\n\nSaygılarımızla`;
  const campaignText = `Merhaba, ${campaign.business || "[Firma]"} için hazırladığımız ${campaign.offer} fırsatı ${campaign.deadline} geçerli. Dijital görünürlüğünüzü ve müşteri taleplerinizi artıracak çözümü incelemek için kısa bir görüşme planlayabiliriz. İlgileniyorsanız “BİLGİ” yazmanız yeterli.`;
  const reportText = `${report.customer || "[Müşteri]"} aylık performans özeti\n• Site ziyareti: ${report.visits.toLocaleString("tr-TR")}\n• Yeni talep: ${report.leads}\n• Satış: ${report.sales}\n• Ziyaretten talebe dönüşüm: %${report.visits ? (report.leads / report.visits * 100).toFixed(1) : "0"}\n• Talep başına satış: %${report.leads ? (report.sales / report.leads * 100).toFixed(1) : "0"}`;
  const renewalText = `Merhaba ${renewal.customer || "[Müşteri adı]"}, ${renewal.service} hizmetinizin yenilenmesine ${renewal.days} gün kaldı. Kesintisiz hizmet ve güncel altyapı için yenileme kapsamını birlikte netleştirebiliriz.`;
  const referralText = `Merhaba ${referral.customer || "[Müşteri adı]"}, bizi çevrenizde dijital desteğe ihtiyaç duyan bir işletmeye önerdiğinizde ve proje başladığında size ${referral.reward} tanımlıyoruz. Güveniniz için teşekkür ederiz.`;
  const breakEven = economy.price > economy.unitCost ? Math.ceil(economy.fixed / (economy.price - economy.unitCost)) : 0;
  const funnelRates = useMemo(() => ({ meeting: funnel.leads ? funnel.meetings / funnel.leads * 100 : 0, offer: funnel.meetings ? funnel.offers / funnel.meetings * 100 : 0, sale: funnel.offers ? funnel.sales / funnel.offers * 100 : 0 }), [funnel]);
  const competitorScore = competitor.web + competitor.maps + competitor.ads + competitor.social;
  const kpiRows = [
    { label: "Talep", now: kpi.leadNow, target: kpi.leadTarget },
    { label: "Satış", now: kpi.salesNow, target: kpi.salesTarget },
    { label: "Ciro", now: kpi.revenueNow, target: kpi.revenueTarget },
  ];
  const copy = async (id: string, text: string) => { await navigator.clipboard.writeText(text); setCopied(id); window.setTimeout(() => setCopied(""), 1500); };
  const checks = ["Yetkili ve iletişim bilgileri alındı", "Marka dosyaları teslim alındı", "Hedef ve kapsam onaylandı", "Ödeme planı netleşti", "İlk teslim tarihi belirlendi", "İletişim kanalı oluşturuldu"];

  return <div className="space-y-6">
    <header><p className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-300/80">Kurumsal bayi yönetimi</p><h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Kurumsal iş araçları</h1><p className="mt-2 text-sm text-indigo-100/55">Daha düzenli satış, raporlama ve müşteri yenileme için 10 profesyonel araç.</p></header>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">{TOOLS.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setTool(item.id)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-black ${tool === item.id ? "bg-sky-500 text-white shadow-lg shadow-sky-950/30" : "border border-sky-400/15 bg-sky-500/5 text-sky-100/60"}`}><Icon className="h-4 w-4 shrink-0" />{item.label}</button>; })}</div>

    {tool === "email" ? <Card title="1. Kurumsal teklif e-postası"><Grid><Text label="Müşteri" value={email.customer} onChange={(customer) => setEmail({ ...email, customer })} /><Text label="Hizmet" value={email.service} onChange={(service) => setEmail({ ...email, service })} /><Text label="Görüşme tarihi" value={email.date} onChange={(date) => setEmail({ ...email, date })} /></Grid><CopyBox id="email" text={emailText} copied={copied} copy={copy} /></Card> : null}
    {tool === "whatsapp" ? <Card title="2. WhatsApp kampanya mesajı"><Grid><Text label="Firma" value={campaign.business} onChange={(business) => setCampaign({ ...campaign, business })} /><Text label="Avantaj" value={campaign.offer} onChange={(offer) => setCampaign({ ...campaign, offer })} /><Text label="Son tarih" value={campaign.deadline} onChange={(deadline) => setCampaign({ ...campaign, deadline })} /></Grid><CopyBox id="campaign" text={campaignText} copied={copied} copy={copy} /></Card> : null}
    {tool === "funnel" ? <Card title="3. Satış hunisi dönüşüm analizi"><Grid><Num label="Gelen talep" value={funnel.leads} onChange={(leads) => setFunnel({ ...funnel, leads })} /><Num label="Görüşme" value={funnel.meetings} onChange={(meetings) => setFunnel({ ...funnel, meetings })} /><Num label="Teklif" value={funnel.offers} onChange={(offers) => setFunnel({ ...funnel, offers })} /><Num label="Satış" value={funnel.sales} onChange={(sales) => setFunnel({ ...funnel, sales })} /></Grid><div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label="Talep → görüşme" value={`%${funnelRates.meeting.toFixed(1)}`} /><Metric label="Görüşme → teklif" value={`%${funnelRates.offer.toFixed(1)}`} /><Metric label="Teklif → satış" value={`%${funnelRates.sale.toFixed(1)}`} /></div></Card> : null}
    {tool === "breakEven" ? <Card title="4. Başabaş satış hesabı"><Grid><Num label="Aylık sabit gider" value={economy.fixed} onChange={(fixed) => setEconomy({ ...economy, fixed })} /><Num label="Satış başı maliyet" value={economy.unitCost} onChange={(unitCost) => setEconomy({ ...economy, unitCost })} /><Num label="Satış fiyatı" value={economy.price} onChange={(price) => setEconomy({ ...economy, price })} /></Grid><div className="mt-5 rounded-xl bg-emerald-400/10 p-5"><p className="text-xs font-black uppercase text-emerald-200/60">Başabaş noktası</p><p className="mt-2 text-3xl font-black text-emerald-100">{breakEven || "—"} satış / ay</p></div></Card> : null}
    {tool === "competitor" ? <Card title="5. Hızlı rakip analizi"><Text label="Rakip firma" value={competitor.name} onChange={(name) => setCompetitor({ ...competitor, name })} /><div className="mt-5 grid gap-4 sm:grid-cols-2">{([['web','Web sitesi'],['maps','Google Maps'],['ads','Reklam görünürlüğü'],['social','Sosyal medya']] as const).map(([key, label]) => <label key={key} className="text-xs font-bold text-sky-100/60">{label} · {competitor[key]}/3<input type="range" min="1" max="3" value={competitor[key]} onChange={(e) => setCompetitor({ ...competitor, [key]: Number(e.target.value) })} className="mt-3 w-full accent-sky-500" /></label>)}</div><div className="mt-5 rounded-xl bg-black/20 p-4 text-lg font-black text-sky-100">{competitor.name || "Rakip"} dijital güç skoru: {competitorScore}/12</div></Card> : null}
    {tool === "report" ? <Card title="6. Aylık müşteri performans raporu"><Grid><Text label="Müşteri" value={report.customer} onChange={(customer) => setReport({ ...report, customer })} /><Num label="Ziyaret" value={report.visits} onChange={(visits) => setReport({ ...report, visits })} /><Num label="Talep" value={report.leads} onChange={(leads) => setReport({ ...report, leads })} /><Num label="Satış" value={report.sales} onChange={(sales) => setReport({ ...report, sales })} /></Grid><CopyBox id="report" text={reportText} copied={copied} copy={copy} /></Card> : null}
    {tool === "onboarding" ? <Card title="7. Yeni müşteri başlangıç kontrolü"><div className="space-y-2">{checks.map((item, index) => <label key={item} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${onboarding[index] ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : "border-sky-400/15 bg-black/15 text-sky-100/70"}`}><input type="checkbox" checked={onboarding[index]} onChange={(e) => setOnboarding(onboarding.map((value, i) => i === index ? e.target.checked : value))} />{item}</label>)}</div><p className="mt-4 text-xs font-black text-sky-200">Tamamlanma: %{Math.round(onboarding.filter(Boolean).length / checks.length * 100)}</p></Card> : null}
    {tool === "renewal" ? <Card title="8. Hizmet yenileme hatırlatıcısı"><Grid><Text label="Müşteri" value={renewal.customer} onChange={(customer) => setRenewal({ ...renewal, customer })} /><Text label="Hizmet" value={renewal.service} onChange={(service) => setRenewal({ ...renewal, service })} /><Num label="Kalan gün" value={renewal.days} onChange={(days) => setRenewal({ ...renewal, days })} /></Grid><CopyBox id="renewal" text={renewalText} copied={copied} copy={copy} /></Card> : null}
    {tool === "referral" ? <Card title="9. Müşteri referans kampanyası"><Grid><Text label="Müşteri" value={referral.customer} onChange={(customer) => setReferral({ ...referral, customer })} /><Text label="Referans ödülü" value={referral.reward} onChange={(reward) => setReferral({ ...referral, reward })} /></Grid><CopyBox id="referral" text={referralText} copied={copied} copy={copy} /></Card> : null}
    {tool === "kpi" ? <Card title="10. Aylık hedef panosu"><div className="grid gap-3">{kpiRows.map((row) => { const progress = row.target ? Math.min(100, row.now / row.target * 100) : 0; return <article key={row.label} className="rounded-xl bg-black/20 p-4"><div className="flex justify-between text-sm"><b>{row.label}</b><span>{row.now.toLocaleString("tr-TR")} / {row.target.toLocaleString("tr-TR")}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-500" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-[10px] text-sky-100/50">%{Math.round(progress)} tamamlandı</p></article>; })}</div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Num label="Talep hedefi / mevcut" value={kpi.leadNow} onChange={(leadNow) => setKpi({ ...kpi, leadNow })} /><Num label="Satış hedefi / mevcut" value={kpi.salesNow} onChange={(salesNow) => setKpi({ ...kpi, salesNow })} /><Num label="Ciro hedefi / mevcut" value={kpi.revenueNow} onChange={(revenueNow) => setKpi({ ...kpi, revenueNow })} /></div></Card> : null}
  </div>;
}

function Card({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-5 sm:p-6"><h2 className="mb-5 text-lg font-black">{title}</h2>{children}</section>; }
function Grid({ children }: { children: ReactNode }) { return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-xs font-bold text-sky-100/60">{label}{children}</label>; }
function Text({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <Field label={label}><input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} /></Field>; }
function Num({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <Field label={label}><input type="number" min="0" value={value} onChange={(e) => onChange(Number(e.target.value))} className={inputClass} /></Field>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-black/20 p-4"><p className="text-[10px] font-black uppercase text-sky-200/50">{label}</p><p className="mt-2 text-2xl font-black text-sky-100">{value}</p></div>; }
function CopyBox({ id, text, copied, copy }: { id: string; text: string; copied: string; copy: (id: string, text: string) => Promise<void> }) { return <div className="mt-5 rounded-xl bg-black/20 p-4"><p className="whitespace-pre-line text-sm leading-relaxed text-indigo-50/75">{text}</p><button onClick={() => void copy(id, text)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-sky-400/25 px-3 py-2 text-xs font-black text-sky-100"><Copy className="h-3.5 w-3.5" />{copied === id ? "Kopyalandı" : "Metni kopyala"}</button></div>; }
