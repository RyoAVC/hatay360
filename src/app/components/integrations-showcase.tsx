import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, ClipboardCheck, FileBarChart, MessagesSquare, ShieldCheck } from "lucide-react";
import { Reveal } from "./motion-primitives";

const DELIVERABLES = [
  { icon: ClipboardCheck, step: "01", title: "Net iş kapsamı", desc: "Başlamadan önce hedefi, teslimleri, zamanlamayı ve sorumlulukları tek sayfada netleştiririz." },
  { icon: MessagesSquare, step: "02", title: "Tek iletişim noktası", desc: "Tasarım, reklam ve yazılım ekipleri dağılmaz; proje sorumlunuz üzerinden düzenli bilgi alırsınız." },
  { icon: FileBarChart, step: "03", title: "Görünür raporlama", desc: "Yapılan işler, reklam harcaması ve ölçülebilen sonuçlar müşteri panelinde kayıt altında kalır." },
];

export function IntegrationsShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
        <Reveal><span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#00a8c4]">Ajans çalışma standardı</span><h2 className="mt-3 text-[34px] font-black tracking-[-0.045em] text-[#111827] sm:text-[43px]">Sadece teslim etmiyoruz; süreci görünür yönetiyoruz.</h2><p className="mt-4 text-[16px] leading-relaxed text-[#5b6875]">Tekrarlanan hizmet listeleri yerine, bizimle çalışırken ne yaşayacağınızı açıkça gösteriyoruz.</p><Link to="/hakkimizda" className="mt-6 inline-flex items-center gap-2 text-[14px] font-black text-[#008da8]">Çalışma biçimimizi incele <ArrowRight className="h-4 w-4" /></Link></Reveal>
        <div className="grid gap-4 md:grid-cols-3">{DELIVERABLES.map((item) => { const Icon = item.icon; return <motion.article key={item.step} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-[24px] border border-[#dfe9ec] bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.05)]"><span className="absolute right-5 top-4 text-[34px] font-black text-[#e9f4f6]">{item.step}</span><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f8fb] text-[#00a8c4]"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-[18px] font-black text-[#17222a]">{item.title}</h3><p className="mt-2 text-[13px] leading-relaxed text-[#64727c]">{item.desc}</p></motion.article>; })}</div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#cde5ea] bg-[#eff9fa] px-5 py-4"><span className="flex items-center gap-2 text-[12px] font-black text-[#17414b]"><ShieldCheck className="h-4 w-4 text-[#00a8c4]" /> Müşteri verileri firma hesabına göre ayrılır ve admin kayıtlarıyla yönetilir.</span><Link to="/musteri/giris" className="text-[12px] font-black text-[#008da8]">Müşteri paneli girişi →</Link></div>
    </section>
  );
}
