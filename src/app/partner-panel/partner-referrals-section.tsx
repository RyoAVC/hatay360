import { Inbox } from "lucide-react";
import { EmptyRow } from "../components/empty-row";
import type { PartnerHubReferral } from "./partner-panel-types";
import { formatPartnerDate, formatTry } from "./partner-panel-format";

const STATUS_TONE: Record<PartnerHubReferral["status"], string> = {
  proposal: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  active: "border-emerald-400/35 bg-emerald-400/12 text-emerald-100",
  cancelled: "border-white/15 bg-white/5 text-white/50",
};

export function PartnerReferralsSection({ referrals }: { referrals: PartnerHubReferral[] }) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Referans listesi</p>
        <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Referans ettiğim müşteriler</h1>
        <p className="mt-2 text-[14px] text-indigo-100/55">Getirdiğiniz işletmeler ve komisyon durumları.</p>
      </header>

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
