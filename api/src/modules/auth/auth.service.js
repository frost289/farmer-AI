import * as usersRepo from '../users/users.repository.js';
import * as authRepo from './auth.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { comparePassword, hashPassword } from '../../utils/hash.js';
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/token.js';

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const { exp } = verifyRefreshToken(refreshToken);
  await authRepo.storeRefreshToken(user.id, hashToken(refreshToken), new Date(exp * 1000));
  return { access_token: accessToken, refresh_token: refreshToken, user };
}

export async function register(input) {
  const existing = await usersRepo.findAuthByPhone(input.phone);
  if (existing) throw new ApiError(409, 'CONFLICT', 'Phone number is already registered');
  const user = await usersRepo.create({
    ...input,
    email: input.email || null,
    passwordHash: await hashPassword(input.password),
  });
  return issueTokens(user);
}

export async function login({ phone, password }) {
  const row = await usersRepo.findAuthByPhone(phone);
  const valid = row && row.is_active && (await comparePassword(password, row.password_hash));
  if (!valid) throw ApiError.unauthorized('Invalid phone number or password');
  return issueTokens(await usersRepo.findById(row.id));
}

export async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Refresh token expired or invalid');
  }
  const stored = await authRepo.findValidRefreshToken(hashToken(refreshToken));
  const user = stored && (await usersRepo.findById(payload.sub));
  if (!user || !user.is_active) throw ApiError.unauthorized('Refresh token revoked');
  return { access_token: signAccessToken(user) };
}

export const logout = (refreshToken) => authRepo.revokeRefreshToken(hashToken(refreshToken));
