import { z } from 'zod';
import { LANGUAGES } from '../../utils/constants.js';

const phone = z
  .string()
  .transform((s) => s.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number'));

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone,
  email: z.string().trim().email().nullable().optional(),
  password: z.string().min(8).max(100),
  // Officers and admins are created by an admin (PUT /users/:id/role), not by self-registration.
  role: z.enum(['farmer', 'field_agent']).default('farmer'),
  language: z.enum(LANGUAGES).default('en'),
});

export const loginSchema = z.object({ phone, password: z.string().min(1) });
export const refreshSchema = z.object({ refresh_token: z.string().min(1) });
