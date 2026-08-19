import { PageCrumbs } from "../components/page-crumbs";
import { PageHero } from "../components/page-hero";
import { TERMS_FAQS } from "../lib/seo";

export function KosullarPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Kullanım koşulları" }]} />
      </div>
      <PageHero
        eyebrow="Yasal"
        title="Kullanım koşulları"
        desc="hatay360.com üzerinden sunulan içerik, teklif ve hizmetlerin genel çerçevesi."
      />
      <section className="mx-auto max-w-3xl space-y-8 px-5 py-16 text-[16px] leading-relaxed text-[#514f6e] sm:px-8">
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Hizmet kapsamı</h2>
          <p className="mt-2">
            Hatay360 e-ticaret altyapısı, web tasarım, Google/Meta reklam yönetimi, pazaryeri entegrasyonu ve özel
            yazılım hizmetleri sunar. Sitedeki fiyatlar örnek / kampanya niteliğinde olabilir; kesin tutar teklifte yazılır.
          </p>
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Deneme ve kurulum</h2>
          <p className="mt-2">
            Ücretsiz deneme süresi paket ve kampanyaya göre değişir (genelde 15 gün). Deneme, kredi kartı zorunlu
            olmadan keşif ve demo içindir. Canlı satışa geçişte SSL, POS ve alan adı süreçleri ayrıca planlanır.
          </p>
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Sorumluluk</h2>
          <p className="mt-2">
            Müşterinin ürün içerikleri, stok doğruluğu ve yasal satış izinleri kendisine aittir. Altyapı ve yazılım
            tarafında kesintisiz çalışma için elimizden geleni yaparız; üçüncü taraf pazaryeri veya reklam
            platformlarındaki değişikliklerden Hatay360 sorumlu tutulamaz.
          </p>
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Telif ve fikri mülkiyet</h2>
          <p className="mt-2">
            hatay360.com üzerindeki tasarım, arayüz, metin, yazılım, demo siteleri, paket görünümü ve ticari sunum Mahir Avcı / Avcı E-Ticaret’e aittir.
            5846 sayılı Fikir ve Sanat Eserleri Kanunu ile 6102 sayılı Türk Ticaret Kanunu kapsamında korunur. İzinsiz kopyalama, çoğaltma, kaynak kodunu çıkarma, yapay zeka ile türetme veya başka bir markada kullanma yasaktır; tespit halinde yasal yollara başvurulur.
          </p>
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">İletişim</h2>
          <p className="mt-2">
            Koşullarla ilgili sorularınız için iletişim sayfasını kullanın. Sözleşme imzalandığında o metin bu
            sayfadaki genel koşulların önüne geçer.
          </p>
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Sık sorulanlar</h2>
          <p className="mt-2 text-[15px]">Kopya, fiyat ve deneme — kısa cevaplar.</p>
          <div className="mt-4 space-y-2">
            {TERMS_FAQS.map((faq) => (
              <details key={faq.q} className="rounded-2xl border border-[#ecebf5] bg-white p-4 text-[#1a1a1a] open:border-[#b3e5ee]">
                <summary className="cursor-pointer text-[15px] font-semibold">{faq.q}</summary>
                <p className="mt-2 text-[14px] font-normal leading-relaxed text-[#6f6c8f]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
