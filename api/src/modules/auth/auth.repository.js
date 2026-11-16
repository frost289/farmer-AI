import { query } from '../../config/db.js';

export const storeRefreshToken = (userId, tokenHash, expiresAt) =>
  query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [
    userId,
    tokenHash,
    expiresAt,
  ]);

export const findValidRefreshToken = async (tokenHash) =>
  (
    await query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked = FALSE AND expires_at > now()',
      [tokenHash],
    )
  ).rows[0];

export const revokeRefreshToken = (tokenHash) =>
  query('UPDATE refresh_tokens SET revoked = TRUE, updated_at = now() WHERE token_hash = $1', [
    tokenHash,
  ]);
