import { afterAll, describe, expect, test } from '@jest/globals';
import { closeDb } from '../src/config/db.js';
import { api, bearer, registerUser } from './helpers.js';

// Requires a migrated test database: DATABASE_URL=.../farmai_test npm run migrate
afterAll(closeDb);

describe('auth', () => {
  test('registers a farmer and returns tokens without password_hash', async () => {
    const { res } = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.data.access_token).toBeTruthy();
    expect(res.body.data.refresh_token).toBeTruthy();
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  test('rejects a duplicate phone with CONFLICT', async () => {
    const first = await registerUser();
    const second = await api().post('/api/v1/auth/register').send(first.body);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('CONFLICT');
  });

  test('rejects invalid input with VALIDATION_ERROR and field details', async () => {
    const res = await api().post('/api/v1/auth/register').send({ name: '', phone: '1', password: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  test('does not allow self-registering as admin', async () => {
    const { res } = await registerUser({ role: 'admin' });
    expect(res.status).toBe(400);
  });

  test('logs in and rejects a wrong password', async () => {
    const { body } = await registerUser();
    const ok = await api().post('/api/v1/auth/login').send({ phone: body.phone, password: body.password });
    expect(ok.status).toBe(200);
    const bad = await api().post('/api/v1/auth/login').send({ phone: body.phone, password: 'wrong-password' });
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe('UNAUTHORIZED');
  });

  test('refreshes an access token, and not after logout', async () => {
    const { res } = await registerUser();
    const refreshToken = res.body.data.refresh_token;
    const refreshed = await api().post('/api/v1/auth/refresh').send({ refresh_token: refreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.access_token).toBeTruthy();
    await api().post('/api/v1/auth/logout').send({ refresh_token: refreshToken });
    const after = await api().post('/api/v1/auth/refresh').send({ refresh_token: refreshToken });
    expect(after.status).toBe(401);
  });

  test('protects routes and enforces roles', async () => {
    expect((await api().get('/api/v1/users/me')).status).toBe(401);
    const { token } = await registerUser();
    expect((await api().get('/api/v1/users/me').set(bearer(token))).status).toBe(200);
    const forbidden = await api().get('/api/v1/outbreaks').set(bearer(token));
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error.code).toBe('FORBIDDEN');
  });
});
