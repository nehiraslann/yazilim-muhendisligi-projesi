-- Temel roller
INSERT INTO roles (name)
VALUES ('Admin'), ('Seller'), ('Customer')
ON CONFLICT (name) DO NOTHING;

-- Guvenlik nedeniyle burada sabit admin hesabi seedlenmiyor.
-- Ilk admin hesabi uygulama acilisinda ensureAdmin.js tarafindan
-- backend/.env icindeki ADMIN_USERNAME, ADMIN_EMAIL ve ADMIN_PASSWORD
-- degiskenleri kullanilarak olusturulur.

-- Kategori referanslari
INSERT INTO categories (name)
VALUES ('tops'), ('bottoms'), ('dresses'), ('outerwear'), ('shoes'), ('accessories')
ON CONFLICT (name) DO NOTHING;

-- Renk referanslari
INSERT INTO colors (name)
VALUES ('Siyah'), ('Beyaz'), ('Bej'), ('Gri'), ('Kirmizi'), ('Mavi'), ('Sari'), ('Yesil'), ('Kahverengi'), ('Pembe')
ON CONFLICT (name) DO NOTHING;

-- Sezon referanslari
INSERT INTO seasons (name)
VALUES ('summerCool'), ('autumnWarm'), ('winterCool'), ('springWarm')
ON CONFLICT (name) DO NOTHING;
