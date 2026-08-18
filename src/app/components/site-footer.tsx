import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, FileCheck2, Mail, MapPinned, MessageCircle, Phone, ShieldCheck, Star } from "lucide-react";
import { SiteLogo } from "./site-logo";
import { useContent } from "../context/content-context";
import { toTelHref, toWhatsAppHref } from "../lib/contact";

const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Hatay%20Web%20Tasar%C4%B1m%20ve%20Reklam%20Yaz%C4%B1l%C4%B1m%20Ajans%C4%B1";
const TRUST_NOTES = ["İşletme profilimizi Google Maps üzerinde doğrulayın.", "Güncel yıldızları ve müşteri yorumlarını kaynağında inceleyin.", "Kıbrıs Caddesi No:13 için yol tarifi alın."];
const SERVICE_LINKS = [{ label: "Web tasarım", to: "/pazarla" }, { label: "Google & Meta reklam", to: "/pazarla" }, { label: "Paketler", to: "/paketler" }, { label: "Google Maps hizmetleri", to: "/google-maps-harita-kaydi" }, { label: "Hatay ilçeleri", to: "/hatay" }, { label: "Referanslar", to: "/referanslar" }, { label: "Müşteri paneli", to: "/musteri/giris" }];

export function SiteFooter() {
  const { settings } = useContent();
  const [note, setNote] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setNote((value) => (value + 1) % TRUST_NOTES.length), 4200); return () => window.clearInterval(timer); }, []);
  return (
    <footer className="mt-16 border-t border-white/10 bg-[#061820] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,168,196,0.16),transparent_38%),rgba(255,255,255,0.035)] p-6">
            <motion.div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full border border-[#70dce9]/15" animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.25, 0.7, 0.25] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div animate={{ scale: [1, 1.025, 1], filter: ["drop-shadow(0 0 0 rgba(0,168,196,0))", "drop-shadow(0 0 14px rgba(0,168,196,.42))", "drop-shadow(0 0 0 rgba(0,168,196,0))"] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} className="relative inline-flex">
              <Link to="/" className="inline-flex"><SiteLogo variant="onDark" preview={{ logoDarkHeight: 72 }} /></Link>
            </motion.div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#70dce9]">Hatay'ın dijital iş ortağı</p>
            <h3 className="mt-2 max-w-md text-[22px] font-black leading-tight text-white">Markanız için tasarım, reklam ve yazılımı tek masada yönetiyoruz.</h3>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/58">Antakya merkezli ajans yapımızla Hatay’ın tüm ilçelerine ve Türkiye genelindeki markalara hizmet veririz.</p>
            <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full border border-[#70dce9]/20 bg-[#70dce9]/8 px-3 py-1.5 text-[9px] font-black text-[#9beaf2]">Antakya ofis</span><span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 text-[9px] font-black text-emerald-300">AVC kayıtlı</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black text-white/60">0850 kurumsal hat</span></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">{[{ icon: Phone, label: "Telefon", value: settings.phone, href: toTelHref(settings.phone) }, { icon: MessageCircle, label: "WhatsApp", value: "Hızlı iletişim", href: toWhatsAppHref(settings.phone) }, { icon: Mail, label: "E-posta", value: settings.email, href: `mailto:${settings.email}` }, { icon: MapPinned, label: "Ofis", value: settings.address || "Kıbrıs Caddesi No:13", href: GOOGLE_MAPS_URL }].map((item) => { const Icon = item.icon; return <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#061820]/65 p-3 transition hover:-translate-y-0.5 hover:border-[#43d2e5]/40 hover:bg-white/8"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00a8c4]/15 text-[#70dce9]"><Icon className="h-4 w-4" /></span><span className="min-w-0"><b className="block text-[9px] uppercase tracking-wider text-white/38">{item.label}</b><span className="mt-0.5 block truncate text-[11px] font-bold text-white/82">{item.value}</span></span></a>; })}</div>
          </div>
          <div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#70dce9]">Hızlı erişim</p><ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-1">{SERVICE_LINKS.map((item) => <li key={item.label}><Link to={item.to} className="text-[13px] font-medium text-white/58 transition hover:text-white">{item.label}</Link></li>)}</ul><div className="mt-8"><p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.17em] text-[#70dce9]"><FileCheck2 className="h-4 w-4" /> Belgelerimiz</p><div className="mt-4 flex flex-wrap gap-2"><Link to="/gizlilik" className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold text-white/60">Gizlilik</Link><Link to="/kosullar" className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold text-white/60">Kullanım koşulları</Link><a href="https://hub.avcieticaret.com" target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold text-white/60">AVC sahiplik kaydı</a></div></div></div>
          <div><a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" className="block rounded-[22px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#4285f4]"><MapPinned className="h-5 w-5" /></span><ExternalLink className="h-4 w-4 text-white/35" /></div><p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Google Maps işletme profili</p><div className="mt-2 flex gap-1" aria-label="Google Maps yorumlarını görüntüle">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-4 w-4 fill-[#fbbc04] text-[#fbbc04]" />)}</div><div className="mt-4 min-h-10"><AnimatePresence mode="wait"><motion.p key={note} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-[12px] leading-relaxed text-white/70">{TRUST_NOTES[note]}</motion.p></AnimatePresence></div><span className="mt-4 inline-flex items-center gap-2 text-[11px] font-black text-[#70dce9]">Yorumları kaynağında aç <ExternalLink className="h-3.5 w-3.5" /></span></a><div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3"><ShieldCheck className="h-5 w-5 text-emerald-300" /><p className="text-[10px] leading-relaxed text-white/55">Uydurma yorum veya puan yayınlamayız; güncel değerlendirme Google Maps kaynağında görülür.</p></div></div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-[11px] text-white/35 sm:flex-row sm:items-start sm:justify-between"><p>© {new Date().getFullYear()} {settings.siteTitle || "Hatay360"}. Tasarım, yazılım ve ticari haklar Mahir Avcı / Avcı E-Ticaret’e aittir. İzinsiz kopyalama, çoğaltma ve türetme yasaktır.</p><p>AVC Dijital Ekosistemi içinde kayıtlı projedir.</p></div>
      </div>
    </footer>
  );
}
