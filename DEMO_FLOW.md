# StyleAI Sozlu Savunma ve Demo Akisi

Bu metni sozlu savunmada kullanarak hem calisan urunu hem de arkasindaki muhendislik kararlarini duzenli bicimde sunabilirsiniz.

## 1. Acilis ozeti
1. Projeyi tek cumleyle tanitin:
   StyleAI, musteri, satici ve admin akislarina sahip rol tabanli bir moda pazaryeri ve kombin planlama sistemidir.
2. Neden ders kapsamina uydugunu soyleyin:
   uc rol, kimlik dogrulama, PostgreSQL veri kaliciligi, birden fazla islevsel gereksinim, guvenlik ve bakimi kolay moduler tasarim.
3. Ana teknik yigini belirtin:
   React, Express, PostgreSQL, JWT, bcrypt ve i18n.

## 2. Mimariyi anlatma
1. Katmanli yapiyi aciklayin:
   frontend sayfalar ve rota korumalari icin, backend is kurallari ve yetkilendirme icin, veritabani ise kalicilik icin kullanilir.
2. Klasor ayrimini aciklayin:
   `routes`, `controllers`, `middlewares`, `config`, `utils` ve sayfa bazli frontend modulleri.
3. Oneri motorunun neden kural tabanli oldugunu aciklayin:
   bakimi daha kolaydir, maliyeti dusuktur ve akademik olarak savunmasi daha rahattir.

## 3. Musteri akisi
1. Bir musteri hesabi ile giris yapin.
2. Musteri navbar'inda yalnizca musteriye ait sayfalarin gorundugunu gosterin.
3. Discover sayfasini acip sunlari gosterin:
   arama, kategori filtresi, renk filtresi, sezon filtresi, stil filtresi, marka filtresi ve siralama.
4. Bir urun kartini acip iki dilli urun icerigini gosterin.
5. AI Stylist sayfasini acin, sezon ve stil secin, oneri uretin ve gerekirse fallback mesajini aciklayin.
6. Bir adet AI uretimli kombini kaydedin.
7. Outfit Builder sayfasinda manuel kombin olusturun, kaydedin ve Saved Outfits icinde gosterin.
8. Profile sayfasinda duzenlenebilir profil alanlarini gosterin.

## 4. Satici akisi
1. Bir satici hesabi ile giris yapin.
2. Saticinin yalnizca seller dashboard'a erisebildigini gosterin.
3. Mevcut zorunlu alanlari kullanarak urun olusturun:
   ad, fiyat, kategori, renk, marka, sezon, stil etiketi ve gorsel URL.
4. Ayni urunu duzenleyin ve sonucunu satici listesinde gosterin.
5. Saticiya ait bir urunu silin ve listeden kayboldugunu dogrulayin.
6. Satici islemlerinin hem frontend rota korumalari hem backend sahiplik kontrolleri ile korundugunu belirtin.

## 5. Admin akisi
1. Admin hesabi ile giris yapin.
2. Adminin yalnizca admin sayfalarina erisebildigini gosterin.
3. Kullanici yonetimini acin ve bir kullaniciyi pasife alin veya yeniden aktif edin.
4. Urun moderasyonunu acin ve bir urunu yayindan kaldirin veya tekrar yayina alin.
5. Pasif kullanicilarin engellendigini ve pasif urunlerin musteri akisinda gorunmedigini aciklayin.

## 6. Test ve muhendislik tartismasi
1. Projede ayri bir `TEST_CASES.md` dosyasi oldugunu belirtin.
2. Dogrulama komutlarini soyleyin:
   `npm run check:backend`, `npm run lint:frontend` ve `npm run build:frontend`.
3. Temel guvenlik kararlarini aciklayin:
   parola hashleme, JWT dogrulamasi, rol middleware'i ve sunucu tarafli erisim kontrolu.
4. Bakim kolayligi kararlarini aciklayin:
   moduler klasor yapisi, yeniden kullanilabilir yardimci fonksiyonlar ve net sorumluluk ayrimi.

## 7. Kapanis
1. En onemli sinirlamayi ozetleyin:
   oneriler kural tabanlidir ve urun metadata kalitesine baglidir.
2. Gelecek calismalari belirtin:
   gorsel yukleme, otomatik testler, daha guclu dogrulama ve daha zengin oneri mantigi.
3. Sistemin yalnizca bir arayuz demosu degil, tam bir yazilim muhendisligi projesi oldugunu vurgulayarak bitirin.
