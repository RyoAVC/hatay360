import trendyol from "../../assets/integrations/trendyol.png";
import hepsiburada from "../../assets/integrations/hepsiburada.png";
import n11 from "../../assets/integrations/n11.png";
import amazon from "../../assets/integrations/amazon.png";
import pttavm from "../../assets/integrations/pttavm.png";
import ciceksepeti from "../../assets/integrations/ciceksepeti.png";
import google from "../../assets/integrations/google.png";
import meta from "../../assets/integrations/meta.png";
import instagram from "../../assets/integrations/instagram.png";
import facebook from "../../assets/integrations/facebook.png";
import apple from "../../assets/integrations/apple.png";
import googlePlay from "../../assets/integrations/google-play.png";
import iyzico from "../../assets/integrations/iyzico.png";

export const BRAND_LOGOS: Record<string, { src: string; name: string }> = {
  trendyol: { src: trendyol, name: "Trendyol" },
  hepsiburada: { src: hepsiburada, name: "Hepsiburada" },
  n11: { src: n11, name: "N11" },
  amazon: { src: amazon, name: "Amazon" },
  pttavm: { src: pttavm, name: "PttAVM" },
  ciceksepeti: { src: ciceksepeti, name: "Çiçeksepeti" },
  google: { src: google, name: "Google" },
  meta: { src: meta, name: "Meta" },
  instagram: { src: instagram, name: "Instagram" },
  facebook: { src: facebook, name: "Facebook" },
  apple: { src: apple, name: "App Store" },
  "google-play": { src: googlePlay, name: "Google Play" },
  iyzico: { src: iyzico, name: "iyzico" },
};

export const MARKETPLACE_BRANDS = ["trendyol", "hepsiburada", "n11", "amazon", "pttavm", "ciceksepeti"] as const;
export const ADS_BRANDS = ["google", "meta", "instagram", "facebook"] as const;
export const APP_BRANDS = ["apple", "google-play"] as const;

const ALIASES: [RegExp, string][] = [
  [/trendyol/i, "trendyol"],
  [/hepsi|\bhb\b/i, "hepsiburada"],
  [/\bn11\b/i, "n11"],
  [/amazon/i, "amazon"],
  [/ptt/i, "pttavm"],
  [/çiçek|cicek/i, "ciceksepeti"],
  [/google play|play store/i, "google-play"],
  [/google|adwords|pagespeed|seo/i, "google"],
  [/instagram/i, "instagram"],
  [/facebook/i, "facebook"],
  [/meta/i, "meta"],
  [/ios|app store|apple/i, "apple"],
  [/android/i, "google-play"],
  [/iyzico|sanal pos|ödeme/i, "iyzico"],
];

export function resolveBrandId(label: string): string | null {
  const direct = label.trim().toLowerCase();
  if (BRAND_LOGOS[direct]) return direct;
  for (const [re, id] of ALIASES) {
    if (re.test(label)) return id;
  }
  return null;
}

type BrandLogoProps = {
  id?: string;
  name?: string;
  size?: number;
  className?: string;
};

export function BrandLogo({ id, name, size = 28, className = "" }: BrandLogoProps) {
  const key = id || (name ? resolveBrandId(name) : null);
  if (!key || !BRAND_LOGOS[key]) return null;
  const item = BRAND_LOGOS[key];
  const pad = Math.max(3, Math.round(size * 0.12));

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm ${className}`}
      style={{ width: size, height: size, padding: pad }}
      title={item.name}
    >
      <img src={item.src} alt={item.name} className="h-full w-full object-contain" />
    </span>
  );
}

export function BrandChip({ name, dark = false }: { name: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 ${
        dark ? "bg-white/10 text-white" : "border border-[#ecebf5] bg-white text-[#1a1a1a]"
      }`}
    >
      <BrandLogo name={name} size={18} />
      <span className="text-[11px] font-bold">{name}</span>
    </span>
  );
}

export function BrandLogoRow({
  ids,
  size = 32,
  className = "",
}: {
  ids: readonly string[];
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {ids.map((id) => (
        <BrandLogo key={id} id={id} size={size} />
      ))}
    </div>
  );
}
