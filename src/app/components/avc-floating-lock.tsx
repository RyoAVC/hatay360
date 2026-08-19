import { BadgeCheck, Check, ExternalLink, ShieldCheck } from "lucide-react";

export function AvcFloatingLock() {
  return (
    <details className="group fixed bottom-28 left-0 z-40 md:bottom-16">
      <summary
        aria-label="AVC güven ve sahiplik bilgisini aç"
        className="relative flex h-[148px] w-[56px] -translate-x-[10px] animate-[avc-peek_8s_ease-in-out_infinite] cursor-pointer list-none flex-col items-center justify-center gap-2.5 rounded-r-2xl border border-l-0 border-[#7ee0ec] bg-[#06242c] text-white shadow-[0_0_0_1px_rgba(126,224,236,0.35),0_16px_40px_rgba(0,168,196,0.42)] transition hover:translate-x-0 group-open:animate-none group-open:translate-x-0 [&::-webkit-details-marker]:hidden"
      >
        <span className="absolute inset-y-0 left-0 w-1 bg-[#7ee0ec]" />
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-[#06202a] shadow-[0_0_16px_rgba(52,211,153,0.7)]">
          <Check className="h-4 w-4 stroke-[3]" />
          <i className="absolute inset-0 animate-ping rounded-full border border-emerald-300 opacity-50" />
        </span>
        <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#c8f6fb] [writing-mode:vertical-rl]">AVC Kayıtlı</span>
      </summary>
      <div className="absolute bottom-0 left-[60px] w-[300px] overflow-hidden rounded-[22px] border border-[#35bfd1] bg-[#071b22] text-white shadow-[0_26px_75px_rgba(4,18,24,0.45)]">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <ShieldCheck className="h-6 w-6 text-[#70dce9]" />
            <BadgeCheck className="h-5 w-5 fill-emerald-400 text-[#071b22]" />
          </div>
          <p className="mt-4 text-[15px] font-black">AVC sahiplik kaydı</p>
          <p className="mt-2 text-[11px] leading-relaxed text-white/62">
            Hatay360 tasarımı, yazılımı ve marka görünümü Mahir Avcı / Avcı E-Ticaret’e aittir. AvcLabs, Dijivio ve 360 markaları aynı üretim ağına kayıtlıdır. İzinsiz kopya hukuka aykırıdır.
          </p>
        </div>
        <a href="https://hub.avcieticaret.com" target="_blank" rel="noreferrer" className="flex items-center justify-between border-t border-white/10 bg-[#00a8c4] px-5 py-3.5 text-[11px] font-black text-white">
          Kaydı doğrula <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </details>
  );
}
