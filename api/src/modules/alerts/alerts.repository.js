import { query } from '../../config/db.js';

export const create = async ({ title, message, targetDistrict, targetUserId, createdBy }) =>
  (
    await query(
      `INSERT INTO alerts (title, message, target_district, target_user_id, status, created_by)
       VALUES ($1, $2, $3, $4, 'sent', $5) RETURNING *`,
      [title, message, targetDistrict ?? null, targetUserId ?? null, createdBy],
    )
  ).rows[0];

export const listForUser = async (userId, district) =>
  (
    await query(
      `SELECT * FROM alerts
       WHERE status = 'sent'
         AND (target_user_id = $1
              OR (target_user_id IS NULL AND (target_district IS NULL OR target_district = $2)))
       ORDER BY created_at DESC LIMIT 50`,
      [userId, district ?? null],
    )
  ).rows;
