import { query } from '../../config/db.js';

export const findCache = async (lat, lng) =>
  (await query('SELECT forecast, fetched_at FROM weather_cache WHERE lat = $1 AND lng = $2', [lat, lng]))
    .rows[0];

export const saveCache = async (lat, lng, forecast) =>
  (
    await query(
      `INSERT INTO weather_cache (lat, lng, forecast, fetched_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (lat, lng) DO UPDATE SET forecast = EXCLUDED.forecast, fetched_at = now(), updated_at = now()
       RETURNING forecast, fetched_at`,
      [lat, lng, JSON.stringify(forecast)],
    )
  ).rows[0];

/** One row per district with an average farm location. */
export const districtCentroids = async () =>
  (
    await query(
      `SELECT district, AVG(lat)::float AS lat, AVG(lng)::float AS lng
       FROM farms WHERE lat IS NOT NULL AND lng IS NOT NULL
       GROUP BY district ORDER BY district LIMIT 30`,
    )
  ).rows;
