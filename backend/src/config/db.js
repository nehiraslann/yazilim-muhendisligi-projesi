import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredDbEnvVars = ['DB_USER', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_PASSWORD'];
const missingDbEnvVars = requiredDbEnvVars.filter((key) => !process.env[key]?.toString().trim());

if (missingDbEnvVars.length > 0) {
  throw new Error(
    `Veritabani baglantisi icin eksik ortam degiskenleri bulundu: ${missingDbEnvVars.join(', ')}. ` +
    'Lutfen backend/.env dosyasini backend/.env.example dosyasini referans alarak doldurun.'
  );
}

const dbPort = Number(process.env.DB_PORT);

if (Number.isNaN(dbPort)) {
  throw new Error('DB_PORT sayisal bir deger olmali. Lutfen backend/.env dosyasini kontrol edin.');
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: dbPort,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
