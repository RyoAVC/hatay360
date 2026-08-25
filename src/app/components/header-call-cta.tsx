import { motion } from "motion/react";
import { ArrowRight, PhoneCall } from "lucide-react";
import { Link } from "react-router";
import { useSiteReducedMotion } from "../lib/site-motion";

/** Header / mobil ‘Sizi Arayalım’ dikkat çekici CTA */
export function HeaderCallCta({
  to,
  label,
  className = "",
  onClick,
}: {
  to: string;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  const reduced = useSiteReducedMotion();

  return (
    <Link to={to} onClick={onClick} className={`relative inline-flex ${className}`}>
      {!reduced ? (
        <span
          className="pointer-events-none absolute -inset-1 rounded-2xl bg-[#00a8c4]/35 opacity-70 blur-md"
          aria-hidden="true"
          style={{ animation: "h360CtaPulse 2.2s ease-in-out infinite" }}
        />
      ) : null}
      <motion.span
        whileHover={{ y: -2, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#0891b2] via-[#00a8c4] to-[#22d3ee] px-4 py-2.5 text-[14px] font-black text-white shadow-[0_10px_28px_rgba(0,168,196,0.45)] ring-2 ring-[#7ee0ec]/50 ${className.includes("w-full") ? "w-full justify-center py-3 text-[15px]" : ""}`}
      >
        {!reduced ? (
          <span
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-white/35"
            style={{ animation: "h360CtaShine 2.8s ease-in-out infinite" }}
            aria-hidden="true"
          />
        ) : null}
        <PhoneCall className={`relative h-4 w-4 ${reduced ? "" : "animate__animated animate__tada animate__infinite"}`} style={reduced ? undefined : { animationDuration: "2.4s" }} />
        <span className="relative">{label}</span>
        <ArrowRight className="relative h-4 w-4" />
      </motion.span>
      <style>{`
        @keyframes h360CtaPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.06); }
        }
        @keyframes h360CtaShine {
          0% { transform: translateX(-120%) skewX(-18deg); }
          55%, 100% { transform: translateX(320%) skewX(-18deg); }
        }
      `}</style>
    </Link>
  );
}
