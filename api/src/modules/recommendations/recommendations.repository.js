import { query } from '../../config/db.js';

export const save = (farmId, type, payload) =>
  query('INSERT INTO recommendations (farm_id, type, payload) VALUES ($1, $2, $3)', [
    farmId,
    type,
    JSON.stringify(payload),
  ]);
