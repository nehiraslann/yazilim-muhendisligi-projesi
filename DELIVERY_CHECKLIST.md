# StyleAI Teslim Kontrol Listesi

Bu listeyi final zip'i hazirlamadan, Git'e yuklemeden veya sozlu savunmaya girmeden once kullanin.

## 1. Dokumantasyon hazirligi
- [ ] `README.md` mevcut kod tabani ile uyumlu ve kurulumu acik bicimde anlatiyor.
- [ ] `PROJECT_REPORT.md` gerekli final rapor yapisini izliyor:
      Giris, Gereksinim Ozeti, Tasarim Aciklamasi, Uygulama Genel Bakisi, Test Sonuclari, Sinirlamalar, Gelecekteki Iyilestirmeler.
- [ ] `TEST_CASES.md` mevcut proje davranisi ile uyumlu.
- [ ] `DEMO_FLOW.md` gercek canli demo ve sozlu savunma sirasi ile uyumlu.
- [ ] Hicbir belge, mevcut kodda olmayan bir ozelligi varmis gibi anlatmiyor.

## 2. Ortam ve baslatma
- [ ] `backend/.env.example` dosyasini `backend/.env` olarak kopyaladin.
- [ ] Gercek PostgreSQL bilgilerini ve varsayilan olmayan bir `JWT_SECRET` degerini girdin.
- [ ] Backend'in `http://localhost:3000` adresinde calistigini dogruladin.
- [ ] Frontend'in `http://localhost:5173` adresinde calistigini dogruladin.
- [ ] Temiz bir `styleai_db` veritabaninda tablolarin ve seed verisinin olustugunu dogruladin.
- [ ] Varsayilan admin hesabinin calistigini kontrol ettin veya teslimden once kendi admin hesabini ayarladin.

## 3. Teknik dogrulama
- [ ] Kok dizinde `npm run check:backend` komutunu calistirdin.
- [ ] Kok dizinde `npm run lint:frontend` komutunu calistirdin.
- [ ] Kok dizinde `npm run build:frontend` komutunu calistirdin.
- [ ] Birlesik son kontrol icin kok dizinde `npm run verify` komutunu calistirdin.
- [ ] Syntax veya lint hatasi kalmadigini dogruladin.

## 4. Fonksiyonel dogrulama
- [ ] Bir `Customer` ve bir `Seller` test hesabi olusturdun.
- [ ] Musteri tarafinda Discover, AI Stylist, Outfit Builder, Saved Outfits ve Profile sayfalarina erisimi kontrol ettin.
- [ ] Saticinin yalnizca seller rotalarina ve seller dashboard'a erisebildigini kontrol ettin.
- [ ] Adminin yalnizca admin rotalarina ve admin dashboard'a erisebildigini kontrol ettin.
- [ ] Satici urun olusturma akisini zorunlu alanlarla test ettin:
      ad, fiyat, kategori, renk, marka, sezon, stil etiketi ve gorsel URL.
- [ ] Satici urun duzenleme ve silme akislarini test ettin.
- [ ] Manuel kombin kaydetme ve silme akislarini test ettin.
- [ ] AI oneri uretme ve kaydetme akislarini test ettin.
- [ ] Admin kullanici pasife alma veya aktif etme akisini test ettin.
- [ ] Admin urun yayina alma veya yayindan kaldirma akisini test ettin.

## 5. Sozlu savunma hazirligi
- [ ] Projenin 3 rol, kimlik dogrulama ve veritabani gereksinimlerini nasil karsiladigini aciklamaya hazirsin.
- [ ] En az 8 islevsel gereksinim ve en az 3 islevsel olmayan gereksinimi sayabiliyorsun.
- [ ] Katmanli mimariyi ve klasor yapisini aciklayabiliyorsun.
- [ ] `bcrypt`, JWT ve rol middleware'i gibi guvenlik kararlarini gerekcelendirebiliyorsun.
- [ ] Oneri mantigini kodu satir satir okumadan anlatabiliyorsun.
- [ ] Sinirlamalari ve gercekci gelecek iyilestirmelerini tartisabiliyorsun.

## 6. Teslim duzeni
- [ ] `node_modules`, yerel `.env` dosyalari, veritabani dump'lari ve makineye ozel artiklar teslim paketine dahil degil.
- [ ] Calisan bagimlilik yapisinin parcasiysa `package-lock.json` dosyalari korundu.
- [ ] Kok dizindeki dosyalar bilincli secildi ve guncel durumda.
