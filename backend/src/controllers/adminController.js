import dbPool from '../config/db.js';
import { AppError } from '../middlewares/errorMiddleware.js';

const SEASON_OPTIONS = new Set(['springWarm', 'summerCool', 'autumnWarm', 'winterCool']);
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const getTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const getOptionalTrimmedString = (value, fieldName) => {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new AppError(`${fieldName} metin formatinda olmalidir.`, 400);
  }

  const trimmed = value.trim();
  return trimmed || null;
};

const getRequiredString = (value, fieldName) => {
  const trimmed = getTrimmedString(value);

  if (!trimmed) {
    throw new AppError(`${fieldName} zorunludur.`, 400);
  }

  return trimmed;
};

const parseEntityId = (rawValue, fieldName = 'ID') => {
  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new AppError(`Gecersiz ${fieldName}.`, 400);
  }

  return parsedValue;
};

const ensureRowFound = (row, message) => {
  if (!row) {
    throw new AppError(message, 404);
  }

  return row;
};

const normalizeDatabaseError = (error, { duplicateMessage } = {}) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error?.code === '23505' && duplicateMessage) {
    return new AppError(duplicateMessage, 409);
  }

  return error;
};

const validateSeasonGroup = (value) => {
  const seasonGroup = getOptionalTrimmedString(value, 'Sezon grubu');

  if (seasonGroup && !SEASON_OPTIONS.has(seasonGroup)) {
    throw new AppError('Gecersiz sezon grubu.', 400);
  }

  return seasonGroup;
};

const validateHexCode = (value) => {
  const hexCode = getOptionalTrimmedString(value, 'Hex kodu');

  if (hexCode && !HEX_COLOR_PATTERN.test(hexCode)) {
    throw new AppError('Hex kodu #RGB veya #RRGGBB formatinda olmalidir.', 400);
  }

  return hexCode ? hexCode.toUpperCase() : null;
};

const buildColorPayload = (body = {}, { requireName = false } = {}) => {
  const payload = {};

  if (requireName || hasOwn(body, 'name')) {
    payload.name = getRequiredString(body.name, 'Renk adi');
  }

  if (requireName || hasOwn(body, 'hex_code')) {
    payload.hex_code = validateHexCode(body.hex_code);
  }

  if (requireName || hasOwn(body, 'season_group')) {
    payload.season_group = validateSeasonGroup(body.season_group);
  }

  return payload;
};

export const getUsers = async (req, res, next) => {
  try {
    const query = `
      SELECT
        u.id,
        u.username,
        u.full_name,
        u.email,
        u.created_at,
        COALESCE(u.is_active, true) AS is_active,
        r.name AS role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `;

    const { rows } = await dbPool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const userId = parseEntityId(req.params.id, 'kullanici ID');

    if (req.user?.id === userId) {
      throw new AppError('Kendi hesabinizi pasife alamazsiniz.', 400);
    }

    const { rows } = await dbPool.query(
      `
        UPDATE users
        SET is_active = NOT COALESCE(is_active, true)
        WHERE id = $1
        RETURNING username, COALESCE(is_active, true) AS is_active
      `,
      [userId]
    );

    const updatedUser = ensureRowFound(rows[0], 'Kullanici bulunamadi.');
    const statusLabel = updatedUser.is_active ? 'aktif' : 'pasif';

    res.status(200).json({
      message: `Kullanici '${updatedUser.username}' durumu ${statusLabel} yapildi.`,
      is_active: updatedUser.is_active,
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const query = `
      SELECT
        p.id,
        p.name,
        p.price,
        p.created_at,
        p.brand,
        p.season_group,
        p.style_tag,
        COALESCE(p.is_active, true) AS is_active,
        u.username AS seller_name,
        c.name AS category_name,
        col.name AS color_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN colors col ON p.color_id = col.id
      ORDER BY p.created_at DESC
    `;

    const { rows } = await dbPool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

export const toggleProductStatus = async (req, res, next) => {
  try {
    const productId = parseEntityId(req.params.id, 'urun ID');
    const { rows } = await dbPool.query(
      `
        UPDATE products
        SET is_active = NOT COALESCE(is_active, true)
        WHERE id = $1
        RETURNING name, COALESCE(is_active, true) AS is_active
      `,
      [productId]
    );

    const updatedProduct = ensureRowFound(rows[0], 'Urun bulunamadi.');
    const statusLabel = updatedProduct.is_active ? 'yayina alindi' : 'yayindan kaldirildi';

    res.status(200).json({
      message: `Urun '${updatedProduct.name}' ${statusLabel}.`,
      is_active: updatedProduct.is_active,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const { rows } = await dbPool.query('SELECT id, name FROM categories ORDER BY name ASC');
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

export const addCategory = async (req, res, next) => {
  try {
    const name = getRequiredString(req.body?.name, 'Kategori adi');
    const { rows } = await dbPool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id, name',
      [name]
    );

    res.status(201).json({
      message: 'Kategori eklendi.',
      category: rows[0],
    });
  } catch (error) {
    next(normalizeDatabaseError(error, { duplicateMessage: 'Bu kategori zaten mevcut.' }));
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const categoryId = parseEntityId(req.params.id, 'kategori ID');
    const name = getRequiredString(req.body?.name, 'Kategori adi');
    const { rows } = await dbPool.query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name',
      [name, categoryId]
    );

    const updatedCategory = ensureRowFound(rows[0], 'Kategori bulunamadi.');

    res.status(200).json({
      message: 'Kategori guncellendi.',
      category: updatedCategory,
    });
  } catch (error) {
    next(normalizeDatabaseError(error, { duplicateMessage: 'Bu kategori adi zaten kullaniliyor.' }));
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = parseEntityId(req.params.id, 'kategori ID');
    const { rows } = await dbPool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id, name',
      [categoryId]
    );

    const deletedCategory = ensureRowFound(rows[0], 'Kategori bulunamadi.');

    res.status(200).json({
      message: 'Kategori silindi.',
      category: deletedCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const getColors = async (req, res, next) => {
  try {
    const { rows } = await dbPool.query(
      'SELECT id, name, hex_code, season_group FROM colors ORDER BY name ASC'
    );
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};

export const addColor = async (req, res, next) => {
  try {
    const payload = buildColorPayload(req.body ?? {}, { requireName: true });
    const { rows } = await dbPool.query(
      `
        INSERT INTO colors (name, hex_code, season_group)
        VALUES ($1, $2, $3)
        RETURNING id, name, hex_code, season_group
      `,
      [payload.name, payload.hex_code, payload.season_group]
    );

    res.status(201).json({
      message: 'Renk eklendi.',
      color: rows[0],
    });
  } catch (error) {
    next(normalizeDatabaseError(error, { duplicateMessage: 'Bu renk zaten mevcut.' }));
  }
};

export const updateColor = async (req, res, next) => {
  try {
    const colorId = parseEntityId(req.params.id, 'renk ID');
    const payload = buildColorPayload(req.body ?? {});

    if (Object.keys(payload).length === 0) {
      throw new AppError('Guncellenecek en az bir alan gondermelisiniz.', 400);
    }

    const updates = [];
    const values = [];
    let parameterIndex = 1;

    if (hasOwn(payload, 'name')) {
      updates.push(`name = $${parameterIndex++}`);
      values.push(payload.name);
    }

    if (hasOwn(payload, 'hex_code')) {
      updates.push(`hex_code = $${parameterIndex++}`);
      values.push(payload.hex_code);
    }

    if (hasOwn(payload, 'season_group')) {
      updates.push(`season_group = $${parameterIndex++}`);
      values.push(payload.season_group);
    }

    values.push(colorId);

    const { rows } = await dbPool.query(
      `
        UPDATE colors
        SET ${updates.join(', ')}
        WHERE id = $${parameterIndex}
        RETURNING id, name, hex_code, season_group
      `,
      values
    );

    const updatedColor = ensureRowFound(rows[0], 'Renk bulunamadi.');

    res.status(200).json({
      message: 'Renk guncellendi.',
      color: updatedColor,
    });
  } catch (error) {
    next(normalizeDatabaseError(error, { duplicateMessage: 'Bu renk adi zaten kullaniliyor.' }));
  }
};

export const deleteColor = async (req, res, next) => {
  try {
    const colorId = parseEntityId(req.params.id, 'renk ID');
    const { rows } = await dbPool.query(
      'DELETE FROM colors WHERE id = $1 RETURNING id, name, hex_code, season_group',
      [colorId]
    );

    const deletedColor = ensureRowFound(rows[0], 'Renk bulunamadi.');

    res.status(200).json({
      message: 'Renk silindi.',
      color: deletedColor,
    });
  } catch (error) {
    next(error);
  }
};
