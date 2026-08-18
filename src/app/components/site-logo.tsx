import defaultLogo from "../../assets/hatay360-logo.png";
import { useContent, SiteSettings } from "../context/content-context";

type LogoVariant = "header" | "footer" | "onDark";

type SiteLogoProps = {
  variant?: LogoVariant;
  className?: string;
  preview?: Partial<SiteSettings>;
};

export function SiteLogo({ variant = "header", className = "", preview }: SiteLogoProps) {
  const { settings } = useContent();
  const cfg = { ...settings, ...preview };
  const src = cfg.logoUrl?.trim() || defaultLogo;

  const height =
    variant === "footer"
      ? cfg.logoFooterHeight || 44
      : variant === "onDark"
        ? cfg.logoDarkHeight || 52
        : cfg.logoHeight || 36;

  const maxWidth = variant === "header" ? 220 : variant === "footer" ? 260 : 320;
  const useBlackBg = variant !== "onDark" && (cfg.logoBackground || "black") === "black";
  const padding = cfg.logoPadding ?? 6;
  const radius = cfg.logoRadius ?? 10;

  const image = (
    <img
      src={src}
      alt="Hatay360"
      className="object-contain object-left"
      style={{ height: `${height}px`, width: "auto", maxWidth: `${maxWidth}px` }}
    />
  );

  if (!useBlackBg) {
    return <span className={`inline-flex items-center ${className}`}>{image}</span>;
  }

  return (
    <span
      className={`inline-flex items-center bg-black ${className}`}
      style={{
        padding: `${padding}px ${padding + 8}px`,
        borderRadius: `${radius}px`,
      }}
    >
      {image}
    </span>
  );
}
