# Hatay360 — Güncel Codex Devir Dosyası

> Güncelleme: 18 Ağustos 2026  
> Bu dosya yeni Codex'in projeyi aynı noktadan, mevcut çalışmaları bozmadan devralması içindir.

## 1. İlk yapılacaklar

1. Bu dosyayı tamamen oku.
2. Ardından ayrıntılı geçmiş için `C:\Users\User\Desktop\Hatay360 yeni\CODEX_DEVIR_NOTU.md` dosyasını oku.
3. Bütün projeyi baştan tarama; yalnızca istenen işle ilgili dosyalara hedefli bak.
4. Kullanıcının mevcut dosyalarını, SQLite verisini ve ilgisiz değişiklikleri koru.
5. Tasarım değişikliklerini gerçek yerel tarayıcıda masaüstü ve mobil ölçüde kontrol et.

## 2. Proje konumu ve teknoloji

```text
C:\Users\User\Desktop\Hatay360 yeni
```

- React 18
- Vite 6
- TypeScript
- Tailwind CSS 4
- React Router
- Node HTTP sunucusu
- Node yerleşik SQLite
- Ana sunucu: `server.mjs`
- Veritabanı: `data\hatay360.sqlite`
- Proje Git deposu değildir.

## 3. Kritik veri güvenliği

Şu dosyayı silme, sıfırlama veya örnek veriyle değiştirme:

```text
C:\Users\User\Desktop\Hatay360 yeni\data\hatay360.sqlite
```

- Gerçek müşteri, reklam veya yönetici verisi uydurma.
- Şifreleri, oturum çerezlerini ve kişisel verileri devir dosyalarına yazma.
- İlgisiz Node süreçlerini topluca kapatma.
- Özellikle başka projelerin `4114` ve `4115` portlarındaki süreçlerine dokunma.

## 4. Sunucu durumu

18 Ağustos 2026 tarihindeki son kontrolde `127.0.0.1:3601` dinlemiyordu. Tarayıcıda açık görünen sayfa önceki yüklenmiş görüntü olabilir.

Sunucuyu PowerShell ile başlat:

```powershell
cd "C:\Users\User\Desktop\Hatay360 yeni"
npm.cmd start
```

Kod değişikliğinden sonra güncel üretim arayüzü için:

```powershell
cd "C:\Users\User\Desktop\Hatay360 yeni"
npm.cmd run build
npm.cmd start
```

Kontrol:

```powershell
curl.exe -sS http://127.0.0.1:3601/api/health
```

Beklenen cevap:

```json
{"ok":true,"database":"sqlite"}
```

Adresler:

```text
Site:          http://127.0.0.1:3601/
Admin girişi: http://127.0.0.1:3601/panel/giris
Müşteri:      http://127.0.0.1:3601/musteri/giris
```

## 5. En son tamamlanan çalışma

Kullanıcının paketler, iletişim alanı ve logo animasyonlarıyla ilgili son işaretleri uygulandı.

### Paket kartları

- Küçük ve okunmayan `Google Ads & Meta`, `Taksi • Nakliyat • Klinik • Servis` ve `Kurumsal Görünürlük` etiketleri tam genişlikte, açık zeminli ve okunur bilgi şeritlerine çevrildi.
- `₺69.900` Yerel Hizmet paketine yüksek efektli alev ve kıvılcım rozeti eklendi.
- `Özel Fiyat` Kurumsal Reklam & Web paketine buz parçaları ve soğuk duman rozeti eklendi.
- Öne çıkan `Hatay360 Reklam Pro` rozeti korundu.
- Masaüstü görsel kontrolde rozetler kartlarla çakışmadan görünüyordu.

İlgili dosya:

```text
src\app\components\pricing.tsx
```

### Efektleri admin panelinden yönetme

`Paketler & Fiyatlar` alanına iki yeni özellik eklendi:

- Animasyonlu üst rozet türü
- Efektli rozet metni

Admin şu efektleri seçebilir:

```text
Efekt yok
Alev ve kıvılcım
Buz ve soğuk duman
Hız ve rüzgâr
Neon parıltı
```

Bu alanlar mevcut içerik JSON/SQLite kaydetme akışıyla saklanır. Yeni paketler de aynı efektleri kullanabilir.

İlgili dosyalar:

```text
src\app\context\content-context.tsx
src\app\pages\admin-page.tsx
```

### Kurumsal iletişim alanı

Eski sade destek kutusu baştan tasarlandı:

- Hatay360 iletişim merkezi başlığı
- Satış öncesi keşif ve satış sonrası destek anlatımı
- Kurumsal telefon, WhatsApp ve e-posta kartları
- Doğrudan ajans ekibi vurgusu
- Kayıtlı destek süreci
- Antakya merkez ve AVC kayıt bilgisi
- Müşteri panelinden destek/hizmet talebi bağlantısı
- Izgara dokusu, kurumsal koyu arka plan ve kontrollü ışık animasyonu
- Büyük ve parıltılı Hatay360 logosu

İlgili dosya:

```text
src\app\components\support-cta.tsx
```

### Footer

- Logo büyütüldü ve sakin ölçek/parıltı animasyonu eklendi.
- Marka anlatımı, telefon, WhatsApp, e-posta ve ofis kartları bulunuyor.
- Google Maps yıldızları puan iddiası değildir; gerçek profil kaynağına yönlendirir.
- Uydurma müşteri yorumu veya puanı yayınlanmadı.

İlgili dosya:

```text
src\app\components\site-footer.tsx
```

## 6. Son doğrulama durumu

Son paket/iletişim çalışmasından sonra şunlar başarılı tamamlandı:

```text
npm.cmd run typecheck                         BAŞARILI
npm.cmd test                                  6/6 BAŞARILI
npm.cmd exec vite build -- --configLoader runner  BAŞARILI
```

Bu devir dosyası hazırlanırken `npm.cmd run typecheck` yeniden çalıştırıldı ve başarılı oldu.

Yerel tarayıcıdaki son görsel kontrolde:

- Masaüstü yatay taşma yoktu.
- `scrollWidth` ve `clientWidth` eşitti.
- Konsol uyarısı/hatası yoktu.
- Alev ve buz rozetleri görünüyordu.
- Yeni iletişim alanı ve footer düzgün yükleniyordu.

Sunucu şu anda çalışmadığı için yeni Codex önce sunucuyu başlatmalı, sonra bu görsel durumu yeniden doğrulamalıdır.

## 7. Daha önce tamamlanan ana sistemler

- Admin giriş ve içerik yönetimi
- SQLite içerik/veri bağlantısı
- Müşteri reklam portalı
- Google Ads, Meta ve diğer kampanya kayıtları
- Bütçe, harcama, gelir, ROAS ve net sonuç gösterimi
- Destek mesajı ve yeni hizmet talebi
- Müşteri şifre değiştirme ve oturum kapatma güvenliği
- CSV reklam raporu
- Google Maps hizmet sayfası ve gerçek işletme profil bağlantısı
- Referanslar sayfası
- Dosya/rota tabanlı sektör demoları
- Hatay keşif ve ilçe sayfaları
- AVC güven damgası ve sol kenar güven sekmesi
- 10 MB'a kadar logo yükleme, otomatik kırpma ve PNG dönüşümü

## 8. Sabit bilgiler

Doğru telefon:

```text
0850 308 68 37
tel:+908503086837
```

Google Maps işletme adı:

```text
Hatay Web Tasarım ve Reklam Yazılım Ajansı
```

AVC doğrulama adresi:

```text
https://hub.avcieticaret.com
```

Demo adresleri subdomain değildir:

```text
/demo/taksi
/demo/nakliyat
/demo/klinik
/demo/servis
```

## 9. Kullanıcının tasarım ve çalışma kuralları

- Türkçe ve kısa durum güncellemeleri ver.
- Gereksiz soru sormadan doğrudan uygula.
- Tasarımda boş, sade ve zayıf alan bırakma; kurumsal ve görsel olarak güçlü yap.
- Animasyon dikkat çekici olabilir fakat okunabilirliği bozmasın.
- Mobil taşma oluşturma.
- Genel hizmet sayfalarında kullanıcı istemedikçe yeni fiyat uydurma.
- Uydurma ciro, ROAS, müşteri sayısı, Google puanı veya müşteri yorumu kullanma.
- Google ve Meta API'leri henüz resmî olarak bağlıymış gibi gösterme; reklam verileri admin tarafından giriliyor.
- Her önemli değişiklikten sonra TypeScript, test ve üretim derlemesi çalıştır.
- Güvenli yerel başlatma ve test işlemleri yapılabilir; dağıtım, Git işlemi, gerçek veri ekleme veya silme için ayrıca izin al.

## 10. Yeni Codex için sıradaki iş

1. `npm.cmd start` ile `3601` sunucusunu başlat.
2. `/api/health` cevabını doğrula.
3. Ana sayfada paket rozetlerini masaüstü ve 375 px mobil ölçüde kontrol et.
4. Admin hesabı mevcutsa `/panel/giris` üzerinden `Paketler & Fiyatlar` bölümünde efekt seçicinin göründüğünü doğrula. Şifreyi dosyalardan çıkarmaya veya göstermeye çalışma.
5. Yeni iletişim alanında logo kırpılması, taşma ve kart hizalarını kontrol et.
6. Konsol hatalarını kontrol et.
7. Kullanıcının sonraki görsel işaretlerine göre devam et.

## 11. Hızlı başlangıç metni

Yeni Codex'e şunu yaz:

```text
C:\Users\User\Desktop\Hatay360 yeni\CODEX_DEVIR_GUNCEL.md dosyasını tamamen oku. Ardından CODEX_DEVIR_NOTU.md dosyasına bak. Mevcut SQLite verisini ve kullanıcı değişikliklerini koru. Önce 3601 sunucusunu başlatıp health kontrolü yap, sonra paket efektleri, admin efekt seçicisi ve yeni iletişim alanını masaüstü/mobil tarayıcıda doğrula. Tüm projeyi baştan tarama; yalnızca gereken dosyalara hedefli bak.
```
