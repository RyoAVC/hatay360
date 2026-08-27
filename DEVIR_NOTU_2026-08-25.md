# HATAY360 — PROJE DEVİR NOTU

**Tarih:** 25 Ağustos 2026  
**Ana proje:** Hatay360  
**Sonraki hedef:** Hatay360'ta tamamlanan modüllerin Adana360'a markaya uygun biçimde aktarılması

## 1. Proje konumları

- Hatay360: `C:\Users\User\Desktop\Hatay360 yeni`
- Adana360: `C:\Users\User\Desktop\adana 360`
- Adana360 aktarım görevi: `codex://threads/01a0382b-8078-7420-b699-6526ee57cd1b`

## 2. Yerel çalışma bağlantıları

Hatay360 için iki süreç birlikte çalışmalıdır:

1. API/sunucu:

   ```powershell
   npm run dev:server
   ```

   Varsayılan adres: `http://127.0.0.1:3601`

2. Arayüz:

   ```powershell
   npm run dev -- --host 127.0.0.1 --port 3602
   ```

   Bağlantılar:

   - Ana site: `http://127.0.0.1:3602/`
   - Admin paneli: `http://127.0.0.1:3602/panel`
   - Firma/bayi alanı: `http://127.0.0.1:3602/firma`
   - Müşteri girişi: `http://127.0.0.1:3602/musteri/giris`
   - Demolar: `http://127.0.0.1:3602/demolar`

**Devir anında 3601 ve 3602 portlarındaki servisler kapalıdır.** Yeni oturumda yukarıdaki iki komutla yeniden başlatılmalıdır.

## 3. GitHub durumu

- Repo: `https://github.com/RyoAVC/hatay360.git`
- Aktif dal: `cursor/maps-leads-and-partner-hub`
- Son özellik kaydı: `b1f895c Use live AvcNova demo URLs`

Yakın dönem önemli kayıtlar:

| Kayıt | İçerik |
|---|---|
| `b1f895c` | AvcNova demo bağlantılarını canlı adreslere taşıdı |
| `c8b66b4` | Site genelindeki animasyonları etkinleştirdi |
| `bc99396` | Sözleşme bilgileri düzenleyicisini ekledi |
| `d39ac65` | Otomatik müşteri sözleşmesi PDF üretimini ekledi |
| `f090b04` | Admin paneline koyu kurumsal kontrast kazandırdı |
| `df31436` | Eski admin düzenini sabit uygulama kabuğuyla değiştirdi |
| `72687cf` | Kurumsal admin çalışma alanını oluşturdu |
| `98d48ef` | Shadcn esintili admin tasarım sistemini ekledi |
| `1900699` | Admin dashboard kabuğunu yeniledi |
| `e1dac77` | Bayi/müşteriyi tek aktif destek görüşmesiyle sınırladı |

## 4. Çalışma ağacındaki korunacak değişiklikler

Aşağıdaki dosyalar devir anında değiştirilmiş durumdadır ve henüz son özellik kayıtlarına dahil değildir. Bunlar kullanıcıya ait/yarım çalışmalar kabul edilmeli; körlemesine geri alınmamalı veya üzerine yazılmamalıdır:

- `src/app/components/require-auth.tsx`
- `src/app/components/require-customer.tsx`
- `src/app/components/require-partner.tsx`
- `src/app/components/sector-solutions.tsx`
- `src/app/components/technologies-orbit.tsx`
- `src/app/context/partner-auth-context.tsx`
- `src/app/pages/admin-page.tsx`
- `src/app/pages/customer-portal-page.tsx`
- `src/app/partner-panel/partner-hub-page.tsx`
- `src/app/partner-panel/partner-panel-shell.tsx`

Takip edilmeyen test/görsel çıktıları:

- `.playwright-mcp/`
- `hatay360-hero-animation-check.png`
- `sector-stack-fixed.png`

Yeni geliştirici önce bu değişiklikleri incelemeli, yalnızca kendi dokunduğu dosyaları kaydetmelidir. `git reset --hard` veya toplu geri alma yapılmamalıdır.

## 5. Tamamlanan ana modüller

### Canlı destek merkezi

- SQLite üzerinde kalıcı destek konuşmaları ve mesajları
- Müşteri/bayi ile admin arasında mesajlaşma
- Mesajların sayfa yenilemeden düzenli olarak gelmesi
- Görüşme alanında sabit yükseklik ve kendi içinde kaydırma; sayfanın sonsuza uzaması engellendi
- Okunmamış mesaj sayacı
- Müşteri ve admin için farklı bildirim sesleri
- SLA, atama, durum ve öncelik filtreleri
- Müşteri/bayi için aynı anda yalnızca bir aktif görüşme
- Adminin yeni görüşme açabilmesi ve yönetebilmesi
- Yerel port değiştiğinde çalışan dinamik geliştirme kaynağı/CORS kontrolü

İlgili kayıtlar: `ed0fc48`, `4e54e01`, `a81dde8`, `da8f783`, `e1dac77`, `0add4ee`.

### Admin paneli

- Eski düzen yerine kurumsal sabit panel kabuğu
- Açık içerik alanı ve güçlü koyu navigasyon kontrastı
- Shadcn esintili bileşen ve kart sistemi
- Daha okunabilir masaüstü yerleşim
- Mevcut admin fonksiyonları korunarak görsel sistem yenilendi

### Otomatik sözleşme PDF'i

Admin müşteri detayında **Sözleşme şablonları** bölümüne eklendi.

- Seçili müşteri ve paket bilgileriyle otomatik PDF
- Şirket logosu
- Müşteri/unvan, yetkili, T.C./vergi no
- Paket adı, yıllık bedel, aylık karşılık ve açıklama
- Web/site/mağaza paketinde alan adı
- Yalnız reklam paketinde alan adı satırının tamamen kaldırılması
- Eksik alanların uydurulmaması ve admin ekranında uyarılması
- Çok sayfalı sözleşme düzeni

Temel dosyalar:

- `src/app/templates/sozlesme.html`
- `src/app/templates/hatay360-logo.jpg`

Temel uçlar:

- `/api/admin/customers/:id/contracts/automatic`
- `/api/admin/customers/:id/contracts/details`

Tarayıcı testi:

1. `http://127.0.0.1:3602/panel?tab=customers` açılır.
2. `TestAvc` müşterisinde **Düzenle** seçilir.
3. **Sözleşme şablonları** bölümüne inilir.
4. Örnek olarak şu bilgiler girilir:
   - T.C./vergi no: `12345678901`
   - Paket: `Hatay360 Reklam Start`
   - Yıllık bedel: `120000`
   - Açıklama: `Google Ads ve Meta reklam yönetimi`
5. Önce **Bilgileri Kaydet**, sonra **Sözleşme Oluştur** seçilir.
6. Reklam paketinde alan adı alanı ve PDF satırı görünmemelidir.

Mouse ile imza özelliği bu aşamaya dahil edilmemiştir; sonraki ayrı görevdir.

### Site animasyonları

- Site hareketleri ve görünürlük efektleri genel olarak aktif
- Kullanıcı isteği doğrultusunda “hareketi azalt” tercihi site animasyonlarını otomatik kapatmıyor
- İlgili temel dosyalar: `src/app/lib/site-motion.ts`, `src/main.tsx`, `src/styles/attention-effects.css`

Son tarayıcı kontrolünde yaklaşık 80 hareketli dönüşüm ve 29 opaklık değişimi gözlenmişti.

### AvcNova demo bağlantıları

Yerel `http://localhost:4120` bağlantıları kaldırıldı. Canlı merkez ve ürün bağlantıları kullanılıyor:

- `https://avcnova.com`
- `https://avcnova.com/yazilim/avcnova-arac-kiralama`
- `https://avcnova.com/yazilim/avcnova-konaklama`
- `https://avcnova.com/yazilim/yat-kiralama-yazilimi`
- `https://avcnova.com/yazilim/motosiklet-kiralama-yazilimi`

Bu adresler son kontrolde HTTP 200 döndürdü.

## 6. Son doğrulama durumu

Son özellik paketinden sonra elde edilen sonuçlar:

- `npm test`: 71/71 test geçti
- `npm run typecheck`: geçti
- `npm run build`: geçti
- Derlemede yalnızca paket boyutu uyarıları vardı; işlevsel hata yoktu

Yeni değişiklik yapılırsa yeniden çalıştırılacak kontroller:

```powershell
npm run typecheck
npm test
npm run build
```

## 7. Adana360'a aktarım planı

Adana360 aynı genel React/Vite/Node/SQLite yaklaşımını kullansa da birebir aynı depo değildir. Karşılaştırmada Hatay360'ın son 15 işlevsel kaydının dokunduğu 29 dosyanın 13'ü Adana360'ta yoktu, 16'sı farklıydı. Bu nedenle dosyalar körlemesine kopyalanmamalı ve kayıtlar doğrudan cherry-pick edilmemelidir.

### Birinci paket — canlı destek, önce yapılacak 5 görev

1. SQLite üzerinde kalıcı destek merkezi
2. Okunmamış sayaçları ve farklı bildirim sesleri
3. Canlı mesaj yenileme ve sınırlı/kaydırılabilir konuşma alanı
4. SLA, atama, durum ve öncelik filtreleri
5. Müşteri/bayi için tek aktif görüşme; admin istisnası

Referans kayıtlar: `ed0fc48`, `4e54e01`, `a81dde8`, `da8f783`, `e1dac77`.

Adana360 görevine bu kapsam ile başlanmıştır. İlk beş madde bitmeden sonraki pakete geçilmemelidir.

### İkinci paket — yönetim altyapısı

1. Dinamik yerel CORS/kaynak kontrolü
2. Admin dashboard kabuğu
3. Shadcn esintili tasarım sistemi
4. Kurumsal çalışma alanı
5. Sabit ve duyarlı uygulama kabuğu

### Üçüncü paket — son özellikler

1. Koyu kontrast düzenlemesi
2. Adana360 logosu, şirket metni ve alan adına uyarlanmış otomatik sözleşme PDF'i
3. Sözleşme bilgileri düzenleyicisi
4. Site animasyonları
5. AvcNova canlı bağlantıları

## 8. Adana360 aktarımında kesin kurallar

- `data/hatay360.sqlite` dosyası **kesinlikle Adana360'a kopyalanmamalıdır**.
- Müşteri kayıtları, oturumlar, parolalar, `.env` dosyaları ve gizli bilgiler taşınmamalıdır.
- Adana360 kendi veritabanını ve tablolarını bağımsız oluşturmalıdır.
- Hatay360 yalnızca okunabilir teknik referans olarak kullanılmalıdır.
- Adana360'ın mavi görsel kimliği ve `Adana360` markası korunmalıdır.
- Adana360 kaynaklarında kalan `Hatay360` metinleri her modül aktarımında özellikle aranmalı ve doğru marka metniyle değiştirilmelidir.
- Her beş görevden sonra tip kontrolü, test, derleme ve tarayıcı kontrolü yapılmalıdır.

## 9. Yeni oturumda önerilen ilk adımlar

1. Hatay360 çalışma ağacındaki yarım değişiklikleri incele ve koru.
2. Gerekirse Hatay360'ı 3601/3602 portlarında başlatıp temel ekranları kontrol et.
3. Adana360 görevindeki ilk beş destek modülünün sonucunu al.
4. Adana360'ta müşteri, bayi ve admin taraflarında canlı destek akışını ayrı ayrı test et.
5. Ancak bu beş modül sorunsuzsa ikinci aktarım paketine geç.

## 10. Yeni Codex hesabına verilecek kısa başlangıç talimatı

> `C:\Users\User\Desktop\Hatay360 yeni\DEVIR_NOTU_2026-08-25.md` dosyasını tamamen oku. Hatay360'taki kullanıcıya ait mevcut değişiklikleri silme. Önce `codex://threads/01a0382b-8078-7420-b699-6526ee57cd1b` Adana360 görevindeki ilk beş canlı destek modülünün durumunu kontrol et. Hatay360 veritabanını, müşteri verisini, oturumları veya gizli dosyaları Adana360'a kopyalama. Adana360 markasını ve mavi tasarımını koruyarak uyarlama yap. Beş görev tamamlandığında test, tip kontrolü, derleme ve tarayıcı sonucunu raporla; ondan sonra ikinci pakete geç.

