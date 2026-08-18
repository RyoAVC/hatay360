import { ArrowRight, Boxes, Check, CreditCard, MonitorSmartphone, Palette, ShoppingBag, Store } from "lucide-react";
import { motion } from "motion/react";
import { BrandLogo, BrandLogoRow, MARKETPLACE_BRANDS, resolveBrandId } from "./brand-logo";
import { planKind, type Plan } from "../context/content-context";

const MODULES = [
  { icon: Palette, label: "Web tasarım", text: "Mobil vitrin ve marka sayfası" },
  { icon: ShoppingBag, label: "E-ticaret", text: "Katalog, sepet, sipariş" },
  { icon: CreditCard, label: "Ödeme", text: "Sanal POS ve SSL" },
  { icon: Boxes, label: "Pazarla", text: "Trendyol, HB, N11 senkron" },
];

const COMPARE = [
  ["Web tasarım", "Hazır vitrin", "Özel arayüz"],
  ["Online mağaza", "1.000 ürün", "Sınırsız hedef"],
  ["Ödeme", "Sanal POS + SSL", "Sanal POS + SSL"],
  ["Pazaryeri", "Sonra eklenebilir", "Trendyol · HB · N11"],
  ["Reklam", "Ayrı paket", "Ayrı paket"],
];

function isMarketplacePlan(plan: Plan) {
  const hay = `${plan.id} ${plan.name} ${plan.badge} ${plan.desc}`.toLocaleLowerCase("tr-TR");
  return hay.includes("pazarla") || hay.includes("pazaryeri") || plan.id === "shop-pro";
}

function StorefrontMock({ market }: { market: boolean }) {
  return (
    <div className={`relative overflow-hidden ${market ? "bg-[#071018]" : "bg-[#eef4f7]"}`}>
      <div className={`flex items-center gap-2 border-b px-3 py-2 ${market ? "border-white/8" : "border-[#d7e3ea]"}`}>
        <i className="h-2 w-2 rounded-full bg-[#ff6b6b]" />
        <i className="h-2 w-2 rounded-full bg-[#ffd43b]" />
        <i className="h-2 w-2 rounded-full bg-[#51cf66]" />
        <span className={`ml-2 truncate rounded-full px-2.5 py-0.5 text-[9px] font-bold ${market ? "bg-white/8 text-white/45" : "bg-white text-[#6f8b93]"}`}>
          {market ? "siteniz.com · pazarla senkron" : "siteniz.com · vitrin"}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_88px] gap-3 p-3 sm:grid-cols-[1fr_104px] sm:p-4">
        <div>
          <div className={`h-2.5 w-24 rounded-full ${market ? "bg-[#c9a227]/55" : "bg-[#0b6f82]/35"}`} />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((n) => (
              <div key={n} className={`rounded-xl p-2 ${market ? "bg-white/8" : "bg-white shadow-sm"}`}>
                <div
                  className={`h-10 rounded-lg sm:h-12 ${
                    n === 1
                      ? market
                        ? "bg-gradient-to-br from-[#c9a227] to-[#e6c35c]"
                        : "bg-gradient-to-br from-[#0b6f82] to-[#3ec8dc]"
                      : market
                        ? "bg-white/12"
                        : "bg-[#d9e4ea]"
                  }`}
                />
                <div className={`mt-2 h-1.5 w-3/4 rounded ${market ? "bg-white/20" : "bg-[#c9d8df]"}`} />
                <div className={`mt-1 h-1.5 w-1/2 rounded ${market ? "bg-white/12" : "bg-[#dde8ed]"}`} />
              </div>
            ))}
          </div>
        </div>

        <div className={`flex flex-col justify-between rounded-[18px] border p-2 ${market ? "border-white/10 bg-[#0d1c24]" : "border-white bg-white shadow-sm"}`}>
          <MonitorSmartphone className={`h-3.5 w-3.5 ${market ? "text-[#f3d27a]" : "text-[#0b6f82]"}`} />
          <div className="space-y-1.5">
            <div className={`h-8 rounded-lg ${market ? "bg-[#c9a227]/35" : "bg-[#e8f4f7]"}`} />
            <div className={`h-1.5 w-full rounded ${market ? "bg-white/15" : "bg-[#d4e2e8]"}`} />
            <div className={`h-1.5 w-2/3 rounded ${market ? "bg-white/10" : "bg-[#e4eef2]"}`} />
          </div>
          <div className={`h-5 rounded-md ${market ? "bg-[#c9a227]" : "bg-[#12202a]"}`} />
        </div>
      </div>

      {market ? (
        <div className="flex items-center justify-between gap-2 border-t border-white/8 px-3 py-2.5">
          <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#f3d27a]">Stok senkron</span>
          <BrandLogoRow ids={MARKETPLACE_BRANDS.slice(0, 4)} size={22} className="!flex-nowrap" />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 border-t border-[#d7e3ea] px-3 py-2.5">
          <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#0b6f82]">Web + ödeme</span>
          <BrandLogo id="iyzico" size={22} />
        </div>
      )}
    </div>
  );
}

function StorePlanCard({ plan, featured }: { plan: Plan; featured: boolean }) {
  const market = isMarketplacePlan(plan);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      className={`flex h-full flex-col overflow-hidden rounded-[28px] ${
        featured
          ? "bg-[linear-gradient(180deg,#162430_0%,#0b141c_62%,#081018_100%)] text-white shadow-[0_28px_70px_rgba(0,0,0,0.28)] ring-1 ring-[#c9a227]/50"
          : "bg-white text-[#12202a] shadow-[0_18px_44px_rgba(8,20,28,0.1)]"
      }`}
    >
      {featured && (
        <div className="flex items-center justify-between bg-[#c9a227] px-5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#1a1404]">
          <span>Gelişmiş paket</span>
          <span>Web + mağaza + pazarla</span>
        </div>
      )}

      <StorefrontMock market={market} />

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ${
              featured ? "bg-white/10 text-[#f3d27a]" : "bg-[#eef7fa] text-[#0b6f82]"
            }`}
          >
            {market ? <Palette className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
            {plan.badge}
          </span>
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${featured ? "bg-white/8 text-white/70" : "bg-[#f4f1ea] text-[#7a5a22]"}`}>
            Web tasarım dahil
          </span>
        </div>
        <h4 className="mt-3 text-[24px] font-black tracking-tight">{plan.name}</h4>
        <p className={`mt-2 text-[13px] leading-relaxed ${featured ? "text-white/68" : "text-[#5b6b75]"}`}>{plan.desc}</p>

        <div className={`mt-5 rounded-2xl p-4 ${featured ? "bg-white/6" : "bg-[#f6fafc]"}`}>
          <p className={`text-[12px] font-bold line-through ${featured ? "text-white/35" : "text-[#94a3b8]"}`}>{plan.oldPrice}</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-[36px] font-black leading-none">{plan.price}</p>
            <div className="text-right text-[11px] font-bold">
              <p className={featured ? "text-[#f3d27a]" : "text-[#0b6f82]"}>{plan.installments}</p>
              <p className={featured ? "text-white/55" : "text-[#64748b]"}>{plan.monthlyPrice}</p>
            </div>
          </div>
        </div>

        <a
          href="/iletisim"
          className={`mt-5 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-black transition hover:scale-[1.02] ${
            featured
              ? "bg-gradient-to-r from-[#c9a227] to-[#e6c35c] text-[#1a1404] shadow-[0_10px_24px_rgba(201,162,39,0.28)]"
              : "bg-[#12202a] text-white hover:bg-[#0b6f82]"
          }`}
        >
          {plan.cta} <ArrowRight className="h-4 w-4" />
        </a>

        {plan.pills && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {plan.pills.map((p) => (
              <span
                key={p.text}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 ${featured ? "bg-white/10" : "border border-[#ecebf5] bg-white"}`}
              >
                {resolveBrandId(p.text) ? <BrandLogo name={p.text} size={16} /> : null}
                <span className="text-[11px] font-bold">{p.text}</span>
              </span>
            ))}
          </div>
        )}

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {plan.features.map((f, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-[12px] font-semibold ${
                featured ? "bg-white/5 text-white/88" : "bg-[#f3f7f9] text-[#334155]"
              }`}
            >
              {resolveBrandId(f.text) ? (
                <BrandLogo name={f.text} size={16} className="mt-0.5" />
              ) : (
                <Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-[#e6c35c]" : "text-[#0b6f82]"}`} />
              )}
              <span>{f.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export function StorePackages({ plans }: { plans: Plan[] }) {
  const storePlans = plans.filter((p) => planKind(p) === "store");
  if (storePlans.length === 0) return null;

  const recommendedId = storePlans.find((p) => isMarketplacePlan(p))?.id || storePlans[storePlans.length - 1]?.id;

  return (
    <div id="magaza-paketleri" className="relative overflow-hidden rounded-[36px] bg-[#0c1620] px-5 py-10 text-white sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-[#0ea5b7]/18 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-[#c9a227]/16 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#8be0ec]">
            <Store className="h-3.5 w-3.5" /> E-ticaret
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#f3d27a]">
            <Palette className="h-3.5 w-3.5" /> Web tasarım
          </span>
        </div>

        <div className="mt-5 max-w-3xl">
          <h3 className="text-[28px] font-black tracking-tight sm:text-[36px]">Mağazanız ve siteniz, reklamdan ayrı bir stüdyo işi</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-white/65">
            Vitrin tasarımı, katalog, sanal POS ve isteğe bağlı pazaryeri senkronu. Bu tutarlar altyapı ve tasarımdır; Google/Meta yönetimi üstteki reklam paketlerindedir.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {MODULES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <Icon className="h-4 w-4 text-[#8be0ec]" />
                <p className="mt-2 text-[12px] font-black">{item.label}</p>
                <p className="mt-0.5 text-[11px] text-white/50">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className={`mt-8 grid gap-5 ${storePlans.length === 1 ? "max-w-xl" : "lg:grid-cols-2"}`}>
          {storePlans.map((plan) => (
            <StorePlanCard key={plan.id} plan={plan} featured={plan.id === recommendedId || !!plan.featured} />
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/8 bg-white/4">
          <div className="grid grid-cols-3 border-b border-white/8 text-[11px] font-black uppercase tracking-[0.12em] text-white/45">
            <span className="px-4 py-3">Kapsam</span>
            <span className="px-4 py-3">Mağaza Start</span>
            <span className="px-4 py-3 text-[#f3d27a]">Mağaza & Pazarla</span>
          </div>
          {COMPARE.map(([scope, start, pro]) => (
            <div key={scope} className="grid grid-cols-3 border-t border-white/6 text-[12px]">
              <span className="px-4 py-2.5 font-bold text-white/80">{scope}</span>
              <span className="px-4 py-2.5 text-white/55">{start}</span>
              <span className="px-4 py-2.5 font-semibold text-white/90">{pro}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
