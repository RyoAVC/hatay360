import { useState } from "react";
import { Copy, FileImage, FileText, Link2 } from "lucide-react";
import type { PartnerHubData } from "./partner-panel-types";

export function PartnerMarketingSection({ hub }: { hub: PartnerHubData }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const assets = [
    { title: "Bayilik tanıtım PDF", icon: FileText },
    { title: "Sosyal medya görsel paketi", icon: FileImage },
    { title: "Hizmet özeti broşürü", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-indigo-300/80">Pazarlama</p>
        <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em]">Pazarlama kaynakları</h1>
        <p className="mt-2 text-[14px] text-indigo-100/55">Müşterilerinize göstereceğiniz materyaller ve özel linkiniz.</p>
      </header>

      <article className="rounded-2xl border border-indigo-400/25 bg-indigo-500/10 p-6">
        <div className="flex items-center gap-2 text-indigo-200/80">
          <Link2 className="h-4 w-4" />
          <h2 className="text-[15px] font-black">Bayiye özel referans linki</h2>
        </div>
        <p className="mt-2 text-[12px] text-indigo-100/50">
          Kod: <span className="font-mono font-bold text-indigo-100">{hub.referralCode}</span>
        </p>
        <div className="mt-4 space-y-3">
          {[
            { label: "Kayıt linki", url: hub.referralLinks.referralUrl },
            { label: "İletişim linki", url: hub.referralLinks.referralContactUrl },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-indigo-400/20 bg-[#0c0a18]/60 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-200/55">{item.label}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="flex-1 text-[12px] text-indigo-50/90 break-all">{item.url}</code>
                <button
                  type="button"
                  onClick={() => copy(item.label, item.url)}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-400/30 px-3 py-1.5 text-[11px] font-black text-indigo-100 hover:bg-indigo-500/20"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied === item.label ? "Kopyalandı" : "Kopyala"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-3">
        {assets.map((asset) => {
          const Icon = asset.icon;
          return (
            <article
              key={asset.title}
              className="rounded-2xl border border-dashed border-indigo-400/25 bg-[#12102a]/50 p-5"
            >
              <Icon className="h-5 w-5 text-indigo-300/70" />
              <h3 className="mt-3 text-[14px] font-black">{asset.title}</h3>
              <p className="mt-2 text-[12px] text-indigo-100/45">İçerik eklenecek</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
