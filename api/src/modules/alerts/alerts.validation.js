import { z } from 'zod';

export const createAlertSchema = z.object({
  title: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(2000),
  target_district: z.string().trim().max(80).optional(),
  target_user_id: z.string().uuid().optional(),
});
