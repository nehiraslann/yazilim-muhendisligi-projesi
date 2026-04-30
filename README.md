# StyleAI / My Fashion Fullstack

## Proje Hakkında
Bu proje, bireysel yazilim muhendisligi bitirme projem olarak gelistirdigim tam yigin bir moda platformudur. Uygulamada kullanicilar rol bazli giris yapabiliyor, urunleri inceleyebiliyor, kombin olusturabiliyor ve yapay zeka destekli kombin onerileri alabiliyor. Arayuzde proje adi `StyleAI`, repo adi ise `My Fashion Fullstack` olarak geciyor.

Bu projede amacim sadece calisan bir uygulama cikarmak degildi. Ayni zamanda analiz, gelistirme, test ve dokumantasyon tarafini daha duzenli gosterebilen bir bitirme projesi ortaya koymak istedim.

## Kullanılan Teknolojiler
- Frontend: React, Vite, React Router, Axios, i18next, Tailwind CSS, CSS
- Backend: Node.js, Express.js, PostgreSQL, pg, JWT, bcrypt, dotenv
- Gelistirme araclari: Nodemon, ESLint, npm scriptleri, PowerShell kontrol scriptleri

## Kullanıcı Rolleri
- `Customer`: urunleri gorur, filtreler, kombin olusturur, AI onerisi alir ve kaydeder.
- `Seller`: kendi urunlerini ekler, gunceller ve siler.
- `Admin`: kullanicilari ve urun durumlarini yonetir, kategori ve renk listelerini duzenler.

## Temel Özellikler
- Kullanici kaydi, giris ve JWT tabanli kimlik dogrulama
- Rol bazli sayfa ve endpoint korumasi
- Urun listeleme, arama, filtreleme ve siralama
- Seller panelinden urun ekleme, guncelleme ve silme
- Manuel kombin olusturma ve kaydetme
- AI Stylist ekranindan kombin onerisi alma ve kaydetme
- Profil bilgilerini guncelleme ve sifre degistirme
- Admin tarafinda kullanici ve urun moderasyonu
- Turkce ve Ingilizce dil destegi

## Proje Kurulumu
### Backend
1. `backend/.env.example` dosyasini `backend/.env` olarak kopyalayin.
2. Dosya icindeki alanlari kendi yerel veritabani bilgilerinizle doldurun.
3. PostgreSQL tarafinda kullanacaginiz veritabanini olusturun. Varsayilan isim `styleai_db` olarak geciyor.
4. Asagidaki komutlari calistirin:

```bash
cd backend
npm install
npm run dev
```

Backend ilk acilista veritabani yapisini kontrol eder, gerekirse tablolari olusturur ve temel verileri yukler.

### Frontend
1. `frontend` klasorune gecin.
2. Gerekirse `frontend/.env.example` dosyasini `frontend/.env` olarak kopyalayip API adresini degistirin.
3. Asagidaki komutlari calistirin:

```bash
cd frontend
npm install
npm run dev
```

Varsayilan durumda frontend, backend icin `http://localhost:3000/api` adresini kullanir.

## Ortam Değişkenleri
Backend tarafinda kullanilan degiskenler `backend/.env.example` icinde yer aliyor:

- `PORT`
- `DB_USER`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `NODE_ENV`
- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Frontend tarafinda zorunlu bir `.env` dosyasi yoktur. Sadece farkli bir API adresi kullanmak isterseniz `VITE_API_URL` degiskenini tanimlayabilirsiniz.

## Test Edilen Senaryolar
Projede hem teknik kontroller hem de kullanici akislarini kapsayan test senaryolari hazirlandi. Kisa ozetle test edilen basliklar su sekilde:

- Frontend lint ve production build kontrolu
- Backend syntax ve veritabani bootstrap kontrolu
- Kayit ve giris akisi
- Rol bazli sayfa ve endpoint erisimleri
- Seller urun yonetimi
- Musteri tarafinda urun kesfi, filtreleme ve siralama
- Manuel kombin olusturma ve silme
- AI onerisi uretme ve kaydetme
- Profil guncelleme ve sifre degistirme
- Admin kullanici ve urun moderasyonu

Detayli liste icin `TEST_CASES.md` dosyasina bakilabilir.

## Proje Yapısı
Proje yapisini fazla karmasik tutmamak icin frontend, backend ve dokumantasyon dosyalarini ayri klasorlerde topladim:

```text
My_Fashion_Fullstack/
  backend/
  frontend/
  scripts/
  README.md
  PROJECT_REPORT.md
  TEST_CASES.md
  DEMO_FLOW.md
  DELIVERY_CHECKLIST.md
```

- `backend/`: Express API, veritabani baglantisi, route yapisi, middleware ve is kurallari
- `frontend/`: React arayuzu, sayfalar, componentler, context yapisi, yardimci fonksiyonlar ve dil dosyalari
- `scripts/`: gelistirme sirasinda kullandigim yardimci scriptler
- `PROJECT_REPORT.md`: proje raporu
- `TEST_CASES.md`: test senaryolari
- `DEMO_FLOW.md`: demo akisi
- `DELIVERY_CHECKLIST.md`: son kontrol listesi

## Geliştirici Notları
Bu proje bitirme projesi oldugu icin yapisini bilincli olarak anlasilir tutmaya calistim. Ana mantigi gereksiz sekilde karmasiklastirmadan rol yonetimi, urun akislari ve kombin mantigini daha rahat anlatilabilir bir seviyede biraktim.

AI onerisi kismi dis bir buyuk servis yerine daha acik anlatilabilir bir mantikla ilerliyor. Bu da savunma sirasinda sistemi adim adim aciklamayi kolaylastiriyor.

Projeyi GitHub'a yuklerken gercek `.env` dosyalarinin, `node_modules`, log dosyalarinin ve build ciktisinin repoya girmemesi gerekiyor. Bu nedenle repoda sadece ornek ortam degiskeni dosyalari tutulmali.
