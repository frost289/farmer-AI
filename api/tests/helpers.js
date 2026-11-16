import request from 'supertest';
import app from '../src/app.js';

export const api = () => request(app);

/** Unique phone per test run so tests can run against a shared test database. */
export const randomPhone = () => `+2659${Math.floor(10000000 + Math.random() * 89999999)}`;

export async function registerUser(overrides = {}) {
  const body = {
    name: 'Test User',
    phone: randomPhone(),
    password: 'Password123!',
    role: 'farmer',
    language: 'en',
    ...overrides,
  };
  const res = await api().post('/api/v1/auth/register').send(body);
  return { body, res, token: res.body.data?.access_token, user: res.body.data?.user };
}

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });
