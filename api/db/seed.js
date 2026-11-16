/* eslint-disable no-console */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, closeDb } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { hashPassword } from '../src/utils/hash.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'seeds');
for (const file of (await fs.readdir(dir)).filter((f) => f.endsWith('.sql')).sort()) {
  await pool.query(await fs.readFile(path.join(dir, file), 'utf8'));
  console.log(`seeded ${file}`);
}

if (env.nodeEnv !== 'production') {
  const demo = [
    ['Demo Admin', '+265999000001', 'admin', 'Lilongwe'],
    ['Demo Officer', '+265999000002', 'extension_officer', 'Lilongwe'],
    ['Demo Farmer', '+265999000003', 'farmer', 'Lilongwe'],
  ];
  const passwordHash = await hashPassword('Password123!');
  for (const [name, phone, role, district] of demo) {
    await pool.query(
      `INSERT INTO users (name, phone, password_hash, role, district)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (phone) DO NOTHING`,
      [name, phone, passwordHash, role, district],
    );
  }
  console.log('demo users ready (password: Password123!) - development only');
}
await closeDb();
