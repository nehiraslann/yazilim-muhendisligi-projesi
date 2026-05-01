/**
 * migrate_product_names.js
 *
 * One-time migration script:
 *   1. Adds name_tr and name_en columns to products table (IF NOT EXISTS)
 *   2. Copies current Turkish `name` → name_tr for all rows
 *   3. Generates name_en via the server-side translation utility
 *   4. Updates all products in batch
 *
 * Run once:
 *   node --experimental-vm-modules backend/src/data/migrate_product_names.js
 * Or via package.json script:
 *   npm run migrate:names
 */

import dbPool from '../config/db.js';
import { translateToEn } from '../utils/nameTranslator.js';

const run = async () => {
  const client = await dbPool.connect();
  try {
    console.log('\n=== Product Name Migration ===\n');

    // ── Step 1: Add columns ──────────────────────────────────────────────────
    console.log('Step 1: Adding name_tr and name_en columns...');
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS name_tr TEXT`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en TEXT`);
    console.log('  ✓ Columns ready.\n');

    // ── Step 2: Load all products ─────────────────────────────────────────────
    console.log('Step 2: Loading products from DB...');
    const { rows: products } = await client.query(
      `SELECT id, name, name_tr, name_en FROM products ORDER BY id`
    );
    console.log(`  Found ${products.length} product(s).\n`);

    if (products.length === 0) {
      console.log('Nothing to migrate. Exiting.');
      return;
    }

    // ── Step 3: Generate and update ──────────────────────────────────────────
    console.log('Step 3: Translating and updating...\n');

    let updated = 0;
    let skipped = 0;

    await client.query('BEGIN');

    for (const product of products) {
      const nameTr  = product.name_tr || product.name; // never overwrite if already set
      const nameEn  = product.name_en || translateToEn(product.name); // never overwrite if already set

      await client.query(
        `UPDATE products SET name_tr = $1, name_en = $2 WHERE id = $3`,
        [nameTr, nameEn, product.id]
      );

      const trChg = !product.name_tr ? '(new)' : '(kept)';
      const enChg = !product.name_en ? '(new)' : '(kept)';
      console.log(`  [${product.id}] ${product.name}`);
      console.log(`       name_tr : ${nameTr} ${trChg}`);
      console.log(`       name_en : ${nameEn} ${enChg}`);
      console.log('');

      if (!product.name_tr || !product.name_en) updated++;
      else skipped++;
    }

    await client.query('COMMIT');

    console.log(`\n=== Migration Complete ===`);
    console.log(`  Updated : ${updated} row(s)`);
    console.log(`  Skipped : ${skipped} row(s) (already had translations)`);
    console.log('  All done!\n');

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n[ERROR] Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await dbPool.end();
  }
};

run();
