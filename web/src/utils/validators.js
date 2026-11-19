import { z } from 'zod';
import { CROPS, SOIL_TYPES, MAX_QUESTION, MAX_SYMPTOMS } from './constants.js';

export const phoneSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^\+?[0-9]{9,15}$/, 'Enter a valid phone number, e.g. +265999000111'));

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Enter your password'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(100),
  phone: phoneSchema,
  password: z.string().min(8, 'Use at least 8 characters').max(100),
  role: z.enum(['farmer', 'field_agent']),
  language: z.enum(['en', 'ny']),
});

const optionalNumber = (min, max, msg) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined || Number.isNaN(v) ? undefined : Number(v)),
    z.number().min(min, msg).max(max, msg).optional(),
  );

export const farmSchema = z.object({
  name: z.string().trim().min(1, 'Enter a farm name').max(100),
  district: z.string().min(1, 'Choose a district'),
  soil_type: z.enum(SOIL_TYPES),
  size_ha: z.preprocess(
    (v) => (v === '' || v === null || v === undefined || Number.isNaN(v) ? undefined : Number(v)),
    z.number().positive('Must be more than 0').optional(),
  ),
  lat: optionalNumber(-90, 90, 'Latitude must be between -90 and 90'),
  lng: optionalNumber(-180, 180, 'Longitude must be between -180 and 180'),
});

export const plantingSchema = z.object({
  crop: z.enum(CROPS),
  variety: z.string().trim().max(80).optional(),
  planting_date: z.string().optional(),
});

export const questionSchema = z.string().trim().min(1).max(MAX_QUESTION);
export const symptomsSchema = z.string().trim().max(MAX_SYMPTOMS);
