import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.kifdurptvbpfmivjjmmh:tiendaderopa15demo25@aws-0-us-east-2.pooler.supabase.com:5432/postgres';

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

let pool: Pool;

if (!global.__dbPool) {
  global.__dbPool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}
pool = global.__dbPool;

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

export default pool;

