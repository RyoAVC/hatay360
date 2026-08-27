import { Link } from "react-router";

export function PageCrumbs({ items, tone = "light" }: { items: { label: string; to?: string }[]; tone?: "light" | "dark" }) {
  const muted = tone === "dark" ? "text-white/55" : "text-[#8a87a8]";
  const current = tone === "dark" ? "text-white" : "text-[#1a1a1a]";
  const hover = tone === "dark" ? "hover:text-white" : "hover:text-[#00a8c4]";
  return (
    <nav aria-label="Sayfa yolu" className="print:hidden">
      <ol className={`flex flex-wrap items-center gap-x-1 text-[13px] ${muted}`}>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center">
            {index > 0 ? <span className="px-2">/</span> : null}
            {item.to ? (
              <Link to={item.to} className={hover}>
                {item.label}
              </Link>
            ) : (
              <span className={current}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
