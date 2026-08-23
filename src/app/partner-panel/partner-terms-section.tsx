import { AlertTriangle, BadgePercent, CalendarClock, CircleDollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createExampleBayilikSartlari,
  getBayilikSartlari,
  ODEME_PERIYODU_LABEL,
  TEKRAR_TIPI_LABEL,
} from "../lib/bayilik-sartlari";
import { DEFAULT_BRAND_ID } from "../lib/brand-config";
import { formatTry } from "./partner-panel-format";

export function PartnerTermsSection() {
  const [terms, setTerms] = useState(() => createExampleBayilikSartlari(DEFAULT_BRAND_ID));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getBayilikSartlari(DEFAULT_BRAND_ID, "partners")
      .then((next) => { if (active) setTerms(next); })
      .catch((nextError) => { if (active) setError(nextError instanceof Error ? nextError.message : "Şartlar yüklenemedi."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Ticari koşullar</p>
        <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Bayilik şartları</h1>
        <p className="mt-2 text-[14px] text-indigo-100/55">
          Güncel katılım, komisyon ve ödeme dönemi bilgilerinizi buradan takip edin.
        </p>
      </header>

      {loading ? <p className="text-[13px] font-semibold text-indigo-100/55">Bayilik şartları yükleniyor…</p> : null}
      {error ? <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-[13px] font-semibold text-rose-100">{error}</p> : null}

      {terms.ornekPlaceholder ? (
        <div className="flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-[13px] font-black">Şartlar henüz yönetim tarafından kesinleştirilmedi</p>
            <p className="mt-1 text-[12px] text-amber-100/70">Aşağıdaki tutar ve oranlar örnektir; resmi teklif veya sözleşme yerine geçmez.</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-5">
          <div className="flex items-center gap-2 text-indigo-200/70">
            <CircleDollarSign className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase tracking-wider">Katılım ücreti</span>
          </div>
          <p className="mt-3 text-[30px] font-black">{formatTry(terms.katilimUcretiTl)}</p>
        </article>
        <article className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-5">
          <div className="flex items-center gap-2 text-violet-200/70">
            <CalendarClock className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase tracking-wider">Ödeme periyodu</span>
          </div>
          <p className="mt-3 text-[30px] font-black">{ODEME_PERIYODU_LABEL[terms.odemePeriyodu]}</p>
        </article>
      </div>

      <section className="overflow-hidden rounded-2xl border border-indigo-400/15">
        <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-3 text-indigo-200/70">
          <BadgePercent className="h-4 w-4" />
          <h2 className="text-[11px] font-black uppercase tracking-wider">Hizmet komisyonları</h2>
        </div>
        <div className="divide-y divide-indigo-400/10 bg-[#12102a]/60">
          {terms.kategoriler.map((category) => (
            <article key={category.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="text-[13px] font-bold text-white">{category.ad}</p>
                <p className="mt-1 text-[11px] text-indigo-100/45">{TEKRAR_TIPI_LABEL[category.tekrarTipi]}</p>
              </div>
              <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[13px] font-black text-violet-100">
                %{category.komisyonOrani}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
