import { Link, Navigate } from "react-router";
import { ArrowRight, Building2, Shield, UserRound } from "lucide-react";
import { PageCrumbs } from "../components/page-crumbs";
import { useAccountEntry } from "../lib/account-entry";

const LINK_FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#00a8c4] focus-visible:ring-offset-2";

export function AccountHubPage() {
  const account = useAccountEntry();
  if (!account.checking && account.to !== "/hesap") {
    return <Navigate to={account.to} replace />;
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8" aria-labelledby="account-hub-title">
      <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Hesap" }]} />

      <header className="mt-8 max-w-2xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#00a8c4]">Hatay360 hesapları</p>
        <h1 id="account-hub-title" className="mt-3 text-[32px] font-bold tracking-tight text-[#1a1a1a] sm:text-[42px]">
          Hangi panele gireceksiniz?
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-[#514f6e]">
          Müşteri, bayi ve yönetim ayrı kapılardır. Yanlış panele girmeyin; her hesap yalnızca kendi işine açılır.
        </p>
      </header>

      <nav aria-label="Hesap kapıları" className="mt-10 grid gap-5 md:grid-cols-2">
        <article className="flex flex-col rounded-2xl border border-[#d5eef3] bg-white p-6 shadow-[0_12px_32px_rgba(16,43,53,0.05)]">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#00a8c4] text-white" aria-hidden="true">
            <UserRound className="h-5 w-5" />
          </span>
          <h2 className="mt-5 text-[22px] font-bold text-[#1a1a1a]">Müşteri paneli</h2>
          <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#514f6e]">
            Sitesi, reklamı veya haritası Hatay360’ta olan işletmeler buradan girer. Destek ve fatura da bu panelde.
          </p>
          <Link
            to="/musteri/giris"
            className={`mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[14px] font-bold text-white hover:bg-[#008da8] ${LINK_FOCUS}`}
          >
            Müşteri girişi <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-4 text-[13px] text-[#6b7280]">
            Henüz hesabınız yoksa{" "}
            <Link to="/musteri/kayit" className={`font-semibold text-[#008da8] underline-offset-2 hover:underline ${LINK_FOCUS}`}>
              müşteri başvurusu
            </Link>{" "}
            yapın. Şifreyi Hatay360 gönderir.
          </p>
        </article>

        <article className="flex flex-col rounded-2xl border border-[#e6eaee] bg-white p-6">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#17414b] text-white" aria-hidden="true">
            <Building2 className="h-5 w-5" />
          </span>
          <h2 className="mt-5 text-[22px] font-bold text-[#1a1a1a]">Bayi paneli</h2>
          <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#514f6e]">
            Hatay360 bayiliği alan web tasarım firmaları komisyon ve müşteri satışını buradan görür.
          </p>
          <Link
            to="/firma/giris"
            className={`mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-[#17414b] px-4 py-2.5 text-[14px] font-bold text-[#17414b] hover:bg-[#f4f8f9] ${LINK_FOCUS}`}
          >
            Bayi girişi <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-4 text-[13px] text-[#6b7280]">
            Bayilik almak için{" "}
            <Link to="/firma/kayit" className={`font-semibold text-[#17414b] underline-offset-2 hover:underline ${LINK_FOCUS}`}>
              firma kaydı
            </Link>
            .
          </p>
        </article>
      </nav>

      <p className="mt-10 flex items-start gap-2 text-[13px] leading-relaxed text-[#8a88a5]">
        <Shield className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          <span className="font-semibold text-[#6b7280]">Yönetim</span> yalnızca Hatay360 ekibinedir.{" "}
          <Link to="/panel/giris" className={`text-[#6b7280] underline-offset-2 hover:text-[#1a1a1a] hover:underline ${LINK_FOCUS}`}>
            Yönetim girişi
          </Link>
        </span>
      </p>
    </section>
  );
}
