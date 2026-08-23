import { OFFICIAL_HATAY_DISTRICTS } from "./seo.ts";

export const NEED_OPTIONS = [
  { id: "site", label: "Web sitesi", hint: "Kurumsal vitrin, iletişim, WhatsApp" },
  { id: "ads", label: "Google / Meta reklam", hint: "Yönetim ücreti ayrı; bütçe sizin hesabınızda" },
  { id: "maps", label: "Google Maps / harita", hint: "İşletme profili, yorum, yerel arama" },
  { id: "shop", label: "E-ticaret", hint: "Ürün, sepet, ödeme — stok sizin" },
] as const;

export type NeedId = (typeof NEED_OPTIONS)[number]["id"];

export const NEED_SECTORS = [
  "Restoran / kafe",
  "Taksi",
  "Klinik / diş",
  "Eczane",
  "Emlak",
  "Perakende mağaza",
  "Üretim / toptan",
  "Otel / pansiyon",
  "Kuaför / berber",
  "Oto servis",
  "Nakliyat",
  "Diğer",
] as const;

export const NEED_DISTRICTS = OFFICIAL_HATAY_DISTRICTS;

export const NEEDS_DISCLAIMER =
  "Sitedeki paket fiyatları örnektir. Kesin tutar yazılı teklifte belirtilir. Google sırası veya reklam getirisi garanti edilmez.";

/** Paket yapılandırıcı örnek aylık tutarlar (yönetim / kurulum örneği; ürün adedi yok). */
export const PACKAGE_MODULE_PRICES: Record<NeedId, number> = {
  site: 1490,
  ads: 2075,
  maps: 490,
  shop: 1490,
};

export const PACKAGE_MODULE_OPTIONS: { id: NeedId; label: string; hint: string; optional?: boolean }[] = [
  { id: "site", label: "Web tasarım", hint: "Kurumsal vitrin, iletişim, WhatsApp" },
  { id: "ads", label: "Google / Meta reklam", hint: "Yönetim ücreti örneği; harcama sizin hesabınızda" },
  { id: "maps", label: "Harita kaydı", hint: "Google işletme profili ve yerel görünürlük" },
  { id: "shop", label: "E-ticaret", hint: "İsteğe bağlı. Katalog, sepet, ödeme — stok sizin", optional: true },
];

export function formatTryAmount(amount: number) {
  return `₺${Math.max(0, Math.round(Number(amount) || 0)).toLocaleString("tr-TR")}`;
}

function parseNeedIds(needs?: readonly string[]) {
  return unique((needs || []).map((id) => clean(id, 12))).filter((id): id is NeedId =>
    NEED_OPTIONS.some((option) => option.id === id),
  );
}

function clean(value: string, max = 80) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

export function estimatePackageConfig(input: { needs?: readonly string[] }) {
  const selected = parseNeedIds(input.needs);
  const named = estimateNeeds({ sector: "İşletme", district: "Hatay", needs: selected });
  const lines = PACKAGE_MODULE_OPTIONS.filter((option) => selected.includes(option.id)).map((option) => ({
    id: option.id,
    label: option.label,
    monthly: PACKAGE_MODULE_PRICES[option.id],
  }));
  const monthly = lines.reduce((sum, line) => sum + line.monthly, 0);

  return {
    packageName: named.packageName,
    selected,
    lines,
    monthly,
    exampleTotal: monthly * 12,
    includeShop: selected.includes("shop"),
    adsBudgetNote: selected.includes("ads")
      ? "Reklam bütçesi Google ve Meta hesabınızda kalır; buradaki tutar yönetim örneğidir."
      : "",
    quoteNote: "Kesin tutar yazılı teklifte belirtilir.",
    disclaimer: NEEDS_DISCLAIMER,
  };
}

const NEED_TO_SERVICE: Record<NeedId, string> = {
  site: "Web tasarım",
  ads: "Google / Meta reklam",
  maps: "Google Maps / harita",
  shop: "E-ticaret (isteğe bağlı)",
};

/** "₺2.075 / ay" veya "2075" → sayı; özel teklif metinlerinde 0. */
export function parseMonthlyTryAmount(text: string) {
  const raw = String(text || "").trim();
  if (!raw || /özel|teklif|bütçe|proje/i.test(raw)) return 0;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  const amount = Number(digits);
  return Number.isFinite(amount) && amount > 0 && amount < 1_000_000 ? Math.round(amount) : 0;
}

/** Hazır paket kartından iletişim formuna taşınacak ihtiyaç listesi. */
export function needsForReadyPlan(input: { kind?: "ads" | "store"; id?: string; name?: string }) {
  const kind = input.kind === "store" ? "store" : "ads";
  const hay = `${input.id || ""} ${input.name || ""}`.toLocaleLowerCase("tr-TR");
  if (kind === "store") return ["site", "shop"] as NeedId[];
  if (input.id === "scale" || hay.includes("yerel")) return ["ads", "maps"] as NeedId[];
  if (input.id === "enterprise" || hay.includes("kurumsal")) return ["site", "ads", "maps"] as NeedId[];
  if (input.id === "pro" || hay.includes("pro")) return ["ads", "maps"] as NeedId[];
  return ["ads"] as NeedId[];
}

/** Hazır paket CTA → /iletisim?pkg=…&needs=…&ornek=… */
export function buildReadyPlanQuotePath(plan: {
  id?: string;
  name?: string;
  kind?: "ads" | "store";
  monthlyPrice?: string;
}) {
  return buildIletisimQuotePath({
    needs: needsForReadyPlan(plan),
    packageName: plan.name || "",
    exampleMonthly: parseMonthlyTryAmount(plan.monthlyPrice || "") || undefined,
  });
}

/** Sektör / demo URL slug → mevcut `sector` query (taxi → taksi). */
export function sectorParamFromSlug(slug?: string) {
  const value = clean(String(slug || ""), 60).toLocaleLowerCase("tr-TR");
  return value === "taxi" ? "taksi" : value;
}

/** İletişim formuna sektör / ilçe / ihtiyaç bağlamı taşıyan yol. */
export function buildIletisimQuotePath(input: {
  sector?: string;
  district?: string;
  needs?: readonly string[];
  packageName?: string;
  exampleMonthly?: number;
}) {
  const sector = clean(input.sector || "", 60);
  const district = clean(input.district || "", 40);
  const selected = parseNeedIds(input.needs);
  const packageName = clean(input.packageName || "", 80);
  const params = new URLSearchParams();
  if (sector) params.set("sector", sector);
  if (district) params.set("district", district);
  if (selected.length) params.set("needs", selected.join(","));
  if (packageName) params.set("pkg", packageName);
  const monthly = Math.max(0, Math.round(Number(input.exampleMonthly) || 0));
  if (monthly > 0) params.set("ornek", String(monthly));
  const query = params.toString();
  return query ? `/iletisim?${query}` : "/iletisim";
}

export function parseIletisimQuoteParams(search: string | URLSearchParams) {
  const params = typeof search === "string" ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search) : search;
  const sector = clean(params.get("sector") || "", 60);
  const district = clean(params.get("district") || "", 40);
  const selected = parseNeedIds(String(params.get("needs") || "").split(/[,+\s]+/));
  const packageName = clean(params.get("pkg") || params.get("package") || "", 80);
  const exampleMonthly = Math.max(0, Math.round(Number(params.get("ornek") || params.get("monthly") || 0) || 0));
  const needLabels = NEED_OPTIONS.filter((option) => selected.includes(option.id)).map((option) => option.label);
  const primaryNeed = (["site", "shop", "ads", "maps"] as const).find((id) => selected.includes(id));
  const service = selected.length === 1
    ? NEED_TO_SERVICE[selected[0]]
    : selected.length > 1
      ? "Diğer"
      : "";

  const notesParts = [
    sector || district ? [district, sector].filter(Boolean).join(" / ") : "",
    needLabels.length ? `İhtiyaç: ${needLabels.join(", ")}` : "",
    packageName ? `Paket: ${packageName}` : "",
    exampleMonthly > 0
      ? `Örnek aylık yönetim: ${formatTryAmount(exampleMonthly)} (kesin teklif yazılı; reklam bütçesi ayrı)`
      : "",
    selected.length > 1 && primaryNeed ? `Öncelik: ${NEED_TO_SERVICE[primaryNeed]}` : "",
  ].filter(Boolean);

  return {
    sector,
    district,
    needs: selected,
    needLabels,
    packageName,
    exampleMonthly,
    service,
    notes: notesParts.join(" · ").slice(0, 800),
    summary: notesParts.join(" · "),
    hasPrefill: Boolean(sector || district || selected.length || packageName || exampleMonthly > 0),
  };
}

export function estimateNeeds(input: { sector?: string; district?: string; needs?: readonly string[] }) {
  const sector = clean(input.sector || "", 60) || "İşletme";
  const district = clean(input.district || "", 40) || "Hatay";
  const selected = parseNeedIds(input.needs);

  if (!selected.length) {
    return {
      packageName: "",
      modules: [] as string[],
      summary: "Sektör, ilçe ve en az bir ihtiyaç seçin; önerilen paket burada çıkar.",
      nextStep: "Hazır olunca iletişim formundan veya WhatsApp’tan yazın. Kesin teklif yazılı gider.",
      whatsapp: "",
      disclaimer: NEEDS_DISCLAIMER,
    };
  }

  const has = (id: NeedId) => selected.includes(id);
  const modules: string[] = [];
  const notes: string[] = [];
  const sectorKey = sector.toLocaleLowerCase("tr-TR");

  if (sectorKey.includes("taksi")) {
    notes.push("Taksi işletmesi müşteridir. Hatay360 ajans hizmeti verir; taksi işletmez.");
  }

  if (has("site")) {
    modules.push("Kurumsal web: ilçe + hizmet sayfaları, iletişim, WhatsApp");
    if (sectorKey.includes("taksi")) {
      notes.push("Site transfer ve ilçe hatlarını gösterir; çağrı santrali işletmenin kendisinde kalır.");
    }
    if (sectorKey.includes("restoran") || sectorKey.includes("kafe")) {
      notes.push("Menü ve rezervasyon için sade sayfa yeter; QR menü aracı ayrıca ücretsiz.");
    }
    if (sectorKey.includes("klinik") || sectorKey.includes("diş") || sectorKey.includes("eczane")) {
      notes.push("Randevu ve adres net olsun; tıbbi iddia ve sahte yorum yok.");
    }
  }

  if (has("maps")) {
    modules.push("Google Maps: işletme profili, NAP uyumu, gerçek yorum daveti");
    if (sectorKey.includes("taksi")) {
      notes.push("Haritada durak / transfer araması için profil; sahte puan veya sıra garantisi yok.");
    }
  }

  if (has("ads")) {
    modules.push("Reklam yönetimi: Google Ads / Meta. Harcama sizin hesabınızda kalır");
    notes.push("Reklam bütçesi ayrıdır; buradaki öneri yönetim kapsamıdır, tıklama maliyeti değildir.");
  }

  if (has("shop")) {
    modules.push("E-ticaret altyapısı: ürün, sepet, ödeme. Stok ve kargo işletmede");
    if (sectorKey.includes("taksi") || sectorKey.includes("klinik") || sectorKey.includes("diş")) {
      notes.push("Bu sektörde sepet çoğu zaman gerekmez; katalog veya randevu sitesi daha doğru olabilir.");
    }
  }

  let packageName = "Özel görünürlük paketi";
  if (selected.length === 1 && has("site")) packageName = "Kurumsal web";
  else if (selected.length === 1 && has("ads")) packageName = "Reklam yönetimi";
  else if (selected.length === 1 && has("maps")) packageName = "Harita görünürlük";
  else if (selected.length === 1 && has("shop")) packageName = "E-ticaret altyapısı";
  else if (has("site") && has("ads") && selected.length === 2) packageName = "Web + reklam";
  else if (has("site") && has("maps") && selected.length === 2) packageName = "Yerel görünürlük";
  else if (has("maps") && has("ads") && selected.length === 2) packageName = "Harita + reklam";
  else if (has("shop") && has("ads") && !has("site")) packageName = "Mağaza + reklam";
  else if (has("site") && has("shop")) packageName = "Site + e-ticaret";
  else if (selected.length >= 3) packageName = "Karma görünürlük paketi";

  const needLabels = NEED_OPTIONS.filter((option) => has(option.id)).map((option) => option.label);
  const summary = `${district} / ${sector} için önerilen çerçeve: ${packageName}. Modüller ihtiyaca göre birleşir; sıra veya ciro sözü yoktur.`;
  const nextStep = "Sonraki adım: /iletisim formundan veya WhatsApp’tan yazın. Paket sayfasındaki tutarlar örnektir; kesin teklif yazılı hazırlanır.";
  const whatsapp = `Merhaba Hatay360, ${district} / ${sector} için ${needLabels.join(", ")} istiyorum. Hesaplayıcı önerisi: ${packageName}. Yazılı teklif alabilir miyim?`;

  return {
    packageName,
    modules: unique([...modules, ...notes]),
    summary,
    nextStep,
    whatsapp,
    disclaimer: NEEDS_DISCLAIMER,
  };
}
