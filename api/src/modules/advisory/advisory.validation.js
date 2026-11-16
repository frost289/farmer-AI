import { z } from 'zod';
import { LANGUAGES, LIMITS } from '../../utils/constants.js';

export const askSchema = z.object({
  farm_id: z.string().uuid().optional(),
  question: z.string().trim().min(1).max(LIMITS.questionMax),
  language: z.enum(LANGUAGES).optional(),
});
