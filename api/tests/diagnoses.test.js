import { afterAll, describe, expect, test } from '@jest/globals';
import { closeDb } from '../src/config/db.js';
import { severityFromPct } from '../src/jobs/diagnosis.worker.js';
import { api, bearer, registerUser } from './helpers.js';

afterAll(closeDb);

async function farmFor(token) {
  const res = await api()
    .post('/api/v1/farms')
    .set(bearer(token))
    .send({ name: 'Plot', district: 'Zomba', lat: -15.38, lng: 35.33 });
  return res.body.data.id;
}

describe('diagnoses', () => {
  test('requires an image or symptoms', async () => {
    const { token } = await registerUser();
    const farmId = await farmFor(token);
    const res = await api().post('/api/v1/diagnoses').set(bearer(token)).field('farm_id', farmId);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('accepts symptoms and returns 202 pending', async () => {
    const { token } = await registerUser();
    const farmId = await farmFor(token);
    const res = await api()
      .post('/api/v1/diagnoses')
      .set(bearer(token))
      .field('farm_id', farmId)
      .field('symptoms', 'Yellow streaks on maize leaves');
    expect(res.status).toBe(202);
    expect(res.body.data.status).toBe('pending');
    const got = await api().get(`/api/v1/diagnoses/${res.body.data.diagnosis_id}`).set(bearer(token));
    expect(got.status).toBe(200);
    expect(['pending', 'processing', 'completed', 'failed']).toContain(got.body.data.status);
  });

  test('rejects non-image uploads with INVALID_IMAGE', async () => {
    const { token } = await registerUser();
    const farmId = await farmFor(token);
    const res = await api()
      .post('/api/v1/diagnoses')
      .set(bearer(token))
      .field('farm_id', farmId)
      .attach('image', Buffer.from('not an image'), { filename: 'a.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_IMAGE');
  });

  test("hides other users' diagnoses", async () => {
    const owner = await registerUser();
    const other = await registerUser();
    const farmId = await farmFor(owner.token);
    const created = await api()
      .post('/api/v1/diagnoses')
      .set(bearer(owner.token))
      .field('farm_id', farmId)
      .field('symptoms', 'Holes in leaves');
    const res = await api().get(`/api/v1/diagnoses/${created.body.data.diagnosis_id}`).set(bearer(other.token));
    expect(res.status).toBe(403);
  });

  test('maps severity percentage to level', () => {
    expect(severityFromPct(10)).toBe('low');
    expect(severityFromPct(35)).toBe('moderate');
    expect(severityFromPct(80)).toBe('high');
  });
});
