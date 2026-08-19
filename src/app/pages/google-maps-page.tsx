import { Link } from "react-router";
import { ArrowRight, Building2, Camera, CircleCheck, Flag, MapPinned, MessageSquareText, Navigation, Search, ShieldAlert, Star } from "lucide-react";
import { GoogleMapsPromo } from "../components/google-maps-promo";
import { MapsListingWizard } from "../components/maps-listing-wizard";
import { CallbackForm } from "../components/callback-form";

const SERVICES = [
  { icon: Building2, title: "Google harita kaydı", desc: "İşletme profili, adres, hizmet bölgesi, kategori, çalışma saatleri ve doğrulama sürecinin doğru kurulumu." },
  { icon: Search, title: "Harita SEO’su", desc: "İlçe ve hizmet niyetine uygun kategori, açıklama, hizmet ve içerik düzeniyle yerel görünürlüğü güçlendirme." },
  { icon: Camera, title: "Fotoğraf ve içerik planı", desc: "Profilin güncel ve güvenilir görünmesi için mekân, ekip, ürün ve hizmet görsellerinin yayın planı." },
  { icon: Navigation, title: "Yol tarifi ve çağrı dönüşümü", desc: "Telefon, web sitesi, mesaj ve yol tarifi aksiyonlarını ölçülebilir müşteri akışına dönüştürme." },
  { icon: MessageSquareText, title: "Gerçek yorum kazanımı", desc: "Hizmet alan gerçek müşterilerden tarafsız yorum istemek için QR, kısa bağlantı ve takip akışı kurulumu." },
  { icon: Flag, title: "Yorum raporlama ve itiraz", desc: "Hakaret, spam, sahtecilik veya Google politika ihlali taşıyan yorumlar için kanıtlı raporlama ve itiraz süreci." },
];

export function GoogleMapsPage() {
  return (
    <>
      <div className="pt-4"><GoogleMapsPromo /></div>
      <MapsListingWizard />

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl text-center"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#12865f]">Hatay yerel görünürlük</span><h1 className="mt-3 text-[34px] font-black tracking-[-0.045em] text-[#0f2d24] sm:text-[46px]">Google Maps harita kaydı ve harita yükseltme hizmeti</h1><p className="mt-4 text-[16px] leading-relaxed text-[#5d716a]">Antakya, Defne, İskenderun ve tüm Hatay ilçelerinde işletmenizin doğru aramada, doğru kategoriyle ve güven veren profille görünmesi için uçtan uca yönetim.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{SERVICES.map(({ icon: Icon, title, desc }) => <article key={title} className="rounded-[22px] border border-[#dce9e5] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f6f1] text-[#12865f]"><Icon className="h-5 w-5" /></span><h2 className="mt-4 text-[17px] font-black text-[#173d31]">{title}</h2><p className="mt-2 text-[12px] leading-relaxed text-[#647970]">{desc}</p></article>)}</div>
      </section>

      <section className="border-y border-[#dce9e5] bg-[#f3f9f7]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div><span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#12865f]"><Star className="h-4 w-4" /> İtibar yönetimi</span><h2 className="mt-3 text-[30px] font-black tracking-[-0.04em] text-[#173d31]">Yorumları güvenli ve kalıcı biçimde yönetin.</h2><p className="mt-4 text-[14px] leading-relaxed text-[#5b7168]">Olumlu deneyim yaşayan gerçek müşterilere yorum bağlantısı ulaştırır, tüm yorumlara marka dilinde yanıt planı kurarız. Google politikasını ihlal eden yorumları kanıtlarıyla raporlar ve itiraz sürecini takip ederiz.</p><ul className="mt-5 space-y-2">{["Gerçek müşteriye QR ve kısa yorum bağlantısı", "Olumlu ve olumsuz yorumlara yanıt şablonları", "Spam ve politika ihlalinde kanıtlı raporlama", "Sahte yorum veya silme garantisi yok; hesap güvenliği öncelikli"].map((item) => <li key={item} className="flex items-start gap-2 text-[12px] font-bold text-[#405e53]"><CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#12865f]" />{item}</li>)}</ul></div>
          <div className="rounded-[24px] border border-[#d5e5df] bg-white p-5 shadow-sm"><div className="flex items-start gap-3 rounded-2xl bg-[#fff8ea] p-4"><ShieldAlert className="h-5 w-5 shrink-0 text-[#a86500]" /><div><p className="text-[12px] font-black text-[#6f4600]">Hesabınızı riske atmayın</p><p className="mt-1 text-[11px] leading-relaxed text-[#8a661f]">Toplu sahte yorum, teşvik karşılığı puan veya gerçek kullanıcı yorumunu usulsüz sildirme işlemleri profilin askıya alınmasına yol açabilir. Biz yalnızca gerçek deneyim, doğru yanıt ve resmi itiraz sürecini kullanırız.</p></div></div><div className="mt-4 grid grid-cols-2 gap-3">{[{ value: "15 ilçe", label: "Hatay hedefleme" }, { value: "Tek profil", label: "Tutarlı marka bilgisi" }, { value: "Gerçek", label: "Müşteri yorum akışı" }, { value: "Resmî", label: "Raporlama süreci" }].map((item) => <div key={item.label} className="rounded-xl border border-[#e0ece8] bg-[#f8fbfa] p-3"><p className="text-[18px] font-black text-[#12865f]">{item.value}</p><p className="mt-1 text-[9px] font-bold text-[#73857e]">{item.label}</p></div>)}</div></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#12865f]">Ücretsiz ön inceleme</p><h2 className="mt-3 text-[30px] font-black text-[#173d31]">Harita profilinizi birlikte inceleyelim.</h2><p className="mt-3 text-[13px] leading-relaxed text-[#61766e]">Kategori, açıklama, fotoğraf, yorum akışı ve ilçe görünürlüğü için yapılabilecekleri çıkaralım. Sayfada fiyat yayınlamıyoruz; işletmenin durumuna göre kapsam belirliyoruz.</p><Link to="/iletisim" className="mt-5 inline-flex items-center gap-2 text-[12px] font-black text-[#12865f]">Detaylı iletişim <ArrowRight className="h-4 w-4" /></Link></div><div className="rounded-[26px] border border-[#dce9e5] bg-white p-6 shadow-sm"><CallbackForm compact /></div></section>
    </>
  );
}
