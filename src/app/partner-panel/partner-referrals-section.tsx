import { FormEvent, useState } from "react";
import { Inbox, Send, UserPlus } from "lucide-react";
import { EmptyRow } from "../components/empty-row";
import { apiRequest } from "../lib/api";
import { OFFICIAL_HATAY_DISTRICTS } from "../lib/seo";
import type { PartnerHubReferral } from "./partner-panel-types";
import { formatPartnerDate, formatTry } from "./partner-panel-format";

const STATUS_TONE: Record<PartnerHubReferral["status"], string> = {
  proposal: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  active: "border-emerald-400/35 bg-emerald-400/12 text-emerald-100",
  cancelled: "border-white/15 bg-white/5 text-white/50",
};

const SERVICES = ["Web sitesi", "Google Ads", "Google Maps kaydı", "E-ticaret", "Meta reklam", "SEO / bakım"];

export function PartnerReferralsSection({ referrals, onRefresh }: { referrals: PartnerHubReferral[]; onRefresh: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: SERVICES[0], sector: "", district: "", notes: "" });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      await apiRequest("/api/partners/referrals", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", phone: "", email: "", service: SERVICES[0], sector: "", district: "", notes: "" });
      setNotice("Müşteri fırsatı yönetime iletildi.");
      await onRefresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Müşteri eklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Referans listesi</p>
        <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Referans ettiğim müşteriler</h1>
        <p className="mt-2 text-[14px] text-indigo-100/55">Getirdiğiniz işletmeler ve komisyon durumları.</p>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-[12px] font-black text-white shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:bg-indigo-400">
          <UserPlus className="h-4 w-4" /> {open ? "Formu kapat" : "Yeni müşteri ekle"}
        </button>
      </header>

      {open ? (
        <form onSubmit={submit} className="rounded-2xl border border-indigo-400/20 bg-[#15122f]/80 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-[11px] font-bold text-indigo-100/60">Firma / müşteri adı *<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white" /></label>
            <label className="text-[11px] font-bold text-indigo-100/60">Telefon *<input required inputMode="tel" placeholder="05xx xxx xx xx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white" /></label>
            <label className="text-[11px] font-bold text-indigo-100/60">E-posta<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white" /></label>
            <label className="text-[11px] font-bold text-indigo-100/60">Hizmet<select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-[#12102a] px-3 py-2.5 text-sm text-white">{SERVICES.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-[11px] font-bold text-indigo-100/60">İlçe<select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-[#12102a] px-3 py-2.5 text-sm text-white"><option value="">Seçin</option>{OFFICIAL_HATAY_DISTRICTS.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-[11px] font-bold text-indigo-100/60">Sektör<input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Örn. Klinik" className="mt-1.5 w-full rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white" /></label>
          </div>
          <label className="mt-3 block text-[11px] font-bold text-indigo-100/60">Satış notu<textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5 w-full resize-none rounded-xl border border-indigo-400/20 bg-black/25 px-3 py-2.5 text-sm text-white" /></label>
          <div className="mt-4 flex flex-wrap items-center gap-3"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-[12px] font-black text-white disabled:opacity-50"><Send className="h-4 w-4" /> {busy ? "Gönderiliyor…" : "Fırsatı yönetime gönder"}</button>{notice ? <p className="text-xs font-bold text-indigo-100/70">{notice}</p> : null}</div>
        </form>
      ) : null}

      {!referrals.length ? (
        <EmptyRow dark icon={Inbox} title="Henüz referans yok" hint="Pazarlama linkinizle ilk müşterinizi getirdiğinizde burada görünür." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-indigo-400/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-indigo-500/10 text-[11px] font-black uppercase tracking-wider text-indigo-200/60">
              <tr>
                <th className="px-4 py-3">İşletme</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Getirilme</th>
                <th className="px-4 py-3 text-right">Toplam komisyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-400/10 bg-[#12102a]/60">
              {referrals.map((row) => (
                <tr key={row.id} className="hover:bg-indigo-500/5">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-white">{row.companyName}</p>
                    <p className="mt-0.5 text-[11px] text-indigo-100/45">{row.service}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${STATUS_TONE[row.status]}`}>
                      {row.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-indigo-100/65">{formatPartnerDate(row.broughtAt)}</td>
                  <td className="px-4 py-3.5 text-right font-black text-indigo-50">{formatTry(row.totalCommission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
