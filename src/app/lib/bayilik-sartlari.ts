/**
 * Bayilik şartları — marka bazlı veri modeli + okuma API’si.
 * Placeholder / örnek değerler; resmi oran sanılmamalı.
 * getBayilikSartlari(brandId) ileride bayi paneli ve sözleşme modülü için hazırdır;
 * şimdilik başka modül tarafından çağrılmamalı.
 */

import {
  brandLabel,
  getBrandSlice,
  isBrandId,
  patchBrandSlice,
  type BrandId,
  DEFAULT_BRAND_ID,
} from "./brand-config";

export type BayilikTekrarTipi = "tek_seferlik" | "aylik_tekrarlayan";

export type BayilikOdemePeriyodu = "aylik" | "ceyreklik" | "yillik";

export type BayilikHizmetKategorisi = {
  id: string;
  /** Kategori adı */
  ad: string;
  tekrarTipi: BayilikTekrarTipi;
  /** Komisyon oranı (%) — örnek / yer tutucu olabilir */
  komisyonOrani: number;
};

export type BayilikSartlari = {
  brandId: BrandId;
  /** Tek seferlik katılım ücreti (TL) — örnek placeholder olabilir */
  katilimUcretiTl: number;
  odemePeriyodu: BayilikOdemePeriyodu;
  kategoriler: BayilikHizmetKategorisi[];
  /** Depoda örnek placeholder mı duruyor (admin uyarısı için) */
  ornekPlaceholder: boolean;
  updatedAt: string;
};

const uid = () => `bay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * SADECE örnek / yer tutucu değerler.
 * Admin yayına almadan önce güncellemelidir — kesin oran değildir.
 */
export function createExampleBayilikSartlari(brandId: BrandId): BayilikSartlari {
  return {
    brandId,
    katilimUcretiTl: 5000,
    odemePeriyodu: "aylik",
    ornekPlaceholder: true,
    updatedAt: new Date().toISOString(),
    kategoriler: [
      {
        id: "ex-web",
        ad: "Web Tasarım / E-Ticaret Kurulumu",
        tekrarTipi: "tek_seferlik",
        komisyonOrani: 20,
      },
      {
        id: "ex-ads",
        ad: "Google Ads / Meta Reklam Yönetimi",
        tekrarTipi: "aylik_tekrarlayan",
        komisyonOrani: 12,
      },
      {
        id: "ex-bakim",
        ad: "Bakım / Hosting / SEO Paketleri",
        tekrarTipi: "aylik_tekrarlayan",
        komisyonOrani: 15,
      },
    ],
  };
}

export const TEKRAR_TIPI_LABEL: Record<BayilikTekrarTipi, string> = {
  tek_seferlik: "Tek Seferlik",
  aylik_tekrarlayan: "Aylık Tekrarlayan",
};

export const ODEME_PERIYODU_LABEL: Record<BayilikOdemePeriyodu, string> = {
  aylik: "Aylık",
  ceyreklik: "Çeyreklik",
  yillik: "Yıllık",
};

function asNumber(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeKategori(raw: unknown, index: number): BayilikHizmetKategorisi | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const ad = typeof row.ad === "string" ? row.ad.trim().slice(0, 120) : "";
  if (!ad) return null;
  const tekrarTipi: BayilikTekrarTipi =
    row.tekrarTipi === "aylik_tekrarlayan" ? "aylik_tekrarlayan" : "tek_seferlik";
  let komisyonOrani = asNumber(row.komisyonOrani, 0);
  if (komisyonOrani < 0) komisyonOrani = 0;
  if (komisyonOrani > 100) komisyonOrani = 100;
  return {
    id: typeof row.id === "string" && row.id ? row.id.slice(0, 80) : `kat-${index}`,
    ad,
    tekrarTipi,
    komisyonOrani: Math.round(komisyonOrani * 100) / 100,
  };
}

export function normalizeBayilikSartlari(raw: unknown, brandId: BrandId): BayilikSartlari {
  const fallback = createExampleBayilikSartlari(brandId);
  if (!raw || typeof raw !== "object") return fallback;
  const row = raw as Record<string, unknown>;
  const kategorilerRaw = Array.isArray(row.kategoriler) ? row.kategoriler : [];
  const kategoriler = kategorilerRaw
    .map((item, i) => normalizeKategori(item, i))
    .filter(Boolean) as BayilikHizmetKategorisi[];

  const odemePeriyodu: BayilikOdemePeriyodu =
    row.odemePeriyodu === "ceyreklik" || row.odemePeriyodu === "yillik" || row.odemePeriyodu === "aylik"
      ? row.odemePeriyodu
      : "aylik";

  let katilimUcretiTl = asNumber(row.katilimUcretiTl, fallback.katilimUcretiTl);
  if (katilimUcretiTl < 0) katilimUcretiTl = 0;

  return {
    brandId,
    katilimUcretiTl: Math.round(katilimUcretiTl),
    odemePeriyodu,
    kategoriler: kategoriler.length ? kategoriler : fallback.kategoriler.map((k) => ({ ...k })),
    ornekPlaceholder: typeof row.ornekPlaceholder === "boolean" ? row.ornekPlaceholder : true,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date().toISOString(),
  };
}

/**
 * Marka bazlı bayilik şartlarını okur.
 * İleride: bayi paneli + sözleşme modülü burayı çağıracak.
 * Şimdilik başka yerde kullanmayın — yalnızca altyapı.
 */
export function getBayilikSartlari(brandId: BrandId | string): BayilikSartlari {
  const id = isBrandId(brandId) ? brandId : DEFAULT_BRAND_ID;
  const slice = getBrandSlice(id);
  return normalizeBayilikSartlari(slice.bayilikSartlari, id);
}

/** Admin kaydı — brand config dilimine yazar */
export function saveBayilikSartlari(brandId: BrandId, data: BayilikSartlari): BayilikSartlari {
  const next = normalizeBayilikSartlari(
    {
      ...data,
      brandId,
      ornekPlaceholder: false,
      updatedAt: new Date().toISOString(),
    },
    brandId,
  );
  // Admin kaydettiğinde "örnek" bayrağını kaldır — değerler artık bilinçli girilmiş sayılır;
  // yine de UI notu kalır. Kullanıcı isterse sıfırla ile örneklere döner.
  patchBrandSlice(brandId, { bayilikSartlari: next });
  return next;
}

/** Örnek placeholder’lara geri al (marka bazında) */
export function resetBayilikSartlariToExample(brandId: BrandId): BayilikSartlari {
  const example = createExampleBayilikSartlari(brandId);
  patchBrandSlice(brandId, { bayilikSartlari: example });
  return example;
}

export function emptyBayilikKategori(): BayilikHizmetKategorisi {
  return {
    id: uid(),
    ad: "Yeni kategori",
    tekrarTipi: "tek_seferlik",
    komisyonOrani: 0,
  };
}

export function formatBayilikBrandTitle(brandId: BrandId): string {
  return `${brandLabel(brandId)} — Bayilik şartları`;
}
