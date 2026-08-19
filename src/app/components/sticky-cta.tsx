import { MessageCircle, Phone } from "lucide-react";
import { useContent } from "../context/content-context";
import { toTelHref, toWhatsAppHref } from "../lib/contact";

export function StickyCta() {
  const { settings } = useContent();
  const message = "Merhaba Hatay360, teklif almak istiyorum.";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ecebf5] bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md print:hidden md:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        <a
          href={toTelHref(settings.phone)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#ecebf5] text-[#00a8c4]"
          aria-label="Ara"
        >
          <Phone className="h-5 w-5" />
        </a>
        <a
          href={toWhatsAppHref(settings.phone, message)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#00a8c4] text-[15px] font-semibold text-white"
          aria-label="WhatsApp ile teklif iste"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
