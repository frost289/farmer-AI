import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccess = (user) =>
  jwt.sign({ role: user.role }, env.jwtAccessSecret, {
    subject: user.id,
    expiresIn: env.jwtAccessExpires,
  });

export const signRefresh = (user) =>
  jwt.sign({ jti: randomUUID() }, env.jwtRefreshSecret, {
    subject: user.id,
    expiresIn: env.jwtRefreshExpires,
  });

export const verifyAccess = (token) => jwt.verify(token, env.jwtAccessSecret);
export const verifyRefresh = (token) => jwt.verify(token, env.jwtRefreshSecret);
export const expiryDate = (token) => new Date(jwt.decode(token).exp * 1000);

// Names used by the auth module.
import { createHash } from 'node:crypto';
export const signAccessToken = signAccess;
export const signRefreshToken = signRefresh;
export { verifyRefresh as verifyRefreshToken };
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');
