import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, PhoneCall, Target, Bell } from "lucide-react";
import { BrandLogo, resolveBrandId } from "./brand-logo";

const BARS = [42, 58, 47, 65, 72, 60, 88, 76, 95, 82, 100, 90];

const PRODUCTS = ["Kurumsal web talebi", "Google Ads görüşmesi", "Harita kaydı", "Meta kampanya talebi", "E-ticaret keşfi"];
const CHANNELS = ["Google", "Meta", "WhatsApp", "Web sitesi"];

type Order = { id: number; product: string; channel: string; price: number };

let counter = 0;
function randomOrder(): Order {
  counter += 1;
  return {
    id: counter,
    product: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
    channel: CHANNELS[Math.floor(Math.random() * CHANNELS.length)],
    price: Math.floor(Math.random() * 6) + 1,
  };
}

export function LiveDashboard() {
  const [sales, setSales] = useState(184);
  const [orders, setOrders] = useState(47);
  const [feed, setFeed] = useState<Order[]>([randomOrder(), randomOrder(), randomOrder()]);

  // Canlı sipariş akışı + artan sayaçlar
  useEffect(() => {
    const t = setInterval(() => {
      const o = randomOrder();
      setFeed((prev) => [o, ...prev].slice(0, 4));
      setSales((s) => s + o.price);
      setOrders((n) => n + 1);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-hidden rounded-3xl border border-[#ecebf5] bg-white shadow-[0px_30px_70px_rgba(25,33,61,0.15)]">
      {/* Tarayıcı çubuğu */}
      <div className="flex items-center gap-1.5 border-b border-[#f1f2f9] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex flex-1 items-center gap-2 rounded-md bg-[#e8f8fb] px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
          <span className="text-[12px] text-[#a0a3bd]">panel.hatay360.com</span>
        </div>
      </div>

      <div className="space-y-4 bg-gradient-to-b from-white to-[#fafaff] p-5">
        {/* Üst istatistik kartları */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#f1f2f9] bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#a0a3bd]">Aylık görünürlük</span>
              <span className="flex items-center gap-0.5 rounded-full bg-[#e9fbef] px-1.5 py-0.5 text-[10px] font-semibold text-[#0fa958]">
                <TrendingUp className="h-3 w-3" /> %12
              </span>
            </div>
            <p className="mt-1 text-[22px] font-bold text-[#1a1a1a]">
              +{sales.toLocaleString("tr-TR")}%
            </p>
          </div>
          <div className="rounded-2xl border border-[#f1f2f9] bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#a0a3bd]">Nitelikli talep</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00a8c4]/10 text-[#00a8c4]">
                <Target className="h-3 w-3" />
              </span>
            </div>
            <p className="mt-1 text-[22px] font-bold text-[#1a1a1a]">{orders}</p>
          </div>
        </div>

        {/* Animasyonlu grafik */}
        <div className="rounded-2xl border border-[#f1f2f9] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#1a1a1a]">Dönüşüm ivmesi</span>
            <span className="text-[11px] text-[#a0a3bd]">son 12 hafta</span>
          </div>
          <div className="flex h-24 items-end gap-1.5">
            {BARS.map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-[#00a8c4] to-[#3ec8dc]"
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{
                  duration: 1,
                  delay: i * 0.06,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 2.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* Canlı sipariş akışı */}
        <div className="rounded-2xl border border-[#f1f2f9] bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0fa958] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0fa958]" />
            </span>
            <span className="text-[13px] font-semibold text-[#1a1a1a]">Canlı fırsatlar</span>
            <Bell className="ml-auto h-4 w-4 text-[#a0a3bd]" />
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false} mode="popLayout">
              {feed.map((o) => (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, x: 30, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  className="flex items-center gap-3 rounded-xl bg-[#fafaff] px-3 py-2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {resolveBrandId(o.channel) ? (
                      <BrandLogo name={o.channel} size={32} />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00a8c4]/10 text-[#00a8c4]">
                        <PhoneCall className="h-4 w-4" />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[#1a1a1a]">{o.product}</p>
                    <p className="text-[11px] text-[#a0a3bd]">{o.channel}</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#0fa958]">+{o.price} lead</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
