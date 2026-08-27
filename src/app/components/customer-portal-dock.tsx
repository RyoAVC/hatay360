import { useEffect, useId, useRef, useState, type ComponentType } from "react";
import { LogOut, Menu, X } from "lucide-react";

export type PortalNavItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const dockIds = ["website", "campaigns", "payments"] as const;

export function CustomerPortalDock({
  nav,
  activeTab,
  onTab,
  onLogout,
  badgeFor,
}: {
  nav: PortalNavItem[];
  activeTab: string;
  onTab: (id: string) => void;
  onLogout: () => void;
  badgeFor?: (id: string) => number;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const dockItems = dockIds
    .map((id) => nav.find((item) => item.id === id))
    .filter((item): item is PortalNavItem => Boolean(item));

  const go = (id: string) => {
    onTab(id);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) menuBtnRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <div className="lg:hidden">
      {open ? (
        <button type="button" aria-label="Menüyü kapat" className="fixed inset-0 z-40 bg-[#071b22]/40" onClick={() => setOpen(false)} />
      ) : null}
      <div
        id={menuId}
        className={`fixed inset-x-0 bottom-[calc(3.85rem+env(safe-area-inset-bottom))] z-50 mx-3 overflow-hidden rounded-t-[22px] border border-[#16343d] bg-[#071b22] text-white shadow-[0_-12px_40px_rgba(7,27,34,0.28)] transition-transform duration-200 ${open ? "translate-y-0" : "pointer-events-none translate-y-4 opacity-0"}`}
        role="dialog"
        aria-modal={open}
        aria-labelledby={titleId}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p id={titleId} className="text-[10px] font-black uppercase tracking-[0.16em] text-[#70dce9]">
            Müşteri menüsü
          </p>
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-white/60" aria-label="Kapat">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="grid max-h-[min(58vh,420px)] grid-cols-2 gap-2 overflow-y-auto p-3" aria-label="Tüm sekmeler">
          {nav.map(({ id, label, icon: Icon }) => {
            const badge = badgeFor?.(id) || 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                aria-current={activeTab === id ? "page" : undefined}
                className={`relative flex items-center gap-2 rounded-xl px-3 py-3 text-left text-[11px] font-black ${activeTab === id ? "bg-[#00a8c4] text-white" : "bg-white/6 text-white/75"}`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {badge > 0 ? (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[8px] text-white" aria-label={`${badge} uyarı`}>
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-2 border-t border-white/10 px-4 py-3 text-[11px] font-black text-white/50">
          <LogOut className="h-4 w-4" aria-hidden /> Güvenli çıkış
        </button>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#16343d] bg-[#071b22] px-2 pt-2 text-white"
        style={{ paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))" }}
        aria-label="Müşteri alt menü"
      >
        <div className="grid grid-cols-4 gap-1">
          {dockItems.map(({ id, label, icon: Icon }) => {
            const badge = badgeFor?.(id) || 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                aria-current={activeTab === id ? "page" : undefined}
                className={`relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[9px] font-black ${activeTab === id ? "bg-[#00a8c4] text-white" : "text-white/60"}`}
              >
                <span className="relative">
                  <Icon className="h-4 w-4" aria-hidden />
                  {badge > 0 ? (
                    <span className="absolute -right-2 -top-1.5 min-w-[14px] rounded-full bg-rose-500 px-1 text-center text-[8px] leading-[14px] text-white" aria-hidden>
                      {badge > 9 ? "9+" : badge}
                    </span>
                  ) : null}
                </span>
                {label}
                {badge > 0 ? <span className="sr-only">{badge} uyarı</span> : null}
              </button>
            );
          })}
          <button
            ref={menuBtnRef}
            type="button"
            onClick={() => setOpen((current) => !current)}
            className={`relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[9px] font-black ${open ? "bg-white/12 text-white" : "text-white/60"}`}
            aria-expanded={open}
            aria-controls={menuId}
            aria-haspopup="dialog"
          >
            <span className="relative">
              <Menu className="h-4 w-4" aria-hidden />
              {(badgeFor?.("overview") || 0) + (badgeFor?.("contracts") || 0) + (badgeFor?.("support") || 0) + (badgeFor?.("services") || 0) > 0 ? (
                <span className="absolute -right-2 -top-1.5 h-2 w-2 rounded-full bg-rose-500" aria-hidden />
              ) : null}
            </span>
            Menü
          </button>
        </div>
      </nav>
    </div>
  );
}
