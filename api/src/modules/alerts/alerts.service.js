import * as repo from './alerts.repository.js';
import * as usersRepo from '../users/users.repository.js';

export async function listForUser(user) {
  const me = await usersRepo.findById(user.id);
  return repo.listForUser(user.id, me?.district);
}

export const create = (user, input) =>
  repo.create({
    title: input.title,
    message: input.message,
    targetDistrict: input.target_district,
    targetUserId: input.target_user_id,
    createdBy: user.id,
  });
