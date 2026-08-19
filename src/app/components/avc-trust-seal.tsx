import { BadgeCheck, ExternalLink, Fingerprint, Network, ShieldCheck } from "lucide-react";

const AVC_BRANDS = ["Avcı E-Ticaret", "AvcNova", "AvcLabs", "Hatay360", "Adana360", "Dijivio"];
type AvcTrustSealProps = { mobile?: boolean; siteName?: string; hubUrl?: string };

export function AvcTrustSeal({ mobile = false, siteName = "Bu dijital proje", hubUrl = "https://hub.avcieticaret.com" }: AvcTrustSealProps) {
  return (
    <details className={`group relative ${mobile ? "w-full" : ""}`}>
      <summary aria-label="AVC doğrulanmış ekosistem bilgilerini aç" className={`relative flex cursor-pointer list-none items-center overflow-hidden border border-[#35bfd1] bg-[#06242c] text-white shadow-[0_8px_24px_rgba(0,168,196,0.28)] transition hover:border-[#7ee0ec] [&::-webkit-details-marker]:hidden ${mobile ? "w-full justify-center gap-3 rounded-2xl px-4 py-3" : "gap-2.5 rounded-xl px-3 py-2.5"}`}>
        <span className="absolute inset-y-0 right-0 w-20 bg-[radial-gradient(circle_at_right,rgba(0,168,196,0.32),transparent_70%)]" />
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#7ee0ec]/30 bg-white/10 text-[#7ee0ec]"><Fingerprint className="h-4 w-4" /><BadgeCheck className="absolute -bottom-1 -right-1 h-3.5 w-3.5 fill-emerald-400 text-[#071b22]" /></span>
        <span className="relative leading-none"><span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white">AVC <i className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" /> Kayıtlı</span><span className="mt-1 block whitespace-nowrap text-[8px] font-bold tracking-[0.06em] text-[#9beaf2]">Dijital ekosistem kimliği</span></span>
      </summary>
      <div className={`absolute z-[70] mt-3 w-[330px] overflow-hidden rounded-[24px] border border-[#1d4a58] bg-[#071b22] shadow-[0_30px_90px_rgba(4,18,24,0.34)] ${mobile ? "left-0 max-w-full" : "left-0"}`}>
        <div className="border-b border-white/10 p-5 text-white"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#70dce9]"><ShieldCheck className="h-5 w-5" /></span><span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-300">Sahiplik kaydı aktif</span></div><h3 className="mt-4 text-[16px] font-black">AVC Dijital Ekosistem Kaydı</h3><p className="mt-2 text-[11px] leading-relaxed text-white/58"><strong className="text-white">{siteName}</strong>, ortak marka ve üretim standartlarıyla AVC ağı içinde yayınlanır.</p></div>
        <div className="p-4"><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.17em] text-[#70dce9]"><Network className="h-3.5 w-3.5" /> Kayıtlı markalar</p><div className="mt-3 flex flex-wrap gap-1.5">{AVC_BRANDS.map((brand) => <span key={brand} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold text-white/60">{brand}</span>)}</div><a href={hubUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-between rounded-xl bg-[#00a8c4] px-3.5 py-3 text-[11px] font-black text-white">Sahiplik kaydını doğrula <ExternalLink className="h-3.5 w-3.5" /></a></div>
      </div>
    </details>
  );
}
