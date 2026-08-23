import type { ReactNode } from "react";

/** Bölüm alt metinlerini vurgulayan fırça darbesi alt çizgi */
export function BrushLead({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`relative mx-auto mt-4 max-w-xl text-[17px] font-semibold leading-relaxed text-[#1e3a45] sm:text-[18px] ${className}`}>
      <span className="relative z-[1]">{children}</span>
      <svg
        className="pointer-events-none absolute -bottom-2 left-1/2 h-3 w-[min(100%,420px)] -translate-x-1/2 text-[#00a8c4]/45"
        viewBox="0 0 420 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 8 C 70 2, 140 11, 210 6 S 350 2, 416 7"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M18 9 C 90 5, 160 10, 250 7 S 360 4, 400 8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>
    </p>
  );
}
