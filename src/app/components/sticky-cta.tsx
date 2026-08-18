import { Link } from "react-router";
import { Phone } from "lucide-react";
import { useContent } from "../context/content-context";
import { toTelHref } from "../lib/contact";

export function StickyCta() {
  const { settings } = useContent();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ecebf5] bg-white/95 p-3 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        <a
          href={toTelHref(settings.phone)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#ecebf5] text-[#00a8c4]"
          aria-label="Ara"
        >
          <Phone className="h-5 w-5" />
        </a>
        <Link
          to="/iletisim"
          className="flex flex-1 items-center justify-center rounded-xl bg-[#00a8c4] text-[15px] font-semibold text-white"
        >
          Sizi arayalım
        </Link>
      </div>
    </div>
  );
}
