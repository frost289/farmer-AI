import * as repo from './farms.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { OFFICER_ROLES } from '../../utils/constants.js';
import { offsetOf, pageMeta } from '../../utils/schemas.js';

async function load(id) {
  const farm = await repo.findById(id);
  if (!farm) throw ApiError.notFound('Farm not found');
  return farm;
}

/** Owner, extension officers and admins may read a farm. */
export async function getAccessibleFarm(id, user) {
  const farm = await load(id);
  if (farm.owner_id !== user.id && !OFFICER_ROLES.includes(user.role)) throw ApiError.forbidden();
  return farm;
}

/** Only the owner may change a farm or add data to it. */
export async function getOwnedFarm(id, user) {
  const farm = await load(id);
  if (farm.owner_id !== user.id) throw ApiError.forbidden();
  return farm;
}

export async function list(user, pagination) {
  const [rows, total] = await Promise.all([
    repo.listByOwner(user.id, pagination.limit, offsetOf(pagination)),
    repo.countByOwner(user.id),
  ]);
  return { rows, meta: pageMeta(pagination, total) };
}

export const create = (user, input) => repo.create(user.id, input);

export async function update(id, user, input) {
  await getOwnedFarm(id, user);
  return repo.update(id, input);
}

export async function remove(id, user) {
  await getOwnedFarm(id, user);
  await repo.remove(id);
}
