# Hatay360 Proje Devir ve Devam Rehberi

Son güncelleme: 24 Ağustos 2026  
Çalışma dizini: `C:\Users\User\Desktop\Hatay360 yeni`  
GitHub: https://github.com/RyoAVC/hatay360  
Aktif branch: `cursor/maps-leads-and-partner-hub`  
Son commit: `4e54e01 Add support unread badges and notification sounds`

## 1. Projenin amacı

Hatay360; kurumsal web hizmetleri, müşteri paneli, bayi/bayilik sistemi ve admin yönetimini aynı uygulamada birleştiren React + Node.js + SQLite tabanlı bir platformdur. Adana360 gibi farklı markaların aynı motoru kullanabilmesi hedeflenmektedir.

Bu geliştirme döneminin ana odağı bayi sistemidir. Basit hesaplama araçlarının yanında gerçek backend kullanan CRM ve destek merkezi kurulmuştur.

## 2. Teknoloji ve çalışma biçimi

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Node.js `server.mjs`
- Veritabanı: Node `node:sqlite`, dosya tabanlı gerçek SQLite
- Ana veritabanı dosyası: `data/hatay360.sqlite`
- Frontend portu: `3600`
- API portu: `3601`
- Test: Node test runner
- Git branch: `cursor/maps-leads-and-partner-hub`

## 3. Yerel çalıştırma

PowerShell içinde proje dizinine geç:

```powershell
cd 'C:\Users\User\Desktop\Hatay360 yeni'
```

Frontend:

```powershell
npm run dev -- --host 127.0.0.1 --port 3600
```

API ve SQLite:

```powershell
npm run dev:server
```

Bağlantılar:

- Ana site: http://127.0.0.1:3600/
- Bayi paneli: http://127.0.0.1:3600/firma
- Bayi girişi: http://127.0.0.1:3600/firma/giris
- Admin paneli: http://127.0.0.1:3600/panel
- API sağlık kontrolü: http://127.0.0.1:3601/api/health

Sunucuyu arka planda başlatırken Windows'ta `Start-Process` ve `-WindowStyle Hidden` kullan. Porttaki eski süreci kapatmadan önce PID'yi `Get-NetTCPConnection` ile kesin olarak doğrula.

## 4. Kontrol komutları

Her önemli değişiklikten sonra sırayla çalıştır:

```powershell
node --check server.mjs
npm run typecheck
npm test
npm run build
git diff --check
```

Mevcut test sonucu: `71/71` başarılı.

## 5. GitHub iş akışı

```powershell
git status --short
git add -- <yalnızca değiştirilen ilgili dosyalar>
git commit -m "Açıklayıcı commit mesajı"
git push
```

Kullanıcıya ait veya ilgisiz değişiklikleri silme. `git reset --hard` ve benzeri yıkıcı komutları kullanma.

## 6. Bayi panelinde tamamlanan ana modüller

### Gerçek backend kullanan profesyonel modüller

1. CRM satış pipeline
   - SQLite'ta `partner_deals` ve `partner_deal_activities`
   - Yeni, nitelikli, teklif, görüşme, kazanıldı ve kaybedildi aşamaları
   - Fırsat tutarı, olasılık, takip tarihi ve sonraki aksiyon
   - Aktivite geçmişi
   - Her bayi yalnızca kendi kayıtlarını görür

2. Bayi destek merkezi
   - SQLite'ta `partner_support_conversations` ve `partner_support_messages`
   - Bayi ile admin arasında çok mesajlı konuşmalar
   - Teknik, satış, finans, sözleşme ve genel kategorileri
   - Normal, yüksek ve acil öncelik
   - Açık, bekleyen, çözüldü ve kapatıldı durumları
   - Admin panelinde ayrı `Bayi destek` gelen kutusu
   - Bayi ve admin için ayrı okunmamış mesaj kayıtları
   - 10 saniyelik bildirim kontrolü
   - Bayi için iki tonlu, admin için üç tonlu farklı bildirim sesi
   - Menüde okunmamış mesaj sayısı rozeti

3. Bayilik şartları
   - SQLite'ta `franchise_terms`
   - Admin ve bayi aynı kalıcı veri kaynağını kullanır
   - `src/app/lib/bayilik-sartlari.ts`

4. Dijital sözleşme altyapısı
   - Sözleşme kabul kaydı ve PDF altyapısı
   - Hukuki metin hazır olmadan gerçek kabul kapalı tutulmaktadır

5. Teklif oluşturucu
   - Teklif kayıtları ve PDF çıktısı

### Diğer bayi özellikleri

- Kazanç simülatörü
- Hızlı müşteri yönlendirme
- Yetkili bayi sertifikası ve doğrulanmış bayi rozeti
- Satış araçları
- Operasyon merkezi
- Müşteri başarı araçları
- Premium araçlar
- Kurumsal araçlar
- Akıllı araçlar
- Komisyon geçmişi
- Ödeme talebi
- Pazarlama kiti

Not: Araç setlerindeki bazı modüller tarayıcı içi yardımcı hesaplayıcı/metin üreticisidir. Bundan sonraki öncelik, yeni basit araçlar eklemek yerine CRM ve destek merkezi gibi SQLite/backend kullanan gerçek iş modülleri geliştirmek olmalıdır.

## 7. Önemli dosyalar

- `server.mjs`: SQLite tabloları, API uçları ve yetkilendirme
- `src/app/partner-panel/partner-hub-page.tsx`: Bayi paneli ana yönlendirme
- `src/app/partner-panel/partner-panel-shell.tsx`: Bayi paneli menü ve premium kabuk
- `src/app/partner-panel/partner-panel-types.ts`: Bayi sekmeleri ve tipler
- `src/app/partner-panel/partner-crm-section.tsx`: CRM arayüzü
- `src/app/partner-panel/partner-support-center.tsx`: Bayi destek arayüzü
- `src/app/components/admin-partner-support-panel.tsx`: Admin destek arayüzü
- `src/app/pages/admin-page.tsx`: Admin ana sayfa ve menü
- `src/app/lib/notification-sound.ts`: Bayi/admin bildirim sesleri
- `src/app/lib/api.ts`: Ortak API istemcisi
- `tests/server-api.test.mjs`: En geniş API entegrasyon testi

## 8. Son önemli commitler

- `4e54e01` Destek okunmamış rozetleri ve bildirim sesleri
- `ed0fc48` Kalıcı bayi destek merkezi
- `2cb19ee` Kalıcı CRM satış pipeline
- `419e378` Premium bayi paneli tasarımı
- `3d314ef` 10 akıllı bayi aracı
- `0e0ec98` 10 kurumsal bayi aracı
- `31e9288` 10 premium büyüme aracı
- `881cf71` 5 müşteri başarı aracı
- `5378fe2` 5 operasyon modülü
- `b23f1ef` 5 satış büyüme aracı
- `7fcb0e8` Yetkili bayi sertifikası ve rozeti
- `844c53c` Teklif oluşturucu ve PDF

## 9. Bilinen noktalar ve dikkat edilmesi gerekenler

- Tarayıcı sesleri, tarayıcı otomatik oynatma politikası nedeniyle kullanıcı sayfada en az bir kez etkileşim kurmadan engellenebilir. Kod hata vermeden sessiz devam eder.
- Bildirimler WebSocket değil, 10 saniyelik polling kullanır. İleri aşamada Socket.IO veya SSE değerlendirilebilir.
- Sözleşme ekranında hukuki metin hazır olmadığı için gerçek dijital kabul bilinçli olarak kapalıdır.
- Büyük Vite bundle uyarısı vardır; çalışma engeli değildir. İleride panel sayfaları `lazy import` ile bölünebilir.
- `.env`, veritabanı, şifre, oturum çerezi ve API anahtarlarını dokümana veya Git'e koyma.
- Bayi ve admin API uçlarında mutlaka `requirePartner` / `requireUser` yetkilendirmesini koru.
- Bayi verisi sorgularında mutlaka `partner_id` filtresi kullan; bayiler birbirinin kayıtlarını görmemelidir.

## 10. Önerilen profesyonel devam sırası

1. Destek merkezine dosya eki ve görsel yükleme
2. Destek konuşmalarına departman, atanan temsilci ve SLA süresi
3. Bildirim polling sistemini SSE veya Socket.IO ile gerçek zamanlı hale getirme
4. CRM kartlarını sürükle-bırak aşama yönetimine çevirme
5. CRM görevleri, hatırlatmalar ve geciken takip uyarıları
6. CRM fırsatını tek tıkla teklif kaydına dönüştürme
7. Admin için bayi CRM performans raporu
8. Bayi kullanıcı/ekip/rol yönetimi
9. Gerçek analitik olay toplama ve dönüşüm panosu
10. Site üreticiyi bayi müşterileriyle ilişkilendirme

## 11. Yeni ChatGPT hesabına verilecek hazır başlangıç promptu

Aşağıdaki metni yeni hesaptaki ilk mesaja ekle:

```text
C:\Users\User\Desktop\Hatay360 yeni klasöründeki Hatay360 projesine devam edeceğiz.

Önce PROJE_DEVIR_VE_DEVAM_REHBERI.md dosyasını tamamen oku. Sonra git status, aktif branch, son commit, çalışan 3600/3601 portları ve /api/health durumunu kontrol et. Mevcut kullanıcı değişikliklerini silme. Aktif branch cursor/maps-leads-and-partner-hub ve GitHub remote https://github.com/RyoAVC/hatay360.git olmalıdır.

Ana öncelik bayi sistemidir. Yeni basit metin araçları ekleme; SQLite/backend kullanan profesyonel modüller geliştir. Mevcut CRM pipeline ve bayi destek merkezinin mimarisini koru. Bayi verilerini partner_id ile izole et. Her değişiklikten sonra node --check server.mjs, npm run typecheck, npm test, npm run build ve git diff --check çalıştır. Başarılı değişiklikleri açıklayıcı commit ile aktif branch'e push et.

İlk görev: devir rehberindeki “Önerilen profesyonel devam sırası” bölümünü değerlendir ve mevcut kodu inceleyerek güvenli şekilde bir sonraki profesyonel geliştirmeye başla.
```

## 12. Devir kontrol listesi

- [ ] Rehber tamamen okundu
- [ ] `git status --short` kontrol edildi
- [ ] Aktif branch doğrulandı
- [ ] Son commit `4e54e01` veya daha yenisi
- [ ] 3600 frontend çalışıyor
- [ ] 3601 API çalışıyor
- [ ] `/api/health` SQLite bağlı gösteriyor
- [ ] Hassas bilgiler paylaşılmadı
- [ ] Yeni geliştirme öncesi mevcut kod incelendi

