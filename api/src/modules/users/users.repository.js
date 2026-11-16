import { query } from '../../config/db.js';
import { buildUpdate } from '../../utils/sql.js';

const COLS = 'id, name, phone, email, role, language, district, is_active, created_at, updated_at';

export const findById = async (id) =>
  (await query(`SELECT ${COLS} FROM users WHERE id = $1`, [id])).rows[0];

/** Includes password_hash. Only for login. */
export const findAuthByPhone = async (phone) =>
  (await query('SELECT * FROM users WHERE phone = $1', [phone])).rows[0];

export const create = async ({ name, phone, email, passwordHash, role, language }) =>
  (
    await query(
      `INSERT INTO users (name, phone, email, password_hash, role, language)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLS}`,
      [name, phone, email, passwordHash, role, language],
    )
  ).rows[0];

export async function update(id, fields) {
  const q = buildUpdate('users', id, fields, COLS);
  if (!q) return findById(id);
  return (await query(q.text, q.values)).rows[0];
}

export const list = async (limit, offset) =>
  (await query(`SELECT ${COLS} FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]))
    .rows;

export const count = async () => (await query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n;
