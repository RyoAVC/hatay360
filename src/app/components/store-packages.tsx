import { Link } from "react-router";
import { ArrowRight, Check, Palette, ShoppingBag, Store, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { BrandLogo, BrandLogoRow, MARKETPLACE_BRANDS, resolveBrandId } from "./brand-logo";
import { planKind, type Plan } from "../context/content-context";
import { buildReadyPlanQuotePath } from "../lib/needs-calculator";

function isMarketplacePlan(plan: Plan) {
  const hay = `${plan.id} ${plan.name} ${plan.badge} ${plan.desc}`.toLocaleLowerCase("tr-TR");
  return hay.includes("pazarla") || hay.includes("pazaryeri") || plan.id === "shop-pro";
}

function StorePlanCard({ plan, featured, index }: { plan: Plan; featured: boolean; index: number }) {
  const market = isMarketplacePlan(plan);
  const quotePath = buildReadyPlanQuotePath({
    id: plan.id,
    name: plan.name,
    kind: "store",
    monthlyPrice: plan.monthlyPrice,
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[26px] ${
        featured
          ? "bg-[linear-gradient(145deg,#00a8c4_0%,#0c2a32_55%,#0891b2_100%)] p-[1.5px] shadow-[0_28px_60px_rgba(0,168,196,0.22)]"
          : "border border-[#d5e4ea] bg-white shadow-[0_16px_40px_rgba(15,40,50,0.07)]"
      }`}
    >
      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-[24.5px] ${
          featured ? "bg-[#f7fbfd]" : "bg-[#fbfcfd]"
        }`}
      >
        {featured ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(80%_100%_at_100%_0%,rgba(0,168,196,0.18),transparent_70%)]"
            aria-hidden
          />
        ) : (
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#00a8c4]/[0.06] blur-2xl"
            aria-hidden
          />
        )}

        {/* Top accent bar */}
        <div
          className={`h-1 w-full ${
            featured
              ? "bg-[linear-gradient(90deg,#00a8c4,#70dce9,#00a8c4)]"
              : "bg-[linear-gradient(90deg,transparent,#c5dce4_40%,#c5dce4_60%,transparent)]"
          }`}
        />

        <div className="relative flex flex-1 flex-col p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                    featured
                      ? "bg-[#00a8c4]/12 text-[#008fac]"
                      : "bg-[#eef5f7] text-[#5a737b]"
                  }`}
                >
                  {market ? <Zap className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
                  {plan.badge}
                </span>
                {featured ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#0c2a32] px-2 py-1 text-[9px] font-black uppercase tracking-wide text-[#7ee0ec]">
                    <Sparkles className="h-3 w-3" /> Önerilen
                  </span>
                ) : null}
              </div>
              <h4 className="mt-3 text-[22px] font-bold tracking-tight text-[#0c2a32] sm:text-[24px]">{plan.name}</h4>
            </div>
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                featured ? "bg-[#00a8c4] text-white shadow-[0_10px_24px_rgba(0,168,196,0.35)]" : "bg-[#e8f8fb] text-[#00a8c4]"
              }`}
            >
              {market ? <Store className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
            </span>
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-[#5a737b]">{plan.desc}</p>

          {market ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#d7f0f5] bg-white/90 px-3 py-2.5">
              <BrandLogoRow ids={MARKETPLACE_BRANDS.slice(0, 3)} size={20} />
              <span className="text-[11px] font-bold text-[#3d5a63]">Pazaryeri senkronu</span>
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 self-start rounded-xl border border-[#d7e8ee] bg-white px-3 py-2.5 text-[11px] font-bold text-[#3d5a63]">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e8f8fb] text-[#00a8c4]">
                <Palette className="h-3.5 w-3.5" />
              </span>
              Web vitrin + ödeme altyapısı
            </div>
          )}

          {/* Price */}
          <div
            className={`mt-5 overflow-hidden rounded-2xl border p-4 ${
              featured
                ? "border-[#b3e5ee] bg-[linear-gradient(160deg,#ffffff_0%,#eef9fb_100%)]"
                : "border-[#e4eef2] bg-white"
            }`}
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold text-[#94a3b8] line-through decoration-[#94a3b8]/80">{plan.oldPrice}</p>
                <p className="mt-0.5 text-[36px] font-black leading-none tracking-tight text-[#0c2a32] sm:text-[40px]">
                  {plan.price}
                </p>
              </div>
              <div className="rounded-xl bg-[#0c2a32] px-2.5 py-2 text-right">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#7ee0ec]">Aylık</p>
                <p className="text-[13px] font-black text-white">{plan.monthlyPrice}</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] font-semibold text-[#008fac]">{plan.installments}</p>
            <p className="mt-1.5 text-[10px] leading-snug text-[#94a3b8]">
              Reklam yönetimi ayrı pakettir; bu tutara dahil değildir.
            </p>
          </div>

          <Link
            to={quotePath}
            className={`group/cta relative mt-5 flex items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-[14px] font-bold transition ${
              featured
                ? "bg-[#00a8c4] text-white shadow-[0_12px_28px_rgba(0,168,196,0.32)] hover:bg-[#008fac]"
                : "bg-[#0c2a32] text-white hover:bg-[#00a8c4]"
            }`}
          >
            <span className="relative z-[1] flex items-center gap-2">
              {plan.cta}
              <ArrowRight className="h-4 w-4 transition group-hover/cta:translate-x-0.5" />
            </span>
          </Link>

          {plan.pills?.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {plan.pills.map((pill) => (
                <span
                  key={pill.text}
                  className="inline-flex items-center gap-1 rounded-md border border-[#e2eef2] bg-white px-2 py-1 text-[10px] font-bold text-[#475569]"
                >
                  {resolveBrandId(pill.text) ? <BrandLogo name={pill.text} size={14} /> : null}
                  {pill.text}
                </span>
              ))}
            </div>
          ) : null}

          <ul className="mt-5 space-y-0 border-t border-[#e2eef2] pt-1">
            {plan.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 border-b border-[#eef4f6] py-2.5 text-[12.5px] font-semibold text-[#334155] last:border-b-0"
              >
                {resolveBrandId(feature.text) ? (
                  <BrandLogo name={feature.text} size={16} className="mt-0.5 shrink-0" />
                ) : (
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#e8f8fb] text-[#00a8c4]">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                )}
                <span className="leading-snug">{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.article>
  );
}

export function StorePackages({ plans }: { plans: Plan[] }) {
  const storePlans = plans.filter((p) => planKind(p) === "store");
  if (storePlans.length === 0) return null;

  const recommendedId = storePlans.find((p) => isMarketplacePlan(p))?.id || storePlans[storePlans.length - 1]?.id;

  return (
    <div
      id="magaza-paketleri"
      className="relative overflow-hidden rounded-[32px] border border-[#d0e4ea] bg-[linear-gradient(165deg,#f3fafc_0%,#eef6f8_45%,#f7fbfd_100%)] px-5 py-10 sm:px-8 sm:py-12"
    >
      <div
        className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-[#00a8c4]/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-10 bottom-10 h-40 w-40 rounded-full bg-[#70dce9]/15 blur-3xl"
        aria-hidden
      />

      <div className="relative max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#bfe0e8] bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#008fac]">
            <Store className="h-3.5 w-3.5" /> Mağaza paketleri
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#e2e8f0] bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#64748b]">
            <Palette className="h-3.5 w-3.5" /> Web tasarım dahil
          </span>
        </div>
        <h3 className="mt-4 text-[28px] font-bold tracking-tight text-[#0c2a32] sm:text-[34px]">
          Site ve mağaza altyapısı
        </h3>
        <div className="mt-3 h-1 w-16 rounded-full bg-[linear-gradient(90deg,#00a8c4,#70dce9)]" />
        <p className="mt-4 text-[14px] leading-relaxed text-[#5a737b]">
          Vitrin, katalog, sanal POS ve isteğe bağlı pazaryeri. Reklam paketleri ayrıdır; burada yalnızca web ve mağaza
          tutarları gösterilir.
        </p>
      </div>

      <div className={`relative mt-9 grid gap-6 ${storePlans.length === 1 ? "max-w-lg" : "lg:grid-cols-2"}`}>
        {storePlans.map((plan, index) => (
          <StorePlanCard key={plan.id} plan={plan} featured={plan.id === recommendedId || !!plan.featured} index={index} />
        ))}
      </div>

      <p className="relative mt-7 text-center text-[11px] font-semibold text-[#94a3b8]">
        Mağaza Start: vitrin ve ödeme · Mağaza & Pazarla: pazaryeri senkronu · Reklam yönetimi her iki pakette ayrıdır
      </p>
    </div>
  );
}
