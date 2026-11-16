import { z } from 'zod';

export const weatherQuerySchema = z.object({ farm_id: z.string().uuid() });
