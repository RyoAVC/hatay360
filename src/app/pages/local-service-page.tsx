import { Link, useLocation } from "react-router";
import { ArrowRight, BarChart3, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import { CallbackForm } from "../components/callback-form";
import { PageCrumbs } from "../components/page-crumbs";
import { ServiceAreas } from "../components/service-areas";
import { getLocalServicePage } from "../lib/local-service-pages";

export function LocalServicePage() {
  const { pathname } = useLocation();
  const page = getLocalServicePage(pathname) || getLocalServicePage("/hatay-web-tasarim");
  return <>
    <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8"><PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: page.eyebrow }]} /></div>
    <section className="relative overflow-hidden border-b border-[#d7f0f5] bg-[radial-gradient(circle_at_80%_20%,rgba(0,168,196,.16),transparent_34%),linear-gradient(145deg,#f3fcfd,#fff)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:py-24">
        <div><p className="text-[12px] font-black uppercase tracking-[.2em] text-[#008da8]">{page.eyebrow}</p><h1 className="mt-4 max-w-3xl text-[38px] font-black leading-[1.08] tracking-[-.04em] text-[#0c2a32] sm:text-[54px]">{page.title}</h1><p className="mt-6 max-w-2xl text-[17px] leading-8 text-[#49646c]">{page.lead}</p><div className="mt-8 flex flex-wrap gap-3"><Link to={`/iletisim?service=${encodeURIComponent(page.serviceName)}`} className="inline-flex items-center gap-2 rounded-xl bg-[#00a8c4] px-5 py-3 text-[14px] font-black text-white shadow-lg shadow-cyan-900/10">Ücretsiz ön görüşme <ArrowRight className="h-4 w-4" /></Link><Link to="/referanslar" className="rounded-xl border border-[#b3e5ee] bg-white px-5 py-3 text-[14px] font-black text-[#007f98]">Çalışmaları incele</Link></div></div>
        <div className="rounded-[28px] border border-[#cdebf0] bg-white/90 p-7 shadow-[0_24px_70px_rgba(4,92,108,.12)]"><p className="text-[12px] font-black uppercase tracking-[.16em] text-[#008da8]">Hizmet kapsamında</p><ul className="mt-5 space-y-4">{page.benefits.map((benefit) => <li key={benefit} className="flex gap-3 text-[15px] font-semibold text-[#294850]"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#00a8c4]" />{benefit}</li>)}</ul><div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#effafb] p-4"><MapPin className="h-5 w-5 text-[#008da8]" /><p className="mt-2 text-[13px] font-black text-[#15343c]">Tüm Hatay</p></div><div className="rounded-2xl bg-[#effafb] p-4"><BarChart3 className="h-5 w-5 text-[#008da8]" /><p className="mt-2 text-[13px] font-black text-[#15343c]">Ölçülebilir süreç</p></div></div></div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8"><div className="grid gap-6 md:grid-cols-3">{[["01", "İhtiyacı netleştir", "Hedef, bölge, mevcut altyapı ve gerçek iş ihtiyacını birlikte belirleyelim."], ["02", "Planı ve kapsamı yaz", "Yapılacakları, ölçümü, süreyi ve ücreti açık bir teklife dönüştürelim."], ["03", "Yayınla ve geliştir", "Çalışmayı yayına alıp gerçek veriler üzerinden düzenli olarak iyileştirelim."]].map(([no, title, text]) => <article key={no} className="rounded-[24px] border border-[#d7f0f5] bg-white p-6"><span className="text-[12px] font-black text-[#00a8c4]">{no}</span><h2 className="mt-3 text-[20px] font-black text-[#0c2a32]">{title}</h2><p className="mt-3 text-[14px] leading-7 text-[#5a737b]">{text}</p></article>)}</div><div className="mt-10 flex items-start gap-4 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5"><ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" /><p className="text-[14px] leading-7 text-emerald-950"><strong>Şeffaf çalışma:</strong> Google sırası, satış veya belirli sonuç garantisi vermeyiz. Kapsamı yazılı belirler, ölçülebilen verileri raporlar ve iyileştirmeyi gerçek sonuçlara göre yaparız.</p></div></section>
    <ServiceAreas mode="chips" />
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-12 sm:px-8"><div className="rounded-[28px] border border-[#d7f0f5] bg-white p-8 shadow-[0_16px_40px_rgba(0,168,196,.08)]"><h2 className="mb-5 text-[26px] font-black text-[#0c2a32]">Hatay’daki projenizi konuşalım</h2><CallbackForm /></div></section>
  </>;
}
