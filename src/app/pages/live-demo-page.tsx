import { Link, Navigate, useParams } from "react-router";
import { Phone, MessageCircle, MapPin, Clock, Shield, Truck, Stethoscope, Wrench } from "lucide-react";
import { useContent } from "../context/content-context";
import { toTelHref, toWhatsAppHref } from "../lib/contact";

function DemoBar({ label }: { label: string }) {
  return (
    <div className="sticky top-0 z-50 border-b border-black/10 bg-[#0f172a] text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <p className="text-[12px] font-semibold text-white/80">
          Hatay360 örnek site · <span className="text-white">{label}</span> böyle durur
        </p>
        <div className="flex items-center gap-2">
          <Link to="/iletisim" className="rounded-lg bg-[#00a8c4] px-3 py-1.5 text-[12px] font-bold">
            Bu tarz teklif al
          </Link>
          <Link to="/demolar" className="rounded-lg border border-white/20 px-3 py-1.5 text-[12px] font-bold text-white/80">
            Tüm demolar
          </Link>
        </div>
      </div>
    </div>
  );
}

function TaxiDemo({ phone }: { phone: string }) {
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="border-b border-[#facc15]/30 bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <p className="text-[18px] font-black tracking-tight">
            <span className="text-[#facc15]">HATAY</span> TAKSİ
          </p>
          <a href={toTelHref(phone)} className="rounded-full bg-[#facc15] px-4 py-2 text-[13px] font-black text-black">
            Hemen ara
          </a>
        </div>
      </header>
      <section className="mx-auto grid max-w-5xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#facc15]">7/24 Antakya · İskenderun</p>
          <h1 className="mt-3 text-[40px] font-black leading-tight sm:text-[52px]">Taksi çağırın, dakikalar içinde kapınızda.</h1>
          <p className="mt-4 text-[16px] text-white/70">
            Havalimanı, otel, şehir içi. Sabit tarife yok; net fiyatı arayınca söyleyelim.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={toTelHref(phone)} className="inline-flex items-center gap-2 rounded-xl bg-[#facc15] px-6 py-3.5 text-[15px] font-black text-black">
              <Phone className="h-4 w-4" /> {phone}
            </a>
            <a href={toWhatsAppHref(phone, "Taksi çağıracağım")} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-[15px] font-black">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
        <form className="rounded-3xl bg-[#1c1c1c] p-6" onSubmit={(e) => e.preventDefault()}>
          <p className="text-[14px] font-bold text-[#facc15]">Nereden / Nereye</p>
          <input className="mt-3 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-[14px]" placeholder="Alış: Antakya merkez" />
          <input className="mt-3 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-[14px]" placeholder="Varış: İskenderun" />
          <button type="submit" className="mt-4 w-full rounded-xl bg-[#facc15] py-3 text-[14px] font-black text-black">
            Fiyat sor
          </button>
        </form>
      </section>
      <section className="border-t border-white/10 bg-black py-12">
        <div className="mx-auto grid max-w-5xl gap-4 px-5 sm:grid-cols-3">
          {[
            { icon: Clock, t: "7/24", d: "Gece de çıkarız" },
            { icon: MapPin, t: "Tüm ilçeler", d: "Defne’den Arsuz’a" },
            { icon: Shield, t: "Kayıtlı araç", d: "Güvenli transfer" },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-white/10 p-5">
              <x.icon className="h-5 w-5 text-[#facc15]" />
              <p className="mt-3 text-[16px] font-black">{x.t}</p>
              <p className="text-[13px] text-white/60">{x.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function NakliyatDemo({ phone }: { phone: string }) {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#0f172a]">
      <header className="bg-[#0b3a5b] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <p className="flex items-center gap-2 text-[17px] font-black">
            <Truck className="h-5 w-5 text-[#38bdf8]" /> Hatay Nakliyat
          </p>
          <a href={toTelHref(phone)} className="text-[13px] font-bold text-[#7dd3fc]">
            {phone}
          </a>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h1 className="max-w-2xl text-[36px] font-black leading-tight sm:text-[44px]">Evden eve, ofis, şehirler arası — tek ekip.</h1>
        <p className="mt-4 max-w-xl text-[16px] text-[#475569]">
          Ambalaj, asansör, sigortalı taşıma. Fiyatı gizli tutmayız; keşif sonrası net yazılır.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <ul className="space-y-3 text-[15px] font-semibold text-[#334155]">
            {["Ücretsiz keşif", "Eşya listesi ile fiyat", "Aynı gün / randevulu", "Antakya · İskenderun · tüm ilçe"].map((t) => (
              <li key={t} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                {t}
              </li>
            ))}
          </ul>
          <form className="rounded-3xl bg-white p-6 shadow-lg" onSubmit={(e) => e.preventDefault()}>
            <p className="text-[15px] font-black">Teklif formu</p>
            <input className="mt-3 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-[14px]" placeholder="Nereden" />
            <input className="mt-3 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-[14px]" placeholder="Nereye" />
            <input className="mt-3 w-full rounded-xl border border-[#e2e8f0] px-4 py-3 text-[14px]" placeholder="Telefon" />
            <button type="submit" className="mt-4 w-full rounded-xl bg-[#0ea5e9] py-3 text-[14px] font-black text-white">
              WhatsApp’tan fiyat iste
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function KlinikDemo({ phone }: { phone: string }) {
  return (
    <div className="min-h-screen bg-[#f6fbfb] text-[#134e4a]">
      <header className="border-b border-[#ccfbf1] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <p className="flex items-center gap-2 text-[17px] font-black text-[#0f766e]">
            <Stethoscope className="h-5 w-5" /> Antakya Klinik
          </p>
          <a href={toTelHref(phone)} className="rounded-full bg-[#0d9488] px-4 py-2 text-[13px] font-bold text-white">
            Randevu al
          </a>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#0d9488]">Diş · estetik · muayene</p>
        <h1 className="mt-3 max-w-2xl text-[36px] font-black leading-tight text-[#134e4a] sm:text-[44px]">
          Randevuyu ertelemeyin. Aynı hafta yer açıyoruz.
        </h1>
        <p className="mt-4 max-w-xl text-[16px] text-[#547878]">
          Google’dan gelen hasta net bilgi ister: uzman, süre, fiyat aralığı, kolay randevu.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {["İmplant danışma", "Diş beyazlatma", "Aile hekimi"].map((t) => (
            <div key={t} className="rounded-2xl border border-[#99f6e4] bg-white p-5 font-bold">
              {t}
            </div>
          ))}
        </div>
        <a href={toTelHref(phone)} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0d9488] px-6 py-3.5 text-[15px] font-black text-white">
          <Phone className="h-4 w-4" /> {phone}
        </a>
      </section>
    </div>
  );
}

function ServisDemo({ phone }: { phone: string }) {
  return (
    <div className="min-h-screen bg-[#fff7ed] text-[#7c2d12]">
      <header className="bg-[#9a3412] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <p className="flex items-center gap-2 text-[17px] font-black">
            <Wrench className="h-5 w-5 text-[#fdba74]" /> Hatay Teknik Servis
          </p>
          <a href={toWhatsAppHref(phone, "Servis istiyorum")} className="text-[13px] font-bold">
            WhatsApp
          </a>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h1 className="max-w-2xl text-[36px] font-black leading-tight text-[#9a3412] sm:text-[44px]">
          Klima, kombi, beyaz eşya — aynı gün bakış.
        </h1>
        <p className="mt-4 max-w-xl text-[16px] text-[#9a3412]/80">
          Arıza tarifini yazın, usta yönlendirelim. İşçilik peşin konuşulur.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {["Klima gaz & bakım", "Kombi arıza", "Çamaşır makinesi", "Buzdolabı"].map((t) => (
            <div key={t} className="rounded-2xl bg-white px-4 py-4 text-[15px] font-bold shadow-sm">
              {t}
            </div>
          ))}
        </div>
        <a href={toTelHref(phone)} className="mt-8 inline-flex rounded-xl bg-[#ea580c] px-6 py-3.5 text-[15px] font-black text-white">
          Usta çağır · {phone}
        </a>
      </section>
    </div>
  );
}

export function LiveDemoPage() {
  const { slug = "" } = useParams();
  const { settings } = useContent();
  const phone = settings.phone || "+90 (850) 888 00 00";
  const key = slug === "taksi" ? "taxi" : slug;

  const labels: Record<string, string> = {
    taxi: "Taksi sitesi",
    nakliyat: "Nakliyat sitesi",
    klinik: "Klinik sitesi",
    servis: "Servis sitesi",
  };

  if (!labels[key]) return <Navigate to="/demolar" replace />;

  return (
    <div className="min-h-screen bg-white">
      <DemoBar label={labels[key]} />
      {key === "taxi" && <TaxiDemo phone={phone} />}
      {key === "nakliyat" && <NakliyatDemo phone={phone} />}
      {key === "klinik" && <KlinikDemo phone={phone} />}
      {key === "servis" && <ServisDemo phone={phone} />}
    </div>
  );
}
