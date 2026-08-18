import { BadgeCheck, Check, ExternalLink, ShieldCheck } from "lucide-react";

export function AvcFloatingLock() {
  return (
    <details className="group fixed bottom-28 left-0 z-40 md:bottom-16">
      <summary aria-label="AVC güven ve sahiplik bilgisini aç" className="relative flex h-[126px] w-[44px] -translate-x-[28px] animate-[avc-peek_9s_ease-in-out_infinite] cursor-pointer list-none flex-col items-center justify-center gap-2 rounded-r-2xl border border-l-0 border-[#35bfd1] bg-[#071b22] text-white shadow-[0_14px_38px_rgba(7,27,34,0.28)] transition hover:translate-x-0 group-open:animate-none group-open:translate-x-0 [&::-webkit-details-marker]:hidden">
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[#06202a]"><Check className="h-4 w-4 stroke-[3]" /><i className="absolute inset-0 animate-ping rounded-full border border-emerald-300 opacity-50" /><i className="absolute -inset-2 animate-[ping_1.8s_ease-out_infinite] rounded-full border border-[#70dce9]/30" /></span>
        <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[#9beaf2] [writing-mode:vertical-rl]">AVC Kayıtlı</span>
      </summary>
      <div className="absolute bottom-0 left-[52px] w-[286px] overflow-hidden rounded-[22px] border border-[#1b4b59] bg-[#071b22] text-white shadow-[0_26px_75px_rgba(4,18,24,0.34)]"><div className="p-5"><div className="flex items-center justify-between"><ShieldCheck className="h-6 w-6 text-[#70dce9]" /><BadgeCheck className="h-5 w-5 fill-emerald-400 text-[#071b22]" /></div><p className="mt-4 text-[14px] font-black">AVC sahiplik kaydı</p><p className="mt-2 text-[10px] leading-relaxed text-white/58">Hatay360 tasarımı, yazılımı ve marka görünümü Mahir Avcı / Avcı E-Ticaret’e aittir. AvcLabs, Dijivio ve 360 markaları aynı üretim ağına kayıtlıdır. İzinsiz kopya hukuka aykırıdır.</p></div><a href="https://hub.avcieticaret.com" target="_blank" rel="noreferrer" className="flex items-center justify-between border-t border-white/10 px-5 py-3.5 text-[10px] font-black text-[#70dce9]">Kaydı doğrula <ExternalLink className="h-3.5 w-3.5" /></a></div>
    </details>
  );
}
