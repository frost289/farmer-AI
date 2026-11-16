import { z } from 'zod';
import { cropSchema } from '../../utils/schemas.js';

export const cropRecsQuery = z.object({ farm_id: z.string().uuid() });
export const readinessQuery = z.object({ farm_id: z.string().uuid(), crop: cropSchema });
