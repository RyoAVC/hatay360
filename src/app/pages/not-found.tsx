import { Link } from "react-router";
import { motion } from "motion/react";
import { Home, MapPinned, PhoneCall, Layers, Wrench, CarFront, CakeSlice, Stethoscope, Compass, Navigation } from "lucide-react";
import { useSiteReducedMotion } from "../lib/site-motion";

const LINK_BASE =
  "inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#00a8c4] focus-visible:ring-offset-2";

const SHORTCUTS = [
  { to: "/", label: "Ana sayfa", icon: Home, primary: true },
  { to: "/iletisim", label: "İletişim", icon: PhoneCall, primary: false },
  { to: "/paketler", label: "Paketler", icon: Layers, primary: false },
  { to: "/google-maps-harita-kaydi", label: "Harita kaydı", icon: Navigation, primary: false },
  { to: "/araclar", label: "Ücretsiz araçlar", icon: Wrench, primary: false },
  { to: "/hatay", label: "Hatay ilçeleri", icon: MapPinned, primary: false },
  { to: "/hatay-kesfet", label: "Hatay keşif", icon: Compass, primary: false },
] as const;

const SECTORS = [
  { to: "/sektor/taksi", label: "Taksi", icon: CarFront },
  { to: "/demo/kunefe", label: "Künefe", icon: CakeSlice },
  { to: "/sektor/klinik", label: "Klinik", icon: Stethoscope },
] as const;

export function NotFoundPage() {
  const reduceMotion = useSiteReducedMotion();
  const motionOff = { initial: false as const, animate: undefined, whileHover: undefined, transition: undefined };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8" aria-labelledby="not-found-title">
      <motion.p
        {...(reduceMotion ? motionOff : { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } })}
        aria-hidden="true"
        className="text-[96px] font-bold leading-none text-[#00a8c4] sm:text-[120px]"
      >
        404
      </motion.p>
      <motion.h1
        id="not-found-title"
        {...(reduceMotion ? motionOff : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 } })}
        className="mt-4 text-[26px] font-bold tracking-tight text-[#1a1a1a] sm:text-[32px]"
      >
        Aradığınız sayfa bulunamadı
      </motion.h1>
      <p className="mt-3 text-[16px] leading-relaxed text-[#6f6c8f]">
        Bu adres Hatay360’ta yok — taşınmış ya da hiç açılmamış olabilir. Ana sayfa, paketler veya ilçelerden devam edin.
      </p>

      <nav aria-label="Sayfa kısayolları" className="mt-8">
        <ul className="flex flex-wrap items-center justify-center gap-3">
          {SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <motion.div whileHover={reduceMotion ? undefined : { y: -3 }}>
                  <Link
                    to={item.to}
                    className={
                      item.primary
                        ? `${LINK_BASE} bg-[#00a8c4] text-white hover:bg-[#008da8]`
                        : `${LINK_BASE} border border-[#ecebf5] bg-white text-[#1a1a1a] hover:border-[#b3e5ee] hover:text-[#008da8]`
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label="Popüler sektörler" className="mt-8 w-full">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#8a88a5]">Popüler sektörler</h2>
        <ul className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {SECTORS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`${LINK_BASE} min-h-10 rounded-full border border-[#d7eaee] bg-[#f4fbfd] px-4 py-2 text-[14px] text-[#0f4c5c] hover:border-[#00a8c4]/40 hover:bg-white`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
