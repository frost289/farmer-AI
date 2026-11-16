import { z } from 'zod';
import { LIMITS } from '../../utils/constants.js';
import { cropSchema, paginationSchema } from '../../utils/schemas.js';

const emptyToUndefined = (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

// Multipart fields arrive as strings; empty strings mean "not provided".
export const createDiagnosisSchema = z.object({
  farm_id: z.string().uuid(),
  crop: z.preprocess(emptyToUndefined, cropSchema.optional()),
  symptoms: z.preprocess(emptyToUndefined, z.string().trim().max(LIMITS.symptomsMax).optional()),
});

export const listDiagnosesSchema = paginationSchema.extend({
  farm_id: z.string().uuid().optional(),
});
