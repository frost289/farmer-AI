import { query } from '../../config/db.js';
import { buildUpdate } from '../../utils/sql.js';

export const create = async ({ userId, farmId, crop, imageUrl, symptoms }) =>
  (
    await query(
      `INSERT INTO diagnoses (user_id, farm_id, crop, image_url, symptoms)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, farmId, crop ?? null, imageUrl ?? null, symptoms ?? null],
    )
  ).rows[0];

export const findById = async (id) =>
  (await query('SELECT * FROM diagnoses WHERE id = $1', [id])).rows[0];

export async function update(id, fields) {
  const q = buildUpdate('diagnoses', id, fields);
  return q ? (await query(q.text, q.values)).rows[0] : findById(id);
}

/** userId = null lists every user's diagnoses (officers and admins). */
export async function list({ userId, farmId, limit, offset }) {
  const where = `($1::uuid IS NULL OR user_id = $1) AND ($2::uuid IS NULL OR farm_id = $2)`;
  const [rows, count] = await Promise.all([
    query(
      `SELECT * FROM diagnoses WHERE ${where} ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [userId, farmId ?? null, limit, offset],
    ),
    query(`SELECT COUNT(*)::int AS n FROM diagnoses WHERE ${where}`, [userId, farmId ?? null]),
  ]);
  return { rows: rows.rows, total: count.rows[0].n };
}
