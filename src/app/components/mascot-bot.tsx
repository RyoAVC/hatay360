import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, MessageCircle, ArrowRight, Store, Megaphone, Smartphone, Globe, Code2 } from "lucide-react";
import { Link } from "react-router";
import { useContent } from "../context/content-context";

const TIPS = [
  "👋 Selam! Ben 360 Bot. E-ticaret, web tasarım, reklam ve yazılım işlerinizde buradayım.",
  "🌐 Markanıza özel, mobil uyumlu ve hızlı web tasarımları hazırlıyoruz.",
  "🚀 Google Ads ve Instagram reklamlarıyla cironuzu büyütelim mi?",
  "📱 iOS ve Android uygulamanızı hazırlayıp mağazalarda yayınlayalım.",
  "💻 Pazaryeri entegrasyonu ve özel yazılım ihtiyaçlarınızı konuşalım.",
];

export function MascotBot() {
  const { settings } = useContent();
  const [isOpen, setIsOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [showSpeech, setShowSpeech] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  const [eyeState, setEyeState] = useState<"normal" | "blink" | "happy" | "stars">("normal");

  // Otomatik ipucu değiştirme
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
      if (window.matchMedia("(min-width: 768px)").matches) {
        setShowSpeech(true);
      }
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Göz ifadeleri & kırpma döngüsü
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setEyeState("blink");
      setTimeout(() => {
        setEyeState(Math.random() > 0.5 ? "happy" : "normal");
        setTimeout(() => setEyeState("normal"), 1500);
      }, 200);
    }, 4000);
    return () => clearInterval(blinkTimer);
  }, []);

  if (!settings.mascotActive) return null;

  const botName = settings.mascotName || "Hatay360 Bot";

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end md:bottom-6 md:right-6">
      {/* Konuşma Balonu (Speech Bubble) */}
      <AnimatePresence>
        {showSpeech && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="relative mb-3 max-w-[290px] rounded-2xl border-2 border-[#b3e5ee] bg-white p-3.5 shadow-[0px_14px_40px_rgba(0,168,196,0.22)] sm:max-w-[320px]"
          >
            <button
              onClick={() => setShowSpeech(false)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#f1f2f9] text-[#514f6e] hover:bg-[#b3e5ee] hover:text-[#00a8c4]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00a8c4] to-[#3ec8dc] text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-extrabold text-[#1a1a1a]">{botName}</p>
                <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-[#514f6e]">{TIPS[tipIndex]}</p>
              </div>
            </div>
            {/* Balon Oku */}
            <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-[#b3e5ee] bg-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Asistan Menüsü */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="mb-4 w-[calc(100vw-2rem)] max-w-[340px] overflow-hidden rounded-3xl border-2 border-[#b3e5ee] bg-white shadow-[0px_24px_70px_rgba(25,33,61,0.28)] sm:w-[380px] sm:max-w-none"
          >
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#00a8c4] via-[#3ec8dc] to-[#7ee0ec] p-5 text-white">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30 hover:scale-105"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  {/* Robot Yüzü */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a1a1a] p-1 border border-white/40">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00f2fe]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00f2fe]" />
                    </div>
                  </div>
                  <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-[#10b981] ring-2 ring-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[16px] font-black">{botName}</h3>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold text-white">7/24 Aktif</span>
                  </div>
                  <p className="text-[12px] text-white/90">E-Ticaret, Web Tasarım, Reklam & Yazılım</p>
                </div>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-2 p-5">
              <p className="text-[13px] font-extrabold text-[#1a1a1a]">Size nasıl yardımcı olabilirim?</p>
              
              <Link
                to="/paketler"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-[#ecebf5] bg-[#e8f8fb]/60 p-3 transition-all hover:border-[#00a8c4] hover:bg-[#e8f8fb] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00a8c4] text-white">
                    <Store className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-[#1a1a1a]">E-Ticaret Paketleri</p>
                    <p className="text-[11px] text-[#514f6e]">Anahtar teslim e-ticaret altyapısı</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#00a8c4]" />
              </Link>

              <Link
                to="/iletisim"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-[#ecebf5] bg-[#f0fdf4] p-3 transition-all hover:border-[#10b981] hover:bg-[#dcfce7] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#10b981] text-white">
                    <Globe className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-[#1a1a1a]">Özel Web Tasarımı</p>
                    <p className="text-[11px] text-[#514f6e]">Modern, %100 mobil uyumlu web siteleri</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#10b981]" />
              </Link>

              <Link
                to="/pazarla"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-[#ecebf5] bg-[#eff6ff] p-3 transition-all hover:border-[#3b82f6] hover:bg-[#dbeafe] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3b82f6] text-white">
                    <Megaphone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-[#1a1a1a]">Google Ads & Meta Ajansı</p>
                    <p className="text-[11px] text-[#514f6e]">AdWords Arama, Alışveriş & Instagram Ads</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#3b82f6]" />
              </Link>

              <Link
                to="/ozellikler"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-[#ecebf5] bg-[#fae8ff] p-3 transition-all hover:border-[#a855f7] hover:bg-[#f5d0fe] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#a855f7] text-white">
                    <Smartphone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-[#1a1a1a]">Mobil App Geliştirme</p>
                    <p className="text-[11px] text-[#514f6e]">iOS & Android store yayınlı uygulamalar</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#a855f7]" />
              </Link>

              <Link
                to="/pazarla"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-[#ecebf5] bg-[#1a1a1a] p-3 text-white transition-all hover:bg-[#2d2d3a] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00a8c4] text-white">
                    <Code2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-white">Özel yazılım & entegrasyon</p>
                    <p className="text-[11px] text-white/80">Pazaryeri, bot ve API çözümleri</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#00a8c4]" />
              </Link>

              <Link
                to="/iletisim"
                onClick={() => setIsOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#00a8c4] py-3 text-center text-[13px] font-bold text-white shadow-[0px_8px_20px_rgba(0,168,196,0.35)] transition-all hover:bg-[#0088a0]"
              >
                <MessageCircle className="h-4 w-4" /> Anında Teklif & İletişim
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DİNAMİK & HAREKETLİ CANLI MASKOT BOT BUTTON */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowSpeech(false);
        }}
        onHoverStart={() => setEyeState("happy")}
        onHoverEnd={() => setEyeState("normal")}
        whileHover={{ scale: 1.15, rotate: [0, -8, 8, -4, 0] }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -12, 0, -6, 0],
          x: [0, 4, 0, -4, 0],
          rotate: [0, 3, -3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#00a8c4] via-[#3ec8dc] to-[#7ee0ec] p-1 shadow-[0px_14px_45px_rgba(0,168,196,0.6)] ring-[3px] ring-white transition-all hover:shadow-[0px_20px_55px_rgba(0,168,196,0.8)] cursor-pointer md:h-20 md:w-20 md:p-1.5 md:ring-4"
        aria-label={`${botName} asistan`}
      >
        {/* Waving Robot Arm */}
        <motion.div
          animate={{ rotate: [0, 20, 0, 20, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          className="absolute -left-2 top-6 h-5 w-3 rounded-full bg-[#3ec8dc] origin-top border border-white/40"
        />

        {/* Anten ve Parlayan Işık */}
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-4 left-1/2 flex -translate-x-1/2 flex-col items-center"
        >
          <span className="h-3 w-3 rounded-full bg-[#ffd700] shadow-[0_0_12px_#ffd700] animate-ping" />
          <span className="h-2.5 w-1 bg-white/90" />
        </motion.div>

        {/* Robot Kafası ve Gövdesi */}
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1a1a1a] p-2 border-2 border-white/30">
          {/* Neon Yüz Ekranı */}
          <div className="relative flex h-full w-full flex-col items-center justify-center rounded-full bg-[#0a0a0a] border border-white/20">
            {/* Expressive Neon Eyes */}
            <div className="flex items-center justify-center gap-2">
              {eyeState === "blink" ? (
                <>
                  <div className="h-0.5 w-3 bg-[#00f2fe]" />
                  <div className="h-0.5 w-3 bg-[#00f2fe]" />
                </>
              ) : eyeState === "happy" ? (
                <>
                  <div className="text-[12px] font-black text-[#00f2fe] leading-none">^</div>
                  <div className="text-[12px] font-black text-[#00f2fe] leading-none">^</div>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-3 w-3 rounded-full bg-[#00f2fe] shadow-[0_0_10px_#00f2fe]"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    className="h-3 w-3 rounded-full bg-[#00f2fe] shadow-[0_0_10px_#00f2fe]"
                  />
                </>
              )}
            </div>

            {/* Glowing Smile */}
            <div className="mt-1 h-1.5 w-4 rounded-b-full border-b-2 border-white/90" />
          </div>
        </div>

        {/* Live Notification Indicator */}
        <span className="absolute right-0 top-0 flex h-5 w-5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-80" />
          <span className="relative inline-flex h-5 w-5 rounded-full bg-[#10b981] ring-2 ring-white" />
        </span>
      </motion.button>
    </div>
  );
}
