import { query } from '../../config/db.js';

export const listByFarm = async (farmId) =>
  (await query('SELECT * FROM plantings WHERE farm_id = $1 ORDER BY created_at DESC', [farmId])).rows;

export const create = async (farmId, p) =>
  (
    await query(
      `INSERT INTO plantings (farm_id, crop, variety, planting_date, expected_harvest_date, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        farmId,
        p.crop,
        p.variety ?? null,
        p.planting_date ?? null,
        p.expected_harvest_date ?? null,
        p.status,
      ],
    )
  ).rows[0];
