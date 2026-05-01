import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dbPool from './db.js';
import { ensureAdmin } from './ensureAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reconcileSchema = async () => {
    const reconciliationQueries = [
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(150)`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)`,
        `ALTER TABLE colors ADD COLUMN IF NOT EXISTS hex_code VARCHAR(10)`,
        `ALTER TABLE colors ADD COLUMN IF NOT EXISTS season_group VARCHAR(50)`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100)`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS season_group VARCHAR(50)`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS style_tag VARCHAR(50)`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS name_tr TEXT`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en TEXT`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS description_tr TEXT`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT`,
        `ALTER TABLE outfits ADD COLUMN IF NOT EXISTS name_tr TEXT`,
        `ALTER TABLE outfits ADD COLUMN IF NOT EXISTS name_en TEXT`,
        `ALTER TABLE outfits ADD COLUMN IF NOT EXISTS reason_text TEXT`
    ];

    for (const query of reconciliationQueries) {
        await dbPool.query(query);
    }

    await dbPool.query(`UPDATE outfits SET source_type = 'manual' WHERE source_type = 'manuel'`);
    await dbPool.query(`ALTER TABLE outfits DROP CONSTRAINT IF EXISTS outfits_source_type_check`);
    await dbPool.query(`ALTER TABLE outfits ADD CONSTRAINT outfits_source_type_check CHECK (source_type IN ('manual', 'ai'))`);
};

export const initializeDatabase = async () => {
    console.log('Veritabani baslangic hazirligi yapiliyor...');

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('1. schema.sql calistiriliyor...');
        await dbPool.query(schemaSql);

        console.log('1.1 Sema alanlari mevcut veritabaniyla eslestiriliyor...');
        await reconcileSchema();

        console.log('2. Veri varlik kontrolu yapiliyor...');
        const result = await dbPool.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(result.rows[0].count, 10);

        if (userCount === 0) {
            console.log('Sistemde veri bulunamadi. seed.sql calistiriliyor...');
            const seedPath = path.join(__dirname, 'seed.sql');
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            await dbPool.query(seedSql);
            console.log('Tohumlama basariyla tamamlandi.');
        } else {
            console.log(`Veritabaninda onceden veri bulundu (${userCount} kullanici). Seed atlandi.`);
        }

        await ensureAdmin();

        console.log('Veritabani hazirlik islemleri tamamlandi.');
    } catch (error) {
        console.error('Veritabani hazirligi sirasinda kritik hata olustu:', error);
        throw error;
    }
};
