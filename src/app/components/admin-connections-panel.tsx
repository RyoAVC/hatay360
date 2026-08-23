import { useCallback, useEffect, useState } from "react";
import { Plug, RefreshCw } from "lucide-react";
import { apiRequest } from "../lib/api";

type ConnectionItem = { configured: boolean; detail: string };

type ConnectionsPayload = {
  smtp: ConnectionItem;
  iyzico: ConnectionItem;
  googleAds: ConnectionItem;
  metaAds: ConnectionItem;
  seoRank: ConnectionItem;
  cron: ConnectionItem;
  envHint: string[];
};

const SERVICE_ORDER: { key: keyof Omit<ConnectionsPayload, "envHint">; label: string }[] = [
  { key: "smtp", label: "SMTP / e-posta" },
  { key: "iyzico", label: "iyzico ödeme" },
  { key: "googleAds", label: "Google Ads" },
  { key: "metaAds", label: "Meta Ads" },
  { key: "seoRank", label: "SEO sıralama" },
  { key: "cron", label: "Cron" },
];

function ConnectionDot({ on }: { on: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i
        className={`inline-block h-2.5 w-2.5 rounded-full ${on ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" : "bg-zinc-500"}`}
        aria-hidden="true"
      />
      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/70">{on ? "Bağlı" : "Eksik"}</span>
    </span>
  );
}

export function AdminConnectionsPanel() {
  const [data, setData] = useState<ConnectionsPayload | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const next = await apiRequest<ConnectionsPayload>("/api/admin/connections");
      setData(next);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Bağlantılar yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3ec8dc]">Operasyon</p>
          <h2 className="mt-2 flex items-center gap-2 text-[26px] font-black">
            <Plug className="h-6 w-6 text-[#00a8c4]" /> Bağlantılar
          </h2>
          <p className="mt-2 max-w-2xl text-[12px] text-white/55">
            Dış servislerin anahtarları dolu mu, yok mu. Değerleri .env / hatay360.runtime.env’e yazın, buraya yapıştırmayın.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[11px] font-black text-white/70"
        >
          <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Yenile
        </button>
      </div>

      {notice ? <p className="rounded-xl border border-rose-400/30 bg-rose-950/40 px-4 py-3 text-[12px] font-bold text-rose-100">{notice}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {SERVICE_ORDER.map((item) => {
          const row = data?.[item.key];
          const on = Boolean(row?.configured);
          return (
            <div key={item.key} className="rounded-2xl border border-white/10 bg-[#18181f] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-black text-white">{item.label}</p>
                <ConnectionDot on={on} />
              </div>
              <p className="mt-2 text-[12px] font-bold text-white/50">{row?.detail || "—"}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#18181f] px-4 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#70dce9]">Gerekli env adları</p>
        <p className="mt-1 text-[11px] font-bold text-white/45">Sadece isimler. Değerler burada gösterilmez.</p>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {(data?.envHint || []).map((name) => (
            <li key={name} className="flex items-center gap-2 text-[12px] font-bold text-white/75">
              <span className="text-white/30">☐</span>
              <code className="rounded-md bg-black/35 px-2 py-0.5 text-[11px] text-[#9be7f0]">{name}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
