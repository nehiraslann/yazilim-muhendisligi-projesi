# StyleAI / My Fashion Fullstack

## Proje Hakkında
Bu proje, yazılım mühendisliği bitirme projesi kapsamında geliştirilmiş tam yığın bir moda platformudur. Uygulama üzerinde kullanıcılar rol bazlı giriş yapabilmekte, ürünleri inceleyebilmekte, kombin oluşturabilmekte ve yapay zeka destekli kombin önerileri alabilmektedir. Arayüzde proje adı `StyleAI`, depo adı ise `My Fashion Fullstack` olarak kullanılmaktadır.

Çalışma kapsamında yalnızca işlevsel bir uygulama geliştirilmesi değil, aynı zamanda analiz, tasarım, geliştirme, test ve dokümantasyon süreçlerinin düzenli ve izlenebilir bir biçimde yürütülmesi hedeflenmiştir.

## Kullanılan Teknolojiler
- Frontend: React, Vite, React Router, Axios, i18next, Tailwind CSS, CSS
- Backend: Node.js, Express.js, PostgreSQL, pg, JWT, bcrypt, dotenv
- Geliştirme araçları: Nodemon, ESLint, npm scriptleri, PowerShell kontrol scriptleri

## Kullanıcı Rolleri
- `Customer`: Ürünleri görüntüler, filtreler, kombin oluşturur, yapay zeka önerisi alır ve oluşturduğu kombinleri kaydeder.
- `Seller`: Kendi ürünlerini ekler, günceller ve siler.
- `Admin`: Kullanıcıları ve ürün durumlarını yönetir, kategori ve renk listelerini düzenler.

## Temel Özellikler
- Kullanıcı kaydı, giriş ve JWT tabanlı kimlik doğrulama
- Rol bazlı sayfa ve endpoint koruması
- Ürün listeleme, arama, filtreleme ve sıralama
- Seller paneli üzerinden ürün ekleme, güncelleme ve silme
- Manuel kombin oluşturma ve kaydetme
- AI Stylist ekranı üzerinden kombin önerisi alma ve kaydetme
- Profil bilgilerinin güncellenmesi ve şifre değiştirme
- Admin tarafında kullanıcı ve ürün moderasyonu
- Türkçe ve İngilizce dil desteği

## Proje Kurulumu
### Backend
1. `backend/.env.example` dosyasını `backend/.env` olarak kopyalayın.
2. Dosya içindeki alanları yerel veritabanı bilgileriniz doğrultusunda doldurun.
3. PostgreSQL tarafında kullanılacak veritabanını oluşturun. Varsayılan ad `styleai_db` olarak tanımlanmıştır.
4. Aşağıdaki komutları çalıştırın:

```bash
cd backend
npm install
npm run dev
```

Backend uygulaması ilk açılışta veritabanı yapısını kontrol eder; gerekli görülmesi durumunda tabloları oluşturur ve temel verileri yükler.

### Frontend
1. `frontend` klasörüne geçin.
2. Gerekli durumlarda `frontend/.env.example` dosyasını `frontend/.env` olarak kopyalayarak API adresini güncelleyin.
3. Aşağıdaki komutları çalıştırın:

```bash
cd frontend
npm install
npm run dev
```

Varsayılan yapılandırmada frontend tarafı, backend servisi için `http://localhost:3000/api` adresini kullanır.

## Ortam Değişkenleri
Backend tarafında kullanılan değişkenler `backend/.env.example` dosyasında yer almaktadır:

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

Frontend tarafında zorunlu bir `.env` dosyası bulunmamaktadır. Farklı bir API adresi kullanılmak istenirse `VITE_API_URL` değişkeni tanımlanabilir.

## Test Edilen Senaryolar
Projede hem teknik doğrulama adımlarını hem de kullanıcı akışlarını kapsayan test senaryoları hazırlanmıştır. Özet olarak test edilen başlıklar aşağıdaki şekildedir:

- Frontend lint ve production build kontrolü
- Backend syntax ve veritabanı bootstrap kontrolü
- Kayıt ve giriş akışı
- Rol bazlı sayfa ve endpoint erişimleri
- Seller ürün yönetimi
- Müşteri tarafında ürün keşfi, filtreleme ve sıralama
- Manuel kombin oluşturma ve silme
- Yapay zeka önerisi üretme ve kaydetme
- Profil güncelleme ve şifre değiştirme
- Admin kullanıcı ve ürün moderasyonu

Detaylı liste için `TEST_CASES.md` dosyasına başvurulabilir.

## Proje Yapısı
Proje yapısı; frontend, backend ve dokümantasyon bileşenlerinin daha düzenli yönetilebilmesi amacıyla ayrı klasörlerde yapılandırılmıştır:

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

- `backend/`: Express API, veritabanı bağlantısı, route yapısı, middleware katmanı ve iş kuralları
- `frontend/`: React arayüzü, sayfalar, bileşenler, context yapısı, yardımcı fonksiyonlar ve dil dosyaları
- `scripts/`: Geliştirme sürecinde kullanılan yardımcı scriptler
- `PROJECT_REPORT.md`: Proje raporu
- `TEST_CASES.md`: Test senaryoları
- `DEMO_FLOW.md`: Demo akışı
- `DELIVERY_CHECKLIST.md`: Son kontrol listesi

## Geliştirici Notları
Bu proje, bitirme çalışması niteliği taşıdığı için anlaşılabilirlik ve sürdürülebilirlik ilkeleri gözetilerek yapılandırılmıştır. Temel mimari kararlar alınırken rol yönetimi, ürün akışları ve kombin oluşturma mantığının açık biçimde izlenebilir olmasına öncelik verilmiştir.

Yapay zeka öneri bileşeni, dışa bağımlılığı artıran karmaşık bir servis yapısı yerine daha açıklanabilir bir mantıkla ele alınmıştır. Bu yaklaşım, sistemin çalışma prensibinin proje sunumu ve akademik değerlendirme sürecinde daha net ifade edilmesine katkı sağlamaktadır.

Projenin GitHub ortamına aktarılması sırasında gerçek `.env` dosyalarının, `node_modules` klasörünün, log dosyalarının ve build çıktılarının depoya dahil edilmemesi gerekmektedir. Bu nedenle repoda yalnızca örnek ortam değişkeni dosyalarının tutulması önerilmektedir.

## Geliştirici Ekibi

Bu çalışma, yazılım mühendisliği bitirme projesi kapsamında iki kişilik bir ekip tarafından geliştirilmiştir. Proje sürecinde analiz, tasarım, geliştirme, test ve dokümantasyon aşamaları yazılım mühendisliği yaşam döngüsü dikkate alınarak yürütülmüştür.

Ekip üyelerinin temel sorumluluk dağılımı aşağıdaki şekildedir:

- Ayşegül BULUT – Kullanıcı arayüzü (frontend) geliştirme, kullanıcı deneyimi tasarımı ve test senaryolarının oluşturulması
- Nehir Aslan – Sunucu tarafı (backend) geliştirme, veritabanı tasarımı ve API mimarisinin oluşturulması

Proje sürecinde karar alma, sistem tasarımı ve uygulama geliştirme aşamaları ekip üyeleri tarafından birlikte değerlendirilmiş ve yürütülmüştür.
