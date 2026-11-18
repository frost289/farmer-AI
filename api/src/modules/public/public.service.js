import * as advisory from '../../integrations/advisoryClient.js';
import { currentSeason } from '../../utils/season.js';

/** Anonymous question: nothing is stored (no user, no farm, no history). */
export async function ask({ question, language }, requestId) {
  const lang = language || 'en';
  const result = await advisory.query({ question, language: lang, context: { season: currentSeason() } }, requestId);
  return { answer: result.answer, language: lang };
}