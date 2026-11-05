import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.kifdurptvbpfmivjjmmh:tiendaderopa15demo25@aws-0-us-east-2.pooler.supabase.com:6543/postgres';

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
    connectionTimeoutMillis: 8000,
  });
}
pool = global.__dbPool;

export async function query(text: string, params?: unknown[]) {
  // Direct pool.query uses connection pooling without manual connect/release overhead
  return pool.query(text, params);
}

export default pool;
