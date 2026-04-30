import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dbPool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const getAdminCredentials = () => {
  const credentials = {
    username: process.env.ADMIN_USERNAME?.trim(),
    email: process.env.ADMIN_EMAIL?.trim(),
    password: process.env.ADMIN_PASSWORD?.trim(),
  };

  const missingAdminEnvVars = Object.entries({
    ADMIN_USERNAME: credentials.username,
    ADMIN_EMAIL: credentials.email,
    ADMIN_PASSWORD: credentials.password,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingAdminEnvVars.length > 0) {
    throw new Error(
      `Ilk admin hesabi icin eksik ortam degiskenleri bulundu: ${missingAdminEnvVars.join(', ')}. ` +
      'Lutfen backend/.env dosyasini backend/.env.example dosyasini referans alarak doldurun.'
    );
  }

  return credentials;
};

export const ensureAdmin = async () => {
  try {
    const roleResult = await dbPool.query(
      "SELECT id FROM roles WHERE name = 'Admin' LIMIT 1"
    );
    const adminRole = roleResult.rows[0];

    if (!adminRole) {
      console.warn('Admin rolu bulunamadi. Once schema.sql dosyasinin calistigindan emin olun.');
      return;
    }

    const userResult = await dbPool.query(
      'SELECT id FROM users WHERE role_id = $1 LIMIT 1',
      [adminRole.id]
    );

    if (userResult.rows[0]) {
      console.log('Admin hesabi zaten mevcut. Yeni bir admin olusturulmadi.');
      return;
    }

    const credentials = getAdminCredentials();
    const hashedPassword = await bcrypt.hash(credentials.password, 10);

    await dbPool.query(
      'INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4)',
      [credentials.username, credentials.email, hashedPassword, adminRole.id]
    );

    console.log(`Admin hesabi olusturuldu (${credentials.email}).`);
  } catch (error) {
    console.error('Admin hesabi olusturulurken hata olustu:', error);
    throw error;
  }
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  ensureAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
