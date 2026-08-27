import { Receipt } from "lucide-react";
import { EmptyRow } from "../components/empty-row";
import type { PartnerCommissionRow } from "./partner-panel-types";
import { formatPartnerDate, formatTry } from "./partner-panel-format";

export function PartnerCommissionsSection({ commissions }: { commissions: PartnerCommissionRow[] }) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Kazanç geçmişi</p>
        <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Komisyon & kazanç</h1>
        <p className="mt-2 text-[14px] text-indigo-100/55">Aktif müşterilerden elde edilen komisyon kayıtları.</p>
      </header>

      {!commissions.length ? (
        <EmptyRow dark icon={Receipt} title="Komisyon kaydı yok" hint="Aktif müşteri olduğunda komisyon satırları burada listelenir." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-indigo-400/15">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-indigo-500/10 text-[11px] font-black uppercase tracking-wider text-indigo-200/60">
              <tr>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">İşlem</th>
                <th className="px-4 py-3">Oran</th>
                <th className="px-4 py-3">Kazanç</th>
                <th className="px-4 py-3">Ödeme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-400/10 bg-[#12102a]/60">
              {commissions.map((row) => (
                <tr key={row.id} className="hover:bg-indigo-500/5">
                  <td className="px-4 py-3.5 text-indigo-100/65">{formatPartnerDate(row.date)}</td>
                  <td className="px-4 py-3.5 font-bold">{row.customerName}</td>
                  <td className="px-4 py-3.5">{formatTry(row.dealAmount)}</td>
                  <td className="px-4 py-3.5">%{row.commissionRate}</td>
                  <td className="px-4 py-3.5 font-black text-violet-100">{formatTry(row.earnings)}</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black text-amber-100">
                      Bekliyor
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
