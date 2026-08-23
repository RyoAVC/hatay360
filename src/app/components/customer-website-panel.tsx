import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { Check, Copy, ExternalLink, Globe, Lock, MapPinned, MessageCircle, RefreshCw, ShieldCheck, Clock3, X } from "lucide-react";
import { napMatches } from "../lib/seo";
import { canEditSmallSiteFields, SITE_EDIT_COPY, type SiteEditMode } from "../lib/portal-package";
import { SITE_STATUS_LABELS, type SiteStatus } from "../lib/payment-balance";
import { StatusDot } from "./status-dot";
import { ServiceMark } from "./service-mark";
import { siteDotKind } from "../lib/ops-status";
import { metricsSourceLabel, splitAdsAndWeb, summarizeClickToSite, type DailyMetric } from "../lib/portal-metrics";
import { ADS_RANGES, type AdsRange, type AdsReportPayload } from "../lib/ads-bind";

export type PortalWebsite = {
  packageId: string;
  packageName: string;
  editMode: SiteEditMode;
  canEdit: boolean;
  url: string;
  logoUrl: string;
  phone: string;
  address: string;
  hours: string;
  sslStatus: "active" | "pending" | "unknown" | string;
  siteStatus?: "open" | "maintenance" | "closed" | string;
  siteError?: boolean;
  lastBackupAt: string;
  lastUpdateAt: string;
};

export type PortalMaps = {
  id: number | string;
  businessName: string;
  status: string;
  mapsUrl: string;
  address: string;
  phone: string;
  source: string;
};

const mapsStatus: Record<string, string> = {
  pending: "Kayıt bekleniyor",
  live: "Yayında",
  paused: "Duraklatıldı",
};

/** Kayıt yok, pending veya Maps URL yoksa portal CTA göster. */
export function needsMapsCta(maps: PortalMaps[] = []) {
  const listing = maps[0];
  if (!listing) return true;
  if (String(listing.status || "").toLowerCase() === "pending") return true;
  return !String(listing.mapsUrl || "").trim();
}

const sslLabel: Record<string, string> = {
  active: "SSL açık",
  pending: "SSL bekleniyor",
  unknown: "SSL durumu yok",
};

function formatWhen(value: string) {
  if (!value) return "Kayıt yok";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  return date.toLocaleString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function dash(value: string) {
  return String(value || "").trim() || "—";
}

/** Portal kayıtlı NAP — Google işletme / yazdırma için düz metin. Ücretsiz /araclar/nap-kontrol ile karıştırılmaz. */
export function buildPortalNapPack({
  companyName,
  phone,
  address,
  hours,
}: {
  companyName: string;
  phone: string;
  address: string;
  hours: string;
}) {
  return [
    dash(companyName),
    `Telefon: ${dash(phone)}`,
    `Adres: ${dash(address)}`,
    `Çalışma saati: ${dash(hours)}`,
  ].join("\n");
}

async function copyPlainText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* execCommand yedek */
  }
  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.setAttribute("aria-hidden", "true");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    field.style.top = "0";
    document.body.appendChild(field);
    field.focus();
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  } catch {
    return false;
  }
}

function NapCopyButton({
  companyName,
  phone,
  address,
  hours,
}: {
  companyName: string;
  phone: string;
  address: string;
  hours: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const ok = await copyPlainText(buildPortalNapPack({ companyName, phone, address, hours }));
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={copied ? "NAP panoya kopyalandı" : "Kayıtlı işletme adı, telefon, adres ve çalışma saatini kopyala"}
      aria-live="polite"
      className="inline-flex items-center gap-1.5 rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Kopyalandı" : "NAP kopyala"}
    </button>
  );
}

function Chip({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "ok" | "wait" | "muted" }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "wait"
        ? "bg-amber-50 text-amber-800"
        : tone === "muted"
          ? "bg-slate-100 text-slate-600"
          : "bg-[#e7f7fa] text-[#007f98]";
  return <span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wide ${cls}`}>{children}</span>;
}

export function AdsVsWebCard({
  dailyMetrics,
  metricsSource,
  adsConnection,
}: {
  dailyMetrics: DailyMetric[];
  metricsSource: string;
  adsConnection: { live: boolean; status: string; label: string; detail: string; googleBound?: boolean; metaBound?: boolean };
}) {
  const { ads, web } = splitAdsAndWeb(dailyMetrics);
  const conversion = summarizeClickToSite(dailyMetrics);
  const source = metricsSourceLabel(dailyMetrics);
  const max = Math.max(1, ...ads.map((row) => row.clicks), ...web.map((row) => row.visitors));
  const today = dailyMetrics[dailyMetrics.length - 1];

  return (
    <section className="mt-7 rounded-[22px] border border-[#dce7e9] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ServiceMark name="Google Ads" size={28} />
            <ServiceMark name="Web sitesi" size={28} />
          </div>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Reklam tıklaması ≠ site ziyareti</p>
          <h2 className="mt-1 text-[20px] font-black">Aynı gün, iki ayrı sayı</h2>
          <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-[#64767e]">
            Reklam: kampanya tıklaması / harcama / gösterim. Site: o gün siteye giren kişi ve oturum. 1000 tıklama ile 5 ziyaret aynı gün olabilir; karıştırılmaz.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip tone={adsConnection.live ? "ok" : "wait"}>Google Ads API: {adsConnection.live ? "bağlı" : "bekleniyor"}</Chip>
          <Chip tone={source === "örnek" ? "wait" : "ok"}>{source === "örnek" ? "Örnek seri" : source === "panel" ? "Panel kaydı" : source === "karışık" ? "Karışık kayıt" : "Kayıt yok"}</Chip>
        </div>
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-[#87969c]">{adsConnection.detail}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Reklam tıklaması (toplam)", value: conversion.adsClicks.toLocaleString("tr-TR"), hint: "kampanya" },
          { label: "Siteye giren kişi", value: conversion.siteVisitors.toLocaleString("tr-TR"), hint: "web" },
          { label: "Site oturumu", value: conversion.siteSessions.toLocaleString("tr-TR"), hint: "web" },
          { label: "Tıklama → site", value: conversion.percentLabel, hint: conversion.adsClicks ? "oran" : "hesap yok" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-[#e4ecee] bg-[#f7fbfc] px-4 py-3">
            <p className="text-[8px] font-black uppercase tracking-wide text-[#00a8c4]">{item.hint}</p>
            <p className="mt-1 text-[9px] font-bold text-[#829097]">{item.label}</p>
            <p className="mt-1 text-[18px] font-black">{item.value}</p>
          </div>
        ))}
      </div>
      {today && (
        <p className="mt-3 text-[11px] font-semibold text-[#405963]">
          Son gün ({today.day}): {today.adsClicks.toLocaleString("tr-TR")} reklam tıklaması · {today.siteVisitors.toLocaleString("tr-TR")} site ziyareti
        </p>
      )}
      <p className="mt-2 text-[11px] text-[#64767e]">{conversion.label}</p>

      {dailyMetrics.length > 0 && (
        <div className="mt-6">
          <div className="flex gap-3 text-[8px] font-black">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#2563eb]" /> Reklam tıklaması</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#00a8c4]" /> Site ziyareti</span>
          </div>
          <div className="mt-4 flex min-h-[150px] items-end gap-2 overflow-x-auto pb-2">
            {dailyMetrics.map((row, index) => (
              <div key={row.day} className="flex min-w-[42px] flex-1 flex-col items-center">
                <div className="flex h-[120px] items-end gap-1">
                  <span title={`Reklam tıklaması: ${ads[index].clicks}`} className="w-3.5 rounded-t-md bg-[#2563eb]" style={{ height: `${Math.max(4, (ads[index].clicks / max) * 100)}%` }} />
                  <span title={`Site ziyareti: ${web[index].visitors}`} className="w-3.5 rounded-t-md bg-[#00a8c4]" style={{ height: `${Math.max(4, (web[index].visitors / max) * 100)}%` }} />
                </div>
                <p className="mt-1 text-[7px] font-black text-[#4e6570]">{row.day.slice(5)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {metricsSource === "sample" && <p className="mt-3 text-[9px] font-bold text-amber-700">Bu günlük seri örnek kayıttır. Canlı Google Ads veya site ölçümü bağlanınca değişir.</p>}
    </section>
  );
}

function napFieldState(left: string, right: string) {
  const a = String(left || "").trim();
  const b = String(right || "").trim();
  if (!a || !b) return "missing" as const;
  return napMatches(a, b) ? ("ok" as const) : ("mismatch" as const);
}

export function TrustStrip({ website, maps, companyName, companyPhone }: { website: PortalWebsite; maps: PortalMaps[]; companyName: string; companyPhone: string }) {
  const listing = maps[0];
  const nameOk = listing ? napFieldState(listing.businessName, companyName) === "ok" : false;
  const phoneOk = listing ? napFieldState(listing.phone, website.phone || companyPhone) === "ok" : false;
  const addressState = listing ? napFieldState(listing.address, website.address) : "missing";
  const addressOk = addressState === "ok" || addressState === "missing";
  const napOk = Boolean(listing && nameOk && phoneOk && addressOk);

  const siteStatus = (website.siteStatus || "open") as SiteStatus;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <StatusDot kind={siteDotKind(siteStatus, website.siteError)} label={SITE_STATUS_LABELS[siteStatus] || "Site"} />
      <Chip tone={website.sslStatus === "active" ? "ok" : website.sslStatus === "pending" ? "wait" : "muted"}>{sslLabel[website.sslStatus] || "SSL"}</Chip>
      <Chip tone={website.lastBackupAt ? "ok" : "muted"}>Yedek: {formatWhen(website.lastBackupAt)}</Chip>
      <Chip tone={website.lastUpdateAt ? "ok" : "muted"}>Son güncelleme: {formatWhen(website.lastUpdateAt)}</Chip>
      {listing && <Chip tone="ok">Sahte yorum yok</Chip>}
      {listing && <Chip tone={napOk ? "ok" : "wait"}>{napOk ? "NAP uyumlu" : "NAP kontrol edin"}</Chip>}
    </div>
  );
}

function NapRow({
  label,
  mapsValue,
  siteValue,
  state,
}: {
  label: string;
  mapsValue: string;
  siteValue: string;
  state: "ok" | "mismatch" | "missing";
}) {
  const tone =
    state === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : state === "mismatch"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-[#e4ecee] bg-[#f7fbfc] text-[#64767e]";
  const Icon = state === "ok" ? Check : X;
  return (
    <div className={`rounded-xl border px-3 py-3 ${tone}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-black uppercase tracking-[0.14em]">{label}</p>
        <span className="inline-flex items-center gap-1 text-[9px] font-black">
          <Icon className="h-3 w-3" />
          {state === "ok" ? "Uyumlu" : state === "mismatch" ? "Farklı" : "Eksik"}
        </span>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-[8px] font-black uppercase tracking-wide opacity-70">Google Maps</p>
          <p className="mt-0.5 text-[12px] font-bold leading-snug">{mapsValue || "—"}</p>
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-wide opacity-70">Site / hesap</p>
          <p className="mt-0.5 text-[12px] font-bold leading-snug">{siteValue || "—"}</p>
        </div>
      </div>
    </div>
  );
}

/** Maps ↔ site NAP karşılaştırma; telefon/adresi haritadan forma kopyalar. */
export function NapAlignmentPanel({
  website,
  maps,
  companyName,
  companyPhone,
  editable,
  onApplyFromMaps,
  onRequestMaps,
}: {
  website: PortalWebsite;
  maps: PortalMaps[];
  companyName: string;
  companyPhone: string;
  editable: boolean;
  onApplyFromMaps?: (fields: { phone: string; address: string }) => void;
  onRequestMaps?: () => void;
}) {
  const listing = maps[0];
  if (!listing) {
    return (
      <section className="rounded-[22px] border border-dashed border-[#cbdadd] bg-white p-5 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">NAP tutarlılık</p>
        <h3 className="mt-2 text-[18px] font-black">Harita kaydı yok — karşılaştırma yapılamıyor</h3>
        <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-[#64767e]">
          Ad / adres / telefon (NAP) Google işletme kaydı ile site aynı olmalı. Önce harita kaydını bağlayın.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/google-maps-harita-kaydi"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a73e8] px-3.5 py-2.5 text-[11px] font-black text-white"
          >
            <MapPinned className="h-3.5 w-3.5" /> Harita kaydı
          </Link>
          {onRequestMaps ? (
            <button
              type="button"
              onClick={onRequestMaps}
              className="inline-flex items-center rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]"
            >
              Maps hizmeti iste
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  const sitePhone = website.phone || companyPhone;
  const nameState = napFieldState(listing.businessName, companyName);
  const phoneState = napFieldState(listing.phone, sitePhone);
  const addressState = napFieldState(listing.address, website.address);
  const canCopy =
    Boolean(onApplyFromMaps) &&
    editable &&
    (phoneState !== "ok" || addressState !== "ok") &&
    Boolean(listing.phone || listing.address);
  const allOk = nameState === "ok" && phoneState === "ok" && (addressState === "ok" || addressState === "missing");

  return (
    <section className={`rounded-[22px] border p-5 shadow-sm ${allOk ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200/80 bg-white"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">NAP tutarlılık</p>
          <h3 className="mt-1 text-[18px] font-black">{allOk ? "Harita ve site uyumlu" : "Harita ile site NAP’ı farklı"}</h3>
          <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-[#64767e]">
            Yerel sıralamada ad, adres ve telefon aynı yazılmalı. Aşağıda Google kaydı ile paneldeki site bilgisi yan yana.
          </p>
        </div>
        <Chip tone={allOk ? "ok" : "wait"}>{allOk ? "NAP OK" : "Düzeltin"}</Chip>
      </div>
      <div className="mt-4 space-y-2">
        <NapRow label="İşletme adı (N)" mapsValue={listing.businessName} siteValue={companyName} state={nameState} />
        <NapRow label="Adres (A)" mapsValue={listing.address} siteValue={website.address} state={addressState} />
        <NapRow label="Telefon (P)" mapsValue={listing.phone} siteValue={sitePhone} state={phoneState} />
      </div>
      {nameState === "mismatch" ? (
        <p className="mt-3 text-[11px] leading-relaxed text-amber-900/90">
          İşletme adı hesap / harita kaydından gelir; paneldan değiştirilemez. Adı düzeltmek için Maps hizmeti veya ticket açın.
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {canCopy ? (
          <button
            type="button"
            onClick={() =>
              onApplyFromMaps?.({
                phone: listing.phone || sitePhone,
                address: listing.address || website.address,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a8c4] px-3.5 py-2.5 text-[11px] font-black text-white"
          >
            <Copy className="h-3.5 w-3.5" /> Haritadaki telefon ve adresi forma al
          </button>
        ) : null}
        {!editable && (phoneState !== "ok" || addressState !== "ok") ? (
          <p className="text-[11px] font-bold text-[#64767e]">Bu pakette self-servis alan düzenleme yok; Hatay360’a ticket yazın.</p>
        ) : null}
        {onRequestMaps && nameState === "mismatch" ? (
          <button
            type="button"
            onClick={onRequestMaps}
            className="inline-flex items-center rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]"
          >
            Maps düzeltme iste
          </button>
        ) : null}
        {listing.mapsUrl ? (
          <a
            href={listing.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]"
          >
            Haritada aç <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
      {canCopy ? (
        <p className="mt-3 text-[10px] text-[#87969c]">Forma alındıktan sonra «Küçük alanları kaydet» ile paneli güncelleyin.</p>
      ) : null}
    </section>
  );
}

export function AdsReportScaffold({
  report,
  range,
  onRange,
}: {
  report: AdsReportPayload | null;
  range: AdsRange;
  onRange: (next: AdsRange) => void;
}) {
  const binding = report?.binding;
  const series = report?.series || [];
  const source = report?.source || "none";
  const isHatay360 = source === "hatay360" && series.length > 0;
  const max = Math.max(1, ...series.map((row) => row.adsClicks));

  return (
    <section className="mt-5 rounded-[22px] border border-[#dce7e9] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Otomatik performans raporu</p>
          <h3 className="mt-1 text-[18px] font-black">Google Ads / Meta iskeleti</h3>
          <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-[#64767e]">
            Canlı API kapalı. Aralık seçince boş grafik veya Hatay360 kaydı görünür; Google/Meta sayısı uydurulmaz.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip tone={binding?.googleBound ? "ok" : "muted"}>Google {binding?.googleBound ? "kayıtlı" : "yok"}</Chip>
          <Chip tone={binding?.metaBound ? "ok" : "muted"}>Meta {binding?.metaBound ? "kayıtlı" : "yok"}</Chip>
          <Chip tone="wait">Canlı API kapalı</Chip>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Rapor aralığı">
        {ADS_RANGES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onRange(item)}
            className={`rounded-full px-3 py-1.5 text-[10px] font-black ${range === item ? "bg-[#00a8c4] text-white" : "border border-[#dbe5e8] bg-white text-[#405963]"}`}
          >
            {item} gün
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-[#87969c]">{binding?.detail || "Hesap ID’si henüz eşleşmedi."}</p>
      {isHatay360 ? (
        <>
          <p className="mt-3 text-[10px] font-black uppercase tracking-wide text-[#007f98]">Kaynak: Hatay360 kaydı — canlı Google/Meta değil</p>
          <div className="mt-4 flex min-h-[140px] items-end gap-2 overflow-x-auto pb-2">
            {series.map((row) => (
              <div key={row.day} className="flex min-w-[36px] flex-1 flex-col items-center">
                <div className="flex h-[110px] items-end">
                  <span
                    title={`${row.day}: ${row.adsClicks} tıklama (Hatay360)`}
                    className="w-3.5 rounded-t-md bg-[#94a3b8]"
                    style={{ height: `${Math.max(4, (row.adsClicks / max) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[7px] font-bold text-[#93a0a6]">{row.day.slice(5)}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4 flex min-h-[140px] items-end gap-1.5 rounded-xl border border-dashed border-[#d5e0e3] bg-[#f7f9fa] px-3 pb-2 pt-6">
          {Array.from({ length: Math.min(range, 14) }, (_, index) => (
            <div key={index} className="flex flex-1 flex-col items-center">
              <span className="w-full max-w-[10px] rounded-t-md bg-[#e2e8ed]" style={{ height: `${10 + (index % 4) * 6}px` }} />
            </div>
          ))}
        </div>
      )}
      {!isHatay360 ? (
        <p className="mt-2 text-[10px] font-bold text-[#93a0a6]">Canlı seri yok · örnek harcama çizilmez</p>
      ) : null}
    </section>
  );
}

export function CampaignsEmptyCard({
  adsConnection,
  onRequestAds,
  onWhatsApp,
}: {
  adsConnection: { live: boolean; detail: string };
  onRequestAds?: () => void;
  onWhatsApp?: () => void;
}) {
  return (
    <div className="rounded-[22px] border border-dashed border-[#cbdadd] bg-white p-6 shadow-sm xl:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ServiceMark name="Google Ads" size={36} />
          <ServiceMark name="Meta" size={36} />
        </div>
        <Chip tone={adsConnection.live ? "ok" : "wait"}>
          Google Ads API: {adsConnection.live ? "bağlı" : "bekleniyor"}
        </Chip>
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Sonraki adımlar</p>
      <h3 className="mt-2 text-[18px] font-black text-[#102b35]">Henüz kampanya bağlanmadı</h3>
      <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-[#64767e]">
        Google veya Meta hesabınız Hatay360’a eklenince harcama, tıklama ve net sonuç burada görünür. Yukarıdaki sıfırlar boş hesap özeti; canlı bütçe değildir.
      </p>
      <p className="mt-2 text-[10px] leading-relaxed text-[#87969c]">{adsConnection.detail}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {onRequestAds ? (
          <button
            type="button"
            onClick={onRequestAds}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a8c4] px-3.5 py-2.5 text-[11px] font-black text-white"
          >
            Reklam yönetimi iste
          </button>
        ) : null}
        <Link
          to="/paketler"
          className="inline-flex items-center rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]"
        >
          Paketlere bak
        </Link>
        {onWhatsApp ? (
          <button
            type="button"
            onClick={onWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#00a8c4]" /> WhatsApp
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function WebsiteEmptyCard({
  website,
  onRequestWebsite,
  onCheckDomain,
  onWhatsApp,
}: {
  website: PortalWebsite;
  onRequestWebsite?: () => void;
  onCheckDomain?: () => void;
  onWhatsApp?: () => void;
}) {
  const sslTone = website.sslStatus === "active" ? "ok" : website.sslStatus === "pending" ? "wait" : "muted";
  return (
    <div className="rounded-[22px] border border-dashed border-[#cbdadd] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ServiceMark name="Web sitesi" size={36} />
          <Globe className="h-5 w-5 text-[#00a8c4]" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="muted">Site URL: yok</Chip>
          <Chip tone={sslTone}>{sslLabel[website.sslStatus] || "SSL"}</Chip>
          <Chip tone={website.lastBackupAt ? "ok" : "muted"}>
            Yedek: {website.lastBackupAt ? formatWhen(website.lastBackupAt) : "yok"}
          </Chip>
        </div>
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Sonraki adımlar</p>
      <h3 className="mt-2 text-[18px] font-black text-[#102b35]">Site adresi henüz bağlanmadı</h3>
      <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-[#64767e]">
        Yayın URL’si Hatay360 paneline yazılınca SSL, yedek ve güncelleme burada canlı görünür. Şu anki SSL/yedek rozetleri boş kayıt; site yayında sayılmaz.
      </p>
      <p className="mt-2 text-[10px] leading-relaxed text-[#87969c]">
        Paket: {website.packageName || "atanmadı"}
        {website.packageId ? ` · ${website.packageId}` : ""}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {onRequestWebsite ? (
          <button
            type="button"
            onClick={onRequestWebsite}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a8c4] px-3.5 py-2.5 text-[11px] font-black text-white"
          >
            Web sitesi hizmeti iste
          </button>
        ) : null}
        {onCheckDomain ? (
          <button
            type="button"
            onClick={onCheckDomain}
            className="inline-flex items-center rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]"
          >
            Domain sorgula
          </button>
        ) : (
          <Link
            to="/paketler"
            className="inline-flex items-center rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]"
          >
            Paketlere bak
          </Link>
        )}
        {onWhatsApp ? (
          <button
            type="button"
            onClick={onWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#00a8c4]" /> WhatsApp
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function MapsEmptyCard({ maps = [], onRequestMaps }: { maps?: PortalMaps[]; onRequestMaps?: () => void }) {
  const listing = maps[0];
  const pending = String(listing?.status || "").toLowerCase() === "pending";
  const title = !listing
    ? "Henüz bağlı harita kaydı yok"
    : pending
      ? "Harita kaydı bekleniyor"
      : "Harita bağlantısı henüz yok";
  const hint = !listing
    ? "Yeni işletme profili için kayıt sihirbazını doldurun. Daha önce başvurdunuzsa Hatay360 eşleşince burada görünür."
    : pending
      ? `${listing.businessName ? `${listing.businessName} · ` : ""}Başvuru alındı. Yayın linki eklenince harita burada açılır.`
      : `${listing.businessName ? `${listing.businessName} · ` : ""}İşletme kaydı var; Google Maps bağlantısı henüz eklenmedi.`;
  return (
    <section className="rounded-[22px] border border-dashed border-[#cbdadd] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ServiceMark name="Google Maps" size={36} />
          <MapPinned className="h-5 w-5 text-[#00a8c4]" />
        </div>
        <Chip tone="wait">{listing ? mapsStatus[listing.status] || listing.status : "Kayıt yok"}</Chip>
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Sonraki adımlar</p>
      <h3 className="mt-2 text-[18px] font-black text-[#102b35]">{title}</h3>
      <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-[#64767e]">{hint}</p>
      <p className="mt-2 text-[10px] leading-relaxed text-[#87969c]">Sıra garantisi yok. Harita kaydı genel başvuru sayfasından ilerler.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to="/google-maps-harita-kaydi"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a73e8] px-3.5 py-2.5 text-[11px] font-black text-white"
        >
          <MapPinned className="h-3.5 w-3.5" /> Harita kaydı başlat
        </Link>
        {onRequestMaps ? (
          <button
            type="button"
            onClick={onRequestMaps}
            className="inline-flex items-center rounded-xl border border-[#dbe5e8] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#405963]"
          >
            Panelden Maps hizmeti iste
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function MapsCard({ maps, onRequestMaps }: { maps: PortalMaps[]; onRequestMaps?: () => void }) {
  if (needsMapsCta(maps)) {
    return <MapsEmptyCard maps={maps} onRequestMaps={onRequestMaps} />;
  }
  return (
    <section className="rounded-[22px] border border-[#dce7e9] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <ServiceMark name="Google Maps" size={30} />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Harita yönetimi</p>
          <h2 className="mt-0.5 text-[18px] font-black">Google işletme kaydı</h2>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-[#64767e]">Sıra garantisi yok. Burada yalnızca kayıtlı işletme adı, durum ve bağlantı görünür.</p>
      {maps.map((item) => (
        <article key={item.id} className="mt-4 rounded-xl border border-[#e4ecee] bg-[#f7fbfc] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-[#00a8c4]" />
              <h3 className="text-[14px] font-black">{item.businessName}</h3>
            </div>
            <Chip tone={item.status === "live" ? "ok" : "wait"}>{mapsStatus[item.status] || item.status}</Chip>
          </div>
          {item.address && <p className="mt-2 text-[11px] text-[#64767e]">{item.address}</p>}
          {item.phone && <p className="mt-1 text-[11px] text-[#64767e]">{item.phone}</p>}
          <a href={item.mapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-[#008fac]">Haritada aç <ExternalLink className="h-3 w-3" /></a>
        </article>
      ))}
    </section>
  );
}

function SslBackupNotice({
  website,
  onRequestSsl,
  onWhatsApp,
}: {
  website: PortalWebsite;
  onRequestSsl?: () => void;
  onWhatsApp?: () => void;
}) {
  const sslOff = String(website.sslStatus || "").toLowerCase() !== "active";
  const noBackup = !String(website.lastBackupAt || "").trim();
  if (!sslOff && !noBackup) return null;

  const sslUnknown = String(website.sslStatus || "").toLowerCase() !== "pending";
  const sslTitle = sslUnknown ? "SSL kaydı yok / bekleniyor" : "SSL henüz açık görünmüyor";
  const sslHint = sslUnknown
    ? "Panelde sertifika kaydı yok veya bekleniyor; canlı tarayıcı kilidi kırık sayılmaz."
    : "Tarayıcı kilidi yoksa Hatay360’a yazın.";

  return (
    <div className="mt-3 rounded-xl border border-[#e4ecee] bg-[#f7fbfc] px-3.5 py-3">
      {sslOff ? (
        <>
          <p className="text-[12px] font-black text-[#102b35]">{sslTitle}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#64767e]">{sslHint}</p>
        </>
      ) : null}
      {noBackup ? (
        <>
          <p className={`${sslOff ? "mt-2 " : ""}text-[12px] font-black text-[#102b35]`}>Yedek tarihi yok</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#64767e]">
            Otomatik yedek başlatılmaz; Hatay360 kaydı boşsa burası boş kalır.
          </p>
        </>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {onRequestSsl ? (
          <button
            type="button"
            onClick={onRequestSsl}
            className="inline-flex items-center rounded-lg bg-[#00a8c4] px-3 py-2 text-[10px] font-black text-white"
          >
            SSL / yedek iste
          </button>
        ) : null}
        {onWhatsApp ? (
          <button
            type="button"
            onClick={onWhatsApp}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#dbe5e8] bg-white px-3 py-2 text-[10px] font-black text-[#405963]"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#00a8c4]" /> WhatsApp
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function CustomerWebsitePanel({
  website,
  maps,
  companyName,
  companyPhone,
  busy,
  onSave,
  onRequestMaps,
  onRequestWebsite,
  onRequestSsl,
  onCheckDomain,
  onWhatsApp,
}: {
  website: PortalWebsite;
  maps: PortalMaps[];
  companyName: string;
  companyPhone: string;
  busy: boolean;
  onSave: (fields: { logoUrl: string; phone: string; address: string; hours: string }) => Promise<void>;
  onRequestMaps?: () => void;
  onRequestWebsite?: () => void;
  onRequestSsl?: () => void;
  onCheckDomain?: () => void;
  onWhatsApp?: () => void;
}) {
  const editable = canEditSmallSiteFields(website.packageId);
  const hasUrl = Boolean(website.url);
  const [form, setForm] = useState({
    logoUrl: website.logoUrl,
    phone: website.phone,
    address: website.address,
    hours: website.hours,
  });

  useEffect(() => {
    setForm({
      logoUrl: website.logoUrl,
      phone: website.phone,
      address: website.address,
      hours: website.hours,
    });
  }, [website.logoUrl, website.phone, website.address, website.hours]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSave(form);
  };

  const napCopy = (
    <NapCopyButton
      companyName={companyName}
      phone={form.phone || website.phone || companyPhone}
      address={form.address || website.address}
      hours={form.hours || website.hours}
    />
  );

  return (
    <div className="mt-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-xl text-[11px] font-bold leading-relaxed text-[#64767e]">
          Kayıtlı ad, telefon, adres ve saat — Google işletme veya yazdırma için tek blok.
        </p>
        {napCopy}
      </div>
      {!hasUrl ? (
        <WebsiteEmptyCard
          website={website}
          onRequestWebsite={onRequestWebsite}
          onCheckDomain={onCheckDomain}
          onWhatsApp={onWhatsApp}
        />
      ) : null}

      <NapAlignmentPanel
        website={{ ...website, phone: form.phone || website.phone, address: form.address || website.address }}
        maps={maps}
        companyName={companyName}
        companyPhone={companyPhone}
        editable={editable}
        onRequestMaps={onRequestMaps}
        onApplyFromMaps={(fields) => setForm((current) => ({ ...current, phone: fields.phone, address: fields.address }))}
      />

      {hasUrl || editable ? (
        <section className="rounded-[22px] border border-[#dce7e9] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ServiceMark name="Web sitesi" size={32} />
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00a8c4]">Web sitesi yönetimi</p>
              </div>
              <h2 className="mt-2 text-[21px] font-black">{website.packageName}</h2>
              <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-[#64767e]">{SITE_EDIT_COPY[website.editMode]}</p>
            </div>
            {hasUrl ? (
              <a href={website.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-[#e7f7fa] px-3 py-2 text-[10px] font-black text-[#007f98]">Siteyi aç <ExternalLink className="h-3 w-3" /></a>
            ) : (
              <Chip tone="muted">Site adresi yok · alanlar hazır</Chip>
            )}
          </div>
          {hasUrl ? <TrustStrip website={website} maps={maps} companyName={companyName} companyPhone={companyPhone} /> : null}
          {hasUrl ? <SslBackupNotice website={website} onRequestSsl={onRequestSsl} onWhatsApp={onWhatsApp} /> : null}
          {website.logoUrl && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#f7fbfc] p-3">
              <img src={website.logoUrl} alt="" className="h-12 w-12 rounded-lg object-contain bg-white" />
              <p className="text-[11px] font-bold text-[#405963]">Kayıtlı logo</p>
            </div>
          )}

          {editable ? (
            <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-2">
              {!hasUrl ? (
                <p className="sm:col-span-2 text-[11px] leading-relaxed text-[#64767e]">
                  URL bağlanmadan telefon, adres ve saat kaydı NAP kontrolü için saklanır; SSL/yedek canlı sayılmaz.
                </p>
              ) : null}
              <label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">Logo adresi (https)
                <input value={form.logoUrl} onChange={(event) => setForm({ ...form, logoUrl: event.target.value })} placeholder="https://…" className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] font-bold normal-case tracking-normal outline-none focus:border-[#00a8c4]" />
              </label>
              <label className="text-[9px] font-black uppercase tracking-wide text-[#718188]">İletişim telefonu
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] font-bold normal-case tracking-normal outline-none focus:border-[#00a8c4]" />
              </label>
              <label className="sm:col-span-2 text-[9px] font-black uppercase tracking-wide text-[#718188]">Adres
                <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] font-bold normal-case tracking-normal outline-none focus:border-[#00a8c4]" />
              </label>
              <label className="sm:col-span-2 text-[9px] font-black uppercase tracking-wide text-[#718188]">Çalışma saati
                <input value={form.hours} onChange={(event) => setForm({ ...form, hours: event.target.value })} placeholder="Pzt–Cuma 09:00–18:00" className="mt-2 w-full rounded-xl border border-[#dbe5e8] px-3 py-2.5 text-[12px] font-bold normal-case tracking-normal outline-none focus:border-[#00a8c4]" />
              </label>
              <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#008fac] px-4 py-3 text-[11px] font-black text-white disabled:opacity-50">
                <RefreshCw className="h-4 w-4" /> {busy ? "Kaydediliyor…" : "Küçük alanları kaydet"}
              </button>
            </form>
          ) : hasUrl ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#dce7e9] bg-[#f7fbfc] p-4">
              {website.editMode === "own-panel" ? <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#00a8c4]" /> : <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#00a8c4]" />}
              <div>
                <p className="text-[12px] font-black">
                  {website.editMode === "own-panel" ? "Siteyi kendi panelinizden yönetin." : "Bu pakette self-servis site düzenleme yok."}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#64767e]">Hatay360 burada SSL, yedek, harita ve reklam durumunu gösterir. Tam içerik yönetimi her pakette açılmaz.</p>
                <div className="mt-3 grid gap-2 text-[11px] text-[#405963]">
                  {website.phone && <p>Telefon: {website.phone}</p>}
                  {website.address && <p>Adres: {website.address}</p>}
                  {website.hours && <p>Saat: {website.hours}</p>}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <MapsCard maps={maps} onRequestMaps={onRequestMaps} />
    </div>
  );
}

export function SupportQuick({ whatsappHref, note }: { whatsappHref: string; note?: ReactNode }) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2">
      <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[22px] bg-[#16a34a] p-5 text-white">
        <span>
          <b className="block text-[14px] font-black">WhatsApp ile yazın</b>
          <span className="mt-1 block text-[11px] text-white/80">Telefon beklemeyin; mesajınız kayda geçer.</span>
        </span>
        <MessageCircle className="h-5 w-5" />
      </a>
      <div className="flex items-center gap-3 rounded-[22px] border border-[#dce7e9] bg-white p-5">
        <ShieldCheck className="h-5 w-5 text-[#00a8c4]" />
        <p className="text-[11px] leading-relaxed text-[#64767e]">Ticket buradan açılır, Hatay360 yanıtı aynı ekranda görünür.{note ? <> {note}</> : null}</p>
      </div>
    </div>
  );
}

export function PortalServiceStrip({
  website,
  maps,
  campaignCount,
  adsSpend,
  onOpen,
}: {
  website: PortalWebsite;
  maps: PortalMaps[];
  campaignCount: number;
  adsSpend: string;
  onOpen: (tab: "website" | "campaigns" | "services") => void;
}) {
  const listing = maps[0];
  const mapsKind = listing?.status === "live" ? "live" : listing?.status === "paused" ? "off" : "maintenance";
  const tiles = [
    {
      key: "website" as const,
      title: "Web sitesi",
      mark: "Web sitesi",
      line: website.url ? website.url.replace(/^https?:\/\//, "") : website.packageName,
      hint: "Site paneli",
      extra: <StatusDot kind={siteDotKind(website.siteStatus, website.siteError)} label={SITE_STATUS_LABELS[(website.siteStatus || "open") as SiteStatus]} />,
    },
    {
      key: "campaigns" as const,
      title: "Reklam",
      mark: "Google Ads",
      line: campaignCount ? `${campaignCount} kampanya · ${adsSpend}` : "Kampanya henüz bağlanmadı",
      hint: "Tıklama ≠ site ziyareti",
      extra: <ServiceMark name="Meta" size={22} />,
    },
    {
      key: (listing ? "website" : "services") as "website" | "services",
      title: "Google Maps",
      mark: "Google Maps SEO",
      line: listing ? listing.businessName : "Kayıt yok · hizmet isteyin",
      hint: listing ? "Harita durumu" : "Yeni Maps kaydı",
      extra: <StatusDot kind={mapsKind} label={listing ? mapsStatus[listing.status] || listing.status : "Bekliyor"} />,
    },
  ];
  return (
    <section className="mt-6 grid gap-3 md:grid-cols-3">
      {tiles.map((tile) => (
        <button
          key={tile.title}
          type="button"
          onClick={() => onOpen(tile.key)}
          className="rounded-[22px] border border-[#dce7e9] bg-white p-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.04)]"
        >
          <div className="flex items-start justify-between gap-2">
            <ServiceMark name={tile.mark} size={34} />
            {tile.extra}
          </div>
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#00a8c4]">{tile.title}</p>
          <p className="mt-1 truncate text-[13px] font-black text-[#102b35]">{tile.line}</p>
          <p className="mt-1 text-[10px] font-semibold text-[#87969c]">{tile.hint}</p>
        </button>
      ))}
    </section>
  );
}

export function OverviewTrust({ website, maps }: { website: PortalWebsite; maps: PortalMaps[] }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#5b6b75]">
      <Clock3 className="h-3.5 w-3.5 text-[#00a8c4]" />
      <span>Paket: {website.packageName}</span>
      <StatusDot kind={siteDotKind(website.siteStatus, website.siteError)} label={SITE_STATUS_LABELS[(website.siteStatus || "open") as SiteStatus] || "Site"} />
      {maps[0] && <span>· Harita: {maps[0].businessName}</span>}
    </div>
  );
}
