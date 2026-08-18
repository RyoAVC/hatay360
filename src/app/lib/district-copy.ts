export type DistrictAngle = {
  hook: string;
  fit: string;
};

/** İlçe sayfalarını birbirinin kopyası olmaktan çıkarır. */
export const DISTRICT_ANGLES: Record<string, DistrictAngle> = {
  Antakya: {
    hook: "Ofisimiz Antakya’da. Keşif görüşmesini yüz yüze veya uzaktan yapıyoruz.",
    fit: "Restoran, kafe, klinik, butik ve kurumsal firmalar için site, reklam ve mağaza aynı ekiple yürür.",
  },
  Defne: {
    hook: "Antakya’ya komşu, hızlı büyüyen bir ilçe. Yeni işletmeye kısa sürede yayınlanır site.",
    fit: "Esnaf, villa/emlak ve yerel hizmet işletmeleri için mobil uyumlu web ve Google Ads.",
  },
  Arsuz: {
    hook: "Sahil ve sezonluk işletmeler için site + reklam ritmi ayrı planlanır.",
    fit: "Otel, kafe, plaj işletmesi ve yazlık kiralama sitelerinde hızlı, net, mobil öncelikli tasarım.",
  },
  İskenderun: {
    hook: "Liman ve sanayi kenti. Katalog, B2B ve ihracatçı görünürlüğü sık isteniyor.",
    fit: "Fabrika, lojistik, klinik ve mağaza için kurumsal site, Google Ads ve e-ticaret altyapısı.",
  },
  Dörtyol: {
    hook: "Sanayi ve tarımın kesiştiği ilçe. Ürün kataloğu ve toptan satış siteleri öne çıkar.",
    fit: "Üretici, bayi ve yerel mağaza için stoklu e-ticaret ve ölçülebilir reklam.",
  },
  Payas: {
    hook: "İskenderun körfezine yakın. Küçük işletmeye ağır panel değil, sade ve hızlı site.",
    fit: "Servis, esnaf ve yerel ticaret için web tasarım + WhatsApp dönüşümlü reklam.",
  },
  Erzin: {
    hook: "Tarım ve paketleme işletmeleri için ürünü anlatan, güven veren site gerekir.",
    fit: "Üretici, ihracat ve yerel ticaret: katalog sitesi, e-ticaret ve Google görünürlüğü.",
  },
  Kırıkhan: {
    hook: "Geçiş güzergâhı ve ticaret. Mağaza ve servis işletmeleri net teklif ister.",
    fit: "Yerel ticaret, servis ve e-ticaret için sade site, reklam ve pazaryeri bağlantısı.",
  },
  Reyhanlı: {
    hook: "Sınır ticareti ve yerel esnaf. Hem Türkçe hem net iletişim önemli.",
    fit: "Toptan, perakende ve hizmet işletmeleri için web, reklam ve sipariş altyapısı.",
  },
  Kumlu: {
    hook: "Küçük ilçede büyük ajans şart değil. Tek muhatap, net fiyat, hızlı teslim.",
    fit: "Esnaf ve tarım işletmeleri için sade kurumsal site ve temel Google Ads.",
  },
  Hassa: {
    hook: "Yaylaya ve üretime yakın. Ürünü ve güveni öne çıkaran sade siteler işe yarar.",
    fit: "Üretici, yerel ticaret ve hizmet için web tasarım ve reklam yönetimi.",
  },
  Altınözü: {
    hook: "Zeytin ve tarım bölgesi. Markayı ve ürünü anlatan katalog siteleri tercih edilir.",
    fit: "Üretici, kooperatif ve esnaf için web sitesi, e-ticaret ve yerel reklam.",
  },
  Yayladağı: {
    hook: "Sınır ve yayla. Konaklama, üretim ve yerel ticaret için sade, hızlı sayfalar.",
    fit: "Konaklama, tarım ve esnaf için web tasarım, rezervasyon/iletişim ve reklam.",
  },
  Samandağ: {
    hook: "Sahil, mutfak ve turizm. Görsel ağırlıklı site + sezonluk reklam planı.",
    fit: "Restoran, konaklama ve yerel marka için web tasarım, Google/Meta ve e-ticaret.",
  },
  Belen: {
    hook: "Geçit ve lojistik güzergâhı. Servis ve ticaret işletmeleri net, hızlı site ister.",
    fit: "Lojistik, servis ve yerel ticaret için kurumsal site, reklam ve altyapı.",
  },
};

export function districtAngle(name: string): DistrictAngle {
  return (
    DISTRICT_ANGLES[name] || {
      hook: `${name} işletmeleriyle uzaktan çalışıyoruz. Keşif görüşmesi telefon veya video ile başlar.`,
      fit: `${name} için kurumsal site, reklam ve e-ticaret altyapısı tek ekiple kurulur.`,
    }
  );
}
