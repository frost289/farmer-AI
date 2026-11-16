import { z } from 'zod';
import { CROPS } from './constants.js';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
export const cropSchema = z.enum(CROPS);

export const pageMeta = ({ page, limit }, total) => ({ page, limit, total });
export const offsetOf = ({ page, limit }) => (page - 1) * limit;
