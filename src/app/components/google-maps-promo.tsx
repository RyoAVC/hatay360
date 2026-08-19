import { Link } from "react-router";
import { ArrowRight, CheckCircle2, MapPinned, Navigation, PhoneCall, Search, Star } from "lucide-react";
import { useContent } from "../context/content-context";
import { toTelHref } from "../lib/contact";

export const HATAY360_MAP_QUERY = "Hatay Web Tasarım ve Reklam Yazılım Ajansı";
export const HATAY360_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HATAY360_MAP_QUERY)}`;
const HATAY360_MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(HATAY360_MAP_QUERY)}&output=embed`;

export function GoogleMapsPromo({ compact = false }: { compact?: boolean }) {
  const { settings } = useContent();
  const phone = settings.phone || "+90 850 308 68 37";

  return (
    <section className={compact ? "" : "mx-auto max-w-6xl px-5 py-16 sm:px-8"}>
      <div className="relative overflow-hidden rounded-[30px] border border-[#c9ddd7] bg-[#071f1a] shadow-[0_28px_80px_rgba(4,43,33,0.18)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(38,197,128,0.20),transparent_30%),radial-gradient(circle_at_90%_88%,rgba(66,133,244,0.17),transparent_32%)]" />
        <div className="relative grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/7 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#82f0c2]"><MapPinned className="h-3.5 w-3.5" /> Google Harita · Hatay</span>
            <h2 className="mt-5 max-w-xl text-[33px] font-black leading-[1.01] tracking-[-0.05em] text-white sm:text-[44px]">Arandığınız anda haritada görünür olun.</h2>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-white/64">Google İşletme Profili kurulumu, kategori mimarisi, harita SEO’su, fotoğraf planı ve gerçek müşteri yorum akışını tek görünürlük sistemi olarak yönetiyoruz.</p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {["Profil kurulumu", "Yerel sıralama", "Yorum yönetimi", "15 ilçe hedefleme"].map((item) => <span key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2.5 text-[10px] font-black text-white/80"><CheckCircle2 className="h-3.5 w-3.5 text-[#42d99a]" />{item}</span>)}
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link to="/google-maps-harita-kaydi#harita-kaydi" className="inline-flex items-center gap-2 rounded-xl bg-[#1aa877] px-5 py-3 text-[12px] font-black text-white shadow-[0_12px_30px_rgba(26,168,119,0.30)]">Harita kaydı başlat <ArrowRight className="h-4 w-4" /></Link>
              <a href={toTelHref(phone)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-[12px] font-black text-white"><PhoneCall className="h-4 w-4 text-[#82f0c2]" /> {phone}</a>
            </div>
          </div>

          <div className="relative min-h-[430px] border-t border-white/10 bg-[#dce9e5] lg:border-l lg:border-t-0">
            <iframe title="Hatay360 Google Harita işletme kaydı" src={HATAY360_MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full border-0 grayscale-[0.12] contrast-[1.04]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,31,26,0.16),transparent_24%)]" />
            <div className="absolute left-4 right-4 top-4 rounded-2xl border border-white/75 bg-white/92 p-3.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur sm:left-6 sm:right-auto sm:w-[330px]">
              <div className="flex items-center gap-2 rounded-xl border border-[#e2e9e7] bg-[#f8faf9] px-3 py-2"><Search className="h-4 w-4 text-[#4285f4]" /><span className="truncate text-[10px] font-bold text-[#31443e]">Hatay web tasarım</span></div>
              <div className="mt-3 flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0f8c62] text-white shadow-sm"><MapPinned className="h-5 w-5" /></span><div className="min-w-0"><p className="text-[12px] font-black leading-tight text-[#152b24]">Hatay Web Tasarım ve Reklam Yazılım Ajansı</p><p className="mt-1 flex items-center gap-1 text-[9px] font-bold text-[#677a73]"><Star className="h-3 w-3 fill-[#fbbc04] text-[#fbbc04]" /> Google işletme profili örneğimiz</p></div></div>
            </div>
            <a href={HATAY360_MAP_URL} target="_blank" rel="noreferrer" className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[10px] font-black text-[#173d31] shadow-[0_14px_34px_rgba(15,23,42,0.20)] transition hover:-translate-y-0.5"><Navigation className="h-4 w-4 text-[#4285f4]" /> Canlı haritada aç</a>
          </div>
        </div>
      </div>
    </section>
  );
}
