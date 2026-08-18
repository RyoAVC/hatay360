# Hatay360 Codex Devir Notu

Bu dosya, projeyi devralacak yeni Codex'in aynı noktadan güvenli biçimde devam etmesi için hazırlanmıştır.

## 1. Proje konumu

```text
C:\Users\User\Desktop\Hatay360 yeni
```

Proje Git deposu değildir. Kullanıcının mevcut çalışmalarını koru; ilgisiz dosyaları değiştirme veya geri alma.

## 2. Teknoloji

- React 18
- Vite 6
- TypeScript
- Tailwind CSS 4
- React Router
- Node.js HTTP sunucusu
- Node yerleşik SQLite
- Veritabanı: `data/hatay360.sqlite`
- Ana sunucu: `server.mjs`
- Varsayılan yerel port: `3601`

Kontrol ve çalıştırma:

```powershell
cd "C:\Users\User\Desktop\Hatay360 yeni"
npm.cmd run typecheck
npm.cmd test
npm.cmd exec vite build -- --configLoader runner
node server.mjs
```

Admin hesabı ortam değişkenlerinden oluşturulur:

```powershell
$env:HATAY360_ADMIN_USER="..."
$env:HATAY360_ADMIN_PASSWORD="..."
node server.mjs
```

## 3. Kullanıcının çalışma tercihleri

- Türkçe konuş.
- Uzun plan anlatmak yerine doğrudan uygula.
- Tasarım değişikliklerini gerçek tarayıcıda görsel olarak kontrol et.
- Genel web sayfalarında fiyat yayınlama.
- Sahte yorum, toplu sahte yorum veya usulsüz yorum silme sistemi yapma.
- Google politika ihlallerinde resmî raporlama/itiraz ve gerçek müşteri yorumu toplama yaklaşımını kullan.
- Uydurma referans metriği, ciro, ROAS veya müşteri sözü kullanma.
- Her önemli değişiklikten sonra TypeScript, test ve üretim derlemesi çalıştır.

## 4. Telefon ve Google Harita bilgisi

Doğru telefon:

```text
0850 308 68 37
tel:+908503086837
```

Google Maps üzerinde doğrulanan işletme adı:

```text
Hatay Web Tasarım ve Reklam Yazılım Ajansı
```

Canlı Google Maps aramasında görülen bilgiler:

- Kategori: Web Sitesi Tasarımcısı
- Adres: Kıbrıs Caddesi No:13
- Telefon: 0850 308 6837
- 24 saat açık olarak görünüyordu

Google Maps bileşeni gerçek iframe kullanıyor:

```text
https://www.google.com/maps?q=Hatay%20Web%20Tasar%C4%B1m%20ve%20Reklam%20Yaz%C4%B1l%C4%B1m%20Ajans%C4%B1&output=embed
```

İlgili dosyalar:

- `src/app/components/google-maps-promo.tsx`
- `src/app/pages/google-maps-page.tsx`

Harita vitrini koyu yeşil tasarımlı, gerçek hareketli Google Harita, işletme kartı, canlı haritada açma ve telefon butonu içeriyor.

## 5. Referanslar sayfası

Dosya:

```text
src/app/pages/referanslar-page.tsx
```

Kullanıcı önceki büyük kart tasarımını beğenmedi. En son tasarım yatay proje modülleri hâline getirildi:

- Masaüstünde iki sütun
- Kart ölçüsü yaklaşık `536×227 px`
- Solda küçük proje görseli
- Sağda marka adı, domain, sektör, amaç ve AVC doğrulaması
- Yatay taşma yok
- Görseller yüklendi
- Kartlar canlı siteye gidiyor

Gerçek referanslar:

- Kuyumcu Doğan — `https://kuyumcudogan.com`
- Ceptematbaa — `https://ceptematbaa.com`
- Söyle Yerinden — `https://soyleyerinden.com`
- Kamil Keskin — `https://kamilkeskin.com`
- Benguen — `https://benguen.com`
- Baskimo — `https://baskimo.com`
- Antpisos — `https://antpisos.com`
- Hatay Yörem — `https://hatayyorem.com`

Yerel görseller:

```text
src/assets/references/
```

Görseller Adana360 çalışmalar sayfasındaki gerçek portföy görsellerinden alınmıştır.

## 6. AVC güven damgası

İki yapı var:

```text
src/app/components/avc-trust-seal.tsx
src/app/components/avc-floating-lock.tsx
```

- Header damgası yaklaşık `149×38 px`.
- Sol altta tüm halka açık sayfalarda sabit AVC güven kilidi var.
- Küçük yeşil nabız ışığı yanıp sönüyor.
- Tıklanınca AVC ekosistemi ve sahiplik açıklaması açılıyor.
- Doğrulama bağlantısı: `https://hub.avcieticaret.com`
- Müşteri ve admin panellerinde halka açık floating lock gösterilmez.

`src/app/root.tsx` içinde kullanılıyor.

## 7. Logo yükleme sistemi

Logo yükleme sınırı 10 MB.

Dosya:

```text
src/app/lib/logo-image.ts
```

Admin panelinden yüklenen PNG, JPG, WebP veya SVG:

- Otomatik okunuyor.
- Şeffaf veya tek renk kenarları kırpılıyor.
- Oranı bozulmuyor.
- Maksimum yaklaşık `1600×800 px` ölçüsüne getiriliyor.
- PNG'ye dönüştürülüyor.
- Şeffaflık korunuyor.
- Eski ve yeni ölçüler panelde gösteriliyor.

Sunucu, Base64 JSON dönüşümü için `/api/content` isteğinde 20 MB kabul ediyor.

## 8. Demo ve subdomain durumu

Subdomain algılama tamamen kaldırıldı.

Artık şunlar kullanılmıyor:

```text
taksi.hatay360.com
demo.hatay360.com
```

Demolar dosya/rota mantığında:

```text
/demo/taksi
/demo/nakliyat
/demo/klinik
/demo/servis
```

Admin panelindeki **Sektör Sayfaları** bölümünde her sektörün demo adresi ve **Demo dosyasını aç** bağlantısı gösteriliyor.

İlgili dosyalar:

- `src/app/routes.tsx`
- `src/app/pages/sector-page.tsx`
- `src/app/pages/admin-page.tsx`
- `src/app/components/seo-head.tsx`

İç veri slug'ı hâlâ `taxi` olabilir fakat halka açık adres `/demo/taksi` olarak normalize ediliyor.

## 9. Hatay'a özgü trafik sayfaları

Rotalar:

```text
/hatay-kesfet
/hatayda-nerede-kahvalti-yapilir
/google-maps-harita-kaydi
```

Dosyalar:

- `src/app/pages/hatay-discovery-page.tsx`
- `src/app/pages/google-maps-page.tsx`

Hatay keşif planlayıcısı:

- İlçe seçimi
- Kahvaltı, doğa ve aile seçenekleri
- Canlı Google Maps aramaları

SEO metadata ve sitemap kayıtları eklendi.

## 10. Müşteri portalı

Rotalar:

```text
/musteri/giris
/musteri
```

Dosyalar:

```text
src/app/pages/customer-login-page.tsx
src/app/pages/customer-portal-page.tsx
src/app/context/customer-auth-context.tsx
src/app/components/require-customer.tsx
```

Müşteri, kendi web sitesi olmasa bile portal hesabıyla reklamlarını izleyebilir.

Portal özellikleri:

- Ayrı müşteri girişi
- Firma bazlı hesap
- Google Ads kampanyaları
- Meta reklam kampanyaları
- Diğer platform kampanyaları
- Aylık reklam bütçesi
- Yönetim ücreti
- Harcama
- Gösterim
- Tıklama
- CTR
- Lead
- Dönüşüm
- Ölçülen gelir
- Net sonuç
- ROAS
- Yardım/soru gönderme
- Admin yanıtlarını görme
- Yeni hizmet talebi
- Firma adından domain önerisi
- Domain DNS ön sorgulaması
- AVC güven açıklaması
- Aylık harcama / ölçülen gelir geçmişi grafiği
- Türkçe Excel uyumlu CSV reklam raporu
- Müşterinin mevcut şifresiyle güvenli şifre değiştirme
- Şifre değiştiğinde diğer müşteri oturumlarını otomatik kapatma

Örnek hesaplamada doğrulanan senaryo:

```text
Aylık bütçe: 5.000 TL
Harcama: 3.275 TL
Yönetim ücreti: 750 TL
Ölçülen gelir: 14.850 TL
Net sonuç: 10.825 TL
ROAS: 4.53x
Gösterim: 48.620
Tıklama: 1.840
Lead: 127
Dönüşüm: 29
```

Net sonuç formülü:

```text
gelir - reklam harcaması - yönetim ücreti
```

Google/Meta verileri şu anda admin tarafından gerçek reklam raporlarından manuel giriliyor. Resmî Google Ads veya Meta Marketing API otomasyonu henüz bağlanmadı. Arayüzü **canlı API bağlı** diye gösterme.

## 11. Admin müşteri yönetimi

Yeni admin sekmesi:

```text
Müşteri Portalı
```

Dosya:

```text
src/app/pages/admin-customer-panel.tsx
```

Admin şunları yapabiliyor:

- Müşteri hesabı oluşturmak
- Firma adı girmek
- Yetkili kişi girmek
- E-posta ve telefon tanımlamak
- Geçici şifre oluşturmak
- Google/Meta kampanyası eklemek
- Aylık reklam bütçesi tanımlamak
- Yönetim ücreti tanımlamak
- Kampanya dönemi girmek
- Harcama, gelir, gösterim, tıklama, lead ve dönüşüm girmek
- Müşteri mesajlarını yanıtlamak
- Hizmet talebi durumunu değiştirmek

Panel ekranı tarayıcıda doğrulandı; taşma ve konsol hatası yok.

## 12. Yeni SQLite tabloları

`server.mjs` içinde otomatik oluşturuluyor:

```text
customer_accounts
customer_sessions
ad_campaigns
campaign_stats
customer_tickets
customer_service_requests
customer_domain_checks
```

Güvenlik:

- Admin ve müşteri cookie'leri farklı.
- Admin cookie: `hatay360_session`
- Müşteri cookie: `hatay360_customer_session`
- Şifreler `scrypt` ile hashleniyor.
- Oturum token'ları SHA-256 ile saklanıyor.
- Her müşteri sorgusunda `customer_id` filtresi uygulanıyor.
- Müşteri başka müşterinin kampanya veya talebini göremiyor.
- Müşteri portalı `noindex, nofollow`.
- Müşteri şifresi değiştirildiğinde eski oturumlar silinip yeni oturum çerezi üretiliyor.

## 13. Yeni API adresleri

Müşteri:

```text
GET  /api/customer/session
POST /api/customer/login
POST /api/customer/logout
GET  /api/customer/dashboard
POST /api/customer/tickets
POST /api/customer/service-requests
GET  /api/customer/domain-check?domain=firmam.com
POST /api/customer/password
```

Admin:

```text
GET   /api/admin/customers
POST  /api/admin/customers
PATCH /api/admin/customers/:id
POST  /api/admin/campaigns
POST  /api/admin/campaigns/:id/stats
PATCH /api/admin/tickets/:id
PATCH /api/admin/service-requests/:id
```

Domain kontrolü yalnızca DNS ön kontrolüdür:

- `registered`
- `potentially_available`
- `unknown`

**Uygun olabilir** kesin satın alınabilirlik anlamına gelmez. Kayıt kuruluşunda doğrulama gereklidir.

## 14. Test durumu

Son doğrulamalar:

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd exec vite build -- --configLoader runner
```

Üçü de başarılı tamamlandı.

Sunucu API testi genişletildi ve şunları da kontrol ediyor:

- Müşteri hesabı oluşturma
- Kampanya oluşturma
- Kampanya raporu kaydetme
- Müşteri girişi
- Bütçe/harcama/gelir/net sonuç hesabı
- Destek mesajı
- Hizmet talebi
- Geçersiz domain kontrolü
- Admin müşteri listesi

Tarayıcı doğrulamaları:

- Müşteri girişi çalışıyor.
- Müşteri dashboard çalışıyor.
- Admin müşteri portalı sekmesi çalışıyor.
- `/demo/taksi` çalışıyor.
- Referans kartları çalışıyor.
- Firma adından domain önerileri çalışıyor.
- Yatay taşma yok.
- Konsol hatası yok.

## 15. Önemli çalışma notları

- Çalışmakta olan `3601` sunucusu eski `server.mjs` sürecini kullanıyor olabilir. Backend değişikliklerinin aktif olması için sunucuyu yeniden başlat.
- Test için `3612` portunda ayrı önizleme sunucusu açıldı ve durduruldu.
- Ana veritabanına örnek A Firması müşterisi yazılmadı; örnek hesap izole önizleme veritabanında oluşturuldu.
- Şu klasör testten kalmış olabilir:

```text
C:\Users\User\Desktop\Hatay360 yeni\data\portal-preview
```

Silmeden önce yolu doğrula. Yalnızca bu geçici klasörü kaldır. Ana `data/hatay360.sqlite` dosyasına dokunma.

## 16. Sonraki mantıklı işler

1. Ana sunucuyu yeniden başlatıp gerçek admin hesabıyla müşteri portalını test et.
2. Admin panelinden ilk gerçek müşteri hesabını oluştur.
3. Müşteri şifre yenileme ve **şifremi unuttum** akışı ekle.
4. Kampanya raporlarına tarihsel aylık grafik ekle.
5. CSV/PDF müşteri raporu indirme ekle.
6. Google Ads resmî API bağlantısını planla.
7. Meta Marketing API bağlantısını planla.
8. Ticket sistemine çoklu mesaj dizisi ve dosya eki ekle.
9. Domain uygunluğunu resmî registrar API ile doğrula.
10. Müşteri hesabı oluşturulduğunda güvenli davet e-postası gönder.
11. Mobilde müşteri portalını tekrar ekran görüntüsüyle kontrol et.
12. Kullanıcının yeni geri bildirimine göre referans tasarımını yeniden değerlendir.

## 17. Kritik dosya listesi

```text
server.mjs
tests/server-api.test.mjs
src/app/App.tsx
src/app/root.tsx
src/app/routes.tsx
src/app/context/content-context.tsx
src/app/context/auth-context.tsx
src/app/context/customer-auth-context.tsx
src/app/components/require-auth.tsx
src/app/components/require-customer.tsx
src/app/components/seo-head.tsx
src/app/components/google-maps-promo.tsx
src/app/components/avc-trust-seal.tsx
src/app/components/avc-floating-lock.tsx
src/app/pages/admin-page.tsx
src/app/pages/admin-customer-panel.tsx
src/app/pages/customer-login-page.tsx
src/app/pages/customer-portal-page.tsx
src/app/pages/google-maps-page.tsx
src/app/pages/referanslar-page.tsx
src/app/pages/sector-page.tsx
src/app/lib/logo-image.ts
public/sitemap.xml
```

## 18. Yeni Codex'e ilk talimat

Yeni konuşmada aşağıdaki talimatı kullan:

```text
Önce C:\Users\User\Desktop\Hatay360 yeni\CODEX_DEVIR_NOTU.md dosyasını tamamen oku. Mevcut değişiklikleri koru. Ana sunucuyu yeniden başlatmadan önce çalışan portu ve süreci kontrol et. TypeScript, test ve build sonuçlarını yeniden doğrula. Sonra kaldığımız müşteri portalı, admin yönetimi, demo rotaları ve referans tasarımı çalışmalarına devam et.
```

## 19. Ana sayfa tasarım revizyonu — 18 Ağustos 2026

- Doğrulanmamış `₺15M+`, `%340`, `5.8x` gibi vitrin metrikleri kaldırıldı.
- Ana sayfadaki tekrarlanan büyük hizmet/entegrasyon modülü kaldırıldı.
- Sektör kartları masaüstünde iki sütunlu, daha geniş yatay modüllere dönüştürüldü.
- Özel tasarım alanına tıklanabilir Keşif / Tasarım / Yayın simülasyonu eklendi.
- Entegrasyon alanı, ajansın iş kapsamı, iletişim ve raporlama standardını anlatan yeni içerikle değiştirildi.
- Paket bölümündeki sayfadan kopuk arka plan ışımaları kaldırıldı.
- Footer; telefon, WhatsApp, e-posta, ofis, belgeler ve Google Maps doğrulama alanıyla yeniden tasarlandı.
- Google yorumu veya puanı uydurulmadı; yıldız alanı gerçek Google Maps profiline yönlendiriyor.
- Header AVC damgası koyu, kurumsal ekosistem kimliği görünümüne geçirildi.
- Floating AVC bileşeni sol kenarda dikey, çoğunlukla gizli ve aralıklı açılan onay sekmesine dönüştürüldü.
- Masaüstü ve 375 px mobil kontrolde yatay taşma ve konsol hatası yok.

## 20. Paket efektleri ve iletişim alanı — 18 Ağustos 2026

- Paket kartlarındaki küçük/açık renk rozetler tam genişlikte, koyu yazılı ve okunur bilgi şeritlerine dönüştürüldü.
- `₺69.900` Yerel Hizmet paketine hareketli alev ve kıvılcım rozeti eklendi.
- `Özel Fiyat` Kurumsal Reklam & Web paketine buz parçaları ve soğuk duman rozeti eklendi.
- Paket efektleri sabit paket kimliğine bağlı bırakılmadı. Admin panelindeki **Paketler & Fiyatlar** alanından her paket için `Efekt yok`, `Alev ve kıvılcım`, `Buz ve soğuk duman`, `Hız ve rüzgâr` veya `Neon parıltı` seçilebilir; rozet metni ayrıca düzenlenebilir.
- Alt destek alanı iletişim merkezi görünümünde baştan tasarlandı: kurumsal hat durumu, doğrudan ajans ekibi, kayıtlı destek süreci, telefon, WhatsApp, e-posta ve müşteri paneli talep bağlantısı eklendi.
- Destek ve footer logoları büyütüldü; sakin ölçek/parıltı animasyonu eklendi.
- `npm.cmd run typecheck`, `npm.cmd test` (6/6) ve Vite üretim derlemesi başarılıdır.
- `127.0.0.1:3601` üzerinde görsel kontrolde paket/iletişim/footer alanları yüklendi; masaüstünde yatay taşma ve konsol uyarısı/hatası görülmedi.
