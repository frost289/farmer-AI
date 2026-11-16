import { z } from 'zod';
import { PLANTING_STATUSES } from '../../utils/constants.js';
import { cropSchema } from '../../utils/schemas.js';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const plantingSchema = z.object({
  crop: cropSchema,
  variety: z.string().trim().max(80).optional(),
  planting_date: date.optional(),
  expected_harvest_date: date.optional(),
  status: z.enum(PLANTING_STATUSES).default('planned'),
});
