import { Link } from "react-router";
import { ArrowRight, Building2, Handshake, UserPlus, UserRound } from "lucide-react";
import { PageCrumbs } from "../components/page-crumbs";

const CARDS = [
  {
    to: "/musteri/giris",
    icon: UserRound,
    title: "Müşteri girişi",
    desc: "Hatay360 ile sitesi, reklamı veya mağazası olan mevcut müşteriler buradan panele girer.",
    cta: "Panele gir",
    tone: "from-[#0fa9c3] to-[#18bfd4]",
  },
  {
    to: "/musteri/kayit",
    icon: UserPlus,
    title: "Yeni müşteri",
    desc: "Şifre sormayız. Başvurursunuz, onaylı elit müşteriyseniz şifreyi Hatay360 gönderir. Herkes üye olamaz.",
    cta: "Başvur",
    tone: "from-[#12865f] to-[#1aa877]",
  },
  {
    to: "/firma/giris",
    icon: Building2,
    title: "Firma girişi",
    desc: "Hatay360 bayiliği alan web tasarım ve yazılım firmaları buradan komisyon hesabına girer.",
    cta: "Firma paneli",
    tone: "from-[#3b4fd4] to-[#5b6ef0]",
  },
];

export function AccountHubPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Giriş / kayıt" }]} />
      <div className="mx-auto mt-6 max-w-3xl text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0fa9c3]">Hatay360 hesapları</p>
        <h1 className="mt-3 text-[34px] font-black tracking-[-0.045em] text-[#102b35] sm:text-[46px]">Giriş ve kayıt</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-[#5b6b75]">
          Mevcut müşteri, yeni başvuru ve bayi firma ayrı tutulur. Yanlış kapıyı seçmeyin; her biri farklı iş içindir.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.to} className="flex flex-col rounded-[26px] border border-[#dbe7ee] bg-white p-6 shadow-[0_16px_40px_rgba(16,43,53,0.06)]">
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white`}>
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-[22px] font-black text-[#102b35]">{card.title}</h2>
              <p className="mt-3 flex-1 text-[13px] leading-relaxed text-[#5b6b75]">{card.desc}</p>
              <Link to={card.to} className="mt-6 inline-flex items-center gap-2 text-[13px] font-black text-[#0fa9c3]">
                {card.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mt-8 rounded-[24px] border border-[#dce4ea] bg-[#f4fafc] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-[#3b4fd4]" />
            <div>
              <p className="text-[14px] font-black text-[#102b35]">Web tasarım firması mısınız?</p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#5b6b75]">
                Hatay360 bayiliği alın, müşterilerinize site ve reklam satın. Komisyon oranını birlikte belirleriz.
              </p>
            </div>
          </div>
          <Link to="/firma/kayit" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#102b35] px-4 py-2.5 text-[12px] font-black text-white">
            Firma kaydı <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
