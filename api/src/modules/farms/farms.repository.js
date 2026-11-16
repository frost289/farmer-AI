import { query } from '../../config/db.js';
import { buildUpdate } from '../../utils/sql.js';

export const findById = async (id) =>
  (await query('SELECT * FROM farms WHERE id = $1', [id])).rows[0];

export const listByOwner = async (ownerId, limit, offset) =>
  (
    await query('SELECT * FROM farms WHERE owner_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [
      ownerId,
      limit,
      offset,
    ])
  ).rows;

export const countByOwner = async (ownerId) =>
  (await query('SELECT COUNT(*)::int AS n FROM farms WHERE owner_id = $1', [ownerId])).rows[0].n;

export const create = async (ownerId, f) =>
  (
    await query(
      `INSERT INTO farms (owner_id, name, district, lat, lng, soil_type, size_ha)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [ownerId, f.name, f.district, f.lat ?? null, f.lng ?? null, f.soil_type, f.size_ha ?? null],
    )
  ).rows[0];

export async function update(id, fields) {
  const q = buildUpdate('farms', id, fields);
  if (!q) return findById(id);
  return (await query(q.text, q.values)).rows[0];
}

export const remove = (id) => query('DELETE FROM farms WHERE id = $1', [id]);
