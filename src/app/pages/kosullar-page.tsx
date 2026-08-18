import { PageHero } from "../components/page-hero";

export function KosullarPage() {
  return (
    <>
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
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">İletişim</h2>
          <p className="mt-2">
            Koşullarla ilgili sorularınız için iletişim sayfasını kullanın. Sözleşme imzalandığında o metin bu
            sayfadaki genel koşulların önüne geçer.
          </p>
        </div>
      </section>
    </>
  );
}
