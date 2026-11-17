import { describe, expect, test } from 'vitest';
import { humanize, messageForCode, percent } from '../src/utils/formatters.js';
import { farmSchema, loginSchema } from '../src/utils/validators.js';

describe('formatters', () => {
  test('humanize turns snake_case into text', () => {
    expect(humanize('maize_streak_virus')).toBe('Maize streak virus');
    expect(humanize(null)).toBe('');
  });
  test('percent', () => {
    expect(percent(0.874)).toBe('87%');
    expect(percent(null)).toBe('-');
  });
  test('messageForCode falls back to a safe message', () => {
    expect(messageForCode('LOW_QUALITY_IMAGE')).toMatch(/blurry/);
    expect(messageForCode('SOMETHING_NEW')).toMatch(/went wrong/);
  });
});

describe('validators', () => {
  test('login normalises the phone number', () => {
    const parsed = loginSchema.parse({ phone: '+265 999-000 111', password: 'x' });
    expect(parsed.phone).toBe('+265999000111');
  });
  test('farm requires name and district', () => {
    expect(farmSchema.safeParse({ name: '', district: '', soil_type: 'loam' }).success).toBe(false);
    expect(farmSchema.safeParse({ name: 'Plot', district: 'Zomba', soil_type: 'loam', size_ha: '1.5' }).success).toBe(true);
  });
});
