import { ArrowRight, ExternalLink, Puzzle } from "lucide-react";
import { Link } from "react-router";
import { AVCLABS_PRODUCTS, AVCLABS_VITRINE } from "../lib/avclabs";

export function AvclabsShowcase() {
  return (
    <section className="mt-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dbeaf2] bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0ea5c9]">
            AvcNova · AVC ailesi
          </span>
          <h2 className="mt-4 text-[22px] font-black text-[#0f172a] sm:text-[28px]">
            AvcNova — BUNG lisanslı yazılımlar
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#64748b]">
            Araç kiralama, bungalov, yat ve moto için hazır operasyon sistemleri. Filo, takvim, sözleşme ve tahsilat lisansla açılır. Kurumsal ve büyük projeler içindir; AVC ailesinin AvcNova markasıdır.
          </p>
        </div>
        <a
          href={AVCLABS_VITRINE}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#e7edf3] bg-white px-4 py-3 text-[13px] font-black text-[#0f172a] shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
        >
          AvcNova vitrinini aç
          <ExternalLink className="h-3.5 w-3.5 text-[#0ea5c9]" />
        </a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[24px] border border-[#e7edf3] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#0ea5c9]">Hatay360</p>
          <p className="mt-2 text-[16px] font-black text-[#0f172a]">Web tasarım, reklam ve görünürlük</p>
          <p className="mt-1 text-[13px] text-[#64748b]">Teknik servis, klinik, taksi, nakliyat. Markanızın sitesi, reklamı ve çağrı akışı.</p>
        </div>
        <div className="rounded-[24px] border border-[#dbeaf2] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#0ea5c9]">AvcNova</p>
          <p className="mt-2 text-[16px] font-black text-[#0f172a]">BUNG lisanslı yazılımlar</p>
          <p className="mt-1 text-[13px] text-[#64748b]">Kurumsal ve büyük firmalar için filo, rezervasyon, sözleşme ve tahsilat sistemleri.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {AVCLABS_PRODUCTS.map((item) => (
          <article
            key={item.slug}
            className="overflow-hidden rounded-[28px] border border-[#e7edf3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
          >
            <div className="relative h-48">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#0ea5c9]">
                AvcNova · lisanslı
              </span>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[11px] font-bold text-white/75">{item.name}</p>
                <h3 className="text-[20px] font-black">{item.title}</h3>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-[13px] leading-relaxed text-[#64748b]">{item.text}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.modules.slice(0, 4).map((mod) => (
                  <span key={mod} className="inline-flex items-center gap-1 rounded-full bg-[#f8fafc] px-2.5 py-1 text-[10px] font-bold text-[#1e293b] ring-1 ring-[#edf2f7]">
                    <Puzzle className="h-3 w-3 text-[#0ea5c9]" /> {mod}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/demo/${item.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a8c4] px-4 py-2.5 text-[13px] font-black text-white"
                >
                  Sistem örneğini gör <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`${AVCLABS_VITRINE}${item.vitrinePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#e7edf3] px-4 py-2.5 text-[13px] font-bold text-[#0f172a]"
                >
                  AvcNova vitrini <ExternalLink className="h-3.5 w-3.5 text-[#0ea5c9]" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
