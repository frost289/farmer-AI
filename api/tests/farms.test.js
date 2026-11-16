import { afterAll, describe, expect, test } from '@jest/globals';
import { closeDb } from '../src/config/db.js';
import { api, bearer, registerUser } from './helpers.js';

afterAll(closeDb);

const farm = { name: 'Home plot', district: 'Lilongwe', lat: -13.96, lng: 33.78, soil_type: 'loam', size_ha: 1.5 };

describe('farms', () => {
  test('creates, reads, updates and deletes a farm', async () => {
    const { token } = await registerUser();
    const created = await api().post('/api/v1/farms').set(bearer(token)).send(farm);
    expect(created.status).toBe(201);
    const id = created.body.data.id;
    expect(created.body.data.size_ha).toBe(1.5);

    const got = await api().get(`/api/v1/farms/${id}`).set(bearer(token));
    expect(got.body.data.name).toBe('Home plot');

    const updated = await api().put(`/api/v1/farms/${id}`).set(bearer(token)).send({ ...farm, name: 'Renamed' });
    expect(updated.body.data.name).toBe('Renamed');

    expect((await api().delete(`/api/v1/farms/${id}`).set(bearer(token))).status).toBe(204);
    expect((await api().get(`/api/v1/farms/${id}`).set(bearer(token))).status).toBe(404);
  });

  test('lists only own farms with pagination meta', async () => {
    const a = await registerUser();
    const b = await registerUser();
    await api().post('/api/v1/farms').set(bearer(a.token)).send(farm);
    const list = await api().get('/api/v1/farms?page=1&limit=10').set(bearer(b.token));
    expect(list.body.data).toHaveLength(0);
    expect(list.body.meta).toEqual({ page: 1, limit: 10, total: 0 });
  });

  test("forbids another farmer from changing someone else's farm", async () => {
    const owner = await registerUser();
    const other = await registerUser();
    const created = await api().post('/api/v1/farms').set(bearer(owner.token)).send(farm);
    const res = await api().delete(`/api/v1/farms/${created.body.data.id}`).set(bearer(other.token));
    expect(res.status).toBe(403);
  });

  test('validates input', async () => {
    const { token } = await registerUser();
    const res = await api().post('/api/v1/farms').set(bearer(token)).send({ name: 'x', district: 'Zomba', lat: 999 });
    expect(res.status).toBe(400);
  });

  test('adds and lists plantings', async () => {
    const { token } = await registerUser();
    const created = await api().post('/api/v1/farms').set(bearer(token)).send(farm);
    const id = created.body.data.id;
    const planting = await api()
      .post(`/api/v1/farms/${id}/plantings`)
      .set(bearer(token))
      .send({ crop: 'maize', planting_date: '2026-11-20' });
    expect(planting.status).toBe(201);
    const list = await api().get(`/api/v1/farms/${id}/plantings`).set(bearer(token));
    expect(list.body.data).toHaveLength(1);
  });
});
