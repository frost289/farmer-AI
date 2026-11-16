import { z } from 'zod';
import { SOIL_TYPES } from '../../utils/constants.js';

export const farmSchema = z.object({
  name: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(80),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  soil_type: z.enum(SOIL_TYPES).default('unknown'),
  size_ha: z.number().positive().max(100000).optional(),
});
