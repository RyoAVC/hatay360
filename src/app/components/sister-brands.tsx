import hatay360Logo from "../../assets/hatay360-logo.png";
import avciLogo from "../../assets/sisters/avci-eticaret.png";

const SISTERS = [
  { name: "Hatay360", src: hatay360Logo, href: "https://hatay360.com", product: true },
  { name: "Avcı E-Ticaret", src: avciLogo, href: "https://avcieticaret.com", product: false },
  { name: "AvcNova", src: "", href: "https://avcnova.com", product: false },
] as const;

export function SisterBrandRow({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const size = compact ? 22 : 28;
  const productSize = compact ? 26 : 34;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {SISTERS.map((brand) => {
        const dim = brand.product ? productSize : size;
        return (
          <a
            key={brand.name}
            href={brand.href}
            target="_blank"
            rel="noreferrer"
            title={brand.name}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#dce7e9] bg-white px-2 py-1.5 no-underline"
          >
              {brand.src ? (
                <span
                  className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#071b22]"
                  style={{ width: dim, height: dim, padding: brand.product ? 3 : 2 }}
                >
                  <img src={brand.src} alt="" className="h-full w-full object-contain" />
                </span>
              ) : null}
            <span className="text-[10px] font-black text-[#102b35]">{brand.name}</span>
          </a>
        );
      })}
    </div>
  );
}
