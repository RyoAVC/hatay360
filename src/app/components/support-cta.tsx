import { Phone, MessageCircle, Mail, Clock, ArrowRight, BadgeCheck, Headphones, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { staggerItem } from "./motion-primitives";
import { SiteLogo } from "./site-logo";
import { useContent } from "../context/content-context";
import { isSupportOpenNow, nextSupportChange, supportHoursCopy, toTelHref, toWhatsAppHref } from "../lib/contact";

export function SupportCta() {
  const { settings } = useContent();
  const hours = supportHoursCopy(settings.supportWeekdayHours, settings.supportSaturdayHours);
  const openNow = isSupportOpenNow(settings.supportWeekdayHours, settings.supportSaturdayHours);
  const nextHours = nextSupportChange(settings.supportWeekdayHours, settings.supportSaturdayHours);

  const channels = [
    { icon: Phone, label: "Kurumsal telefon", value: settings.phone, detail: "Doğrudan ekibimize ulaşın", href: toTelHref(settings.phone), tone: "from-[#00a8c4]/25 to-[#00a8c4]/5" },
    { icon: MessageCircle, label: "WhatsApp", value: "Hızlı destek hattı", detail: "Talebinizi yazılı iletin", href: toWhatsAppHref(settings.phone), tone: "from-emerald-400/20 to-emerald-400/5" },
    { icon: Mail, label: "E-posta", value: settings.email, detail: "Dosya ve proje özeti gönderin", href: `mailto:${settings.email}`, tone: "from-sky-400/20 to-sky-400/5" },
  ];

  return (
    <section id="destek" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative overflow-hidden rounded-[36px] border border-[#2d525b] bg-[linear-gradient(135deg,#071a21_0%,#11262a_48%,#171717_100%)] px-6 py-8 shadow-[0_28px_80px_rgba(6,24,32,.22)] sm:px-10 sm:py-11 lg:px-12"
      >
        <motion.div aria-hidden="true" animate={{ x: [-30, 30, -30], y: [10, -20, 10], opacity: [.2, .5, .2] }} transition={{ duration: 9, repeat: Infinity }} className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#00a8c4]/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.08] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:34px_34px]" />

        <div className="relative mb-9 flex flex-col gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00a8c4]/15 text-[#78e4ef]"><ShieldCheck className="h-5 w-5" /><i className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#10262b] bg-emerald-400 shadow-[0_0_12px_#34d399]" /></span>
            <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#78e4ef]">Hatay360 iletişim merkezi</p><p className="mt-1 text-[13px] font-semibold text-white/65">Satış öncesi keşif ve satış sonrası destek aynı ekipte</p></div>
          </div>
          <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wider" role="status" aria-live="polite">
            <span className={`rounded-full border px-3 py-2 ${openNow ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-300" : "border-white/10 bg-white/5 text-white/55"}`}>
              ● {openNow ? "Hatlar açık" : "Mesai dışı"}
              {nextHours.label ? <span className="ml-1.5 font-bold normal-case tracking-normal opacity-80">· {nextHours.label}</span> : null}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/60">Antakya merkez</span>
            <span className="rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-2 text-cyan-200">AVC kayıtlı</span>
          </div>
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <motion.div animate={{ scale: [1, 1.035, 1], filter: ["drop-shadow(0 0 0 rgba(0,168,196,0))", "drop-shadow(0 0 18px rgba(0,211,238,.58))", "drop-shadow(0 0 0 rgba(0,168,196,0))"] }} transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut" }} className="mb-7 inline-flex origin-left motion-reduce:transform-none">
              <SiteLogo variant="onDark" preview={{ logoDarkHeight: 66 }} />
            </motion.div>
            <span className="flex w-fit items-center gap-2 rounded-full border border-[#70dce9]/20 bg-[#70dce9]/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8ce9f2]"><Sparkles className="h-3.5 w-3.5" /> Tek ekip, net muhatap</span>
            <h2 className="mt-4 max-w-xl text-[34px] font-black leading-[1.04] tracking-[-.035em] text-white sm:text-[44px]">Fikrinizi anlatın, doğru uzmanla hemen eşleştirelim.</h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/65">Yeni web sitesi, reklam yönetimi, Google Maps görünürlüğü veya mevcut projenizin desteği için talebinizi tek kanaldan açın. Süreci müşteri panelinizden takip edin.</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[.045] p-4"><Headphones className="h-5 w-5 text-[#70dce9]" /><p className="mt-3 text-[12px] font-black text-white">Doğrudan ajans ekibi</p><p className="mt-1 text-[11px] leading-relaxed text-white/45">Aracı çağrı merkezi olmadan proje ekibine ulaşın.</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/[.045] p-4"><BadgeCheck className="h-5 w-5 text-emerald-300" /><p className="mt-3 text-[12px] font-black text-white">Kayıtlı destek süreci</p><p className="mt-1 text-[11px] leading-relaxed text-white/45">Sorularınızı ve hizmet taleplerinizi panelden izleyin.</p></div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12px] text-white/60"><span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#3ec8dc]" /> {hours.weekdayLine}</span><span className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-[#3ec8dc]" /> Antakya / Hatay</span></div>
          </div>

          <motion.div className="grid gap-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}>
            {channels.map((channel) => (
              <motion.a key={channel.label} variants={staggerItem} whileHover={{ x: 7, scale: 1.01 }} href={channel.href} className={`group relative overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-r ${channel.tone} p-5 transition-colors hover:border-[#70dce9]/35`}>
                <div className="relative flex items-center gap-4"><span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#061820]/65 text-[#7ce4ee] shadow-lg"><channel.icon className="h-5 w-5" /></span><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.15em] text-white/40">{channel.label}</p><p className="mt-1 truncate text-[16px] font-black text-white">{channel.value}</p><p className="mt-1 text-[11px] text-white/45">{channel.detail}</p></div><span className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/55 transition group-hover:bg-[#00a8c4] group-hover:text-white"><ArrowRight className="h-4 w-4" /></span></div>
              </motion.a>
            ))}
            <motion.a href="/musteri/giris" whileHover={{ y: -3 }} className="mt-1 flex items-center justify-between rounded-[22px] bg-[#00a8c4] p-5 text-white shadow-[0_18px_42px_rgba(0,168,196,.28)]"><span><b className="block text-[15px] font-black">Destek veya hizmet talebi oluştur</b><span className="mt-1 block text-[11px] text-white/75">Müşteri panelinden kayıtlı ve takip edilebilir talep açın.</span></span><ArrowRight className="h-5 w-5" /></motion.a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
