import { extraBySlug, type ExtraWidget } from "./extra-demos";

export type DemoAdminWidget = ExtraWidget | "taxi" | "move" | "repair";

export type DemoAdminSite = {
  slug: string;
  brand: string;
  title: string;
  accent: string;
  bg: string;
  widget: DemoAdminWidget;
};

const CORE: Record<string, Omit<DemoAdminSite, "slug">> = {
  taksi: { brand: "HATAY TAKSİ 24", title: "Taksi sitesi", accent: "#eab308", bg: "#0f172a", widget: "taxi" },
  nakliyat: { brand: "Hatay Nakliyat", title: "Nakliyat sitesi", accent: "#38bdf8", bg: "#0b3a5b", widget: "move" },
  klinik: { brand: "Antakya Klinik", title: "Klinik sitesi", accent: "#14b8a6", bg: "#134e4a", widget: "book" },
  servis: { brand: "Hatay Teknik Servis", title: "Servis sitesi", accent: "#fb923c", bg: "#9a3412", widget: "repair" },
};

export function getDemoAdminSite(slug: string): DemoAdminSite | null {
  if (CORE[slug]) return { slug, ...CORE[slug] };
  const extra = extraBySlug(slug);
  if (!extra) return null;
  return {
    slug: extra.slug,
    brand: extra.brand,
    title: extra.title,
    accent: extra.accent,
    bg: extra.bg,
    widget: extra.widget,
  };
}

export const DEMO_ADMIN_USER = "avc";
export const DEMO_ADMIN_PASS = "demo360";
export const demoAdminKey = (slug: string) => `hatay360-demo-admin:${slug}`;
