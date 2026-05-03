# StyleAI Test Senaryolari ve Dogrulama Kaydi

Bu dosya bilincli olarak ihtiyatli tutulmustur:

- yalnizca dokumantasyonun son guncellemesi sirasinda gercekten calistirilan kontroller `Gecti` olarak isaretlenmistir
- manuel uctan uca senaryolar, final PostgreSQL ortaminda yeniden calistirilana kadar `Yerel dogrulama bekliyor` durumunda tutulmustur

Varsayilan yerel adresler:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## 1. Calistirilmis statik dogrulamalar
| Test ID | Kontrol | Komut | Sonuc |
|---|---|---|---|
| CHK-01 | Frontend lint | `npm run lint` komutu `frontend` icinde | Gecti |
| CHK-02 | Backend JavaScript syntax taramasi | depo duzeyinde backend syntax kontrolu | Gecti |
| CHK-03 | Frontend production build | `npm run build` komutu `frontend` icinde | Gecti |
| CHK-04 | Birlesik depo dogrulamasi | kok dizinde `npm run verify` | Gecti |
| CHK-05 | Veritabani bootstrap | yerel PostgreSQL uzerinde `initializeDatabase` | Gecti |

## 2. Kimlik dogrulama
| Test ID | Senaryo | Beklenen Sonuc | Durum |
|---|---|---|---|
| AUTH-01 | Kullanici adi, e-posta, sifre ve rol ile kayit olmak | Kullanici olusturulur ve giris ekranina yonlendirilir | Yerel dogrulama bekliyor |
| AUTH-02 | Var olan bir e-posta ile yeniden kayit olmak | API `400` dondurur ve arayuz hata mesaji gosterir | Yerel dogrulama bekliyor |
| AUTH-03 | Gecerli bilgilerle giris yapmak | JWT saklanir ve kullanici rolunun varsayilan sayfasina yonlendirilir | Yerel dogrulama bekliyor |
| AUTH-04 | Yanlis sifre ile giris yapmak | API `401` dondurur ve arayuz hata gosterir | Yerel dogrulama bekliyor |
| AUTH-05 | Gecerli token olmadan korumali endpoint cagirmak | API `401` dondurur | Yerel dogrulama bekliyor |

## 3. Rol korumalari ve yetkilendirme
| Test ID | Senaryo | Beklenen Sonuc | Durum |
|---|---|---|---|
| ROLE-01 | Customer kullanicisi `/admin` sayfasini acmak ister | Frontend kullaniciyi `/` sayfasina yonlendirir | Yerel dogrulama bekliyor |
| ROLE-02 | Customer kullanicisi `/seller` sayfasini acmak ister | Frontend kullaniciyi `/` sayfasina yonlendirir | Yerel dogrulama bekliyor |
| ROLE-03 | Seller kullanicisi `/ai-stylist` sayfasini acmak ister | Frontend kullaniciyi `/seller` sayfasina yonlendirir | Yerel dogrulama bekliyor |
| ROLE-04 | Admin kullanicisi `/outfit-builder` sayfasini acmak ister | Frontend kullaniciyi `/admin` sayfasina yonlendirir | Yerel dogrulama bekliyor |
| ROLE-05 | Customer kullanicisi `POST /api/products` gonderir | Backend `403` dondurur | Yerel dogrulama bekliyor |
| ROLE-06 | Seller baska bir saticinin urununu guncellemeye veya silmeye calisir | Backend `403` dondurur | Yerel dogrulama bekliyor |

## 4. Satici urun yonetimi
| Test ID | Senaryo | Beklenen Sonuc | Durum |
|---|---|---|---|
| PROD-01 | Seller, ad, fiyat, kategori, renk, marka, sezon, stil etiketi ve gorsel URL ile urun olusturur | Urun kaydedilir ve satici listesinde gorunur | Yerel dogrulama bekliyor |
| PROD-02 | Seller gerekli alanlardan biri olmadan urun gonderir | Dogrulama istegi engeller | Yerel dogrulama bekliyor |
| PROD-03 | Seller kendisine ait bir urunu gunceller | Degisiklikler kaydolur ve liste yenilenir | Yerel dogrulama bekliyor |
| PROD-04 | Seller kendisine ait bir urunu siler | Urun satici listesinden kaybolur | Yerel dogrulama bekliyor |
| PROD-05 | Urun moderasyonu sonrasi musteri listesi kontrol edilir | Yalnizca aktif urunler gorunur | Yerel dogrulama bekliyor |

## 5. Musteri kesif akisi
| Test ID | Senaryo | Beklenen Sonuc | Durum |
|---|---|---|---|
| DISC-01 | Urunleri sezona gore filtrelemek | Yalnizca eslesen urunler gorunur | Yerel dogrulama bekliyor |
| DISC-02 | Urunleri kategoriye gore filtrelemek | Yalnizca secilen kategoriye ait urunler gorunur | Yerel dogrulama bekliyor |
| DISC-03 | Urunleri stile gore filtrelemek | Yalnizca secilen stile ait urunler gorunur | Yerel dogrulama bekliyor |
| DISC-04 | Urun veya marka metniyle arama yapmak | Grid sonucu eslesen urunlere gore guncellenir | Yerel dogrulama bekliyor |
| DISC-05 | Fiyata gore artan veya azalan siralama yapmak | Grid sirasi dogru sekilde degisir | Yerel dogrulama bekliyor |

## 6. Manuel kombin olusturma
| Test ID | Senaryo | Beklenen Sonuc | Durum |
|---|---|---|---|
| OUTF-01 | Ikiden az farkli urunle kombin kaydetmeye calismak | Dogrulama kaydi engeller | Yerel dogrulama bekliyor |
| OUTF-02 | Gecerli bir manuel kombin kaydetmek | Kombin `manual` kaynak tipiyle kaydolur | Yerel dogrulama bekliyor |
| OUTF-03 | Kaydedilen manuel kombini silmek | Kombin listeden ve veritabanindan silinir | Yerel dogrulama bekliyor |

## 7. AI oneri akisi
| Test ID | Senaryo | Beklenen Sonuc | Durum |
|---|---|---|---|
| AIRE-01 | Gecerli sezon ve stil ile oneri uretmek | Oneri listesi dondurulur | Yerel dogrulama bekliyor |
| AIRE-02 | Tam eslesme yokken oneri uretmek | Gerektiginde fallback bilgilendirmesi gosterilir | Yerel dogrulama bekliyor |
| AIRE-03 | AI onerisini kaydetmek | Kombin `ai` kaynak tipi ve neden metni ile saklanir | Yerel dogrulama bekliyor |

## 8. Kaydedilen kombinler ve profil
| Test ID | Senaryo | Beklenen Sonuc | Durum |
|---|---|---|---|
| SAVE-01 | Saved Outfits sayfasini acmak | Manuel ve AI kombinler dogru sekilde listelenir | Yerel dogrulama bekliyor |
| SAVE-02 | Kaydedilen bir kombini silmek | Kombin listeden kaldirilir | Yerel dogrulama bekliyor |
| PROF-01 | Profil adi veya avatar URL guncellemek | Profil verisi basariyla guncellenir | Yerel dogrulama bekliyor |
| PROF-02 | Dogru mevcut sifre ile sifre degistirmek | Sifre guncellemesi basarili olur | Yerel dogrulama bekliyor |

## 9. Admin moderasyonu
| Test ID | Senaryo | Beklenen Sonuc | Durum |
|---|---|---|---|
| ADMN-01 | Admin bir kullanicinin aktiflik durumunu degistirir | Kullanici durumu basariyla degisir | Yerel dogrulama bekliyor |
| ADMN-02 | Admin bir urunu yayindan kaldirir | Urun musteri akislarinda artik gorunmez | Yerel dogrulama bekliyor |
| ADMN-03 | Admin gizli bir urunu tekrar yayina alir | Urun yeniden gorunur hale gelir | Yerel dogrulama bekliyor |
| ADMN-04 | Admin giris yapmis oldugu kendi hesabini pasife almaya calisir | Sistem kendini pasife alma islemini engeller | Yerel dogrulama bekliyor |
