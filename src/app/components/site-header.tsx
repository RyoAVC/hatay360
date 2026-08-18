import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { Link, NavLink } from "react-router";
import { useContent } from "../context/content-context";
import { SiteLogo } from "./site-logo";
import { AvcTrustSeal } from "./avc-trust-seal";

const NAV = [
  { label: "Ana Sayfa", to: "/" },
  { label: "Demolar", to: "/demolar" },
  { label: "Hizmetler", to: "/pazarla" },
  { label: "Özellikler", to: "/ozellikler" },
  { label: "Paketler", to: "/paketler" },
  { label: "Referanslar", to: "/referanslar" },
];

export function SiteHeader() {
  const { settings } = useContent();
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <header className="sticky top-0 z-50 border-b border-[#edf2f7] bg-white/85 backdrop-blur-sm">
      <motion.div
        style={{ scaleX: progress }}
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-[#00a8c4]"
      />
      <div
        className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"
        style={{ minHeight: Math.max(72, settings.logoHeight + settings.logoPadding * 2 + 18) }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/" className="flex items-center">
            <SiteLogo variant="header" />
          </Link>

          <div className="hidden items-center sm:flex">
            <AvcTrustSeal siteName={settings.siteTitle} />
          </div>
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
          <div className="flex items-center gap-1 rounded-full border border-[#edf2f7] bg-[#f8fafc] p-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                    isActive
                      ? "bg-white text-[#0fa9c3] shadow-sm ring-1 ring-[#e2f7fb]"
                      : "text-[#475569] hover:text-[#0fa9c3]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Link to="/iletisim" className="text-[14px] font-semibold text-[#1f2937] transition-colors hover:text-[#0fa9c3]">
            İletişim
          </Link>
          <Link to={settings.headerCtaHref || "/iletisim"}>
            <motion.span
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[14px] font-bold text-white shadow-sm"
            >
              {settings.headerCtaText || "Sizi Arayalım"} <ArrowRight className="h-4 w-4" />
            </motion.span>
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#edf2f7] bg-white text-[#1a1a1a] shadow-sm xl:hidden"
          aria-label="Menü"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#edf2f7] bg-white px-5 py-4 xl:hidden">
          <nav className="flex flex-col gap-1">
            <div className="mb-2"><AvcTrustSeal mobile siteName={settings.siteTitle} /></div>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 text-[15px] font-medium ${
                    isActive ? "bg-[#edfbff] text-[#00a8c4]" : "text-[#4b586b] hover:bg-[#f4f7fa]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/iletisim"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0fa9c3] to-[#18bfd4] px-4 py-3 text-[15px] font-bold text-white"
            >
              Sizi Arayalım <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
