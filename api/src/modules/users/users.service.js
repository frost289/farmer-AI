import * as repo from './users.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { offsetOf, pageMeta } from '../../utils/schemas.js';

export async function getMe(id) {
  const user = await repo.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export const updateMe = (id, fields) => repo.update(id, fields);

export async function list(pagination) {
  const [rows, total] = await Promise.all([
    repo.list(pagination.limit, offsetOf(pagination)),
    repo.count(),
  ]);
  return { rows, meta: pageMeta(pagination, total) };
}

export async function changeRole(id, role) {
  const user = await repo.update(id, { role });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}
