import dbPool from '../config/db.js';
import { AppError } from '../middlewares/errorMiddleware.js';
import { generateItemDisplayName } from '../utils/productHelpers.js';
import { translateToEn, localisedName, translateDescriptionAPI, localisedDescription } from '../utils/nameTranslator.js';

const STYLE_TAGS = ['casual', 'chic', 'sporty', 'classic', 'bohemian', 'minimal', 'streetwear'];
const SEASON_OPTIONS = [
  { id: 'summerCool', name: 'Summer Cool', colors: ['#E0F2F1', '#B2EBF2', '#E1BEE7'] },
  { id: 'autumnWarm', name: 'Autumn Warm', colors: ['#FFE082', '#FFCC80', '#D7CCC8'] },
  { id: 'winterCool', name: 'Winter Cool', colors: ['#000000', '#B71C1C', '#01579B'] },
  { id: 'springWarm', name: 'Spring Warm', colors: ['#F8BBD0', '#C8E6C9', '#FFF9C4'] },
];

const LOOKUP_TABLES = {
  categories: 'categories',
  colors: 'colors',
};

const SEASON_IDS = new Set(SEASON_OPTIONS.map(option => option.id));

const getTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const getOptionalTrimmedString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  return trimmed || null;
};

const isValidImage = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  if (url.startsWith('/images') || url.startsWith('/images_2')) return true;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

const formatImageUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/images') || url.startsWith('/images_2')) return url;
  return `/images_2/${url.replace(/^\/+/, '')}`;
};

const parseLookupId = (value, label) => {
  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new AppError(`Gecerli bir ${label} seciniz.`, 400);
  }

  return parsedValue;
};

const assertValidStyleTag = (styleTag) => {
  if (!STYLE_TAGS.includes(styleTag)) {
    throw new AppError('Gecerli bir stil seciniz.', 400);
  }
};

const assertValidSeasonGroup = (seasonGroup) => {
  if (!SEASON_IDS.has(seasonGroup)) {
    throw new AppError('Gecerli bir sezon seciniz.', 400);
  }
};

const assertValidImageUrl = (imageUrl) => {
  if (!isValidImage(imageUrl)) {
    throw new AppError('Gecerli bir gorsel URL veya dosya adi giriniz.', 400);
  }
};

const fetchLookupRow = async (tableName, id) => {
  const table = LOOKUP_TABLES[tableName];
  if (!table) {
    throw new Error(`Unsupported lookup table: ${tableName}`);
  }

  const { rows } = await dbPool.query(`SELECT id, name FROM ${table} WHERE id = $1`, [id]);
  return rows[0] || null;
};

const requireLookupRow = (row, label, rawValue) => {
  if (!row) {
    throw new AppError(`Secilen ${label} bulunamadi. Gonderilen deger: ${rawValue}`, 400);
  }

  return row;
};

const buildTranslatedFields = async ({ name, description }) => {
  const descriptionTr = description || null;

  return {
    nameTr: name,
    nameEn: translateToEn(name),
    descriptionTr,
    descriptionEn: descriptionTr ? await translateDescriptionAPI(descriptionTr) : null,
  };
};

const fetchProductRecord = async (id) => {
  const { rows } = await dbPool.query('SELECT * FROM products WHERE id = $1', [id]);
  return rows[0] || null;
};

const fetchProductWithRelations = async (id) => {
  const { rows } = await dbPool.query(
    `SELECT p.*, c.name AS category_name, col.name AS color_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN colors col ON p.color_id = col.id
     WHERE p.id = $1`,
    [id]
  );

  return rows[0] || null;
};

const decorateProduct = (product, safeLang = 'tr') => {
  if (!product) return null;

  return {
    ...product,
    name: localisedName(product, safeLang),
    description: localisedDescription(product, safeLang),
    display_name: generateItemDisplayName(product),
  };
};

const ensureProductAccess = (product, userId, roleName) => {
  if (!product) {
    throw new AppError('Urun bulunamadi.', 404);
  }

  if (roleName !== 'Admin' && product.seller_id !== userId) {
    throw new AppError('Yetkisiz.', 403);
  }
};

const parsePositivePrice = (price) => {
  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
    throw new AppError('Fiyat gecerli bir sayi olmali.', 400);
  }

  return parsedPrice;
};

const appendIntegerFilter = (queryParts, queryParams, value, columnName, label) => {
  const parsedValue = parseLookupId(value, label);
  queryParts.push(` AND ${columnName} = $${queryParams.length + 1}`);
  queryParams.push(parsedValue);
};

export const addProduct = async (req, res, next) => {
  const sellerId = req.user.id;

  try {
    const name = getTrimmedString(req.body.name);
    const brand = getTrimmedString(req.body.brand);
    const imageUrl = getTrimmedString(req.body.image_url);
    const seasonGroup = getTrimmedString(req.body.season_group);
    const styleTag = getTrimmedString(req.body.style_tag);
    const description = getOptionalTrimmedString(req.body.description) ?? null;
    const price = parsePositivePrice(req.body.price);

    if (!name || !brand || !imageUrl || !seasonGroup || !styleTag || !req.body.category_id || !req.body.color_id) {
      throw new AppError('Urun adi, gecerli fiyat, kategori, renk, sezon, stil, marka ve gorsel zorunludur.', 400);
    }

    assertValidStyleTag(styleTag);
    assertValidSeasonGroup(seasonGroup);
    assertValidImageUrl(imageUrl);

    const categoryId = parseLookupId(req.body.category_id, 'kategori');
    const colorId = parseLookupId(req.body.color_id, 'renk');

    const [categoryRow, colorRow, translatedFields] = await Promise.all([
      fetchLookupRow('categories', categoryId),
      fetchLookupRow('colors', colorId),
      buildTranslatedFields({ name, description }),
    ]);

    requireLookupRow(categoryRow, 'kategori', req.body.category_id);
    requireLookupRow(colorRow, 'renk', req.body.color_id);

    const insertResult = await dbPool.query(
      `INSERT INTO products (
         name, name_tr, name_en, description, description_tr, description_en,
         price, category_id, color_id, brand, image_url, season_group, style_tag,
         seller_id, is_active
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10, $11, $12, $13,
         $14, TRUE
       )
       RETURNING *`,
      [
        name,
        translatedFields.nameTr,
        translatedFields.nameEn,
        description,
        translatedFields.descriptionTr,
        translatedFields.descriptionEn,
        price,
        categoryId,
        colorId,
        brand,
        formatImageUrl(imageUrl),
        seasonGroup,
        styleTag,
        sellerId,
      ]
    );

    const product = decorateProduct({
      ...insertResult.rows[0],
      category_name: categoryRow.name,
      color_name: colorRow.name,
    });

    res.status(201).json({ message: 'Urun basariyla eklendi.', product });
  } catch (error) {
    next(error);
  }
};

export const getOptions = async (req, res, next) => {
  try {
    const [categories, colors] = await Promise.all([
      dbPool.query('SELECT * FROM categories ORDER BY name'),
      dbPool.query('SELECT * FROM colors ORDER BY name'),
    ]);

    res.status(200).json({
      categories: categories.rows,
      colors: colors.rows,
      styleTags: STYLE_TAGS,
      seasons: SEASON_OPTIONS,
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  const safeLang = req.query.lang === 'en' ? 'en' : 'tr';

  try {
    const queryParts = [
      `SELECT p.*, c.name AS category_name, col.name AS color_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN colors col ON p.color_id = col.id
       WHERE COALESCE(p.is_active, TRUE) = TRUE`
    ];
    const queryParams = [];

    if (req.query.category) {
      appendIntegerFilter(queryParts, queryParams, req.query.category, 'p.category_id', 'kategori');
    }

    if (req.query.color) {
      appendIntegerFilter(queryParts, queryParams, req.query.color, 'p.color_id', 'renk');
    }

    if (req.query.season) {
      queryParts.push(` AND p.season_group = $${queryParams.length + 1}`);
      queryParams.push(req.query.season);
    }

    if (req.query.style) {
      queryParts.push(` AND p.style_tag = $${queryParams.length + 1}`);
      queryParams.push(req.query.style);
    }

    if (req.query.search) {
      queryParts.push(
        ` AND (
          p.name ILIKE $${queryParams.length + 1}
          OR COALESCE(p.name_tr, p.name) ILIKE $${queryParams.length + 1}
          OR COALESCE(p.name_en, '') ILIKE $${queryParams.length + 1}
        )`
      );
      queryParams.push(`%${req.query.search}%`);
    }

    if (req.query.seller_id) {
      appendIntegerFilter(queryParts, queryParams, req.query.seller_id, 'p.seller_id', 'satici');
    }

    if (req.query.sort === 'price_asc') {
      queryParts.push(' ORDER BY p.price ASC');
    } else if (req.query.sort === 'price_desc') {
      queryParts.push(' ORDER BY p.price DESC');
    } else {
      queryParts.push(' ORDER BY p.created_at DESC');
    }

    const { rows } = await dbPool.query(queryParts.join(''), queryParams);
    res.status(200).json(rows.map(product => decorateProduct(product, safeLang)));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const sellerId = req.user.id;
  const roleName = req.user.role_name;

  try {
    const existingProduct = await fetchProductRecord(id);
    ensureProductAccess(existingProduct, sellerId, roleName);

    const updates = [];
    const values = [];
    let paramIndex = 1;

    const pushUpdate = (columnName, value) => {
      updates.push(`${columnName} = $${paramIndex++}`);
      values.push(value);
    };

    if (req.body.name !== undefined) {
      const name = getTrimmedString(req.body.name);
      if (!name) {
        throw new AppError('Urun adi bos olamaz.', 400);
      }

      const translatedFields = await buildTranslatedFields({ name, description: null });
      pushUpdate('name', name);
      pushUpdate('name_tr', translatedFields.nameTr);
      pushUpdate('name_en', translatedFields.nameEn);
    }

    if (req.body.description !== undefined) {
      const description = getOptionalTrimmedString(req.body.description) ?? null;
      pushUpdate('description', description);
      pushUpdate('description_tr', description);
      pushUpdate('description_en', description ? await translateDescriptionAPI(description) : null);
    }

    if (req.body.price !== undefined) {
      pushUpdate('price', parsePositivePrice(req.body.price));
    }

    if (req.body.category_id !== undefined) {
      const categoryId = parseLookupId(req.body.category_id, 'kategori');
      requireLookupRow(await fetchLookupRow('categories', categoryId), 'kategori', req.body.category_id);
      pushUpdate('category_id', categoryId);
    }

    if (req.body.color_id !== undefined) {
      const colorId = parseLookupId(req.body.color_id, 'renk');
      requireLookupRow(await fetchLookupRow('colors', colorId), 'renk', req.body.color_id);
      pushUpdate('color_id', colorId);
    }

    if (req.body.brand !== undefined) {
      pushUpdate('brand', getOptionalTrimmedString(req.body.brand));
    }

    if (req.body.image_url !== undefined) {
      const imageUrl = getTrimmedString(req.body.image_url);
      if (!imageUrl) {
        throw new AppError('Gecerli bir gorsel URL veya dosya adi giriniz.', 400);
      }

      assertValidImageUrl(imageUrl);
      pushUpdate('image_url', formatImageUrl(imageUrl));
    }

    if (req.body.season_group !== undefined) {
      const seasonGroup = getTrimmedString(req.body.season_group);
      assertValidSeasonGroup(seasonGroup);
      pushUpdate('season_group', seasonGroup);
    }

    if (req.body.style_tag !== undefined) {
      const styleTag = getTrimmedString(req.body.style_tag);
      assertValidStyleTag(styleTag);
      pushUpdate('style_tag', styleTag);
    }

    if (updates.length > 0) {
      values.push(id);
      await dbPool.query(
        `UPDATE products
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex}`,
        values
      );
    }

    const product = decorateProduct(await fetchProductWithRelations(id));
    res.status(200).json({ message: 'Urun guncellendi.', product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  const sellerId = req.user.id;
  const roleName = req.user.role_name;

  try {
    const product = await fetchProductRecord(id);
    ensureProductAccess(product, sellerId, roleName);

    await dbPool.query('DELETE FROM products WHERE id = $1', [id]);
    res.status(200).json({ message: 'Urun basariyla silindi.' });
  } catch (error) {
    next(error);
  }
};
