import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dbPool from '../config/db.js';
import { AppError } from '../middlewares/errorMiddleware.js';

const USER_PROFILE_COLUMNS = ['full_name', 'avatar_url'];
const REGISTERABLE_ROLES = new Set(['Customer', 'Seller']);
const INVALID_CREDENTIALS_MESSAGE = 'E-posta veya sifre hatali';
const TOKEN_TTL = '1d';

const signAuthToken = ({ id, role_id, role_name }) =>
  jwt.sign({ id, role_id, role_name }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const buildPublicUser = (user, roleName = user.role_name) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: roleName,
});

const getUserProfileColumns = async () => {
  const { rows } = await dbPool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'users'
       AND column_name = ANY($1::text[])`,
    [USER_PROFILE_COLUMNS]
  );

  return new Set(rows.map(row => row.column_name));
};

const fetchUserProfile = async (userId, profileColumns = null) => {
  const availableColumns = profileColumns || await getUserProfileColumns();
  const nameSelect = availableColumns.has('full_name')
    ? `COALESCE(NULLIF(u.full_name, ''), u.username) AS name`
    : 'u.username AS name';
  const avatarSelect = availableColumns.has('avatar_url')
    ? 'u.avatar_url'
    : 'NULL::text AS avatar_url';

  const { rows } = await dbPool.query(
    `SELECT u.id, u.username, u.email, u.created_at, r.name AS role,
            ${nameSelect},
            ${avatarSelect}
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [userId]
  );

  return rows[0] || null;
};

const findUserByEmail = async (email) => {
  const { rows } = await dbPool.query(
    `SELECT users.*, roles.name AS role_name
     FROM users
     JOIN roles ON users.role_id = roles.id
     WHERE email = $1`,
    [email]
  );

  return rows[0] || null;
};

const findRoleByName = async (roleName) => {
  const { rows } = await dbPool.query('SELECT id, name FROM roles WHERE name = $1', [roleName]);
  return rows[0] || null;
};

const ensureUniqueUsername = async (username, userId = null) => {
  const query = userId === null
    ? 'SELECT id FROM users WHERE username = $1'
    : 'SELECT id FROM users WHERE username = $1 AND id != $2';
  const params = userId === null ? [username] : [username, userId];
  const { rows } = await dbPool.query(query, params);
  return rows.length === 0;
};

const updatePasswordIfNeeded = async (userId, currentPassword, newPassword) => {
  if (!newPassword) {
    return;
  }

  if (!currentPassword) {
    throw new AppError('Mevcut sifrenizi girmelisiniz.', 400);
  }

  const { rows } = await dbPool.query('SELECT password FROM users WHERE id = $1', [userId]);
  const passwordMatch = rows[0] && await bcrypt.compare(currentPassword, rows[0].password);
  if (!passwordMatch) {
    throw new AppError('Mevcut sifre yanlis.', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('Yeni sifre en az 6 karakter olmali.', 400);
  }

  await dbPool.query('UPDATE users SET password = $1 WHERE id = $2', [await hashPassword(newPassword), userId]);
};

export const register = async (req, res, next) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const password = req.body.password;
  const requestedRole = req.body.roleName || 'Customer';

  try {
    if (!username || !email || !password) {
      return next(new AppError('Kullanici adi, e-posta ve sifre zorunludur.', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Sifre en az 6 karakter olmali.', 400));
    }

    if (requestedRole === 'Admin' || requestedRole === 'admin') {
      return next(new AppError('Yetkisiz erisim: Admin hesabi olusturulamaz.', 400));
    }

    if (!REGISTERABLE_ROLES.has(requestedRole)) {
      return next(new AppError('Gecersiz rol secimi. Sadece Customer veya Seller kullanabilirsiniz.', 400));
    }

    if (await findUserByEmail(email)) {
      return next(new AppError('Bu e-posta zaten kayitli.', 400));
    }

    if (!await ensureUniqueUsername(username)) {
      return next(new AppError('Bu kullanici adi zaten kullaniliyor.', 400));
    }

    const role = await findRoleByName(requestedRole);
    if (!role) {
      return next(new AppError('Kayit sirasinda teknik bir rol hatasi olustu.', 400));
    }

    const { rows } = await dbPool.query(
      `INSERT INTO users (username, email, password, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role_id`,
      [username, email, await hashPassword(password), role.id]
    );

    const user = rows[0];
    res.status(201).json({
      message: 'Kullanici basariyla kaydedildi.',
      token: signAuthToken({ id: user.id, role_id: user.role_id, role_name: role.name }),
      user: buildPublicUser(user, role.name),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    console.error(error);
    return next(new AppError('Kayit olurken bir hata olustu.', 500));
  }
};

export const login = async (req, res, next) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const password = req.body.password;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return next(new AppError(INVALID_CREDENTIALS_MESSAGE, 401));
    }

    if (user.is_active === false) {
      return next(new AppError('Hesabiniz yonetici tarafindan askiya alinmistir.', 403));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(new AppError(INVALID_CREDENTIALS_MESSAGE, 401));
    }

    res.status(200).json({
      message: 'Giris basarili.',
      token: signAuthToken(user),
      user: buildPublicUser(user),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    console.error(error);
    return next(new AppError('Giris yaparken bir hata olustu.', 500));
  }
};

export const getMe = async (req, res, next) => {
  try {
    const profile = await fetchUserProfile(req.user.id);
    if (!profile) {
      return next(new AppError('Kullanici bulunamadi.', 404));
    }

    res.status(200).json(profile);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    console.error(error);
    return next(new AppError('Profil bilgileri alinirken hata olustu.', 500));
  }
};

export const updateMe = async (req, res, next) => {
  const { username, name, avatar_url, current_password, new_password } = req.body;

  try {
    const profileColumns = await getUserProfileColumns();
    const hasFullName = profileColumns.has('full_name');
    const hasAvatarUrl = profileColumns.has('avatar_url');

    const incomingName = typeof name === 'string' ? name.trim() : undefined;
    const incomingUsername = typeof username === 'string' ? username.trim() : undefined;
    const nextUsername = incomingUsername !== undefined
      ? incomingUsername
      : (!hasFullName ? incomingName : undefined);
    const nextFullName = hasFullName && incomingName !== undefined
      ? (incomingName || null)
      : undefined;
    const avatarProvided = Object.prototype.hasOwnProperty.call(req.body, 'avatar_url');
    const nextAvatarUrl = hasAvatarUrl && avatarProvided
      ? (typeof avatar_url === 'string' ? (avatar_url.trim() || null) : avatar_url ?? null)
      : undefined;

    if (nextUsername !== undefined && !nextUsername) {
      return next(new AppError('Kullanici adi bos olamaz.', 400));
    }

    if (nextUsername && !await ensureUniqueUsername(nextUsername, req.user.id)) {
      return next(new AppError('Bu kullanici adi zaten kullaniliyor.', 400));
    }

    await updatePasswordIfNeeded(req.user.id, current_password, new_password);

    const updates = [];
    const values = [];
    let paramIndex = 1;

    const pushUpdate = (columnName, value) => {
      updates.push(`${columnName} = $${paramIndex++}`);
      values.push(value);
    };

    if (nextUsername !== undefined) {
      pushUpdate('username', nextUsername);
    }

    if (nextFullName !== undefined) {
      pushUpdate('full_name', nextFullName);
    }

    if (nextAvatarUrl !== undefined) {
      pushUpdate('avatar_url', nextAvatarUrl);
    }

    if (updates.length > 0) {
      values.push(req.user.id);
      await dbPool.query(
        `UPDATE users
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex}`,
        values
      );
    }

    const profile = await fetchUserProfile(req.user.id, profileColumns);
    if (!profile) {
      return next(new AppError('Kullanici bulunamadi.', 404));
    }

    res.status(200).json({ message: 'Profil guncellendi.', ...profile });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    console.error(error);
    return next(new AppError('Profil guncellenirken hata olustu.', 500));
  }
};
