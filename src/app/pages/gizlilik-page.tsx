import { PageCrumbs } from "../components/page-crumbs";
import { PageHero } from "../components/page-hero";
import { PRIVACY_FAQS } from "../lib/seo";

export function GizlilikPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <PageCrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Gizlilik" }]} />
      </div>
      <PageHero
        eyebrow="Yasal"
        title="Gizlilik ve KVKK"
        desc="Hatay360 olarak kişisel verilerinizi yalnızca hizmet sunmak, sizi aramak ve yasal yükümlülükler için işleriz."
      />
      <section className="mx-auto max-w-3xl space-y-8 px-5 py-16 text-[16px] leading-relaxed text-[#514f6e] sm:px-8">
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Veri sorumlusu</h2>
          <p className="mt-2">
            Hatay360, Hatay merkezli yazılım, reklam, web tasarım ve e-ticaret altyapısı hizmetleri sunar.
            İletişim formları, “sizi arayalım” talepleri ve destek kanallarından gelen bilgiler bizimle paylaşılmış sayılır.
          </p>
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Hangi verileri alırız?</h2>
          <p className="mt-2">
            Ad soyad, telefon, e-posta, ilgilendiğiniz hizmet ve mesaj içeriği. Ödeme bilgisi bu sitede tutulmaz;
            tahsilat sanal POS veya fatura süreçleriyle ayrıca yapılır.
          </p>
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Neden kullanırız?</h2>
          <p className="mt-2">
            Teklif vermek, sizi aramak, kurulum ve destek sağlamak, yasal kayıt tutmak. Verilerinizi satmayız,
            izinsiz reklam listelerine eklemeyiz.
          </p>
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Haklarınız</h2>
          <p className="mt-2">
            KVKK kapsamında verilerinize erişme, düzeltme veya silinmesini isteme hakkınız vardır. Bunun için
            iletişim sayfasındaki e-posta veya telefon üzerinden bize yazmanız yeterlidir.
          </p>
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Çerezler</h2>
          <p className="mt-2">
            Site, sayfaların çalışması için gerekli çerezler kullanabilir. Reklam veya üçüncü taraf izleme
            eklenirse burada ayrıca duyurulur. Form gönderimi, aranma talebiniz için açık rızanızdır.
          </p>
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Telif hakkı</h2>
          <p className="mt-2">
            Site tasarımı ve yazılımı Mahir Avcı / Avcı E-Ticaret’e aittir. Görseller, arayüz ve metinler izinsiz kopyalanamaz. Hakkınızı ihlal eden kullanım görürsek yasal yükümlülük doğar.
          </p>
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Sık sorulanlar</h2>
          <p className="mt-2 text-[15px]">Kart, arama listesi ve silme talebi — kısa cevaplar.</p>
          <div className="mt-4 space-y-2">
            {PRIVACY_FAQS.map((faq) => (
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
