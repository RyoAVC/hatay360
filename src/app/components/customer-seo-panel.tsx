import { ArrowDown, ArrowUp, Minus, Search, TrendingUp } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { SEO_RANK_WAIT_MESSAGE, hasSeoSnapshot, seoDeltaTone, type SeoKeywordRow, type SeoPayload } from "../lib/seo-rank";

function formatChecked(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short" }).format(date);
}

function RankCell({ row }: { row: SeoKeywordRow }) {
  if (!hasSeoSnapshot(row) || row.position == null) {
    return <span className="text-[#93a0a6]">—</span>;
  }
  const tone = seoDeltaTone(row.delta);
  return (
    <span className="inline-flex items-center gap-1.5 font-black tabular-nums">
      {row.position}
      {tone === "up" ? <ArrowUp className="h-3.5 w-3.5 text-emerald-600" aria-label="yükseldi" /> : null}
      {tone === "down" ? <ArrowDown className="h-3.5 w-3.5 text-rose-500" aria-label="düştü" /> : null}
      {tone === "neutral" && row.delta === 0 ? <Minus className="h-3.5 w-3.5 text-[#93a0a6]" aria-hidden="true" /> : null}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const safe = Math.min(100, Math.max(0, Math.round(score)));
  const deg = safe * 3.6;
  return (
    <div className="relative mx-auto h-28 w-28 sm:mx-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(#00a8c4 ${deg}deg, #e2ecee ${deg}deg)` }}
        aria-hidden="true"
      />
      <div className="absolute inset-[6px] flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[28px] font-black tabular-nums text-[#007f98]">{safe}</span>
        <span className="text-[9px] font-black uppercase tracking-wide text-[#93a0a6]">puan</span>
      </div>
    </div>
  );
}

export function CustomerSeoPanel({ seo }: { seo?: SeoPayload | null }) {
  const keywords = seo?.keywords || [];
  const waiting = !keywords.some(hasSeoSnapshot);
  const score = Number(seo?.score || 0);
  const metrics = seo?.metrics || [];

  return (
    <section className="mt-5 rounded-[22px] border border-[#dce7e9] bg-white p-5" aria-label="SEO sıralamam">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf9fa] text-[#00a8c4]">
            <Search className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">SEO</p>
            <h2 className="mt-1 text-[20px] font-black">SEO puanı & Google sıralama</h2>
            <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-[#6c7c84]">
              {seo?.scoreNote || "Kelime konumları API bağlanınca haftalık güncellenir. Uydurma sıra gösterilmez."}
            </p>
          </div>
        </div>
        <ScoreRing score={score} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.slice(0, 4).map((metric) => (
          <div key={metric.id} className="rounded-2xl border border-[#e2ecee] bg-[#f7fbfc] p-3">
            <p className="text-[9px] font-black uppercase tracking-wide text-[#84939a]">{metric.label}</p>
            <p className="mt-1 flex items-baseline gap-1.5 text-[22px] font-black tabular-nums text-[#0f172a]">
              {metric.hint && metric.id !== "visibility" ? metric.hint : metric.value}
              {metric.max && metric.id === "visibility" ? <span className="text-[11px] font-bold text-[#93a0a6]">/ {metric.max}</span> : null}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#d5e6ea] bg-[#edf9fa] px-3 py-2 text-[11px] font-bold text-[#007f98]">
        <TrendingUp className="h-4 w-4" aria-hidden="true" />
        <span>{seo?.scoreLabel || "Takip altında"}</span>
        {seo?.scoreAdminConfigured ? <span className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-black text-[#49616b]">Admin ayarlı</span> : null}
      </div>

      {waiting ? (
        <div className="mt-5">
          <EmptyRow icon={Search} title="Sıralama verisi bekleniyor" hint={seo?.message || SEO_RANK_WAIT_MESSAGE} />
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-wide text-[#84939a]">
                <th className="pb-2 pr-3">Kelime</th>
                <th className="pb-2 pr-3">Google konum</th>
                <th className="pb-2 pr-3">Önceki</th>
                <th className="pb-2">Kontrol</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((row) => (
                <tr key={row.id} className="border-t border-[#edf2f3] text-[12px] font-bold text-[#17343c]">
                  <td className="py-2.5 pr-3">{row.keyword}</td>
                  <td className="py-2.5 pr-3"><RankCell row={row} /></td>
                  <td className="py-2.5 pr-3 tabular-nums text-[#6c7c84]">{row.previousPosition ?? "—"}</td>
                  <td className="py-2.5 text-[#6c7c84]">{formatChecked(row.lastChecked)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
