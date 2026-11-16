import { query } from '../../config/db.js';

export const list = async ({ district, from, to }) =>
  (
    await query(
      `SELECT id, disease, crop, district, case_count, period_start, period_end FROM outbreaks
       WHERE ($1::text IS NULL OR district = $1)
         AND ($2::date IS NULL OR period_end >= $2)
         AND ($3::date IS NULL OR period_start <= $3)
       ORDER BY period_start DESC, case_count DESC LIMIT 500`,
      [district ?? null, from ?? null, to ?? null],
    )
  ).rows;

/** Rebuilds weekly counts per disease, crop and district from completed diagnoses. */
export const aggregateRecent = () =>
  query(
    `INSERT INTO outbreaks (disease, crop, district, case_count, period_start, period_end)
     SELECT d.name, COALESCE(d.crop, 'unknown'), f.district, COUNT(*)::int,
            date_trunc('week', d.created_at)::date,
            date_trunc('week', d.created_at)::date + 6
     FROM diagnoses d JOIN farms f ON f.id = d.farm_id
     WHERE d.status = 'completed' AND d.type IN ('disease', 'pest') AND d.name IS NOT NULL
       AND d.created_at > now() - interval '8 weeks'
     GROUP BY d.name, COALESCE(d.crop, 'unknown'), f.district, date_trunc('week', d.created_at)
     ON CONFLICT (disease, crop, district, period_start)
     DO UPDATE SET case_count = EXCLUDED.case_count, period_end = EXCLUDED.period_end, updated_at = now()`,
  );
