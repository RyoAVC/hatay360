/** Hatay360 kurumsal + yasal sayfa içerikleri (admin’den düzenlenir). Adana360 kurumsal yapısından uyarlanmıştır. */

export type LegalSection = {
  id: string;
  heading: string;
  body: string;
};

export type LegalDocId = "kvkk" | "gizlilik" | "mesafeli" | "kosullar";

export type LegalDoc = {
  id: LegalDocId;
  title: string;
  eyebrow: string;
  summary: string;
  sections: LegalSection[];
};

export type CorporateValue = {
  id: string;
  title: string;
  text: string;
};

export type CorporateStat = {
  id: string;
  value: string;
  label: string;
};

export type CorporateContent = {
  hubEyebrow: string;
  hubTitle: string;
  hubLead: string;
  aboutTitle: string;
  aboutLead: string;
  aboutBody: string;
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
  valuesTitle: string;
  values: CorporateValue[];
  policiesTitle: string;
  policies: string[];
  principlesTitle: string;
  principles: string[];
  stats: CorporateStat[];
  legalDocs: LegalDoc[];
};

const uid = () => `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const DEFAULT_CORPORATE_CONTENT: CorporateContent = {
  hubEyebrow: "Kurumsal",
  hubTitle: "Hatay’dan büyüyen dijital çözüm ortağı",
  hubLead:
    "Web tasarım, reklam, harita kaydı ve yazılımda şeffaf süreç; ölçülen sonuç. Antakya merkezli ekibimizle Hatay işletmelerine uzun soluklu ortaklık kuruyoruz.",
  aboutTitle: "Biz kimiz?",
  aboutLead: "Hatay360 — Antakya merkezli web tasarım ve reklam ajansı",
  aboutBody:
    "Hatay360 olarak işletmelerin dijitalde görünür, aranır ve dönüşüm üretir hale gelmesi için çalışıyoruz. Google Ads, Meta, kurumsal web / landing, Google Maps kaydı ve isteğe bağlı e-ticaret altyapısı tek ekipte toplanır. Kalite, güven ve müşteri memnuniyetini merkeze alarak; planlamadan teslimata ve sonrasına kadar yanınızdayız.",
  missionTitle: "Misyonumuz",
  missionBody:
    "Markaların ihtiyaçlarını doğru analiz ederek; tasarım, yazılım, dijital pazarlama ve reklam yönetimi alanlarında yenilikçi, ölçülebilir ve sonuç odaklı çözümler sunmak. Müşteri memnuniyetini ön planda tutan, kaliteli, güvenilir ve sürdürülebilir hizmet anlayışımızla Hatay işletmelerinin dijital başarısına katkı sağlamak.",
  visionTitle: "Vizyonumuz",
  visionBody:
    "Dijital dünyada fark yaratan yenilikçi çözümler geliştirerek, Hatay ve Türkiye’de güvenilir ve tercih edilen dijital ajanslardan biri olmak. Teknolojiye yön veren yaklaşımımız ve sürdürülebilir hizmet anlayışımızla, müşterilerimizin dijital dönüşümünde stratejik çözüm ortağı olarak kalıcı değer üretmek.",
  valuesTitle: "Kurumsal değerler",
  values: [
    { id: "v1", title: "Güvenilirlik", text: "Şeffaf iletişim, sürdürülebilir hizmet ve her süreçte ulaşılabilir ekip." },
    { id: "v2", title: "Kalite", text: "Her projede yüksek standartlarda, profesyonel ve titiz üretim." },
    { id: "v3", title: "Yenilikçilik", text: "Dijital trendleri takip eden, güncel teknolojilerle güçlendirilmiş çözümler." },
    { id: "v4", title: "Müşteri odaklılık", text: "İhtiyaçları doğru analiz edip en uygun stratejiyi geliştiren yaklaşım." },
    { id: "v5", title: "Sorumluluk", text: "Zamanında teslim, doğru planlama ve etik çalışma prensibi." },
    { id: "v6", title: "Ekip ruhu", text: "Uzman, disiplinli ve koordineli ekiple sürdürülebilir iş başarısı." },
  ],
  policiesTitle: "Politikamız",
  policies: [
    "Her projeyi ihtiyaç analizinden teslimata kadar profesyonel süreç yönetimiyle ele almak.",
    "Marka değerini artıracak özgün, güvenilir ve işlevsel çözümler üretmek.",
    "Teknolojik gelişmeleri takip ederek süreçleri sürekli iyileştirmek.",
    "Satış öncesi ve sonrası destekte kesintisiz iletişim sağlamak.",
    "Ölçülebilir başarıyı hedefleyerek sürdürülebilir sonuçlar üretmek.",
  ],
  principlesTitle: "İlkelerimiz",
  principles: [
    "7/24 iletişim: telefon, WhatsApp ve müşteri paneli ile destek.",
    "Şeffaf hizmet: süreç ve ücretlendirmede açık, net çalışma.",
    "Ulaşılabilirlik: kapalı iletişim veya muhatap bulunamama deneyimini ortadan kaldırmak.",
    "Profesyonel çözüm: her hizmetin uzman ekiple hazırlanması.",
    "Esnek ödeme: yazılı teklif ve güvenli tahsilat seçenekleri.",
  ],
  stats: [
    { id: "s1", value: "15", label: "Hatay ilçesi" },
    { id: "s2", value: "4", label: "Hizmet hattı" },
    { id: "s3", value: "Antakya", label: "Merkez" },
    { id: "s4", value: "7/24", label: "Destek hattı" },
  ],
  legalDocs: [
    {
      id: "kvkk",
      title: "KVKK Aydınlatma Metni",
      eyebrow: "6698 sayılı Kanun",
      summary:
        "Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla sizi bilgilendiririz. Bu metin resmi aydınlatma metnidir.",
      sections: [
        {
          id: "k1",
          heading: "1. Veri sorumlusu",
          body: "Hatay360 (Avcı E-Ticaret ekosistemi / Mahir Avcı). İletişim: info@hatay360.com · +90 850 308 68 37 · Antakya / Hatay. Web: hatay360.com",
        },
        {
          id: "k2",
          heading: "2. İşlenen kişisel veriler",
          body: "Kimlik (ad soyad), iletişim (telefon, e-posta), işlem güvenliği (IP, oturum kayıtları), müşteri işlem (talep, teklif, destek içeriği), gerektiğinde fatura bilgileri. Ödeme kartı bilgileri bu sitede saklanmaz; tahsilat sanal POS veya fatura süreçleriyle yapılır.",
        },
        {
          id: "k3",
          heading: "3. İşleme amaçları",
          body: "Teklif ve bilgilendirme, sizi aramak, sözleşme kurulması ve ifası, müşteri ilişkileri yönetimi, destek ve şikâyet süreçleri, yasal yükümlülüklerin yerine getirilmesi, bilgi güvenliği.",
        },
        {
          id: "k4",
          heading: "4. Hukuki sebepler",
          body: "KVKK m.5/2: sözleşmenin kurulması/ifası, meşru menfaat, hukuki yükümlülük; açık rıza gereken hallerde açık rızanız (ör. ticari elektronik ileti).",
        },
        {
          id: "k5",
          heading: "5. Aktarım",
          body: "Verileriniz; barındırma / e-posta / SMS sağlayıcıları, muhasebe ve yasal zorunluluk halinde yetkili kurumlarla; sözleşmesel ve teknik tedbirlerle paylaşılabilir. Verilerinizi satmayız, izinsiz reklam listelerine eklemeyiz.",
        },
        {
          id: "k6",
          heading: "6. Saklama süresi",
          body: "İlgili mevzuattaki zamanaşımı ve saklama süreleri ile işleme amacının gerektirdiği süre kadar tutulur; süre bitiminde silinir, yok edilir veya anonimleştirilir.",
        },
        {
          id: "k7",
          heading: "7. Haklarınız (KVKK m.11)",
          body: "Verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme/yok etme, aktarılan üçüncü kişilere bildirilmesini isteme, itiraz ve zararın giderilmesini talep etme haklarınız vardır. Başvuru: info@hatay360.com veya iletişim formundan.",
        },
        {
          id: "k8",
          heading: "8. Güncelleme",
          body: "Bu aydınlatma metni güncellenebilir. Güncel sürüm hatay360.com/kvkk adresinde yayınlanır.",
        },
      ],
    },
    {
      id: "gizlilik",
      title: "Gizlilik Politikası",
      eyebrow: "Gizlilik",
      summary: "Kişisel verilerinizin nasıl korunduğu, çerezler ve iletişim kanallarımız hakkında bilgilendirme.",
      sections: [
        {
          id: "g1",
          heading: "Kapsam",
          body: "Bu politika hatay360.com, müşteri/bayi panelleri ve iletişim formları için geçerlidir. Hatay360; web tasarım, Google Ads / Meta, Google Maps ve isteğe bağlı e-ticaret hizmetleri sunar.",
        },
        {
          id: "g2",
          heading: "Toplanan veriler",
          body: "Ad soyad, telefon, e-posta, ilgilendiğiniz hizmet ve mesaj içeriği. Panel hesaplarında e-posta/şifre ve işlem kayıtları. Ödeme kartı verisi sitede tutulmaz.",
        },
        {
          id: "g3",
          heading: "Kullanım amaçları",
          body: "Teklif, arama, kurulum, destek ve yasal kayıt. Verilerinizi satmayız.",
        },
        {
          id: "g4",
          heading: "Çerezler",
          body: "Site, oturum ve güvenlik için zorunlu çerezler kullanabilir. Analitik / reklam çerezleri eklenirse burada ayrıca duyurulur. Form gönderimi, aranma talebiniz için açık rızanızdır.",
        },
        {
          id: "g5",
          heading: "Güvenlik",
          body: "HTTPS, erişim kontrolü ve yetkilendirme ile verilerinizi korumaya özen gösteririz. %100 güvenlik taahhüdü hiçbir sistem için mümkün olmasa da endüstri standartlarını uygularız.",
        },
        {
          id: "g6",
          heading: "Telif",
          body: "Site tasarımı ve yazılımı Mahir Avcı / Avcı E-Ticaret’e aittir. İzinsiz kopyalama yasaktır.",
        },
        {
          id: "g7",
          heading: "İletişim",
          body: "Gizlilik talepleri: info@hatay360.com · +90 850 308 68 37. Aydınlatma metni: /kvkk",
        },
      ],
    },
    {
      id: "mesafeli",
      title: "Mesafeli Satış Sözleşmesi",
      eyebrow: "Satış",
      summary: "Uzaktan akdedilen hizmet satışlarında tarafların hak ve yükümlülükleri.",
      sections: [
        {
          id: "m1",
          heading: "Taraflar",
          body: "Satıcı: Hatay360. Alıcı: Sipariş / teklif formunda bilgileri yer alan gerçek veya tüzel kişi.",
        },
        {
          id: "m2",
          heading: "Konu",
          body: "Web tasarım, reklam yönetimi, harita kaydı, yazılım veya e-ticaret paketlerinin uzaktan satışı ve ifası.",
        },
        {
          id: "m3",
          heading: "Bedel ve ödeme",
          body: "Kesin bedel yazılı teklifte belirtilir. Ödeme havale/EFT veya anlaşmalı sanal POS ile yapılır. Kampanya fiyatları örnek nitelikte olabilir.",
        },
        {
          id: "m4",
          heading: "Teslim / ifa",
          body: "Dijital hizmetlerde ifa, erişim bilgilerinin iletilmesi veya yayına alınması ile gerçekleşir. Süre paket ve keşfe göre teklifte yazılır.",
        },
        {
          id: "m5",
          heading: "Cayma",
          body: "Dijital içerik / kişiselleştirilmiş hizmetlerde mevzuattaki istisnalar saklıdır. Cayma hakkı doğduğu hallerde talep yazılı iletilir.",
        },
        {
          id: "m6",
          heading: "Uyuşmazlık",
          body: "Hatay mahkemeleri ve icra daireleri yetkilidir; tüketici hakem heyetleri yasal sınırlar içinde başvurulabilir.",
        },
      ],
    },
    {
      id: "kosullar",
      title: "Kullanım Koşulları",
      eyebrow: "Koşullar",
      summary: "hatay360.com üzerinden sunulan içerik, teklif ve hizmetlerin genel çerçevesi.",
      sections: [
        {
          id: "c1",
          heading: "Hizmet kapsamı",
          body: "Çekirdek hizmetler: web / landing, Google Ads & Meta, Google Maps. E-ticaret ve Pazarla ayrı kalemdir. Sitedeki fiyatlar örnek olabilir; kesin tutar yazılı teklifte belirtilir.",
        },
        {
          id: "c2",
          heading: "Deneme ve kurulum",
          body: "Ücretsiz deneme (genelde 15 gün) kredi kartı zorunlu olmadan keşif / demo içindir. Canlıya geçişte SSL, POS ve alan adı ayrıca planlanır.",
        },
        {
          id: "c3",
          heading: "Sorumluluk",
          body: "Ürün içerikleri, stok ve yasal izinler müşteriye aittir. Üçüncü taraf platform değişikliklerinden Hatay360 sorumlu tutulamaz.",
        },
        {
          id: "c4",
          heading: "Fikri mülkiyet",
          body: "Teslim edilen özgün tasarım, sözleşmede aksi yoksa lisans / kullanım koşullarına tabidir. Tema ve üçüncü taraf lisansları ilgili sağlayıcıya aittir.",
        },
      ],
    },
  ],
};

function asString(v: unknown, fallback = "") {
  return typeof v === "string" ? v : fallback;
}

function normalizeLegalDoc(raw: unknown, fallback: LegalDoc): LegalDoc {
  if (!raw || typeof raw !== "object") return { ...fallback, sections: fallback.sections.map((s) => ({ ...s })) };
  const row = raw as Record<string, unknown>;
  const sectionsRaw = Array.isArray(row.sections) ? row.sections : fallback.sections;
  const sections = sectionsRaw
    .map((item, i) => {
      if (!item || typeof item !== "object") return null;
      const s = item as Record<string, unknown>;
      const heading = asString(s.heading).trim().slice(0, 160);
      const body = asString(s.body).trim().slice(0, 8000);
      if (!heading && !body) return null;
      return {
        id: asString(s.id, `sec-${i}`).slice(0, 80),
        heading: heading || `Bölüm ${i + 1}`,
        body: body || "",
      } satisfies LegalSection;
    })
    .filter(Boolean) as LegalSection[];
  return {
    id: fallback.id,
    title: asString(row.title, fallback.title).slice(0, 120) || fallback.title,
    eyebrow: asString(row.eyebrow, fallback.eyebrow).slice(0, 80) || fallback.eyebrow,
    summary: asString(row.summary, fallback.summary).slice(0, 500) || fallback.summary,
    sections: sections.length ? sections : fallback.sections.map((s) => ({ ...s })),
  };
}

export function normalizeCorporateContent(raw: unknown): CorporateContent {
  const base = DEFAULT_CORPORATE_CONTENT;
  if (!raw || typeof raw !== "object") {
    return JSON.parse(JSON.stringify(base)) as CorporateContent;
  }
  const row = raw as Record<string, unknown>;
  const values = Array.isArray(row.values)
    ? (row.values
        .map((item, i) => {
          if (!item || typeof item !== "object") return null;
          const v = item as Record<string, unknown>;
          const title = asString(v.title).trim().slice(0, 80);
          const text = asString(v.text).trim().slice(0, 400);
          if (!title) return null;
          return { id: asString(v.id, `v-${i}`), title, text };
        })
        .filter(Boolean) as CorporateValue[])
    : base.values;

  const list = (key: "policies" | "principles", fallback: string[]) => {
    const arr = row[key];
    if (!Array.isArray(arr)) return [...fallback];
    const next = arr.map((x) => asString(x).trim().slice(0, 400)).filter(Boolean);
    return next.length ? next : [...fallback];
  };

  const stats = Array.isArray(row.stats)
    ? (row.stats
        .map((item, i) => {
          if (!item || typeof item !== "object") return null;
          const s = item as Record<string, unknown>;
          return {
            id: asString(s.id, `s-${i}`),
            value: asString(s.value).slice(0, 40) || "—",
            label: asString(s.label).slice(0, 60) || "—",
          };
        })
        .filter(Boolean) as CorporateStat[])
    : base.stats;

  const legalFallback = base.legalDocs;
  const legalRaw = Array.isArray(row.legalDocs) ? row.legalDocs : [];
  const legalDocs = legalFallback.map((fb) => {
    const found = legalRaw.find((d) => d && typeof d === "object" && (d as { id?: string }).id === fb.id);
    return normalizeLegalDoc(found, fb);
  });

  return {
    hubEyebrow: asString(row.hubEyebrow, base.hubEyebrow).slice(0, 60) || base.hubEyebrow,
    hubTitle: asString(row.hubTitle, base.hubTitle).slice(0, 160) || base.hubTitle,
    hubLead: asString(row.hubLead, base.hubLead).slice(0, 600) || base.hubLead,
    aboutTitle: asString(row.aboutTitle, base.aboutTitle).slice(0, 120) || base.aboutTitle,
    aboutLead: asString(row.aboutLead, base.aboutLead).slice(0, 200) || base.aboutLead,
    aboutBody: asString(row.aboutBody, base.aboutBody).slice(0, 4000) || base.aboutBody,
    missionTitle: asString(row.missionTitle, base.missionTitle).slice(0, 120) || base.missionTitle,
    missionBody: asString(row.missionBody, base.missionBody).slice(0, 3000) || base.missionBody,
    visionTitle: asString(row.visionTitle, base.visionTitle).slice(0, 120) || base.visionTitle,
    visionBody: asString(row.visionBody, base.visionBody).slice(0, 3000) || base.visionBody,
    valuesTitle: asString(row.valuesTitle, base.valuesTitle).slice(0, 80) || base.valuesTitle,
    values: values.length ? values : base.values.map((v) => ({ ...v })),
    policiesTitle: asString(row.policiesTitle, base.policiesTitle).slice(0, 80) || base.policiesTitle,
    policies: list("policies", base.policies),
    principlesTitle: asString(row.principlesTitle, base.principlesTitle).slice(0, 80) || base.principlesTitle,
    principles: list("principles", base.principles),
    stats: stats.length ? stats : base.stats.map((s) => ({ ...s })),
    legalDocs,
  };
}

export function getLegalDoc(content: CorporateContent, id: LegalDocId): LegalDoc {
  return content.legalDocs.find((d) => d.id === id) || DEFAULT_CORPORATE_CONTENT.legalDocs.find((d) => d.id === id)!;
}

export function emptyCorporateValue(): CorporateValue {
  return { id: uid(), title: "Yeni değer", text: "Açıklama" };
}
