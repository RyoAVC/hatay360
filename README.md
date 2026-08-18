# Hatay360

Avcı e-ticaret ve dijital pazarlama sitesi. Figma'dan dışa aktarılmış bir React projesidir.

## İlk kurulum

Bilgisayarında **Node.js** (18 veya üzeri) kurulu olmalı.

Proje klasöründe şu komutları çalıştır:

```bash
npm install
npm run build
npm start
```

Üretim sunucusu ve SQLite veritabanı birlikte açılır: [http://localhost:3601](http://localhost:3601)

Geliştirme sırasında iki terminal kullanılır:

```bash
# Terminal 1 — API ve SQLite
npm run dev:server

# Terminal 2 — Vite canlı önizleme
npm run dev
```

Canlı önizleme adresi [http://localhost:3600](http://localhost:3600) olur ve `/api` istekleri otomatik olarak SQLite sunucusuna yönlendirilir.

## Sık kullanılan komutlar

| Komut | Ne işe yarar? |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu açar (canlı önizleme) |
| `npm run dev:server` | SQLite, panel oturumu, başvuru ve metrik API’sini açar |
| `npm test` | Telefon, WhatsApp ve yerel SEO adres testlerini çalıştırır |
| `npm run typecheck` | TypeScript hatalarını dosya üretmeden kontrol eder |
| `npm run build` | Sitenin yayınlanacak halini `dist` klasörüne üretir |
| `npm run check` | Önce tip kontrolü, ardından üretim derlemesi çalıştırır |
| `npm run preview` | Üretilen siteyi yerelde dener |
| `npm start` | Üretim sitesini ve API’yi birlikte açar |

## Klasörler (kısaca)

- `src/app/pages` — Sayfalar (ana sayfa, paketler, iletişim…)
- `src/app/components` — Ortak parçalar (menü, kahraman alanı, fiyatlar…)
- `src/app/context` — Site içeriği (paketler, referanslar, ayarlar)
- `src/assets` — Logo ve görseller
- `src/styles` — Tailwind ve tema stilleri

## Yönetim paneli

Adres: geliştirmede [http://localhost:3600/panel](http://localhost:3600/panel), üretim sunucusunda [http://localhost:3601/panel](http://localhost:3601/panel)

Menüde görünmez. Örnek çevre değişkenleri `.env.example` içinde yer alır. Gerçek gizli değerleri depoya koymayın. Yönetici şifresi ön yüze gönderilmez; Node.js sunucusunda `scrypt` ile hashlenir ve giriş HttpOnly oturum çereziyle korunur.

Oluşturmak için (Unix): `cp .env.example .env` ve Windows PowerShell için: `Copy-Item .env.example .env` — ardından `HATAY360_ADMIN_USER` ve `HATAY360_ADMIN_PASSWORD` değerlerini değiştirin.

Panel içerikleri `data/hatay360.sqlite` veritabanında saklanır. Tarayıcı kaydı yalnızca sunucu geçici olarak kapalıyken önbellek görevi görür. Paneldeki **Yedek İndir** düğmesiyle ayrıca JSON yedeği alınabilir. Yapay zekâ API anahtarı veritabanına veya yedek dosyasına eklenmez.

İletişim formu başvuruyu önce SQLite veritabanına kaydeder, ardından panelde kayıtlı telefon numarasına hazır WhatsApp mesajı açar. Paneldeki **Metrikler & Müşteriler** bölümü başvuruları, hitleri, tekil ziyaretçileri, kaynakları ve Hatay ilçe ilgi sırasını gösterir. IP adresleri ham olarak saklanmaz; günlük anonim özet için hashlenir.

## AVC Güven Damgası

Header’daki güven damgası `src/app/components/avc-trust-seal.tsx` içinde bağımsız bileşendir. Avcı E-Ticaret, Dijivio, Adana360, AvcLabs ve diğer AVC projelerine aynı bileşen taşınabilir. Her sitede yalnızca `siteName` prop'u değiştirilir; istenirse `hubUrl` ile merkezi doğrulama adresi verilir. Sahiplik doğrulaması varsayılan olarak `https://hub.avcieticaret.com` adresine gider.

## Ücretsiz SEO araçları

Organik arama trafiği için üç ayrı, indexlenebilir araç sayfası bulunur:

- `/araclar/google-sira-bulucu` — Google'ı otomatik kazımadan manuel sıra ve site sonucu kontrolü
- `/araclar/meta-etiket-olusturucu` — SEO başlığı, açıklaması, anahtar kelimeler ve SERP önizlemesi
- `/araclar/yerel-anahtar-kelime-olusturucu` — sektör, şehir ve ilçeye göre yerel kelime fikirleri

Araçlar header, ana sayfa, footer ve sitemap üzerinden birbirine bağlanır. Her aracın kendine ait title, description, keywords ve `WebApplication` JSON-LD verisi vardır.

## Demo subdomainleri ve merkezi SEO

Tek üretim derlemesi hostname'e göre doğru landing page'i açar:

- `demo.hatay360.com` → tüm sektör demoları
- `taksi.hatay360.com` → taksi landing page
- `nakliyat.hatay360.com`, `klinik.hatay360.com`, `servis.hatay360.com` → ilgili sektör landing page'i
- `/demo/taxi`, `/demo/nakliyat`, `/demo/klinik`, `/demo/servis` → subdomain olmadan çalışan yedek adresler

Sunucuda bu adreslerin aynı Node.js uygulamasına yönlenmesi için DNS tarafında ilgili CNAME kayıtları (veya `*.hatay360.com` wildcard kaydı), reverse proxy tarafında da aynı uygulama hedefi gerekir. Kod DNS kaydı oluşturmaz.

Google Search Console ve kelime sıra takibi ikinci kez Hatay360 içine kurulmaz. Hatay360 zaten [AVC Ops Hub SEO](https://hub.avcieticaret.com/seo) içinde bağlıdır. Paneldeki SEO ekranı bu merkezi ekrana güvenli bağlantı verir. Canlı şehir/cihaz bazlı SERP kontrolü, resmi SERP sağlayıcısı Hub'a bağlandığında tüm markalar için tek merkezden devreye alınmalıdır.
