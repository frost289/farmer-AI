import * as repo from './plantings.repository.js';
import { getAccessibleFarm, getOwnedFarm } from '../farms/farms.service.js';

export async function list(farmId, user) {
  await getAccessibleFarm(farmId, user);
  return repo.listByFarm(farmId);
}

export async function create(farmId, user, input) {
  await getOwnedFarm(farmId, user);
  return repo.create(farmId, input);
}
