import pg from 'pg';
import { env } from './env.js';

// NUMERIC -> number, DATE -> 'YYYY-MM-DD' string (matches the API contract).
pg.types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
pg.types.setTypeParser(1082, (v) => v);

export const pool = new pg.Pool({ connectionString: env.databaseUrl });
export const query = (text, params) => pool.query(text, params);

export const closeDb = () => pool.end();
