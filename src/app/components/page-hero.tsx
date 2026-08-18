import { motion } from "motion/react";
import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  desc: string;
  children?: ReactNode;
  compact?: boolean;
};

export function PageHero({ eyebrow, title, desc, children, compact = false }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#ecebf5]/80 bg-transparent">
      <motion.div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#00a8c4]/10 blur-3xl"
        animate={{ scale: [1, 1.15, 1], x: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className={`relative mx-auto max-w-6xl px-5 text-center sm:px-8 ${compact ? "py-12 sm:py-14" : "py-20 sm:py-24"}`}>
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-[#b3e5ee] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#00a8c4]"
        >
          {eyebrow}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mx-auto mt-5 max-w-3xl text-[36px] font-bold leading-[1.1] tracking-tight text-[#1a1a1a] sm:text-[52px]"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-[#514f6e]"
        >
          {desc}
        </motion.p>
        {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
