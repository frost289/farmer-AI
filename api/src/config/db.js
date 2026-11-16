import pg from 'pg';
import { env } from './env.js';
import { logger } from './logger.js';

// NUMERIC -> number, DATE -> 'YYYY-MM-DD' string (matches the API contract).
pg.types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
pg.types.setTypeParser(1082, (v) => v);

// Neon (and most hosted Postgres) requires TLS. Local/Docker Postgres does not.
const useSsl = /neon\.tech|sslmode=require/.test(env.databaseUrl);

// This API is a long-running Node server, so the standard `pg` pool is the right driver
// (@neondatabase/serverless is for serverless/edge runtimes). Use Neon's *pooled* connection
// string (host contains "-pooler") for the app.
export const pool = new pg.Pool({
  connectionString: env.databaseUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, ''),
  ssl: useSsl ? { rejectUnauthorized: true } : undefined,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000, // allows for a cold start of a suspended Neon compute
});

// Neon suspends idle computes and drops connections; without this handler the process would crash.
pool.on('error', (err) => logger.warn('idle database client error', { error: err.message }));

export const query = (text, params) => pool.query(text, params);
export const closeDb = () => pool.end();
