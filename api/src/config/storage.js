import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { env } from './env.js';

export const uploadDir = path.resolve(env.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png' };
const MIME = { '.jpg': 'image/jpeg', '.png': 'image/png' };

/** Saves a multer memory file and returns its public URL path (/uploads/<uuid>.<ext>). */
export async function saveImage(file) {
  const name = `${randomUUID()}${EXT[file.mimetype] || '.jpg'}`;
  await fs.promises.writeFile(path.join(uploadDir, name), file.buffer);
  return `/uploads/${name}`;
}

/** Reads a saved image back for the AI services. */
export async function readImage(url) {
  const file = path.join(uploadDir, path.basename(url));
  const buffer = await fs.promises.readFile(file);
  return { buffer, mimetype: MIME[path.extname(file)] || 'image/jpeg' };
}
