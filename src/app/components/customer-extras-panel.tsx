import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { EmptyRow } from "./empty-row";
import { FormError } from "./form-error";
import { apiRequest } from "../lib/api";
import { formatTry } from "../lib/payment-balance";

export type ExtraService = {
  id: number;
  name: string;
  description: string;
  price: number;
};

type ExtraConfirm = {
  name: string;
  price: number;
};

function extraPriceLabel(price: number) {
  return Number(price) <= 0 ? "Teklifte" : formatTry(price);
}

export function CustomerExtrasPanel({
  onRequested,
}: {
  onRequested?: () => Promise<void> | void;
}) {
  const [extras, setExtras] = useState<ExtraService[]>([]);
  const [busyId, setBusyId] = useState(0);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<ExtraConfirm | null>(null);
  const [loading, setLoading] = useState(true);
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const extrasHeadingRef = useRef<HTMLHeadingElement>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await apiRequest<{ extras: ExtraService[] }>("/api/customer/extra-services");
      setExtras(result.extras || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Ek hizmetler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!confirm) return;
    confirmHeadingRef.current?.focus();
  }, [confirm]);

  const requestExtra = async (item: ExtraService) => {
    setBusyId(item.id);
    setError("");
    setConfirm(null);
    try {
      await apiRequest(`/api/customer/extra-services/${item.id}/request`, { method: "POST", body: "{}" });
      setConfirm({ name: item.name, price: item.price });
      await onRequested?.();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Talep gönderilemedi.");
    } finally {
      setBusyId(0);
    }
  };

  const dismissConfirm = () => {
    setConfirm(null);
    extrasHeadingRef.current?.focus();
  };

  return (
    <section className="rounded-[22px] border border-[#dce7e9] bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf9fa] text-[#00a8c4]">
          <ShoppingBag className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Upsell</p>
          <h2
            id="customer-extras-heading"
            ref={extrasHeadingRef}
            tabIndex={-1}
            className="mt-1 text-[20px] font-black outline-none focus-visible:ring-2 focus-visible:ring-[#00a8c4] focus-visible:ring-offset-2"
          >
            Ek Hizmetler
          </h2>
          <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-[#6c7c84]">
            Hazır hizmetlerden talep açın. Onaylanınca faturaya yansır; ödeme satırı otomatik oluşmaz.
          </p>
        </div>
      </div>
      {error ? <div className="mt-4"><FormError>{error}</FormError></div> : null}
      {confirm ? (
        <div
          className="mt-5 rounded-[24px] border border-[#9ad7e2] bg-[#e8f8fb] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="h-9 w-9 text-[#00a8c4]" aria-hidden />
          <p className="mt-3 inline-flex rounded-full bg-[#00a8c4]/12 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#007f98]">
            Taslak · onay bekliyor
          </p>
          <h3
            ref={confirmHeadingRef}
            tabIndex={-1}
            className="mt-2 text-[20px] font-black text-[#102b35] outline-none focus-visible:ring-2 focus-visible:ring-[#00a8c4] focus-visible:ring-offset-2"
          >
            Taslak katalog satırı açıldı
          </h3>
          <p className="mt-2 text-[14px] font-black text-[#007f98]">
            {confirm.name} · {extraPriceLabel(confirm.price)}
          </p>
          <ul className="mt-4 space-y-2.5">
            {[
              "Talep katalogda taslak satır olarak duruyor; henüz faturaya yazılmaz.",
              "Hatay360 onaylayınca satır aktifleşir ve faturaya yansır.",
              "Ödeme dönemi otomatik açılmaz.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00a8c4]" aria-hidden />
                <span className="text-[13px] leading-relaxed text-[#4d6169]">{line}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={dismissConfirm}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-xl border border-[#bfe1e6] bg-white px-4 py-2.5 text-[12px] font-black text-[#007f98]"
          >
            Başka hizmet talep et
          </button>
        </div>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {loading ? <p className="text-[12px] font-bold text-[#6c7c84]">Yükleniyor…</p> : null}
        {!loading && extras.length ? extras.map((item) => (
          <article key={item.id} className="flex flex-col rounded-2xl border border-[#dce7e9] bg-[#f7fbfc] p-4">
            <h3 className="text-[14px] font-black text-[#102b35]">{item.name}</h3>
            <p className="mt-1 flex-1 text-[11px] leading-relaxed text-[#64767e]">{item.description || "Açıklama yok."}</p>
            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-[15px] font-black text-[#007f98]">{extraPriceLabel(item.price)}</p>
              <button
                type="button"
                disabled={busyId === item.id}
                onClick={() => void requestExtra(item)}
                className="rounded-xl bg-[#00a8c4] px-3 py-2 text-[10px] font-black text-white disabled:opacity-50"
              >
                {busyId === item.id ? "Gönderiliyor…" : "Talep Et"}
              </button>
            </div>
          </article>
        )) : null}
        {!loading && !extras.length ? (
          <div className="sm:col-span-2">
            <EmptyRow icon={ShoppingBag} title="Ek hizmet yok" hint="Hatay360 mağazaya hizmet ekleyince kartlar burada açılır." />
          </div>
        ) : null}
      </div>
    </section>
  );
}
