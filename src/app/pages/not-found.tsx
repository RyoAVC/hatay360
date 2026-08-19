import { Link } from "react-router";
import { motion } from "motion/react";
import { Home, MapPinned, PhoneCall, Layers, Wrench, Sparkles } from "lucide-react";

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-[96px] font-bold leading-none text-[#00a8c4] sm:text-[120px]"
      >
        404
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 text-[26px] font-bold tracking-tight text-[#1a1a1a] sm:text-[32px]"
      >
        Aradığınız sayfa bulunamadı
      </motion.h1>
      <p className="mt-3 text-[16px] leading-relaxed text-[#6f6c8f]">
        Sayfa taşınmış ya da hiç var olmamış olabilir. Size yardımcı olacak yerler:
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <motion.span
            whileHover={{ y: -3 }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-6 py-3 text-[15px] font-semibold text-white"
          >
            <Home className="h-4 w-4" /> Ana sayfa
          </motion.span>
        </Link>
        <Link to="/pazarla">
          <motion.span
            whileHover={{ y: -3 }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#ecebf5] bg-white px-6 py-3 text-[15px] font-semibold text-[#1a1a1a]"
          >
            <Layers className="h-4 w-4" /> Hizmetler
          </motion.span>
        </Link>
        <Link to="/araclar">
          <motion.span
            whileHover={{ y: -3 }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#ecebf5] bg-white px-6 py-3 text-[15px] font-semibold text-[#1a1a1a]"
          >
            <Sparkles className="h-4 w-4" /> Ücretsiz araçlar
          </motion.span>
        </Link>
        <Link to="/demolar">
          <motion.span
            whileHover={{ y: -3 }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#ecebf5] bg-white px-6 py-3 text-[15px] font-semibold text-[#1a1a1a]"
          >
            <Wrench className="h-4 w-4" /> Demo vitrin
          </motion.span>
        </Link>
        <Link to="/hatay">
          <motion.span
            whileHover={{ y: -3 }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#ecebf5] bg-white px-6 py-3 text-[15px] font-semibold text-[#1a1a1a]"
          >
            <MapPinned className="h-4 w-4" /> Hatay ilçeleri
          </motion.span>
        </Link>
        <Link to="/iletisim">
          <motion.span
            whileHover={{ y: -3 }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#ecebf5] bg-white px-6 py-3 text-[15px] font-semibold text-[#1a1a1a]"
          >
            <PhoneCall className="h-4 w-4" /> Sizi arayalım
          </motion.span>
        </Link>
      </div>
    </section>
  );
}
