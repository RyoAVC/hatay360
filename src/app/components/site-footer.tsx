import { Link } from "react-router";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  CreditCard,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  Lock,
  Mail,
  MapPinned,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { SiteLogo } from "./site-logo";
import { sectionOn, useContent } from "../context/content-context";
import { useAccountEntry } from "../lib/account-entry";
import { toTelHref, toWhatsAppHref } from "../lib/contact";
import { buildIletisimQuotePath } from "../lib/needs-calculator";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Hatay%20Web%20Tasar%C4%B1m%20ve%20Reklam%20Yaz%C4%B1l%C4%B1m%20Ajans%C4%B1";

const SERVICE_LINKS = [
  { label: "Web tasarım", to: buildIletisimQuotePath({ needs: ["site"] }) },
  { label: "Google & Meta reklam", to: buildIletisimQuotePath({ needs: ["ads"] }) },
  { label: "Google Maps", to: "/google-maps-harita-kaydi" },
  { label: "Paketler", to: "/paketler" },
  { label: "Pazarla", to: "/pazarla" },
  { label: "Demolar", to: "/demolar" },
];

const COMPANY_LINKS = [
  { label: "Kurumsal", to: "/kurumsal" },
  { label: "Hakkımızda", to: "/hakkimizda" },
  { label: "Misyon", to: "/misyon" },
  { label: "Vizyon", to: "/vizyon" },
  { label: "Referanslar", to: "/referanslar" },
  { label: "Hatay ilçeleri", to: "/hatay" },
  { label: "İletişim", to: "/iletisim" },
];

const LEGAL_LINKS = [
  { label: "KVKK", to: "/kvkk" },
  { label: "Gizlilik", to: "/gizlilik" },
  { label: "Mesafeli satış", to: "/mesafeli-satis" },
  { label: "Kullanım koşulları", to: "/kosullar" },
];

const TRUST_SEALS: {
  id: string;
  title: string;
  hint: string;
  href?: string;
  external?: boolean;
  icon: typeof ShieldCheck;
}[] = [
  {
    id: "avc",
    title: "AVC Kayıtlı",
    hint: "Sahiplik kimliği",
    href: "https://hub.avcieticaret.com",
    external: true,
    icon: Fingerprint,
  },
  {
    id: "ssl",
    title: "SSL / HTTPS",
    hint: "Şifreli bağlantı",
    icon: Lock,
  },
  {
    id: "kvkk",
    title: "KVKK",
    hint: "Aydınlatma metni",
    href: "/kvkk",
    icon: FileCheck2,
  },
  {
    id: "pay",
    title: "Güvenli ödeme",
    hint: "iyzico altyapısı",
    icon: CreditCard,
  },
  {
    id: "maps",
    title: "Google Maps",
    hint: "İşletme profili",
    href: GOOGLE_MAPS_URL,
    external: true,
    icon: MapPinned,
  },
  {
    id: "privacy",
    title: "Gizlilik",
    hint: "Veri koruma",
    href: "/gizlilik",
    icon: ShieldCheck,
  },
];

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#70dce9]">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="block py-1 text-[13px] font-medium text-white/55 transition hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70dce9]/70"
    >
      {label}
    </Link>
  );
}

export function SiteFooter() {
  const { settings } = useContent();
  const account = useAccountEntry();
  const showTrust = sectionOn(settings, "footerTrust");

  return (
    <footer className="mt-16 print:hidden" aria-label="Site alt bilgisi">
      {/* Top CTA band */}
      <div className="border-y border-white/10 bg-[#0a2430]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#70dce9]">Hatay360</p>
            <p className="mt-1 text-[15px] font-bold text-white">Web, reklam ve yazılım — tek muhatap.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={toTelHref(settings.phone)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#008fac]"
            >
              <Phone className="h-3.5 w-3.5" /> Ara
            </a>
            <a
              href={toWhatsAppHref(settings.phone)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[12px] font-bold text-white transition hover:border-[#70dce9]/40"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <Link
              to="/iletisim"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[12px] font-bold text-white/80 transition hover:text-white"
            >
              Teklif al
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-[#061820] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-4">
              <Link to="/" className="inline-flex" aria-label="Hatay360 ana sayfa">
                <SiteLogo variant="onDark" preview={{ logoDarkHeight: 56 }} />
              </Link>
              <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-white/50">
                Antakya merkezli ajans. Hatay’ın tüm ilçelerine ve Türkiye genelindeki markalara tasarım, Ads/Meta, Maps
                ve mağaza altyapısı.
              </p>
              <ul className="mt-5 space-y-2.5">
                <li>
                  <a
                    href={toTelHref(settings.phone)}
                    className="inline-flex items-center gap-2.5 text-[13px] font-semibold text-white/75 transition hover:text-[#70dce9]"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#00a8c4]" />
                    {settings.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-flex items-center gap-2.5 text-[13px] font-semibold text-white/75 transition hover:text-[#70dce9]"
                  >
                    <Mail className="h-3.5 w-3.5 text-[#00a8c4]" />
                    {settings.email}
                  </a>
                </li>
                <li>
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 text-[13px] font-semibold text-white/75 transition hover:text-[#70dce9]"
                  >
                    <MapPinned className="h-3.5 w-3.5 text-[#00a8c4]" />
                    {settings.address || "Antakya / Hatay"}
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <FooterCol title="Hizmetler">
                <nav className="space-y-0.5" aria-label="Hizmetler">
                  {SERVICE_LINKS.map((item) => (
                    <FooterLink key={item.label} to={item.to} label={item.label} />
                  ))}
                </nav>
              </FooterCol>
            </div>

            <div className="lg:col-span-2">
              <FooterCol title="Kurumsal">
                <nav className="space-y-0.5" aria-label="Kurumsal">
                  {COMPANY_LINKS.map((item) => (
                    <FooterLink key={item.label} to={item.to} label={item.label} />
                  ))}
                </nav>
              </FooterCol>
            </div>

            <div className="lg:col-span-2">
              <FooterCol title="Hesap & yasal">
                <nav className="space-y-0.5" aria-label="Hesap">
                  <FooterLink to={account.to} label={account.label} />
                  <FooterLink to="/musteri/giris" label="Müşteri paneli" />
                  <FooterLink to="/firma/giris" label="Bayi paneli" />
                  <FooterLink to="/araclar" label="SEO araçları" />
                </nav>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Belgeler</p>
                  <nav className="space-y-0.5" aria-label="Yasal belgeler">
                    {LEGAL_LINKS.map((item) => (
                      <FooterLink key={item.label} to={item.to} label={item.label} />
                    ))}
                  </nav>
                </div>
              </FooterCol>
            </div>

            <div className="lg:col-span-2">
              <FooterCol title="Doğrulama">
                <a
                  href="https://hub.avcieticaret.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3.5 transition hover:border-emerald-400/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                    <Fingerprint className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="flex items-center gap-1.5 text-[12px] font-bold text-white">
                      AVC kayıtlı <BadgeCheck className="h-3.5 w-3.5 fill-emerald-400 text-[#061820]" />
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-white/45">Sahiplik kaydını hub’da doğrula</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#70dce9]">
                      Aç <ExternalLink className="h-3 w-3" />
                    </span>
                  </span>
                </a>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-[#70dce9]/30"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#4285f4]">
                    <MapPinned className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[12px] font-bold text-white">Google Maps</span>
                    <span className="mt-1 block text-[11px] leading-snug text-white/45">İşletme profili ve yorumlar</span>
                  </span>
                </a>
              </FooterCol>
            </div>
          </div>

          {/* Admin-toggleable trust strip */}
          {showTrust ? (
            <section className="mt-12 border-t border-white/10 pt-8" aria-label="Kurumsal güvence">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#70dce9]">Kurumsal güvence</p>
                  <h3 className="mt-1.5 text-[16px] font-bold text-white">Güven damgaları & sertifikalar</h3>
                </div>
                <p className="text-[11px] text-white/35">Admin’den kapatılabilir · Site ayarları</p>
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {TRUST_SEALS.map((seal) => {
                  const Icon = seal.icon;
                  const body = (
                    <>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00a8c4]/12 text-[#7ee0ec]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-bold text-white">{seal.title}</span>
                        <span className="block truncate text-[10px] text-white/40">{seal.hint}</span>
                      </span>
                      <BadgeCheck className="ml-auto h-3.5 w-3.5 shrink-0 fill-emerald-400/80 text-[#061820]" aria-hidden />
                    </>
                  );
                  const cls =
                    "flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-[#70dce9]/35 hover:bg-white/[0.05]";
                  if (seal.external && seal.href) {
                    return (
                      <li key={seal.id}>
                        <a href={seal.href} target="_blank" rel="noreferrer" className={cls}>
                          {body}
                        </a>
                      </li>
                    );
                  }
                  if (seal.href) {
                    return (
                      <li key={seal.id}>
                        <Link to={seal.href} className={cls}>
                          {body}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={seal.id}>
                      <div className={cls}>{body}</div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {settings.siteTitle || "Hatay360"}. Haklar Mahir Avcı / Avcı E-Ticaret’e aittir.
            </p>
            <p>AVC Dijital Ekosistemi kayıtlı projesi.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
