import { z } from 'zod';
import { LANGUAGES, ROLES } from '../../utils/constants.js';

export const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().nullable().optional(),
  language: z.enum(LANGUAGES).optional(),
  district: z.string().trim().min(1).max(80).optional(),
});
export const roleSchema = z.object({ role: z.enum(ROLES) });
