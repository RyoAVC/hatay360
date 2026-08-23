import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { Link, NavLink } from "react-router";
import { useAccountEntry } from "../lib/account-entry";
import { useContent } from "../context/content-context";
import { SiteLogo } from "./site-logo";
import { AvcTrustSeal } from "./avc-trust-seal";
import { HeaderCallCta } from "./header-call-cta";

const NAV = [
  { label: "Ana Sayfa", to: "/" },
  { label: "Demolar", to: "/demolar" },
  { label: "Araçlar", to: "/araclar" },
  { label: "Harita", to: "/google-maps-harita-kaydi" },
  { label: "Özellikler", to: "/ozellikler" },
  { label: "Paketler", to: "/paketler" },
  { label: "Referanslar", to: "/referanslar" },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SiteHeader() {
  const { settings } = useContent();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const ctaHref = settings.headerCtaHref || "/iletisim";
  const ctaText = settings.headerCtaText || "Sizi Arayalım";
  const account = useAccountEntry();

  const closeMenu = (restoreFocus = true) => {
    restoreFocusRef.current = restoreFocus;
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
    const first = focusables[0];
    window.requestAnimationFrame(() => first?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== "Tab" || !focusables.length) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && active === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    const onResize = () => {
      if (window.matchMedia("(min-width: 1280px)").matches) closeMenu(true);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  useEffect(() => {
    if (open || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    toggleRef.current?.focus();
  }, [open]);
  return (
    <header className="sticky top-0 z-50 border-b border-[#edf2f7] bg-white/85 backdrop-blur-sm print:hidden">
      <motion.div
        style={{ scaleX: progress }}
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-[#00a8c4]"
      />
      <div
        className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"
        style={{ minHeight: Math.max(72, settings.logoHeight + settings.logoPadding * 2 + 18) }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/" className="flex items-center" onClick={() => closeMenu(false)}>
            <SiteLogo variant="header" />
          </Link>

          <div className="flex items-center">
            <AvcTrustSeal compact siteName={settings.siteTitle} />
          </div>
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center xl:flex" aria-label="Ana menü">
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
          <Link to={account.to} className="text-[14px] font-semibold text-[#1f2937] transition-colors hover:text-[#0fa9c3]">
            {account.label}
          </Link>
          <Link to="/iletisim" className="text-[14px] font-semibold text-[#1f2937] transition-colors hover:text-[#0fa9c3]">
            İletişim
          </Link>
          <HeaderCallCta to={ctaHref} label={ctaText} />
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => {
            if (open) closeMenu(true);
            else setOpen(true);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#edf2f7] bg-white text-[#1a1a1a] shadow-sm xl:hidden"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          aria-controls={menuId}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="xl:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Menüyü kapat"
            className="fixed inset-0 z-40 bg-[#0b1c24]/35 backdrop-blur-[1px]"
            onClick={() => closeMenu(true)}
          />
          <div
            ref={panelRef}
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Site menüsü"
            className="absolute inset-x-0 top-full z-50 max-h-[min(78vh,640px)] overflow-y-auto border-t border-[#edf2f7] bg-white px-5 py-4 shadow-[0_18px_40px_rgba(15,40,50,0.14)]"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobil menü">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => closeMenu(false)}
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
                to={account.to}
                onClick={() => closeMenu(false)}
                className="mt-2 rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#4b586b] hover:bg-[#f4f7fa]"
              >
                {account.label}
              </Link>
              <Link
                to="/iletisim"
                onClick={() => closeMenu(false)}
                className="rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#4b586b] hover:bg-[#f4f7fa]"
              >
                İletişim
              </Link>
              <HeaderCallCta
                to={ctaHref}
                label={ctaText}
                onClick={() => closeMenu(false)}
                className="mt-2 w-full justify-center"
              />
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
