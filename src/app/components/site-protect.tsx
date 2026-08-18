import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { sectionOn, useContent } from "../context/content-context";

const NOTICE =
  "Bu tasarım, yazılım ve ticari görünüm Mahir Avcı / Avcı E-Ticaret’e aittir. İzinsiz kopyalama, çoğaltma, kaynak kodunu çıkarma veya türetme 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında hukuka aykırıdır.";

export function SiteProtect() {
  const { pathname } = useLocation();
  const { settings } = useContent();
  const [toast, setToast] = useState("");
  const enabled = sectionOn(settings, "siteProtect");
  const skip = pathname.startsWith("/panel") || pathname.startsWith("/musteri");

  useEffect(() => {
    if (!enabled || skip) return;

    const warn = () => {
      setToast(NOTICE);
      window.setTimeout(() => setToast(""), 4200);
    };

    const onContext = (event: MouseEvent) => {
      event.preventDefault();
      warn();
    };

    const onDrag = (event: DragEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "IMG") event.preventDefault();
    };

    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const block =
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        (event.ctrlKey && ["u", "s"].includes(key));
      if (block) {
        event.preventDefault();
        warn();
      }
    };

    document.addEventListener("contextmenu", onContext);
    document.addEventListener("dragstart", onDrag);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("keydown", onKey);
    };
  }, [enabled, skip]);

  if (!enabled || skip || !toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[80] mx-auto max-w-lg rounded-2xl border border-[#c9a227]/40 bg-[#071b22] px-4 py-3 text-center text-[12px] font-semibold leading-relaxed text-white shadow-[0_16px_40px_rgba(0,0,0,0.35)] md:bottom-8">
      {toast}
    </div>
  );
}
