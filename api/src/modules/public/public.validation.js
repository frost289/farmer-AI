import { z } from 'zod';
import { LANGUAGES, LIMITS } from '../../utils/constants.js';

export const publicAskSchema = z.object({
  question: z.string().trim().min(1).max(LIMITS.questionMax),
  language: z.enum(LANGUAGES).optional(),
});