import { Link } from "react-router";
import { motion } from "motion/react";
import { Phone, Mail, MessageCircle, Clock, MapPin, Navigation } from "lucide-react";
import { PageHero } from "../components/page-hero";
import { Reveal, staggerItem } from "../components/motion-primitives";
import { useContent } from "../context/content-context";
import { isSupportOpenNow, nextSupportChange, supportHoursCopy, toTelHref, toWhatsAppHref } from "../lib/contact";
import { CONTACT_FAQS } from "../lib/seo";
import { PageCrumbs } from "../components/page-crumbs";
import { CallbackForm } from "../components/callback-form";
import { ServiceAreas } from "../components/service-areas";

export function IletisimPage() {
  const { settings } = useContent();
  const faqs = CONTACT_FAQS;
  const hours = supportHoursCopy(settings.supportWeekdayHours, settings.supportSaturdayHours);
  const openNow = isSupportOpenNow(settings.supportWeekdayHours, settings.supportSaturdayHours);
  const nextHours = nextSupportChange(settings.supportWeekdayHours, settings.supportSaturdayHours);

  const channels = [
    { icon: Phone, title: "Telefon", value: settings.phone, href: toTelHref(settings.phone), hint: hours.phoneHint },
    { icon: MessageCircle, title: "WhatsApp", value: "Hemen yazın", href: toWhatsAppHref(settings.phone), hint: "Hızlı teklif ve destek" },
    { icon: Mail, title: "E-posta", value: settings.email, href: `mailto:${settings.email}`, hint: "Teklif ve evrak" },
  ];

  return (
    <>
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "İletişim" }]} />
      </div>
      <PageHero
        eyebrow="Hatay iletişim"
        title="Hatay web tasarım ve reklam teklifi"
        desc="Antakya ofisinden İskenderun ve Defne dahil tüm ilçelere. Numaranızı bırakın; Hatay360 ekibi sizi arasın."
      />

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="rounded-[28px] border border-[#ecebf5] bg-white/90 p-7 shadow-[0px_20px_50px_rgba(0,168,196,0.08)] backdrop-blur-sm sm:p-9">
              <CallbackForm />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
              className="space-y-4"
            >
              {channels.map((c) => (
                <motion.a
                  key={c.title}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  variants={staggerItem}
                  whileHover={{ y: -3 }}
                  className="flex items-center gap-4 rounded-2xl border border-[#ecebf5] bg-white/90 p-5 backdrop-blur-sm"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00a8c4] text-white">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[13px] text-[#6f6c8f]">{c.title}</p>
                    <p className="text-[16px] font-semibold text-[#1a1a1a]">{c.value}</p>
                    <p className="text-[12px] text-[#a0a3bd]">{c.hint}</p>
                  </div>
                </motion.a>
              ))}

              <motion.div variants={staggerItem} className="flex items-start gap-4 rounded-2xl border border-[#ecebf5] bg-white/90 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00a8c4] text-white">
                  <MapPin className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[13px] text-[#6f6c8f]">Ofis</p>
                  <p className="text-[16px] font-semibold text-[#1a1a1a]">{settings.address || "Antakya / Hatay"}</p>
                  <p className="mt-1 text-[13px] text-[#6f6c8f]">
                    Hatay reklam ajansı ve web siteciler — Türkiye geneline uzaktan kurulum.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={staggerItem}
                className="flex items-center gap-4 rounded-2xl bg-[#1a1a1a] p-6 text-white"
                role="status"
                aria-live="polite"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10" aria-hidden>
                  <Clock className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] text-white/60">Destek saatleri</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${
                        openNow ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-white/55"
                      }`}
                    >
                      {openNow ? "Şu an açık" : "Mesai dışı"}
                    </span>
                  </div>
                  <p className="text-[16px] font-semibold">{hours.weekdayLine}</p>
                  <p className="text-[13px] text-white/50">{hours.weekendLine}</p>
                  {nextHours.label ? (
                    <p className={`mt-2 text-[12px] font-semibold ${openNow ? "text-emerald-200/90" : "text-amber-200/90"}`}>
                      {nextHours.label}
                    </p>
                  ) : null}
                </div>
              </motion.div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <div className="overflow-hidden rounded-[28px] border border-[#ecebf5] bg-white/90 shadow-[0px_16px_40px_rgba(0,168,196,0.08)]">
          <div className="flex items-center gap-2 border-b border-[#ecebf5] px-5 py-4">
            <Navigation className="h-4 w-4 text-[#00a8c4]" />
            <p className="text-[14px] font-semibold text-[#1a1a1a]">Antakya / Hatay — ofis konumu</p>
          </div>
          <iframe
            title="Hatay360 Antakya ofis haritası"
            className="h-[280px] w-full sm:h-[340px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://maps.google.com/maps?q=Antakya%20Hatay&t=&z=12&ie=UTF8&iwloc=&output=embed"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-[28px] font-bold text-[#1a1a1a]">Sık sorulanlar</h2>
          <p className="mt-2 text-[15px] text-[#6f6c8f]">
            Hatay web tasarım, reklam ve e-ticaret teklifi hakkında kısa cevaplar.
          </p>
        </Reveal>
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="rounded-2xl border border-[#ecebf5] bg-white/90 p-5 open:border-[#b3e5ee]"
            >
              <summary className="cursor-pointer text-[16px] font-semibold text-[#1a1a1a]">{f.q}</summary>
              <p className="mt-3 text-[15px] leading-relaxed text-[#6f6c8f]">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] text-[#a0a3bd]">
          <Link to="/hatay" className="font-semibold text-[#00a8c4] hover:underline">
            Tüm hizmet ilçeleri
          </Link>
        </p>
      </section>

      <ServiceAreas mode="chips" />
    </>
  );
}
