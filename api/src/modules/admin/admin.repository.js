import { query } from '../../config/db.js';

export async function stats() {
  const [users, farms, diagnoses] = await Promise.all([
    query('SELECT role, COUNT(*)::int AS n FROM users GROUP BY role'),
    query('SELECT COUNT(*)::int AS n FROM farms'),
    query('SELECT status, COUNT(*)::int AS n FROM diagnoses GROUP BY status'),
  ]);
  const toMap = (rows, key) => Object.fromEntries(rows.map((r) => [r[key], r.n]));
  return {
    users_by_role: toMap(users.rows, 'role'),
    farms: farms.rows[0].n,
    diagnoses_by_status: toMap(diagnoses.rows, 'status'),
  };
}
