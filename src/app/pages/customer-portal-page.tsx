import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BarChart3, CircleDollarSign, Download, ExternalLink, Globe2, HelpCircle, KeyRound, LayoutDashboard, LogOut, Megaphone, MessageSquareText, PlusCircle, RefreshCw, Search, Send, ShieldCheck, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";
import { SiteLogo } from "../components/site-logo";
import { FormError } from "../components/form-error";
import { useCustomerAuth, type CustomerIdentity } from "../context/customer-auth-context";
import { apiRequest } from "../lib/api";

type Campaign = { id: number; name: string; platform: "google" | "meta" | "other"; status: string; monthly_budget: number; management_fee: number; spend: number; impressions: number; clicks: number; leads: number; conversions: number; revenue: number; profit: number; roas: number; ctr: number };
type Ticket = { id: number; subject: string; message: string; status: string; priority: string; admin_reply: string; created_at: string };
type ServiceRequest = { id: number; service: string; details: string; status: string; created_at: string };
type DomainCheck = { id: number; domain: string; result: string; created_at: string };
type CampaignStat = { id: number; campaign_id: number; campaign_name: string; platform: string; period_start: string; period_end: string; spend: number; impressions: number; clicks: number; leads: number; conversions: number; revenue: number };
type Dashboard = { customer: CustomerIdentity; campaigns: Campaign[]; totals: { monthlyBudget: number; managementFee: number; spend: number; impressions: number; clicks: number; leads: number; conversions: number; revenue: number; profit: number; roas: number; ctr: number }; tickets: Ticket[]; serviceRequests: ServiceRequest[]; domainChecks: DomainCheck[]; stats: CampaignStat[] };
type PortalTab = "overview" | "campaigns" | "support" | "services" | "domain" | "security";

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(Number(value || 0));
const number = (value: number) => new Intl.NumberFormat("tr-TR").format(Number(value || 0));
const statusLabel: Record<string, string> = { active: "Aktif", paused: "Duraklatıldı", open: "Açık", answered: "Yanıtlandı", closed: "Kapalı", new: "Yeni", reviewing: "İnceleniyor", quoted: "Teklif hazır", approved: "Onaylandı", registered: "Kayıtlı", potentially_available: "Uygun olabilir", unknown: "Doğrulanamadı" };

export function CustomerPortalPage() {
  const { customer, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PortalTab>("overview");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState({ subject: "", message: "", priority: "normal" });
  const [request, setRequest] = useState({ service: "Google Ads yönetimi", details: "" });
  const [domain, setDomain] = useState("");
  const [brandName, setBrandName] = useState("");
  const [domainResult, setDomainResult] = useState<{ domain: string; result: string; note: string } | null>(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordNotice, setPasswordNotice] = useState("");

  const load = async () => {
    setError("");
    try { setDashboard(await apiRequest<Dashboard>("/api/customer/dashboard")); } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Panel verileri alınamadı."); }
  };
  useEffect(() => { void load(); }, []);

  const submitTicket = async (event: FormEvent) => { event.preventDefault(); setBusy(true); try { await apiRequest("/api/customer/tickets", { method: "POST", body: JSON.stringify(ticket) }); setTicket({ subject: "", message: "", priority: "normal" }); await load(); } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Mesaj gönderilemedi."); } finally { setBusy(false); } };
  const submitService = async (event: FormEvent) => { event.preventDefault(); setBusy(true); try { await apiRequest("/api/customer/service-requests", { method: "POST", body: JSON.stringify(request) }); setRequest((current) => ({ ...current, details: "" })); await load(); } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Talep gönderilemedi."); } finally { setBusy(false); } };
  const checkDomain = async (event: FormEvent) => { event.preventDefault(); setBusy(true); try { setDomainResult(await apiRequest(`/api/customer/domain-check?domain=${encodeURIComponent(domain)}`)); await load(); } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Domain sorgulanamadı."); } finally { setBusy(false); } };
  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordNotice("");
    setError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Yeni şifre ve tekrarı aynı olmalıdır.");
      return;
    }
    setBusy(true);
    try {
      const result = await apiRequest<{ message: string }>("/api/customer/password", { method: "POST", body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }) });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordNotice(result.message || "Şifreniz güncellendi.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Şifre güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const maxSpend = useMemo(() => Math.max(1, ...(dashboard?.campaigns.map((item) => Number(item.spend)) || [1])), [dashboard]);
  const historyMax = useMemo(() => Math.max(1, ...(dashboard?.stats.flatMap((item) => [Number(item.spend), Number(item.revenue)]) || [1])), [dashboard]);
  const domainSuggestions = useMemo(() => {
    const base = brandName
      .toLocaleLowerCase("tr-TR")
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 40);
    return base ? [`${base}.com`, `${base}.com.tr`, `${base}hatay.com`] : [];
  }, [brandName]);
  if (!dashboard) return <div className="flex min-h-screen items-center justify-center bg-[#071b22] text-sm font-bold text-white/70">{error || "Müşteri paneli hazırlanıyor…"}</div>;

  const downloadReport = () => {
    const quote = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Firma", "Kampanya", "Platform", "Dönem Başlangıç", "Dönem Bitiş", "Harcama", "Gelir", "Gösterim", "Tıklama", "Lead", "Dönüşüm"],
      ...dashboard.stats.map((item) => [dashboard.customer.company_name, item.campaign_name, item.platform, item.period_start, item.period_end, item.spend, item.revenue, item.impressions, item.clicks, item.leads, item.conversions]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(quote).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${dashboard.customer.company_name.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9]+/g, "-") || "hatay360"}-reklam-raporu.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  const nav = [
    { id: "overview" as const, label: "Genel Bakış", icon: LayoutDashboard },
    { id: "campaigns" as const, label: "Reklamlarım", icon: Megaphone },
    { id: "support" as const, label: "Yardım & Sorular", icon: HelpCircle },
    { id: "services" as const, label: "Yeni Hizmet", icon: PlusCircle },
    { id: "domain" as const, label: "Domain Sorgula", icon: Globe2 },
    { id: "security" as const, label: "Şifre & Güvenlik", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#f3f7f8] text-[#102b35] lg:grid lg:grid-cols-[245px_1fr]">
      <aside className="border-b border-white/10 bg-[#071b22] p-5 text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <SiteLogo variant="onDark" preview={{ logoDarkHeight: 38 }} />
        <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#70dce9]">Müşteri hesabı</p><p className="mt-2 text-[14px] font-black">{customer?.company_name}</p><p className="mt-1 truncate text-[10px] text-white/45">{customer?.email}</p></div>
        <nav className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-1">{nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[11px] font-black transition ${activeTab === id ? "bg-[#00a8c4] text-white" : "text-white/60 hover:bg-white/7 hover:text-white"}`}><Icon className="h-4 w-4" />{label}</button>)}</nav>
        <button onClick={async () => { await logout(); navigate("/musteri/giris", { replace: true }); }} className="mt-5 flex items-center gap-2 text-[10px] font-black text-white/45 hover:text-white"><LogOut className="h-4 w-4" /> Güvenli çıkış</button>
      </aside>

      <main className="min-w-0 p-4 sm:p-7 lg:p-9">
        <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00a8c4]">Hatay360 reklam kontrol merkezi</p><h1 className="mt-2 text-[28px] font-black tracking-[-0.04em]">Merhaba, {dashboard.customer.contact_name}</h1><p className="mt-1 text-[11px] text-[#6c7c84]">Bütçenizi, reklam sonuçlarınızı ve taleplerinizi tek ekrandan izleyin.</p></div><div className="flex gap-2"><button onClick={downloadReport} disabled={!dashboard.stats.length} className="inline-flex items-center gap-2 rounded-xl border border-[#bfe1e6] bg-[#edf9fa] px-3 py-2 text-[10px] font-black text-[#007f98] disabled:cursor-not-allowed disabled:opacity-45"><Download className="h-3.5 w-3.5" /> CSV raporu</button><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-[#d7e4e7] bg-white px-3 py-2 text-[10px] font-black text-[#49616b]"><RefreshCw className="h-3.5 w-3.5" /> Yenile</button></div></header>
        {error && <div className="mt-5"><FormError>{error}</FormError></div>}

        {(activeTab === "overview" || activeTab === "campaigns") && <>
          <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
            { label: "Aylık reklam bütçesi", value: money(dashboard.totals.monthlyBudget), icon: CircleDollarSign, tone: "#00a8c4" },
            { label: "Toplam harcama", value: money(dashboard.totals.spend), icon: BarChart3, tone: "#6366f1" },
            { label: "Ölçülen gelir", value: money(dashboard.totals.revenue), icon: TrendingUp, tone: "#10b981" },
            { label: "Net sonuç", value: money(dashboard.totals.profit), icon: CircleDollarSign, tone: dashboard.totals.profit >= 0 ? "#10b981" : "#ef4444" },
          ].map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-[#dce7e9] bg-white p-4 shadow-[0_8px_25px_rgba(15,23,42,0.04)]"><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${tone}15`, color: tone }}><Icon className="h-4 w-4" /></span><p className="mt-4 text-[9px] font-black uppercase tracking-wide text-[#84939a]">{label}</p><p className="mt-1 text-[22px] font-black">{value}</p></article>)}</section>
          <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[
            ["Gösterim", number(dashboard.totals.impressions)], ["Tıklama", number(dashboard.totals.clicks)], ["Potansiyel müşteri", number(dashboard.totals.leads)], ["Dönüşüm", number(dashboard.totals.conversions)], ["ROAS", `${dashboard.totals.roas.toFixed(2)}x`],
          ].map(([label, value]) => <div key={label} className="rounded-xl border border-[#dfe8ea] bg-[#f9fbfb] px-4 py-3"><p className="text-[9px] font-bold text-[#829097]">{label}</p><p className="mt-1 text-[17px] font-black">{value}</p></div>)}</section>
          <section className="mt-7"><div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Kampanya performansı</p><h2 className="mt-1 text-[21px] font-black">Google ve Meta reklamları</h2></div><span className="text-[9px] font-bold text-[#87969c]">Yönetim ücreti net sonuç hesabına dahildir</span></div><div className="mt-4 grid gap-4 xl:grid-cols-2">{dashboard.campaigns.length ? dashboard.campaigns.map((campaign) => <article key={campaign.id} className="rounded-[22px] border border-[#dce7e9] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase ${campaign.platform === "google" ? "bg-blue-50 text-blue-700" : campaign.platform === "meta" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>{campaign.platform}</span><h3 className="mt-3 text-[17px] font-black">{campaign.name}</h3></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black text-emerald-700">{statusLabel[campaign.status] || campaign.status}</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf2f3]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#00a8c4,#10b981)]" style={{ width: `${Math.max(3, (Number(campaign.spend) / maxSpend) * 100)}%` }} /></div><div className="mt-4 grid grid-cols-3 gap-2">{[["Harcama", money(campaign.spend)], ["Gelir", money(campaign.revenue)], ["ROAS", `${Number(campaign.roas).toFixed(2)}x`], ["Tıklama", number(campaign.clicks)], ["Lead", number(campaign.leads)], ["Net", money(campaign.profit)]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#f6f9fa] p-3"><p className="text-[8px] font-bold text-[#87969c]">{label}</p><p className="mt-1 text-[12px] font-black">{value}</p></div>)}</div></article>) : <div className="rounded-2xl border border-dashed border-[#cbdadd] bg-white p-10 text-center text-[12px] text-[#75858c]">Henüz hesabınıza kampanya eklenmedi.</div>}</div></section>
          {dashboard.stats.length > 0 && <section className="mt-7 rounded-[22px] border border-[#dce7e9] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Aylık gelişim</p><h2 className="mt-1 text-[20px] font-black">Harcama ve ölçülen gelir geçmişi</h2></div><div className="flex gap-3 text-[8px] font-black"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#00a8c4]" /> Harcama</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#10b981]" /> Gelir</span></div></div><div className="mt-6 flex min-h-[190px] items-end gap-3 overflow-x-auto pb-2">{dashboard.stats.map((item) => <div key={item.id} className="flex min-w-[76px] flex-1 flex-col items-center"><div className="flex h-[145px] items-end gap-1.5"><span role="img" aria-label={`Harcama: ${money(item.spend)}`} title={`Harcama: ${money(item.spend)}`} className="w-5 rounded-t-md bg-[#00a8c4]" style={{ height: `${Math.max(4, (Number(item.spend) / historyMax) * 100)}%` }} /><span role="img" aria-label={`Gelir: ${money(item.revenue)}`} title={`Gelir: ${money(item.revenue)}`} className="w-5 rounded-t-md bg-[#10b981]" style={{ height: `${Math.max(4, (Number(item.revenue) / historyMax) * 100)}%` }} /></div><p className="mt-2 text-[8px] font-black text-[#4e6570]">{new Date(`${item.period_start}T00:00:00`).toLocaleDateString("tr-TR", { month: "short", year: "2-digit" })}</p><p className="mt-0.5 max-w-[76px] truncate text-[7px] text-[#93a0a6]">{item.campaign_name}</p></div>)}</div></section>}
        </>}

        {activeTab === "support" && <section className="mt-7 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]"><form onSubmit={submitTicket} className="rounded-[22px] border border-[#dce7e9] bg-white p-5"><MessageSquareText className="h-5 w-5 text-[#00a8c4]" /><h2 className="mt-4 text-[20px] font-black">Yardım veya soru gönder</h2><input required value={ticket.subject} onChange={(event) => setTicket({ ...ticket, subject: event.target.value })} placeholder="Konu" className="mt-5 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] outline-none focus:border-[#00a8c4]" /><select value={ticket.priority} onChange={(event) => setTicket({ ...ticket, priority: event.target.value })} className="mt-3 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px]"><option value="normal">Normal</option><option value="urgent">Acil</option></select><textarea required rows={6} value={ticket.message} onChange={(event) => setTicket({ ...ticket, message: event.target.value })} placeholder="Sorunuzu veya isteğinizi açıklayın" className="mt-3 w-full rounded-xl border border-[#dbe5e8] p-3 text-[12px] outline-none focus:border-[#00a8c4]" /><button disabled={busy} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#008fac] px-4 py-3 text-[11px] font-black text-white"><Send className="h-4 w-4" /> Gönder</button></form><div className="space-y-3">{dashboard.tickets.map((item) => <article key={item.id} className="rounded-2xl border border-[#dce7e9] bg-white p-4"><div className="flex justify-between gap-3"><h3 className="text-[13px] font-black">{item.subject}</h3><span className="text-[8px] font-black text-[#008fac]">{statusLabel[item.status] || item.status}</span></div><p className="mt-2 text-[11px] leading-relaxed text-[#64767e]">{item.message}</p>{item.admin_reply && <div className="mt-3 rounded-xl border-l-2 border-[#00a8c4] bg-[#f1fafb] p-3"><p className="text-[8px] font-black uppercase text-[#008fac]">Hatay360 yanıtı</p><p className="mt-1 text-[11px] text-[#405963]">{item.admin_reply}</p></div>}</article>)}</div></section>}

        {activeTab === "services" && <section className="mt-7 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]"><form onSubmit={submitService} className="rounded-[22px] border border-[#dce7e9] bg-white p-5"><PlusCircle className="h-5 w-5 text-[#00a8c4]" /><h2 className="mt-4 text-[20px] font-black">Yeni hizmet isteyin</h2><select value={request.service} onChange={(event) => setRequest({ ...request, service: event.target.value })} className="mt-5 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px]">{["Google Ads yönetimi", "Meta reklam yönetimi", "Google Maps SEO", "Web sitesi", "E-ticaret", "Özel yazılım", "Diğer"].map((service) => <option key={service}>{service}</option>)}</select><textarea required rows={6} value={request.details} onChange={(event) => setRequest({ ...request, details: event.target.value })} placeholder="İhtiyacınızı ve hedefinizi anlatın" className="mt-3 w-full rounded-xl border border-[#dbe5e8] p-3 text-[12px] outline-none focus:border-[#00a8c4]" /><button disabled={busy} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#008fac] px-4 py-3 text-[11px] font-black text-white"><Send className="h-4 w-4" /> Talep oluştur</button></form><div className="space-y-3">{dashboard.serviceRequests.map((item) => <article key={item.id} className="rounded-2xl border border-[#dce7e9] bg-white p-4"><div className="flex justify-between gap-3"><h3 className="text-[13px] font-black">{item.service}</h3><span className="text-[8px] font-black text-[#008fac]">{statusLabel[item.status] || item.status}</span></div><p className="mt-2 text-[11px] leading-relaxed text-[#64767e]">{item.details}</p></article>)}</div></section>}

        {activeTab === "domain" && <section className="mt-7 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"><div className="rounded-[24px] bg-[#071b22] p-6 text-white"><Globe2 className="h-6 w-6 text-[#70dce9]" /><h2 className="mt-5 text-[24px] font-black">Firma adınıza uygun domaini kontrol edin.</h2><p className="mt-3 text-[12px] leading-relaxed text-white/55">Önce firma adından temiz alan adı seçenekleri üretir, ardından DNS kaydını kontrol ederiz. Kesin satın alınabilirlik kayıt kuruluşunda doğrulanır.</p><label className="mt-5 block text-[9px] font-black uppercase tracking-wide text-white/50">Firma / marka adı<input value={brandName} onChange={(event) => setBrandName(event.target.value)} placeholder="Örnek: A Firması" className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-[12px] text-white outline-none" /></label>{domainSuggestions.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{domainSuggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => setDomain(suggestion)} className="rounded-full border border-[#70dce9]/25 bg-[#70dce9]/10 px-3 py-1.5 text-[9px] font-black text-[#8ceaf3]">{suggestion}</button>)}</div>}<form onSubmit={checkDomain} className="mt-4 flex gap-2"><input required value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="firmam.com" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-[12px] text-white outline-none" /><button disabled={busy} className="rounded-xl bg-[#00a8c4] px-4 text-white"><Search className="h-4 w-4" /></button></form>{domainResult && <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-[13px] font-black">{domainResult.domain}</p><p className="mt-1 text-[11px] font-black text-[#70dce9]">{statusLabel[domainResult.result] || domainResult.result}</p><p className="mt-2 text-[9px] text-white/45">{domainResult.note}</p></div>}</div><div className="rounded-[24px] border border-[#dce7e9] bg-white p-5"><h3 className="text-[17px] font-black">Son sorgular</h3><div className="mt-4 space-y-2">{dashboard.domainChecks.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#f5f8f9] px-3 py-3"><span className="text-[11px] font-black">{item.domain}</span><span className="text-[8px] font-black text-[#008fac]">{statusLabel[item.result] || item.result}</span></div>)}</div></div></section>}

        {activeTab === "security" && <section className="mt-7 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"><form onSubmit={changePassword} className="rounded-[24px] border border-[#dce7e9] bg-white p-6 shadow-sm"><KeyRound className="h-6 w-6 text-[#00a8c4]" /><p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Hesap güvenliği</p><h2 className="mt-1 text-[24px] font-black">Şifrenizi yenileyin</h2><p className="mt-2 text-[11px] leading-relaxed text-[#718188]">En az 10 karakterli, başka hesaplarda kullanmadığınız bir şifre seçin.</p><div className="mt-5 grid gap-3"><label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">Mevcut şifre<input required type="password" autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-3 text-[12px] normal-case tracking-normal outline-none focus:border-[#00a8c4]" /></label><label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">Yeni şifre<input required minLength={10} maxLength={128} type="password" autoComplete="new-password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-3 text-[12px] normal-case tracking-normal outline-none focus:border-[#00a8c4]" /></label><label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">Yeni şifre tekrar<input required minLength={10} maxLength={128} type="password" autoComplete="new-password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-3 text-[12px] normal-case tracking-normal outline-none focus:border-[#00a8c4]" /></label></div>{passwordNotice && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-700">{passwordNotice}</p>}<button disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#008fac] px-4 py-3 text-[11px] font-black text-white disabled:opacity-50"><ShieldCheck className="h-4 w-4" /> {busy ? "Güncelleniyor…" : "Şifreyi güncelle"}</button></form><div className="rounded-[24px] bg-[#071b22] p-6 text-white"><ShieldCheck className="h-7 w-7 text-[#70dce9]" /><h3 className="mt-5 text-[23px] font-black">Hesabınız AVC güvenlik katmanıyla korunur.</h3><div className="mt-5 space-y-3 text-[11px] leading-relaxed text-white/60"><p className="rounded-xl border border-white/10 bg-white/5 p-4">Şifreler geri okunamaz şekilde güvenli özet olarak saklanır.</p><p className="rounded-xl border border-white/10 bg-white/5 p-4">Şifre değiştiğinde diğer açık müşteri oturumları otomatik kapatılır.</p><p className="rounded-xl border border-white/10 bg-white/5 p-4">Admin ve müşteri oturumları birbirinden tamamen ayrıdır.</p></div></div></section>}

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#dce6e8] pt-5 text-[9px] font-bold text-[#8a989e]"><span>AVC Güvencesi · Hatay360 müşteri verileri hesap bazında ayrılır.</span><a href="https://hub.avcieticaret.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#008fac]">Ekosistemi doğrula <ExternalLink className="h-3 w-3" /></a></footer>
      </main>
    </div>
  );
}
