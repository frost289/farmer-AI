import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
export const outbreakQuerySchema = z.object({
  district: z.string().trim().max(80).optional(),
  from: date.optional(),
  to: date.optional(),
});
