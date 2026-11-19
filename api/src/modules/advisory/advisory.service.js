import * as advisory from '../../integrations/advisoryClient.js';
import { currentSeason } from '../../utils/season.js';
import * as usersRepo from '../users/users.repository.js';
import { getAccessibleFarm } from '../farms/farms.service.js';

export async function ask(user, { farm_id: farmId, question, language }, requestId) {
  const farm = farmId ? await getAccessibleFarm(farmId, user) : null;
  const lang = language || (await usersRepo.findById(user.id))?.language || 'en';
  const result = await advisory.query(
    { question, language: lang, context: { district: farm?.district, season: currentSeason() } },
    requestId,
  );
  return {
    answer: result.answer,
    language: result.language,
    language_fallback: result.language_fallback,
  };
}
