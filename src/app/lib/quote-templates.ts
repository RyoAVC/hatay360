export type QuoteTemplateKey = "kurumsal" | "prime";

export type QuoteTemplate = {
  key: QuoteTemplateKey;
  name: string;
  subtitle: string;
  defaultTitle: string;
  bodyHtml: string;
};

const QUOTE_HEADER = `<p><strong>HATAY360</strong> · Web Tasarım · Reklam · Dijital Görünürlük · hatay360.com</p>
<p><strong>Müşteri:</strong> [Firma Ünvanı] · [Yetkili] · [Telefon] · [E-posta]</p>
<p><strong>Teklif No:</strong> [___] · <strong>Tarih:</strong> [GG.AA.YYYY]</p>
<hr/>`;

export const QUOTE_TEMPLATES: QuoteTemplate[] = [
  {
    key: "kurumsal",
    name: "Kurumsal Teklif",
    subtitle: "Web + bakım + temel SEO",
    defaultTitle: "Hatay360 Kurumsal Web Teklifi",
    bodyHtml: `${QUOTE_HEADER}
<h2>Kurumsal Web Tasarım Teklifi</h2>
<h3>1. Kapsam</h3>
<p>Mobil uyumlu kurumsal web sitesi; ana sayfa, hizmetler, iletişim, WhatsApp ve harita entegrasyonu. İçerik müşteri tarafından sağlanır; metin düzenleme Hatay360 kapsamındadır.</p>
<h3>2. Teslim</h3>
<p>Tasarım onayı sonrası yayına alma, SSL, temel SEO (title, meta, sitemap). Alan adı ve hosting müşteri adına yapılandırılır.</p>
<h3>3. Bakım</h3>
<p>Yayın sonrası ilk 30 gün küçük düzeltmeler dahil. Kapsam dışı geliştirmeler ayrı kalemdir.</p>
<h3>4. Ödeme planı (örnek)</h3>
<p><strong>Aylık hizmet bedeli:</strong> [___] TL · <strong>Kurulum:</strong> [___] TL (tek sefer)</p>
<p>Vadesi geçen tutara %15 gecikme bedeli uygulanır. Reklam medya bütçesi bu tutarın dışındadır.</p>
<h3>5. Geçerlilik</h3>
<p>Bu teklif 14 gün geçerlidir. Kesin tutar ve takvim yazılı onay sonrası bağlayıcıdır.</p>
<p><em>Hatay360 · Avcı E-Ticaret · Mahir Avcı</em></p>`,
  },
  {
    key: "prime",
    name: "Prime VIP Teklif",
    subtitle: "Premium paket · öncelikli destek",
    defaultTitle: "Hatay360 Prime VIP Teklif",
    bodyHtml: `${QUOTE_HEADER}
<h2>Prime VIP Dijital Paket Teklifi</h2>
<p><strong>VIP öncelik:</strong> Öncelikli destek hattı, hızlı revizyon, aylık performans özeti.</p>
<h3>Paket içeriği</h3>
<ul>
<li>Kurumsal web sitesi (genişletilmiş sayfa seti)</li>
<li>Google Ads ve/veya Meta reklam yönetimi (medya bütçesi ayrı)</li>
<li>Google işletme profili / harita görünürlük düzeni</li>
<li>Aylık SEO kelime takibi ve panel raporu</li>
<li>SSL, yedek ve güvenlik izleme çipleri</li>
</ul>
<h3>Örnek tutarlar</h3>
<p><strong>Prime aylık:</strong> [___] TL · <strong>Kurulum / tasarım:</strong> [___] TL</p>
<p>Reklam tıklaması ve harcama yönetim ücretine dahil değildir. Sıra garantisi verilmez; optimizasyon sürekli yürütülür.</p>
<h3>Onay</h3>
<p>Müşteri panelinden kayıtlı kabul veya imzalı sözleşme ile iş başlatılır.</p>
<p><em>Hatay360 Prime · hatay360.com/musteri</em></p>`,
  },
];

export const QUOTE_TEMPLATE_MAP = Object.fromEntries(QUOTE_TEMPLATES.map((item) => [item.key, item])) as Record<QuoteTemplateKey, QuoteTemplate>;
