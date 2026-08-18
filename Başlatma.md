# Hatay360 Yerel Başlatma

## Gereksinimler

- Node.js `22.13` veya üzeri
- Windows PowerShell

## İlk kurulum

PowerShell'i açıp aşağıdaki komutları çalıştırın:

```powershell
cd "C:\Users\User\Desktop\Hatay360 yeni"
npm.cmd ci
Copy-Item .env.example .env
notepad .env
```

`.env` dosyasında admin kullanıcı adı ve şifresini düzenleyin:

```env
HATAY360_ADMIN_USER=admin
HATAY360_ADMIN_PASSWORD=guclu-bir-sifre
PORT=3601
NODE_ENV=development
```

Gerçek kullanım öncesinde uzun ve benzersiz bir admin şifresi belirleyin.

Ardından projeyi derleyip başlatın:

```powershell
npm.cmd run build
npm.cmd start
```

Site adresi:

```text
http://127.0.0.1:3601
```

## Sonraki açılışlar

Proje daha önce kurulmuş ve derlenmişse:

```powershell
cd "C:\Users\User\Desktop\Hatay360 yeni"
npm.cmd start
```

## Kod değişikliğinden sonra

Kodlarda değişiklik yapıldıysa tekrar derleyip sunucuyu başlatın:

```powershell
cd "C:\Users\User\Desktop\Hatay360 yeni"
npm.cmd run build
npm.cmd start
```

`npm start` komutu projeyi otomatik olarak derlemez. Güncel arayüzün çalışması için değişikliklerden sonra `npm.cmd run build` çalıştırılmalıdır.

## Geliştirme modu

Kod değişikliklerini anlık görmek için iki ayrı PowerShell penceresi açın.

### Birinci pencere: API ve SQLite sunucusu

```powershell
cd "C:\Users\User\Desktop\Hatay360 yeni"
npm.cmd run dev:server
```

### İkinci pencere: Vite arayüzü

```powershell
cd "C:\Users\User\Desktop\Hatay360 yeni"
npm.cmd run dev
```

Geliştirme adresi:

```text
http://127.0.0.1:3600
```

Portlar:

- `3600`: Vite geliştirme arayüzü
- `3601`: API ve SQLite sunucusu

## Yönetim ve müşteri paneli

Normal site:

```text
http://127.0.0.1:3601
```

Admin girişi:

```text
http://127.0.0.1:3601/panel/giris
```

Müşteri girişi:

```text
http://127.0.0.1:3601/musteri/giris
```

Geliştirme modunda aynı adreslerin portu `3600` olur.

## Kontrol komutları

Teslim veya yayın öncesinde:

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

Tüm kontrolleri tek komutla çalıştırmak için:

```powershell
npm.cmd run check
```

## Sunucuyu durdurma

Sunucunun çalıştığı PowerShell penceresinde:

```text
Ctrl + C
```
