import { Link, Navigate, useParams } from "react-router";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  Stethoscope,
  Truck,
  Wrench,
} from "lucide-react";
import { useContent } from "../context/content-context";
import { AVCLABS_PRODUCTS, AVCLABS_VITRINE, DEMO_PHOTOS } from "../lib/avclabs";
import { toTelHref, toWhatsAppHref } from "../lib/contact";

function DemoBar({ label, licensed }: { label: string; licensed?: boolean }) {
  return (
    <div className="sticky top-0 z-50 border-b border-black/10 bg-[#0f172a] text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <p className="text-[12px] font-semibold text-white/80">
          {licensed ? "AvcNova lisanslı yazılım · AVC ailesi · " : "Hatay360 web sitesi örneği · "}
          <span className="text-white">{label}</span>
        </p>
        <div className="flex items-center gap-2">
          {licensed && (
            <a href={AVCLABS_VITRINE} target="_blank" rel="noreferrer" className="rounded-lg border border-[#70dce9]/40 px-3 py-1.5 text-[12px] font-bold text-[#9beaf2]">
              AvcNova vitrini
            </a>
          )}
          <Link to="/iletisim" className="rounded-lg bg-[#00a8c4] px-3 py-1.5 text-[12px] font-bold">
            Teklif al
          </Link>
          <Link to="/demolar" className="rounded-lg border border-white/20 px-3 py-1.5 text-[12px] font-bold text-white/80">
            Tüm demolar
          </Link>
        </div>
      </div>
    </div>
  );
}

function LicenseRibbon({ name }: { name: string }) {
  return (
    <div className="border-b border-emerald-400/20 bg-emerald-400/10 px-5 py-2 text-center text-[11px] font-bold text-emerald-200">
      <BadgeCheck className="mr-1 inline h-3.5 w-3.5" />
      {name} · AvcNova lisanslı yazılım · kurumsal / büyük proje · AVC ailesi
    </div>
  );
}

function TaxiDemo({ phone }: { phone: string }) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <header className="border-b border-[#facc15]/25 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <p className="text-[18px] font-black">
            <span className="text-[#facc15]">HATAY</span> TAKSİ 24
          </p>
          <a href={toTelHref(phone)} className="rounded-full bg-[#facc15] px-4 py-2 text-[13px] font-black text-black">
            {phone}
          </a>
        </div>
      </header>
      <section className="relative">
        <img src={DEMO_PHOTOS.taxi} alt="Hatay taksi" className="h-[380px] w-full object-cover opacity-55 sm:h-[460px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-5 pb-12">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#facc15]">Antakya · İskenderun · 15 ilçe</p>
          <h1 className="mt-2 max-w-2xl text-[40px] font-black leading-tight sm:text-[52px]">Taksi çağırın. 8–12 dakikada kapıda.</h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={toTelHref(phone)} className="inline-flex items-center gap-2 rounded-xl bg-[#facc15] px-6 py-3.5 text-[15px] font-black text-black">
              <Phone className="h-4 w-4" /> Hemen ara
            </a>
            <a href={toWhatsAppHref(phone, "Taksi çağıracağım")} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-[15px] font-black">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-12 sm:grid-cols-3">
        {[
          { icon: Clock, t: "Havalimanı", d: "Karşılama ve net tarife" },
          { icon: MapPin, t: "Şehir içi", d: "Antakya, Defne, İskenderun" },
          { icon: Shield, t: "Kayıtlı araç", d: "Gece dahil 7/24" },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl border border-white/10 p-5">
            <x.icon className="h-5 w-5 text-[#facc15]" />
            <p className="mt-3 text-[16px] font-black">{x.t}</p>
            <p className="text-[13px] text-white/60">{x.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function NakliyatDemo({ phone }: { phone: string }) {
  return (
    <div className="min-h-screen bg-[#eef4f9] text-[#0f172a]">
      <header className="bg-[#0b3a5b] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <p className="flex items-center gap-2 text-[17px] font-black">
            <Truck className="h-5 w-5 text-[#38bdf8]" /> Hatay Nakliyat
          </p>
          <a href={toTelHref(phone)} className="text-[13px] font-bold text-[#7dd3fc]">
            {phone}
          </a>
        </div>
      </header>
      <img src={DEMO_PHOTOS.nakliyat} alt="Nakliyat" className="h-64 w-full object-cover sm:h-80" />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="max-w-2xl text-[36px] font-black leading-tight sm:text-[44px]">Evden eve, ofis, şehirler arası — tek ekip.</h1>
        <p className="mt-4 max-w-xl text-[16px] text-[#475569]">Ambalaj, asansör, sigortalı taşıma. Keşif sonrası fiyat yazılı gider.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Ücretsiz keşif", "Koli & ambalaj", "Sigortalı taşıma", "Teslim tutanağı"].map((t) => (
            <div key={t} className="rounded-2xl bg-white px-4 py-4 text-[14px] font-black shadow-sm">
              {t}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function KlinikDemo({ phone }: { phone: string }) {
  return (
    <div className="min-h-screen bg-[#f3fbfa] text-[#134e4a]">
      <header className="border-b border-[#ccfbf1] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <p className="flex items-center gap-2 text-[17px] font-black text-[#0f766e]">
            <Stethoscope className="h-5 w-5" /> Antakya Klinik
          </p>
          <a href={toTelHref(phone)} className="rounded-full bg-[#0d9488] px-4 py-2 text-[13px] font-bold text-white">
            Randevu al
          </a>
        </div>
      </header>
      <div className="grid lg:grid-cols-2">
        <img src={DEMO_PHOTOS.klinik} alt="Klinik" className="h-72 w-full object-cover lg:h-full" />
        <div className="px-6 py-12 sm:px-10">
          <h1 className="text-[36px] font-black leading-tight">Aynı hafta randevu. Net süre, net bilgi.</h1>
          <p className="mt-4 text-[16px] text-[#547878]">İmplant, beyazlatma ve aile hekimliği. Google’dan gelen hasta fiyat ve uzman ister.</p>
          <div className="mt-6 flex gap-3">
            <img src={DEMO_PHOTOS.doctor} alt="Uzman" className="h-16 w-16 rounded-2xl object-cover" />
            <div>
              <p className="font-black">Dt. Elif A.</p>
              <p className="text-[13px] text-[#547878]">İmplant ve protez</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServisDemo({ phone }: { phone: string }) {
  return (
    <div className="min-h-screen bg-[#fff7ed] text-[#7c2d12]">
      <header className="bg-[#9a3412] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <p className="flex items-center gap-2 text-[17px] font-black">
            <Wrench className="h-5 w-5 text-[#fdba74]" /> Hatay Teknik Servis
          </p>
          <a href={toWhatsAppHref(phone, "Servis istiyorum")} className="font-bold">
            WhatsApp
          </a>
        </div>
      </header>
      <img src={DEMO_PHOTOS.servis} alt="Teknik servis" className="h-72 w-full object-cover" />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="max-w-2xl text-[36px] font-black leading-tight text-[#9a3412]">Klima, kombi, beyaz eşya — aynı gün bakış.</h1>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Klima gaz & bakım", "Kombi arıza", "Çamaşır makinesi", "Buzdolabı"].map((t) => (
            <div key={t} className="rounded-2xl bg-white px-4 py-4 text-[15px] font-bold shadow-sm">
              {t}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function RentCarDemo() {
  const cars = [
    { name: "Fiat Egea", price: "₺1.890", img: DEMO_PHOTOS.rent1 },
    { name: "Renault Clio", price: "₺2.150", img: DEMO_PHOTOS.rent2 },
    { name: "BMW 3.20", price: "₺4.900", img: DEMO_PHOTOS.rent3 },
  ];
  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#111827]">
      <LicenseRibbon name="BUNG Rent A Car" />
      <header className="bg-[#111827] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <p className="text-[18px] font-black">HATAY<span className="text-[#f59e0b]">RENT</span></p>
          <a href={`${AVCLABS_VITRINE}/yazilim/rent-a-car-yazilimi`} className="text-[12px] font-bold text-[#fbbf24]">
            Lisanslı yazılım
          </a>
        </div>
      </header>
      <section className="relative">
        <img src={DEMO_PHOTOS.rentHero} alt="Araç kiralama" className="h-[420px] w-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-5 pb-10 text-white">
          <h1 className="max-w-xl text-[40px] font-black leading-tight">Filonuzu online kiralayın. Sözleşme dijital.</h1>
          <p className="mt-3 max-w-lg text-[15px] text-white/75">AvcNova BUNG Rent A Car: filo, takvim, dinamik fiyat, dijital sözleşme. Kurumsal kiralama operasyonu için lisanslı yazılım.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-6 flex items-center gap-2 text-[13px] font-black text-[#111827]">
          <CalendarDays className="h-4 w-4" /> 12–15 Eylül · Antakya teslim
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {cars.map((car) => (
            <article key={car.name} className="overflow-hidden rounded-[22px] bg-white shadow-sm">
              <img src={car.img} alt={car.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <p className="text-[16px] font-black">{car.name}</p>
                <p className="mt-1 text-[13px] text-[#64748b]">{car.price} / gün · depozito panelden</p>
                <button type="button" className="mt-4 w-full rounded-xl bg-[#111827] py-2.5 text-[13px] font-black text-white">
                  Rezerve et
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function BungalowDemo() {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#3f2d1e]">
      <LicenseRibbon name="BUNG Travel" />
      <img src={DEMO_PHOTOS.bungalow} alt="Bungalov" className="h-[420px] w-full object-cover" />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0f766e]">AvcNova konaklama yazılımı · AVC ailesi</p>
        <h1 className="mt-2 max-w-2xl text-[40px] font-black leading-tight">Samandağ bungalov. Tarih seç, DNA’sını bırak, rezerve et.</h1>
        <p className="mt-4 max-w-xl text-[15px] text-[#6b5344]">AvcNova BUNG Travel: DNA, kokpit, mahremiyet endeksi. Büyük konaklama ve bungalov projeleri için lisanslı yazılım.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "Bahçe Bungalov", img: DEMO_PHOTOS.bungalow2, p: "₺4.200 / gece" },
            { n: "Deniz Manzara", img: DEMO_PHOTOS.bungalow3, p: "₺5.800 / gece" },
            { n: "Aile Loft", img: DEMO_PHOTOS.bungalow, p: "₺6.400 / gece" },
          ].map((u) => (
            <article key={u.n} className="overflow-hidden rounded-[22px] bg-white shadow-sm">
              <img src={u.img} alt={u.n} className="h-40 w-full object-cover" />
              <div className="p-4">
                <p className="font-black">{u.n}</p>
                <p className="text-[13px] text-[#6b5344]">{u.p}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function YachtDemo() {
  return (
    <div className="min-h-screen bg-[#071422] text-white">
      <LicenseRibbon name="BUNG Yacht" />
      <img src={DEMO_PHOTOS.yacht} alt="Yat kiralama" className="h-[440px] w-full object-cover opacity-80" />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="max-w-2xl text-[40px] font-black leading-tight">İskenderun koy turu. Charter takvimi dolu değilse çıkış var.</h1>
        <p className="mt-4 max-w-xl text-white/65">AvcNova BUNG Yacht: tekne filosu, rota, mürettebat. Charter operasyonu için lisanslı yazılım.</p>
        <div className="mt-8 overflow-hidden rounded-[24px]">
          <img src={DEMO_PHOTOS.yacht2} alt="Tekne" className="h-56 w-full object-cover" />
        </div>
      </section>
    </div>
  );
}

function MotoDemo() {
  return (
    <div className="min-h-screen bg-[#1a120c] text-[#fde68a]">
      <LicenseRibbon name="BUNG Moto Rent" />
      <img src={DEMO_PHOTOS.moto} alt="Motosiklet kiralama" className="h-[420px] w-full object-cover" />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="max-w-2xl text-[40px] font-black leading-tight text-white">Scooter ve motor. Ehliyet kontrolü panelde.</h1>
        <p className="mt-4 max-w-xl text-[#d6b98a]">AvcNova BUNG Moto Rent: kask zimmeti, ehliyet kontrolü, depozito. Kurumsal kiralama için lisanslı yazılım.</p>
        <img src={DEMO_PHOTOS.moto2} alt="Motor" className="mt-8 h-52 w-full rounded-[24px] object-cover" />
      </section>
    </div>
  );
}

export function LiveDemoPage() {
  const { slug = "" } = useParams();
  const { settings } = useContent();
  const phone = settings.phone || "+90 850 308 68 37";
  const key = slug === "taksi" ? "taxi" : slug === "yat" ? "yat" : slug;
  const bung = AVCLABS_PRODUCTS.find((p) => p.slug === slug);

  const ads: Record<string, { label: string; node: ReactNode }> = {
    taxi: { label: "Taksi sitesi", node: <TaxiDemo phone={phone} /> },
    nakliyat: { label: "Nakliyat sitesi", node: <NakliyatDemo phone={phone} /> },
    klinik: { label: "Klinik sitesi", node: <KlinikDemo phone={phone} /> },
    servis: { label: "Servis sitesi", node: <ServisDemo phone={phone} /> },
    "rent-a-car": { label: "Araç kiralama yazılımı", node: <RentCarDemo /> },
    bungalov: { label: "Bungalov rezervasyon yazılımı", node: <BungalowDemo /> },
    yat: { label: "Yat kiralama yazılımı", node: <YachtDemo /> },
    moto: { label: "Motosiklet kiralama yazılımı", node: <MotoDemo /> },
  };

  if (!ads[key]) return <Navigate to="/demolar" replace />;

  return (
    <div className="min-h-screen bg-white">
      <DemoBar label={ads[key].label} licensed={Boolean(bung)} />
      {ads[key].node}
      {bung && (
        <div className="border-t border-black/10 bg-[#071b22] px-5 py-6 text-center text-[12px] text-white/70">
          Örnek ekran. Bu ürün AvcNova’nın BUNG lisanslı yazılımıdır; kurumsal ve büyük projeler içindir. Asıl sistem {AVCLABS_VITRINE.replace("http://", "")} üzerinde.
          {" "}
          <a href={`${AVCLABS_VITRINE}${bung.vitrinePath}`} className="font-bold text-[#70dce9]" target="_blank" rel="noreferrer">
            Yazılımı aç <ExternalLink className="ml-1 inline h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
