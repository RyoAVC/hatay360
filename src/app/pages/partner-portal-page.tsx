import { Handshake, LogOut, Percent } from "lucide-react";
import { useNavigate } from "react-router";
import { SiteLogo } from "../components/site-logo";
import { usePartnerAuth } from "../context/partner-auth-context";

export function PartnerPortalPage() {
  const { partner, logout } = usePartnerAuth();
  const navigate = useNavigate();
  if (!partner) return null;

  return (
    <div className="min-h-screen bg-[#06121c] text-white">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <SiteLogo variant="onDark" />
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/firma/giris", { replace: true });
            }}
            className="inline-flex items-center gap-2 text-[11px] font-black text-white/50 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Çıkış
          </button>
        </div>

        <p className="mt-10 text-[11px] font-black uppercase tracking-[0.2em] text-[#a5b4fc]">Bayi paneli</p>
        <h1 className="mt-3 text-[36px] font-black tracking-[-0.04em]">{partner.company_name}</h1>
        <p className="mt-2 text-[14px] text-white/55">{partner.contact_name} · {partner.email}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <Percent className="h-5 w-5 text-[#a5b4fc]" />
            <p className="mt-4 text-[12px] font-bold text-white/50">Komisyon oranınız</p>
            <p className="mt-2 text-[40px] font-black">%{partner.commission_rate}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-white/50">Satış başına Hatay360 payı. Değişiklik için temsilcinizle konuşun.</p>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <Handshake className="h-5 w-5 text-[#7ee0ec]" />
            <p className="mt-4 text-[12px] font-bold text-white/50">Çalışma düzeni</p>
            <p className="mt-3 text-[14px] leading-relaxed text-white/75">
              Siz müşteriyi getirirsiniz. Site, reklam ve harita kaydını Hatay360 üretir. Teslim sonrası komisyon netleşir.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
