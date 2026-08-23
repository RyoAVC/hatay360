import type { LucideIcon } from "lucide-react";

export function EmptyRow({
  icon: Icon,
  title,
  hint,
  dark = false,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={
        dark
          ? "flex flex-col items-center gap-2 rounded-xl bg-black/20 px-4 py-8 text-center"
          : "flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#cbdadd] bg-white px-4 py-8 text-center"
      }
    >
      <Icon className="h-5 w-5 text-[#00a8c4]" />
      <p className={`text-[12px] font-black ${dark ? "text-white/75" : "text-[#405963]"}`}>{title}</p>
      {hint ? <p className={`max-w-xs text-[11px] leading-relaxed ${dark ? "text-white/40" : "text-[#718188]"}`}>{hint}</p> : null}
    </div>
  );
}
