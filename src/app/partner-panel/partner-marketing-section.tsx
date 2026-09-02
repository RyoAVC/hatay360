import { useState } from "react";
import { Award, Copy, Download, FileImage, FileText, Link2, ShieldCheck } from "lucide-react";
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
    { title: "Bayilik tanıtım PDF", icon: FileText, href: "/api/partners/dealer-intro.pdf", label: "PDF indir" },
    { title: "Sosyal medya görsel paketi", icon: FileImage, href: "/api/partners/social-media-kit.zip", label: "ZIP indir" },
    { title: "Hizmet özeti broşürü", icon: FileText, href: "/api/partners/service-brochure.pdf", label: "PDF indir" },
  ];
  const badgeHtml = `<a href="https://hatay360.com/firma/dogrula?code=${hub.referralCode}" target="_blank" rel="noopener"><img src="https://hatay360.com/brands/hatay360.png" alt="Hatay360 Yetkili Çözüm Ortağı" width="180"></a>`;

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

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 p-6">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-violet-400/15 p-2.5 text-violet-200"><Award className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-wider text-violet-200/60">Premium belge</p><h2 className="mt-1 text-[15px] font-black">Yetkili Çözüm Ortağı Sertifikası</h2></div></div>
          <p className="mt-4 text-xs leading-relaxed text-indigo-100/55">Firma adınız, yetkiliniz ve doğrulama kodunuzla hazırlanan kurumsal PDF.</p>
          <a href="/api/partners/certificate.pdf" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-black text-white hover:bg-violet-400"><Download className="h-4 w-4" /> Sertifikayı indir</a>
        </article>
        <article className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-400/15 p-2.5 text-emerald-200"><ShieldCheck className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-wider text-emerald-200/60">Web rozeti</p><h2 className="mt-1 text-[15px] font-black">Doğrulanmış bayi rozeti</h2></div></div>
          <code className="mt-4 block max-h-20 overflow-auto rounded-xl bg-black/25 p-3 text-[10px] leading-relaxed text-emerald-100/65">{badgeHtml}</code>
          <button type="button" onClick={() => copy("badge", badgeHtml)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 px-4 py-2.5 text-xs font-black text-emerald-100"><Copy className="h-4 w-4" /> {copied === "badge" ? "Kod kopyalandı" : "Rozet kodunu kopyala"}</button>
        </article>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {assets.map((asset) => {
          const Icon = asset.icon;
          return (
            <article
              key={asset.title}
              className="rounded-2xl border border-indigo-400/25 bg-[#12102a]/50 p-5"
            >
              <Icon className="h-5 w-5 text-indigo-300/70" />
              <h3 className="mt-3 text-[14px] font-black">{asset.title}</h3>
              <a
                href={asset.href}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-400/30 px-3.5 py-2 text-[11px] font-black text-indigo-100 hover:bg-indigo-500/20"
              >
                <Download className="h-3.5 w-3.5" /> {asset.label}
              </a>
            </article>
          );
        })}
      </div>
    </div>
  );
}
