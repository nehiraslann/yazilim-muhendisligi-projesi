import dbPool from '../config/db.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import { generateItemDisplayName } from '../utils/productHelpers.js';
import { localisedName } from '../utils/nameTranslator.js';

const sanitizeProductIds = (productIds) => {
  if (!Array.isArray(productIds)) {
    return [];
  }

  return [...new Set(
    productIds
      .map(id => Number(id))
      .filter(id => Number.isInteger(id) && id > 0)
  )];
};

const localiseOutfitRow = (row, safeLang) => {
  const localizedName = safeLang === 'en'
    ? (row.name_en || row.name_tr || row.name)
    : (row.name_tr || row.name);

  return {
    ...row,
    name: localizedName,
    products: Array.isArray(row.products)
      ? row.products.map(product => ({
        ...product,
        name: localisedName(product, safeLang),
        display_name: generateItemDisplayName(product),
      }))
      : [],
  };
};

export const createOutfit = async (req, res, next) => {
  const { name, productIds, source_type, reason_text } = req.body;
  const userId = req.user.id;

  try {
    const normalizedProductIds = sanitizeProductIds(productIds);
    if (normalizedProductIds.length < 2) {
      return next(new AppError('Kombin olusturmak icin en az 2 farkli urun secmelisiniz.', 400));
    }

    const client = await dbPool.connect();

    try {
      await client.query('BEGIN');

      const validSource = source_type === 'ai' ? 'ai' : 'manual';
      const nameTr = req.body.name_tr || name || 'Isimsiz Kombin';
      const nameEn = req.body.name_en || name || 'My Outfit';

      const result = await client.query(
        `INSERT INTO outfits (name, name_tr, name_en, user_id, source_type, reason_text)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [name || 'Isimsiz Kombin', nameTr, nameEn, userId, validSource, reason_text || null]
      );

      const outfitId = result.rows[0].id;
      const values = normalizedProductIds.map((_, index) => `($1, $${index + 2})`).join(', ');

      await client.query(
        `INSERT INTO outfit_products (outfit_id, product_id) VALUES ${values}`,
        [outfitId, ...normalizedProductIds]
      );

      await client.query('COMMIT');
      res.status(201).json({ message: 'Kombin basariyla kaydedildi.', outfitId });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

export const getUserOutfits = async (req, res, next) => {
  const userId = req.user.id;
  const safeLang = req.query.lang === 'en' ? 'en' : 'tr';

  try {
    const query = `
      SELECT
        o.id,
        o.name,
        o.name_tr,
        o.name_en,
        o.source_type,
        o.reason_text,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', p.id,
              'name', p.name,
              'name_tr', p.name_tr,
              'name_en', p.name_en,
              'image_url', p.image_url,
              'category_name', c.name,
              'color_name', col.name,
              'price', p.price,
              'brand', p.brand
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) AS products
      FROM outfits o
      LEFT JOIN outfit_products op ON o.id = op.outfit_id
      LEFT JOIN products p ON op.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN colors col ON p.color_id = col.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const { rows } = await dbPool.query(query, [userId]);
    res.status(200).json(rows.map(row => localiseOutfitRow(row, safeLang)));
  } catch (error) {
    next(error);
  }
};

export const deleteOutfit = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const checkOutfit = await dbPool.query('SELECT user_id FROM outfits WHERE id = $1', [id]);
    if (checkOutfit.rows.length === 0) {
      return next(new AppError('Kombin bulunamadi.', 404));
    }

    if (checkOutfit.rows[0].user_id !== userId) {
      return next(new AppError('Bu kombini silme yetkiniz yok.', 403));
    }

    await dbPool.query('DELETE FROM outfits WHERE id = $1', [id]);
    res.status(200).json({ message: 'Kombin basariyla silindi.' });
  } catch (error) {
    next(error);
  }
};
