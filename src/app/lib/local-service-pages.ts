export const LOCAL_SERVICE_PAGES = {
  "/hatay-web-tasarim": {
    eyebrow: "Hatay web tasarım ajansı",
    title: "Hatay Web Tasarım: Hızlı, Kurumsal ve Dönüşüm Odaklı Siteler",
    description: "Hatay ve ilçelerinde mobil uyumlu kurumsal web tasarım, e-ticaret, teknik SEO ve sürekli bakım hizmeti. Hatay360 ile ölçülebilir bir dijital vitrin kurun.",
    keywords: "hatay web tasarım, hatay web sitesi, antakya web tasarım, iskenderun web tasarım, hatay web tasarım firması",
    serviceName: "Hatay web tasarım hizmeti",
    lead: "Antakya merkezli ekibimiz; işletmenizin hizmetini açık anlatan, telefonda hızlı açılan ve ziyaretçiyi arama, WhatsApp veya teklif formuna yönlendiren web siteleri tasarlar.",
    benefits: ["Mobil öncelikli kurumsal tasarım", "Teknik SEO, güvenlik ve hız temeli", "WhatsApp, form, harita ve ölçüm entegrasyonu", "Yayın sonrası bakım ve içerik desteği"],
  },
  "/hatay-reklam-ajansi": {
    eyebrow: "Hatay reklam ajansı",
    title: "Hatay Reklam Ajansı: Google Ads ve Meta Reklam Yönetimi",
    description: "Hatay reklam ajansı Hatay360 ile Google Ads ve Meta kampanyalarınızı ölçülebilir hedefler, doğru açılış sayfaları ve düzenli raporlamayla yönetin.",
    keywords: "hatay reklam ajansı, hatay reklam, antakya reklam ajansı, hatay google reklam, hatay dijital reklam ajansı",
    serviceName: "Hatay dijital reklam yönetimi",
    lead: "Reklam bütçesini yönetim ücretinden ayırır; arama niyeti, doğru hedefleme, dönüşüm takibi ve anlaşılır raporlarla kampanyayı görünür hâle getiririz.",
    benefits: ["Google Ads arama kampanyaları", "Meta reklam hedefleme ve kreatif planı", "Dönüşüm odaklı açılış sayfası", "Şeffaf bütçe ve performans raporu"],
  },
  "/hatay-yazilim-firmasi": {
    eyebrow: "Hatay yazılım firması",
    title: "Hatay Yazılım Firması: Özel Web Yazılım ve İş Otomasyonu",
    description: "Hatay yazılım firması Hatay360; özel web uygulaması, yönetim paneli, müşteri portalı, entegrasyon ve iş otomasyonu geliştirir.",
    keywords: "hatay yazılım firması, hatay yazılım ajansı, antakya yazılım şirketi, özel yazılım hatay, web yazılım hatay",
    serviceName: "Hatay özel yazılım geliştirme",
    lead: "Hazır paketlerin karşılamadığı operasyonlar için yönetim paneli, müşteri portalı, iş akışı ve entegrasyonları işletmenizin gerçek sürecine göre geliştiririz.",
    benefits: ["İhtiyaca özel web uygulamaları", "Yönetim paneli ve müşteri portalı", "API ve üçüncü taraf entegrasyonları", "Bakım, güvenlik ve sürdürülebilir geliştirme"],
  },
  "/hatay-google-reklam-ajansi": {
    eyebrow: "Hatay Google reklam ajansı",
    title: "Hatay Google Reklam Ajansı: Arama Ağı Kampanya Yönetimi",
    description: "Hatay Google reklam ajansı Hatay360 ile doğru kelimelerde görünür olun. Google Ads kurulumu, negatif kelimeler, dönüşüm ölçümü ve düzenli optimizasyon.",
    keywords: "hatay google reklam ajansı, hatay google ads, antakya google reklam, iskenderun google ads, google reklam yönetimi hatay",
    serviceName: "Hatay Google Ads yönetimi",
    lead: "Satın alma niyeti taşıyan yerel aramalara odaklanan kampanyalar kurar; gereksiz tıklamaları negatif kelimelerle sınırlar ve gerçek iletişim dönüşümlerini ölçeriz.",
    benefits: ["Arama ve rakip analizi", "Anahtar ve negatif kelime yönetimi", "Telefon, WhatsApp ve form dönüşüm ölçümü", "Sürekli teklif ve bütçe optimizasyonu"],
  },
} as const;

export type LocalServicePath = keyof typeof LOCAL_SERVICE_PAGES;
export function getLocalServicePage(pathname: string) {
  return LOCAL_SERVICE_PAGES[pathname as LocalServicePath];
}
