import { Code2, Globe2, MapPinned, Megaphone, ShoppingBag } from "lucide-react";
import { BrandLogo, resolveBrandId } from "./brand-logo";

function glyph(name: string, platform = "") {
  const text = `${platform} ${name}`.toLocaleLowerCase("tr-TR");
  if (/maps|harita/.test(text)) return "maps" as const;
  if (/e-ticaret|eticaret|pazaryeri/.test(text)) return "shop" as const;
  if (/web|site/.test(text)) return "web" as const;
  if (/yazılım|yazilim|otomasyon/.test(text)) return "code" as const;
  if (resolveBrandId(text)) return "brand" as const;
  if (/reklam|ads|kampanya/.test(text)) return "ads" as const;
  return "ads" as const;
}

export function ServiceMark({
  name = "",
  platform = "",
  size = 32,
}: {
  name?: string;
  platform?: string;
  size?: number;
}) {
  const kind = glyph(name, platform);
  const brand = resolveBrandId(`${platform} ${name}`) || (kind === "maps" ? "google" : null);
  const iconSize = Math.max(14, Math.round(size * 0.46));

  if (brand && (kind === "brand" || kind === "maps" || /google|meta|instagram|facebook/.test(`${platform} ${name}`.toLowerCase()))) {
    return (
      <span className="relative inline-flex shrink-0">
        <BrandLogo id={brand} size={size} />
        {kind === "maps" ? (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#00a8c4] text-white">
            <MapPinned className="h-2.5 w-2.5" />
          </span>
        ) : null}
      </span>
    );
  }

  const Icon = kind === "web" ? Globe2 : kind === "shop" ? ShoppingBag : kind === "code" ? Code2 : kind === "maps" ? MapPinned : Megaphone;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#e7f7fa] text-[#007f98]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon style={{ width: iconSize, height: iconSize }} />
    </span>
  );
}
