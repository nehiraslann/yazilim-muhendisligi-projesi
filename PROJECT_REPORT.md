# Final Proje Raporu - StyleAI

## 1. Giris
StyleAI, moda pazaryeri ve kombin planlama platformu olarak tasarlanmis bireysel bir tam yigin yazilim muhendisligi projesidir. Sistem; urun kesfi, rol bazli yonetim ve hafif bir oneri mekanizmasini tek bir web uygulamasi icinde birlestirir.

Projenin temel amaci, yalnizca kod calistiran kucuk bir uygulama gelistirmek degil; anlamli bir sistem uzerinde yazilim muhendisligi yasam dongusunun tamamina yaklasmaktir. Bu nedenle proje sadece uygulamaya degil, gereksinimlerin tanimlanmasi, moduler mimari, guvenlik, bakim kolayligi, test hazirligi ve profesyonel dokumantasyona da odaklanir.

Sistem uc farkli kullanici rolune sahiptir:

- `Customer`: urunleri kesfeder, kombin olusturur, onerileri kaydeder ve profil bilgilerini yonetir
- `Seller`: katalog urunlerini olusturur ve yonetir
- `Admin`: kullanicilari ve urun gorunurlugunu denetler

## 2. Gereksinim Ozeti
### Islevsel gereksinimler
- `FR-01`: Sistem, `Customer` ve `Seller` hesaplari icin herkese acik kayit islemini desteklemelidir.
- `FR-02`: Sistem, kullanicilari dogrulamali ve JWT tabanli oturum vermelidir.
- `FR-03`: Sistem, sayfa ve API islemlerini kullanici rolune gore kisitlamalidir.
- `FR-04`: Sistem, musterilerin aktif urunleri arama, filtreleme ve siralama ile goruntulemesini saglamalidir.
- `FR-05`: Sistem, saticilarin kendi urunlerini eklemesine, duzenlemesine ve silmesine izin vermelidir.
- `FR-06`: Sistem, musterilerin manuel kombin olusturup veritabanina kaydetmesini saglamalidir.
- `FR-07`: Sistem, sezon ve stil tercihlerine gore kombin onerileri uretmelidir.
- `FR-08`: Sistem, musterilerin AI tabanli kombinleri kaydetmesine izin vermelidir.
- `FR-09`: Sistem, adminlerin kullanicilari aktif veya pasif hale getirmesini saglamalidir.
- `FR-10`: Sistem, adminlerin urunleri yayina alip yayindan kaldirmasini saglamalidir.
- `FR-11`: Sistem, giris yapmis kullanicilarin kendi profil bilgilerini gorup guncellemesini saglamalidir.

### Islevsel olmayan gereksinimler
- `NFR-01 Guvenlik`: Parolalar hashlenmeli ve korumali rotalar gecerli JWT istemelidir.
- `NFR-02 Bakim kolayligi`: Is mantigi moduler backend ve frontend katmanlarina ayrilmalidir.
- `NFR-03 Kullanilabilirlik`: Her rol yalnizca kendi gorevleriyle ilgili ekranlari ve eylemleri gormelidir.
- `NFR-04 Kalicilik ve butunluk`: Temel veriler iliskisel kisitlarla birlikte PostgreSQL uzerinde tutulmalidir.
- `NFR-05 Uluslararasilastirma`: Arayuz hem Turkce hem Ingilizce calismalidir.
- `NFR-06 Verimlilik`: Oneri uretimi gereksiz dis AI bagimliliklarindan kacinarak hafif kalmalidir.
- `NFR-07 Surdurulebilirlik`: Cozum, surekli calisan maliyetli dis hizmetler yerine hafif yerel islem akislarini tercih etmelidir.

### Guvenlik, bakim kolayligi ve etik farkindalik
- Guvenlik; parola hashleme, JWT dogrulamasi ve sunucu tarafli rol middleware yapisi ile ele alinmistir.
- Bakim kolayligi; `routes`, `controllers`, `middlewares`, `config` ve `utils` klasor ayrimi ile desteklenmistir.
- Surdurulebilirlik; gereksiz ucuncu taraf AI hesaplamalarina ihtiyac duymayan kural tabanli oneri akisi ile desteklenmistir.
- Etik farkindalik; kisisel veriyi sinirli kullanma, onerileri aciklanabilir tutma ve sistemi insan seviyesi zekaymis gibi sunmama yaklasimi ile ele alinmistir.

## 3. Tasarim Aciklamasi
### Mimari stil
Proje katmanli bir istemci-sunucu mimarisi kullanir:

- Sunum katmani: React sayfalari, rota korumalari, formlar ve yeniden kullanilabilir UI bilesenleri
- Uygulama katmani: Express controller ve middleware yapisi ile is kurallari
- Veri katmani: kullanicilar, roller, urunler, kombinler, kategoriler ve renkler icin PostgreSQL tablolari

Bu ayrim, frontend ve backend sorumluluklarinin birbirinden bagimsiz gelismesini, okunabilirligi ve bakim kolayligini arttirir.

### Sistem modeli
Sistemdeki en onemli aktorler sunlardir:

- Customer
- Seller
- Admin

Temel varliklar sunlardir:

- `roles`
- `users`
- `categories`
- `colors`
- `seasons`
- `products`
- `product_seasons`
- `outfits`
- `outfit_products`

Iliskiler, lisans duzeyi iliskisel bir sistem icin sade ve uygundur:

- bir rol, birden fazla kullaniciya ait olabilir
- bir satici, birden fazla urune sahip olabilir
- bir kullanici, birden fazla kombine sahip olabilir
- bir kombin, ara tablo uzerinden birden fazla urun icerebilir

### Kullanim senaryosu gorunumu
Sistemin ana etkilesimleri su sekilde ozetlenebilir:

- Customer kayit olur, giris yapar, urunleri gezer, kombin onerisi uretir, kombin kaydeder ve profilini gunceller.
- Seller giris yapar, sahip oldugu urun kayitlarini yonetir ve katalog verisinin tutarliligini korur.
- Admin giris yapar, platform etkinligini inceler, kullanici durumunu denetler ve urun gorunurlugunu kontrol eder.

### Veri modeli ozeti
```text
roles (1) ---- (many) users
users (1) ---- (many) products
users (1) ---- (many) outfits
categories (1) ---- (many) products
colors (1) ---- (many) products
products (many) ---- (many) outfits through outfit_products
seasons (many) ---- (many) products through product_seasons
```

### Temel tasarim kararlari
- Express controller yapisi, is mantigini rota tanimlarindan ayirmak icin tercih edilmistir.
- PostgreSQL schema bootstrap akisi, projenin temiz bir veritabaninda manuel tablo olusturma gerektirmeden baslayabilmesi icin secilmistir.
- Rota korumasi hem frontend hem backend tarafinda uygulanmistir; cunku yalnizca frontend kontrolu yeterli degildir.
- Oneri motoru, ucretli harici modellere bagimli olmak yerine kural tabanli tasarlanmistir. Bu karar sistemi daha aciklanabilir, tekrarlanabilir ve akademik olarak savunulabilir hale getirir.

### Bakim kolayligi ve olceklenebilirlik dusuncesi
- Ortak yardimci fonksiyonlar ceviri, bicimlendirme, loglama ve rol davranislarini tek yerde toplar.
- Sezon ve stil etiketleri gibi statik veriler paylasilan sabitler etrafinda duzenlenmistir.
- Backend, genel mimariyi bozmadan yeni controller veya rota eklenerek buyutulebilir.
- Ileride tipli dogrulama veya otomatik testlere gecis icin tam yeniden yazim gerekmez.

## 4. Uygulama Genel Bakisi
### Frontend
Frontend React ve React Router ile gelistirilmistir. Farkli roller icin ayri sayfa akislarina sahiptir:

- Customer sayfalari: Discover, AI Stylist, Outfit Builder, Saved Outfits, Profile
- Seller sayfasi: Seller Dashboard
- Admin sayfasi: Admin Dashboard

Durum yonetimi ve ortak kimlik dogrulama davranisi context ve yardimci fonksiyonlarla saglanir. Dil degistirme `i18next` ile uygulanmistir; boylece ayni ekranlar Turkce ve Ingilizce olarak calisabilir.

### Backend
Backend Express ile gelistirilmis ve asagidaki yapilar etrafinda organize edilmistir:

- `authController`: kayit, giris, profil okuma ve guncelleme
- `productController`: urun listeleme, secenek verileri ve urun CRUD islemleri
- `outfitController`: manuel ve kaydedilmis kombin islemleri
- `recommendationController`: kural tabanli kombin onerisi uretimi
- `adminController`: kullanici ve urun moderasyonu

Guvenlik ile ilgili mantik ayri middleware yapilarina tasinmistir:

- `authMiddleware`: JWT erisimini dogrular
- `roleMiddleware`: role ozel aksiyonlari kisitlar
- `errorMiddleware`: API hata cevaplarini standartlastirir

### Veritabani baslatma akisi
Backend acilisinda:

1. `schema.sql` yuklenir
2. beklenen kolonlar ve kisitlar mevcut veritabaniyla eslestirilir
3. veritabani bossa `seed.sql` calistirilir
4. en az bir admin hesabi olmasi garanti edilir

Bu yapi, projeyi yeni bir ortamda kurmayi ve degerlendirmeyi kolaylastirir.

### Oneri mantigi
Oneri ozelligi uzak bir generatif modele cagrida bulunmaz. Bunun yerine:

- sezon ve stil girdilerini normalize eder
- urunleri ust, alt, elbise, ayakkabi ve aksesuar gibi kombin rollerine ayirir
- sezon uyumu, stil uyumu ve renk uyumuna gore puanlar
- en uygun kombinasyonlari olusturur
- tam eslesme olmadiginda fallback oneriler uretir

Bu tasarim, sozlu savunmada ciktinin nedenlerini aciklamayi kolaylastirir ve bagimlilik riskini azaltir.

## 5. Test Sonuclari
### Test stratejisi
Proje su yaklasimlarin birlesimini kullanir:

- statik dogrulama
- senaryo bazli manuel fonksiyonel testler
- rol ve yetki davranislarinin kod incelemesi

### Calistirilmis dogrulamalar
Dokumantasyonun son guncellemesi sirasinda su kontroller tamamlanmistir:

- `frontend` icinde `npm run lint` komutu basariyla calistirilmistir
- backend kaynak dosyalari uzerinde JavaScript syntax taramasi basariyla tamamlanmistir
- `frontend` icinde `npm run build` komutu basariyla calistirilmistir
- kok dizinde `npm run verify` komutu basariyla tamamlanmistir
- `initializeDatabase` akisi yerel PostgreSQL uzerinde basariyla calistirilmis; schema eslestirme, seed atlama mantigi ve admin hesabi hazirligi dogrulanmistir

### Manuel dogrulama kapsami
Detayli senaryo kapsami `TEST_CASES.md` icinde tutulur. Bu kapsama sunlar dahildir:

- kimlik dogrulama
- rol korumalari
- satici urun CRUD islemleri
- musteri kesif filtreleri
- manuel kombin kaydetme
- AI onerisi uretme ve kaydetme
- admin moderasyonu

Bu senaryolar, final teslim ve sozlu savunma oncesinde PostgreSQL baglantili yerel ortamda yeniden calistirilmaya hazirdir.

## 6. Sinirlamalar
- Urun gorselleri su anda ozel bir upload altyapisi yerine URL veya statik backend klasorlerine dayanir.
- Oneri motoru kural tabanlidir; bu nedenle ciktinin kalitesi urun metadata tutarliligina ciddi bicimde baglidir.
- Otomatik API ve UI test paketleri henuz eklenmemistir; uctan uca dogrulamanin buyuk kismi halen manueldir.
- Tam entegre dogrulama, yerel PostgreSQL ayarlarinin ve ornek verinin dogru olmasina baglidir.

## 7. Gelecekteki Iyilestirmeler
- Gorsel yukleme ve yonetilen dosya depolama altyapisi eklemek
- Otomatik backend ve frontend testleri eklemek
- Schema tabanli request dogrulamasi ve daha guclu tipli sozlesmeler kullanmak
- Refresh token, sifre sifirlama ve audit log yapisi eklemek
- Daha zengin moda metadata'si ve kullanici tercih gecmisi ile oneri kalitesini arttirmak
